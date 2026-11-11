import {Router} from 'express';
import bcrypt from 'bcryptjs';
import {randomBytes,createHash} from 'node:crypto';
import nodemailer from 'nodemailer';
import {z} from 'zod';
import User from '../models/User.js';
import {auth,setSession} from '../middleware/auth.js';
import {parse,userInput} from '../utils/validate.js';
const r=Router();
const publicUser=u=>({id:u._id,name:u.name,email:u.email,phone:u.phone,address:u.address||'',role:u.role});
r.post('/register',async(req,res)=>{const data=parse(userInput,req.body,res);if(!data)return;try{if(await User.exists({email:data.email}))return res.status(409).json({message:'Email already registered'});const user=await User.create({name:data.name,email:data.email,phone:data.phone||'',passwordHash:await bcrypt.hash(data.password,12),role:'customer'});setSession(res,user);res.status(201).json({user:publicUser(user)});}catch(e){if(e.code===11000)return res.status(409).json({message:'Email already registered'});throw e;}});
r.post('/login',async(req,res)=>{const data=parse(z.object({email:z.string().email(),password:z.string().min(1)}),req.body,res);if(!data)return;const user=await User.findOne({email:data.email.toLowerCase()}).select('+passwordHash');if(!user||!(await bcrypt.compare(data.password,user.passwordHash)))return res.status(401).json({message:'Invalid email or password'});setSession(res,user);res.json({user:publicUser(user)});});
r.post('/logout',(_req,res)=>{res.clearCookie('session',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/'});res.json({ok:true});});
r.get('/me',auth,(req,res)=>res.json({user:publicUser(req.user)}));
r.patch('/me',auth,async(req,res)=>{
 const data=parse(z.object({name:z.string().trim().min(2).max(100),phone:z.string().trim().max(30),address:z.string().trim().max(500)}).strict(),req.body,res);
 if(!data)return;
 const user=await User.findByIdAndUpdate(req.user._id,{$set:data},{new:true,runValidators:true});
 res.set('Cache-Control','no-store');res.json({user:publicUser(user)});
});
r.post('/change-password',auth,async(req,res)=>{const d=parse(z.object({currentPassword:z.string().min(1),newPassword:z.string().min(10).max(128)}),req.body,res);if(!d)return;const user=await User.findById(req.user._id).select('+passwordHash');if(!await bcrypt.compare(d.currentPassword,user.passwordHash))return res.status(400).json({message:'Current password is incorrect'});await User.updateOne({_id:user._id},{$set:{passwordHash:await bcrypt.hash(d.newPassword,12)},$unset:{passwordResetHash:'',passwordResetExpires:''}});res.clearCookie('session',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/'});res.json({message:'Password changed. Please sign in again.'});});
// A uniform response prevents user enumeration. No reset token is ever returned by API.
r.post('/forgot-password',async(req,res)=>{const d=parse(z.object({email:z.string().email()}),req.body,res);if(!d)return;const generic={message:'If an account exists, a password-reset email will be sent.'};const user=await User.findOne({email:d.email.toLowerCase()});if(!user)return res.json(generic);
if(!process.env.SMTP_HOST||!process.env.SMTP_USER||!process.env.SMTP_PASS||!process.env.SMTP_FROM||!process.env.PUBLIC_ORIGIN){console.error('Password email SMTP not configured');return res.json(generic);}
const token=randomBytes(32).toString('hex');const digest=createHash('sha256').update(token).digest('hex');await User.updateOne({_id:user._id},{$set:{passwordResetHash:digest,passwordResetExpires:new Date(Date.now()+15*60*1000)}});
const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_SECURE==='true',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
const url=new URL('/reset-password',process.env.PUBLIC_ORIGIN);url.searchParams.set('token',token);
try{await transport.sendMail({from:process.env.SMTP_FROM,to:user.email,subject:'Dream Car Enterprise password reset',text:`A password reset was requested for your account. Open this link within 15 minutes:\n${url.toString()}\nIf you did not request this, ignore this email.`});}catch(e){console.error('Password reset email delivery failed:',e.message);await User.updateOne({_id:user._id},{$unset:{passwordResetHash:'',passwordResetExpires:''}});}res.json(generic);
});
r.post('/reset-password',async(req,res)=>{const d=parse(z.object({token:z.string().regex(/^[a-f0-9]{64}$/),newPassword:z.string().min(10).max(128)}),req.body,res);if(!d)return;const digest=createHash('sha256').update(d.token).digest('hex');const user=await User.findOne({passwordResetHash:digest,passwordResetExpires:{$gt:new Date()}}).select('+passwordHash +passwordResetHash +passwordResetExpires');if(!user)return res.status(400).json({message:'Reset link invalid or expired'});await User.updateOne({_id:user._id},{$set:{passwordHash:await bcrypt.hash(d.newPassword,12)},$unset:{passwordResetHash:'',passwordResetExpires:''}});res.json({message:'Password reset successful. Please sign in.'});});
export default r;
