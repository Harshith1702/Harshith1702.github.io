# Harshith Padakanti - Portfolio

Personal portfolio and systems engineering showcase. Built as a static site with a small Node.js server for local development and a unique visitor counter.

## Stack

- HTML, CSS, and vanilla JavaScript for the site
- Node.js (>= 18) for the local server and visitor counter
- Vercel / Render / GitHub Pages for deployment

## Getting started

```bash
npm install
npm start
```

The site runs at http://localhost:3000.

## Scripts

- `npm start` - run the local server
- `npm run dev` - same as start
- `npm test` - run the security and link checks
- `npm run build` - generate the deployable `public/` directory

## Deployment

- Vercel: uses `build-public.js` to populate `public/` and serves it as the output directory.
- Render: runs `node server.js` with `TRUST_PROXY=1`.
- GitHub Pages: deploy the contents of `public/`.

## Notes

- Visitor data is stored in `data/visitors.json` and is intentionally gitignored.
- The `public/` directory is generated and gitignored. Run `npm run build` to recreate it.
- The Wednesday Addams Thing companion in the UI is preserved as-is.