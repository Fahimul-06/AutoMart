import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Car, BookOpen, MessageCircle,
  Users, DollarSign, TrendingUp, Clock, Loader2,
  CheckCircle, XCircle, Eye, Trash2, Edit3, Plus,
  Search, Star, StarOff, ChevronLeft, ArrowLeft,
  Save
} from 'lucide-react';
import { supabase, type Vehicle, type Booking, type VehicleQuestion } from '../lib/supabase';
import type { Page, AdminTab } from '../types';

type Props = {
  user: { id: string; email: string };
  profile: { role: string } | null;
  initialTab?: AdminTab;
  setPage: (p: Page) => void;
};

export default function AdminPage({ user, profile, initialTab, setPage }: Props) {
  const [tab, setTab] = useState<AdminTab>(initialTab ?? 'dashboard');

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">You do not have admin privileges.</p>
          <button onClick={() => setPage({ name: 'home' })} className="text-red-500 font-medium hover:underline">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'vehicles', label: 'Vehicles', icon: Car },
    { key: 'bookings', label: 'Bookings', icon: BookOpen },
    { key: 'questions', label: 'Questions', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-5">
            <button onClick={() => setPage({ name: 'home' })} className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-slate-400 text-sm">Manage your AutoMart platform</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 -mb-px">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === key
                    ? 'border-red-500 text-white bg-slate-800 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-t-lg'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'dashboard' && <DashboardTab />}
        {tab === 'vehicles' && <VehiclesTab />}
        {tab === 'bookings' && <BookingsTab />}
        {tab === 'questions' && <QuestionsTab />}
      </div>
    </div>
  );
}

