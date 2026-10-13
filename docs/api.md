# API reference

The backend is a NestJS REST API. In local development it runs on `http://localhost:3001`.
All request and response bodies are JSON, except company create/update, which take
`multipart/form-data` because they carry a logo image.

## Conventions

**Authentication.** Logging in sets an HTTP-only cookie named `session`. Every protected
route reads that cookie, so browser requests must send credentials
(`fetch(url, { credentials: "include" })`). The frontend helper
[`apiFetch`](../frontend/src/utils/apiFetch.ts) does this for you.

| Guard | Who passes | Fails with |
|---|---|---|
| Public | Anyone | |
| Client | A logged-in client | `401` not logged in or session invalid, `403` not a client |
| Admin | A logged-in admin | `401` not logged in or session invalid, `403` not an admin |

**Responses.** Most responses carry `success` and, for writes, a human-readable `message`.
Errors use the same shape:

```json
{ "success": false, "message": "Minimum quantity is 10." }
```

**Validation.** A global `ValidationPipe` runs with `whitelist`, `forbidNonWhitelisted` and
`transform`. Unknown fields in a body or query are rejected with `400`, and query strings
like `page=2` are converted to numbers.

**Pagination.** List endpoints take `page` (default 1) and `limit` (default 10, max 100 where
noted) and return:

```json
{ "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }
```

## Endpoints at a glance

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new client (KYC details) |
| POST | `/auth/request-otp` | Public | Send a login OTP to the account's email |
| POST | `/auth/verify-otp` | Public | Check the OTP and start a session |
| GET | `/auth/me` | Logged in | Current user and role |
| POST | `/auth/logout` | Logged in | End the session |
| GET | `/companies` | Public | Active companies for the Pre-IPO page |
| GET | `/client/companies` | Client | Active companies to trade |
| GET | `/client/transactions` | Client | The client's own orders |
| POST | `/client/transactions` | Client | Place a BUY or SELL order |
| PATCH | `/client/transactions/:id/cancel` | Client | Cancel a pending order |
| GET | `/admin/users` | Admin | List clients |
| GET | `/admin/users/:id` | Admin | One client's full KYC details |
| PATCH | `/admin/users/:id` | Admin | Edit a client's details |
| PATCH | `/admin/users/:id/status` | Admin | Approve, reject or deactivate a client |
| GET | `/admin/companies` | Admin | List all companies |
| POST | `/admin/companies` | Admin | Add a company (with logo) |
| GET | `/admin/companies/:companyCode` | Admin | One company |
| PATCH | `/admin/companies/:companyCode` | Admin | Edit a company (logo optional) |
| PATCH | `/admin/companies/:companyCode/status` | Admin | List or unlist a company |
| GET | `/admin/transactions` | Admin | List all orders |
| PATCH | `/admin/transactions/:id` | Admin | Approve, reject or complete an order |
| GET | `/admin/order-match/companies` | Admin | Companies with orders waiting to match |
| GET | `/admin/order-match/:companyCode` | Admin | Sellers and buyers for one company |
| POST | `/admin/order-match/:companyCode/confirm` | Admin | Store a set of matches |
| GET | `/uploads/...` | Public | Static files (company logos, site images) |

`GET /hello` and `POST /echo` are leftover test routes from the project's start.

---

## Auth

### `POST /auth/register`

Creates a client with status `PENDING`. An admin must approve the account before the
client can log in.

```json
{
  "name": "Asha Rao",
  "phoneNumber": "9876543210",
  "email": "asha@example.com",
  "panNumber": "ABCDE1234F",
  "dematClientId": "12345678",
  "dematDpId": "IN300123",
  "bankAccountNo": "123456789012",
  "ifscCode": "HDFC0001234",
  "bankName": "HDFC Bank"
}
```

| Field | Rule |
|---|---|
| `phoneNumber` | 10 digits starting with 6 to 9 |
| `panNumber` | `AAAAA9999A` |
| `dematClientId`, `dematDpId` | 8 letters or digits |
| `ifscCode` | 11 characters |

