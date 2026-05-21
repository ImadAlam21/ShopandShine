# Shop & Shine — Setup Guide (detailed)

Built with **Next.js (App Router) + Supabase + Razorpay**. Everything runs on **free** tiers (a custom domain ~$10/yr is the only optional cost).

Follow the parts in order. **Part A** gets the store visible on your laptop with products. **Parts B–D** turn on login, payments, and emails. **Part E** puts it online.

> 💡 **Restart rule:** Next.js only reads `.env.local` when it starts. **Every time you edit `.env.local`, stop the dev server (`Ctrl + C`) and run `npm run dev` again.**

---

## Part A — Run locally with a working catalog

### A1. Start the app (empty for now)

```bash
cd "/Users/imad/shop-&-shine"
npm install            # first time only
cp .env.example .env.local
npm run dev
```

Open **http://localhost:3000**. You'll see the full pink site, but no products yet (that's expected — we'll add the database next).

### A2. Create a Supabase project

1. Go to https://supabase.com → sign in → **New project**.
2. Pick a name (e.g. `shop-and-shine`), set a **database password** (save it somewhere), choose a region near your customers (e.g. *South Asia (Mumbai)*), and create it. Wait ~2 minutes for it to finish provisioning.

### A3. Create the database tables

1. In the left sidebar click **SQL Editor** → **+ New query**.
2. Open the file [`supabase/schema.sql`](supabase/schema.sql) in your editor, **select all (Cmd+A), copy**, paste into the Supabase query box.
3. Click **Run** (or Cmd+Enter). You should see **“Success. No rows returned.”**
   - ❌ If you get an error, jump to [Troubleshooting → SQL errors](#sql-errors).

### A4. Load sample products (optional but recommended)

1. **SQL Editor → + New query** again.
2. Copy all of [`supabase/seed.sql`](supabase/seed.sql), paste, **Run**. This adds 6 sample products with placeholder photos.

### A5. Connect the app to Supabase

1. In Supabase: **Project Settings** (gear icon, bottom-left) → **API Keys**.
2. Supabase now has two key styles — **either works** (same env-var names, different value format):

   **New keys (default tab "Publishable and secret API keys"):**

   | Supabase screen shows | Put it in `.env.local` as |
   |---|---|
   | **Project URL** (`https://<ref>.supabase.co`) | `NEXT_PUBLIC_SUPABASE_URL` |
   | **Publishable key** (`sb_publishable_…`) — copy with the icon | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | **Secret key** — click **+ New secret key**, copy the `sb_secret_…` (shown once) | `SUPABASE_SERVICE_ROLE_KEY` |

   **Or legacy keys (tab "Legacy anon, service_role API keys"):**

   | Supabase screen shows | Put it in `.env.local` as |
   |---|---|
   | **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` |
   | **`anon` `public`** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | **`service_role` `secret`** | `SUPABASE_SERVICE_ROLE_KEY` |

   ⚠️ The publishable/anon key is safe in the browser; the secret/service_role key is **server-only** — never rename it to `NEXT_PUBLIC_…`.

   Also set:
   ```
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
3. **Restart the dev server** (`Ctrl + C`, then `npm run dev`).
4. Refresh http://localhost:3000 — the sample products now appear. ✅

---

## Part B — Turn on Google login + your admin panel

### B1. Enable Google as a sign-in provider

1. Supabase → **Authentication** → **Sign In / Providers** (a.k.a. Providers) → click **Google** → toggle **Enable**.
2. Leave this tab open — it shows a **Callback URL** like
   `https://<your-project>.supabase.co/auth/v1/callback`. You'll need it next.

### B2. Create Google OAuth credentials

1. Go to https://console.cloud.google.com → create/select a project (top bar).
2. **APIs & Services → OAuth consent screen** → choose **External** → fill app name + your email → Save (you can skip optional fields).
3. **APIs & Services → Credentials → + Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - **Authorized redirect URIs → + Add URI** → paste the **Callback URL** from step B1.
   - Create. Copy the **Client ID** and **Client secret**.
4. Back in Supabase (the Google provider tab): paste the **Client ID** and **Client secret** → **Save**.

### B3. Set the allowed URLs

Supabase → **Authentication → URL Configuration**:
- **Site URL:** `http://localhost:3000`
- **Redirect URLs → Add URL:** `http://localhost:3000/**`

(You'll add your live Vercel URL here too, later.)

### B4. Make yourself the admin

1. On the site (http://localhost:3000), click the **person icon** (top-right) → sign in with Google once.
2. Supabase → **SQL Editor → New query**, run this with **your** email:
   ```sql
   update public.profiles set role = 'admin'
   where email = 'you@example.com';
   ```
   It should report `UPDATE 1`.
3. Visit **http://localhost:3000/admin** — you now have the dashboard. 🎉
   From here you can add products, upload photos, manage orders, etc.

---

## Part C — Turn on payments (Razorpay)

1. Sign up at https://razorpay.com. Stay in **Test Mode** (toggle, top of dashboard) while building.
2. **Account & Settings → API Keys → Generate Test Key.** Copy into `.env.local`:
   - **Key Id** → `NEXT_PUBLIC_RAZORPAY_KEY_ID` **and** `RAZORPAY_KEY_ID` (same value in both)
   - **Key Secret** → `RAZORPAY_KEY_SECRET`
3. **Restart the dev server.**
4. Test a purchase: add a product to bag → **Checkout** → fill the form → pay with test card
   `4111 1111 1111 1111`, any future expiry, any CVV, any OTP.
   The order should appear under **/admin → Orders** as **paid**, and stock drops.
5. **Webhook (recommended, do after deploying):** Razorpay → **Settings → Webhooks → Add New Webhook**
   - URL: `https://YOUR-LIVE-SITE/api/payment/webhook`
   - Secret: make one up → put the same value in `RAZORPAY_WEBHOOK_SECRET`
   - Active events: `payment.captured`, `payment.failed`
6. Going live later: finish Razorpay KYC, switch to **Live** keys, update the three env vars.

---

## Part D — Turn on emails (optional, free)

Used for order confirmations + owner notifications. **Skippable** — without it the app just logs a note and carries on.

1. Sign up at https://resend.com → **API Keys → Create API Key** → copy into `RESEND_API_KEY`.
2. Keep `EMAIL_FROM="Shop & Shine <onboarding@resend.dev>"` until you own a domain.
3. Set `OWNER_EMAIL` to the address that should receive contact/bespoke/order alerts.
4. Restart the dev server.
5. After you buy a domain: verify it in Resend, then change `EMAIL_FROM` to e.g. `Shop & Shine <hello@yourdomain.com>`.

---

## Part E — Put it online (Vercel, free)

1. Create a GitHub repo and push this project to it.
2. Go to https://vercel.com → **Add New → Project** → import your repo (it auto-detects Next.js — leave build settings default).
3. **Before deploying**, open **Settings → Environment Variables** and add **every** key from `.env.local` (Production *and* Preview). Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL (e.g. `https://shop-and-shine.vercel.app`).
4. **Deploy.**
5. Wire the live URL into the other services:
   - Supabase → Authentication → URL Configuration: set **Site URL** to the Vercel URL and add `https://your-app.vercel.app/**` to **Redirect URLs**.
   - Google Cloud → Credentials → add the same Supabase callback URL (already there) — no change needed unless you changed projects.
   - Razorpay → Webhooks → use the live `/api/payment/webhook` URL.

---

## Day-to-day: managing the store (`/admin`)

- **Products** — add/edit/delete; set price & stock inline; upload multiple photos & pick the main one; toggle Active (visible) / Featured / New.
- **Categories** — the categories shown in the menu.
- **Orders** — every order; change status (paid → fulfilled, etc.).
- **Messages / Bespoke / Newsletter** — form submissions and subscribers.

---

## ⚠️ Security checklist before going live

- [ ] **Rotate the old leaked keys.** The previous secrets are in `legacy/.env.old` — regenerate the Supabase `service_role` key and Razorpay keys in their dashboards.
- [ ] `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RESEND_API_KEY` exist **only** as plain env vars (never prefixed `NEXT_PUBLIC_`).
- [ ] Razorpay switched to **Live** keys after KYC.
- [ ] Sign in with a *non-admin* Google account and confirm `/admin` redirects you away.

---

## Troubleshooting

### SQL errors
- **`must be owner of table objects`** — this came from old storage policies; they've been removed from `schema.sql`. Re-copy the **whole** updated file and run it again.
- **`relation "public.xxx" does not exist`** when running `seed.sql`** — `schema.sql` didn't finish. The editor runs the script as one transaction, so one error rolls back everything. Fix the schema error, run `schema.sql` until it says *Success*, **then** run `seed.sql`.
- **`insert into storage.buckets ... permission denied`** — skip that one line and instead create the bucket manually: **Storage → New bucket** → name `jewelry-assets` → enable **Public bucket**.
- Re-running either file is safe (they use `if not exists` / `on conflict`).

### Catalog is empty
- Did you run `seed.sql` (or add products in `/admin`)?
- Are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in `.env.local`?
- Did you **restart `npm run dev`** after editing `.env.local`?

### Error: “Your project's URL and API key are required”
- `.env.local` is missing the Supabase values, or the dev server wasn't restarted after adding them.

### Login does nothing / “auth” error after Google
- Google provider enabled in Supabase with Client ID + Secret saved?
- The Google **Authorized redirect URI** must exactly match Supabase's callback URL.
- Supabase **Site URL** = `http://localhost:3000` and `http://localhost:3000/**` is in **Redirect URLs**.

### `/admin` sends me back to the home page
- You're signed in, but that account isn't admin. Re-run the `update public.profiles set role='admin' where email='...'` with the **exact** email you logged in with, then refresh.

### Product images don't show
- The bucket `jewelry-assets` must be **Public**.
- After adding the Supabase URL to env, restart the dev server (so `next.config.ts` allows that image host).

### Checkout says “Payments are not configured”
- Add the Razorpay env vars (Part C) and restart the dev server.

---

## Project structure

```
app/(store)/   Customer pages (home, collections, product, cart, checkout, account)
app/admin/     Owner admin panel (role-guarded)
app/api/       Payment + form route handlers
components/     UI: layout, product, cart, wishlist, checkout, admin, forms
lib/           Supabase clients, queries, auth, email, validators, helpers
supabase/      schema.sql + seed.sql
legacy/        The original Vite app, kept for reference (not built)
```
