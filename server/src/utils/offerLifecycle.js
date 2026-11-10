import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';
import Offer from '../models/Offer.js';

/** Release selected offers whose three-hour payment window ended without a submitted reference.
 * Compare-and-set on the selected offer so a competing request cannot release a newer selection.
 * A submitted payment reference locks the vehicle until staff verifies or rejects it.
 */
export async function expireUnpaidSelections(vehicleId=null){
  const now=new Date();
  const query={status:'reserved',selectedOffer:{$ne:null},offerExpiresAt:{$lte:now}};
  if(vehicleId)query._id=vehicleId;
  const vehicles=await Vehicle.find(query).select('_id selectedOffer selectedBooking offerExpiresAt').lean();
  for(const v of vehicles){
    const booking=v.selectedBooking?await Booking.findById(v.selectedBooking).select('paymentStatus status').lean():null;
    if(booking && booking.paymentStatus!=='unpaid')continue;
    const updated=await Vehicle.updateOne({_id:v._id,status:'reserved',selectedOffer:v.selectedOffer,offerExpiresAt:{$lte:now}},{$set:{status:'available',selectedOffer:null,offerExpiresAt:null,selectedBooking:null}});
    if(updated.modifiedCount){
      await Offer.updateOne({_id:v.selectedOffer,status:'selected'},{$set:{status:'expired'}});
      if(v.selectedBooking)await Booking.updateOne({_id:v.selectedBooking,paymentStatus:'unpaid'},{$set:{status:'cancelled',notes:'Payment deadline expired; offer selection released.'}});
    }
  }
}