Fails with `400 User already exists.` if the phone number or email is taken.
Every admin gets a "New client registration" email.

### `POST /auth/request-otp`

```json
{ "phoneNumber": "9876543210" }
```

Looks the phone number up among admins and clients, emails a one-time code to that
account's email address and returns a `challenge`. The code is valid for 5 minutes and
requesting a new one invalidates the previous one.

```json
{ "success": true, "challenge": "9f2c…", "message": "OTP sent." }
```

Clients whose account is not `ACTIVE` can't request a code.

### `POST /auth/verify-otp`

```json
{ "challenge": "9f2c…", "otp": 4821 }
```

On success it sets the `session` cookie (valid 7 days) and returns the role. Logging in
ends any other active session for the same account.

```json
{ "success": true, "message": "OTP verified successfully.", "role": "CLIENT" }
```

### `GET /auth/me`

Returns the logged-in account. The frontend uses it to decide which dashboard to show.

```json
{
  "success": true,
  "user": { "id": 7, "name": "Asha Rao", "email": "asha@example.com", "phoneNumber": "9876543210" },
  "role": "CLIENT"
}
```

### `POST /auth/logout`

Ends the session and clears the cookie.

---

## Companies

A company is a pre-IPO stock the platform deals in. Admins set its **indicative price**
(the price clients trade at) and **minimum quantity**.

### `GET /companies` and `GET /client/companies`

Active companies only, sorted by name, paginated.

