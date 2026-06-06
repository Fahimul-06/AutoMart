import { Fuel, Gauge, Calendar, Tag } from 'lucide-react';
import type { Vehicle } from '../lib/supabase';
import type { Page } from '../types';
import { useLanguage } from '../lib/language';
import { t } from '../lib/translations';

type Props = {
  vehicle: Vehicle;
  setPage: (p: Page) => void;
};

export default function VehicleCard({ vehicle, setPage }: Props) {
  const { language } = useLanguage();
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(price);

  return (
    <button
      onClick={() => setPage({ name: 'vehicle', id: vehicle.id })}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group text-left border border-gray-100 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden h-52">
        <img
          src={vehicle.images[0] ?? 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg'}
          alt={vehicle.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
            vehicle.condition === 'new' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
          }`}>
            {vehicle.condition}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-900/80 text-white">
            {vehicle.type}
          </span>
        </div>
        {vehicle.sold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-full text-sm">SOLD</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-1">
          <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">{vehicle.brand}</span>
        </div>
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
          {vehicle.title}
        </h3>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs">{vehicle.year}</span>
          </div>
          {vehicle.fuel_type && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Fuel className="w-3.5 h-3.5" />
              <span className="text-xs">{vehicle.fuel_type}</span>
            </div>
          )}
          {vehicle.condition === 'used' && vehicle.mileage > 0 && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Gauge className="w-3.5 h-3.5" />
              <span className="text-xs">{vehicle.mileage.toLocaleString()} km</span>
            </div>
          )}
          {vehicle.transmission && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Tag className="w-3.5 h-3.5" />
              <span className="text-xs">{vehicle.transmission}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{t('vehicle.price', language)}</p>
            <p className="text-lg font-bold text-slate-900">{formatPrice(vehicle.price)}</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-medium group-hover:bg-red-500 group-hover:text-white transition-colors">
            {t('vehicle.view_details', language)}
          </span>
        </div>
      </div>
    </button>
  );
}
