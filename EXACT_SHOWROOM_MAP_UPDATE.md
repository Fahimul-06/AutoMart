# Exact showroom map update

The footer now uses the exact Google Maps embed URL supplied by the business owner for Dream Enterprise instead of an address search.

Files changed: `client/src/components/Layout.tsx`.

The external Open in Google Maps link opens the coordinates embedded in the submitted URL.

Keep your existing Render configuration and deploy the updated GitHub commit. Check that the map loads in a real browser.
