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
npx tsc --noEmit   # real type check — stricter than the build, run both
```

### Driving the real UI in a browser (Playwright)
`npx playwright install chromium` **fails on this machine** (download error, code=1). Use the
already-installed Google Chrome instead, which needs no download:
```js
import { chromium } from "playwright-core";
const browser = await chromium.launch({ channel: "chrome" });
```
This is the only way to verify form/UI behaviour end to end — `npm run e2e` covers the API
contract only. Useful when touching `ContactPage`, `productQuoteModal`, or the admin pages:
drive the form, assert on `page.on("response")` for the POST, and remember to delete the
`@example.com` rows the submissions create.

Three traps when scripting the **admin** pages, all of which cost a run each:
- **The admin pages have their own category `<select>` (the table filter) and it comes
  before the modal's in the DOM.** A bare `page.selectOption("select", …)` or
  `page.$eval("select", …)` therefore operates on the *filter*, not the modal field, and
  fails silently — a subsequent `getByRole(...)` then just times out. Scope to the modal:
  `page.locator('div.fixed.z-50:has(h2:text-is("Add New Product"))')`. `Modal` has no
  `role="dialog"`, so the `h2` is the only handle on it.
- **A leftover modal blocks the page under it.** The overlay is `fixed inset-0`, so the
  "Add Product" button behind it is not clickable. Close the previous modal (its `h2`'s
  parent holds the close button) before opening the next.
- **A crashed run leaves its fixtures behind** and the next run's assertions are then
  wrong (two categories of the same name, a product that should have been deleted). Sweep
  at the top of the script, exactly as `e2e.mjs` sweeps `@example.com` quotes.

## Backend

Express + MongoDB API in `Crystal Digital BackEnd/` (run with `npm run dev` inside that folder, default port 3000). Used by the frontend for admin login.

```
Crystal Digital BackEnd/
├── index.js                     ← app entry: CORS + JSON, mounts /api (public) + /admin router
├── migrate.mjs                  ← one-shot seed: reads src/seed/data.mjs, uploads images, inserts rows (npm run seed)
├── dumpSeed.mjs                 ← regenerates src/seed/data.mjs from the current DB (npm run seed:dump)
├── seedSettings.mjs             ← fills the single settings doc from src/seed/settings.mjs (npm run seed:settings)
├── seedCategories.mjs           ← inserts any missing category names from src/seed/categories.mjs (npm run seed:categories)
├── e2e.mjs                      ← live admin→public contract checks (npm run e2e)
├── state.mjs                    ← DB row counts + category audit + Cloudinary orphan/dangling audit (npm run state)
├── src/
│   ├── utils/
│   │   ├── db.js                ← DB_CONNECT (MONGO_DB_URI)
│   │   └── crud.js              ← generic CRUD factory (getAll/createOne/updateOne/deleteOne); also exports the shared `mapDoc` (strips `_id`/`__v`, returns `id`) and `fail` (Mongoose `ValidationError` → 400 + `errors{}` field map, `CastError` → 404, else 500). `updateOne`/`deleteOne` 404 on a non-24-hex id instead of leaking "Cast to ObjectId failed". Optional `{ withImages }` deletes the old Cloudinary asset on replace/delete.
│   ├── claudinery/
│   │   └── claudineryService.js ← Cloudinary wrapper (note: folder name typo is intentional/kept): uploadImage/deleteImage/deliveryUrl/isConfigured
│   ├── mailer.js                ← Resend transport: sendMail({to,subject,html,replyTo,text}), isMailConfigured, mailFrom (MAIL_FROM → onboarding@resend.dev), ownerEmail. Never throws.
│   ├── notifications.js         ← the only two emails: notifyOwnerOfQuote (after createPublicQuote saves) and notifyCustomerOfStatus (quote status actually changed). Both take a DB doc, never req.body.
│   ├── public/{controller,route}.js  ← unauthenticated GET /api/products|categories|gallery|testimonials|settings + POST /api/quotes
│   ├── seed/data.mjs             ← canonical seed content (generated; see "Content migration")
│   ├── seed/settings.mjs         ← canonical business details (hand-written, see "Settings-driven copy")
│   ├── seed/categories.mjs       ← SEED_CATEGORIES + the shared `upsertCategories()` insert-only helper (hand-written; see "Categories")
│   ├── middleware/
│   │   ├── authMiddleware.js    ← JWT gate: verifies Bearer token, loads admin, sets req.admin
│   │   └── quoteRateLimit.js    ← 10 POSTs/IP/hour sliding window for POST /api/quotes (no dependency)
│   └── admin/
│       ├── route.js             ← /admin router (register [secret-gated], admin-login PUBLIC → middleware → protected routes)
│       ├── auth/
│       │   ├── model.js         ← AdminModel (bcrypt pre-save hook, comparePassword, generateToken)
│       │   └── controller.js    ← adminRegister, adminLogin, getMe
│       ├── upload/{controller,route}.js  ← POST /admin/upload — multer memory storage → Cloudinary, returns { url, publicId }
│       ├── products/{model,controller,route}.js   ← CRUD for products (frontend AdminProduct shape)
│       ├── categories/{model,controller,route}.js ← CRUD for the shared product/gallery category list
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
- Serving: inject `f_auto,q_auto` into the URL **path** to get WebP/AVIF + automatic quality (see the gotcha section below). The `deliveryUrl()` helper does this; the admin previews currently use the raw `secure_url`.
- **Only 2 upload call sites** — `adminProduct.tsx` (folder `products`) and `galleryModal.tsx` (folder `gallery`). Testimonials have no image field, so they need no upload.
- Note: the site's own bundled images in `src/imports/` are still local files (several are 3–5MB each, and dominate the ~19MB build output). Moving those to Cloudinary is a separate, worthwhile follow-up.

