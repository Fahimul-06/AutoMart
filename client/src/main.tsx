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
function App(){const[user,setUser]=useState<User|null>(null);const[ready,setReady]=useState(false);
useEffect(()=>{const ctl=new AbortController();api<{user:User}>('/auth/me',{signal:ctl.signal}).then(d=>setUser(d.user)).catch(()=>{}).finally(()=>setReady(true));return()=>ctl.abort()},[]);
return <BrowserRouter><Routes><Route element={<Layout user={user} setUser={setUser}/> }><Route path="/" element={<Suspense fallback={<div className="container empty">Loading...</div>}><Home/></Suspense>}/><Route path="/vehicles" element={<Suspense fallback={<div className="container empty">Loading vehicles...</div>}><Catalog/></Suspense>}/><Route path="/vehicles/:id" element={<Suspense fallback={<div className="container empty">Loading vehicle...</div>}><Detail user={user}/></Suspense>}/><Route path="/login" element={<Suspense fallback={null}><Auth setUser={setUser}/></Suspense>}/><Route path="/bookings" element={<Suspense fallback={null}><Bookings user={user}/></Suspense>}/><Route path="/admin" element={ready?<Suspense fallback={null}><Admin user={user}/></Suspense>:<div className="container empty">Checking account...</div>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes></BrowserRouter>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
