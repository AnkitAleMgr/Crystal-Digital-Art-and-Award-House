# Crystal Digital — Project Guide (for AI agents)

React + Vite + TypeScript website for **Crystal Digital Art & Award House** (crystal awards, trophies, plaques, medals, engraving & gifts business). This file is auto-loaded by opencode so agents understand the layout, decisions, and conventions quickly.

## Repo layout

```
Crystal Digital copy/                 ← repo root
├── Crystal Digital BackEnd/          ← Express + MongoDB API (index.js) — used by the frontend for admin login (`/admin/admin-login`)
└── Crystal Digital FrontEnd/         ← the app (Vite + React + TS)
```

## Frontend commands

```bash
cd "Crystal Digital FrontEnd"
npm run dev        # start dev server
npm run build      # production build (verifies everything compiles/bundles)
```

## Backend

Express + MongoDB API in `Crystal Digital BackEnd/` (run with `npm run dev` inside that folder, default port 3000). Used by the frontend for admin login.

```
Crystal Digital BackEnd/
├── index.js                     ← app entry: CORS + JSON, mounts /admin router
├── src/
│   ├── utils/
│   │   ├── db.js                ← DB_CONNECT (MONGO_DB_URI)
│   │   └── crud.js              ← generic CRUD factory (getAll/createOne/updateOne/deleteOne + _id→id mapping)
│   ├── middleware/
│   │   └── authMiddleware.js    ← JWT gate: verifies Bearer token, loads admin, sets req.admin
│   └── admin/
│       ├── route.js             ← /admin router (register, admin-login PUBLIC → middleware → protected routes)
│       ├── auth/
│       │   ├── model.js         ← AdminModel (bcrypt pre-save hook, comparePassword, generateToken)
│       │   └── controller.js    ← adminRegister, adminLogin, getMe
│       ├── products/{model,controller,route}.js   ← CRUD for products (frontend AdminProduct shape)
│       ├── quotes/{model,controller,route}.js     ← CRUD for quote requests (status enum new/reviewed/quoted/closed)
│       ├── gallery/{model,controller,route}.js    ← CRUD for gallery items
│       ├── testimonials/{model,controller,route}.js ← CRUD for testimonials
│       └── settings/{model,controller,route}.js   ← single-doc settings (GET / + PUT /, no :id)
```

- Auth flow: `POST /admin/register` → `POST /admin/admin-login` (returns JWT + `{ id, email, role }`) → future requests send `Authorization: Bearer <token>`.
- `AdminRoute.use(authMiddleware)` is mounted **after** the public routes in `route.js` — everything registered below it (`GET /me`, and all CRUD below) is protected and returns 401 without a valid token.
- `GET /admin/me` returns the logged-in admin from `req.admin` (set by the middleware) — a health check for the token.
- CRUD pattern: each resource has `model.js` (Mongoose schema mirroring the admin frontend types), `controller.js` (thin wrappers around the `utils/crud.js` factory), `route.js` (get/post/put/delete). All responses map Mongo `_id` → `id` so the frontend types match unchanged. Settings differs: single doc, `findOne`/`findOneAndUpdate` with `upsert`, no `:id`.
- Env: `MONGO_DB_URI`, `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRE` in `.env`. Tokens are signed in `model.js` `generateToken()` with payload `{ id, email, role }`.

## Where things live & what they do

### App shell & routing
- `src/main.tsx` — entry, mounts `<BrowserRouter>` + `<App />`
- `src/app/App.tsx` — all routes: public site wrapped in client `Layout`; admin routes nested under `/admin` → `<AdminProvider>` wrapping `AdminApp` (auth gate) → `<AdminLayout>` blueprint → `/`, `/products`, `/gallery`, `/testimonials`, `/quotes`, `/settings` page routes
- `src/app/client/Layout.tsx` — global layout shell: `GlobalStyles` → `Navbar` → `<Outlet/>` → `Footer` → `BackToTop`
- `src/app/client/pages/` — **page components** (one per route):
  - `HomePage.tsx` — assembles the home sections
  - `AboutPage.tsx` — hero + StatCounter + location sections
  - `GalleryPage.tsx` — lightbox gallery that links images to products
  - `ContactPage.tsx` — contact/quote form (posts a WhatsApp-style message)
  - `ProductDetailPage.tsx` — single product view (size select + QuoteModal)
