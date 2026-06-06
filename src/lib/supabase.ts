import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone_verified: boolean;
  avatar_url: string;
  last_password_change: string;
  role: 'user' | 'admin';
  created_at: string;
};

export type Vehicle = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  type: 'car' | 'motorcycle';
  condition: 'new' | 'used';
  price: number;
  description: string;
  specs: Record<string, unknown>;
  images: string[];
  featured: boolean;
  sold: boolean;
  mileage: number;
  color: string;
  fuel_type: string;
  transmission: string;
  engine_cc: number;
  created_at: string;
};

export type VehicleQuestion = {
  id: string;
  vehicle_id: string;
  user_id: string;
  question: string;
  answer: string | null;
  created_at: string;
};

export type Booking = {
  id: string;
  vehicle_id: string;
  user_id: string;
  preferred_date: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
  created_at: string;
};
