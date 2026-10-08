# Testing new features without touching production

This guide explains how to get a safe place to try new features, separate from the
live MeraWealth site that clients use.

## The idea in one paragraph

You end up with three copies of the app, each with its own settings file (`.env`)
and its own database:

| Copy | Where it runs | Who uses it | Database |
| --- | --- | --- | --- |
| **Local** | Your laptop | Only you, while coding | A database on your laptop |
| **Staging** | A second small AWS server | You (and maybe a tester) | Its own staging database |
| **Production** | Your current AWS server | Real clients | The real database |

Code only moves in one direction: laptop → staging → production. Nothing you do on
your laptop or on staging can change production data, because they never have the
production database password.

## Rules that keep production safe

1. **Never point staging or local at the production database.** Their `DATABASE_URL`
   must name a different database.
2. **Never copy real client data into staging.** It holds KYC details. Create fake
   clients instead.
3. **Use a separate Gmail account for staging and local** (`EMAIL_USER`), so test
   emails never come from the real MeraWealth sender or reach real clients.
4. **Stop editing code on the production server.** Write code on your laptop, push it
   to GitHub, and have each server pull from GitHub.

## Branches (how code moves)

- `main` = what is live in production. Only finished, tested work goes here.
- `staging` = what is on the staging server.
- `feature/<name>` = one branch per new feature, made from `main`.

Workflow for a new feature:

1. On your laptop: `git checkout main && git pull && git checkout -b feature/holdings`
2. Build and test it locally.
3. Merge it into `staging`, push, and deploy staging (see below). Click through it.
4. When it works on staging, open a pull request from `feature/holdings` into `main`
   on GitHub, merge it, then deploy production.

## Setting up local development (free)

1. Install Node.js (same major version as the server), pnpm and PostgreSQL on your
   laptop (or run Postgres in Docker).
2. Create a database: `createdb merawealth_dev`
3. Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to
   `frontend/.env.local`, and fill them in.
4. Backend: `cd backend && pnpm install && npx prisma migrate deploy && pnpm start:dev`
5. Frontend: `cd frontend && pnpm install && pnpm dev`
6. Admins are not created through the app, so add yourself as an admin row in your
   local database (with your own email) to log in to the admin side.

## Setting up staging (a second small server)

1. In the AWS console (same region as production, Mumbai `ap-south-1`), launch a new
   small EC2 instance, for example `t3.small`, with Ubuntu.
2. Install the same things as on production: Node.js, pnpm, PostgreSQL, a process
   manager such as pm2, and nginx if production uses it.
3. Create the staging database on that server: `createdb merawealth_staging`.
4. `git clone` the repo, `git checkout staging`, and create the two env files from the
   examples with **staging** values (staging database, test Gmail, staging URLs).
5. Point a subdomain such as `staging.merawealth.in` at the new server in your DNS,
   and add HTTPS (for example with certbot), the same way production is set up.
6. The `uploads/` folder is not in git, so copy the public logo
   (`uploads/public/merawealth_logo.png`) across; company logos can be re-uploaded
   from the staging admin.
7. Build and start: `npx prisma migrate deploy`, `pnpm build`, then start both apps.

Deploying staging after that is: `git pull`, `pnpm install`,
`npx prisma migrate deploy`, `pnpm build`, restart.

You can **stop** the staging server in the EC2 console when you are not using it, so
you only pay for its disk while it is off.

## Database changes (migrations)

When a feature changes `schema.prisma`, create the migration on your laptop with
`npx prisma migrate dev --name <what-changed>` and commit the new folder in
`prisma/migrations`. Staging and production then apply it with
`npx prisma migrate deploy`. Try every migration on staging first, and take a backup
of the production database before deploying one there.
