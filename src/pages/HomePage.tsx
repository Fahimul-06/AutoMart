import { useEffect, useState } from 'react';
import { ChevronRight, TrendingUp, Shield, Headphones, Car, Bike, Award } from 'lucide-react';
import { supabase, type Vehicle } from '../lib/supabase';
import type { Page } from '../types';
import VehicleCard from '../components/VehicleCard';
import { useLanguage } from '../lib/language';
import { t } from '../lib/translations';

type Props = {
  setPage: (p: Page) => void;
};

const POPULAR_BRANDS = [
  { name: 'Toyota', type: 'car', logo: '🚗', count: '450+' },
  { name: 'Honda', type: 'car', logo: '🚙', count: '320+' },
  { name: 'Yamaha', type: 'motorcycle', logo: '🏍️', count: '280+' },
  { name: 'Suzuki', type: 'car', logo: '🚗', count: '210+' },
  { name: 'Bajaj', type: 'motorcycle', logo: '🏍️', count: '190+' },
  { name: 'Hyundai', type: 'car', logo: '🚙', count: '170+' },
  { name: 'TVS', type: 'motorcycle', logo: '🏍️', count: '155+' },
  { name: 'Mitsubishi', type: 'car', logo: '🚗', count: '120+' },
];

const STATS = [
  { icon: Car, label: 'vehicles_listed', value: '2,500+' },
  { icon: Shield, label: 'verified_sellers', value: '850+' },
  { icon: TrendingUp, label: 'sold_this_month', value: '340+' },
  { icon: Headphones, label: 'happy_customers', value: '15,000+' },
];

export default function HomePage({ setPage }: Props) {
  const [featuredCars, setFeaturedCars] = useState<Vehicle[]>([]);
  const [featuredBikes, setFeaturedBikes] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    (async () => {
      const [carsRes, bikesRes] = await Promise.all([
        supabase.from('vehicles').select('*').eq('type', 'car').eq('featured', true).order('created_at', { ascending: false }).limit(4),
        supabase.from('vehicles').select('*').eq('type', 'motorcycle').eq('featured', true).order('created_at', { ascending: false }).limit(4),
      ]);
      setFeaturedCars(carsRes.data ?? []);
      setFeaturedBikes(bikesRes.data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg"
            alt="Hero"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-1.5 mb-6">
              <Award className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-300 font-medium">#1 Vehicle Marketplace in Bangladesh</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              {t('home.hero_title', language)}
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              {t('home.hero_subtitle', language)}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setPage({ name: 'products', filter: { type: 'car' } })}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
              >
                <Car className="w-5 h-5" />
                {t('home.browse_cars', language)}
              </button>
              <button
                onClick={() => setPage({ name: 'products', filter: { type: 'motorcycle' } })}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
              >
                <Bike className="w-5 h-5" />
                {t('home.browse_motorcycles', language)}
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{value}</p>
                    <p className="text-xs text-slate-400">{t(`home.${label.toLowerCase().replace(/ /g, '_')}`, language)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Brands */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('home.popular_brands', language)}</h2>
              <p className="text-gray-500 mt-1 text-sm">{t('home.top_selling_brands', language)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {POPULAR_BRANDS.map(brand => (
              <button
                key={brand.name}
                onClick={() => setPage({ name: 'products' })}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-red-50 hover:border-red-200 border border-gray-100 rounded-xl transition-all group"
              >
                <span className="text-3xl">{brand.logo}</span>
                <span className="text-sm font-semibold text-gray-800 group-hover:text-red-600">{brand.name}</span>
                <span className="text-xs text-gray-400">{brand.count} vehicles</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('home.featured_cars', language)}</h2>
              <p className="text-gray-500 mt-1 text-sm">{t('home.hand_picked', language)}</p>
            </div>
            <button
              onClick={() => setPage({ name: 'products', filter: { type: 'car' } })}
              className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-600"
            >
              {t('home.view_all', language)} <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-52 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-5 bg-gray-200 rounded w-4/5" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCars.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} setPage={setPage} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Motorcycles Banner */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t('home.top_motorcycles', language)}</h2>
              <p className="text-gray-500 mt-1 text-sm">{t('home.best_bikes', language)}</p>
            </div>
            <button
              onClick={() => setPage({ name: 'products', filter: { type: 'motorcycle' } })}
              className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-600"
            >
              {t('home.view_all', language)} <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-52 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-5 bg-gray-200 rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBikes.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} setPage={setPage} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">{t('home.why_automart', language)}</h2>
            <p className="text-slate-400">{t('home.trusted_description', language)}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: t('home.verified_listings', language), desc: t('home.verified_desc', language) },
              { icon: Headphones, title: t('home.support_24_7', language), desc: t('home.support_desc', language) },
              { icon: TrendingUp, title: t('home.best_prices', language), desc: t('home.prices_desc', language) },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-red-500">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">{t('home.cta_title', language)}</h2>
          <p className="text-red-100 mb-8">{t('home.cta_subtitle', language)}</p>
          <button
            onClick={() => setPage({ name: 'products' })}
            className="bg-white text-red-600 font-bold px-8 py-3.5 rounded-xl hover:bg-red-50 transition-colors text-base"
          >
            {t('home.browse_all', language)}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Car className="w-5 h-5 text-red-400" />
            <span className="text-white font-bold">AutoMart Bangladesh</span>
          </div>
          <p className="text-sm">{t('home.footer', language)}</p>
          <p className="text-xs mt-2 text-slate-600">&copy; {new Date().getFullYear()} AutoMart Bangladesh. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