/* ─── Dashboard Tab ─── */
function DashboardTab() {
  const [stats, setStats] = useState<{ vehicles: number; bookings: number; questions: number; pendingBookings: number; unansweredQs: number } | null>(null);

  useEffect(() => {
    (async () => {
      const [v, b, q] = await Promise.all([
        supabase.from('vehicles').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('status', { count: 'exact' }),
        supabase.from('vehicle_questions').select('answer', { count: 'exact' }),
      ]);
      const bookings = b.data ?? [];
      const questions = q.data ?? [];
      setStats({
        vehicles: v.count ?? 0,
        bookings: b.count ?? 0,
        questions: q.count ?? 0,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        unansweredQs: questions.filter(q => !q.answer).length,
      });
    })();
  }, []);

  if (!stats) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>;

  const cards = [
    { icon: Car, label: 'Total Vehicles', value: stats.vehicles, color: 'bg-blue-500' },
    { icon: BookOpen, label: 'Total Bookings', value: stats.bookings, color: 'bg-green-500' },
    { icon: MessageCircle, label: 'Total Questions', value: stats.questions, color: 'bg-amber-500' },
    { icon: Clock, label: 'Pending Bookings', value: stats.pendingBookings, color: 'bg-red-500' },
    { icon: Users, label: 'Unanswered Questions', value: stats.unansweredQs, color: 'bg-purple-500' },
    { icon: DollarSign, label: 'Platform Active', value: 'Yes', color: 'bg-teal-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Vehicles Tab ─── */
function VehiclesTab() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    let q = supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    if (search.trim()) q = q.or(`title.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`);
    const { data } = await q;
    setVehicles(data ?? []);
    setLoading(false);
  };

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search]);

  const toggleFeatured = async (v: Vehicle) => {
    await supabase.from('vehicles').update({ featured: !v.featured }).eq('id', v.id);
    load();
  };

  const toggleSold = async (v: Vehicle) => {
    await supabase.from('vehicles').update({ sold: !v.sold }).eq('id', v.id);
    load();
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm('Delete this vehicle permanently?')) return;
    await supabase.from('vehicles').delete().eq('id', id);
    load();
  };

  const saveVehicle = async (v: Partial<Vehicle> & { id?: string }) => {
    setSaving(true);
    if (v.id) {
      await supabase.from('vehicles').update(v).eq('id', v.id);
    } else {
      await supabase.from('vehicles').insert(v);
    }
    setSaving(false);
    setEditing(null);
    setCreating(false);
    load();
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(price);

  if (creating) return <VehicleForm onSave={saveVehicle} saving={saving} onCancel={() => setCreating(false)} />;
  if (editing) return <VehicleForm vehicle={editing} onSave={saveVehicle} saving={saving} onCancel={() => setEditing(null)} />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search vehicles..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Vehicle</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Condition</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Featured</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Sold</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={v.images[0]} alt={v.title} className="w-12 h-8 rounded object-cover" />
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{v.title}</p>
                          <p className="text-xs text-gray-400">{v.brand} {v.model} {v.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-700">{v.type}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(v.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${v.condition === 'new' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {v.condition}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleFeatured(v)} className="text-gray-400 hover:text-amber-500 transition-colors">
                        {v.featured ? <Star className="w-5 h-5 fill-amber-400 text-amber-400" /> : <StarOff className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleSold(v)}>
                        {v.sold ? <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Sold</span> : <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">Available</span>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setEditing(v)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => deleteVehicle(v.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Vehicle Form ─── */
function VehicleForm({ vehicle, onSave, saving, onCancel }: {
  vehicle?: Vehicle;
  onSave: (v: Partial<Vehicle> & { id?: string }) => void;
  saving: boolean;
  onCancel: () => void;
}) {
  const isEdit = !!vehicle;
  const [form, setForm] = useState({
    title: vehicle?.title ?? '',
    brand: vehicle?.brand ?? '',
    model: vehicle?.model ?? '',
    year: vehicle?.year ?? new Date().getFullYear(),
    type: vehicle?.type ?? 'car' as 'car' | 'motorcycle',
    condition: vehicle?.condition ?? 'new' as 'new' | 'used',
    price: vehicle?.price ?? 0,
    description: vehicle?.description ?? '',
    color: vehicle?.color ?? '',
    fuel_type: vehicle?.fuel_type ?? 'Petrol',
    transmission: vehicle?.transmission ?? 'Automatic',
    engine_cc: vehicle?.engine_cc ?? 0,
    mileage: vehicle?.mileage ?? 0,
    featured: vehicle?.featured ?? false,
    sold: vehicle?.sold ?? false,
    images_text: vehicle?.images?.join('\n') ?? '',
  });

  const set = (key: string, val: unknown) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const images = form.images_text.split('\n').map(s => s.trim()).filter(Boolean);
    const payload = {
      title: form.title,
      brand: form.brand,
      model: form.model,
      year: form.year,
      type: form.type,
      condition: form.condition,
      price: form.price,
      description: form.description,
      color: form.color,
      fuel_type: form.fuel_type,
      transmission: form.transmission,
      engine_cc: form.engine_cc,
      mileage: form.mileage,
      featured: form.featured,
      sold: form.sold,
      images,
      specs: {},
      ...(isEdit ? { id: vehicle!.id } : {}),
    };
    onSave(payload);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><ChevronLeft className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Title" required>
            <input value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Brand" required>
            <input value={form.brand} onChange={e => set('brand', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Model" required>
            <input value={form.model} onChange={e => set('model', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Year" required>
            <input type="number" value={form.year} onChange={e => set('year', +e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Type">
            <select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}>
              <option value="car">Car</option>
              <option value="motorcycle">Motorcycle</option>
            </select>
          </Field>
          <Field label="Condition">
            <select value={form.condition} onChange={e => set('condition', e.target.value)} className={inputCls}>
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </Field>
          <Field label="Price (BDT)" required>
            <input type="number" value={form.price} onChange={e => set('price', +e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Color">
            <input value={form.color} onChange={e => set('color', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Fuel Type">
            <select value={form.fuel_type} onChange={e => set('fuel_type', e.target.value)} className={inputCls}>
              <option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option><option>Hybrid</option>
            </select>
          </Field>
          <Field label="Transmission">
            <select value={form.transmission} onChange={e => set('transmission', e.target.value)} className={inputCls}>
              <option>Automatic</option><option>Manual</option><option>CVT</option>
            </select>
          </Field>
          <Field label="Engine CC">
            <input type="number" value={form.engine_cc || ''} onChange={e => set('engine_cc', +e.target.value)} className={inputCls} />
          </Field>
          <Field label="Mileage (km)">
            <input type="number" value={form.mileage || ''} onChange={e => set('mileage', +e.target.value)} className={inputCls} />
          </Field>
        </div>

        <Field label="Description">
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className={inputCls + ' resize-none'} />
        </Field>

        <Field label="Image URLs (one per line, minimum 6 recommended)">
          <textarea value={form.images_text} onChange={e => set('images_text', e.target.value)} rows={6} placeholder="https://images.pexels.com/photos/..." className={inputCls + ' resize-none font-mono text-xs'} />
        </Field>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 rounded text-red-500 focus:ring-red-400" />
            <span className="text-sm font-medium text-gray-700">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.sold} onChange={e => set('sold', e.target.checked)} className="w-4 h-4 rounded text-red-500 focus:ring-red-400" />
            <span className="text-sm font-medium text-gray-700">Sold</span>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Save Changes' : 'Create Vehicle'}
          </button>
          <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ─── Bookings Tab ─── */
function BookingsTab() {
  const [bookings, setBookings] = useState<(Booking & { vehicles?: { title: string }; profiles?: { name: string; email: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*, vehicles(title), profiles(name, email)')
      .order('created_at', { ascending: false });
    setBookings(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('bookings').update({ status }).eq('id', id);
    load();
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return loading ? (
    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
  ) : (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Vehicle</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Notes</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookings.map(b => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{b.vehicles?.title ?? 'N/A'}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{b.profiles?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-gray-400">{b.profiles?.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{b.preferred_date ?? 'Not set'}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{b.notes || '-'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    {b.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(b.id, 'confirmed')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Confirm"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => updateStatus(b.id, 'cancelled')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Cancel"><XCircle className="w-4 h-4" /></button>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <button onClick={() => updateStatus(b.id, 'cancelled')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Cancel"><XCircle className="w-4 h-4" /></button>
                    )}
                    {b.status === 'cancelled' && (
                      <button onClick={() => updateStatus(b.id, 'pending')} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Reopen"><Clock className="w-4 h-4" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Questions Tab ─── */
function QuestionsTab() {
  const [questions, setQuestions] = useState<(VehicleQuestion & { vehicles?: { title: string }; profiles?: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('vehicle_questions')
      .select('*, vehicles(title), profiles(name)')
      .order('created_at', { ascending: false });
    setQuestions(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submitAnswer = async (id: string) => {
    if (!answerText.trim()) return;
    setSaving(true);
    await supabase.from('vehicle_questions').update({ answer: answerText.trim() }).eq('id', id);
    setSaving(false);
    setAnswering(null);
    setAnswerText('');
    load();
  };

  return loading ? (
    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
  ) : (
    <div className="space-y-4">
      {questions.map(q => (
        <div key={q.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-red-500 uppercase">{q.vehicles?.title ?? 'Unknown'}</span>
                <span className="text-xs text-gray-400">{new Date(q.created_at).toLocaleDateString('en-BD')}</span>
                {q.answer ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Answered</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Pending</span>
                )}
              </div>
              <p className="text-sm font-medium text-gray-800 mb-1">Q: {q.question}</p>
              <p className="text-xs text-gray-400">Asked by {q.profiles?.name ?? 'Unknown'}</p>
              {q.answer && (
                <div className="mt-3 bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-700">A: {q.answer}</p>
                </div>
              )}
              {answering === q.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={answerText}
                    onChange={e => setAnswerText(e.target.value)}
                    placeholder="Type your answer..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => submitAnswer(q.id)}
                      disabled={saving || !answerText.trim()}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                    >
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Submit Answer
                    </button>
                    <button onClick={() => { setAnswering(null); setAnswerText(''); }} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            {!q.answer && answering !== q.id && (
              <button
                onClick={() => { setAnswering(q.id); setAnswerText(''); }}
                className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" /> Answer
              </button>
            )}
          </div>
        </div>
      ))}
      {questions.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No questions yet</p>
        </div>
      )}
    </div>
  );
}
