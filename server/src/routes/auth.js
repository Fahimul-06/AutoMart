import {Router} from 'express';
import bcrypt from 'bcryptjs';
import {z} from 'zod';
import User from '../models/User.js';
import {auth,setSession} from '../middleware/auth.js';
import {parse,userInput} from '../utils/validate.js';
const r=Router();
const publicUser=u=>({id:u._id,name:u.name,email:u.email,phone:u.phone,role:u.role});
r.post('/register',async(req,res)=>{const data=parse(userInput,req.body,res);if(!data)return;try{if(await User.exists({email:data.email}))return res.status(409).json({message:'Email already registered'});const user=await User.create({name:data.name,email:data.email,phone:data.phone||'',passwordHash:await bcrypt.hash(data.password,12),role:'customer'});setSession(res,user);res.status(201).json({user:publicUser(user)});}catch(e){if(e.code===11000)return res.status(409).json({message:'Email already registered'});throw e;}});
r.post('/login',async(req,res)=>{const data=parse(z.object({email:z.string().email(),password:z.string().min(1)}),req.body,res);if(!data)return;const user=await User.findOne({email:data.email.toLowerCase()}).select('+passwordHash');if(!user||!(await bcrypt.compare(data.password,user.passwordHash)))return res.status(401).json({message:'Invalid email or password'});setSession(res,user);res.json({user:publicUser(user)});});
r.post('/logout',(_req,res)=>{res.clearCookie('session',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/'});res.json({ok:true});});
r.get('/me',auth,(req,res)=>res.json({user:publicUser(req.user)}));
r.patch('/me',auth,async(req,res)=>{
 const data=parse(z.object({name:z.string().trim().min(2).max(100),phone:z.string().trim().max(30)}).strict(),req.body,res);
 if(!data)return;
 const user=await User.findByIdAndUpdate(req.user._id,{$set:data},{new:true,runValidators:true});
 res.set('Cache-Control','no-store');res.json({user:publicUser(user)});
});
export default r;
