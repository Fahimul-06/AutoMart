# Dream Car Enterprise — Verified Booking PDF Receipts

## Admin setup
1. In Admin → Settings, set the **actual company trade license number** (never use placeholder data for receipts).
2. In Admin → Vehicles → Add/Edit, fill in **Chassis / VIN number** and **Engine serial number** for each vehicle. Both are stored with `select:false` and excluded from public vehicle APIs.
3. Customers must update their profile with a valid phone number and full postal address before submitting booking payment references.
4. Admin checks money was actually received, then sets booking payment status to **paid**. The system snapshots customer/vehicle/company fields, confirms booking, marks vehicle sold, and issues a receipt.
5. Customer opens **My Bookings → Download booking receipt (PDF)** or **Open / Print receipt**. The PDF is served through an authenticated API route.

## Security and behavior
- Payment reference submission alone never issues a receipt.
- `/api/bookings/:id/receipt` requires an authenticated booking owner or admin and paid status plus a saved receipt snapshot.
- The receipt snapshot preserves historical VIN/engine/license/customer details if those values change later.
- Old paid bookings created before this feature do not automatically get receipts; a separately audited migration would be needed.
- The server must install `pdfkit` from its updated `server/package.json` during the Render build.
- `client/src/vite-env.d.ts` and existing Render commands are unchanged.
- The printed receipt is evidence of advance payment, not proof of car ownership or vehicle title transfer.
- Ensure trade license, chassis and engine identifiers are entered accurately before verifying any payment.

## Render
Build: `npm run render:build`
Start: `npm run render:start`
No new environment variables are required. Existing MongoDB database is retained.

## QA checklist
Verify admin vehicle editor, hidden public vehicle identifiers, update profile address, submit payment, admin verify, download PDF, print PDF, deny receipt access before payment and to other customers.
