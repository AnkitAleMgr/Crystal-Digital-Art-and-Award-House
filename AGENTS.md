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
├── migrateCustomization.mjs     ← one-shot: `customizable: [String]` tags → `customizationFields` [{label, required, maxLength}] (npm run migrate:customization)
├── dumpSeed.mjs                 ← regenerates src/seed/data.mjs from the current DB (npm run seed:dump)
├── seedSettings.mjs             ← fills the single settings doc from src/seed/settings.mjs (npm run seed:settings)
├── seedCategories.mjs           ← inserts any missing category names from src/seed/categories.mjs (npm run seed:categories)
├── e2e.mjs                      ← live admin→public contract checks (npm run e2e)
├── state.mjs                    ← DB row counts (incl. subscribers) + category audit + Cloudinary orphan/dangling audit (npm run state). It reads products/gallery `imgPublicId` AND quotes `attachmentPublicId` — skipping the latter reports live customer artwork as an orphan on every run.
├── src/
│   ├── utils/
│   │   ├── db.js                ← DB_CONNECT (MONGO_DB_URI)
│   │   └── crud.js              ← generic CRUD factory (getAll/createOne/updateOne/deleteOne); also exports the shared `mapDoc` (strips `_id`/`__v`, returns `id`) and `fail` (Mongoose `ValidationError` → 400 + `errors{}` field map, `CastError` → 404, else 500). `updateOne`/`deleteOne` 404 on a non-24-hex id instead of leaking "Cast to ObjectId failed". Optional `{ withImages }` deletes the old Cloudinary asset on replace/delete.
│   ├── claudinery/
│   │   └── claudineryService.js ← Cloudinary wrapper (note: folder name typo is intentional/kept): uploadImage/deleteImage/deliveryUrl/isConfigured
│   │   ├── mailer.js            ← Resend transport: sendMail({to,subject,html,replyTo,headers}), isMailConfigured, mailFrom (MAIL_FROM → onboarding@resend.dev), ownerEmail. Never throws.
│   │   ├── notifications.js     ← every email the site sends: notifyOwnerOfQuote, notifyCustomerOfStatus, notifySubscriberOfConfirmation, notifySubscribersOfProduct. All take a DB doc, never req.body.
│   │   ├── subscribeTokens.js   ← signs/verifies the confirm + unsubscribe link tokens (purpose-scoped, no DB column)
│   │   └── siteUrl.js           ← SITE_URL helper; every link in every email is built from it
│   ├── public/{controller,route}.js  ← unauthenticated GET /api/products|categories|gallery|testimonials|settings + POST /api/quotes|subscribers|subscribers/confirm|subscribers/unsubscribe
│   ├── seed/data.mjs             ← canonical seed content (generated; see "Content migration")
│   ├── seed/settings.mjs         ← canonical business details (hand-written, see "Settings-driven copy")
│   ├── seed/categories.mjs       ← SEED_CATEGORIES + the shared `upsertCategories()` insert-only helper (hand-written; see "Categories")
│   ├── middleware/
│   │   ├── authMiddleware.js    ← JWT gate: verifies Bearer token, loads admin, sets req.admin
│   │   ├── requireAdmin.js      ← role gate on req.admin.role === "admin"; only /admin/users uses it
│   │   ├── rateLimit.js         ← in-memory sliding-window factory, no dependency. Exports `rateLimit({max,windowMs,keyPrefix,message,scope,onLimit})` plus the mounted middlewares `quoteRateLimit` (10/IP/hour), `subscribeRateLimit` (5/IP/hour) and `artworkDailyBudget` (25/day site-wide, flags rather than rejects)
│   │   └── imageUpload.js       ← the ONE definition of an acceptable upload: `MAX_IMAGE_BYTES` (5MB), `ALLOWED_IMAGE_MIME_TYPES` (no SVG), `singleImage` (admin, type-filtered), `singleAnyFile` (public quote, unfiltered), `uploadErrorHandler` (answers 4xx) and `artworkUploadFallback` (logs and continues, so bad artwork never costs the enquiry)
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
│       ├── subscribers/{model,controller,route}.js ← GET + DELETE only (see "Newsletter"); no admin create/update
│       ├── users/{controller,route}.js            ← admin/staff accounts: GET list, POST create, DELETE :id (the first admin is made by /admin/register instead — see "Bootstrapping the first admin")
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

### The slug is server-owned (2026-10-01)
- **The admin product form no longer has a URL Slug field at all.** The controller derives it from the product name (`slugify` + `uniqueSlug`, which appends `-2`, `-3` on collision so a second "Crystal Award" cannot 500 on the unique index). `POST /admin/products` builds the document field by field and never reads `slug` from the body, and `updateProduct` strips `slug`/`id`/`_id`/`__v` before delegating to the generic partial update — so a crafted POST **and** a crafted PUT are both unable to move a product's public URL.
- **The slug is frozen on an existing product.** `findByIdAndUpdate` with `runValidators` would reject a body carrying no `slug` at all if the column stayed `required`, and renaming a product must not break a URL already printed on somebody's invoice.
- The column is still `required`/`unique` and public products are still filtered to `slug != ""`, because the **legacy** slugless row ("test product 1") is still in the database and must stay invisible. That is now the *only* reason for the filter — new products can no longer be created without one, so do not read `npm run e2e`'s old "create without a slug is rejected" check as still describing the create path.
- On **edit** the modal shows a read-only `Public page: /products/<slug>` hint instead of an input.

### Customization fields (the quote form is now admin-defined)
This replaced `customizable: [String]`, a list of marketing tags ("Company or school logo") that rendered on the product page and were collected **nowhere**.

