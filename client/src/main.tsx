import React,{Suspense,lazy,useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import Layout from './components/Layout';
import {api,type User} from './lib/api';
import './style.css';
const Home=lazy(()=>import('./pages/Home'));
const Catalog=lazy(()=>import('./pages/Catalog'));
const Detail=lazy(()=>import('./pages/Detail'));
const Auth=lazy(()=>import('./pages/Auth'));
const Bookings=lazy(()=>import('./pages/Bookings'));
const Admin=lazy(()=>import('./pages/Admin'));
const ManagementLogin=lazy(()=>import('./pages/ManagementLogin'));
function App(){const[user,setUser]=useState<User|null>(null);const[ready,setReady]=useState(false);const [management,setManagement]=useState(window.location.hash==='#/management_dash.com');
useEffect(()=>{const handler=()=>setManagement(window.location.hash==='#/management_dash.com');window.addEventListener('hashchange',handler);return()=>window.removeEventListener('hashchange',handler)},[]);
useEffect(()=>{const ctl=new AbortController();api<{user:User}>('/auth/me',{signal:ctl.signal}).then(d=>setUser(d.user)).catch(()=>{}).finally(()=>setReady(true));return()=>ctl.abort()},[]);
if(management)return <BrowserRouter><Suspense fallback={<div className="container empty">Loading management portal...</div>}>{!ready?<div className="container empty">Checking administrator session...</div>:user?.role==='admin'?<><div className="management-topbar"><img src="/dream-car-enterprise-logo.webp" alt="Dream Car Enterprise"/><button onClick={async()=>{await api('/auth/logout',{method:'POST'}).catch(()=>{});setUser(null);window.location.assign('/');}}>Sign out</button></div><Admin user={user}/></>:<ManagementLogin setUser={setUser}/>}</Suspense></BrowserRouter>;
return <BrowserRouter><Routes><Route element={<Layout user={user} setUser={setUser}/> }><Route path="/" element={<Suspense fallback={<div className="container empty">Loading...</div>}><Home/></Suspense>}/><Route path="/vehicles" element={<Suspense fallback={<div className="container empty">Loading vehicles...</div>}><Catalog/></Suspense>}/><Route path="/vehicles/:id" element={<Suspense fallback={<div className="container empty">Loading vehicle...</div>}><Detail user={user}/></Suspense>}/><Route path="/login" element={<Suspense fallback={null}><Auth setUser={setUser}/></Suspense>}/><Route path="/bookings" element={<Suspense fallback={null}><Bookings user={user}/></Suspense>}/><Route path="/admin" element={<Navigate to="/" replace/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes></BrowserRouter>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
