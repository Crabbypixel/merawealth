# Running MeraWealth on your Windows 10 laptop (with Docker)

Goal: two copies of the same app.

| | Development | Production |
| --- | --- | --- |
| Where | Your Windows laptop | AWS EC2 server |
| Who uses it | Only you | Real clients |
| Database | Postgres **inside Docker** on your laptop | Postgres installed on the server |
| Settings | `backend/.env` + `frontend/.env.local` on your laptop | the `.env` files on the server |
| Email | A test Gmail account | The real MeraWealth Gmail |
| How code gets there | You type it | `git pull` from GitHub |

Same code, different settings. That is the whole trick: the code never says *which*
database or email account to use, the `.env` file does.

---

## Part A: What Docker is (5-minute read)

- **Image**: a ready-made, read-only package of software. `postgres:16` is an image
  containing Postgres version 16 and a tiny Linux to run it.
- **Container**: a running copy of an image. Like a lightweight virtual machine that
  starts in a second. You can delete it and make a new one any time.
- **Volume**: a storage folder Docker keeps for a container, so your data survives
  when the container is stopped or recreated.
- **Port mapping**: `5432:5432` means "port 5432 on my laptop goes to port 5432 inside
  the container". That's how the backend on your laptop reaches the database.
- **docker-compose.yml**: a recipe file in the repo that says which containers to run
  and how. `docker compose up -d` reads it and starts them (`-d` = in the background).

Why this is nice: you don't install Postgres on Windows at all, everybody gets the
exact same database version, and `docker compose down -v` throws the whole database
away so you can start fresh.

In this project only the **database** runs in Docker. The backend and frontend run
directly on Windows with Node, which is simpler while you're learning and gives you
instant reload when you save a file.

---

## Part B: Install the tools (one time)

Do these in order. Restart the laptop when an installer asks.

### 1. Turn on WSL 2 (Docker needs it)

1. Click Start, type **PowerShell**, right-click **Windows PowerShell** → **Run as
   administrator**.
2. Run:
   ```powershell
   wsl --install
   ```
3. Restart the laptop. If it opens an Ubuntu window asking for a username, you can
   create one or just close it; Docker doesn't need it.

> If `wsl --install` says the command isn't recognised, Windows 10 needs updating:
> Settings → Update & Security → Windows Update → install everything, then try again.
> WSL 2 needs Windows 10 version 2004 or newer (`winver` shows yours).

### 2. Docker Desktop

1. Download from https://www.docker.com/products/docker-desktop/ and install.
   Keep **"Use WSL 2 instead of Hyper-V"** ticked.
2. Open Docker Desktop and wait until the bottom-left says **Engine running**.
3. Check it works. Open a normal PowerShell window (not admin) and run:
   ```powershell
   docker run hello-world
   ```
   You should see "Hello from Docker!". You just downloaded an image and ran your
   first container.

### 3. Git

1. Download from https://git-scm.com/download/win and install with the default
   options.
2. Tell Git who you are (once):
   ```powershell
   git config --global user.name "Your Name"
   git config --global user.email "the-email-on-your-github-account"
   ```

### 4. Node.js and pnpm

1. On the **server**, run `node -v` to see its version (e.g. `v22.x`).
2. Download the same major version from https://nodejs.org and install it (tick the
   option that adds it to PATH).
