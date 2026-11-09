# Dream Car Enterprise: blank footer map fix

## Cause
The Express server uses Helmet, whose default Content-Security-Policy has `frame-src: self`. That blocks the external Google Maps iframe in the footer. Some third-party vehicle photos can likewise be blocked by its default `img-src` policy.

## Changes
- `server/src/index.js`: allow only `https://www.google.com` and `https://maps.google.com` as external iframe origins; allow HTTPS vehicle photos. Other Helmet protections remain.
- `client/src/components/Layout.tsx`: use the standard Google Maps embed query with zoom 16.

## Deploy
Upload both changed files to the same paths in GitHub and redeploy your existing Render Web Service. Keep build `npm run render:build` and start `npm run render:start`. Hard refresh after deployment. No .env changes required.

## If the embed still does not render
Check DevTools Console for Content-Security-Policy errors and test opening the footer's **Open in Google Maps** link. Google Maps embedding may be restricted by browser privacy, ad blockers, or network access. The link remains available. The address is a search query, not a verified precise map pin.
