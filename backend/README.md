# MeraWealth backend

The NestJS 11 REST API behind MeraWealth. It owns every business rule: accounts and
login, companies, orders, order matching and emails. It talks to PostgreSQL through
Prisma 7.

See the [project README](../README.md) for the full setup, and [docs/](../docs) for the
[API reference](../docs/api.md), [database](../docs/database.md) and
[order lifecycle](../docs/order-lifecycle.md).

## Run it

```bash
cp .env.example .env        # fill in DATABASE_URL, FRONTEND_URL and the email settings
pnpm install
npx prisma migrate deploy
npx prisma generate
pnpm start:dev              # http://localhost:3001
```

## Layout

```
src/
├── main.ts              start-up: cookies, CORS, validation
├── app.module.ts        wires the modules together, serves /uploads
├── auth/                register, request-otp, verify-otp, me, logout, SessionService
├── admin/               client management, AdminGuard
├── client/              ClientGuard
├── company/             companies and logo uploads
├── transaction/         orders and status changes
├── order-match/         manual order matching (rules in order-match.validation.ts)
├── email/               OTP and order emails
├── tasks/               clean-up jobs every 5 minutes
├── prisma/              PrismaService
└── common/              upload settings
prisma/
├── schema.prisma        the data model
└── migrations/          one folder per schema change
uploads/                 company logos and site images (not in git)
```

## Adding a feature

1. Create a module folder with a controller, service and DTOs, and register it in
   `app.module.ts`.
2. Protect routes with `@UseGuards(AdminGuard)` or `@UseGuards(ClientGuard)`.
3. Describe request bodies with DTO classes and `class-validator` decorators. The global
   `ValidationPipe` rejects unknown fields, so every accepted field must be in the DTO.
4. Return `{ success: true, ... }`, and throw Nest exceptions with
   `{ success: false, message }` for errors, so the frontend can show the message.
5. For schema changes, edit `prisma/schema.prisma` and run
   `npx prisma migrate dev --name <what-changed>`.

## Tests

```bash
pnpm test
```

Unit tests sit next to the code as `*.spec.ts`. The order matching rules are covered in
`src/order-match/order-match.validation.spec.ts`.
