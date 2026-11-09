import {useEffect,useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {ArrowRight,ArrowUpRight,ShieldCheck,Wallet,CarFront,Headphones,Search} from 'lucide-react';
import {api,Vehicle} from '../lib/api';
import VehicleCard from '../components/VehicleCard';

export default function Home(){
  const [featured,setFeatured]=useState<Vehicle[]>([]);
  const [search,setSearch]=useState('');
  const nav=useNavigate();
  useEffect(()=>{api<{vehicles:Vehicle[]}>('/vehicles?featured=true&limit=6').then(d=>setFeatured(d.vehicles.slice(0,6))).catch(()=>{})},[]);
  return <>
    <section className="hero hero-banner">
      <img className="hero-banner-image" src="/hero-banner.webp" fetchPriority="high" decoding="async" alt="Find your dream car with Dream Car Enterprise"/>
    </section>

    <section className="container hero-search-wrap hero-search-section">
      <form className="hero-search" onSubmit={e=>{e.preventDefault();nav('/vehicles?search='+encodeURIComponent(search))}}>
        <div className="hero-search-heading"><span className="little-label">FIND YOUR MATCH</span><h3>Search your next vehicle</h3></div>
        <div className="search-input"><Search size={19}/><input placeholder="Search make, model or keyword..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <button className="btn btn-primary">Search vehicles <ArrowRight size={17}/></button>
      </form>
    </section>

    <section className="section featured-section container"><div className="section-header"><div><div className="section-kicker">THE COLLECTION</div><h2>Featured <em>vehicles.</em></h2><p>Explore a selection of cars chosen for your next journey.</p></div><Link to="/vehicles" className="text-link">View all vehicles <ArrowUpRight size={18}/></Link></div><div className="vehicle-grid">{featured.map(v=><VehicleCard key={v._id} vehicle={v}/>)} </div>{!featured.length&&<div className="empty">No featured vehicles yet. Seed the database to load demo listings.</div>}</section>

    <section className="why-section"><div className="container"><div className="section-header"><div><div className="section-kicker">WHY DREAM CAR ENTERPRISE</div><h2>Your journey, <em>simplified.</em></h2></div><p>Everything you need to discover, finance and reserve your next vehicle — all in one place.</p></div><div className="benefits"><div><span><ShieldCheck/></span><h3>Shop with confidence</h3><p>See transparent car details, curated listings and straightforward information.</p></div><div><span><Wallet/></span><h3>Finance your way</h3><p>Customize your down payment and tenure with instant monthly installment estimates.</p></div><div><span><CarFront/></span><h3>Reserve in minutes</h3><p>Choose the right car, submit a reservation and track booking status online.</p></div><div><span><Headphones/></span><h3>Support when you need it</h3><p>Our management team reviews reservations and payment references.</p></div></div></div></section>

    <section className="container cta-panel"><div><div className="section-kicker">TIME FOR AN UPGRADE?</div><h2>Find the car that<br/>feels like <em>you.</em></h2><p>Browse the complete collection and calculate the finance plan that fits your budget.</p><Link to="/vehicles" className="btn btn-primary">Find my next car <ArrowUpRight size={18}/></Link></div><div className="cta-car"/></section>
  </>;
}
