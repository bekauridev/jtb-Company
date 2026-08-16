# JTB Company Demo

A responsive Georgian storefront demonstration for JTB Company, built with React and Vite.

## Included views

- `/` — product catalogue, filtering, product details, cart, and demo checkout
- `/admin` — editable product catalogue and demonstration order dashboard
- `/notification` — desktop and mobile web-push presentation examples

Catalogue edits are stored in the browser with `localStorage`, making the project suitable for client demonstrations without a backend.

## Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run build
npm run lint
npm run test:e2e
```

The project is for demonstration purposes. Checkout and notifications do not send real orders or external messages.
