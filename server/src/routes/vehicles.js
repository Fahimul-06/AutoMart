import {Router} from 'express';
import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import {auth,admin} from '../middleware/auth.js';
import {vehicleInput,parse} from '../utils/validate.js';
const r=Router();
r.get('/',async(req,res)=>{
const {search='',make='',condition='',bodyType='',sort='recent',featured=''}=req.query;
const page=Math.min(100,Math.max(1,Number.parseInt(req.query.page,10)||1));
const limit=Math.min(36,Math.max(1,Number.parseInt(req.query.limit,10)||12));
const q={};if(typeof search==='string'&&search.length<=80&&search.trim())q.$or=[{make:{$regex:escapeRegex(search),$options:'i'}},{model:{$regex:escapeRegex(search),$options:'i'}}];
if(typeof make==='string'&&make.length<80&&make)q.make=make;
if(['New','Used','Reconditioned'].includes(condition))q.condition=condition;
if(typeof bodyType==='string'&&bodyType.length<50&&bodyType)q.bodyType=bodyType;
if(featured==='true')q.featured=true;
const sorts={recent:{createdAt:-1,_id:-1},price_asc:{price:1,_id:-1},price_desc:{price:-1,_id:-1},year:{year:-1,_id:-1}};
const [vehicles,total]=await Promise.all([
Vehicle.find(q).select('make model variant year price mileage fuel transmission bodyType condition location images featured status').sort(sorts[sort]||sorts.recent).skip((page-1)*limit).limit(limit).lean(),
Vehicle.countDocuments(q)]);
res.set('Cache-Control','public, max-age=20, stale-while-revalidate=60');res.json({vehicles,total,page,pages:Math.ceil(total/limit),limit});
});
r.get('/admin/list',auth,admin,async(req,res)=>{const vehicles=await Vehicle.find().sort({createdAt:-1}).limit(500).lean();res.set('Cache-Control','no-store');res.json({vehicles})});
r.get('/:id',async(req,res)=>{if(!mongoose.isValidObjectId(req.params.id))return res.status(404).json({message:'Vehicle not found'});const vehicle=await Vehicle.findById(req.params.id).lean();if(!vehicle)return res.status(404).json({message:'Vehicle not found'});res.set('Cache-Control','public, max-age=20, stale-while-revalidate=60');res.json({vehicle})});
r.post('/',auth,admin,async(req,res)=>{const data=parse(vehicleInput,req.body,res);if(!data)return;res.status(201).json({vehicle:await Vehicle.create(data)})});
r.put('/:id',auth,admin,async(req,res)=>{const data=parse(vehicleInput,req.body,res);if(!data)return;if(!mongoose.isValidObjectId(req.params.id))return res.status(404).json({message:'Vehicle not found'});const vehicle=await Vehicle.findByIdAndUpdate(req.params.id,data,{new:true,runValidators:true});if(!vehicle)return res.status(404).json({message:'Vehicle not found'});res.json({vehicle})});
r.delete('/:id',auth,admin,async(req,res)=>{if(!mongoose.isValidObjectId(req.params.id))return res.status(404).json({message:'Vehicle not found'});const bookingCount=await (await import('../models/Booking.js')).default.countDocuments({vehicle:req.params.id});if(bookingCount)return res.status(409).json({message:'This vehicle has bookings. Mark it sold instead of deleting it.'});await Vehicle.findByIdAndDelete(req.params.id);res.json({ok:true})});
function escapeRegex(v){return String(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
export default r;