- Auth flow: `POST /admin/register` (**requires `secret`** body field) → `POST /admin/admin-login` (returns JWT + `user: { id, name, email, role }`) → future requests send `Authorization: Bearer <token>`.
- `AdminRoute.use(authMiddleware)` is mounted **after** the public routes in `route.js` — everything registered below it (`GET /me`, and all CRUD below) is protected and returns 401 without a valid token.
- `GET /admin/me` returns the logged-in admin from `req.admin` (set by the middleware) — a health check for the token.
- CRUD pattern: each resource has `model.js` (Mongoose schema mirroring the admin frontend types), `controller.js` (thin wrappers around the `utils/crud.js` factory), `route.js` (get/post/put/delete). All responses map Mongo `_id` → `id` so the frontend types match unchanged. Settings differs: single doc, `findOne`/`findOneAndUpdate` with `upsert`, no `:id` — its controller imports the same `mapDoc`/`fail` from `utils/crud.js` so the response shape matches every other resource.
- **Response envelope is uniform: `{ status, message?, data?, errors? }`.** `status` is always a boolean; the frontend's `api.ts` treats a falsy `status` as failure. `DELETE` returns `{ status, message }` with **no `data` key**, so `api.remove()` resolves to `undefined` — don't write code that reads its result.
- `PUT` is a **partial** update (`findByIdAndUpdate`), not a replace. That is what lets `updateQuoteStatus` send only `{ status }` without wiping the customer's name/email/message.
- `findByIdAndUpdate` uses `returnDocument: "after"`, not the deprecated `new: true` (which logged a `[MONODEASE] Warning` on every write). Applies to `utils/crud.js`, `admin/settings/controller.js` and `admin/quotes/controller.js`.
- Env: `MONGO_DB_URI`, `PORT`, `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRE`, `REFRESH_TOKEN_SECRET`, `ADMIN_REGISTER_SECRET` in `.env`. Tokens are signed in `model.js` `generateToken()` with payload `{ id, email, role }`.

### Public read API (added with the DB content migration)
The public site reads content from MongoDB over **unauthenticated** routes mounted in `index.js` **before** `AdminRoute.use(authMiddleware)`, so they do not shadow the admin CRUD:
```
GET /api/products     → products that HAVE a slug, ascending createdAt
GET /api/categories   → every category, in the admin's display order
GET /api/gallery      → all gallery items
GET /api/testimonials → all testimonials
GET /api/settings     → the single settings doc
POST /api/quotes      → submit a quote/contact request (rate limited)
```
- **`GET /api/quotes` still does not exist (404) on purpose** — submission is public, *reading other people's quotes is not*. `e2e.mjs` asserts that 404 so it can't be reintroduced by accident.
- `src/public/controller.js` maps documents into the shapes the public components expect. The important part: **`id` is the product `slug`, not the Mongo `_id`**, so `/products/:slug` URLs and `gallery.linkedProductId` are both slug-based. This is why public products are filtered to `slug != ""` — a product without a slug has no public URL and is deliberately invisible (the "test product 1" row is in this state).
- The public response deliberately **omits `imgPublicId`** — that is the value the backend uses to destroy the Cloudinary asset and has no business being public.
- `getPublicSettings` runs the shared `mapDoc` like every other route, so settings return `id` — this one used to hand back `doc.toObject()` verbatim (`_id` + `__v`). Settings are the only resource whose public shape is identical to its admin shape.

