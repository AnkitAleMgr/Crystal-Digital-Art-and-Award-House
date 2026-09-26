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
│   │   └── crud.js              ← generic CRUD factory (getAll/createOne/updateOne/deleteOne); also exports the shared `mapDoc` (strips `_id`/`__v`, returns `id`) and `fail` (Mongoose `ValidationError` → 400 + `errors{}` field map, `CastError` → 404, else 500). `updateOne`/`deleteOne` 404 on a non-24-hex id instead of leaking "Cast to ObjectId failed". Optional `{ withImages }` deletes the old Cloudinary asset on replace/delete.
│   ├── claudinery/
│   │   └── claudineryService.js ← Cloudinary wrapper (note: folder name typo is intentional/kept): uploadImage/deleteImage/deliveryUrl/isConfigured
│   ├── middleware/
│   │   └── authMiddleware.js    ← JWT gate: verifies Bearer token, loads admin, sets req.admin
│   └── admin/
│       ├── route.js             ← /admin router (register [secret-gated], admin-login PUBLIC → middleware → protected routes)
│       ├── auth/
│       │   ├── model.js         ← AdminModel (bcrypt pre-save hook, comparePassword, generateToken)
│       │   └── controller.js    ← adminRegister, adminLogin, getMe
│       ├── upload/{controller,route}.js  ← POST /admin/upload — multer memory storage → Cloudinary, returns { url, publicId }
│       ├── products/{model,controller,route}.js   ← CRUD for products (frontend AdminProduct shape)
│       ├── quotes/{model,controller,route}.js     ← CRUD for quote requests (status enum new/reviewed/quoted/closed)
│       ├── gallery/{model,controller,route}.js    ← CRUD for gallery items
│       ├── testimonials/{model,controller,route}.js ← CRUD for testimonials
│       └── settings/{model,controller,route}.js   ← single-doc settings (GET / + PUT /, no :id)
```

### Images / Cloudinary
- **Images are hosted on Cloudinary; the DB only ever stores URLs.** `imgUrl` holds a `https://res.cloudinary.com/...` URL, never a base64 data URL. Do not reintroduce `FileReader.readAsDataURL` — that is what this setup replaced.
- **Upload path:** frontend `ImageUploadField` → `POST /admin/upload` (multipart, field name `image`, plus optional `folder`) → backend verifies mimetype + 5MB cap → `uploadImage()` → responds `{ url, publicId, width, height, bytes, format }`. The **API secret never reaches the browser**; the browser only ever sees the returned URL.
- Upload route is mounted **after** `authMiddleware` (`src/admin/route.js`) — it requires a Bearer token, returns 401 without one.
- **`imgPublicId` exists alongside `imgUrl` on products and gallery** and is what makes deletion possible. `crud.js` `updateOne`/`deleteOne` are called with `{ withImages: true }` for those two resources only (see `products/controller.js`, `gallery/controller.js`); quotes/testimonials/settings use the plain factory. On update, if `imgPublicId` changed, the previous asset is destroyed.
- Uploads are capped at **1600px wide** (`crop: "limit"`) and land in `crystal-digital/<folder>` where folder ∈ `products | gallery | testimonials` (anything else → `misc`). This is the whitelist that stops a caller writing to arbitrary Cloudinary folders.
- If the `CLOUDINARY_*` env vars are missing, `isConfigured` is false and uploads return **503** with a clear message instead of throwing a confusing SDK error; image cleanup becomes a silent no-op.
- **`cloudinary@2.11.0` cannot upload a `Buffer`.** `uploader.upload(buffer)` throws `ERR_INVALID_ARG_TYPE ... basename` (it calls `path.basename()` on the argument), and `uploader.upload_stream()`'s callback path is broken — it fails with `TypeError: callback is not a function` at `utils/index.js:1390` because the internal `v1_result_adapter` gets the options object in the callback slot. **Pass a base64 data URI string instead** (`data:${mime};base64,${buf.toString("base64")}`) and `await` the returned promise. That is the only combination verified working. Do not "fix" this back to a stream/buffer.
- The API key needs upload **and** delete permission on the `crystal-digital/*` folders. A key created with Cloudinary's **Media Library User** role is not sufficient — it authenticates (`/ping` returns ok) but every asset operation is rejected: upload → HTTP 403, `/usage` → `Request forbidden due to missing permissions (actions=["read"])`. **Use the Master Admin role** on the key (Settings → API Keys → ⋮ → Assign Roles).
- Serving: append `?f_auto&q_auto` to a Cloudinary URL to get WebP/AVIF + automatic quality. The `deliveryUrl()` helper does this; the admin previews currently use the raw `secure_url`.
- **Only 2 upload call sites** — `adminProduct.tsx` (folder `products`) and `galleryModal.tsx` (folder `gallery`). Testimonials have no image field, so they need no upload.
- Note: the site's own bundled images in `src/imports/` are still local files (several are 3–5MB each, and dominate the ~19MB build output). Moving those to Cloudinary is a separate, worthwhile follow-up.

