import {Router} from 'express';
import mongoose from 'mongoose';
import {z} from 'zod';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import Settings from '../models/Settings.js';
import {auth,admin} from '../middleware/auth.js';
import {parse} from '../utils/validate.js';
import {expireUnpaidSelections} from '../utils/offerLifecycle.js';
import Offer from '../models/Offer.js';
import User from '../models/User.js';
import {buildReceiptSnapshot} from '../utils/receiptData.js';
import {streamBookingReceipt} from '../utils/bookingReceipt.js';
const r=Router();r.use(auth);
r.post('/',(_req,res)=>res.status(409).json({message:'Please submit a private vehicle offer. Booking opens only after management selects your offer.'}));
r.get('/mine',async(req,res)=>{await expireUnpaidSelections();const bookings=await Booking.find({customer:req.user._id}).sort({createdAt:-1}).lean();res.json({bookings});});
r.get('/notifications',admin,async(_req,res)=>{await expireUnpaidSelections();const [newReservations,pendingPayments,pendingOffers,latest]=await Promise.all([Booking.countDocuments({status:'pending'}),Booking.countDocuments({paymentStatus:'pending_verification'}),Offer.countDocuments({status:'pending'}),Booking.find().sort({createdAt:-1}).limit(5).select('vehicleSnapshot createdAt status').lean()]);res.set('Cache-Control','no-store');res.json({newReservations,pendingPayments,pendingOffers,latest});});
r.get('/',admin,async(_req,res)=>{await expireUnpaidSelections();const bookings=await Booking.find().populate('customer','name email phone').sort({createdAt:-1}).limit(500).lean();res.json({bookings});});
r.get('/:id/receipt',async(req,res)=>{
 if(!mongoose.isValidObjectId(req.params.id))return res.status(404).json({message:'Booking not found'});
 const filter=req.user.role==='admin'?{_id:req.params.id}:{_id:req.params.id,customer:req.user._id};
 const booking=await Booking.findOne(filter).select('+receiptSnapshot').lean();
 if(!booking)return res.status(404).json({message:'Booking not found'});
 if(booking.paymentStatus!=='paid'||!booking.receiptSnapshot||!booking.receiptIssuedAt)return res.status(403).json({message:'Receipt is only available after payment verification'});
 streamBookingReceipt(res,booking.receiptSnapshot,req.query.download==='1');
});
r.post('/:id/payment',async(req,res)=>{const d=parse(z.object({paymentMethod:z.enum(['bKash','Nagad','Bank transfer']),transactionId:z.string().trim().min(4).max(120),merchantAccountId:z.string().optional()}),req.body,res);if(!d)return;if(!mongoose.isValidObjectId(req.params.id))return res.status(404).json({message:'Not found'});const booking=await Booking.findOne({_id:req.params.id,customer:req.user._id});if(!booking)return res.status(404).json({message:'Booking not found'});if(booking.paymentStatus==='paid')return res.status(409).json({message:'Already paid'});if(!booking.offer)return res.status(409).json({message:'This booking does not belong to a selected offer'});if(booking.paymentStatus==='pending_verification')return res.status(409).json({message:'Payment reference is already awaiting verification'});if(!booking.paymentDeadline||Date.now()>new Date(booking.paymentDeadline).getTime())return res.status(409).json({message:'The three-hour booking payment deadline has expired'});const selectedVehicle=await Vehicle.findOne({_id:booking.vehicle,status:'reserved',selectedOffer:booking.offer});if(!selectedVehicle)return res.status(409).json({message:'This offer is no longer selected'});if(booking.status==='cancelled')return res.status(409).json({message:'Booking cancelled'});const customer=await User.findById(req.user._id).select('phone address');if(!customer?.address?.trim()||!customer?.phone?.trim())return res.status(400).json({message:'Please add your phone and full address in your profile before submitting payment'});const settings=await Settings.findById('global');const account=(settings?.merchantAccounts||[]).find(a=>String(a._id)===d.merchantAccountId&&a.method===d.paymentMethod);if(!account)return res.status(400).json({message:'Select a valid merchant payment account'});const claimed=await Vehicle.findOneAndUpdate({_id:booking.vehicle,status:'reserved',selectedOffer:booking.offer,offerExpiresAt:{$gt:new Date()}},{$set:{offerExpiresAt:null}});if(!claimed)return res.status(409).json({message:'Payment deadline expired or vehicle selection changed'});booking.merchantAccountSnapshot={method:account.method,label:account.label,accountNumber:account.accountNumber,bankName:account.bankName};booking.paymentMethod=d.paymentMethod;booking.transactionId=d.transactionId;booking.paymentSubmittedAt=new Date();booking.paymentStatus='pending_verification';await booking.save();res.json({booking});});
r.patch('/:id',admin,async(req,res)=>{
  const d=parse(z.object({status:z.enum(['pending','confirmed','cancelled']).optional(),paymentStatus:z.enum(['unpaid','pending_verification','paid','rejected']).optional()}).refine(o=>Object.keys(o).length>0),req.body,res);if(!d)return;
  if(!mongoose.isValidObjectId(req.params.id))return res.status(404).json({message:'Booking not found'});
  const booking=await Booking.findById(req.params.id);if(!booking)return res.status(404).json({message:'Booking not found'});
  if(booking.offer){
    if(d.paymentStatus==='paid'){
      if(booking.paymentStatus!=='pending_verification')return res.status(409).json({message:'A customer-submitted payment reference must be verified before marking paid'});
      const vehicleDetails=await Vehicle.findOne({_id:booking.vehicle,status:'reserved',selectedOffer:booking.offer}).select('+chassisNumber +engineNumber');
      if(!vehicleDetails)return res.status(409).json({message:'Vehicle is not reserved for this offer'});
      const [customer,settings]=await Promise.all([User.findById(booking.customer),Settings.findById('global')]);
      const verifiedAt=new Date();let receiptSnapshot;
      try{receiptSnapshot=buildReceiptSnapshot({booking,vehicle:vehicleDetails,customer,settings,verifiedAt});}
      catch(e){return res.status(422).json({message:e.message});}
      const vehicle=await Vehicle.findOneAndUpdate({_id:booking.vehicle,status:'reserved',selectedOffer:booking.offer},{$set:{status:'sold',offerExpiresAt:null}},{new:true});
      if(!vehicle)return res.status(409).json({message:'Vehicle is not reserved for this offer'});
      booking.receiptSnapshot=receiptSnapshot;booking.receiptIssuedAt=verifiedAt;
      booking.paymentStatus='paid';booking.status='confirmed';
      await Offer.updateMany({vehicle:booking.vehicle,_id:{$ne:booking.offer},status:'pending'},{$set:{status:'declined'}});
    }else if(d.paymentStatus==='rejected'||d.status==='cancelled'){
      if(booking.paymentStatus==='paid')return res.status(409).json({message:'Cannot cancel a paid vehicle sale through booking status'});
      await Vehicle.updateOne({_id:booking.vehicle,status:'reserved',selectedOffer:booking.offer},{$set:{status:'available',selectedOffer:null,selectedBooking:null,offerExpiresAt:null}});
      await Offer.updateOne({_id:booking.offer,status:'selected'},{$set:{status:'declined'}});
      booking.paymentStatus=d.paymentStatus==='rejected'?'rejected':booking.paymentStatus;
      booking.status='cancelled';
    }else{
      return res.status(400).json({message:'For selected offers, management may only verify payment as paid or reject/cancel it'});
    }
  }else Object.assign(booking,d);
  await booking.save();res.json({booking});
});
export default r;
