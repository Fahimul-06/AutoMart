import {Router} from 'express';
import {z} from 'zod';
import Settings from '../models/Settings.js';
import {auth,admin} from '../middleware/auth.js';
import {parse} from '../utils/validate.js';
const r=Router();
r.get('/',async(_req,res)=>{const settings=await Settings.findById('global')||await Settings.create({_id:'global'});res.json({settings});});
r.put('/',auth,admin,async(req,res)=>{const data=parse(z.object({annualInterestRate:z.number().min(0).max(50),bookingAmount:z.number().min(0).max(10000000),paymentInstructions:z.string().max(1000),paymentMethods:z.array(z.enum(['bKash','Nagad','Bank transfer'])).min(1)}),req.body,res);if(!data)return;const settings=await Settings.findByIdAndUpdate('global',{$set:data},{new:true,upsert:true,runValidators:true});res.json({settings});});
export default r;
