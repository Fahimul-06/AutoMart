import {Router} from 'express';
import mongoose from 'mongoose';
import {z} from 'zod';
import Offer from '../models/Offer.js';
import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';
import Settings from '../models/Settings.js';
import {auth,admin} from '../middleware/auth.js';
import {parse} from '../utils/validate.js';
import {calculateLoan} from '../utils/finance.js';
import {expireUnpaidSelections} from '../utils/offerLifecycle.js';
import {nextOfferPolicy,SELECTION_PAYMENT_MS} from '../utils/offerRules.js';

const r=Router();r.use(auth);
const validId=id=>mongoose.isValidObjectId(id);
const offerInput=z.object({vehicleId:z.string(),amount:z.number().finite().positive(),financeType:z.enum(['cash','loan']),downPaymentPercent:z.number().min(10).max(90).optional(),tenureYears:z.number().int().min(1).max(6).optional()});

// Customer only receives their own offers, never competitors' price amounts.
r.get('/mine',async(req,res)=>{await expireUnpaidSelections();const offers=await Offer.find({customer:req.user._id}).populate('vehicle','make model year status images').sort({createdAt:-1}).lean();res.set('Cache-Control','no-store');res.json({offers});});
r.get('/vehicle/:id/mine',async(req,res)=>{if(!validId(req.params.id))return res.status(400).json({message:'Invalid vehicle'});await expireUnpaidSelections(req.params.id);const offers=await Offer.find({vehicle:req.params.id,customer:req.user._id}).sort({attempt:1}).lean();res.set('Cache-Control','no-store');res.json({offers});});

r.post('/',async(req,res)=>{
  if(req.user.role!=='customer')return res.status(403).json({message:'Only customer accounts may submit offers'});
  const d=parse(offerInput,req.body,res);if(!d)return;
  if(!validId(d.vehicleId))return res.status(400).json({message:'Invalid vehicle'});
  await expireUnpaidSelections(d.vehicleId);
  const v=await Vehicle.findById(d.vehicleId).lean();
  if(!v||v.status!=='available'||v.selectedOffer)return res.status(409).json({message:'Vehicle is reserved or sold; offers are closed'});
  // An offer cannot exceed the listed asking price. Staff can edit the asking price separately.
  if(d.amount>v.price)return res.status(400).json({message:'Your offer cannot exceed the advertised price'});
  const previous=await Offer.find({vehicle:v._id,customer:req.user._id}).sort({attempt:-1}).limit(1).lean();
  const policy=nextOfferPolicy(previous[0]);
  if(!policy.allowed&&policy.reason==='limit')return res.status(409).json({message:'You have used all three offers for this vehicle'});
  if(!policy.allowed)return res.status(429).json({message:`You can submit your next offer after ${policy.nextAt.toISOString()}`,nextOfferAt:policy.nextAt});
  const attempt=policy.attempt;
  if(d.financeType==='loan'&&(d.downPaymentPercent===undefined||d.tenureYears===undefined))return res.status(400).json({message:'Choose your loan down payment and tenure'});
  try{
    const offer=await Offer.create({vehicle:v._id,customer:req.user._id,amount:d.amount,attempt,financeType:d.financeType,downPaymentPercent:d.downPaymentPercent??30,tenureYears:d.tenureYears??3});
    res.status(201).json({offer});
  }catch(e){if(e.code===11000)return res.status(409).json({message:'Duplicate offer attempt; refresh your page'});throw e;}
});

r.get('/admin',admin,async(_req,res)=>{
  await expireUnpaidSelections();
  const offers=await Offer.find().populate('customer','name email phone').populate('vehicle','make model year status price images selectedOffer offerExpiresAt').sort({createdAt:-1}).limit(1000).lean();
  res.set('Cache-Control','no-store');res.json({offers});
});

r.post('/admin/:id/select',admin,async(req,res)=>{
  if(!validId(req.params.id))return res.status(404).json({message:'Offer not found'});
  const offer=await Offer.findById(req.params.id).lean();
  if(!offer||offer.status!=='pending')return res.status(409).json({message:'This offer cannot be selected'});
  await expireUnpaidSelections(offer.vehicle);
  const deadline=new Date(Date.now()+SELECTION_PAYMENT_MS);
  // Atomic claim: only one administrator can select a customer for a vehicle.
  const vehicle=await Vehicle.findOneAndUpdate({_id:offer.vehicle,status:'available',selectedOffer:null},{$set:{status:'reserved',selectedOffer:offer._id,offerExpiresAt:deadline}},{new:true});
  if(!vehicle)return res.status(409).json({message:'Vehicle already selected, reserved or sold'});
  try{
    const settings=await Settings.findById('global')||await Settings.create({_id:'global'});
    const loan=offer.financeType==='loan'?calculateLoan(offer.amount,offer.downPaymentPercent,offer.tenureYears,settings.annualInterestRate):{downPaymentAmount:offer.amount,principal:0,monthlyInstallment:0,totalInterest:0,totalRepayment:0,annualInterestRate:settings.annualInterestRate,downPaymentPercent:100,tenureYears:0};
    const booking=await Booking.create({offer:offer._id,customer:offer.customer,vehicle:vehicle._id,vehicleSnapshot:{make:vehicle.make,model:vehicle.model,year:vehicle.year,price:offer.amount,image:vehicle.images?.[0]||''},offeredPrice:offer.amount,paymentDeadline:deadline,financeType:offer.financeType,...loan,bookingAmount:settings.bookingAmount,status:'pending'});
    await Offer.updateOne({_id:offer._id,status:'pending'},{$set:{status:'selected',selectedAt:new Date(),paymentDeadline:deadline,booking:booking._id}});
    await Vehicle.updateOne({_id:vehicle._id,selectedOffer:offer._id},{$set:{selectedBooking:booking._id}});
    res.json({offerId:offer._id,bookingId:booking._id,paymentDeadline:deadline});
  }catch(err){
    await Vehicle.updateOne({_id:vehicle._id,selectedOffer:offer._id,selectedBooking:null},{$set:{status:'available',selectedOffer:null,offerExpiresAt:null}});
    throw err;
  }
});
export default r;
