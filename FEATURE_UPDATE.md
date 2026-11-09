# Dream Car Enterprise — vehicle photos, booking finance and customer profile

- Admin vehicle editor: drag and drop or browse photo files. Add multiple pictures, reorder first/cover image, remove pictures, paste optional HTTPS URLs.
- Files are decoded and resized to WebP by Sharp and stored persistently in MongoDB GridFS (no Render ephemeral disk).
- Server enforces session + admin role, image type, 7 MB upload limit per photo, maximum 8 images per request, and 20 images per vehicle.
- Admin bookings show a linked vehicle details page, original booked cash price or loan down payment, borrowed principal, loan tenure, interest rate, EMI.
- Customer profile is available at /profile to view email and edit name/phone.
- Original customer bookings and admin-managed interest rate are unchanged.

## Deploy
Keep the existing Render service and MongoDB connection. Upload changed project source to GitHub, then use:
Build: npm run render:build
Start: npm run render:start
The server needs new dependencies `multer` and `sharp` (included in server/package.json); install them at build time.
No new environment variables are required. Uploaded images are persisted in the same MongoDB Atlas database, so storage usage grows and must be monitored.

Caution: deleting a photo from a vehicle's list does not delete its GridFS binary. Periodic cleanup should be scheduled for unused uploads. Online booking payments remain manual reference verification.
