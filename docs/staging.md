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
- `staging` = what is on the staging server (only if you set one up later).
- `feature/<name>` = one branch per new feature, made from `main`.

Workflow for a new feature:

1. On your laptop: `git checkout main && git pull && git checkout -b feature/holdings`
2. Build and test it locally until you are happy with it. Commit as often as you like;
   nothing on this branch reaches clients.
3. (If you have a staging server: merge it into `staging` and click through it there.)
4. Open a pull request from `feature/holdings` into `main` on GitHub, merge it, then
   follow "Deploying to production safely" below.

## Setting up local development (free, start here)

This is the cheapest and safest way to test: everything runs on your laptop and the
live server is never touched.

1. Install Node.js (same major version as the server), pnpm, git and
   [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Start a local database (from the repo folder): `docker compose up -d`
   This runs Postgres in a container using `docker-compose.yml`. No Postgres install
   needed, and `docker compose down -v` wipes it if you want a fresh start.
3. Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to
   `frontend/.env.local`. In `backend/.env` set
   `DATABASE_URL=postgresql://merawealth:merawealth@localhost:5432/merawealth_dev`
   and a test Gmail account.
4. Backend: `cd backend && pnpm install && npx prisma migrate deploy && npx prisma generate && pnpm start:dev`
5. Frontend: `cd frontend && pnpm install && pnpm dev`, then open http://localhost:3000
6. Admins are not created through the app, so add yourself as an admin row in your
   local database (with your own email) to log in to the admin side.
7. Before you call a feature done, also try a production-style build on your laptop:
   `pnpm build && pnpm start` in each folder. This catches build errors before they
   reach the live server.

## Deploying to production safely

Do this only when you are happy with a change locally. The apps on the server are
kept running by pm2.

**On your laptop:** merge the feature branch into `main` and `git push`.

**On the server** (SSH in, then `cd` to the merawealth folder):

```bash
# 0. Make sure nobody edited code directly on the server. This should say
#    "nothing to commit, working tree clean". If not, stop and sort that out first.
git status

# 1. Back up the database (keep a few of these files).
mkdir -p ~/backups
pg_dump -U <db user> -h localhost -Fc <db name> > ~/backups/merawealth-$(date +%F-%H%M).dump

# 2. Note the version that is live now, so you can go back to it.
git rev-parse HEAD

# 3. Get the new code.
git pull origin main

# 4. Backend: install, apply database changes, build.
cd backend
pnpm install --frozen-lockfile
npx prisma migrate deploy
npx prisma generate
pnpm build
cd ..

# 5. Frontend: install and build.
cd frontend
pnpm install --frozen-lockfile
pnpm build
cd ..

# 6. Restart. `pm2 list` shows your app names; restart both.
pm2 list
pm2 restart <backend name> <frontend name>
pm2 logs --lines 50   # watch for errors, Ctrl+C to leave
```

Then open the live site and check login and one order screen.

**If something breaks:** `git checkout <the version you noted>`, repeat steps 4 to 6,
and the old version is back. If a database change damaged data, restore the backup with
`pg_restore -U <db user> -h localhost -d <db name> --clean <backup file>`
(ask for help before doing this one).

## Setting up staging (optional, later)

Only worth it once you have more users or other people testing. Until then, local
development plus the safe deploy routine above is enough.

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
