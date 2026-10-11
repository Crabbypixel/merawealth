# Contributing to MeraWealth

Thanks for helping. This page describes how changes get from an idea to the live site.

## Workflow

1. **Start from `main`.**
   ```bash
   git checkout main
   git pull
   git checkout -b feature/<short-name>
   ```
2. **Build and test on your own machine** against the local Docker database
   (see the [README](README.md#getting-started)). Never point a development setup at the
   production database or the production email account.
3. **Run the checks** before you push:
   ```bash
   cd backend && pnpm test && pnpm build
   cd ../frontend && pnpm lint && pnpm build
   ```
4. **Open a pull request** into `main`. Describe what changes for clients or admins, and
   how you tested it. Add screenshots for anything visible.
5. **Merge**, then release with the server routine in
   [docs/step-by-step.md](docs/step-by-step.md#part-4-put-it-live-on-the-server-during-a-quiet-hour).

## Database changes

- Change `backend/prisma/schema.prisma` and create a migration with
  `npx prisma migrate dev --name <what-changed>`. Commit the new folder in
  `prisma/migrations/`.
- Never edit a migration that has already run on the server; add a new one instead.
- Rules Prisma can't express (like CHECK constraints) go into the migration's SQL by hand.
  Note them in [docs/database.md](docs/database.md).
- A migration that could lose data must refuse to run instead.

## Code style

- TypeScript everywhere. Keep business rules in the backend; the frontend can repeat a
  check for a faster message, but the backend has the final say.
- Request bodies are DTO classes with `class-validator` decorators.
- API responses use `{ success, message }`, and messages are written for the person
  reading them on screen.
- Put logic that doesn't need the database in pure functions with unit tests next to them
  (`*.spec.ts`), like `order-match.validation.ts`.

## Documentation

If a change adds an endpoint, a table, a status or a page, update the matching file in
[docs/](docs) in the same pull request.

## Secrets

Never commit `.env` files, passwords, app passwords or database dumps. Use the
`.env.example` files to document new settings.
