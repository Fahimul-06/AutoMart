import Vehicle from '../src/models/Vehicle.js';

// DEMONSTRATION INVENTORY ONLY. Photos are illustrative external car photography,
// not verified images of the specific make/model/trim or vehicles for sale.
const photoIds = [
  'photo-1494976388531-d1058494cdd8', 'photo-1503376780353-7e6692767b70',
  'photo-1507136566006-cfc505b114fc', 'photo-1519641471654-76ce0107ad1b',
  'photo-1525609004556-c46c7d6cf023', 'photo-1533473359331-0135ef1b58bf',
  'photo-1544636331-e26879cd4d9b', 'photo-1549317661-bd32c8ce0db2',
  'photo-1552519507-da3b142c6e3d', 'photo-1555215695-3004980ad54e',
  'photo-1600705722908-80f8b1f4340d', 'photo-1618843479313-40f8afb4b4d8',
  'photo-1621007947382-bb3c3994e3fb', 'photo-1503736334956-4c8f8e92946d',
  'photo-1517524008697-84bbe3c3fd98'
];

// make, model, variant, year, BDT price, odometer km, fuel, transmission, body style,
// condition, exterior colour, displacement, featured, general location
export const demoSpecs = [
  ['Toyota','Corolla Cross','Hybrid G',2023,4250000,18000,'Hybrid','Automatic','SUV','Reconditioned','Pearl White','1798 cc',true,'Dhaka'],
  ['Honda','Civic','Turbo RS',2022,3650000,22500,'Petrol','CVT','Sedan','Used','Sonic Gray','1498 cc',true,'Dhaka'],
  ['Toyota','Premio','F EX',2020,2950000,32000,'Petrol','Automatic','Sedan','Reconditioned','Silver','1496 cc',true,'Dhaka'],
  ['Mitsubishi','Outlander','PHEV',2021,4750000,28000,'Plug-in Hybrid','Automatic','SUV','Reconditioned','Black','2360 cc',true,'Dhaka'],
  ['Toyota','Axio','Hybrid',2021,2250000,41000,'Hybrid','Automatic','Sedan','Reconditioned','White','1496 cc',true,'Dhaka'],
  ['Nissan','X-Trail','20Xi',2022,3850000,19500,'Petrol','CVT','SUV','Reconditioned','Blue','1997 cc',true,'Dhaka'],
  ['Honda','Vezel','e:HEV Z',2023,4050000,12500,'Hybrid','Automatic','SUV','Reconditioned','White','1496 cc',true,'Dhaka'],
  ['Toyota','Harrier','Premium',2021,6150000,22000,'Hybrid','Automatic','SUV','Reconditioned','Black','2487 cc',true,'Dhaka'],
  ['BMW','3 Series','320i',2020,7650000,29000,'Petrol','Automatic','Sedan','Used','Black','1998 cc',false,'Dhaka'],
  ['Mercedes-Benz','C-Class','C200',2021,8850000,25000,'Petrol','Automatic','Sedan','Used','Gray','1497 cc',false,'Dhaka'],
  ['Toyota','Noah','Si WXB',2022,4250000,37000,'Hybrid','Automatic','MPV','Reconditioned','White','1797 cc',false,'Dhaka'],
  ['Suzuki','Swift','GLX',2024,1850000,5000,'Petrol','Automatic','Hatchback','New','Red','1197 cc',false,'Dhaka'],
  ['Toyota','Aqua','S Hybrid',2021,1950000,36000,'Hybrid','Automatic','Hatchback','Reconditioned','Sky Blue','1496 cc',false,'Dhaka'],
  ['Toyota','Allion','A15 G Package',2020,2850000,44500,'Petrol','Automatic','Sedan','Reconditioned','White','1496 cc',false,'Chattogram'],
  ['Honda','Grace','Hybrid EX',2021,2450000,29500,'Hybrid','CVT','Sedan','Reconditioned','Silver','1496 cc',false,'Dhaka'],
  ['Honda','Fit','Hybrid L',2022,2350000,21000,'Hybrid','Automatic','Hatchback','Reconditioned','Blue','1496 cc',false,'Dhaka'],
  ['Nissan','Note','e-Power X',2022,2250000,31000,'Hybrid','Automatic','Hatchback','Reconditioned','White','1198 cc',false,'Sylhet'],
  ['Toyota','RAV4','Adventure',2022,5750000,24000,'Petrol','Automatic','SUV','Reconditioned','Gray','2487 cc',true,'Dhaka'],
  ['Hyundai','Tucson','Premium',2023,5350000,16000,'Petrol','Automatic','SUV','Used','Black','1999 cc',false,'Dhaka'],
  ['Kia','Sportage','EX',2023,4950000,19000,'Petrol','Automatic','SUV','Used','White','1999 cc',false,'Chattogram'],
  ['Mazda','CX-5','Touring',2021,4250000,38000,'Petrol','Automatic','SUV','Reconditioned','Red','1997 cc',false,'Dhaka'],
  ['Toyota','Hiace','GL',2022,5950000,42000,'Diesel','Manual','Van','Used','Silver','2982 cc',false,'Dhaka'],
  ['Mitsubishi','Pajero Sport','GLS',2020,6950000,49000,'Diesel','Automatic','SUV','Used','Black','2442 cc',false,'Rajshahi'],
  ['Suzuki','Wagon R','VXL',2024,1450000,8000,'Petrol','Manual','Hatchback','New','Gray','998 cc',false,'Dhaka'],
  ['Toyota','Sienta','Hybrid G',2022,3250000,29000,'Hybrid','Automatic','MPV','Reconditioned','Pearl White','1496 cc',false,'Dhaka'],
  ['Honda','CR-V','EX-L',2021,5550000,33000,'Petrol','CVT','SUV','Used','Dark Blue','1498 cc',false,'Dhaka'],
  ['Nissan','Serena','Highway Star',2021,3650000,46500,'Hybrid','Automatic','MPV','Reconditioned','Silver','1997 cc',false,'Khulna'],
  ['Toyota','Land Cruiser Prado','TX-L',2020,14250000,54000,'Diesel','Automatic','SUV','Used','Black','2755 cc',false,'Dhaka'],
  ['MG','ZS','Excite',2024,3350000,11000,'Petrol','Automatic','SUV','Used','Red','1498 cc',false,'Dhaka'],
  ['Hyundai','Elantra','GLS',2022,3150000,27000,'Petrol','Automatic','Sedan','Used','Silver','1999 cc',false,'Dhaka']
];

