# Darevel Billing Frontend

React + Vite portal that mirrors the new billing-service API. It lets workspace admins review plan details, inspect usage, download invoices, and manage payment methods from `/admin/billing` routes.

## Getting Started

```bash
cd apps/billing/frontend
npm install
npm run dev
```

The app boots on http://localhost:3000 and uses mocked data (`services/billingService.ts`) so designers can iterate without the backend. Replace the service with real fetch calls once the billing-service endpoints are ready.

## Notable Features

- Overview dashboard with plan + subscription state, including alerts for past-due, trialing, and storage limit scenarios.
- Plan comparison selector with upgrade CTA that simulates redirecting to Stripe Checkout.
- Usage analytics built with `recharts` for quick trend visualization.
- Invoice table, payment-method management, and global layout shell reused across admin routes.

## Environment Variables

The starter references `GEMINI_API_KEY` for parity with other Darevel frontends. Populate `.env.local` if you reuse those hooks or remove the reference if not needed.