3. Close and reopen PowerShell, then:
   ```powershell
   node -v
   npm install -g pnpm
   pnpm -v
   ```
   If PowerShell says *running scripts is disabled*, run this once and try again:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```

### 5. VS Code

Download from https://code.visualstudio.com and install. Optional but helpful
extensions: **Docker**, **Prisma**, **ESLint**.

---

## Part C: Get the code and start the database

1. Make a folder for your projects and download the code:
   ```powershell
   mkdir C:\dev
   cd C:\dev
   git clone https://github.com/Crabbypixel/merawealth.git
   cd merawealth
   ```
   (Merge PR #1 on GitHub first, so `docker-compose.yml` is on `main`.)
2. Open the folder in VS Code: `code .`
3. Start the database:
   ```powershell
   docker compose up -d
   ```
   The first time, it downloads the `postgres:16` image. Then check:
   ```powershell
   docker compose ps
   ```
   You should see a `db` service with status **running**. It also shows up in Docker
   Desktop under **Containers**.

---

## Part D: Settings files

1. Create the files from the examples:
   ```powershell
   Copy-Item backend\.env.example backend\.env
   Copy-Item frontend\.env.example frontend\.env.local
   ```
2. Open `backend\.env` in VS Code and set:
   ```
   NODE_ENV=development
   PORT=3001
   DATABASE_URL=postgresql://merawealth:merawealth@localhost:5432/merawealth_dev
   FRONTEND_URL=http://localhost:3000
   EMAIL_USER=<a NEW test Gmail address>
   EMAIL_APP_PASSWORD=<that account's App password>
   ```
   The username, password and database name in `DATABASE_URL` match what's written in
   `docker-compose.yml`. For the App password: Google Account → Security → 2-Step
   Verification on → App passwords.
3. `frontend\.env.local` can stay as `NEXT_PUBLIC_API_URL=http://localhost:3001`.

These files are ignored by git, so they never get uploaded and never reach the server.

---

## Part E: Run the app

Open **two** PowerShell windows (or two terminals in VS Code with the **+** button).

**Terminal 1, backend:**
```powershell
cd C:\dev\merawealth\backend
pnpm install
npx prisma migrate deploy
npx prisma generate
pnpm start:dev
```
`migrate deploy` creates all the tables in your Docker database. Wait until you see
that Nest has started.

**Terminal 2, frontend:**
```powershell
cd C:\dev\merawealth\frontend
pnpm install
pnpm dev
```

Open http://localhost:3000. That's your development copy.

---

## Part F: Make yourself an admin (test database only)

Admins aren't created through the app. Open a third terminal:

```powershell
cd C:\dev\merawealth
docker compose exec db psql -U merawealth -d merawealth_dev
```

You're now *inside* the container, talking to Postgres. Paste this (with your own
email), press Enter, then type `\q` to leave:

```sql
INSERT INTO "Admin" (name, "phoneNumber", email, "updatedAt")
VALUES ('Sekar', '9000000000', 'your-email@gmail.com', now());
```

Now log in as admin, register a fake client, approve it and place a test order.

Optional: the header logo is served from `backend\uploads\public\merawealth_logo.png`,
which isn't in git. Copy it from the server if you want it locally.

---

## Daily use

| You want to | Run |
| --- | --- |
| Start the database | `docker compose up -d` |
| Stop the database (data kept) | `docker compose stop` |
| See if it's running | `docker compose ps` |
| See database logs | `docker compose logs db` |
| Open the database console | `docker compose exec db psql -U merawealth -d merawealth_dev` |
| Wipe the test database and start over | `docker compose down -v`, then `up -d` and `npx prisma migrate deploy` again |
| Browse tables in a web page | `cd backend` then `npx prisma studio` |

Docker Desktop must be open for any of these to work.

---

## Common problems

- **`port is already allocated` / port 5432 in use**: Postgres is already installed on
  Windows. Either stop it (Services → postgresql → Stop) or change the compose file to
  `"5433:5432"` and use `localhost:5433` in `DATABASE_URL`.
- **`P1001: Can't reach database server`**: Docker Desktop isn't running, or the
  container is stopped. Run `docker compose up -d`.
- **`docker: command not found`** right after installing: close and reopen PowerShell.
- **Login emails don't arrive**: check `EMAIL_USER`/`EMAIL_APP_PASSWORD` in
  `backend\.env` and look at the backend terminal for the error.

---

## Where this fits

Once this works, building a feature and putting it live is Parts 3 and 4 of
[step-by-step.md](step-by-step.md): branch, build and test here, merge on GitHub, then
back up, pull, build and `pm2 restart` on the server.
