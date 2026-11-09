# Hero + management URL update

This build uses the uploaded Dream Car Enterprise banner as its full-width homepage hero. The previous “DISCOVER YOUR NEXT DRIVE / Drive something extraordinary” overlay has been removed. The image has been encoded as optimized WebP for faster loading.

## Render Web Service

Keep Root Directory blank, Build Command `npm run render:build`, Start Command `npm run render:start`. In **Render → Environment** set:

`VITE_ADMIN_LOGIN_HASH=/management_dash.com`

After setting this, click **Manual Deploy → Clear build cache & deploy**. Visit:

`https://YOUR-SERVICE.onrender.com/#/management_dash.com`

The hash is matched exactly, and it does **not** work by typing `/#/management_dash.com` into a search engine; paste the complete address into your browser address bar.

To change the URL, change `VITE_ADMIN_LOGIN_HASH` to `/your-new-route` in Render and redeploy (Vite env vars are embedded at build time). It is not a secret; admin access is enforced by the server's role authorization.

Admin account must already be seeded into MongoDB; the route alone doesn't create an account.
