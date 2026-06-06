import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, Car, Bike } from 'lucide-react';
import { supabase, type Vehicle } from '../lib/supabase';
import type { Page } from '../types';
import VehicleCard from '../components/VehicleCard';
import { useLanguage } from '../lib/language';
import { t } from '../lib/translations';

type Props = {
  initialFilter?: { type?: string; condition?: string };
  setPage: (p: Page) => void;
};

type SortOption = 'price_asc' | 'price_desc' | 'year_desc' | 'year_asc' | 'newest';

const BRANDS = ['Toyota', 'Honda', 'Suzuki', 'Mitsubishi', 'Hyundai', 'Nissan', 'Kia', 'Yamaha', 'Bajaj', 'TVS', 'Hero'];

export default function ProductsPage({ initialFilter, setPage }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(initialFilter?.type ?? '');
  const [conditionFilter, setConditionFilter] = useState(initialFilter?.condition ?? '');
  const [brandFilter, setBrandFilter] = useState('');
  const [yearMin, setYearMin] = useState('');
  const [yearMax, setYearMax] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const { language } = useLanguage();

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('vehicles').select('*', { count: 'exact' });

    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`);
    }
    if (typeFilter) query = query.eq('type', typeFilter);
    if (conditionFilter) query = query.eq('condition', conditionFilter);
    if (brandFilter) query = query.eq('brand', brandFilter);
    if (yearMin) query = query.gte('year', parseInt(yearMin));
    if (yearMax) query = query.lte('year', parseInt(yearMax));
    if (priceMin) query = query.gte('price', parseInt(priceMin));
    if (priceMax) query = query.lte('price', parseInt(priceMax));

    switch (sortBy) {
      case 'price_asc': query = query.order('price', { ascending: true }); break;
      case 'price_desc': query = query.order('price', { ascending: false }); break;
      case 'year_desc': query = query.order('year', { ascending: false }); break;
      case 'year_asc': query = query.order('year', { ascending: true }); break;
      default: query = query.order('created_at', { ascending: false });
    }

    const { data, count } = await query;
    setVehicles(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [search, typeFilter, conditionFilter, brandFilter, yearMin, yearMax, priceMin, priceMax, sortBy]);

  useEffect(() => {
    setTypeFilter(initialFilter?.type ?? '');
    setConditionFilter(initialFilter?.condition ?? '');
  }, [initialFilter]);

  useEffect(() => {
    const timer = setTimeout(() => { loadVehicles(); }, 300);
    return () => clearTimeout(timer);
  }, [loadVehicles]);

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setConditionFilter('');
    setBrandFilter('');
    setYearMin('');
    setYearMax('');
    setPriceMin('');
    setPriceMax('');
    setSortBy('newest');
  };

  const hasActiveFilters = typeFilter || conditionFilter || brandFilter || yearMin || yearMax || priceMin || priceMax;

  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'sort_newest' },
    { value: 'price_asc', label: 'sort_price_low' },
    { value: 'price_desc', label: 'sort_price_high' },
    { value: 'year_desc', label: 'sort_year_new' },
    { value: 'year_asc', label: 'sort_year_old' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-slate-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">{t('products.all_vehicles', language)}</h1>
          <p className="text-slate-400">{t('products.browse_inventory', language)}</p>

          {/* Search bar */}
          <div className="mt-6 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('products.search_placeholder', language)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick type filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setTypeFilter('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!typeFilter ? 'bg-slate-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-slate-400'}`}
          >
            {t('products.all', language)}
          </button>
          <button
            onClick={() => setTypeFilter('car')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${typeFilter === 'car' ? 'bg-slate-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-slate-400'}`}
          >
            <Car className="w-4 h-4" /> {t('nav.cars', language)}
          </button>
          <button
            onClick={() => setTypeFilter('motorcycle')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${typeFilter === 'motorcycle' ? 'bg-slate-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-slate-400'}`}
          >
            <Bike className="w-4 h-4" /> {t('nav.motorcycles', language)}
          </button>
          <button
            onClick={() => setConditionFilter('new')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${conditionFilter === 'new' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-400'}`}
          >
            {t('products.new', language)}
          </button>
          <button
            onClick={() => setConditionFilter('used')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${conditionFilter === 'used' ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-400'}`}
          >
            {t('products.used', language)}
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${showFilters || hasActiveFilters ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-200 hover:border-red-400'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t('products.filters', language)}
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm pl-4 pr-8 py-2 rounded-full focus:outline-none focus:border-slate-400"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{t(`products.${o.label}`, language)}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Advanced filters panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{t('products.advanced_filters', language)}</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-red-500 hover:underline">{t('products.clear_all', language)}</button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('products.brand', language)}</label>
                <select
                  value={brandFilter}
                  onChange={e => setBrandFilter(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="">{t('products.all', language)} {t('products.brand', language).toLowerCase()}</option>
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('products.year_range', language)}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={yearMin}
                    onChange={e => setYearMin(e.target.value)}
                    placeholder={t('products.from', language)}
                    min="1990" max="2025"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <input
                    type="number"
                    value={yearMax}
                    onChange={e => setYearMax(e.target.value)}
                    placeholder={t('products.to', language)}
                    min="1990" max="2025"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('products.price_bdt', language)}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={priceMin}
                    onChange={e => setPriceMin(e.target.value)}
                    placeholder={t('products.min', language)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <input
                    type="number"
                    value={priceMax}
                    onChange={e => setPriceMax(e.target.value)}
                    placeholder={t('products.max', language)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('products.condition', language)}</label>
                <div className="flex gap-2">
                  {['new', 'used'].map(c => (
                    <button
                      key={c}
                      onClick={() => setConditionFilter(conditionFilter === c ? '' : c)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors border ${
                        conditionFilter === c
                          ? c === 'new' ? 'bg-green-500 text-white border-green-500' : 'bg-amber-500 text-white border-amber-500'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {t(`products.${c}`, language)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {loading ? t('products.loading', language) : `${total} ${t('products.found', language)}`}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-red-500 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> {t('products.clear_all', language)}
            </button>
          )}
        </div>

        {/* Vehicle Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-52 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-5 bg-gray-200 rounded w-4/5" />
                  <div className="h-4 bg-gray-200 rounded w-3/5" />
                  <div className="h-6 bg-gray-200 rounded w-2/5" />
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('products.no_results', language)}</h3>
            <p className="text-gray-400 text-sm mb-4">{t('products.try_adjusting', language)}</p>
            <button onClick={clearFilters} className="text-red-500 font-medium hover:underline text-sm">
              {t('products.clear_all', language)}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} setPage={setPage} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