- **`ProductModel.customizationFields` is `[{ label, required, maxLength }]`, `_id: false`.** `required` is a per-field admin checkbox, and `maxLength` (default 300, clamped 20–1000) exists so a customer cannot paste an essay into "Recipient name". The clamp in the schema is the one that actually holds, because the admin `PUT` runs `runValidators`.
- **A product with no fields is a first-class state**, not a placeholder — the modal then asks for nothing beyond the standard details.
- **Enforcement is in three places, and only the third is load-bearing:** the quote modal (`required` + a JS pre-check), the schema's `maxLength`, and `POST /api/quotes`. The server loads the product by `productSlug` and checks the answers against **the product's own definition**, so it cannot be spoofed by posting an arbitrary label list.
- **`QuoteModel.engrave` is gone, replaced by `customization: [{ label, value }]`.** The label travels with the value so an answer stays readable after the field is renamed or deleted, and so the owner email can render one row per answer instead of a blob.
- ⚠ **Four pre-migration quotes still carry a raw `engrave` value in Mongo, and removing the schema field did NOT delete them.** `mapDoc` reads documents `lean()`, which returns the raw BSON, so `engrave` still comes back in `GET /admin/quotes` for those rows even though nothing in the schema declares it — verified, 4 of 5 rows. **No input collects it and nothing renders it**: it is absent from the admin `QuoteRequest` type, the detail modal, the CSV and the notifications, so the text is currently invisible in the dashboard while surviving in the database. Nothing is lost and no migration is needed; if that history should be visible again, re-add it as a **read-only** field (type + detail row + CSV column) and deliberately keep the customer-facing input removed. Do not "restore" it as a form field.
- **Three deliberate asymmetries in `readCustomization()` (`public/controller.js`):** a missing/blank **required** answer is a 400 keyed `customization.<label>`; an answer to a field the product does not define is **dropped silently** (the admin deleted it between page load and submit — not the customer's fault); an answer **over** `maxLength` is **truncated, not refused** (a nuisance, not an attack). Optional fields are stored as `""`, never invented.
- **`size` is required whenever the product has a `sizes` list, and must be one of them.** A product with no sizes must not demand one, so the check is conditional on `product.sizes.length > 0`. The modal renders a `required` `<select>`; the product page's size pills can no longer be clicked off (they were a toggle, which let a customer un-pick and submit nothing).
- ⚠ **`FormData` holds strings only.** The quote posts multipart (the artwork rides along), so `customization` arrives as a **JSON string**, not an array. `publicApi.createQuote` therefore `JSON.stringify`s non-string values, and `readCustomization` `JSON.parse`s a string before reading it. Before this was handled, every answer arrived as `"[object Object]"`, was read as missing, and *every* quote 400'd on a required field — a bug that only appears through the real form, which is why `e2e.mjs` now has a **multipart** customization check alongside the JSON ones.
- **Migration: `npm run migrate:customization`** (`migrateCustomization.mjs`), already run once — 11 products, 52 fields. Idempotent (skips anything already carrying `customizationFields`) and case-insensitively de-dupes labels. **Every migrated field is `required: false` on purpose:** those strings were written as "we can do this for you" bullets, so making them mandatory would block every quote on every existing product until reviewed. The admin ticks Required per field.
- Consumers that had to change with it: `public/controller.js` `publicProduct`, the admin + client `Product` types, `ProductDetailPage.tsx` (renders the labels as its numbered "what we need from you" list), `quoteRequest.tsx` (detail modal + the CSV `customization` column), `DashBoard.tsx` (`quoteSummary()` — the recent list fell back to `engrave`, which no longer exists), and `utils/notifications.js` (one email row per answer).

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
- **The admin header's "View Site" control opens the public home page in a NEW TAB** (`<a href="/" target="_blank" rel="noopener noreferrer">`, not a router `<Link>` and not a `button`). A `target="_blank"` needs no confirmation dialog, so the old "Leave Admin?" modal is gone and `confirmAction` collapsed to a `confirmLogout` boolean — that modal was doubly dead anyway: its `handleConfirm` ran `window.location.hash = ""`, which is a no-op under `BrowserRouter` (it only ever worked for a `HashRouter`), and its copy pointed at the footer "Admin" link removed the day before.
- **That link's label is wrapped in `hidden sm:inline` for the icon-only mobile header, which strips it from the accessible name** — `getByRole("link", { name: /view site/i })` then times out at 390px. It carries an explicit `aria-label="View Site"` so the name is stable at every width. Worth remembering for any other header control that hides its text on mobile.


### `POST /api/quotes` — public quote submission
- Route: `PublicRoute.post("/quotes", quoteRateLimit, singleAnyFile("artwork"), artworkUploadFallback, artworkDailyBudget, createPublicQuote)`. Order is load-bearing — see "Customer artwork uploads" below.
- **`createPublicQuote` builds the document field by field and never spreads `req.body`.** `status` is hardcoded to `"new"` and the timestamps come from `{ timestamps: true }`. This is deliberate: spreading the body would let a crafted POST pre-`closed` its own quote or backdate it. `e2e.mjs` checks both.
- The 201 response returns only `{ id, createdAt }` — never the stored doc, which would echo the customer's email/message straight back.
- Validation is hand-rolled (name/email present, `QUOTE_EMAIL_PATTERN` from `quotes/model.js`) so the messages are human-readable, then `fail(res, error, 400)` catches anything Mongoose rejects. The public 400s use the same `{ status, message, errors }` envelope as everything else.
- **Honeypot:** a `website` field, hidden off-screen with `aria-hidden` + `tabIndex={-1}` in both forms. If it comes back non-empty the request is answered **201 without storing anything** — replying with an error tells the bot it was caught. `e2e.mjs` asserts both the 201 and the no-op.
- **Rate limit** is `quoteRateLimit` from `src/middleware/rateLimit.js`: 10 requests per IP per hour, in-memory sliding window, no dependency. It buckets on **`X-Forwarded-For` first, then `req.ip`** — behind a proxy without `app.set("trust proxy", ...)` express reports the *proxy's* address, which would collapse every visitor into one shared bucket. It is in-memory, so it resets on restart and does not span multiple instances; move it to Redis if this is ever deployed to more than one.
- 429 responses set `Retry-After` and return the standard envelope with a "call us directly" message rather than a bare error.

### The quote document changed shape (do not reintroduce `date`)
- **`date` is gone from the schema.** It was a `String` that nothing ever populated, which is why the admin Date column was blank. `{ timestamps: true }` already gives `createdAt`/`updatedAt` as real Dates; `formatWhen()` (`admin/utils/formatWhen.ts`) renders them. Both are now in the admin `QuoteRequest` type.
- **New fields, because the forms always collected them and Mongoose silently dropped them:** `service` (contact form), `quantity`, `attachment` (quote modal), `productSlug`. Every string is `trim` + `maxlength`-capped so the admin `PUT` (which runs `runValidators: true`) cannot write absurd values. `engrave` was here once and has since been replaced by `customization` — see "Customization fields".
- `email` is `required` **and** `match: QUOTE_EMAIL_PATTERN`, so the admin `PUT` validates format too. Both public forms therefore mark the email input `required` — previously it was optional in the UI while the schema demanded it, which would have 400'd.
- `quantity` is a `String`, not a Number: the modal's input can be cleared mid-edit, and a Number field would fail validation on `""`.
- The frontend reaches these only through `src/app/client/utils/api.ts` (`publicApi`). Do not hardcode `http://localhost:3000` in a component.

### Newsletter: real subscribers, double opt-in, product broadcast
This replaced the browser-side `localStorage` list, which never worked — the footer wrote `cdaah_subscribers` into the *visitor's* browser while the broadcast read it out of the *admin's* browser, so the admin's copy was always empty. See "Newsletter" for the frontend side.

```
POST /api/subscribers               → subscribe (rate limited, honeypot)
POST /api/subscribers/confirm       → confirm a token from the email link
POST /api/subscribers/unsubscribe   → unsubscribe a token from the email link
GET  /admin/subscribers             → list all (protected)
DELETE /admin/subscribers/:id       → remove a row (protected)
```
- **Status is the state machine: `pending` → `active` → `unsubscribed`, and `unsubscribed` → `pending` on re-subscribe.** A row is created `pending`; it receives nothing until confirmed, so a scraped or typo'd address never gets mailed. Re-subscribing an existing address **reuses the same row** (unique index on `email`, lowercased+trimmed) and resets it to `pending` rather than inserting a duplicate — `e2e.mjs` asserts the row count does not change.
- **`POST /api/subscribers/confirm` and `/unsubscribe` are POST-only, and the frontend pages POST for you.** The email links point at real **frontend** pages (`/subscribe/confirm`, `/unsubscribe`) rather than at the API. That is deliberate: link scanners (Outlook, Gmail, Proofpoint) follow every URL in an incoming email during delivery, and a bare `GET /api/subscribers/confirm?token=…` would let a scanner confirm or unsubscribe the address before the human ever saw it. The page loads, then POSTs the token, so a scanner's GET is inert. **Do not "simplify" this into GET endpoints.**
- **Tokens are stateless** — `src/utils/subscribeTokens.js` signs a purpose-scoped JWT (`{ sub, purpose }`) with `SUBSCRIBER_TOKEN_SECRET`, falling back to `ACCESS_TOKEN_SECRET`, and there is **no token column in the schema**. Confirm links expire in 24h, unsubscribe links in 365d. The `purpose` claim is verified on use, so a confirm token cannot be replayed at the unsubscribe endpoint. Keep it stateless; adding DB token columns would be a downgrade.
- **Stale tokens 409, and unsub/unsub is idempotent 200.** Confirming an already-`unsubscribed` row is `409` ("this link is no longer valid") rather than silently re-activating someone who opted out. Unsubscribing twice, or with a garbage token, is still `200`, because the user-visible outcome they wanted has been reached either way and a scary error would be wrong.
- **The admin subscriber API is GET + DELETE only — there is deliberately no POST/PUT.** A subscriber row is created by a member of the public, never by the dashboard. Renaming or forcing a status from the admin is exactly how you get people mailed who did not ask for it. The admin's only lever is *delete*.
- **The product broadcast is fire-and-forget and lives in a hand-written `createProduct`** (`admin/products/controller.js`), not in `crud.js`. It runs **after** the row is saved, and only for products **with a slug** — a slug-less row has no public page, so there is nothing to link to. It mails `active` subscribers only; `pending` (unconfirmed) and `unsubscribed` are skipped. **Broadcast is on create only**, not on update: re-saving a product must not re-mail the list.
- **`subscribeRateLimit` is 5/IP/hour**, separate from `quoteRateLimit`'s 10/IP/hour, and both are instances of the `rateLimit()` factory in `src/middleware/rateLimit.js`.
- **The product-broadcast email carries RFC 8058 one-click headers** (`List-Unsubscribe` + `List-Unsubscribe-Post`) so Gmail can offer a native "Unsubscribe" button. ⚠ **`List-Unsubscribe-Post` currently points at the same SPA page URL as the visible link.** A compliant one-click POST needs a URL that *accepts* a provider POST, which a client-side route does not. If native one-click matters, the fix is a small token-in-query POST endpoint on the API, not a change to the page.
- **`SITE_URL` (`utils/siteUrl.js`) builds every link in every email** and strips its own trailing slash, so `SITE_URL=http://localhost:5173` does not produce `//subscribe/confirm`. It is currently the Vite dev URL — **set it to the real origin before deploying**, or every confirmation link will point at localhost and no real customer can confirm.
- Verified in a real browser: footer invalid/duplicate/network states, both result pages, and the admin table all behave; and a full live cycle (subscribe → receive → confirm → product created → broadcast received → unsubscribe) was confirmed against the owner inbox with real Resend message ids.

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
- ⚠ **Do not delete `data.mjs` on the grounds that it is "just dummy content".** It is a *snapshot* of the original content, not a fixture, and it is the only copy that is not tied to one specific database — i.e. the recovery path if the production DB is wiped or `npm run seed -- --force` is run by accident. It is ~25KB against a ~19MB `dist/`, so it costs no meaningful space, and it will be needed at first deploy if the host's `MONGO_DB_URI` points at an empty database (`migrate.mjs` exists to populate exactly that).
- `npm run state` prints DB row counts, a category audit (how many rows are uncategorised, and any `cat` with no matching category row) plus a Cloudinary orphan/dangling audit — the fastest way to confirm an upload/delete cycle left nothing behind. `npm run e2e` exercises the admin→public product path, the quote rules, the category path, the public quote path **and the full newsletter cycle** (a posted slug is ignored and the server derives one from the name, a duplicate name gets a `-2` suffix, PUT cannot move the URL, create/update/delete, public visibility, partial update not clobbering other fields, a zero-customization product is legal, customization fields carry no subdocument `_id`; quote rules: a sized product rejects a size-less quote, an invented size is refused, a missing or whitespace-only required answer is refused, a spoofed label list cannot satisfy a required field (the 400 is keyed on the product's own field), an invented label is dropped not stored, an omitted optional answer is stored empty, an over-long answer is truncated, a since-deleted field is dropped, an unknown `productSlug` is refused, a general enquiry with no slug is unaffected, and a **multipart** quote keeps its answers; plus quote submission, `status`/`createdAt` injection ignored, honeypot swallowed but not stored, `GET /api/quotes` still 404, rate limit bites; categories: public read, admin CRUD, append-order preserved, duplicate/blank names rejected case-insensitively, rename following through to products, delete stripping `cat` instead of deleting the product, and a product created with no category at all; subscribers: pending row gets no broadcast, confirm flips it to active, the broadcast then lands, unsubscribe stops it, re-subscribe reuses the same row, tokens are purpose-scoped, a stale confirm is 409, unsub/unsub is 200, and the honeypot swallows; artwork: a real PNG is stored in `quote-artwork` under a randomised name, is actually served back from Cloudinary, the honeypot stores nothing even with a file attached, a PDF costs the file but not the quote, and deleting the quote destroys the asset). **135 checks, all green** (five of them cover mail: a quote still saves, a status change still succeeds, and the subscribe cycle still completes, with the send suppressed). Two harness details worth preserving: the `call()` helper parses defensively because Express's own 404 is an HTML page, and each run sends a random `X-Forwarded-For` so the per-IP quote limiter can't make a second run inside the hour fail with 429 — the subscribe-burst block randomises its IP for the same reason, and **check 8b uses two further IPs of its own** (its ten POSTs are the whole 10/hour budget), so **the suite is repeatable inside an hour**. A crashed run leaks rows, so the suite sweeps first: any `@example.com` quote **and any product whose name starts with `E2E `**. The product sweep must run *before* the slug checks, because the slug is derived from the name — one leftover fixture shifts every `-2`/`-3` suffix the suite expects.

### Auth security rules (do not regress these)
- **`POST /admin/register` is secret-gated.** It requires a `secret` body field matching `ADMIN_REGISTER_SECRET`, compared with `crypto.timingSafeEqual` (length-checked first). Without it, anyone could self-register an admin and get full write access to every CRUD route. If `ADMIN_REGISTER_SECRET` is unset the endpoint returns **503 and refuses to register** — it never falls back to open access.
- **The password hash must never leave the server.** `AdminModel` has `password: { select: false }`, so the hash is *not* loaded by default queries, plus a `toJSON` transform that strips `password`/`__v`. Responses are built from an explicit `safeUser()` whitelist (`{ id, name, email, role }`) in `controller.js` — never spread or `res.json()` a raw Mongoose admin document.
- **To run a password comparison you MUST opt the hash back in:** `AdminModel.findOne({ email }).select("+password")`. Forgetting it yields a clear thrown error from `comparePassword`, not a silent `true`/`undefined` result.
- `adminLogin` must keep its `catch` block returning a 500 — do not leave it empty, or a thrown error (e.g. bad `ACCESS_TOKEN_SECRET`) hangs the request with no response and the frontend spins forever.
- Password policy lives in the schema: **8–72 characters** (bcrypt's 72-byte limit). Never serialize the raw document from `authMiddleware` either — it already assigns a plain `req.admin` object.

### Bootstrapping the first admin (a fresh/empty database)
Every `/admin/*` route past `authMiddleware` needs a JWT, so on a brand-new database **nobody can log in until the first admin exists**. There is no admin seed script — `src/seed/data.mjs` has products/gallery/testimonials only, no admins. MongoDB is schemaless, so Mongoose creates the `admins` collection on the first insert; nothing to create by hand.

```bash
curl -X POST http://localhost:3000/admin/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Owner","email":"you@gmail.com","password":"AtLeast8Chars","secret":"<ADMIN_REGISTER_SECRET>"}'
```

- `adminRegister` **never reads `role` from the body**, so the schema's `default: "admin"` (`auth/model.js`) applies and the first account is always an admin. Everything after it is made from Admin → Admins & Staff.
- **`ADMIN_REGISTER_SECRET` stays valid forever**, so as long as it is set in `.env` anyone holding that secret can mint admins. Unset it after bootstrapping (the route then 503s) and use `/admin/users` from then on.
- Fresh DB also needs `npm run seed:categories` **then** `npm run seed` (products reference category names), plus `npm run seed:settings`. `npm run seed` refuses to run once products have slugs — it is guarded; `-- --force` wipes and reseeds *and* destroys the Cloudinary assets of the rows it removes.
- ⚠ **The connection string needs an explicit database name.** `mongodb+srv://user:pw@host/?appName=X` (nothing between `/` and `?`) silently connects to a database called `test` — it works, so there is no error, and all the content lands there. Use `mongodb+srv://user:pw@host/crystaldigital?appName=X`.
- ⚠ **`.env` changes need a manual `nodemon` restart.** `claudineryService.js` reads `process.env` at *import* time, so Cloudinary stays unconfigured (503) until the process restarts even with correct keys.

### Switching accounts / client sandbox (`.env` vs `.env-real`)
The whole swap is config-only; no code changes. `.gitignore` has `.env*`, so `.env`, `.env-real` and `.env.example` are all untracked and safe.

- The current working values live in **`.env-real`**; **`.env`** is the sandbox/client file you fill. Swap back with `rm .env && mv .env-real .env`.
- Only 7 values actually change: `MONGO_DB_URI`, `CLOUDINARY_CLOUD_NAME`/`API_KEY`/`API_SECRET`, `RESEND_API_KEY`, `MAIL_FROM`, `OWNER_EMAIL`.
- **The four secrets are any string, long and random — the only rule is no `#`.** dotenv truncates unquoted values at `#` (verified: `A=abc#def` → `abc`). `ACCESS_TOKEN_SECRET` signs the login JWT and `ADMIN_REGISTER_SECRET` gates admin creation, so **never rotate them after boot** — changing `ACCESS_TOKEN_SECRET` silently invalidates every session. `SUBSCRIBER_TOKEN_SECRET` is separate on purpose so rotating the JWT secret does not kill every unsubscribe link already sitting in an inbox.
- ⚠ **`MAIL_FROM` must never be a personal address (e.g. a `@gmail.com`).** Resend rejects it outright: `The gmail.com domain is not verified`, so *nothing* is delivered and the failure is only visible in the server log. Only a domain you own and verified in Resend may be the sender. Blank `MAIL_FROM` falls back to `onboarding@resend.dev`, which delivers **only to the Resend account owner's own inbox** — a second Resend address, not `OWNER_EMAIL`. Until the client's domain is verified, that sandbox limit means you cannot mail anyone else, which is the expected behaviour and not a bug.
- Getting a domain verified (one-time, per client): Resend → Domains → Add → paste the DNS records at the domain host → wait for **Verified** → then set `MAIL_FROM=Client Name <no-reply@clientdomain.com>`. Verification is about **you**, never the recipient, so once done any `@gmail.com`/`@yahoo.com` address can be mailed. Propagating can take hours, so start it before launch.

### Deploy-time env (three values, not one)
- `SITE_URL` — the **website** the public visits, used only to build links inside emails. `PORT` is the **API**. Same app, different doors; `SITE_URL` must be the real origin with no port (`https://client.com`), or every confirmation/unsubscribe link leads nowhere.
- `PORT` — read as `process.env.PORT || 3000`, so hosts inject it and no code change is needed. Leave the local `3000` in `.env`; it is harmless.
- `VITE_API_BASE` — **the frontend's "where is the API?" address**, defaulting to `http://localhost:3000` (`admin/utils/api.ts`). It **must** be set when hosted or the visitor's browser fetches its own localhost. The `VITE_` prefix is required (that is the only prefix Vite exposes to the browser, and the API secret is safe because it lacks the prefix) and it is **baked in at build time**, so changing it needs a rebuild, unlike `SITE_URL` which is read at runtime.
- Vite itself is a **dev-time-only** tool: `npm run dev` serves `:5173`, `npm run build` emits static `dist/` with no Vite in it, and the host never runs Vite again. Only static files are deployed.

## Where things live & what they do

### App shell & routing
- `src/main.tsx` — entry, mounts `<BrowserRouter>` + `<App />`
- `src/app/App.tsx` — all routes: public site wrapped in `SiteDataProvider` → client `Layout` (the provider sits **above** `Layout`, not per-route, so navigation does not refetch); two public email-link pages at `/subscribe/confirm` and `/unsubscribe` (outside `Layout`); admin routes nested under `/admin` → `<AdminProvider>` wrapping `AdminApp` (auth gate) → `<AdminLayout>` blueprint → `/`, `/products`, `/gallery`, `/testimonials`, `/quotes`, `/subscribers`, `/users`, `/settings` page routes
- `src/app/client/Layout.tsx` — global layout shell: `GlobalStyles` → `Navbar` → `<Outlet/>` → `Footer` → `BackToTop`
- `src/app/client/pages/` — **page components** (one per route):
  - `HomePage.tsx` — assembles the home sections
  - `AboutPage.tsx` — hero + StatCounter + location sections
  - `GalleryPage.tsx` — lightbox gallery that links images to products. The **grid** images come from the DB via `cdn()`, but the **banner is a static local import** (`imports/image-7.png`), like the About/Contact/Hero headers. It briefly read from the `gallery` collection (looking for `label === "Full Award Collection Display"`, falling back to the first item) so the admin could change it, but that made the banner render blank on an empty gallery — decoration belongs in the code, not the database.
  - `ContactPage.tsx` — contact/quote form (posts a WhatsApp-style message)
  - `ProductDetailPage.tsx` — single product view (size select + QuoteModal)
  - `subscribeConfirmPage.tsx` / `unsubscribePage.tsx` — the two email-link landing pages (POST the `?token=` on mount; see "Newsletter")
- `src/app/admin/` — **admin dashboard, fully split** out of the former monolithic `AdminApp.tsx`. Layout mirrors the client refactor pattern (types/ data/ constants/ hooks/ components/{ui,layout} pages/). Current structure:
  - `types/interface/<area>/` — TypeScript interfaces (product, quote, gallery, testimonial, setting, category, subscriber: `adminProduct.ts` (has a required `slug`), `quoteRequest.ts`, `gakkeryItem.ts`, `testimonials.ts`, `siteSetting.ts`, `category/category.ts`, `subscriber/subscriber.ts`)
  - `types/adminUser.ts` — `AdminRole` (`admin | staff`), `AdminUser`, `AdminUserCreate`. **Not** under `types/interface/<area>/` like the other types; it predates that folder.
  - `data/seed.ts` — only `SEED_SETTINGS` remains (the placeholder shown before `GET /admin/settings` resolves). The other four arrays were dead leftovers from the localStorage era and were deleted.
  - `constants/admin.tsx` — admin constants + nav: `STATUS_COLORS`, `STATUS_BG`, `NAV_ITEMS`, and the `AdminSection` type. **Must stay `.tsx`** because `NAV_ITEMS` contains JSX icon elements (JSX doesn't parse in `.ts` files).
  - `utils/api.ts` — the ONLY place the admin talks HTTP (see "Data / persistence"); `utils/formatWhen.ts` — `formatWhen(iso)`, shared by the Quotes table/detail modal and the dashboard's recent-quotes list; `utils/csv.ts` — `downloadCsv(filename, header, rows)`, the ONE CSV writer, used by both the Quotes and Subscribers exports (see "CSV export")
  - `components/ui/` — one file per admin UI primitive: `badge.tsx` (`Badge`), `modal.tsx` (`Modal`), `confirmModal.tsx` (`ConfirmModal`), `input.tsx` (`Input`), `Textarea.tsx` (`Textarea`), `select.tsx` (`Select`), `imageUploadField.tsx` (`ImageUploadField`), `categorySelect.tsx` (`CategorySelect` — the Category field with inline create/rename/delete; used by the product and gallery modals)
  - `components/layout/` — admin chrome: `adminLogin.tsx` (`AdminLogin` — POSTs `{ email, password }` to the backend `/admin/admin-login`; on success stores `cdaah_admin` + JWT `cdaah_token` in sessionStorage), `sidebar.tsx` (`Sidebar` — router `<Link>`-based nav, active section derived from URL), `adminProvider.tsx` (`AdminProvider` context + `useAdmin()` hook — owns ALL admin state: auth (`sessionStorage["cdaah_admin"]`), the six MongoDB-backed content collections plus `subscribers` and their per-item async mutators, `loading`/`error`, `quoteCount`; pages consume data via `useAdmin()` instead of props), `adminLayout.tsx` (`AdminLayout` — the blueprint: sign-out confirmation + `Sidebar` + top bar header (with the "View Site" new-tab link and the new-quotes shortcut) + `<main><Outlet/></main>`; no props, derives `section` from the URL path)
  - `pages/` — one file per dashboard panel: `DashBoard.tsx` (`AdminOverview` — uses `useNavigate` instead of `setSection`), `adminProduct.tsx` (`AdminProducts` + `ProductModal` + `emptyProduct` + `slugify`; the modal auto-fills `slug` from the name until the admin edits the field by hand), `quoteRequest.tsx` (`AdminQuotes`), `galleryModal.tsx` (`AdminGallery` + `GalleryModal`), `testimonials.tsx` (`AdminTestimonials` + `TestimonialModal`), `subscriber.tsx` (`AdminSubscribers` — list/filter/CSV/delete only, no create or edit), `adminManagement.tsx` (`AdminManagement` — the **Admins & Staff** page; self-gates on `isAdminUser` and shows "Only admins can manage admins and staff." otherwise, because the route itself is already `requireAdmin`-guarded server-side), `setting.tsx` (`AdminSettings`)
  - `AdminApp.tsx` — the auth gate route element: uses `useAdmin()`; renders `AdminLogin` when not authed, otherwise `<Outlet />` (the admin routes under `AdminLayout`)

### Client structure (the refactor pattern we follow)
```
src/app/client/
├── types/          → TypeScript interfaces only (e.g. types/Product.ts, types/Public.ts)
├── data/           → `siteDefaults.ts` only (`SITE_DEFAULTS`, `withSettingsDefaults`, `whatsappLink` — the fallbacks for settings-driven copy). Product/gallery/testimonial arrays are gone; everything comes from MongoDB.
├── hooks/          → shared React hooks (useInView, useCounter)
├── utils/          → `api.ts` (`publicApi` incl. `createQuote(body, file?)`, `createSubscriber`, `confirmSubscriber`, `unsubscribeSubscriber`, `categories()` and `settings()`, `PublicApiError`, `cdn`) — the ONLY place the public site talks HTTP; `categories.ts` (`categoryFilters`/`inCategory`/`catLabel` — the shared filter-pill logic, see "Categories")
├── components/
│   ├── layout/     → site-wide chrome: Navbar, Footer (holds the newsletter form), BackToTop, globalStyle (globalStyles + GlobalStyles), siteDataProvider (useSiteData)
│   └── pages/      → section components grouped by route
│       ├── home/       → home sections
│       ├── aboutUs/    → About-page sections (aboutUsStatCounter.tsx)
│       └── Product/    → product-related components (productQuoteModal.tsx)
└── pages/          → page components assembled from components/pages/*, plus the two email-link landing pages (subscribeConfirmPage.tsx, unsubscribePage.tsx)
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
| `PublicGalleryItem`, `PublicTestimonial`, `PublicSettings`, `QuoteSubmission`, `SubscriberSubmission` | `types/Public.ts` | Gallery, Testimonials, both quote forms, Footer/Contact/About/QuoteModal, both landing pages |
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
- **The admin dashboard IS now fully wired to the backend CRUD for all 6 resources** (plus subscribers and admin accounts). There are no `localStorage` seeds left in the admin data path — `adminProvider.tsx` fetches from MongoDB and every mutation is a real API call.
  - `utils/api.ts` is the **single** place that talks HTTP: `API_BASE` (`VITE_API_BASE`, default `http://localhost:3000`), `getToken()`, `ApiError`, and the `api.{getAll,create,update,remove,getSettings,saveSettings}` verbs. It injects `Authorization: Bearer`, prefixes `/admin`, and **calls a registered unauthorized handler on any 401** (the provider registers `onLogout`, so an expired token self-heals by logging out instead of hanging). `adminLogin.tsx` and `imageUploadField.tsx` import `API_BASE`/`getToken()` from here — do not hardcode `http://localhost:3000` anywhere.
  - Response contract is uniformly `{ status, message?, data?, errors? }`. `errors` is a field→message map on validation failure and `api.ts` joins it into the banner text.
  - **The `/admin/users` route had to be registered in `App.tsx` alongside the page — a `NAV_ITEMS` entry is not enough.** `AdminManagement`, `NAV_ITEMS`' `users` item and the provider methods all existed, but with no `<Route path="users">` the URL only produced a `No routes matched location "/admin/users"` warning and a blank page. When you add an admin panel, add the route too.
- **`AdminManagement` self-gates on `isAdminUser`, which is deliberate duplication, not an oversight.** `AdminRoute.use("/users", requireAdmin, UsersRoute)` already 403s a staff user server-side, but the page also renders "Only admins can manage admins and staff." rather than showing an empty table that would silently 403 on its first write.
- `adminProvider` exposes **per-item async** methods, not array setters: `createProduct/updateProduct/deleteProduct`, `createGalleryItem/…`, `createTestimonial/…`, `updateQuoteStatus(id, status)`, `deleteQuote(id)`, `refreshQuotes()`, `saveSettings`, `createCategory(name)/renameCategory(id, name)/deleteCategory(id, name)`, and **`users`/`currentUser`/`isAdminUser`/`addUser(data)`/`deleteUser(id)`** (the admin/staff accounts, via `usersApi` in `utils/api.ts` — GET `users`, POST `users`, DELETE `users/:id`). It also exposes `loading`, `error`, `clearError`, `quoteCount`. The array setters (`setProducts` etc.) are **gone** — pages must not reintroduce them.
  - On mount (and after login) the provider `Promise.all`s all six GETs. The sixth is `categories` — the shared product/gallery category list, and the reason the Category selects in the product/gallery modals are populated at all. `AdminApp.tsx` renders a spinner while that first load is in flight, so pages never flash empty tables.
  - **The provider never refetches on a timer**, so a quote submitted by a customer will not appear until you press **Refresh** on the Quotes page (which calls `refreshQuotes()`) or reload. `quoteRequest.tsx` also calls `refreshQuotes()` on mount, so navigating away and back picks up new rows. Polling was deliberately not added — it would silently swap rows under an open detail modal.
  - `updateQuoteStatus` sends **only** `{ status }`. The backend uses `findByIdAndUpdate` (not `replaceOne`), so partial updates preserve the other fields — this is what makes the partial update safe.
  - **Known limitation: 15-minute token expiry with no refresh flow.** A 401 logs the admin out and they must sign in again. `REFRESH_TOKEN_SECRET` is in `.env` but still unused. Adding refresh tokens is the natural next step.
- `utils/storage.tsx` (`load`/`save`) was **deleted**. Its only caller was the newsletter broadcast in `adminProduct.tsx`, which was browser-side and has been replaced by the server-side subscribers collection (see "Newsletter").
- The public site **is** connected for products, gallery, testimonials, settings, quote submission **and the newsletter** — `ContactPage.tsx` and `productQuoteModal.tsx` POST to `/api/quotes` via `publicApi.createQuote`, the `Footer` newsletter form POSTs to `/api/subscribers` via `publicApi.createSubscriber`, and `useSiteData().settings` feeds the footer/contact/about copy. There is no remaining functional gap on the public side.
### CSV export
- `admin/utils/csv.ts` is the **single** CSV writer: `downloadCsv(filename, header, rows)`. Both `subscriber.tsx` and `quoteRequest.tsx` use it — do not inline a `Blob` + `createObjectURL` in a page, that is how the two exports drift apart.
- It does three things a naive `rows.join(",")` does not, and each one is load-bearing:
  - **Quotes every cell** (RFC 4180, `"` doubled). Quote `name`/`message`/the customization answers are customer-supplied and routinely contain commas and newlines; unquoted they silently shift every following column.
  - **Neutralises formula injection.** A cell starting with `=`, `+`, `-` or `@` is executed as a formula by Excel/Sheets, so `=HYPERLINK("http://evil","click")` in a customer message would run on the machine of whoever opens the export. Values get an `'` prefix, which forces text.
  - **Writes a UTF-8 BOM.** Without it Excel decodes the file as the local codepage and a Nepali or accented name renders as mojibake. Rows are joined with `\r\n` for the same reason.
- Both buttons export **what is currently on screen**, not the whole collection: Subscribers honours its status filter (`subscribers-<filter>.csv`), Quotes honours both the status filter and the search box (`quotes-<filter>.csv`). Disabled when the visible list is empty.
- Quotes exports 14 columns from the full `QuoteRequest` shape (`name,email,phone,product,service,size,quantity,customization,attachment,artwork_url,message,status,received_at,last_updated_at`). `customization` packs all the structured answers into **one** cell as newline-separated `label: value` pairs, so the column count stays fixed no matter how many fields a product defines. `artwork_url` is populated only when the customer's file was actually stored; when it is blank the `attachment` filename is all there is.
- Timestamps go out as the raw ISO string from `createdAt`/`updatedAt`, **not** `formatWhen()`'s "2 hours ago" — a relative string is useless in a spreadsheet that gets sorted.

### Newsletter (frontend)
- **`Footer.tsx` owns the whole subscribe UX**: email input, submit, and a `msg`/`kind` result state covering *sending*, *sent* ("check your inbox to confirm"), *already subscribed*, *invalid email* and *network failure*. It carries its own `website` honeypot field, hidden with `aria-hidden` + `tabIndex={-1}`, which is exactly the field the backend silently swallows — do not add a second honeypot or remove that one.
- **The form validates the address itself with the same shape as the backend regex before POSTing**, so an obvious typo never costs a request. A `publicApi` failure with `status === 0` is treated as a network error; anything else falls back to the invalid-email message.
- **The two email-link landing pages are dumb on purpose.** `subscribeConfirmPage.tsx` and `unsubscribePage.tsx` read `?token=` from the URL, POST it to the API on mount, and render success / failure / already-done states. They hold no business logic and must not start calling the API on render without the POST — see the scanner reason in the Newsletter section above.
- **The admin Subscribers page (`admin/pages/subscriber.tsx`) is list + delete only.** It shows a total plus per-status counts, filters by status, exports the current list to CSV, and deletes with a confirmation. There is no create or edit control, matching the GET/DELETE-only API. The provider additions are `subscribers`, `fetchSubscribers()` and `deleteSubscriber(id)`. **Admin Quotes page (`admin/pages/quoteRequest.tsx`) also has an Export CSV button** that downloads the currently filtered list; both use the shared `utils/csv.ts` writer.
- **`NAV_ITEMS` in `admin/constants/admin.tsx` gained a "Subscribers" entry** so the page is reachable from the sidebar; that file must stay `.tsx` because the nav items are JSX icons.
### Email: Resend, server-side only (replaced FormSubmit on 2026-09-28)
- **All email is now sent from the backend via Resend** (`resend` npm package). `src/utils/mailer.js` is the only reader of `RESEND_API_KEY`; it must never be imported by frontend code.
- **There are exactly four emails**, all in `src/utils/notifications.js`:
  | Function | Trigger | To | Reply-To |
  |---|---|---|---|
  | `notifyOwnerOfQuote(quote)` | inside `createPublicQuote`, after the row is saved | `OWNER_EMAIL` | the customer |
  | `notifyCustomerOfStatus(quote)` | `PUT /admin/quotes/:id`, **only when `status` actually changes** | `quote.email` (from the stored doc) | the owner |
  | `notifySubscriberOfConfirmation(subscriber)` | inside `createPublicSubscriber`, after the row is saved | the subscriber | n/a |
  | `notifySubscribersOfProduct(product)` | inside `createProduct`, after the row is saved | every `active` subscriber | n/a |
- **`resend.emails.send()` takes `CreateEmailOptions`, which is camelCase — use `replyTo`, not `reply_to`.** The snake_case spelling belongs to the low-level `EmailApiOptions` type and is silently dropped by the SDK, which would make every reply land back on the sender instead of the customer. The fake-key test cannot catch this (it fails at auth before body validation).
- **`client/utils/notifyOwner.ts` and `admin/utils/sendNotification.tsx` were deleted.** Do not reintroduce browser-side email: the API key would have to reach the client, and the recipient address would become caller-controlled, i.e. an open relay that will email anyone.
- **The recipient is never read from the request body.** `updateQuote` reads the stored document, so `PUT /admin/quotes/:id` cannot be used to mail a third party. That is also why `admin/quotes/controller.js` does *not* use the generic `crud.js` `updateOne`, which cannot see `before.status` and so cannot detect a real transition. `isObjectId` is now exported from `crud.js` for it.
- **Everything is fire-and-forget and nothing throws.** A mail outage must never cost a customer their quote or subscription. `sendMail` catches everything, logs, and returns `{ sent, reason }`. `e2e.mjs` asserts a quote still saves (201), a status change still succeeds (200), and a subscribe/confirm/unsubscribe cycle still completes, with the send suppressed.
- **⚠ Sending is skipped for IANA reserved test domains** (`@example.com|.net|.org`, `@test`, `@invalid`) via `isTestAddress()` in `notifications.js`. It is checked against the **quote's** address, not the recipient, so it also silences the owner alert. This is not a test-only backdoor — those domains are RFC 2606/6761 reserved and can never be a real customer mailbox. Without it, configuring a real `RESEND_API_KEY` would mail the owner ~15 times per e2e run and Resend would try to deliver to undeliverable addresses. Verified with a key configured: full suite green, zero Resend calls; a real address still sends. Do not widen this pattern.
- **Duplicate suppression matters:** re-selecting the same status in the admin dropdown must not send a second email. The old frontend code did send one every time.
- **`RESEND_API_KEY` is now set and real mail is being sent** (verified end to end against the owner inbox: both a confirmation email and a product broadcast arrived with real Resend message ids). **`MAIL_FROM` is still empty**, so the fallback `onboarding@resend.dev` is in use and delivery is limited to the Resend account owner's own inbox. A real customer receives nothing until a domain is verified in Resend and `MAIL_FROM` is set. `OWNER_EMAIL` is pre-filled with the address that used to be hardcoded in the two public forms.
- **`.env` changes need a manual nodemon restart** (it only watches `js,mjs,cjs,json`). Add the key, then restart the backend or nothing will change.
- Everything interpolated into the email HTML goes through `esc()`: the body carries customer-supplied name/message text.
- The email footer reads the **settings doc**, so the phone/address in outgoing mail stays correct when the admin edits it. This retired the hardcoded `"Call +977-61-XXXXXX or visit crystaldigital.com.np"` line.
### Customer artwork uploads (the file is now really uploaded)
The quote form used to send only the artwork's **filename**. It now sends the bytes, which makes `POST /api/quotes` the project's first genuinely public upload surface. Everything below is deliberate:

- **The image travels on the quote POST, not in a separate upload call.** Uploading when the file is *picked* means a customer who attaches artwork and then abandons the form leaves an unreferenced asset on Cloudinary with no way to find it. One request means the file arrives with the quote or not at all. The quote row is written **first**, so the worst case is a quote with the filename and no image.
- **`attachment` is now joined by `attachmentUrl` and `attachmentPublicId`.** `attachment` is the customer's original filename, taken from `req.file.originalname` when a file was sent (so the name always describes the stored image) and from the body otherwise. The other two are the Cloudinary link and the destruction key.
- **The Cloudinary `public_id` is a random UUID, never the filename.** A predictable id like `logo-final` would let anyone enumerate the folder and read other customers' designs before they launch. Cheaper to do now than to retrofit.
- **Artwork is uploaded with `maxWidth: 0`, i.e. no downscale.** `uploadImage()`'s 1600px limit is right for product photos but would destroy a print-ready logo — the exact detail the admin opens the file to judge. This is why `uploadImage()` takes a `maxWidth` option at all.
- **The filename is sanitised** to `[a-z0-9_-]` before it becomes a public_id, because that string ends up in a URL anyone can request.
- **The route uses `singleAnyFile`, not `singleImage`.** A customer who attaches a PDF — a perfectly normal thing to send artwork as — must not lose their enquiry over the attachment. The controller checks the mimetype itself, stores the quote with the filename alone, and skips the upload. `artworkUploadFallback` does the same for an over-cap file, and for the same reason: the enquiry is always worth more than the artwork.
- **The honeypot is checked before the file is looked at**, so a bot cannot use that endpoint as free image hosting. It still answers 201, and still stores nothing.
- **`artworkDailyBudget` is a site-wide ceiling of 25 uploads/day** (`DAILY_ARTWORK_UPLOAD_LIMIT` in `rateLimit.js`). The per-IP limit bounds one visitor (10/hour × 5MB); this bounds the account, which is the number that actually protects the Cloudinary quota, since a botnet sidesteps per-IP limits with a new IP per request. It uses the limiter's `scope: "global"` option and, crucially, **does not answer 429** — it sets `req.artworkOverBudget` and the quote is saved without the image. Rejecting would throw away a real customer because someone else had spent the day's budget. Only a request that actually carries a file spends a slot.
- **`rateLimit()` grew two options**: `scope: "global"` (one shared bucket) and `onLimit` (call this instead of answering 429). The sweeper now uses the widest window in use, otherwise a 24h bucket would be emptied an hour in and the daily cap would silently reset.
- **`AWS Rekognition auto-moderation is deliberately off.** It is a paid Cloudinary add-on, and the realistic threat here is *volume burning quota*, which the caps already solve. Turn it on in the Cloudinary dashboard if that ever changes.
- **Deleting a quote destroys its asset.** `deleteOne(QuoteModel, { withImages: true, imageField: "attachmentPublicId" })` — `crud.js` grew an `imageField` option because products/gallery name the column `imgPublicId` and quotes do not. Without this, every deleted quote leaked storage forever.
- **The owner email links the artwork** when it was stored, and otherwise says the file was not stored and to ask for it. The link is the **raw** URL, not `deliveryUrl()`.
- **Admin view:** the eye button's existing modal shows the image inline (capped 500×420, `object-contain`) plus an **"Open full size ↗"** link to the raw original in a new tab. No lightbox — a second `fixed inset-0` inside the modal is the overlay-nesting trap this project already hit with the category rename dialog. Both the preview and the link deliberately skip `f_auto,q_auto`.
- **Frontend:** `publicApi.createQuote(body, file)` sends `FormData` via a new `postForm` helper that sets **no** `Content-Type` (the runtime must supply the multipart boundary). `productQuoteModal.tsx` holds the real `File`, blocks >5MB client-side with a message rather than uploading it, and the `accept` list is explicit — no `image/*`, which would happily offer an SVG.
- **CSV:** quotes export an `artwork_url` column next to `attachment`.

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
