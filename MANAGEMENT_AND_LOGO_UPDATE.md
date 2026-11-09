# Dream Vehicle Enterprise — custom logo and management login

## Management portal

- Administrator URL: `https://YOUR-RENDER-DOMAIN/#/management_dash.com`
- Public customer login remains at `/login`.
- `/admin` redirects to the public homepage.
- The management URL uses the original `/auth/login` endpoint and requires `role: admin`. All admin APIs still require backend authentication and the admin middleware.
- **The obscured URL alone is NOT security.** Keep the JWT secret private, use strong passwords, and consider implementing MFA and rate limiting before commercial operation.

## Logo

The user's provided transparent logo is bundled in `client/public/dream-car-enterprise-logo.webp`. It appears in the public header, footer, customer sign-in page, and dedicated management login screen. A cropped icon appears as the browser favicon.

## Render deployment

Use the same Web Service and existing environment variables:
- Build command: `npm run render:build`
- Start command: `npm run render:start`

Commit the modified source files to GitHub, then deploy the new commit in Render. No MongoDB data migration or new environment variables are necessary.

## Administrator account

The management URL does not create an admin automatically. An administrator must already exist in MongoDB from your earlier seed setup. Never commit an admin password or `.env` file.
