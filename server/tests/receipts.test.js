import test from 'node:test';
import assert from 'node:assert/strict';
import {buildReceiptSnapshot} from '../src/utils/receiptData.js';
const base=()=>({
 booking:{_id:'65abcdefabcdefabcdef1234',createdAt:new Date('2026-11-12T03:00:00Z'),bookingAmount:10000,paymentMethod:'bKash',transactionId:'TX-123456',financeType:'cash',vehicleSnapshot:{price:3400000}},
 vehicle:{make:'Toyota',model:'Corolla Cross',variant:'Hybrid',year:2022,condition:'Reconditioned',chassisNumber:'JT-123',engineNumber:'ENG-456'},
 customer:{name:'Test Customer',phone:'01611489489',address:'House 3, Dhaka'},
 settings:{companyLicenseNumber:'TEST-LICENSE-123'},verifiedAt:new Date('2026-11-12T06:00:00Z')
});
test('receipt snapshots all required fields after payment verification',()=>{
 const d=buildReceiptSnapshot(base());
 assert.equal(d.chassisNumber,'JT-123'); assert.equal(d.engineNumber,'ENG-456');
 assert.equal(d.licenseNumber,'TEST-LICENSE-123'); assert.equal(d.customerAddress,'House 3, Dhaka');
 assert.equal(d.amount,10000); assert.equal(d.condition,'Reconditioned');
 assert.match(d.receiptNumber,/^DCE-/);
});
test('receipt is a historical snapshot not a live reference',()=>{
 const args=base();const snap=buildReceiptSnapshot(args);
 args.vehicle.chassisNumber='CHANGED';args.customer.address='CHANGED';args.settings.companyLicenseNumber='CHANGED';
 assert.equal(snap.chassisNumber,'JT-123'); assert.equal(snap.customerAddress,'House 3, Dhaka');assert.equal(snap.licenseNumber,'TEST-LICENSE-123');
});
test('missing identifiers, license or customer address block verification',()=>{
 for(const key of ['chassisNumber','engineNumber']){const args=base();args.vehicle[key]='';assert.throws(()=>buildReceiptSnapshot(args),/chassis and engine/)}
 let args=base();args.settings.companyLicenseNumber='';assert.throws(()=>buildReceiptSnapshot(args),/trade license/);
 args=base();args.customer.address='';assert.throws(()=>buildReceiptSnapshot(args),/address/);
});