- Auth flow: `POST /admin/register` (**requires `secret`** body field) → `POST /admin/admin-login` (returns JWT + `user: { id, name, email, role }`) → future requests send `Authorization: Bearer <token>`.
- `AdminRoute.use(authMiddleware)` is mounted **after** the public routes in `route.js` — everything registered below it (`GET /me`, and all CRUD below) is protected and returns 401 without a valid token.
- `GET /admin/me` returns the logged-in admin from `req.admin` (set by the middleware) — a health check for the token.
- CRUD pattern: each resource has `model.js` (Mongoose schema mirroring the admin frontend types), `controller.js` (thin wrappers around the `utils/crud.js` factory), `route.js` (get/post/put/delete). All responses map Mongo `_id` → `id` so the frontend types match unchanged. Settings differs: single doc, `findOne`/`findOneAndUpdate` with `upsert`, no `:id` — its controller imports the same `mapDoc`/`fail` from `utils/crud.js` so the response shape matches every other resource.
- **Response envelope is uniform: `{ status, message?, data?, errors? }`.** `status` is always a boolean; the frontend's `api.ts` treats a falsy `status` as failure. `DELETE` returns `{ status, message }` with **no `data` key**, so `api.remove()` resolves to `undefined` — don't write code that reads its result.
- `PUT` is a **partial** update (`findByIdAndUpdate`), not a replace. That is what lets `updateQuoteStatus` send only `{ status }` without wiping the customer's name/email/message.
- `new: true` in `findByIdAndUpdate` is deprecated in the installed Mongoose (logs a `[MONODEASE] Warning`); it still works. Migrating to `returnDocument: "after"` is a safe follow-up.
- Env: `MONGO_DB_URI`, `PORT`, `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRE`, `REFRESH_TOKEN_SECRET`, `ADMIN_REGISTER_SECRET` in `.env`. Tokens are signed in `model.js` `generateToken()` with payload `{ id, email, role }`.

