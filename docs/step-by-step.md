# Adding a feature safely: step by step

Follow these in order. Parts 1 and 2 are one-time setup. Parts 3 and 4 are what you
repeat for each feature. Nothing in Parts 1 to 3 touches the live site.

---

## Part 1: Make sure GitHub matches the live server (one time, 10 minutes)

Your earlier commits were made on the server, so first check it has no unsaved edits.

1. SSH into the server and go to the project folder (the folder that contains
   `backend` and `frontend`).
2. Run:
   ```bash
   git status
   git log --oneline -1
   ```
3. If it says **"nothing to commit, working tree clean"** and the last commit is
   `Finalize v1.0`, you are good. Go to Part 2.
4. If it lists changed files, **stop and paste the output in the chat**. Those are
   edits that only exist on the server, and we need to save them to GitHub before
   anything else, otherwise they could be lost.

## Part 2: Set up your laptop (one time, about an hour)

1. Install these (all free):
   - **Git**: https://git-scm.com/downloads
   - **Node.js** LTS version: https://nodejs.org (on the server, `node -v` shows which
     version it runs; use the same major number, e.g. 22)
   - **pnpm**: after Node is installed, run `npm install -g pnpm`
   - **Docker Desktop**: https://www.docker.com/products/docker-desktop/ (open it once
     after installing so it is running)
   - A code editor, e.g. **VS Code**: https://code.visualstudio.com
2. On GitHub, merge **PR #1** (it only adds the setup files and guides).
3. Download the code to your laptop. In a terminal:
   ```bash
   git clone https://github.com/Crabbypixel/merawealth.git
   cd merawealth
   ```
4. Start your private test database:
   ```bash
   docker compose up -d
   ```
5. Create the settings files:
   - Copy `backend/.env.example` to `backend/.env`. Inside it, set:
     ```
     DATABASE_URL=postgresql://merawealth:merawealth@localhost:5432/merawealth_dev
     FRONTEND_URL=http://localhost:3000
     EMAIL_USER=<a NEW test Gmail address, not the MeraWealth one>
     EMAIL_APP_PASSWORD=<that account's Gmail App password>
     ```
     (To get an App password: Google Account → Security → turn on 2-Step
     Verification → App passwords.)
   - Copy `frontend/.env.example` to `frontend/.env.local`. Leave it as
     `NEXT_PUBLIC_API_URL=http://localhost:3001`.
6. Start the backend (terminal 1):
   ```bash
   cd backend
   pnpm install
   npx prisma migrate deploy
   npx prisma generate
   pnpm start:dev
   ```
7. Start the frontend (terminal 2):
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```
8. Make yourself an admin in the **test** database (terminal 3, from the
   `merawealth` folder; use your own email and any phone number):
   ```bash
   docker compose exec db psql -U merawealth -d merawealth_dev -c "INSERT INTO \"Admin\" (name, \"phoneNumber\", email, \"updatedAt\") VALUES ('Sekar', '9000000000', 'your-email@gmail.com', now());"
   ```
9. Open http://localhost:3000. Log in as admin, register a fake client, approve it,
   and place a test order. If all of that works, your laptop copy is ready.

   (The logo in the header will be missing locally. That's fine. To fix it, copy
   `uploads/public/merawealth_logo.png` from the server's `backend` folder into
   `backend/uploads/public/` on your laptop.)

## Part 3: Build the feature (on your laptop)

1. Start a branch for it:
   ```bash
   git checkout main
   git pull
   git checkout -b feature/<short-name>
   ```
2. Write the code. Keep both `pnpm start:dev` and `pnpm dev` running; they reload on
   save.
3. If you change `backend/prisma/schema.prisma`, create a migration:
   ```bash
   cd backend
   npx prisma migrate dev --name <what-changed>
   ```
4. Test it like a client and like an admin. Try wrong inputs too.
5. Do a production-style build to catch errors the dev mode hides:
   ```bash
   cd backend && pnpm build && cd ../frontend && pnpm build
   ```
   Both must finish without errors.
6. Save and upload your work:
   ```bash
   git add -A
   git commit -m "Add <feature>"
   git push -u origin feature/<short-name>
   ```
7. On GitHub, open a pull request from your branch into `main`. Read the changes once
   more, then merge it.

## Part 4: Put it live (on the server, during a quiet hour)

SSH in, go to the project folder, then:

1. Check it's clean: `git status` (must say "working tree clean").
2. Back up the database:
   ```bash
   mkdir -p ~/backups
   pg_dump -U <db user> -h localhost -Fc <db name> > ~/backups/merawealth-$(date +%F-%H%M).dump
   ```
   (`<db user>` and `<db name>` are in the `DATABASE_URL` line of the server's
   `backend/.env`: `postgresql://<db user>:<password>@localhost:5432/<db name>`.)
3. Write down the live version: `git rev-parse HEAD`
4. Get the new code: `git pull origin main`
5. Backend:
   ```bash
   cd backend
   pnpm install --frozen-lockfile
   npx prisma migrate deploy
   npx prisma generate
   pnpm build
   cd ..
   ```
6. Frontend:
   ```bash
   cd frontend
   pnpm install --frozen-lockfile
   pnpm build
   cd ..
   ```
7. Restart: `pm2 list` to see the names, then `pm2 restart <backend> <frontend>`.
8. Check: `pm2 logs --lines 50` for errors, then open merawealth.in and try logging in
   and viewing an order.

**If something is wrong:** `git checkout <the version you wrote down>`, repeat steps
5 to 7, and the old version is back. If the database itself looks damaged, don't try
to fix it alone: ask for help with restoring the backup.
