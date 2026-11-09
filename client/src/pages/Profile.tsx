import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {api,patch,type User} from '../lib/api';
export default function Profile({user,setUser}:{user:User|null;setUser:(u:User|null)=>void}){
 const [name,setName]=useState(user?.name||'');const [phone,setPhone]=useState(user?.phone||'');
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');
 useEffect(()=>{setName(user?.name||'');setPhone(user?.phone||'')},[user]);
 if(!user)return <div className="container empty">Please <Link to="/login">sign in</Link> to view your profile.</div>;
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');setNotice('');try{
  const result=await patch<{user:User}>('/auth/me',{name,phone});setUser(result.user);setNotice('Profile updated successfully.');
 }catch(err:any){setError(err.message||'Unable to update profile')}finally{setBusy(false)}}
 return <div className="container customer-profile"><div className="section-kicker">MY ACCOUNT</div><h1>Customer profile</h1><p>Manage your contact details and review vehicle reservations.</p><form onSubmit={save} className="profile-form"><label>Full name<input value={name} onChange={e=>setName(e.target.value)} required minLength={2} maxLength={100}/></label><label>Email address<input value={user.email} readOnly disabled/><small>Email cannot be changed from this page.</small></label><label>Phone number<input value={phone} onChange={e=>setPhone(e.target.value)} maxLength={30} type="tel"/></label>{error&&<p role="alert" className="error">{error}</p>}{notice&&<p role="status" className="success">{notice}</p>}<button type="submit" className="btn btn-primary" disabled={busy}>{busy?'Saving...':'Save profile'}</button><Link to="/bookings" className="btn btn-quiet">My bookings</Link></form></div>
}
