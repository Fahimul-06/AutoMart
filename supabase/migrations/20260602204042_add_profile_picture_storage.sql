/*
  # Add profile picture URL to profiles

  Adds an avatar_url column to store the profile picture URL.
  Also adds last_password_change to track password updates.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_password_change'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_password_change timestamptz DEFAULT now();
  END IF;
END $$;
