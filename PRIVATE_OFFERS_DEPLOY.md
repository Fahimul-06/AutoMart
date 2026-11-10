# Dream Car Enterprise — Private offer and selection workflow

## Overview

This release adds private customer offers with a maximum of three submissions per customer per vehicle. The second offer becomes possible **4 hours after the first**; the third becomes possible **6 hours after the second**, provided the vehicle is still available and no customer is selected. Customer offer prices are returned only to their own account and to authenticated management users.

Management can review all offers under **Management → Offers** and select one offer for a vehicle. The selection atomically changes the vehicle's inventory status from `available` to `reserved` and creates a customer booking with a **3-hour deadline** to submit the booking payment reference. The chosen customer's booking appears under **My bookings** and a notification banner appears while they browse the website (polling every 20 seconds).

If no reference is submitted before the deadline, the selection expires, the booking is cancelled and the vehicle becomes available again. The server checks on relevant requests and runs a sweep every minute. Existing non-selected customer offers stay pending.

### Payment verification policy

This website currently supports only manual merchant payment instructions and transaction-reference submission. A transaction ID does **not** prove the merchant received money. Consequently:

- Before selection: `available`, new offers permitted.
- After selection: `reserved`, no new offers, 3-hour deadline.
- Reference submitted in time: remains `reserved` while management verifies the actual payment. Offers stay closed.
- Management verifies the funds: changes to `sold`; competing offers become declined.
- Management rejects the payment: reopens as `available` and other customers can offer.
- Selected customer misses the deadline: reopens as `available` and their booking becomes cancelled.

If automatic payment confirmation is required, integrate a merchant payment provider with server-side payment callbacks, idempotency and signature verification.

## Files changed

- New `server/src/models/Offer.js`, `server/src/routes/offers.js`, `server/src/utils/offerLifecycle.js`, `server/src/utils/offerRules.js`.
- Server `Booking`, `Vehicle`, API routing and admin payment verification updated.
- New `client/src/components/OfferPanel.tsx`, `AdminOffers.tsx`, `OfferNotification.tsx`.
- `Detail.tsx` replaces direct reservation with offer submission. `Admin.tsx` adds Offers tab. `Bookings.tsx` displays customer deadline and payment instructions. `Layout.tsx` shows a selected-offer notification.
- Added `server/tests/offerRules.test.js`.

## Deploy to existing Render service

1. Upload all files from this archive into the existing GitHub repository **preserving paths**. Do not upload local `.env` files.
2. Keep Render build command: `npm run render:build`.
3. Keep Render start command: `npm run render:start`.
4. Keep your existing `MONGODB_URI`, `JWT_SECRET`, `PUBLIC_ORIGIN`, and any SMTP credentials.
5. Deploy the updated GitHub commit. MongoDB/Mongoose will create the new `offers` collection automatically on first offer.
6. Test with two different **customer accounts** and one admin account. Submit offers, select one and check the My Bookings banner/payment reference flow.
7. For time-window testing, use test-only seed data in an isolated staging database; do **not** change server clock or payment expiry in production.

## Security and operational notes

- Offer values are never included in public vehicle routes.
- Customer API access filters offers by authenticated customer ID.
- Admin offer review requires backend admin authorization.
- The selected booking's financing calculation uses the **accepted offer amount**, not the originally advertised price.
- Inventory exclusivity is protected by an atomic conditional MongoDB update when the admin selects a customer.
- MongoDB transactions are recommended before high-concurrency paid use to make selection, booking creation and payment state changes fully atomic across collections.
- No email/SMS/push notifications are implemented for offers; notifications are in-app while the site is open.
- Existing legacy bookings remain in the database; new direct `/api/bookings` reservations are rejected in favor of offers.

## Verification

`node --test server/tests/*.test.js`: 10/10 passed.
Backend `node --check`: passed.
Frontend TS/TSX syntax parsing: passed.
Full dependency-backed Vite production build: **not verified** because dependency installation timed out in this environment.
Live MongoDB/Render, payment gateway and browser flows: **not verified**.
