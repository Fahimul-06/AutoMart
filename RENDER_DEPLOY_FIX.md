# Dream Car Enterprise: Deployment repair

## Critical: DNS is outside the application

`DNS_PROBE_FINISHED_NXDOMAIN` means the Render hostname does not resolve. It is **not** a code error. Copy the exact `https://...onrender.com` URL from Render > Web Service > Overview. Test the domain root BEFORE adding a hash. The `VITE_ADMIN_LOGIN_HASH` variable only controls the browser route, not the hostname. If the exact Render URL gives NXDOMAIN, check the service status and Render support/DNS; no ZIP can fix the hostname.

## Existing Render Web Service settings

- Repository root: where this `package.json` resides.
- Node: 22.
- Build command: `npm run render:build`
- Start command: `npm run render:start`
- Health check: `/api/health`
- `MONGODB_URI`: MongoDB Atlas URI
- `JWT_SECRET`: randomly generated secret of at least 32 characters (server-only)
- `NODE_ENV`: `production`
- `VITE_ADMIN_LOGIN_HASH`: `/management_dash.com`
- `VITE_API_URL`: omit (API uses `/api` on the same domain)
- `DEMO_SEED_ON_START`: `true` only for initial demo inventory, then `false`

## One-time admin creation on Render (without a shell)

1. In Render > Environment temporarily set `ADMIN_BOOTSTRAP_ON_START=true`, `ADMIN_EMAIL=management@gmail.com` and `ADMIN_PASSWORD` to your NEW private strong password (>=12 chars).
2. Deploy, then check Render runtime logs for `Initial management account created` or `Management account already present`. The bootstrap NEVER resets an existing password.
3. Immediately REMOVE `ADMIN_PASSWORD` and set `ADMIN_BOOTSTRAP_ON_START=false`; redeploy to remove this secret from the running environment.
4. Open exact valid Render domain plus `/#/management_dash.com`; alternatively visit `/management_dash.com` which redirects to the hash route.

Do not commit `.env` or store admin secrets in `VITE_*` variables. Secure the service with MFA/strong passwords; initial bootstrap is not an account-recovery procedure.

## Tests

On a computer with dependencies available, run `npm install --prefix client --include=dev`, `npm install --prefix server`, `npm run verify`. The frontend typecheck and Vite production bundle must both pass before shipping.
