import {Router} from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import sharp from 'sharp';
import {auth,admin} from '../middleware/auth.js';
import {Readable} from 'node:stream';

const router=Router();
const upload=multer({storage:multer.memoryStorage(),limits:{files:8,fileSize:7*1024*1024},fileFilter:(_req,file,cb)=>cb(null,['image/jpeg','image/png','image/webp','image/avif'].includes(file.mimetype))});
function bucket(){return new mongoose.mongo.GridFSBucket(mongoose.connection.db,{bucketName:'vehiclePhotos'})}
router.post('/',auth,admin,(req,res,next)=>{
 upload.array('photos',8)(req,res,async(error)=>{
  if(error)return res.status(400).json({message:error.message});
  if(!req.files?.length)return res.status(400).json({message:'Select JPEG, PNG, WebP or AVIF images (up to 8 files, 7 MB each).'});
  try{
   const urls=[];
   for(const file of req.files){
    // Sharp decodes input, normalizes orientation and strips image metadata.
    const data=await sharp(file.buffer,{limitInputPixels:25_000_000}).rotate().resize({width:1600,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:78,effort:4}).toBuffer();
    const stream=bucket().openUploadStream('vehicle-'+Date.now()+'.webp',{contentType:'image/webp',metadata:{uploadedBy:String(req.user._id)}});
    await new Promise((resolve,reject)=>{Readable.from(data).pipe(stream).on('finish',resolve).on('error',reject)});
    urls.push('/api/uploads/'+stream.id.toString());
   }
   res.status(201).json({urls});
  }catch(err){next(err)}
 });
});
router.get('/:id',async(req,res,next)=>{
 if(!mongoose.isValidObjectId(req.params.id))return res.status(404).end();
 try{
  const id=new mongoose.Types.ObjectId(req.params.id);
  const files=await bucket().find({_id:id}).limit(1).toArray();
  if(!files.length)return res.status(404).end();
  res.set({'Content-Type':'image/webp','Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'});
  bucket().openDownloadStream(id).on('error',next).pipe(res);
 }catch(err){next(err)}
});
export default router;
