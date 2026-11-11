import {Router} from 'express';
import {z} from 'zod';
import Settings from '../models/Settings.js';
import {auth,admin} from '../middleware/auth.js';
import {parse} from '../utils/validate.js';
const r=Router();
r.get('/',async(_req,res)=>{const settings=await Settings.findById('global')||await Settings.create({_id:'global'});res.json({settings});});
r.put('/',auth,admin,async(req,res)=>{const data=parse(z.object({companyLicenseNumber:z.string().trim().max(120),annualInterestRate:z.number().min(0).max(50),bookingAmount:z.number().min(0).max(10000000),paymentInstructions:z.string().max(1000),paymentMethods:z.array(z.enum(['bKash','Nagad','Bank transfer'])).min(1),heroImages:z.array(z.string().refine(v=>v.startsWith('/api/uploads/')||v.startsWith('https://'),'Invalid image URL')).max(12),heroIntervalSeconds:z.number().int().min(3).max(20),merchantAccounts:z.array(z.object({method:z.enum(['bKash','Nagad','Bank transfer']),label:z.string().max(100),accountName:z.string().max(120),accountNumber:z.string().min(4).max(80),bankName:z.string().max(100),branch:z.string().max(100),routingNumber:z.string().max(40),instructions:z.string().max(400)})).max(15)}),req.body,res);if(!data)return;const settings=await Settings.findByIdAndUpdate('global',{$set:data},{new:true,upsert:true,runValidators:true});res.json({settings});});
export default r;
