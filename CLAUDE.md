## What this repo does

REST API + WebSocket server for Rait. Handles authentication, trip management, proximity-based driver matching, Stripe payments, FCM push notifications, and real-time GPS tracking.

**Stack:** Node.js · Express · TypeScript strict · PostgreSQL + PostGIS · Socket.io · Stripe SDK · Firebase Admin SDK

---

## Folder structure

```
src/
  controllers/    # HTTP handlers — receive request, delegate to service, return response
  services/       # Business logic — everything important lives here
  models/         # TypeScript types + raw pg queries
  routes/         # Express route definitions
  middlewares/    # authenticateJWT, requireRole, global error handler
  utils/          # Pure helpers with no side effects
  socket/         # Socket.io event handlers
  jobs/           # Background jobs (expire stale requests, payment reconciliation)
  constants/      # TripStatus enum, error codes
  config/         # Environment variables + external service config
db/
  migrations/     # SQL files ordered by timestamp: YYYYMMDD_description.sql
  seeds/          # Test data for development
tests/
  unit/           # Services, utils, trip state machine
  integration/    # API endpoints via supertest + test DB
```

---

## Critical rules

**Trip state machine:** `requested → accepted → in_progress → completed` (or `cancelled` from the first two states). Never skip states or set status directly — always go through `TripService`.

**DB queries:** raw `pg` client with parameterized queries (`$1`, `$2`). Never interpolate strings into SQL. PostGIS: `ST_DWithin`, `ST_Distance`, `ST_GeomFromText`.

**Stripe:** charge only when `trip.status` changes to `completed`. Never modify a confirmed `payment_intent` — create a new one on error. Always verify webhook signature before processing Stripe events.

**Route auth order:**
```typescript
router.post('/trips', authenticateJWT, requireRole('passenger'), tripsController.create)
router.get('/admin/drivers', authenticateJWT, requireRole('admin'), adminController.listDrivers)
```

**Services never touch `req` / `res`** — they receive plain parameters and return plain values.

---

## Commands

```bash
npm run dev          # Dev server with hot reload
npm run build        # Compile TypeScript to /dist
npm run test         # Jest — all tests
npm run test:cov     # Jest with coverage report
npm run lint         # ESLint
npm run migrate      # Run pending migrations
npm run seed         # Insert test data
```

---

## Minimum agent context

```
Repo: rait-backend (Node.js + Express + TypeScript + PostgreSQL + PostGIS + Socket.io)
Trip state machine: requested → accepted → in_progress → completed | cancelled
Driver matching: ST_DWithin 5km radius, ordered by distance asc

[Specific task]
[Relevant files pasted below]
```

---

## Current sprint

**Sprint:** [ update each sprint ] · **Module in progress:** [ update each sprint ]
