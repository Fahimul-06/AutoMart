import { useState } from 'react';
import { Car, Menu, X, ChevronDown, LogOut, BookOpen, ShoppingBag, User, Globe, Shield } from 'lucide-react';
import type { Page } from '../types';
import type { Profile } from '../lib/supabase';
import { useLanguage } from '../lib/language';
import { t } from '../lib/translations';

type Props = {
  page: Page;
  setPage: (p: Page) => void;
  user: { id: string; email: string } | null;
  profile: Profile | null;
  onSignOut: () => void;
};

export default function Navbar({ page, setPage, user, profile, onSignOut }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  const navLinks = [
    { label: t('nav.home', language), page: { name: 'home' } as Page },
    { label: t('nav.all_vehicles', language), page: { name: 'products' } as Page },
    { label: t('nav.cars', language), page: { name: 'products', filter: { type: 'car' } } as Page },
    { label: t('nav.motorcycles', language), page: { name: 'products', filter: { type: 'motorcycle' } } as Page },
  ];

  const isActive = (p: Page) => {
    if (p.name !== page.name) return false;
    if (p.name === 'products' && page.name === 'products') {
      const pf = (p as { name: 'products'; filter?: { type?: string } }).filter;
      const pagef = (page as { name: 'products'; filter?: { type?: string } }).filter;
      return (pf?.type ?? '') === (pagef?.type ?? '');
    }
    return true;
  };

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => { setPage({ name: 'home' }); setMenuOpen(false); }}
            className="flex items-center gap-2 group"
          >
            <div className="bg-red-500 rounded-lg p-1.5 group-hover:bg-red-400 transition-colors">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-lg tracking-tight">AutoMart</span>
              <span className="block text-xs text-slate-400 -mt-0.5">Bangladesh</span>
            </div>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => setPage(link.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.page)
                    ? 'bg-red-500 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language toggle */}
            <div className="flex items-center bg-slate-800 rounded-lg">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-l-lg ${
                  language === 'en'
                    ? 'bg-red-500 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-r-lg ${
                  language === 'bn'
                    ? 'bg-red-500 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                বাং
              </button>
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold">
                    {profile?.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-200">
                    {profile?.name ?? 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{profile?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { setPage({ name: 'profile' }); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" /> {t('nav.my_profile', language)}
                    </button>
                    <button
                      onClick={() => { setPage({ name: 'bookings' }); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <BookOpen className="w-4 h-4" /> {t('nav.my_bookings', language)}
                    </button>
                    {profile?.role === 'admin' && (
                      <button
                        onClick={() => { setPage({ name: 'admin' }); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Shield className="w-4 h-4" /> Admin Dashboard
                      </button>
                    )}
                    <button
                      onClick={() => { onSignOut(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> {t('nav.sign_out', language)}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setPage({ name: 'auth', mode: 'login' })}
                  className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {t('nav.login', language)}
                </button>
                <button
                  onClick={() => setPage({ name: 'auth', mode: 'register' })}
                  className="px-4 py-1.5 bg-red-500 hover:bg-red-400 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {t('nav.register', language)}
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => { setPage(link.page); setMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.page)
                    ? 'bg-red-500 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {link.label}
              </button>
            ))}
            {!user && (
              <div className="pt-2 border-t border-slate-700 flex gap-2">
                <button
                  onClick={() => { setPage({ name: 'auth', mode: 'login' }); setMenuOpen(false); }}
                  className="flex-1 px-4 py-2 text-sm text-slate-300 hover:text-white border border-slate-600 rounded-lg"
                >
                  {t('nav.login', language)}
                </button>
                <button
                  onClick={() => { setPage({ name: 'auth', mode: 'register' }); setMenuOpen(false); }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg"
                >
                  {t('nav.register', language)}
                </button>
              </div>
            )}
            {user && (
              <div className="pt-2 border-t border-slate-700 space-y-1">
                <button
                  onClick={() => { setPage({ name: 'profile' }); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
                >
                  <User className="w-4 h-4" /> {t('nav.my_profile', language)}
                </button>
                <button
                  onClick={() => { setPage({ name: 'bookings' }); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
                >
                  <BookOpen className="w-4 h-4" /> {t('nav.my_bookings', language)}
                </button>
                {profile?.role === 'admin' && (
                  <button
                    onClick={() => { setPage({ name: 'admin' }); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-amber-400 hover:text-amber-300 hover:bg-slate-700 rounded-lg"
                  >
                    <Shield className="w-4 h-4" /> Admin Dashboard
                  </button>
                )}
                <button
                  onClick={() => { onSignOut(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg"
                >
                  <LogOut className="w-4 h-4" /> {t('nav.sign_out', language)}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop for user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </nav>
  );
}
