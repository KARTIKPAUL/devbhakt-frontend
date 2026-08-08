# DevBhakt — Frontend

Mobile-first Next.js (App Router, plain JavaScript/JSX — no TypeScript) storefront for the
DevBhakt devotional clothing & lifestyle backend. Built with Tailwind CSS using the brand's
saffron / black / cream color theme from the DevBhakt logo.

## Tech Stack

- Next.js 14 (App Router) — JavaScript / `.jsx` only, no TypeScript
- Tailwind CSS
- React Context for Auth + Cart (persisted to `localStorage`)
- Razorpay Checkout.js for online payments, Cash on Delivery supported

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, categories, featured products, new arrivals |
| `/shop` | Product listing with search, category/price filters, sort, pagination |
| `/product/[slug]` | Product detail — gallery, size/qty selector, add to cart / buy now |
| `/cart` | Cart with quantity edit and order summary |
| `/checkout` | Address selection/creation, COD or Razorpay online payment |
| `/order-success/[id]` | Post-checkout confirmation |
| `/login`, `/register` | Auth |
| `/forgot-password`, `/reset-password/[token]` | Password reset flow |
| `/account` | Profile details + saved addresses |
| `/account/orders`, `/account/orders/[id]` | Order history & tracking timeline |

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill in your values
npm run dev
```

Open http://localhost:3000. Make sure the DevBhakt backend is running (default
`http://localhost:5000`) and `NEXT_PUBLIC_API_URL` in `.env.local` points to it.

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the DevBhakt backend API (no trailing slash) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Optional — Razorpay key id is actually returned by the backend's `create-order` response, this is only a fallback |

## Notes

- Product images are expected to come from Cloudinary (or any HTTPS host) — `next.config.js`
  already allows remote images from any HTTPS domain.
- Cart state lives in `localStorage` (`devbhakt_cart`) and prices are always re-verified by the
  backend when the order is created — nothing here is trusted for final pricing.
- Auth token is stored in `localStorage` (`devbhakt_token`) and attached as a Bearer token to
  protected API calls.
- This build ships storefront + customer account flows only (matching the backend's public and
  customer routes). Admin product/order management is not included here since the backend admin
  routes are a separate concern — build a small `/admin` area later if needed, reusing `lib/api.js`.