- `src/app/admin/` — **admin dashboard, fully split** out of the former monolithic `AdminApp.tsx`. Layout mirrors the client refactor pattern (types/ data/ constants/ hooks/ components/{ui,layout} pages/). Current structure:
  - `types/interface/<area>/` — TypeScript interfaces (product, quote, gallery, testimonial, setting: `adminProduct.ts`, `quoteRequest.ts`, `gakkeryItem.ts`, `testimonials.ts`, `siteSetting.ts`)
  - `data/seed.ts` — seed/"database" data (`SEED_PRODUCTS`, `SEED_GALLERY`, `SEED_TESTIMONIALS`, `SEED_QUOTES`, `SEED_SETTINGS`)
  - `constants/admin.tsx` — admin constants + nav: `PRODUCT_CATS`, `GALLERY_CATS`, `STATUS_COLORS`, `STATUS_BG`, `NAV_ITEMS`, and the `AdminSection` type. **Must stay `.tsx`** because `NAV_ITEMS` contains JSX icon elements (JSX doesn't parse in `.ts` files).
  - `utils/storage.tsx` — `load`/`save` localStorage helpers; `utils/sendNotification.tsx` — `sendNotificationEmail`
  - `components/ui/` — one file per admin UI primitive: `badge.tsx` (`Badge`), `modal.tsx` (`Modal`), `confirmModal.tsx` (`ConfirmModal`), `input.tsx` (`Input`), `Textarea.tsx` (`Textarea`), `select.tsx` (`Select`), `imageUploadField.tsx` (`ImageUploadField`)
  - `components/layout/` — admin chrome: `adminLogin.tsx` (`AdminLogin` — POSTs `{ email, password }` to the backend `/admin/admin-login`; on success stores `cdaah_admin` + JWT `cdaah_token` in sessionStorage), `sidebar.tsx` (`Sidebar` — router `<Link>`-based nav, active section derived from URL), `adminProvider.tsx` (`AdminProvider` context + `useAdmin()` hook — owns ALL admin state: auth (`sessionStorage["cdaah_admin"]`), products/gallery/testimonials/quotes/settings (localStorage seeds) and their setters, `quoteCount`; pages consume data via `useAdmin()` instead of props), `adminLayout.tsx` (`AdminLayout` — the blueprint: confirmation dialog + `Sidebar` + top bar header + `<main><Outlet/></main>`; no props, derives `section` from the URL path)
  - `pages/` — one file per dashboard panel: `DashBoard.tsx` (`AdminOverview` — uses `useNavigate` instead of `setSection`), `adminProduct.tsx` (`AdminProducts` + `ProductModal` + `emptyProduct`), `quoteRequest.tsx` (`AdminQuotes`), `galleryModal.tsx` (`AdminGallery` + `GalleryModal`), `testimonials.tsx` (`AdminTestimonials` + `TestimonialModal`), `setting.tsx` (`AdminSettings`)
  - `AdminApp.tsx` — the auth gate route element: uses `useAdmin()`; renders `AdminLogin` when not authed, otherwise `<Outlet />` (the admin routes under `AdminLayout`)

### Client structure (the refactor pattern we follow)
```
src/app/client/
├── types/          → TypeScript interfaces only (e.g. types/Product.ts)
├── data/           → static/"database" content (data/products.ts = PRODUCTS, data/productSize.ts = PRODUCT_SIZES)
├── hooks/          → shared React hooks (useInView, useCounter)
├── components/
│   ├── layout/     → site-wide chrome: Navbar, Footer, BackToTop, globalStyle (globalStyles + GlobalStyles)
│   └── pages/      → section components grouped by route
│       ├── home/       → home sections
│       ├── aboutUs/    → About-page sections (aboutUsStatCounter.tsx)
│       └── Product/    → product-related components (productQuoteModal.tsx)
└── pages/          → page components assembled from components/pages/*
```

### Client building blocks (defined where, used where)
| Piece | Defined in | Used by |
|---|---|---|
| `Section`, `SectionLabel`, `SectionHeading` | `components/pages/home/homeSection.tsx` | All pages |
| `HeroCarousel` (+ `heroSlides`) | `components/pages/home/homeCaurousel.tsx` | Home |
| `ServicesGrid` (+ `services`) | `components/pages/home/homeService.tsx` | Home |
| `WhyChooseUs` (+ `whyUs`) | `components/pages/home/homeWhyChooseUs.tsx` | Home |
| `FeaturedProducts` (+ `PRODUCT_FILTER_CATS`) | `components/pages/home/homeFeatureProducts.tsx` | Home |
| `Testimonials` (+ `testimonials`) | `components/pages/home/homeTestimonials.tsx` | Home |
| `StatCounter` | `components/pages/aboutUs/aboutUsStatCounter.tsx` | About |
| `QuoteModal` | `components/pages/Product/productQuoteModal.tsx` | ProductDetail |
| `useInView(threshold)` | `hooks/useInView.ts` | all home sections, StatCounter, ProductDetail, About |
| `useCounter(target, active)` | `hooks/useCounter.ts` | StatCounter (0 → target animation) |
| `Product` (type) | `types/Product.ts` | `main.tsx`? no → `data/products.ts`, QuoteModal, product pages |
| `PRODUCTS`, `PRODUCT_SIZES` | `data/products.ts`, `data/productSize.ts` | Home, Gallery, ProductDetail |
| `ImageWithFallback` | `src/app/components/figma/ImageWithFallback.tsx` | images with broken-image fallback |

### Shared / library code (don't touch casually)
- `src/app/components/ui/` — shadcn-style UI primitives (button, card, dialog, etc.). Generated boilerplate, imported from `@/components/ui/...` style components.
- `src/app/components/figma/` — `ImageWithFallback` helper.

### Styles / assets
- `src/styles/` — global CSS (`index.css`, `globals.css`, `fonts.css`, `theme.css`, `tailwind.css`)
- `src/imports/` — static images (`image.png` = logo, `image-1..12.png`). **Always imported via RELATIVE paths, never `@/imports/...`** — the user has had path issues with the alias (see conventions below).

### Data / persistence
- Products & sizes are **static now** (`data/products.ts`, `data/productSize.ts`) as a stand-in for a future database. When a DB/API arrives, swap these files for fetches returning the same `Product[]` shape so pages don't change.
- Admin uses `localStorage` keys (`cdaah_*`) via `load()`/`save()` helpers in `adminProvider.tsx`. **Admin login now goes through the backend** (`POST /admin/admin-login`, Express + MongoDB): credentials are no longer hardcoded in the frontend; the returned JWT is stored as `cdaah_token` in sessionStorage for future authenticated API calls.

## Conventions (IMPORTANT)
0. **Ask before making changes** — the user may be discussing/planning and NOT asking for implementation. When they ask a question or describe an idea, clarify first and get explicit confirmation (e.g. "want me to do it?") before editing files, moving/deleting code, or changing architecture. Never assume "I'd like to do X" means "go change the code".
1. **Relative imports only** — always `../`/`../../` per folder depth. Do **not** use `@/` alias or absolute workspace paths for local files. The `@` alias maps `@ → src`, but the user asked to avoid it for imports.
2. **File naming** — `camelCase` with a distinguishing suffix per page/section: `homeCaurousel.tsx` (note the typo is intentional/kept), `homeService.tsx`, `homeSection.tsx`, `productQuoteModal.tsx`, `aboutUsStatCounter.tsx`.
3. **Types go in `types/`**, static data in `data/`, hooks in `hooks/`, by-route sections in `components/pages/<route>/`, global chrome in `components/layout/`.
4. **No comments added to code** unless asked.
5. **macOS FS is case-insensitive** — importing with wrong casing (e.g. `ProductSize` vs `productSize`) causes TS error TS1149. Match filenames exactly; restart TS server / Reload Window after renames to clear stale tsserver cache.
6. **Keep this file (AGENTS.md) up to date** — after EVERY structural change (file moved/renamed/deleted/added, exports changed, conventions decided, new config), update this guide in the same session so future agents always have an accurate view.

## What the guide should reflect
- Folder structure and where each component/type/data/hook lives
- What each piece is used by (keep the "defined where / used where" table accurate)
- Any new conventions, config decisions, or pitfalls
- Anything read-only/do-not-touch (e.g. `components/ui/`)

## Critical config (why image imports work now)
- `src/vite-env.d.ts` — `/// <reference types="vite/client" />`
- `FrontEnd/tsconfig.json` — created because the project had **none**. Includes `"types": ["vite/client"]` (declares `.png`/`.jpg`/`.svg` modules so image imports typecheck) and `"allowUmdGlobalAccess": true` (lets `React.*` be used without explicit imports, which much of the code does).
- `vite.config.ts` — `@` alias → `./src`, assetsInclude for `*.svg`/`*.csv`, custom `figmaAssetResolver` for `figma:asset/` ids.

## Notes / current state
- `MainPage.tsx` was **deleted** — everything was extracted into the structure above.
- Admin login is wired to the backend (`POST /admin/admin-login`); the old hardcoded `ADMIN_USER`/`ADMIN_PASS` constants were removed. The backend must be running (port 3000) for login to work; DB/MongoDB collection `admins` holds the credentials.
- TS strictly readable code remains possible; verify changes with `npx tsc --noEmit` (typescript installed locally) and `npm run build`.
- Vite build output is large (~2.5 MB+ of images) — normal for this project.
- Site backend contact form currently posts a message (WhatsApp-style); real DB integration is future work.