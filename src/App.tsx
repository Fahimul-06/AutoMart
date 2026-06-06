import { useState, useEffect, useCallback } from 'react';
import { supabase, type Profile } from './lib/supabase';
import type { Page } from './types';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import AuthPage from './pages/AuthPage';
import BookingsPage from './pages/BookingsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [page, setPage] = useState<Page>({ name: 'home' });
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (data) setProfile(data);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? '' });
        loadProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email ?? '' });
          await loadProfile(session.user.id);
          if (event === 'SIGNED_IN') setPage({ name: 'home' });
        } else {
          setUser(null);
          setProfile(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setPage({ name: 'home' });
  };

  const handleProfileUpdate = () => {
    if (user) loadProfile(user.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        page={page}
        setPage={setPage}
        user={user}
        profile={profile}
        onSignOut={handleSignOut}
      />
      <main>
        {page.name === 'home' && (
          <HomePage setPage={setPage} />
        )}
        {page.name === 'products' && (
          <ProductsPage initialFilter={page.filter} setPage={setPage} />
        )}
        {page.name === 'vehicle' && (
          <VehicleDetailPage vehicleId={page.id} user={user} setPage={setPage} />
        )}
        {page.name === 'auth' && (
          <AuthPage initialMode={page.mode} setPage={setPage} />
        )}
        {page.name === 'bookings' && (
          <BookingsPage user={user} setPage={setPage} />
        )}
        {page.name === 'profile' && user && (
          <ProfilePage user={user} profile={profile} setPage={setPage} onProfileUpdate={handleProfileUpdate} />
        )}
        {page.name === 'admin' && user && (
          <AdminPage user={user} profile={profile} initialTab={page.tab} setPage={setPage} />
        )}
      </main>
    </div>
  );
}
