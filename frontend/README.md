# MeraWealth frontend

The Next.js 16 website for MeraWealth, built with React 19, TypeScript and Tailwind CSS 4.
It renders the public pages, the client dashboard and the admin dashboard, and gets all
data from the [backend API](../backend).

See the [project README](../README.md) for the full setup and
[docs/architecture.md](../docs/architecture.md#frontend) for every page.

## Run it

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3001
pnpm install
pnpm dev                     # http://localhost:3000
```

`NEXT_PUBLIC_API_URL` is built into the site when you run `pnpm build`, so rebuild after
changing it.

## Layout

```
src/
├── app/                 one folder per page (App Router)
│   ├── (auth)/          login, register, verify-otp
│   ├── admin/           admin dashboard
│   ├── dashboard/       client dashboard
│   ├── pre-ipo/         company listings
│   └── ...              information and legal pages
├── components/          page sections and pop-ups
│   ├── AdminDashboardCard.tsx   admin dashboard
│   ├── OrderVerifyModal.tsx     View & Verify
│   ├── OrderMatchModal.tsx      Order Match
│   ├── TradePage.tsx            placing an order
│   └── TransactionHistoryPage.tsx  a client's orders
└── utils/
    ├── apiFetch.ts      calls the API with the session cookie
    └── orderMatch.ts    the Save checks on the Order Match screen
```

## Calling the API

Use `apiFetch` instead of `fetch`. It sends the session cookie, encodes `bodyData` as
JSON and throws a `session_ended` error on `401`/`403` so pages can send the user to
`/session-ended`.

```ts
import { apiFetch } from "@/utils/apiFetch";

const data = await apiFetch("/client/transactions", {
    method: "POST",
    bodyData: { companyCode: "NSEIL", type: "BUY", quantity: 25 },
});
```

## Images

The logo and banner are loaded from the backend at `${NEXT_PUBLIC_API_URL}/uploads/public/`,
and company logos from `/uploads/company-logos/`. Put `merawealth_logo.png` and
`merawealth_banner.png` in `backend/uploads/public/` for them to show locally.
