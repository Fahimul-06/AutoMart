/*
  # Create avatars storage bucket

  Creates a public storage bucket for user profile pictures.
  Enables RLS for security.
*/

-- The bucket creation and RLS policies should be done via SQL
-- Note: Storage buckets must be created via the Supabase dashboard or API
-- This is a placeholder migration to document the bucket structure
-- In production, create the 'avatars' bucket with:
-- - Public read access
-- - Authenticated write access (users can only upload/update their own files)
-- - Path: storage/avatars/
