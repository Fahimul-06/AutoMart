export const SECOND_OFFER_WAIT_MS=4*60*60*1000;
export const THIRD_OFFER_WAIT_MS=6*60*60*1000;
export const SELECTION_PAYMENT_MS=3*60*60*1000;

/** Previous is the customer's most recent offer for this vehicle. */
export function nextOfferPolicy(previous,now=Date.now()){
  if(!previous)return {allowed:true,attempt:1,nextAt:null};
  if(previous.attempt>=3)return {allowed:false,attempt:4,reason:'limit',nextAt:null};
  const delay=previous.attempt===1?SECOND_OFFER_WAIT_MS:THIRD_OFFER_WAIT_MS;
  const nextAt=new Date(new Date(previous.createdAt).getTime()+delay);
  return {allowed:now>=nextAt.getTime(),attempt:previous.attempt+1,reason:now>=nextAt.getTime()?null:'wait',nextAt};
}
