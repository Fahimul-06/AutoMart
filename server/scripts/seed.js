import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Vehicle from '../src/models/Vehicle.js';
import Settings from '../src/models/Settings.js';
if(!process.env.MONGODB_URI||!process.env.ADMIN_EMAIL||!process.env.ADMIN_PASSWORD)throw Error('Configure MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD in server/.env');
if(process.env.ADMIN_PASSWORD.length<12)throw Error('ADMIN_PASSWORD must be at least 12 characters');
await mongoose.connect(process.env.MONGODB_URI);
const adminEmail=process.env.ADMIN_EMAIL.toLowerCase();
const previous=await User.findOne({email:adminEmail});
if(previous&&previous.role!=='admin')throw Error('Admin seed email is already registered to a non-admin user');
if(!previous){await User.create({name:'Management',email:adminEmail,passwordHash:await bcrypt.hash(process.env.ADMIN_PASSWORD,12),role:'admin'});console.log('Admin created:',adminEmail);}else console.log('Admin exists (password unchanged):',adminEmail);
await Settings.updateOne({_id:'global'},{$setOnInsert:{annualInterestRate:Number(process.env.DEFAULT_INTEREST_RATE||10),bookingAmount:Number(process.env.DEFAULT_BOOKING_AMOUNT||10000)}},{upsert:true});
// Public Unsplash demo photography; replace with licensed vehicle-specific photographs before production.
const photos={
  corolla:['photo-1621007947382-bb3c3994e3fb','photo-1552519507-da3b142c6e3d','photo-1549317661-bd32c8ce0db2','photo-1507136566006-cfc505b114fc'],
  civic:['photo-1533473359331-0135ef1b58bf','photo-1555215695-3004980ad54e','photo-1525609004556-c46c7d6cf023','photo-1503376780353-7e6692767b70'],
  suv:['photo-1519641471654-76ce0107ad1b','photo-1517524008697-84bbe3c3fd98','photo-1544636331-e26879cd4d9b','photo-1503736334956-4c8f8e92946d'],
  sedan:['photo-1555215695-3004980ad54e','photo-1503376780353-7e6692767b70','photo-1533473359331-0135ef1b58bf','photo-1494976388531-d1058494cdd8'],
  premium:['photo-1618843479313-40f8afb4b4d8','photo-1507136566006-cfc505b114fc','photo-1600705722908-80f8b1f4340d','photo-1549317661-bd32c8ce0db2'],
  sport:['photo-1503376780353-7e6692767b70','photo-1494976388531-d1058494cdd8','photo-1552519507-da3b142c6e3d','photo-1503736334956-4c8f8e92946d']
};
const specs=[
['Toyota','Corolla Cross','Hybrid G',2023,4250000,18000,'Hybrid','Automatic','SUV','Reconditioned','Pearl White','1798 cc','suv'],
['Honda','Civic','Turbo RS',2022,3650000,22500,'Petrol','CVT','Sedan','Used','Sonic Gray','1498 cc','civic'],
['Toyota','Premio','F EX',2020,2950000,32000,'Petrol','Automatic','Sedan','Reconditioned','Silver','1496 cc','corolla'],
['Mitsubishi','Outlander','PHEV',2021,4750000,28000,'Plug-in Hybrid','Automatic','SUV','Reconditioned','Black','2360 cc','suv'],
['Toyota','Axio','Hybrid',2021,2250000,41000,'Hybrid','Automatic','Sedan','Reconditioned','White','1496 cc','sedan'],
['Nissan','X-Trail','20Xi',2022,3850000,19500,'Petrol','CVT','SUV','Reconditioned','Blue','1997 cc','suv'],
['Honda','Vezel','e:HEV Z',2023,4050000,12500,'Hybrid','Automatic','SUV','Reconditioned','White','1496 cc','suv'],
['Toyota','Harrier','Premium',2021,6150000,22000,'Hybrid','Automatic','SUV','Reconditioned','Black','2487 cc','premium'],
['BMW','3 Series','320i',2020,7650000,29000,'Petrol','Automatic','Sedan','Used','Black','1998 cc','premium'],
['Mercedes-Benz','C-Class','C200',2021,8850000,25000,'Petrol','Automatic','Sedan','Used','Gray','1497 cc','premium'],
['Toyota','Noah','Si WXB',2022,4250000,37000,'Hybrid','Automatic','MPV','Reconditioned','White','1797 cc','corolla'],
['Suzuki','Swift','GLX',2024,1850000,5000,'Petrol','Automatic','Hatchback','New','Red','1197 cc','sport']
];
let count=0;
for(let i=0;i<specs.length;i++){const [make,model,variant,year,price,mileage,fuel,transmission,bodyType,condition,color,engine,pic]=specs[i];const images=photos[pic].map(id=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1100&q=75`);const doc={make,model,variant,year,price,mileage,fuel,transmission,bodyType,condition,color,engine,location:'Dhaka, Bangladesh',description:`Explore this ${year} ${make} ${model} ${variant}. A carefully presented demo listing with finance estimates and booking available. Contact our team to verify availability and specifications.`,features:['Air conditioning','ABS brakes','Reverse camera','Bluetooth audio','Power steering','Airbags'],images,featured:i<6,status:'available'};const result=await Vehicle.updateOne({make,model,variant,year},{$setOnInsert:doc},{upsert:true});if(result.upsertedCount)count++;}
console.log(`Seed complete: ${count} new mock vehicles. Existing records preserved.`);
await mongoose.disconnect();
