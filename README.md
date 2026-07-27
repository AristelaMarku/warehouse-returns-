# Warehouse Returns Management System

A full-stack web application for warehouse staff to manage device returns via RMAs (Return Merchandise Authorizations). Workers scan or type a device serial number, the system validates the return against business rules, and automatically assigns a disposition — no manual lookup required.

## Stack

| Layer    | Technology                                         |
|----------|----------------------------------------------------|
| Frontend | Angular 19 — standalone components, signals, Material |
| Backend  | NestJS 10 — TypeORM, class-validator, Passport JWT |
| Database | PostgreSQL 15                                       |
| Shared   | `libs/shared` — enums & interfaces used by both apps |

## How It Works

1. A receiver logs in and sees the list of open RMAs
2. They click **Receive** on an RMA, scan the device serial, and submit
3. The API validates the return (status, serial match, eligibility window) and auto-assigns disposition
4. The result — success with disposition, or a clear rejection reason — is shown immediately
5. Every attempt (including rejections) is persisted as a receipt for audit purposes

## Return Reason → Disposition

| Return Reason    | Disposition        | What the worker does               |
|------------------|--------------------|------------------------------------|
| Standard Return  | RESTOCKED          | Place on the resale shelf          |
| Warranty Repair  | IN_EVALUATION      | Route to the evaluation bench      |
| Trade-in/Recycle | RECYCLED           | Send to the recycle bin            |
| Exchange         | REPLACEMENT_ISSUED | Hold device; replacement ships out |

## Quick Start

### 1. Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)

### 2. Start the database

```bash
docker-compose up -d
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment

```bash
cp .env.example .env
# Defaults work out of the box with docker-compose
```

### 5. Run migrations

```bash
npm run migration:run
```

### 6. Seed test data

```bash
npm run seed
```

Creates 3 users and 8 RMAs covering every scenario (happy paths, serial mismatch, expired window, already-received, cancelled).

**Seeded users:**

| Username    | Password  | Role       |
|-------------|-----------|------------|
| admin       | admin123  | admin      |
| supervisor1 | super123  | supervisor |
| receiver1   | recv123   | receiver   |

### 7. Start the API

```bash
npm run dev:api
```

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api/docs`

### 8. Start the frontend

```bash
npm run dev:web
```

- App: `http://localhost:4200`

## Running Tests

```bash
# Backend unit tests
npm run test:api

# Backend e2e tests (requires Postgres running)
npm run test:e2e

# Frontend unit tests
npm run test:web
```

## Project Structure

```
warehouse-project/
├── apps/
│   ├── api/          NestJS API (port 3000)
│   └── web/          Angular SPA (port 4200)
├── libs/
│   └── shared/       Shared enums & interfaces
├── docker-compose.yml
└── .env.example
```

## Key Design Decisions

- **Pessimistic locking** — `SELECT FOR UPDATE` prevents two workers from receiving the same RMA simultaneously
- **Rejected receipts are always saved** — every attempt is stored for a full audit trail, even when rejected
- **Serial check is opt-in** — `expected_serial_number = NULL` means any serial is accepted; enforcement is per-RMA
- **Eligibility window** — `eligibility_window_days` is enforced at receipt time; supervisors can extend via `PATCH /rmas/:id/extend-window`
- **422 for business rejections** — the HTTP request is valid; the rejection is a domain rule, not a malformed request

## Assumptions

- RMAs are created upstream (customer portal / call center). This app handles receiving only.
- JWT auth with 8 h expiry — workers re-login at shift start. No refresh tokens for simplicity.
- `REPLACEMENT_ISSUED` records the inbound receipt state only. Outbound shipment triggering is out of scope.
- `RESTOCKED` is a disposition label. Actual inventory system integration would be a downstream webhook.

## Hours Spent

| Area                                              | Hours |
|---------------------------------------------------|-------|
| Planning & data model design                      | ~1h   |
| Backend (entities, migrations, business logic, tests) | ~1h   |
| Frontend (components, routing, forms, styling)    | ~2h   |
| Integration, seed, README                         | ~1h   |
| **Total**                                         | **~5h** |

## What Would Come Next

- JWT refresh tokens
- Supervisor UI for cancel / extend-window actions
- Real-time RMA list updates via WebSocket or SSE
- Rate limiting on the `/receive` endpoint
- Pagination on the audit log endpoint
