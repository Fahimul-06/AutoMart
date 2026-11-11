const address='Block J, Road 14, Plot 3, Baridhara J Block, Vatara, Dhaka 1212, Bangladesh';
const phone='01611-489489 | +880 1841-523552';
export function buildReceiptSnapshot({booking,vehicle,customer,settings,verifiedAt}){
 if(!vehicle?.chassisNumber?.trim()||!vehicle?.engineNumber?.trim())throw Error('Add the vehicle chassis and engine numbers before confirming payment');
 if(!settings?.companyLicenseNumber?.trim())throw Error('Set the company trade license number in Admin Settings before confirming payment');
 if(!customer?.address?.trim()||!customer?.phone?.trim())throw Error('Customer phone and address must be completed before confirming payment');
 return {
  receiptNumber:'DCE-'+String(booking._id).slice(-12).toUpperCase(),
  companyName:'Dream Car Enterprise',licenseNumber:settings.companyLicenseNumber.trim(),companyAddress:address,companyPhone:phone,
  customerName:customer.name,customerPhone:customer.phone,customerAddress:customer.address,
  vehicleName:[vehicle.make,vehicle.model,vehicle.variant].filter(Boolean).join(' '),model:vehicle.model,year:vehicle.year,
  condition:vehicle.condition,chassisNumber:vehicle.chassisNumber.trim(),engineNumber:vehicle.engineNumber.trim(),
  amount:booking.bookingAmount,paymentMethod:booking.paymentMethod,transactionId:booking.transactionId,
  bookingDate:booking.createdAt,paymentVerifiedAt:verifiedAt,
  financeType:booking.financeType,purchasePrice:booking.vehicleSnapshot?.price,
 };
}