### Auth security rules (do not regress these)
- **`POST /admin/register` is secret-gated.** It requires a `secret` body field matching `ADMIN_REGISTER_SECRET`, compared with `crypto.timingSafeEqual` (length-checked first). Without it, anyone could self-register an admin and get full write access to every CRUD route. If `ADMIN_REGISTER_SECRET` is unset the endpoint returns **503 and refuses to register** — it never falls back to open access.
- **The password hash must never leave the server.** `AdminModel` has `password: { select: false }`, so the hash is *not* loaded by default queries, plus a `toJSON` transform that strips `password`/`__v`. Responses are built from an explicit `safeUser()` whitelist (`{ id, name, email, role }`) in `controller.js` — never spread or `res.json()` a raw Mongoose admin document.
- **To run a password comparison you MUST opt the hash back in:** `AdminModel.findOne({ email }).select("+password")`. Forgetting it yields a clear thrown error from `comparePassword`, not a silent `true`/`undefined` result.
- `adminLogin` must keep its `catch` block returning a 500 — do not leave it empty, or a thrown error (e.g. bad `ACCESS_TOKEN_SECRET`) hangs the request with no response and the frontend spins forever.
- Password policy lives in the schema: **8–72 characters** (bcrypt's 72-byte limit). Never serialize the raw document from `authMiddleware` either — it already assigns a plain `req.admin` object.

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
  - `utils/api.ts` — the ONLY place the admin talks HTTP (see "Data / persistence"); `utils/storage.tsx` — `load`/`save` localStorage helpers (newsletter subscribers only now, not CRUD); `utils/sendNotification.tsx` — `sendNotificationEmail`
  - `components/ui/` — one file per admin UI primitive: `badge.tsx` (`Badge`), `modal.tsx` (`Modal`), `confirmModal.tsx` (`ConfirmModal`), `input.tsx` (`Input`), `Textarea.tsx` (`Textarea`), `select.tsx` (`Select`), `imageUploadField.tsx` (`ImageUploadField`)
  - `components/layout/` — admin chrome: `adminLogin.tsx` (`AdminLogin` — POSTs `{ email, password }` to the backend `/admin/admin-login`; on success stores `cdaah_admin` + JWT `cdaah_token` in sessionStorage), `sidebar.tsx` (`Sidebar` — router `<Link>`-based nav, active section derived from URL), `adminProvider.tsx` (`AdminProvider` context + `useAdmin()` hook — owns ALL admin state: auth (`sessionStorage["cdaah_admin"]`), the five MongoDB-backed collections and their per-item async mutators, `loading`/`error`, `quoteCount`; pages consume data via `useAdmin()` instead of props), `adminLayout.tsx` (`AdminLayout` — the blueprint: confirmation dialog + `Sidebar` + top bar header + `<main><Outlet/></main>`; no props, derives `section` from the URL path)
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
- Admin login goes through the backend (`POST /admin/admin-login`): credentials are not hardcoded in the frontend; the returned JWT is stored as `cdaah_token` in sessionStorage.
- **The admin dashboard IS now fully wired to the backend CRUD for all 5 resources.** There are no `localStorage` seeds left in the admin data path — `adminProvider.tsx` fetches from MongoDB and every mutation is a real API call.
  - `utils/api.ts` is the **single** place that talks HTTP: `API_BASE` (`VITE_API_BASE`, default `http://localhost:3000`), `getToken()`, `ApiError`, and the `api.{getAll,create,update,remove,getSettings,saveSettings}` verbs. It injects `Authorization: Bearer`, prefixes `/admin`, and **calls a registered unauthorized handler on any 401** (the provider registers `onLogout`, so an expired token self-heals by logging out instead of hanging). `adminLogin.tsx` and `imageUploadField.tsx` import `API_BASE`/`getToken()` from here — do not hardcode `http://localhost:3000` anywhere.
  - Response contract is uniformly `{ status, message?, data?, errors? }`. `errors` is a field→message map on validation failure and `api.ts` joins it into the banner text.
  - `adminProvider` exposes **per-item async** methods, not array setters: `createProduct/updateProduct/deleteProduct`, `createGalleryItem/…`, `createTestimonial/…`, `updateQuoteStatus(id, status)`, `saveSettings`. It also exposes `loading`, `error`, `clearError`, `quoteCount`. The array setters (`setProducts` etc.) are **gone** — pages must not reintroduce them.
  - On mount (and after login) the provider `Promise.all`s all five GETs. `AdminApp.tsx` renders a spinner while that first load is in flight, so pages never flash empty tables.
  - `updateQuoteStatus` sends **only** `{ status }`. The backend uses `findByIdAndUpdate` (not `replaceOne`), so partial updates preserve the other fields — this is what makes the partial update safe.
  - **Known limitation: 15-minute token expiry with no refresh flow.** A 401 logs the admin out and they must sign in again. `REFRESH_TOKEN_SECRET` is in `.env` but still unused. Adding refresh tokens is the natural next step.
- `utils/storage.tsx` (`load`/`save`) is still used for a couple of non-CRUD concerns (e.g. the newsletter subscribers list in `adminProduct.tsx`), so don't delete it.
- The **public-facing site is not connected to the API yet** — `data/products.ts` etc. are still hardcoded, and the contact form still posts a WhatsApp-style message instead of creating a quote row. The admin CRUD work above does not change that.

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
- TS strictly readable code remains possible. **`typescript` IS now installed as a devDependency** in the FrontEnd, so **`npx tsc --noEmit` is a real type check** (it was previously silently checking nothing because `tsc` was not installed) and **`npm run build` is still the required gate** because `vite build` only strips types via esbuild and will pass on type errors. Run both. Note `tsc --noEmit` is stricter than the build: it caught wrong relative-import depth in `adminProvider.tsx` that the build accepted.
- Vite build output is large (~2.5 MB+ of images) — normal for this project.
- Site backend contact form currently posts a message (WhatsApp-style); real DB integration is future work.

## Backend troubleshooting
- **`MongoDB connection failed: Could not connect to any servers ... IP that isn't whitelisted`** — the IP is missing from the Atlas **Network Access → IP Access List**. Atlas accepts the TCP connection on 27017 and then aborts the **TLS handshake** with `SSL alert number 80` (`ssl3_read_bytes` / `tlsv1 alert internal error`). So this shows up as a MongoDB *server selection* failure, not a network timeout. Confirm with `openssl s_client -connect <shard-host>:27017 -servername <cluster-host>`: TCP connects, handshake dies → it is the IP list, not DNS/firewall/Node. The shard hostnames are only published as SR records, so the raw `nslookup` on the cluster host returning "No answer" is **normal, not a bug**. Fix: Atlas → cluster → Network Access → add your IP (or `0.0.0.0/0` for dev, since home/ISP IPs change).
- **`.env` changes need a manual `nodemon` restart.** It only watches `js,mjs,cjs,json`, so new/edited env keys (e.g. `ADMIN_REGISTER_SECRET`) are not picked up automatically. A newly added key that appears "missing" is almost always just a stale process.
