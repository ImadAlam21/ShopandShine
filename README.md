# Shop & Shine — Jewellery E-commerce

A modern, full-featured jewellery store with a visual admin panel, built to run for **free**.

- **Storefront:** catalog, categories, product pages, search, cart, wishlist, guest & member checkout
- **Admin (`/admin`):** add/remove products with photos, manage stock, categories, orders & inquiries — no code needed
- **Payments:** Razorpay (India / INR) with server-side signature verification
- **Pink, feminine theme** · great SEO (server-rendered + structured data)

## Tech stack

| | |
|---|---|
| Framework | Next.js 15 (App Router, React 19, TypeScript) |
| Styling | Tailwind CSS 4 · Framer Motion |
| Data / Auth / Storage | Supabase (Postgres + RLS, Google OAuth, Storage) |
| Payments | Razorpay |
| Email | Resend (free tier) |
| Hosting | Vercel (free) |

## Run on localhost

Requires Node.js 20+ (`node -v`).

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Create your local env file, then open it and fill in keys
cp .env.example .env.local

# 3. Start the dev server
npm run dev
```

Then open **http://localhost:3000**.

> The site **runs without any keys** — you'll see the full UI, but the catalog
> stays empty and login/checkout won't work until you configure Supabase &
> Razorpay (see [SETUP.md](SETUP.md)).

**Useful variations**

```bash
npm run dev -- -p 3100       # run on a different port
npm run build && npm start    # production build, then serve at :3000
```

Stop the server with `Ctrl + C`.

👉 **Full setup (Supabase, Razorpay, Resend, deploy):** see [SETUP.md](SETUP.md).

## Scripts

- `npm run dev` — local dev server (http://localhost:3000)
- `npm run build` — production build
- `npm start` — serve the production build
- `npm run typecheck` — TypeScript check

## Notes

- The original Vite app is preserved in [`legacy/`](legacy/) for reference and is not part of the build.
- ⚠️ Rotate any keys that were committed previously before going live (see SETUP.md → Security checklist).
