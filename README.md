# Harshith Padakanti - Portfolio

Personal portfolio and systems engineering showcase. Built as a static site with a small Node.js server for local development and a unique visitor counter.

## Stack

- HTML, CSS, and vanilla JavaScript for the site
- Node.js (>= 18) for the local server and visitor counter
- Vercel / Render / GitHub Pages for deployment

## Getting started

`ash
npm install
npm start
`

The site runs at http://localhost:3000.

## Scripts

- 
pm start - run the local server
- 
pm run dev - same as start
- 
pm test - run the security and link checks
- 
pm run build - generate the deployable public/ directory

## Deployment

- Vercel: uses uild-public.js to populate public/ and serves it as the output directory.
- Render: runs 
ode server.js with TRUST_PROXY=1.
- GitHub Pages: deploy the contents of public/.

## Notes

- Visitor data is stored in data/visitors.json and is intentionally gitignored.
- The public/ directory is generated and gitignored. Run 
pm run build to recreate it.
- The Wednesday Addams "Thing" companion in the UI is preserved as-is.
