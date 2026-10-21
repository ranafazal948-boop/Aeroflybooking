# AeroFly UK

The repository previously contained only an incomplete project guide, with no deployable entry page or application files. This recovery provides a standalone, responsive AeroFly UK website in `public/` and an explicit Netlify publish configuration. No build command or package installation is needed.

The homepage supports UK airport selection, route swapping, departure date validation, traveller selection, and links to suggested routes. Submitting a search navigates to Google Flights with the selected search terms. Availability, prices, and bookings must be confirmed with the provider. This website does not process payments, issue tickets, or implement the incomplete guide's owner portal.

Netlify publishes only `public/`, keeping the original project guide outside the published website. A fallback serves the homepage for direct navigation paths.
