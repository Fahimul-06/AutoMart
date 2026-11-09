import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {existsSync} from 'node:fs';
import authRoutes from './routes/auth.js';
import vehicleRoutes from './routes/vehicles.js';
import bookingRoutes from './routes/bookings.js';
import settingsRoutes from './routes/settings.js';
if(!process.env.MONGODB_URI||!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32){console.error('MONGODB_URI and JWT_SECRET (>=32 characters) are required');process.exit(1)}
const deploymentOrigin=process.env.RENDER_EXTERNAL_URL||process.env.PUBLIC_ORIGIN||'';
if(process.env.NODE_ENV==='production'&&!process.env.CLIENT_ORIGIN&&!deploymentOrigin){console.error('Set PUBLIC_ORIGIN or CLIENT_ORIGIN in production');process.exit(1)}
const origins=[process.env.CLIENT_ORIGIN||'',deploymentOrigin,process.env.PUBLIC_ORIGIN||'',...(process.env.NODE_ENV==='production'?[]:['http://localhost:5173'])].flatMap(x=>x.split(',')).map(x=>x.trim().replace(/\/$/,'')).filter(Boolean);
const app=express();app.disable('x-powered-by');app.set('trust proxy',1);
app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'}}));
app.use(express.json({limit:'150kb'}));app.use(cookieParser());
app.use(cors({origin(origin,cb){if(!origin||origins.includes(origin))return cb(null,true);return cb(new Error('Origin not permitted'))},credentials:true}));
app.use('/api',(req,res,next)=>{if(['POST','PUT','PATCH','DELETE'].includes(req.method)&&process.env.NODE_ENV==='production'){
const origin=req.get('origin');if(!origin||!origins.includes(origin))return res.status(403).json({message:'Invalid request origin'});
}if(req.path.startsWith('/auth')||req.path.startsWith('/bookings'))res.set('Cache-Control','no-store');next()});
app.use('/api',rateLimit({windowMs:15*60*1000,limit:300,standardHeaders:'draft-7',legacyHeaders:false}));
app.use('/api/auth',rateLimit({windowMs:15*60*1000,limit:20,standardHeaders:'draft-7',legacyHeaders:false}));
app.use('/api/bookings',rateLimit({windowMs:15*60*1000,limit:80,standardHeaders:'draft-7',legacyHeaders:false}));
app.get('/api/health',(_req,res)=>{const ready=mongoose.connection.readyState===1;res.status(ready?200:503).json({status:ready?'ready':'unavailable'})});
app.use('/api/auth',authRoutes);app.use('/api/vehicles',vehicleRoutes);app.use('/api/bookings',bookingRoutes);app.use('/api/settings',settingsRoutes);
// One-domain production deployment: serve Vite's prebuilt static files from Express.
// Hashed assets can be cached for a year; HTML must revalidate on each visit.
const clientDist=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../client/dist');
if(process.env.NODE_ENV==='production'){
  if(!existsSync(path.join(clientDist,'index.html')))throw Error('Missing client/dist. Run the root build command first.');
  app.use(express.static(clientDist,{index:false,maxAge:'1y',immutable:true,setHeaders(res,file){if(file.endsWith('.html'))res.setHeader('Cache-Control','no-cache')}}));
  app.get(/^\/(?!api(?:\/|$)).*/,(_req,res)=>res.set('Cache-Control','no-cache').sendFile(path.join(clientDist,'index.html')));
}
app.use((_req,res)=>res.status(404).json({message:'Route not found'}));
app.use((err,req,res,next)=>{if(res.headersSent)return next(err);console.error(err);res.status(err.message==='Origin not permitted'?403:500).json({message:'Request could not be completed'})});
await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:12000,maxPoolSize:15,minPoolSize:1});
const server=app.listen(Number(process.env.PORT)||5000,'0.0.0.0',()=>console.log('Dream Vehicle Enterprise API ready'));
async function shutdown(){server.close(async()=>{await mongoose.disconnect();process.exit(0)});setTimeout(()=>process.exit(1),10000).unref()}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
