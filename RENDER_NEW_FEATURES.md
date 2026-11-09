# Dream Car Enterprise update — deployment

Update files in the **existing** GitHub repository, retaining the root `package.json`, client and server folders. Existing MongoDB documents are not deleted.

Render build: `npm run render:build`  
Render start: `npm run render:start`

## Password reset email
Set these **private** Render environment values: `PUBLIC_ORIGIN` (exact https Render URL), `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`. The forgot-password endpoint returns a generic message when SMTP is not configured, but cannot send email. Never expose SMTP secrets using `VITE_` variables. Check spam and provider SMTP restrictions.

## Features
Admin Finance settings now include merchant Bank/bKash/Nagad account entries and home hero slideshow photos (up to 12 banners, 3–20 seconds per slide). Uploaded images use existing GridFS service. Customers see configured payment details in My Bookings and provide a transaction ID for manual verification. There is NO automatic payment verification or charge capture. Do not advertise a completed transaction until admin verifies it independently. Admin bookings have an alert count, refreshed every 20 seconds while dashboard is open (not push notifications when closed). Customer profile has a password-change form; password changes sign out the current browser. Password-reset links expire after 15 minutes.

The frontend /vehicles search supports minimum/maximum prices, more manufacturers, model year and loan tenure 1–6 years. Changing annual interest only affects new bookings.
