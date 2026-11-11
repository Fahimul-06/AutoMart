import PDFDocument from 'pdfkit';
import {createReadStream,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const logoPath=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../assets/dream-car-enterprise-logo.png');
const address='Block J, Road 14, Plot 3, Baridhara J Block, Vatara, Dhaka 1212, Bangladesh';
const phone='01611-489489 | +880 1841-523552';
const safe=v=>String(v??'').trim()||'Not provided';
const bdt=v=>'BDT '+Number(v||0).toLocaleString('en-BD',{minimumFractionDigits:2,maximumFractionDigits:2});
const localTime=v=>new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',dateStyle:'medium',timeStyle:'short'}).format(new Date(v));

export function streamBookingReceipt(res,data,download=false){
 const doc=new PDFDocument({size:'A4',margins:{top:38,bottom:42,left:48,right:48},info:{Title:`Booking Receipt ${data.receiptNumber}`,Author:'Dream Car Enterprise'}});
 res.set('Content-Type','application/pdf');res.set('Cache-Control','private, no-store');res.set('X-Content-Type-Options','nosniff');
 res.set('Content-Disposition',`${download?'attachment':'inline'}; filename="${data.receiptNumber}.pdf"`);
 doc.pipe(res);
 if(existsSync(logoPath))doc.image(logoPath,48,34,{fit:[122,68]});
 doc.fillColor('#111827').font('Helvetica-Bold').fontSize(17).text('DREAM CAR ENTERPRISE',184,45,{width:360});
 doc.font('Helvetica').fontSize(8.5).fillColor('#4b5563').text(data.companyAddress,184,72,{width:360});
 doc.text(`Phone: ${data.companyPhone}`,184,97,{width:360});
 doc.text(`Trade License No: ${data.licenseNumber}`,184,110,{width:360});
 doc.moveTo(48,143).lineTo(547,143).strokeColor('#d1d5db').stroke();
 doc.font('Helvetica-Bold').fontSize(17).fillColor('#111827').text('ADVANCE BOOKING PAYMENT RECEIPT',48,162,{align:'center'});
 doc.font('Helvetica').fontSize(10).text(`Receipt No: ${safe(data.receiptNumber)}`,48,193);
 doc.text(`Booking Date (Dhaka): ${localTime(data.bookingDate)}`,48,210);
 doc.text(`Payment Verified (Dhaka): ${localTime(data.paymentVerifiedAt)}`,48,227);
 let y=263;
 function section(title,rows){
  doc.roundedRect(48,y,499,27,4).fill('#f1f5f9');doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11).text(title,61,y+7);y+=39;
  for(const [key,value] of rows){doc.font('Helvetica').fontSize(9).fillColor('#6b7280').text(key,58,y,{width:150});
   doc.font('Helvetica-Bold').fillColor('#111827').text(safe(value),210,y,{width:329});y=Math.max(doc.y,y+16)+5;}
  y+=9;
 }
 section('CUSTOMER INFORMATION',[['Customer name',data.customerName],['Phone number',data.customerPhone],['Address',data.customerAddress]]);
 section('VEHICLE INFORMATION',[['Vehicle',data.vehicleName],['Model',data.model],['Model year',String(data.year)],['Condition',data.condition],['Chassis number',data.chassisNumber],['Engine number',data.engineNumber]]);
 section('PAYMENT INFORMATION',[['Advance booking paid',bdt(data.amount)],['Payment method',data.paymentMethod],['Transaction reference',data.transactionId],['Purchase type',String(data.financeType).toUpperCase()]]);
 doc.font('Helvetica').fontSize(8).fillColor('#475569').text('PAYMENT VERIFIED BY MANAGEMENT. This receipt acknowledges the advance booking payment only; it is not a vehicle ownership, title, or registration certificate.',48,Math.min(y+12,730),{width:499,align:'center'});
 doc.end();
}
