import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {api,type Booking,type User,money} from '../lib/api';

export default function OfferNotification({user}:{user:User|null}){
 const [selected,setSelected]=useState<Booking[]>([]);
 useEffect(()=>{
   if(user?.role!=='customer'){setSelected([]);return;}
   let active=true;
   const refresh=()=>api<{bookings:Booking[]}>('/bookings/mine').then(d=>{
     if(!active)return;
     setSelected(d.bookings.filter(b=>b.offer&&b.status==='pending'&&b.paymentStatus==='unpaid'&&!!b.paymentDeadline&&new Date(b.paymentDeadline).getTime()>Date.now()));
   }).catch(()=>{});
   refresh();const timer=window.setInterval(refresh,20000);
   return()=>{active=false;window.clearInterval(timer)};
 },[user?.id,user?.role]);
 if(!selected.length)return null;
 return <div className="selected-offer-notice" role="status"><div className="container"><strong>🔔 Your offer was selected!</strong> {selected.length===1?`Pay ${money(selected[0].bookingAmount)} advance booking money`:`You have ${selected.length} selected offers awaiting booking payment`} within 3 hours. <Link to="/bookings">View payment instructions and deadline →</Link></div></div>
}
