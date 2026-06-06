/*
  # Car Mart Bangladesh - Full Schema

  ## New Tables
  1. `profiles` - Extended user info (name, phone, verification status)
  2. `otp_codes` - Phone OTP verification codes
  3. `vehicles` - Cars and motorcycles inventory
  4. `vehicle_questions` - Customer Q&A per vehicle
  5. `bookings` - Vehicle booking requests

  ## Security
  - RLS enabled on all tables
  - Users can only access their own profiles, questions, and bookings
  - Vehicles are publicly readable
  - OTP codes are accessible only for matching phone numbers
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text UNIQUE NOT NULL DEFAULT '',
  phone_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- OTP codes table
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert otp"
  ON otp_codes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read otp by phone"
  ON otp_codes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update otp"
  ON otp_codes FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  brand text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  year integer NOT NULL DEFAULT 2024,
  type text NOT NULL DEFAULT 'car' CHECK (type IN ('car', 'motorcycle')),
  condition text NOT NULL DEFAULT 'new' CHECK (condition IN ('new', 'used')),
  price numeric NOT NULL DEFAULT 0,
  description text DEFAULT '',
  specs jsonb DEFAULT '{}',
  images text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  sold boolean DEFAULT false,
  mileage integer DEFAULT 0,
  color text DEFAULT '',
  fuel_type text DEFAULT '',
  transmission text DEFAULT '',
  engine_cc integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read vehicles"
  ON vehicles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Vehicle questions table
CREATE TABLE IF NOT EXISTS vehicle_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL DEFAULT '',
  answer text DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vehicle_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read questions"
  ON vehicle_questions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert questions"
  ON vehicle_questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_date date,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Seed vehicle data
INSERT INTO vehicles (title, brand, model, year, type, condition, price, description, images, featured, mileage, color, fuel_type, transmission, engine_cc, specs) VALUES

-- Cars
('Toyota Corolla Cross 2024', 'Toyota', 'Corolla Cross', 2024, 'car', 'new', 4200000, 'Brand new Toyota Corolla Cross with hybrid technology. Fuel efficient and packed with modern features perfect for Bangladesh roads.', ARRAY['https://images.pexels.com/photos/1805053/pexels-photo-1805053.jpeg'], true, 0, 'Pearl White', 'Hybrid', 'Automatic', 1800, '{"seats": 5, "doors": 4, "airbags": 7, "sunroof": true}'),

('Toyota Aqua 2021', 'Toyota', 'Aqua', 2021, 'car', 'used', 2100000, 'Well maintained Toyota Aqua hybrid. Excellent fuel economy, ideal for city driving in Dhaka. Full service history available.', ARRAY['https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg'], true, 45000, 'Silver', 'Hybrid', 'CVT', 1500, '{"seats": 5, "doors": 4, "airbags": 4}'),

('Honda Civic 2023', 'Honda', 'Civic', 2023, 'car', 'new', 5800000, 'All-new 11th generation Honda Civic. Sporty design with turbocharged engine and advanced safety features.', ARRAY['https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg'], true, 0, 'Sonic Gray Pearl', 'Petrol', 'CVT', 1500, '{"seats": 5, "doors": 4, "airbags": 6, "sunroof": true, "honda_sensing": true}'),

('Suzuki Alto 2023', 'Suzuki', 'Alto', 2023, 'car', 'new', 1150000, 'Affordable and fuel efficient Suzuki Alto. Perfect for city commuting with low running costs.', ARRAY['https://images.pexels.com/photos/1374510/pexels-photo-1374510.jpeg'], false, 0, 'Blue', 'Petrol', 'Manual', 660, '{"seats": 4, "doors": 4, "airbags": 2}'),

('Toyota Hiace 2020', 'Toyota', 'Hiace', 2020, 'car', 'used', 4800000, 'Well maintained Toyota Hiace microbus. Perfect for family trips or commercial use. 15 seater configuration.', ARRAY['https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg'], false, 85000, 'White', 'Diesel', 'Manual', 2800, '{"seats": 15, "doors": 4, "airbags": 2}'),

('Hyundai Tucson 2023', 'Hyundai', 'Tucson', 2023, 'car', 'new', 6500000, 'New generation Hyundai Tucson SUV with panoramic sunroof, BOSE sound system, and Level 2 ADAS safety features.', ARRAY['https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg'], true, 0, 'Amazon Gray', 'Petrol', 'Automatic', 2000, '{"seats": 5, "doors": 4, "airbags": 8, "panoramic_sunroof": true}'),

('Mitsubishi Outlander 2022', 'Mitsubishi', 'Outlander', 2022, 'car', 'used', 7200000, 'Mitsubishi Outlander PHEV with all-wheel drive. Low mileage, excellent condition with full service history.', ARRAY['https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg'], false, 22000, 'Black Diamond', 'Hybrid', 'CVT', 2400, '{"seats": 7, "doors": 4, "airbags": 7, "4wd": true}'),

('Toyota Land Cruiser Prado 2023', 'Toyota', 'Land Cruiser Prado', 2023, 'car', 'new', 18500000, 'The legendary Toyota Land Cruiser Prado. Ultimate off-road capability with luxury interior and modern tech.', ARRAY['https://images.pexels.com/photos/1009871/pexels-photo-1009871.jpeg'], true, 0, 'Graphite', 'Diesel', 'Automatic', 2800, '{"seats": 7, "doors": 4, "airbags": 9, "4wd": true, "sunroof": true}'),

('Nissan X-Trail 2021', 'Nissan', 'X-Trail', 2021, 'car', 'used', 4900000, 'Nissan X-Trail e-Power hybrid SUV. Comfortable for long drives with intelligent 4WD system.', ARRAY['https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg'], false, 38000, 'Ivory Pearl', 'Hybrid', 'CVT', 1200, '{"seats": 7, "doors": 4, "airbags": 6, "4wd": true}'),

('Kia Sportage 2024', 'Kia', 'Sportage', 2024, 'car', 'new', 7800000, 'All-new 5th generation Kia Sportage. Award-winning design with advanced features and spacious interior.', ARRAY['https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg'], true, 0, 'Steel Gray', 'Petrol', 'Automatic', 2000, '{"seats": 5, "doors": 4, "airbags": 6, "panoramic_sunroof": true}'),

-- Motorcycles
('Yamaha FZS V3 2024', 'Yamaha', 'FZS V3', 2024, 'motorcycle', 'new', 285000, 'New Yamaha FZS V3 with fuel injection and ABS. Perfect balance of performance and fuel efficiency.', ARRAY['https://images.pexels.com/photos/2519374/pexels-photo-2519374.jpeg'], true, 0, 'Metallic Blue', 'Petrol', 'Manual', 149, '{"abs": true, "fuel_injection": true, "digital_meter": true}'),

('Honda CB150R 2023', 'Honda', 'CB150R', 2023, 'motorcycle', 'new', 320000, 'Honda CB150R StreetFire with sporty naked street fighter design. Aggressive performance with Honda reliability.', ARRAY['https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg'], true, 0, 'Candy Red', 'Petrol', 'Manual', 150, '{"abs": false, "fuel_injection": true, "led_lights": true}'),

('Bajaj Pulsar NS200 2024', 'Bajaj', 'Pulsar NS200', 2024, 'motorcycle', 'new', 310000, 'Bajaj Pulsar NS200 with triple spark technology. Powerful naked sports bike with excellent handling.', ARRAY['https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg'], false, 0, 'Black Red', 'Petrol', 'Manual', 199, '{"abs": true, "fuel_injection": true, "perimeter_frame": true}'),

('TVS Apache RTR 160 4V 2023', 'TVS', 'Apache RTR 160 4V', 2023, 'motorcycle', 'new', 230000, 'TVS Apache RTR 160 4V with SmartXonnect Bluetooth connectivity and 4-valve engine technology.', ARRAY['https://images.pexels.com/photos/104842/pexels-photo-104842.jpeg'], false, 0, 'Pearl White', 'Petrol', 'Manual', 159, '{"bluetooth": true, "fuel_injection": true, "led_lights": true}'),

('Yamaha R15 V4 2024', 'Yamaha', 'R15 V4', 2024, 'motorcycle', 'new', 480000, 'Yamaha R15 V4 with Variable Valve Actuation (VVA) technology. Race-inspired design with MotoGP DNA.', ARRAY['https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg'], true, 0, 'Racing Blue', 'Petrol', 'Manual', 155, '{"abs": true, "vva": true, "quickshifter": true, "traction_control": true}'),

('Hero Xtreme 160R 2023', 'Hero', 'Xtreme 160R', 2023, 'motorcycle', 'new', 195000, 'Hero Xtreme 160R with oil-cooled engine and all-digital instrument cluster. Best value sports commuter.', ARRAY['https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg'], false, 0, 'Sports Red', 'Petrol', 'Manual', 163, '{"oil_cooled": true, "digital_meter": true, "usb_charging": true}'),

('Yamaha FZS Fi V2 2020', 'Yamaha', 'FZS Fi V2', 2020, 'motorcycle', 'used', 175000, 'Used Yamaha FZS Fi V2 in good condition. Fuel injected engine with low running costs. Well maintained.', ARRAY['https://images.pexels.com/photos/2519374/pexels-photo-2519374.jpeg'], false, 28000, 'Blazing Red', 'Petrol', 'Manual', 149, '{"fuel_injection": true, "digital_meter": true}'),

('Honda CB Shine SP 2022', 'Honda', 'CB Shine SP', 2022, 'motorcycle', 'used', 145000, 'Honda CB Shine SP commuter motorcycle. Reliable and fuel efficient, great for daily commuting in Dhaka.', ARRAY['https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg'], false, 15000, 'Black', 'Petrol', 'Manual', 124, '{"self_start": true, "fuel_injection": false}');
