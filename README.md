# JotaTools
Static, privacy-first utility site (React + Vite). Everything runs in the browser.

## Run locally
`npm install` → `npm run dev` · tests: `npm test` · build: `npm run build`

## Deploy to GitHub Pages
1. Push to a repo's `main` branch. 2. Settings → Pages → Source: **GitHub Actions**. 3. The workflow in `.github/workflows/deploy.yml` tests, builds and publishes to `https://user.github.io/repo/`.
`base: './'` + HashRouter means subpaths and page refresh work without server config.

## Add a tool
Create a component in `src/tools/`, add one entry to `src/registry.js` (id, name, desc, cat, icon, keywords, component). Search, favorites and recents pick it up automatically.

## Status
Implemented: percentage, rule of three, compound interest, unit converter, password, UUID, hash, Base64, JSON, text tools, **image converter/resizer/compressor, images→PDF, PDF merge, PDF extract/reorder/delete/rotate, PDF→PNG/JPG, file inspector**, search (Ctrl+K), favorites, recents, 3 themes, mobile drawer. Not yet built: audio/video (ffmpeg.wasm), ZIP tools, PDF text/watermark/page numbers, remaining calculators, dates, productivity, education, PWA.