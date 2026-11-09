import 'dotenv/config';
import mongoose from 'mongoose';
import {seedDemoVehicles} from './mockVehicles.js';
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI required');
try {
  await mongoose.connect(process.env.MONGODB_URI, {serverSelectionTimeoutMS:12000});
  const result = await seedDemoVehicles();
  console.log(`Demo inventory populated: ${result.inserted} inserted; ${result.totalDemoTemplates} templates available.`);
} finally {
  await mongoose.disconnect();
}
