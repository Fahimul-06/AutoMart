/*
  # Add email column to profiles

  Adds an email column to the profiles table so phone-based login can
  look up the associated email address.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text DEFAULT '';
  END IF;
END $$;
