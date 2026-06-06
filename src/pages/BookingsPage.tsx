import { useEffect, useState } from 'react';
import { BookOpen, Calendar, Clock, CheckCircle, XCircle, Loader2, Car } from 'lucide-react';
import { supabase, type Booking, type Vehicle } from '../lib/supabase';
import type { Page } from '../types';

type Props = {
  user: { id: string; email: string } | null;
  setPage: (p: Page) => void;
};

type BookingWithVehicle = Booking & { vehicle: Vehicle | null };

const STATUS_STYLES = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, label: 'Pending' },
  confirmed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle, label: 'Confirmed' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle, label: 'Cancelled' },
};

export default function BookingsPage({ user, setPage }: Props) {
  const [bookings, setBookings] = useState<BookingWithVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setPage({ name: 'auth', mode: 'login' }); return; }
    (async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, vehicle:vehicles(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setBookings((data ?? []) as BookingWithVehicle[]);
      setLoading(false);
    })();
  }, [user, setPage]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(price);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-slate-900 text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-red-400" />
            <div>
              <h1 className="text-2xl font-bold">My Bookings</h1>
              <p className="text-slate-400 text-sm">Track your vehicle booking requests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No bookings yet</h3>
            <p className="text-gray-400 text-sm mb-6">Browse our vehicles and book a test drive</p>
            <button
              onClick={() => setPage({ name: 'products' })}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Browse Vehicles
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => {
              const status = STATUS_STYLES[booking.status];
              const StatusIcon = status.icon;
              return (
                <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="flex flex-col sm:flex-row">
                    {booking.vehicle && (
                      <div className="sm:w-40 h-32 sm:h-auto flex-shrink-0">
                        <img
                          src={booking.vehicle.images?.[0] ?? 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg'}
                          alt={booking.vehicle.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          {booking.vehicle ? (
                            <>
                              <h3 className="font-bold text-gray-900">{booking.vehicle.title}</h3>
                              <p className="text-red-500 font-semibold text-sm">{formatPrice(booking.vehicle.price)}</p>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400">
                              <Car className="w-4 h-4" />
                              <span className="text-sm">Vehicle no longer available</span>
                            </div>
                          )}
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.text} ${status.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {booking.preferred_date && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(booking.preferred_date).toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>Booked {new Date(booking.created_at).toLocaleDateString('en-BD')}</span>
                        </div>
                      </div>

                      {booking.notes && (
                        <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">{booking.notes}</p>
                      )}

                      <button
                        onClick={() => booking.vehicle && setPage({ name: 'vehicle', id: booking.vehicle.id })}
                        className="mt-3 text-xs text-red-500 font-medium hover:underline"
                      >
                        View vehicle details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
