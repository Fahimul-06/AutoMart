import {useState,type FormEvent} from 'react';
import {ShieldCheck,LockKeyhole,Mail,ArrowRight} from 'lucide-react';
import {post,type User} from '../lib/api';

export default function ManagementLogin({setUser}:{setUser:(user:User|null)=>void}){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');const [showPassword,setShowPassword]=useState(false);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent){
    e.preventDefault();setBusy(true);setError('');
    try {
      const response=await post<{user:User}>('/auth/login',{email,password});
      if(response.user.role!=='admin'){
        await post('/auth/logout',{}).catch(()=>{});
        setError('This account is not authorized for management access.');
        return;
      }
      setUser(response.user);
    }catch(err){setError(err instanceof Error?err.message:'Unable to sign in.');}
    finally{setBusy(false);}
  }
  return <div className="management-login-page"><section className="management-login-card">
    <img className="management-login-logo" src="/dream-car-enterprise-logo.webp" alt="Dream Car Enterprise"/>
    <div className="management-title"><ShieldCheck size={24}/><div><h1>Management sign in</h1><p>Authorized administrators only</p></div></div>
    <form onSubmit={submit}>
      <label>Email address<div className="input-icon"><Mail size={18}/><input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Management email"/></div></label>
      <label>Password<div className="input-icon"><LockKeyhole size={18}/><input type={showPassword?"text":"password"} autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Management password"/></div></label>
      <label className='checkbox-row'><input type='checkbox' checked={showPassword} onChange={e=>setShowPassword(e.target.checked)}/> Show password</label>{error&&<p role="alert" className="error">{error}</p>}
      <button className="btn btn-primary auth-submit" disabled={busy}>{busy?'Signing in...':'Sign in to dashboard'}<ArrowRight size={17}/></button>
    </form><p className="management-login-note">Access is validated against the server-side administrator role. This address is not a security control by itself.</p>
    <a className="management-back-link" href="/">Return to vehicle marketplace</a>
  </section></div>;
}