```json
{
  "success": true,
  "companies": [
    {
      "companyCode": "NSEIL",
      "companyName": "National Stock Exchange",
      "companyLogo": "1720…-nse.png",
      "companyUrl": "https://www.nseindia.com",
      "shortNote": "India's largest exchange",
      "indicativePrice": "1850.00",
      "minQty": 10
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

Logos are served from `GET /uploads/company-logos/<companyLogo>`.

### `POST /admin/companies`

`multipart/form-data` with a `logo` file (PNG, JPEG or WebP, up to 5 MB) and these fields:

| Field | Rule |
|---|---|
| `companyCode` | 1 to 8 upper-case letters or digits, unique |
| `companyName` | Up to 100 characters, unique |
| `indicativePrice` | Number, up to 2 decimals, 0 or more |
| `minQty` | Number, 1 or more |
| `companyUrl` | Optional URL |
| `shortNote` | Optional, up to 500 characters |

New companies start `INACTIVE`, so they stay hidden until listed.

### `PATCH /admin/companies/:companyCode`

Same fields as create, all optional, plus an optional new `logo` file.

### `PATCH /admin/companies/:companyCode/status`

```json
{ "status": "ACTIVE" }
```

`ACTIVE` lists the company for trading; `INACTIVE` hides it.

---

## Orders (transactions)

### `POST /client/transactions`

```json
{ "companyCode": "NSEIL", "type": "BUY", "quantity": 25 }
```

The price is taken from the company's indicative price at that moment and stored on the
order as `priceAtOrder`; `totalAmount = priceAtOrder × quantity`. The company must be
`ACTIVE` and `quantity` must be at least its `minQty`. A confirmation email is sent to
the client and a "New BUY/SELL order" alert to every admin.

### `GET /client/transactions`

The logged-in client's orders, newest first, with `page` and `limit`. Each order includes
`quantity`, `approvedQuantity`, `matchedQuantity`, `pendingQuantity`, `priceAtOrder`,
`totalAmount`, `status`, `createdAt` and the company.

### `PATCH /client/transactions/:id/cancel`

Cancels the client's own order. Only allowed while it is `PENDING`.

### `GET /admin/transactions`

All orders, newest first. Optional `status` filter, plus `page` and `limit` (max 100).
Each order includes the client (name, phone, email) and the company.
`matchedAt` is the date of the order's latest Order Match round, or `null` if it was never
matched. The admin screen shows it in the Matched column for completed and partially
completed orders.

### `PATCH /admin/transactions/:id`

Changes an order's status. Approving requires the approved quantity:

```json
{ "status": "UNDER_PROCESS", "approvedQuantity": 20 }
```

Other changes send only the status, for example `{ "status": "REJECTED" }`.

| From | Allowed to |
|---|---|
| `PENDING` | `UNDER_PROCESS` (with `approvedQuantity` 1 to ordered quantity), `REJECTED` |
| `UNDER_PROCESS` | `COMPLETED`, `REJECTED` |
| `PARTIALLY_COMPLETED` | `COMPLETED`, `REJECTED` |
| `COMPLETED`, `REJECTED`, `CANCELLED` | Nothing |

Returns `409` if the order changed since it was read (for example the client cancelled it
a moment earlier). See [order-lifecycle.md](order-lifecycle.md) for the full picture.

---

## Users (clients)

### `GET /admin/users`

Clients, paginated, with an optional `status` filter: `PENDING`, `ACTIVE`, `REJECTED` or
`INACTIVE`.

### `GET /admin/users/:id` and `PATCH /admin/users/:id`

Read or edit one client's full details. The edit body has the same fields and rules as
`/auth/register`.

### `PATCH /admin/users/:id/status`

```json
{ "status": "ACTIVE" }
```

`ACTIVE` lets the client log in and trade.

---

## Order matching

All three routes are admin only. See [order-lifecycle.md](order-lifecycle.md#order-matching)
for the rules in plain words.

### `GET /admin/order-match/companies`

Companies that have orders in `UNDER_PROCESS` or `PARTIALLY_COMPLETED` with pending
quantity above 0.

```json
{
  "success": true,
  "companies": [
    {
      "companyCode": "NSEIL",
      "companyName": "National Stock Exchange",
      "sellOrders": 1, "sellPending": 20,
      "buyOrders": 2, "buyPending": 20,
      "canMatch": true
    }
  ]
}
```

`canMatch` is `false` when the company has only buy orders or only sell orders.

### `GET /admin/order-match/:companyCode`

```json
{
  "success": true,
  "company": { "companyCode": "NSEIL", "companyName": "National Stock Exchange" },
  "sellers": [
    {
      "id": 103, "userId": 4, "type": "SELL", "status": "UNDER_PROCESS",
      "clientName": "Ravi", "quantity": 25, "approvedQuantity": 20,
      "matchedQuantity": 0, "pendingQuantity": 20, "priceAtOrder": "1850.00",
      "createdAt": "2026-10-11T09:12:00.000Z", "updatedAt": "2026-10-11T10:02:00.000Z"
    }
  ],
  "buyers": [ … ],
  "usedMatchIds": ["M0"]
}
```

Orders are oldest first. `usedMatchIds` are the Match IDs already used for this company.

### `POST /admin/order-match/:companyCode/confirm`

```json
{
  "entries": [
    { "transactionId": 103, "matchQuantity": 20, "matchId": "M1", "updatedAt": "2026-10-11T10:02:00.000Z" },
    { "transactionId": 101, "matchQuantity": 10, "matchId": "M1", "updatedAt": "2026-10-11T10:05:00.000Z" },
    { "transactionId": 102, "matchQuantity": 10, "matchId": "M1", "updatedAt": "2026-10-11T10:06:00.000Z" }
  ]
}
```

`updatedAt` is the value the screen loaded for each order; it is how the server spots
orders that changed in the meantime. 1 to 1000 entries per request.

| Response | When |
|---|---|
| `201` | Stored. Returns `matchIds`, `ordersCompleted` and `ordersPartiallyCompleted` |
| `400` | A rule failed. `errors` lists each problem with its `transactionId` or `matchId` |
| `409` | An order changed or is no longer open for matching. Reload and try again |

```json
{
  "success": false,
  "message": "Please fix the highlighted problems before confirming.",
  "errors": [
    { "matchId": "M1", "message": "Match ID M1: sellers total 20 but buyers total 10. They must be equal." }
  ]
}
```
