import { useEffect, useState } from 'react';
import {
  ArrowLeft, Calendar, Fuel, Gauge, Settings2, Palette,
  MessageCircle, BookCheck, Send, CheckCircle, AlertCircle,
  Car, Bike, Loader2, ChevronRight, ChevronLeft, X
} from 'lucide-react';
import { supabase, type Vehicle, type VehicleQuestion } from '../lib/supabase';
import type { Page } from '../types';

type Props = {
  vehicleId: string;
  user: { id: string; email: string } | null;
  setPage: (p: Page) => void;
};

export default function VehicleDetailPage({ vehicleId, user, setPage }: Props) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [questions, setQuestions] = useState<VehicleQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [questionText, setQuestionText] = useState('');
  const [qLoading, setQLoading] = useState(false);
  const [qSuccess, setQSuccess] = useState('');
  const [qError, setQError] = useState('');

  const [showBooking, setShowBooking] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bLoading, setBLoading] = useState(false);
  const [bSuccess, setBSuccess] = useState('');
  const [bError, setBError] = useState('');

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(price);

  useEffect(() => {
    (async () => {
      const [vRes, qRes] = await Promise.all([
        supabase.from('vehicles').select('*').eq('id', vehicleId).maybeSingle(),
        supabase.from('vehicle_questions').select('*').eq('vehicle_id', vehicleId).order('created_at', { ascending: false }),
      ]);
      setVehicle(vRes.data);
      setQuestions(qRes.data ?? []);
      setLoading(false);
    })();
  }, [vehicleId]);

  const submitQuestion = async () => {
    if (!user) { setPage({ name: 'auth', mode: 'login' }); return; }
    if (!questionText.trim()) return;
    setQLoading(true);
    setQError('');

    const { error } = await supabase.from('vehicle_questions').insert({
      vehicle_id: vehicleId,
      user_id: user.id,
      question: questionText.trim(),
    });

    if (error) {
      setQError('Failed to submit question. Please try again.');
    } else {
      setQSuccess('Your question has been submitted! We will respond soon.');
      setQuestionText('');
      const { data } = await supabase.from('vehicle_questions').select('*').eq('vehicle_id', vehicleId).order('created_at', { ascending: false });
      setQuestions(data ?? []);
    }
    setQLoading(false);
  };

  const submitBooking = async () => {
    if (!user) { setPage({ name: 'auth', mode: 'login' }); return; }
    setBLoading(true);
    setBError('');

    const { error } = await supabase.from('bookings').insert({
      vehicle_id: vehicleId,
      user_id: user.id,
      preferred_date: bookingDate || null,
      notes: bookingNotes,
      status: 'pending',
    });

    if (error) {
      setBError('Booking failed. Please try again.');
    } else {
      setBSuccess('Booking request submitted! Our team will contact you shortly.');
      setBookingDate('');
      setBookingNotes('');
    }
    setBLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Vehicle not found.</p>
          <button onClick={() => setPage({ name: 'products' })} className="text-red-500 font-medium hover:underline">
            Back to listings
          </button>
        </div>
      </div>
    );
  }

  const specs = vehicle.specs as Record<string, unknown>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => setPage({ name: 'home' })} className="hover:text-red-500">Home</button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => setPage({ name: 'products' })} className="hover:text-red-500">Vehicles</button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 font-medium truncate">{vehicle.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => setPage({ name: 'products' })}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Image + specs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {/* Main image */}
              <div className="relative h-72 sm:h-96 group">
                <img
                  src={vehicle.images[activeIndex] ?? 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg'}
                  alt={`${vehicle.title} - photo ${activeIndex + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setLightbox(true)}
                />
                {/* Nav arrows */}
                {vehicle.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveIndex(i => (i - 1 + vehicle.images.length) % vehicle.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveIndex(i => (i + 1) % vehicle.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${vehicle.condition === 'new' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                    {vehicle.condition}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-900/80 text-white flex items-center gap-1">
                    {vehicle.type === 'car' ? <Car className="w-3 h-3" /> : <Bike className="w-3 h-3" />}
                    {vehicle.type}
                  </span>
                </div>
                {/* Photo count badge */}
                <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                  {activeIndex + 1} / {vehicle.images.length}
                </span>
                {vehicle.sold && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-red-500 text-white font-bold text-xl px-6 py-3 rounded-full">SOLD</span>
                  </div>
                )}
              </div>
              {/* Thumbnails */}
              {vehicle.images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {vehicle.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        i === activeIndex ? 'border-red-500 ring-1 ring-red-500' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lightbox */}
            {lightbox && (
              <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightbox(false)}>
                <button
                  onClick={() => setLightbox(false)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center z-10"
                >
                  <X className="w-6 h-6" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setActiveIndex(i => (i - 1 + vehicle.images.length) % vehicle.images.length); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setActiveIndex(i => (i + 1) % vehicle.images.length); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
                <img
                  src={vehicle.images[activeIndex]}
                  alt={`${vehicle.title} - photo ${activeIndex + 1}`}
                  className="max-w-[90vw] max-h-[85vh] object-contain"
                  onClick={e => e.stopPropagation()}
                />
                <span className="absolute bottom-6 text-white/70 text-sm">
                  {activeIndex + 1} / {vehicle.images.length}
                </span>
              </div>
            )}

            {/* Vehicle Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="mb-1">
                <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">{vehicle.brand}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">{vehicle.title}</h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{vehicle.description}</p>

              {/* Key specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: Calendar, label: 'Year', value: vehicle.year },
                  { icon: Fuel, label: 'Fuel', value: vehicle.fuel_type },
                  { icon: Settings2, label: 'Transmission', value: vehicle.transmission },
                  { icon: Palette, label: 'Color', value: vehicle.color },
                  ...(vehicle.condition === 'used' ? [{ icon: Gauge, label: 'Mileage', value: `${vehicle.mileage.toLocaleString()} km` }] : []),
                  ...(vehicle.engine_cc > 0 ? [{ icon: Settings2, label: 'Engine', value: `${vehicle.engine_cc} cc` }] : []),
                ].filter(s => s.value).map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-gray-500 font-medium">{label}</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional specs */}
            {Object.keys(specs).length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Additional Features</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(specs).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 capitalize">
                        {typeof val === 'boolean' ? key.replace(/_/g, ' ') : `${key.replace(/_/g, ' ')}: ${val}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Q&A Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-5">
                <MessageCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-gray-900 text-lg">Questions & Answers</h3>
              </div>

              {/* Ask a question */}
              {qSuccess ? (
                <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <p className="text-sm text-green-700">{qSuccess}</p>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-3">
                    {user ? 'Have a question about this vehicle?' : 'Sign in to ask a question about this vehicle.'}
                  </p>
                  {qError && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-sm text-red-600">{qError}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <textarea
                      value={questionText}
                      onChange={e => setQuestionText(e.target.value)}
                      placeholder={user ? 'Ask about this vehicle...' : 'Sign in to ask a question'}
                      disabled={!user}
                      rows={2}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={user ? submitQuestion : () => setPage({ name: 'auth', mode: 'login' })}
                      disabled={qLoading || (!!user && !questionText.trim())}
                      className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-4 rounded-xl transition-colors flex items-center justify-center"
                    >
                      {qLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                  {!user && (
                    <button onClick={() => setPage({ name: 'auth', mode: 'login' })} className="mt-2 text-xs text-red-500 hover:underline">
                      Sign in to ask a question
                    </button>
                  )}
                </div>
              )}

              {/* Questions list */}
              {questions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No questions yet. Be the first to ask!</p>
              ) : (
                <div className="space-y-4">
                  {questions.map(q => (
                    <div key={q.id} className="border-l-2 border-red-200 pl-4">
                      <p className="text-sm font-medium text-gray-800 mb-1">Q: {q.question}</p>
                      {q.answer ? (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2 mt-1">A: {q.answer}</p>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Awaiting response from seller</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{new Date(q.created_at).toLocaleDateString('en-BD')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Price + Booking */}
          <div className="space-y-6">
            {/* Price card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-20">
              <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Price</p>
                <p className="text-3xl font-extrabold text-slate-900">{formatPrice(vehicle.price)}</p>
                {vehicle.condition === 'used' && (
                  <p className="text-xs text-gray-400 mt-1">Negotiable</p>
                )}
              </div>

              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Brand</span>
                  <span className="font-medium text-gray-800">{vehicle.brand}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Model</span>
                  <span className="font-medium text-gray-800">{vehicle.model}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Year</span>
                  <span className="font-medium text-gray-800">{vehicle.year}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Condition</span>
                  <span className={`font-medium capitalize ${vehicle.condition === 'new' ? 'text-green-600' : 'text-amber-600'}`}>{vehicle.condition}</span>
                </div>
              </div>

              {!vehicle.sold ? (
                <>
                  {!showBooking ? (
                    <button
                      onClick={() => {
                        if (!user) { setPage({ name: 'auth', mode: 'login' }); return; }
                        setShowBooking(true);
                      }}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <BookCheck className="w-5 h-5" />
                      Book This Vehicle
                    </button>
                  ) : bSuccess ? (
                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-semibold text-green-800">Booking Submitted!</span>
                      </div>
                      <p className="text-sm text-green-700">{bSuccess}</p>
                      <button
                        onClick={() => { setBSuccess(''); setShowBooking(false); }}
                        className="mt-3 text-xs text-green-600 underline"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <div className="border border-red-100 rounded-xl p-4 bg-red-50">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <BookCheck className="w-4 h-4 text-red-500" />
                        Book a Viewing
                      </h4>
                      {bError && (
                        <div className="mb-3 p-2 bg-red-100 rounded-lg text-xs text-red-700">{bError}</div>
                      )}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Preferred Date</label>
                          <input
                            type="date"
                            value={bookingDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={e => setBookingDate(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
                          <textarea
                            value={bookingNotes}
                            onChange={e => setBookingNotes(e.target.value)}
                            placeholder="Any specific questions or requests..."
                            rows={2}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={submitBooking}
                            disabled={bLoading}
                            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1"
                          >
                            {bLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Booking'}
                          </button>
                          <button
                            onClick={() => setShowBooking(false)}
                            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full bg-gray-100 text-gray-500 font-semibold py-3.5 rounded-xl text-center">
                  This vehicle has been sold
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">
                  Located in Bangladesh &bull; Free test drive available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
