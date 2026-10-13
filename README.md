<div align="center">

# MeraWealth

**A full-stack platform for buying and selling pre-IPO shares in India.**

Clients register with their KYC details, place BUY and SELL orders at admin-set prices,
and track every order. Admins verify clients, list companies, approve orders and match
buyers with sellers.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[Live site](https://merawealth.in) · [Architecture](docs/architecture.md) · [API](docs/api.md) · [Database](docs/database.md) · [Order lifecycle](docs/order-lifecycle.md)

</div>

---

![Order matching screen](docs/images/order-match-screen.png)

## What it does

Pre-IPO shares are shares of companies that are not listed on a stock exchange yet. They
can't be bought through a normal broker app, so deals are arranged between people who
want to sell and people who want to buy. MeraWealth puts that process online: clients
place orders on the website, and the MeraWealth team reviews, matches and settles them.

### For clients

- **Register with KYC**: name, phone, email, PAN, demat account and bank details.
- **Passwordless login**: enter your phone number and type the one-time code sent to your email.
- **Browse pre-IPO companies** with their logo, a short note, the indicative price and the
  minimum order quantity.
- **Place BUY or SELL orders** at the listed price. Each order gets a confirmation email.
- **Track orders**: see each order's status and how much of it was approved and matched.
- **Cancel** an order while it is still pending.
- Information pages for **bonds, fixed deposits and mutual funds**.

### For admins

- **Email alerts** for every new registration and every new BUY or SELL order.
- **Approve clients** after checking their KYC details, or reject or deactivate them.
- **Manage companies**: add a company with its logo, set the indicative price and
  minimum quantity, list or unlist it.
- **View & Verify orders**: check an order and approve it with a final **approved quantity**,
  or reject it.
- **Order Match**: pick which sellers' shares go to which buyers, with a shared **Match ID**,
  across one or several rounds. The screen checks every rule before anything is saved.
- **Full order history** with status filters.

<table>
  <tr>
    <td width="50%"><img src="docs/images/verify-order.png" alt="View and verify an order"/><br/><sub><b>View & Verify</b>: approve an order with a final quantity.</sub></td>
    <td width="50%"><img src="docs/images/order-match-companies.png" alt="Order Match company list"/><br/><sub><b>Order Match</b>: companies waiting to be matched.</sub></td>
  </tr>
</table>

![Admin orders list](docs/images/admin-orders.png)

## How an order flows

```mermaid
flowchart LR
    A[Client places<br/>BUY or SELL] --> B[PENDING]
    B -- client cancels --> X[CANCELLED]
    B -- admin rejects --> R[REJECTED]
    B -- "View & Verify<br/>(approved qty)" --> C[UNDER_PROCESS]
    C -- Order Match --> D[PARTIALLY_COMPLETED]
    C -- Order Match --> E[COMPLETED]
    D -- next match round --> E
    C & D -- admin rejects --> R
```

Prices are set by the admin, so a client never types a price. Matching is done by an
admin, not automatically: the admin decides which seller's shares go to which buyer, and
the platform checks the numbers add up. Payment and demat transfers happen offline.
Details in [docs/order-lifecycle.md](docs/order-lifecycle.md).

## Architecture

```mermaid
flowchart LR
    U[Browser] --> FE[Next.js frontend]
    FE -- "REST + session cookie" --> BE[NestJS API]
    BE -- Prisma --> DB[(PostgreSQL)]
    BE -- SMTP --> M[Email]
```

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript |
| Backend | NestJS 11, class-validator, cookie sessions, `@nestjs/schedule` |
| Database | PostgreSQL 16 with Prisma 7 (`@prisma/adapter-pg`) |
| Email | Nodemailer over Gmail SMTP |
| Hosting | AWS EC2, apps kept running with pm2 |
| Local dev | Docker Compose for PostgreSQL |

More in [docs/architecture.md](docs/architecture.md).

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer and [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Docker](https://www.docker.com/) for the local database (or any PostgreSQL 16)
- A Gmail account with an [app password](https://support.google.com/accounts/answer/185833)
  for sending login codes

### 1. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` with the database `merawealth_dev`
(user and password `merawealth`). Your data survives restarts.

### 2. Start the backend

```bash
cd backend
cp .env.example .env        # then fill in the values
pnpm install
npx prisma migrate deploy   # create the tables
npx prisma generate
pnpm start:dev              # http://localhost:3001
```

For the local database, use
`DATABASE_URL=postgresql://merawealth:merawealth@localhost:5432/merawealth_dev`.

### 3. Start the frontend

```bash
cd frontend
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:3001
pnpm install
pnpm dev                    # http://localhost:3000
```

### 4. Create your first admin

There is no admin sign-up page. Add one in the database, using a phone number and an email
you can read:

```bash
docker compose exec db psql -U merawealth -d merawealth_dev -c \
  "INSERT INTO \"Admin\" (name, \"phoneNumber\", email, \"updatedAt\") VALUES ('Your Name', '9876543210', 'you@example.com', now());"
```

Then open `http://localhost:3000/login`, enter that phone number, and type the code from
your email.

On Windows, see the step-by-step [Windows setup guide](docs/windows-local-setup.md).

## Project structure

```
merawealth/
├── backend/            NestJS API, Prisma schema and migrations
│   └── src/
│       ├── auth/         registration, OTP login, sessions
│       ├── admin/        client management
│       ├── company/      company listings and logos
│       ├── transaction/  orders and status changes
│       ├── order-match/  manual order matching
│       ├── email/        emails
│       └── tasks/        scheduled clean-up
├── frontend/           Next.js site
│   └── src/
│       ├── app/          pages
│       ├── components/   UI components and pop-ups
│       └── utils/        API helper and shared checks
├── docs/               documentation
└── docker-compose.yml  local PostgreSQL
```

## Scripts

| Where | Command | What it does |
|---|---|---|
| `backend/` | `pnpm start:dev` | Run the API with auto-reload |
| `backend/` | `pnpm build` then `pnpm start:prod` | Build and run for production |
| `backend/` | `pnpm test` | Run unit tests (Jest) |
| `backend/` | `pnpm lint` | Lint and auto-fix |
| `backend/` | `npx prisma studio` | Browse the database in the browser |
| `frontend/` | `pnpm dev` | Run the site with hot reload |
| `frontend/` | `pnpm build` then `pnpm start` | Build and run for production |
| `frontend/` | `pnpm lint` | Lint |

## Documentation

| Document | Contents |
|---|---|
| [Architecture](docs/architecture.md) | How the apps fit together, modules, login flow, configuration |
| [API reference](docs/api.md) | Every endpoint with request and response examples |
| [Database](docs/database.md) | Tables, relationships, rules and migrations |
| [Order lifecycle](docs/order-lifecycle.md) | Order statuses, approval and order matching |
| [Windows local setup](docs/windows-local-setup.md) | Set up a development machine on Windows |
| [Development and release workflow](docs/step-by-step.md) | Build a feature locally and put it live safely |
| [Staging](docs/staging.md) | Options for a test environment |
| [Contributing](CONTRIBUTING.md) | Branches, checks and pull requests |

## Deployment

Production runs on a single AWS EC2 server with PostgreSQL on the same machine and both
apps managed by pm2. Every release follows the same routine: check the server is clean,
back up the database, pull `main`, run migrations, build, restart, and check the site. The
full checklist, including how to roll back, is in [docs/step-by-step.md](docs/step-by-step.md#part-4-put-it-live-on-the-server-during-a-quiet-hour).

## Roadmap

- Automatic order matching as an option next to manual matching
- Holdings ledger, so a client's sell orders can be checked against the shares they own
- Notifications to clients when their order is matched
- Automated tests and CI for every pull request

## License

Proprietary. All rights reserved.
