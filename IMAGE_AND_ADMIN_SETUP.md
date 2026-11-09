# Dream Vehicle Enterprise — photos and administrator setup

## Vehicle images

Demo listings contain **remote illustrative Unsplash URLs**, not images uploaded to your Render application. Those links can fail or be blocked. This update adds `/vehicle-placeholder.svg` (bundled in the React build) as a reliable fallback in listing cards, detail galleries, admin inventory and bookings. It does not replace the existing MongoDB vehicle photo URLs. To use actual photos, edit each vehicle in the admin panel and use stable HTTPS image URLs from storage you control (for example S3/Cloudinary). The application currently stores URL strings, not uploaded image binaries.

After deploying, verify `https://YOUR-SERVICE.onrender.com/vehicle-placeholder.svg` loads. Check DevTools Network for any failed external images.

## Administrator login

Open `https://YOUR-SERVICE.onrender.com/login`. There is no separate `/admin/login` form. After an admin signs in, the application redirects to `/admin`.

**The backend does not create the admin merely because `ADMIN_EMAIL` exists in Render environment settings.** The admin account is inserted by `server/scripts/seed.js`. Run it once using the SAME `MONGODB_URI` database as the Render application. From a local clone: 

```sh
npm install --prefix server
# Create server/.env (never commit) with the live MONGODB_URI, ADMIN_EMAIL and a new ADMIN_PASSWORD (12+ characters)
npm run seed --prefix server
```

This seed also inserts the demo inventory, and creates global settings if absent. It does not replace the password of an existing admin. If you already seeded an old password, reset it using a separate securely authenticated process; changing ADMIN_PASSWORD does not reset existing credentials.

Use the normal customer sign-in page with the admin email and password chosen at seeding. Do NOT register the admin as a customer, do not publish passwords and do not add passwords to GitHub or frontend VITE_ variables.
