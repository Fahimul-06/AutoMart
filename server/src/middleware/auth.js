import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export async function auth(req,res,next){try{const token=req.cookies?.session;if(!token)return res.status(401).json({message:'Please sign in'});const payload=jwt.verify(token,process.env.JWT_SECRET);const user=await User.findById(payload.sub).select('-passwordHash');if(!user)return res.status(401).json({message:'Session invalid'});req.user=user;next();}catch{return res.status(401).json({message:'Session expired or invalid'});}}
export function admin(req,res,next){if(req.user?.role!=='admin')return res.status(403).json({message:'Admin access required'});next();}
export function setSession(res,user){const token=jwt.sign({sub:String(user._id)},process.env.JWT_SECRET,{expiresIn:'7d'});res.cookie('session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:7*24*60*60*1000});}
