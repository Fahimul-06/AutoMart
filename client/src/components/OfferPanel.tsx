import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {api,post,money,type User,type Vehicle} from '../lib/api';

type OwnOffer={_id:string;attempt:number;amount:number;status:string;createdAt:string;paymentDeadline?:string};
export default function OfferPanel({vehicle,user,financeType,downPaymentPercent,tenureYears}:{vehicle:Vehicle;user:User|null;financeType:'cash'|'loan';downPaymentPercent:number;tenureYears:number}){
  const [myOffers,setMyOffers]=useState<OwnOffer[]>([]);
  const [amount,setAmount]=useState(String(vehicle.price));
  const [error,setError]=useState('');const [notice,setNotice]=useState('');const [busy,setBusy]=useState(false);
  useEffect(()=>{setAmount(String(vehicle.price));setError('');setNotice('');if(user?.role==='customer')api<{offers:OwnOffer[]}>(`/offers/vehicle/${vehicle._id}/mine`).then(d=>setMyOffers(d.offers)).catch(e=>setError(e.message));},[vehicle._id,user?.id,vehicle.price]);
  const last=myOffers.at(-1);
  const nextOfferAt=last&&last.attempt<3?new Date(new Date(last.createdAt).getTime()+(last.attempt===1?4:6)*3600000):null;
  const wait=nextOfferAt&&nextOfferAt.getTime()>Date.now();
  const locked=vehicle.status!=='available';
  async function offer(){
    if(!user||user.role!=='customer')return;
    setBusy(true);setError('');setNotice('');
    try{
      const d=await post<{offer:OwnOffer}>('/offers',{vehicleId:vehicle._id,amount:Number(amount),financeType,...(financeType==='loan'?{downPaymentPercent,tenureYears}:{})});
      setMyOffers(previous=>[...previous,d.offer]);setNotice('Your private offer has been submitted. Management will review it.');
    }catch(e:any){setError(e.message||'Offer could not be submitted');}finally{setBusy(false)}
  }
  return <div className="offer-panel">
    <h3>Make a private offer</h3>
    <p>Only management can see your offered price. You have up to three offers per vehicle.</p>
    {vehicle.status==='sold'?<p className="offer-sold">SOLD — offers are closed.</p>:vehicle.status==='reserved'?<p className="offer-reserved">Reserved for a selected customer. Offers are paused.</p>:null}
    {user?.role==='customer'&&myOffers.length>0&&<div className="my-offers"><strong>My offers ({myOffers.length}/3)</strong>{myOffers.map(o=><div key={o._id}><span>Offer {o.attempt}: {money(o.amount)}</span><span>{o.status}</span></div>)}{myOffers.some(o=>o.status==='selected')&&<p className="success">Your offer was selected! Open <Link to="/bookings">My Bookings</Link> to pay the advance within 3 hours.</p>}</div>}
    {user?.role==='customer'&&<><label>Your proposed price (BDT)<input type="number" min="1" max={vehicle.price} step="1" value={amount} onChange={e=>setAmount(e.target.value)}/></label><small>The advertised price is {money(vehicle.price)}. Loan/cash choices above apply to this offer.</small></>}
    {wait&&<p className="offer-wait">Your next offer becomes available at {nextOfferAt!.toLocaleString()} if management hasn't selected a customer.</p>}
    {notice&&<p className="success" role="status">{notice}</p>}{error&&<p className="error" role="alert">{error}</p>}
    {!user?<Link className="btn btn-primary" to={`/login?next=${encodeURIComponent('/vehicles/'+vehicle._id)}`}>Sign in to offer</Link>:user.role==='customer'?<button type="button" className="btn btn-primary" disabled={busy||locked||myOffers.length>=3||!!wait||!Number.isFinite(Number(amount))||Number(amount)<=0||Number(amount)>vehicle.price} onClick={offer}>{busy?'Submitting...':myOffers.length>=3?'3 offers used':`Submit private offer ${myOffers.length+1}/3`}</button>:<p>Offers can be submitted from customer accounts only.</p>}
  </div>
}