export function demoVehicleData(row, index) {
  const [make,model,variant,year,price,mileage,fuel,transmission,bodyType,condition,color,engine,featured,city] = row;
  // Rotate image order to avoid identical gallery covers on adjacent cards.
  const images = Array.from({length:5}, (_, offset) => {
    const imageId = photoIds[(index * 3 + offset * 2) % photoIds.length];
    return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=1200&q=78`;
  });
  return {
    make,model,variant,year,price,mileage,fuel,transmission,bodyType,condition,color,engine,
    location:`${city}, Bangladesh`, featured, status:'available', images,
    description:`DEMO LISTING — Not a real vehicle offer. This ${year} ${make} ${model} ${variant} is an illustrative example for previewing Dream Car Enterprise, finance estimates, and bookings. The listed price, mileage, condition, specifications and photos are placeholders. Do not pay a deposit for this listing.`,
    features:['Air conditioning','Anti-lock brakes (illustrative)','Reverse camera (illustrative)','Bluetooth audio','Power steering','Airbags (illustrative)']
  };
}

// Idempotent, insert-only: existing inventory, edits, prices, photos and reservations are preserved.
export async function seedDemoVehicles() {
  let inserted = 0;
  for (let i=0; i<demoSpecs.length; i++) {
    const doc = demoVehicleData(demoSpecs[i], i);
    const result = await Vehicle.updateOne(
      {make:doc.make,model:doc.model,variant:doc.variant,year:doc.year},
      {$setOnInsert:doc},
      {upsert:true}
    );
    inserted += result.upsertedCount || 0;
  }
  return {inserted, totalDemoTemplates:demoSpecs.length};
}
