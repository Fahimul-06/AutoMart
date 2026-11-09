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

function ManagementPortal({user,setUser,ready}:{user:User|null;setUser:(u:User|null)=>void;ready:boolean}){
  if(!ready)return <div className="container empty">Checking administrator session...</div>;
  if(user?.role==='admin')return <><div className="management-topbar"><img src="/dream-car-enterprise-logo.webp" alt="Dream Car Enterprise"/><button onClick={async()=>{await api('/auth/logout',{method:'POST'}).catch(()=>{});setUser(null);window.location.assign('/');}}>Sign out</button></div><Admin user={user}/></>;
  return <ManagementLogin setUser={setUser}/>;
}

// This is a public routing preference, not an authentication secret.
// Render builds VITE_* variables into the frontend bundle.
const configuredManagementHash = (import.meta.env.VITE_ADMIN_LOGIN_HASH || '/management_dash.com').trim();
const managementHash = '#/' + configuredManagementHash.replace(/^#?\/?/, '').replace(/\/+$/, '');

function App(){
  const [user,setUser]=useState<User|null>(null);
  const [ready,setReady]=useState(false);
  const [hash,setHash]=useState(()=>window.location.hash);

  useEffect(()=>{
    const onHashChange=()=>setHash(window.location.hash);
    window.addEventListener('hashchange',onHashChange);
    return()=>window.removeEventListener('hashchange',onHashChange);
  },[]);
  useEffect(()=>{
    const ctl=new AbortController();
    api<{user:User}>('/auth/me',{signal:ctl.signal}).then(d=>setUser(d.user)).catch(()=>{}).finally(()=>setReady(true));
    return()=>ctl.abort();
  },[]);

  // The hash never travels to Express, so this address works even on a cold
  // browser visit. The API still independently enforces admin authorization.
  if(hash===managementHash){
    return <Suspense fallback={<div className="container empty">Loading management portal...</div>}>
      <ManagementPortal user={user} setUser={setUser} ready={ready}/>
    </Suspense>;
  }
  return <BrowserRouter><Suspense fallback={<div className="container empty">Loading...</div>}><Routes>
    <Route element={<Layout user={user} setUser={setUser}/> }>
      <Route path="/" element={<Home/>}/>
      <Route path="/vehicles" element={<Catalog/>}/>
      <Route path="/vehicles/:id" element={<Detail user={user}/>}/>
      <Route path="/login" element={<Auth setUser={setUser}/>}/>
      <Route path="/bookings" element={<Bookings user={user}/>}/>
      <Route path="/admin" element={<Navigate to="/" replace/>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Route>
  </Routes></Suspense></BrowserRouter>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
