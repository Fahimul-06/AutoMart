ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- Allow admin role to be read by authenticated users (needed for client-side check)
CREATE POLICY "select_own_profile_admin" ON profiles FOR SELECT
  TO authenticated USING (true);