### Categories (products and gallery share ONE admin-managed list)
- **This replaced three hardcoded frontend arrays that had already drifted apart:** `PRODUCT_CATS` + `GALLERY_CATS` in `admin/constants/admin.tsx`, and a third `cats` array inside `GalleryPage.tsx`. The symptom: "Gifts" was offered in the admin's product select but had no pill on the home page, and gallery had categories ("Crystal Awards", "Printing") products could never use. **There is no longer a list in the frontend to keep in sync** — the pills and the selects both read the `categories` collection.
- **Products and gallery items share one list on purpose.** Products are also shown in the gallery (via `linkedProductId`), and gallery-only images carry a category of their own, so two lists would guarantee drift.
- **`cat` stores the category *name*, not a reference to the category document.** This is the load-bearing decision — do not "improve" it into a `categoryId` ObjectId ref. As a name it means a rename is a single `updateMany` instead of rewriting every product, and a delete cannot leave dangling ObjectIds behind. It is also why the schema can no longer require it.
- **Deleting a category clears `cat` on the products and gallery items that used it; it never deletes them.** A category is a label, not a container. The UI calls this "Uncategorized" and the site's filter pills gain an **Uncategorized** tab, but only when something is actually uncategorized (`categoryFilters()` takes the count).
- **Renaming must follow through**, and it has to be done in *two* places: the controller rewrites `ProductModel`/`GalleryModel` server-side, and `adminProvider.renameCategory` mirrors it into its own `products`/`gallery` state. Missing the second means the admin tables keep showing a category that no longer exists until the next reload.
- **`ProductModel.cat` is no longer `required`** (`{ type: String, default: "" }`). Gallery's `cat` already was. An uncategorized product is a first-class state, so do not add `required` back.
- **`createCategory` appends with `countDocuments()`** and the list is read back sorted `{ order: 1, name: 1 }` — that order *is* the pill order on the site, so it is visible copy, not a nicety. There is no drag-to-reorder UI; `order` is only set by creation and by the seeder.
- **Duplicate names are rejected case-insensitively** by an explicit `takenByOther()` regex check in the controller, which returns a field-level `{ errors: { name } }`. The schema's `unique: true` would also catch it, but surfaces as a raw E11000 → 500, and the admin needs a message it can render next to the field.
- **`cat` values that are not in the list are a real state** (hand-typed, or renamed outside the admin). `CategorySelect` keeps such a value selectable as `"<name> (not in list)"` so saving the form cannot silently drop it, and `npm run state` reports them as "cats with no category row (invisible on the site)" — such an item is only reachable via the "All" pill.
- **Frontend:** `client/utils/categories.ts` holds the shared pill logic — `categoryFilters(categories, uncategorisedCount)`, `inCategory(cat, filter)`, `catLabel(cat)` — so the home and gallery pages cannot drift apart again. The admin field is `admin/components/ui/categorySelect.tsx` (`CategorySelect`), which pulls its list and its mutators from `useAdmin()` and manages create/rename/delete **inline in the product modal** (no sidebar page, by choice). Its delete confirmation is inline, not a `ConfirmModal`, because that is a `fixed inset-0` overlay and stacking it inside the product modal's own overlay is asking for trouble.
- **Seeding is insert-only.** `npm run seed:categories` adds any name in `SEED_CATEGORIES` that is missing and never removes, renames or reorders anything, so it is safe against a hand-edited list (`-- --force` wipes the collection but still leaves products' `cat` strings alone). `migrate.mjs` calls the same `upsertCategories()` helper, so a fresh `npm run seed` gets the categories its products reference.

### Settings-driven copy (phone/address/email/hours are now in the DB)
- The business details used to be hardcoded in `Footer.tsx`, `ContactPage.tsx`, `AboutPage.tsx` **and the quote modal's phone chip** (`productQuoteModal.tsx`), so **editing Admin → Settings changed nothing on the website**. They are now in the settings document and read via `GET /api/settings`.
- The quote modal's phone is only on the **post-submit confirmation screen** (`sent ? ... : ...`), not on the form — so it only renders after a real `POST /api/quotes` returns 201. Verified in a real browser (see the Playwright note at the top) rather than by looking at the initial modal.
- **Canonical values live in two places that must be kept in sync:** `Crystal Digital BackEnd/src/seed/settings.mjs` (what fills the DB) and `Crystal Digital FrontEnd/src/app/client/data/siteDefaults.ts` (the frontend's fallback). They are duplicated deliberately — the backend can't import frontend code and the frontend must render before/without the fetch.
- **`npm run seed:settings` only fills fields that are still empty.** Settings are hand-edited in the admin panel, so a rerun must not clobber those edits; `-- --force` overwrites everything. This is the opposite of `npm run seed`, which is guarded against double-seeding and needs `--force` to wipe.
- **`siteDataProvider` merges the fetch over `SITE_DEFAULTS` per field** (`withSettingsDefaults`): a field the admin left blank falls back to the hardcoded value rather than rendering empty, so a half-filled settings doc is always safe to save. `settings` is therefore **never null** and components can read `settings.phone` with no guard.
- **`whatsapp` is stored as bare digits** (`9779856012712`) and the site builds the link with `whatsappLink(settings)` → `https://wa.me/<digits>`. The helper strips non-digits so an admin can type `+977 9856012712` and it still works. `whatsappLink` returns `""` for an empty number, and the social buttons already no-op on a falsy href.
- **The Google Maps `<iframe src="…/maps/embed?pb=…">` is deliberately still hardcoded** in `AboutPage.tsx` and `ContactPage.tsx`. `mapLink` is the human-facing "Get directions"/map-icon link; the `pb=` embed URL is a different thing and pasting it into the admin field would be easy to get wrong. Don't move the embed into settings without asking.
- Navbar's two-line brand lockup (`CRYSTAL DIGITAL` / `ART & AWARD HOUSE`) is also still hardcoded — it is styled typography, not a data field, and `businessName` would collapse it onto one line.
- **The footer's "Admin" link was removed** (2026-09-28). `/admin` is typed directly; `AdminApp` already shows the login screen for an unauthenticated visitor, so nothing is lost and the dashboard is no longer advertised to the public.

### `POST /api/quotes` — public quote submission
- Route: `PublicRoute.post("/quotes", quoteRateLimit, createPublicQuote)`. Rate limit runs **first**, so even rejected submissions consume quota.
- **`createPublicQuote` builds the document field by field and never spreads `req.body`.** `status` is hardcoded to `"new"` and the timestamps come from `{ timestamps: true }`. This is deliberate: spreading the body would let a crafted POST pre-`closed` its own quote or backdate it. `e2e.mjs` checks both.
- The 201 response returns only `{ id, createdAt }` — never the stored doc, which would echo the customer's email/message straight back.
- Validation is hand-rolled (name/email present, `QUOTE_EMAIL_PATTERN` from `quotes/model.js`) so the messages are human-readable, then `fail(res, error, 400)` catches anything Mongoose rejects. The public 400s use the same `{ status, message, errors }` envelope as everything else.
- **Honeypot:** a `website` field, hidden off-screen with `aria-hidden` + `tabIndex={-1}` in both forms. If it comes back non-empty the request is answered **201 without storing anything** — replying with an error tells the bot it was caught. `e2e.mjs` asserts both the 201 and the no-op.
- **Rate limit** is `src/middleware/quoteRateLimit.js`: 10 requests per IP per hour, in-memory sliding window, no dependency. It buckets on **`X-Forwarded-For` first, then `req.ip`** — behind a proxy without `app.set("trust proxy", ...)` express reports the *proxy's* address, which would collapse every visitor into one shared bucket. It is in-memory, so it resets on restart and does not span multiple instances; move it to Redis if this is ever deployed to more than one.
- 429 responses set `Retry-After` and return the standard envelope with a "call us directly" message rather than a bare error.

### The quote document changed shape (do not reintroduce `date`)
- **`date` is gone from the schema.** It was a `String` that nothing ever populated, which is why the admin Date column was blank. `{ timestamps: true }` already gives `createdAt`/`updatedAt` as real Dates; `formatWhen()` (`admin/utils/formatWhen.ts`) renders them. Both are now in the admin `QuoteRequest` type.
- **New fields, because the forms always collected them and Mongoose silently dropped them:** `service` (contact form), `quantity`, `engrave`, `attachment` (quote modal). Every string is `trim` + `maxlength`-capped so the admin `PUT` (which runs `runValidators: true`) cannot write absurd values.
- `email` is `required` **and** `match: QUOTE_EMAIL_PATTERN`, so the admin `PUT` validates format too. Both public forms therefore mark the email input `required` — previously it was optional in the UI while the schema demanded it, which would have 400'd.
- `quantity` is a `String`, not a Number: the modal's input can be cleared mid-edit, and a Number field would fail validation on `""`.
- The frontend reaches these only through `src/app/client/utils/api.ts` (`publicApi`). Do not hardcode `http://localhost:3000` in a component.

### `?f_auto&q_auto` is NOT how you optimise a Cloudinary URL (gotcha)
Appending `?f_auto&q_auto` to a Cloudinary URL **silently does nothing** — Cloudinary ignores unknown query params and serves the original upload. The transform must be injected into the URL **path**:
```
https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto/v123/cloudinary/<id>.png   ← works
https://res.cloudinary.com/<cloud>/image/upload/v123/cloudinary/<id>.png?f_auto&q_auto  ← ignored
```
Verified with a browser `Accept: image/webp` header: the first returns `image/webp` at ~240 KB, the second returns the original `image/png` at ~2.7 MB. Both `cdn()` (frontend) and `deliveryUrl()` (backend) now do the path injection via `url.replace("/upload/", "/upload/f_auto,q_auto/")`, guarded against double-application. **Do not "simplify" these back to the `?` query form.**

### Content migration: where the original content now lives
- The website content used to be hardcoded in the frontend. Those arrays are **gone** (`data/products.ts`, `data/productSize.ts`, the `galleryItems` array in `GalleryPage.tsx`, the `testimonials` array in `homeTestimonials.tsx`).
- The canonical copy is now **`Crystal Digital BackEnd/src/seed/data.mjs`** (`SEED_PRODUCTS`, `SEED_GALLERY`, `SEED_TESTIMONIALS`). `migrate.mjs` reads it, uploads the matching file from `../Crystal Digital FrontEnd/src/imports/`, and inserts the rows.
- `npm run seed` is **guarded**: it refuses to run when any product already has a slug, so it can never silently double-seed. `npm run seed -- --force` wipes and reseeds, and it destroys the Cloudinary assets of the rows it removes (otherwise every reseed would orphan ~19 assets, because Cloudinary suffixes colliding filenames).
- Each seeded doc keeps a `sourceImage` field (e.g. `image-2.png`) so a re-upload can find the right local file. It is stripped before insert.
- `npm run seed:dump` regenerates `data.mjs` **from the current database**, which is how `sourceImage` was recovered: the Cloudinary publicId already ends in the original filename (`crystal-digital/products/image-2.png`). Re-run it after editing content in the admin if you want the seed file to reflect reality.
- `npm run state` prints DB row counts, a category audit (how many rows are uncategorised, and any `cat` with no matching category row) plus a Cloudinary orphan/dangling audit — the fastest way to confirm an upload/delete cycle left nothing behind. `npm run e2e` exercises the admin→public product path, the category path *and* the public quote path (create without a slug is rejected, create/update/delete, public visibility, partial update not clobbering other fields, quote submission, `status`/`createdAt` injection ignored, honeypot swallowed but not stored, `GET /api/quotes` still 404, rate limit bites; categories: public read, admin CRUD, append-order preserved, duplicate/blank names rejected case-insensitively, rename following through to products, delete stripping `cat` instead of deleting the product, and a product created with no category at all). **59 checks, all green** (three of them cover mail: a quote still saves and a status change still succeeds with the send suppressed, and re-saving the same status stays 200). Two harness details worth preserving: the `call()` helper parses defensively because Express's own 404 is an HTML page, and each run sends a random `X-Forwarded-For` so the per-IP quote limiter can't make a second run inside the hour fail with 429. A crashed run leaks rows, so the suite first sweeps any `@example.com` quote left behind by a previous attempt.

### Auth security rules (do not regress these)
- **`POST /admin/register` is secret-gated.** It requires a `secret` body field matching `ADMIN_REGISTER_SECRET`, compared with `crypto.timingSafeEqual` (length-checked first). Without it, anyone could self-register an admin and get full write access to every CRUD route. If `ADMIN_REGISTER_SECRET` is unset the endpoint returns **503 and refuses to register** — it never falls back to open access.
- **The password hash must never leave the server.** `AdminModel` has `password: { select: false }`, so the hash is *not* loaded by default queries, plus a `toJSON` transform that strips `password`/`__v`. Responses are built from an explicit `safeUser()` whitelist (`{ id, name, email, role }`) in `controller.js` — never spread or `res.json()` a raw Mongoose admin document.
- **To run a password comparison you MUST opt the hash back in:** `AdminModel.findOne({ email }).select("+password")`. Forgetting it yields a clear thrown error from `comparePassword`, not a silent `true`/`undefined` result.
- `adminLogin` must keep its `catch` block returning a 500 — do not leave it empty, or a thrown error (e.g. bad `ACCESS_TOKEN_SECRET`) hangs the request with no response and the frontend spins forever.
- Password policy lives in the schema: **8–72 characters** (bcrypt's 72-byte limit). Never serialize the raw document from `authMiddleware` either — it already assigns a plain `req.admin` object.

## Where things live & what they do

### App shell & routing
- `src/main.tsx` — entry, mounts `<BrowserRouter>` + `<App />`
- `src/app/App.tsx` — all routes: public site wrapped in `SiteDataProvider` → client `Layout` (the provider sits **above** `Layout`, not per-route, so navigation does not refetch); admin routes nested under `/admin` → `<AdminProvider>` wrapping `AdminApp` (auth gate) → `<AdminLayout>` blueprint → `/`, `/products`, `/gallery`, `/testimonials`, `/quotes`, `/settings` page routes
- `src/app/client/Layout.tsx` — global layout shell: `GlobalStyles` → `Navbar` → `<Outlet/>` → `Footer` → `BackToTop`
- `src/app/client/pages/` — **page components** (one per route):
  - `HomePage.tsx` — assembles the home sections
  - `AboutPage.tsx` — hero + StatCounter + location sections
  - `GalleryPage.tsx` — lightbox gallery that links images to products
  - `ContactPage.tsx` — contact/quote form (posts a WhatsApp-style message)
  - `ProductDetailPage.tsx` — single product view (size select + QuoteModal)
- `src/app/admin/` — **admin dashboard, fully split** out of the former monolithic `AdminApp.tsx`. Layout mirrors the client refactor pattern (types/ data/ constants/ hooks/ components/{ui,layout} pages/). Current structure:
  - `types/interface/<area>/` — TypeScript interfaces (product, quote, gallery, testimonial, setting, category: `adminProduct.ts` (has a required `slug`), `quoteRequest.ts`, `gakkeryItem.ts`, `testimonials.ts`, `siteSetting.ts`, `category/category.ts`)
  - `data/seed.ts` — only `SEED_SETTINGS` remains (the placeholder shown before `GET /admin/settings` resolves). The other four arrays were dead leftovers from the localStorage era and were deleted.
  - `constants/admin.tsx` — admin constants + nav: `PRODUCT_CATS`, `GALLERY_CATS`, `STATUS_COLORS`, `STATUS_BG`, `NAV_ITEMS`, and the `AdminSection` type. **Must stay `.tsx`** because `NAV_ITEMS` contains JSX icon elements (JSX doesn't parse in `.ts` files).
  - `utils/api.ts` — the ONLY place the admin talks HTTP (see "Data / persistence"); `utils/storage.tsx` — `load`/`save` localStorage helpers, now **unused** (kept for the newsletter rebuild); `utils/formatWhen.ts` — `formatWhen(iso)`, shared by the Quotes table/detail modal and the dashboard's recent-quotes list
  - `components/ui/` — one file per admin UI primitive: `badge.tsx` (`Badge`), `modal.tsx` (`Modal`), `confirmModal.tsx` (`ConfirmModal`), `input.tsx` (`Input`), `Textarea.tsx` (`Textarea`), `select.tsx` (`Select`), `imageUploadField.tsx` (`ImageUploadField`), `categorySelect.tsx` (`CategorySelect` — the Category field with inline create/rename/delete; used by the product and gallery modals)
  - `components/layout/` — admin chrome: `adminLogin.tsx` (`AdminLogin` — POSTs `{ email, password }` to the backend `/admin/admin-login`; on success stores `cdaah_admin` + JWT `cdaah_token` in sessionStorage), `sidebar.tsx` (`Sidebar` — router `<Link>`-based nav, active section derived from URL), `adminProvider.tsx` (`AdminProvider` context + `useAdmin()` hook — owns ALL admin state: auth (`sessionStorage["cdaah_admin"]`), the five MongoDB-backed collections and their per-item async mutators, `loading`/`error`, `quoteCount`; pages consume data via `useAdmin()` instead of props), `adminLayout.tsx` (`AdminLayout` — the blueprint: confirmation dialog + `Sidebar` + top bar header + `<main><Outlet/></main>`; no props, derives `section` from the URL path)
  - `pages/` — one file per dashboard panel: `DashBoard.tsx` (`AdminOverview` — uses `useNavigate` instead of `setSection`), `adminProduct.tsx` (`AdminProducts` + `ProductModal` + `emptyProduct` + `slugify`; the modal auto-fills `slug` from the name until the admin edits the field by hand), `quoteRequest.tsx` (`AdminQuotes`), `galleryModal.tsx` (`AdminGallery` + `GalleryModal`), `testimonials.tsx` (`AdminTestimonials` + `TestimonialModal`), `setting.tsx` (`AdminSettings`)
  - `AdminApp.tsx` — the auth gate route element: uses `useAdmin()`; renders `AdminLogin` when not authed, otherwise `<Outlet />` (the admin routes under `AdminLayout`)

### Client structure (the refactor pattern we follow)
```
src/app/client/
├── types/          → TypeScript interfaces only (e.g. types/Product.ts)
├── data/           → `siteDefaults.ts` only (`SITE_DEFAULTS`, `withSettingsDefaults`, `whatsappLink` — the fallbacks for settings-driven copy). Product/gallery/testimonial arrays are gone; everything comes from MongoDB.
├── hooks/          → shared React hooks (useInView, useCounter)
├── utils/          → `api.ts` (`publicApi` incl. `createQuote`, `categories()` and `settings()`, `PublicApiError`, `cdn`) — the ONLY place the public site talks HTTP; `categories.ts` (`categoryFilters`/`inCategory`/`catLabel` — the shared filter-pill logic, see "Categories")
├── components/
│   ├── layout/     → site-wide chrome: Navbar, Footer, BackToTop, globalStyle (globalStyles + GlobalStyles), siteDataProvider (useSiteData)
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
| `FeaturedProducts` | `components/pages/home/homeFeatureProducts.tsx` | Home |
| `Testimonials` (+ `testimonials`) | `components/pages/home/homeTestimonials.tsx` | Home |
| `StatCounter` | `components/pages/aboutUs/aboutUsStatCounter.tsx` | About |
| `QuoteModal` | `components/pages/Product/productQuoteModal.tsx` | ProductDetail |
| `categoryFilters`/`inCategory`/`catLabel` | `utils/categories.ts` | FeaturedProducts, GalleryPage |
| `CategorySelect` | `admin/components/ui/categorySelect.tsx` | AdminProducts, AdminGallery |
| `useInView(threshold)` | `hooks/useInView.ts` | all home sections, StatCounter, ProductDetail, About |
| `useCounter(target, active)` | `hooks/useCounter.ts` | StatCounter (0 → target animation) |
| `Product` (type) | `types/Product.ts` | Gallery, ProductDetail, FeaturedProducts, QuoteModal |
| `PublicGalleryItem`, `PublicTestimonial`, `PublicSettings`, `QuoteSubmission` | `types/Public.ts` | Gallery, Testimonials, both quote forms, Footer/Contact/About/QuoteModal |
| `products`/`gallery`/`testimonials`/`settings` (+ `loading`, `error`) | `components/layout/siteDataProvider.tsx` via `useSiteData()` | FeaturedProducts, Gallery, ProductDetail, Testimonials, Footer, ContactPage, AboutPage |
| `ImageWithFallback` | `src/app/components/figma/ImageWithFallback.tsx` | images with broken-image fallback |

### Shared / library code (don't touch casually)
- `src/app/components/ui/` — shadcn-style UI primitives (button, card, dialog, etc.). Generated boilerplate, imported from `@/components/ui/...` style components.
- `src/app/components/figma/` — `ImageWithFallback` helper.

### Styles / assets
- `src/styles/` — global CSS (`index.css`, `globals.css`, `fonts.css`, `theme.css`, `tailwind.css`)
- `src/imports/` — static images (`image.png` = logo, `image-1..12.png`). **Always imported via RELATIVE paths, never `@/imports/...`** — the user has had path issues with the alias (see conventions below).

### Data / persistence
- **Public products/gallery/testimonials/categories/settings now come from MongoDB** through the public API (see "Public read API"). `data/products.ts` and `data/productSize.ts` were **deleted**; sizes live on each product document. Marketing/hero/about/contact imagery is still bundled locally in `src/imports/`.
- The contact/quote forms now **POST to `/api/quotes`** (see "Public read API"), and that one request is all they make — the owner-alert email is the server's business.
- Admin login goes through the backend (`POST /admin/admin-login`): credentials are not hardcoded in the frontend; the returned JWT is stored as `cdaah_token` in sessionStorage.
- **The admin dashboard IS now fully wired to the backend CRUD for all 6 resources.** There are no `localStorage` seeds left in the admin data path — `adminProvider.tsx` fetches from MongoDB and every mutation is a real API call.
  - `utils/api.ts` is the **single** place that talks HTTP: `API_BASE` (`VITE_API_BASE`, default `http://localhost:3000`), `getToken()`, `ApiError`, and the `api.{getAll,create,update,remove,getSettings,saveSettings}` verbs. It injects `Authorization: Bearer`, prefixes `/admin`, and **calls a registered unauthorized handler on any 401** (the provider registers `onLogout`, so an expired token self-heals by logging out instead of hanging). `adminLogin.tsx` and `imageUploadField.tsx` import `API_BASE`/`getToken()` from here — do not hardcode `http://localhost:3000` anywhere.
  - Response contract is uniformly `{ status, message?, data?, errors? }`. `errors` is a field→message map on validation failure and `api.ts` joins it into the banner text.
  - `adminProvider` exposes **per-item async** methods, not array setters: `createProduct/updateProduct/deleteProduct`, `createGalleryItem/…`, `createTestimonial/…`, `updateQuoteStatus(id, status)`, `deleteQuote(id)`, `refreshQuotes()`, `saveSettings`, and `createCategory(name)/renameCategory(id, name)/deleteCategory(id, name)`. The last two also rewrite `cat` across the provider's own `products`/`gallery` state, because the server does the same to the documents. It also exposes `loading`, `error`, `clearError`, `quoteCount`. The array setters (`setProducts` etc.) are **gone** — pages must not reintroduce them.
  - On mount (and after login) the provider `Promise.all`s all six GETs. The sixth is `categories` — the shared product/gallery category list, and the reason the Category selects in the product/gallery modals are populated at all. `AdminApp.tsx` renders a spinner while that first load is in flight, so pages never flash empty tables.
  - **The provider never refetches on a timer**, so a quote submitted by a customer will not appear until you press **Refresh** on the Quotes page (which calls `refreshQuotes()`) or reload. `quoteRequest.tsx` also calls `refreshQuotes()` on mount, so navigating away and back picks up new rows. Polling was deliberately not added — it would silently swap rows under an open detail modal.
  - `updateQuoteStatus` sends **only** `{ status }`. The backend uses `findByIdAndUpdate` (not `replaceOne`), so partial updates preserve the other fields — this is what makes the partial update safe.
  - **Known limitation: 15-minute token expiry with no refresh flow.** A 401 logs the admin out and they must sign in again. `REFRESH_TOKEN_SECRET` is in `.env` but still unused. Adding refresh tokens is the natural next step.
- `utils/storage.tsx` (`load`/`save`) is now **unused** — its last caller was the newsletter broadcast in `adminProduct.tsx`, which was removed. It is kept for the newsletter rebuild; delete it if that work never happens.
- The public site **is** connected for products, gallery, testimonials, settings **and quote submission** — `ContactPage.tsx` and `productQuoteModal.tsx` POST to `/api/quotes` via `publicApi.createQuote`, and `useSiteData().settings` feeds the footer/contact/about copy. There is no remaining functional gap on the public side.
### Email: Resend, server-side only (replaced FormSubmit on 2026-09-28)
- **All email is now sent from the backend via Resend** (`resend` npm package). `src/utils/mailer.js` is the only reader of `RESEND_API_KEY`; it must never be imported by frontend code.
- **There are exactly two emails**, both in `src/utils/notifications.js`:
  | Function | Trigger | To | Reply-To |
  |---|---|---|---|
  | `notifyOwnerOfQuote(quote)` | inside `createPublicQuote`, after the row is saved | `OWNER_EMAIL` | the customer |
  | `notifyCustomerOfStatus(quote)` | `PUT /admin/quotes/:id`, **only when `status` actually changes** | `quote.email` (from the stored doc) | the owner |
- **`resend.emails.send()` takes `CreateEmailOptions`, which is camelCase — use `replyTo`, not `reply_to`.** The snake_case spelling belongs to the low-level `EmailApiOptions` type and is silently dropped by the SDK, which would make every reply land back on the sender instead of the customer. The fake-key test cannot catch this (it fails at auth before body validation).
- **`client/utils/notifyOwner.ts` and `admin/utils/sendNotification.tsx` were deleted.** Do not reintroduce browser-side email: the API key would have to reach the client, and the recipient address would become caller-controlled, i.e. an open relay that will email anyone.
- **The recipient is never read from the request body.** `updateQuote` reads the stored document, so `PUT /admin/quotes/:id` cannot be used to mail a third party. That is also why `admin/quotes/controller.js` does *not* use the generic `crud.js` `updateOne`, which cannot see `before.status` and so cannot detect a real transition. `isObjectId` is now exported from `crud.js` for it.
- **Everything is fire-and-forget and nothing throws.** A mail outage must never cost a customer their quote. `sendMail` catches everything, logs, and returns `{ sent, reason }`. `e2e.mjs` asserts a quote still saves (201) and a status change still succeeds (200) with `RESEND_API_KEY` unset.
- **⚠ Sending is skipped for IANA reserved test domains** (`@example.com|.net|.org`, `@test`, `@invalid`) via `isTestAddress()` in `notifications.js`. It is checked against the **quote's** address, not the recipient, so it also silences the owner alert. This is not a test-only backdoor — those domains are RFC 2606/6761 reserved and can never be a real customer mailbox. Without it, configuring a real `RESEND_API_KEY` would mail the owner ~15 times per e2e run and Resend would try to deliver to undeliverable addresses. Verified with a key configured: full suite green, zero Resend calls; a real address still sends. Do not widen this pattern.
- **Duplicate suppression matters:** re-selecting the same status in the admin dropdown must not send a second email. The old frontend code did send one every time.
- **RESEND_API_KEY is currently empty, so nothing is actually being sent yet.** Placeholders are in `.env` (`RESEND_API_KEY`, `MAIL_FROM`, `OWNER_EMAIL`); `OWNER_EMAIL` is pre-filled with the address that used to be hardcoded in the two public forms. Until a key is added the site logs `[mailer] RESEND_API_KEY is not set` and carries on. The user has to create the account.
- **`MAIL_FROM` falls back to `onboarding@resend.dev`, which can only send to the account owner's own inbox.** Enough to verify the setup end to end, but a real customer receives nothing until a domain is verified in Resend and set as `MAIL_FROM`.
- **`.env` changes need a manual nodemon restart** (it only watches `js,mjs,cjs,json`). Add the key, then restart the backend or nothing will change.
- Everything interpolated into the email HTML goes through `esc()`: the body carries customer-supplied name/message text.
- The email footer reads the **settings doc**, so the phone/address in outgoing mail stays correct when the admin edits it. This retired the hardcoded `"Call +977-61-XXXXXX or visit crystaldigital.com.np"` line.
- **The newsletter broadcast is gone, and it was never working anyway.** `adminProduct.tsx` used to email every entry in `load("cdaah_subscribers")` when a product was created, but that list is written to the *visitor's* `localStorage` by the footer and read from the *admin's* `localStorage`, so the admin's copy was always empty. Doing it properly means a `subscribers` collection behind `POST /api/subscribers` plus double opt-in. Not started, ask first.
- The quote modal's file input still only captures the **filename**; the bytes are never uploaded. The UI now says so, and the admin detail modal shows an amber reminder to ask the customer to email the artwork. A real upload needs a public upload route, which is a spam surface — treat it as its own piece of work.

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
