export type AdminTab = 'dashboard' | 'vehicles' | 'bookings' | 'questions';

export type Page =
  | { name: 'home' }
  | { name: 'products'; filter?: { type?: string; condition?: string } }
  | { name: 'vehicle'; id: string }
  | { name: 'auth'; mode: 'login' | 'register' }
  | { name: 'bookings' }
  | { name: 'profile' }
  | { name: 'admin'; tab?: AdminTab };
