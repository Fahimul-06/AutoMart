# Dream Car Enterprise — Render One-Service Deployment

**Deploy the entire web app (React frontend + Express API) on a single Render Web Service** with MongoDB Atlas for persistence. This repository includes `render.yaml` in its root. The customer website and backend API share the same HTTPS origin (`https://YOUR-SERVICE.onrender.com`), so **Netlify is not required**.

## Quick production deployment

1. Create a MongoDB Atlas cluster and a least-privilege database user. Copy its `mongodb+srv://...` URI, URL-encoding reserved characters in its password. Add the necessary Atlas IP network access policy for Render egress. Consider secure fixed egress for stricter allowlisting.
2. Push the extracted project directory (the folder containing `render.yaml`) to a **private** GitHub repository. Do not commit `.env` files.
3. On [Render](https://dashboard.render.com), select **New → Blueprint**, select the GitHub repository, and approve the `dream-vehicle-enterprise` Web Service. Render uses **`npm run render:build`**, **`npm run render:start`**, and health check **`/api/health`**.
4. Set required secret `MONGODB_URI` in Render's environment form. `JWT_SECRET` is generated automatically by the Blueprint. `NODE_ENV=production` is configured. Render normally provides `RENDER_EXTERNAL_URL` automatically for origin validation; for a custom domain, add `CLIENT_ORIGIN=https://your-custom-domain.example` to the service environment. Set `PORT` only if necessary; Render sets it by default.
5. Deploy and visit `https://YOUR-SERVICE.onrender.com/api/health`. It should show `{ "status": "ready" }`, then open the base URL for the website.
6. **One-time initial database seed:** From a trusted machine with access to Atlas, configure `server/.env` with the *same* `MONGODB_URI`, `ADMIN_EMAIL=management@gmail.com`, and a **private, unique 12+ character** `ADMIN_PASSWORD`, then run `npm install --prefix server` and `npm run seed --prefix server`. This seeds the admin account and 30 demo vehicles (five illustrative stock-image links each). `JWT_SECRET` is not needed for this seed. No live login works before seeding. The seed does not overwrite a previously created admin password.
7. Log in at `/login`; the administrator dashboard is `/admin`. Replace demo photographs and listings with genuine licensed images and real inventory before advertising.

**Production environment variables** (set at Render → Environment, *not* in Git or `client/.env`):

| Variable | Required | Meaning |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB Atlas application URI |
| `JWT_SECRET` | Yes | Render Blueprint-generated random signing key (32+ characters) |
| `NODE_ENV` | Yes | `production` |
| `RENDER_EXTERNAL_URL` | Automatic on Render | Hosted public origin for CORS/CSRF origin checks |
| `CLIENT_ORIGIN` | Only if adding custom domains | Comma-separated additional trusted HTTPS origins |
| `DEFAULT_INTEREST_RATE` | Optional | Seed-time initial annual interest rate, defaults to 10% |
| `DEFAULT_BOOKING_AMOUNT` | Optional | Seed-time booking amount, defaults to ৳10,000 |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed script only | Seed administrator credentials; never expose to frontend or commit |

To generate a secure JWT secret locally: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

**Running locally:** Copy `server/.env.example` to `server/.env`, edit the fields, then `npm install`, `npm run install:all`, `npm run seed`, and `npm run dev`. Vite serves port 5173, Express API port 5000. **Render builds everything automatically:** no frontend environment file is needed; API requests use relative `/api` paths.

**Important:** This is deploy-configured application source, not a fully audited commercial payment system. Booking payment references are submitted for staff review only; there is no live payment capture or automated confirmation. Use an approved bank/PSP checkout integration, verified callbacks, audit logs, user verification, inventory hold logic, backup/restore, and production monitoring before receiving real money. Demo Unsplash pictures are illustrative rather than guaranteed accurate photos of the listed models.

---

## Additional developer notes

## API

Public: `GET /api/health`, `GET /api/vehicles?page=1&limit=12`, `GET /api/vehicles/:id`, `GET /api/settings`.

Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.

Customer: `POST /api/bookings`, `GET /api/bookings/mine`, `POST /api/bookings/:id/payment`.

Admin: `GET /api/vehicles/admin/list`, `POST /api/vehicles`, `PUT /api/vehicles/:id`, `DELETE /api/vehicles/:id`, `GET /api/bookings`, `PATCH /api/bookings/:id`, `PUT /api/settings`.

## Finance

Monthly reducing-balance EMI at fixed nominal annual interest rate: `P = vehicle_price × (1 − down_percent/100)`, `r = annual_rate / 1200`, `n = years × 12`, `EMI = P × r/(1 − (1+r)^(-n))` (zero rate: `P/n`). Booking amount is separate from the down payment, and its credit toward the final price requires the dealer's documented policy.

## Demo vehicles for an existing Render Web Service

**Fastest option:** Render dashboard → your Web Service → **Environment** → add
`DEMO_SEED_ON_START=true`, save and redeploy/restart. Once MongoDB connects, the backend
will **insert 30 example listings** (five *illustrative* gallery URLs per listing). Existing
matching records are not overwritten. Once inserted, switch the variable back to `false`
for normal operation. This setting **does not create an admin account**.

Alternatively run `npm run seed:demo` locally with `MONGODB_URI` set in `server/.env`.
The existing `npm run seed` creates the administrator (if needed) **and** example inventory.
Neither command should be used as a replacement for a real inventory import. Demo listings
are explicitly marked, and illustrative gallery images are **not verified make/model photos**.
Do not collect booking payments for demonstration listings.

This update also adds `client/src/vite-env.d.ts` to fix missing `import.meta.env` TypeScript types.
