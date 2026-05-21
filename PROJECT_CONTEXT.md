# Project Context: Shop & Shine

## Overview
**Shop & Shine** is a luxury jewelry e-commerce application designed with a high-end, editorial aesthetic. It features a full-stack architecture using React for the frontend and Express for the backend, integrated with Supabase for authentication/database and Razorpay for payments.

## Visual Identity & Design System
- **Mood:** Sophisticated, minimal, premium, editorial.
- **Typography:**
  - **Serif (Headings):** `Cormorant Garamond` (Elegant, classic).
  - **Sans (Body):** `Inter` (Modern, legible).
  - **Mono (Accents):** `JetBrains Mono` (Technical, precise).
- **Color Palette:**
  - **Gold:** `#D4AF37` (Primary accent, buttons, icons).
  - **Gold Light:** `#F9F4E8` (Subtle backgrounds).
  - **Ink:** `#1A1A1A` (Primary text, dark backgrounds).
  - **White:** `#FFFFFF` (Main background).
- **UI Components:**
  - **Luxury Cards:** Rounded corners (`3xl`), subtle shadows, smooth hover transitions.
  - **Gold Buttons:** Pill-shaped, gold background, white text, tracking-wide.
  - **Vertical Text:** Used for "Scroll to explore" and other decorative labels.
  - **Glassmorphism:** Used in drawers (Cart, Menu) and search modal for an immersive feel.

## Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS 4, Lucide React (Icons), Motion (Framer Motion for animations).
- **Backend:** Node.js, Express.
- **Database & Auth:** Supabase (`@supabase/supabase-js`).
- **Payments:** Razorpay (`razorpay` SDK).
- **Routing:** `react-router-dom` (v7).

## Architecture
- **Full-Stack Integration:** The app uses a custom Express server (`server.ts`) that serves the Vite frontend as middleware.
- **API Routes:**
  - `GET /api/products`: Fetches jewelry items.
  - `POST /api/payment/order`: Creates a Razorpay order.
- **State Management:**
  - Global state in `ShopAndShine` component (Cart, Favorites, User, Products).
  - Persistent auth state via Supabase listener.

## Key Features & Routing
- **Home (`/`):** Hero section, featured collections, bespoke banner.
- **Collections (`/collections` & `/collections/:category`):**
  - Categories: `Bridal`, `Minimalist`, `Heritage`, `Best Sellers`, `New Arrivals`.
  - Includes search filtering and favorite toggling.
- **Bespoke (`/bespoke`):** Custom design consultation page.
- **Our Story (`/story`):** Brand history and mission.
- **Support Pages:**
  - `/repair`: Repair & Care.
  - `/appointment`: Virtual Appointment.
  - `/shipping`: Shipping & Returns.
  - `/care`: Care Guide.
  - `/privacy`: Privacy Policy.
- **Contact (`/contact`):** Contact form and social links.
- **Cart System:** Slide-out drawer with quantity management and Razorpay checkout.
- **Search:** Full-screen modal with popular search tags.
- **Favorites:** Heart toggle on product cards.

## Environment Variables
The following variables are required for full functionality:
- `VITE_SUPABASE_URL`: Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side).
- `RAZORPAY_KEY_ID`: Razorpay public key.
- `RAZORPAY_KEY_SECRET`: Razorpay secret key.
- `VITE_RAZORPAY_KEY_ID`: Razorpay public key (exposed to client).

## Implementation Details for AI Agents
- **Icons:** Always use `lucide-react`.
- **Animations:** Always use `motion` from `motion/react`.
- **Styling:** Use Tailwind utility classes. Custom theme variables are defined in `src/index.css`.
- **Auth:** Redirects are configured to `${window.location.origin}/`.
- **Payments:** Ensure the Razorpay script is loaded in `index.html`.
