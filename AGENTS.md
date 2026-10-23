# AGENTS.md — NOOR OPTICAL (sandbox notes)

The Base44 dev stack is `docker-compose.base44.yml` at this repo root. It runs from the cloned
source: Postgres 16 (`db`), a one-shot `migrate` service (migrations + demonstration seed), the
API (`noor-optical/api`, `tsx watch`, host port 8000) and the storefront (`noor-optical/web`,
Vite, host port 3000 → container 5173, which proxies `/api` to the API).

## Non-obvious findings

- Every page is statically imported by `web/src/App.tsx`, so an uncaught error while rendering
  **one** page unmounts the whole React tree: every route goes blank and a fresh load of an
  affected route looks like "the app never rendered". Read the browser console for the page
  name before suspecting the router or the dev server.
- There is no test suite. The only gate is TypeScript (`npm run typecheck` in each service):
  `docker compose -f docker-compose.base44.yml exec -T web npx tsc --noEmit` and the same with
  `api`. It catches missing/mistyped context members that Vite is happy to serve at runtime.
- `api` reports one pre-existing typecheck error in `api/src/auth.ts` (`expiresIn` typing vs
  `@types/jsonwebtoken`); runtime signing works and is unaffected.
- Storefront copy defaults to Persian (RTL); the language button in the footer switches to
  English. Layout mirrors through logical properties, so both directions share one stylesheet.
- Store settings (hero, announcement, contact, commerce, trust) live in the database and are
  edited at `/admin/settings`; the storefront reads them from `GET /api/settings` and falls back
  to local defaults.
- A seeded staff account exists for development — credentials are in
  `noor-optical/.env.base44-defaults`; the `migrate` service seeds it as an `admin` customer.
- The demonstration catalogue seeds no discounted prices, so the `/sale` listing legitimately
  renders its empty state.

## Verify a running stack

- `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` → `200`
- `curl -s http://localhost:8000/api/health` → `{"status":"ok","database":"up",...}`
