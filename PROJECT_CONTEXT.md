# E-commerce Project Context and Handoff

Use this document as context when continuing the project in ChatGPT Web. It reflects the repository as inspected on 2026-07-04. Treat statements under **Current implementation** and **Known issues** as observations of the code, not assumptions.

## How to use this context

When answering questions about this project:

- Preserve the existing pnpm/Turborepo monorepo unless there is a strong reason to change it.
- Distinguish implemented behavior from mock UI and planned behavior.
- Prefer incremental implementations that fit the current services and shared packages.
- Flag security, payment integrity, data consistency, and deployment concerns explicitly.
- Before suggesting code, state which app/package and files should change.
- Ask for missing product requirements only when they materially affect the implementation.

## Project goal

A full-stack e-commerce platform with:

- A customer storefront for browsing products, selecting variants, managing a cart, signing in, and paying.
- An admin dashboard for products, categories, users, orders/payments, and analytics.
- Separate product, order, and payment services.
- Clerk authentication and role-based admin authorization.
- PostgreSQL for catalog data, MongoDB for orders, and Stripe for payments.

The codebase is currently a learning/development project. The storefront UI and service foundations exist, but the complete catalog-to-payment-to-order lifecycle is not yet connected.

## Architecture

This is a pnpm workspace managed by Turborepo. It uses two Next.js frontends and three independently hosted Node.js HTTP services.

```text
Customer browser -> client (Next.js, :3002)
                         |-> product-service (Express, :8000) -> PostgreSQL via Prisma
                         |-> order-service (Fastify, :8001)  -> MongoDB via Mongoose
                         `-> payment-service (Hono, :8002)   -> Stripe

Admin browser ----> admin (Next.js, :3003)
                         `-> intended to call protected product/order APIs

Clerk authenticates customer requests and supplies JWT session claims.
Admin authorization expects sessionClaims.metadata.role === "admin".
Shared TypeScript contracts live in packages/types.
```

There is currently no API gateway, message broker, container/orchestration setup, or service discovery. Frontend/service URLs and CORS origins are local-development oriented.

## Folder structure

```text
ecommerse_app/
|-- apps/
|   |-- client/                 Customer Next.js App Router application
|   |   |-- public/             Product/payment images and branding
|   |   `-- src/
|   |       |-- app/            Home, products, cart, return, orders, auth pages
|   |       |-- components/     Catalog, cart, shipping, Stripe, navbar/footer UI
|   |       `-- stores/         Persisted Zustand cart store
|   |-- admin/                  Admin Next.js App Router dashboard
|   |   |-- public/             Mock product/user images
|   |   `-- src/
|   |       |-- app/            Dashboard, products, users, payments pages
|   |       |-- components/     Forms, charts, tables, sidebar, dashboard widgets
|   |       `-- components/ui/  shadcn/Radix-style UI primitives
|   |-- product-service/        Express catalog API
|   |   `-- src/{controllers,routes,middleware}/
|   |-- order-service/          Fastify order query API
|   |   `-- src/{routes,middleware}/
|   `-- payment-service/        Hono Stripe checkout API
|       `-- src/{routes,middleware,utils}/
|-- packages/
|   |-- product-db/             Prisma 7 PostgreSQL schema/client/migrations
|   |-- order-db/               Mongoose connection and Order model
|   |-- types/                  Shared product/cart/auth types and Zod schema
|   |-- eslint-config/          Shared lint configuration
|   `-- typescript-config/      Shared TypeScript configurations
|-- package.json                Root Turbo scripts
|-- pnpm-workspace.yaml
`-- turbo.json
```

## Tech stack

- Monorepo: pnpm 9 workspaces, Turborepo 2, TypeScript.
- Customer frontend: Next.js 15.4, React 19, Tailwind CSS 4, Zustand 5 with localStorage persistence, React Hook Form, Zod, Lucide icons, React Toastify.
- Admin frontend: Next.js 15.3, React 19, Tailwind CSS 4, Radix UI/shadcn-style components, TanStack Table, Recharts, React Hook Form, Zod, next-themes.
- Authentication: Clerk for Next.js, Express, Fastify, and Hono.
- Product service: Express 5 and CORS.
- Product database: PostgreSQL, Prisma 7, `@prisma/adapter-pg`.
- Order service: Fastify 5.
- Order database: MongoDB with Mongoose.
- Payment service: Hono 4 on Node and Stripe Checkout Elements/embedded checkout.
- Package-level runtime tooling: `tsx` in watch mode.

Version caveat: package versions are not fully aligned (for example Next.js 15.3 vs 15.4 and TypeScript 5.x vs an order-service TypeScript 6 dev dependency).

## Data models and contracts

### Product catalog (PostgreSQL)

`Product`: integer ID, name, short description, description, integer price, string-array sizes, string-array colors, JSON images, timestamps, and category slug relation.

`Category`: integer ID, name, unique slug, and related products.

Images are designed as a color-to-image mapping. Product creation validates that every selected color has an image key. There is no inventory/SKU model yet, so stock cannot be tracked per size/color variant.

### Orders (MongoDB)

`Order`: Clerk user ID, email, amount, status (`success` or `failed`), product snapshots containing name/quantity/price, and timestamps.

The order model currently omits shipping address, Stripe IDs, currency, variant selections, explicit order number, fulfillment state, refunds, and idempotency metadata.

### Shared types

`@repo/types` exports Prisma-derived product/category types, cart types, shipping form validation, Stripe product shape, and Clerk custom role claims. A cart line is a product plus quantity, selected size, and selected color.

## Current implementation

### Customer app

- Responsive storefront shell with navbar, footer, home page, catalog cards, categories, filters, product detail UI, and product variant selection.
- Cart supports distinct size/color variants, quantity changes/removal, clearing, hydration tracking, and persistence in browser localStorage through Zustand.
- Clerk provider, sign-in/sign-up pages, user controls, and middleware are present.
- Checkout contains a validated shipping form and Stripe Checkout Elements payment UI.
- The client requests a Clerk token, sends the cart to the payment service, obtains a Checkout Session client secret, and confirms payment.
- The return page retrieves a Stripe session and displays its session/payment status.
- Product list, categories, and product details are still hardcoded. URL category/filter controls change query parameters but do not filter API-backed data.
- The orders page is only a placeholder.

### Product service

- Express server on port 8000 with `/health` and an authenticated `/test` endpoint.
- Public product reads: list with sort/category/search/limit query options and get-by-ID.
- Admin-only create/update/delete product routes.
- Public category listing and admin-only category create/update/delete routes.
- Clerk JWT validation and `metadata.role === "admin"` checks.
- Prisma-backed PostgreSQL catalog with an initial product/category migration.

### Order service

- Fastify server on port 8001, Clerk plugin, MongoDB connection, health/test routes.
- Intended authenticated endpoint for a customer's orders and admin endpoint for all orders.
- No create-order route; order creation is intended to happen after Stripe webhook confirmation.

### Payment service

- Hono server on port 8002 with Clerk middleware, CORS, health route, and checkout session routes.
- Authenticated checkout-session creation.
- Server derives Stripe unit amounts by looking up Stripe prices by product ID rather than trusting prices submitted by the browser.
- Session status retrieval for the return page.
- A Stripe webhook handler exists and verifies signatures, but it is not registered in the Hono app and its order creation branch remains a TODO.

### Admin app

- Substantial dashboard UI: sidebar/navbar, theme support, charts, cards, todo widget, tables, pagination, and add/edit sheets.
- Products, users, and payments tables currently use hardcoded mock arrays.
- Add/edit forms are mostly UI-only; product image file inputs are not wired to storage/upload or the product API.
- Admin authentication/route protection and Clerk integration are absent from the admin app.

## Important design decisions already present

- Monorepo with independently deployable services and shared TypeScript packages.
- Domain databases are separated: relational PostgreSQL for catalog data and MongoDB for order documents.
- Clerk user IDs are the cross-service user identity; roles come from Clerk session metadata.
- Product reads are public; catalog mutations and global order reads require admin role.
- Cart state is client-side and persisted locally, not stored server-side.
- Cart line identity is `(productId, selectedSize, selectedColor)`.
- Payment amounts are intended to be server-authoritative through Stripe price lookup.
- Product images are represented as JSON keyed by color.
- Stripe Checkout uses embedded/Elements UI and redirects back to `/return`.
- Orders should be produced from verified Stripe webhook events, not merely from the browser return page. This intent is correct but unfinished.

## Known issues and risks

### Functional correctness

- `payment-service/src/routes/webhooks.route.ts` is never mounted in `payment-service/src/index.ts`; no webhook can currently create an order.
- The webhook contains `TODO: create order`, and the payment service has no dependency/client configured for order persistence.
- Customer order lookup queries `{ userID: request.userId }`, but the Mongo schema field is `userId`; it will not match stored orders.
- The storefront never fetches the product API, so the database catalog is not visible to customers.
- Stripe lookup assumes each catalog product ID already exists as a Stripe Product with a usable price. Catalog creation does not synchronize Stripe products/prices.
- `GetStripeProductPrice` can return an Error/undefined, which is cast to a number without robust validation.
- Checkout receives `shippingForm` as required even though parent state begins undefined; checkout should be gated until shipping validation succeeds.
- Payment button is inside a form but has no explicit `type="button"` or submit handler/preventDefault.
- Checkout hardcodes shipping country to `US`, and the shipping schema does not collect country/postal code/state.
- The return page reports status but does not clear the cart, display an order receipt, or guarantee order persistence.
- Product database price is an integer, while mock products use decimals. A consistent minor-unit money convention is needed.
- Product not-found and invalid numeric IDs are not explicitly handled.

### Security and integrity

- Admin frontend lacks authentication and authorization protection.
- Payment session status GET is public and does not verify the session belongs to the requesting Clerk user.
- CORS and return URLs are hardcoded to localhost; production configuration is missing.
- The Stripe publishable key is embedded in source. It is public by nature, but an environment variable is still preferable for per-environment configuration.
- Webhook processing needs idempotency and duplicate-event protection.
- Service inputs rely heavily on TypeScript annotations instead of runtime request validation.
- Error responses in Hono auth middleware do not consistently set 401/403 status codes.

### Maintainability and operations

- Root README is the unchanged Turborepo starter and does not document this project.
- No automated tests, CI workflow, Docker setup, deployment manifests, centralized logging, observability, or API documentation were found.
- Backend services do not consistently define build/start/lint scripts, which may make root Turbo commands incomplete.
- Environment variables are undocumented and Turbo only declares `DATABASE_URL` globally, while the project also needs Clerk, MongoDB, Stripe, and public service URLs.
- Shared `types` imports ORM/database packages, coupling frontend contracts to persistence implementations and increasing bundle/type-generation fragility.
- There is deprecated/commented experimental code and a temporary test page with hardcoded localhost endpoints.
- Generated/default metadata and some naming remain inaccurate (for example admin metadata and the products page component/title).

## Required environment configuration

Exact Clerk variable names follow Clerk framework conventions and should be confirmed from the local `.env` files without exposing secrets. At minimum, the architecture requires:

- Product DB/service: `DATABASE_URL`, Clerk publishable/secret credentials, allowed origins, port.
- Order DB/service: `MONGO_URL`, Clerk credentials, port.
- Payment service: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, Clerk credentials, client/return origin, port.
- Customer: Clerk public configuration, `NEXT_PUBLIC_PAYMENT_SERVICE_URL`, Stripe publishable key, and ideally product/order service URLs.
- Admin: Clerk public configuration plus product/order service URLs.

Do not commit real secret values. Add validated `.env.example` files for each app.

## Remaining TODOs and recommended order

### P0 — complete a safe purchase lifecycle

1. Choose and document the money representation (recommended: integer minor units such as cents everywhere).
2. Make catalog/Stripe price ownership explicit. Prefer fetching authoritative product prices from the product service during checkout or persist Stripe Price IDs in the catalog; do not depend on an undocumented product-ID convention.
3. Mount the Stripe webhook route and create orders only after verified payment events.
4. Add Stripe session/payment-intent IDs and an idempotency key/index to orders to prevent duplicates.
5. Capture complete shipping information and product variant snapshots in orders.
6. Fix `userID` to `userId`, implement reliable user/admin order reads, and protect session-status lookup by ownership.
7. Add structured error handling and runtime validation for checkout and webhook payloads.
8. Test the entire flow with Stripe CLI: cart -> checkout -> successful/failed payment -> webhook -> order -> customer order history.

### P1 — replace mocks with real application data

1. Connect storefront product list/detail/category/filter/search pages to product-service.
2. Define loading, empty, error, invalid-ID, and not-found behavior.
3. Connect the admin product/category screens to protected APIs using Clerk tokens.
4. Implement image upload/storage (for example S3-compatible storage or Cloudinary) and store stable URLs.
5. Connect customer orders and admin order/payment tables to real data.
6. Protect the admin app at both route/UI and API levels; API authorization remains the source of truth.
7. Decide whether user administration comes from Clerk's backend API or a synchronized local profile store.

### P2 — strengthen domain design

1. Add SKU/variant and inventory models instead of only product-level size/color arrays.
2. Define order and fulfillment state machines (pending, paid, failed, processing, shipped, delivered, cancelled, refunded).
3. Add currency, taxes, shipping rates, discounts/coupons, refunds, and inventory reservation rules as required.
4. Decide whether services communicate synchronously through HTTP or asynchronously through events; document failure/retry behavior.
5. Split API DTOs/schemas from Prisma and Mongoose model types, ideally using shared Zod contracts.
6. Add pagination to product/order endpoints and avoid unbounded admin queries.

### P3 — production readiness

1. Align dependency versions and add consistent `build`, `start`, `lint`, and `check-types` scripts.
2. Add unit/integration/end-to-end tests and payment webhook fixtures.
3. Add CI for formatting, linting, type checking, tests, builds, and Prisma migration validation.
4. Add environment validation, `.env.example` files, production CORS/URL configuration, and secret-management guidance.
5. Add logging with request/correlation IDs, health/readiness checks, metrics, and error monitoring.
6. Define deployment topology, database backups/migrations, HTTPS, rate limiting, and webhook availability.
7. Replace the starter README and remove temporary/deprecated code once migrated.

## Decisions that still need to be made

- Is this intentionally a microservice learning architecture, or should deployment simplicity take priority? For a small initial product, three backend frameworks/databases increase operational cost.
- Which system owns price data: PostgreSQL catalog or Stripe? How are price updates synchronized?
- Will product variants become first-class SKUs with inventory, or remain option arrays?
- Should order creation write directly to MongoDB from payment-service, call order-service, or publish a payment event to a queue?
- Which countries/currencies, shipping rules, taxes, and payment methods must be supported?
- What image storage/provider and upload security model will be used?
- Is guest checkout required, or must every buyer authenticate with Clerk?
- What admin roles/permissions are required beyond one `admin` role?
- Will Clerk remain the source of truth for users, or will local customer profiles be stored?
- What are the intended hosting providers and environment topology?

## Suggested near-term target

Build one complete vertical slice before expanding admin analytics: a real database product appears in the storefront, an authenticated customer buys it at a server-verified price, Stripe sends a verified idempotent webhook, an order with shipping and variants is stored, and that order appears in both customer history and the protected admin view.

## Useful commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm check-types
pnpm lint
pnpm --filter @repo/product-db db:generate
pnpm --filter @repo/product-db db:migrate
```

Note: some commands may currently fail because not every workspace defines every Turbo task consistently; fix scripts as part of production-readiness work.

## Prompt for the next ChatGPT conversation

Copy this file into ChatGPT Web, then add:

> Act as a senior full-stack architect and implementation partner for this project. Use the repository context above as the current source of truth, but ask me to paste relevant files before proposing exact patches if you cannot inspect the repository. Separate verified facts from assumptions. Preserve current architecture unless we explicitly decide otherwise. Prioritize payment security, authoritative pricing, webhook idempotency, authorization, and data consistency. For each implementation, identify affected apps/files, data/API contract changes, migration needs, implementation steps, edge cases, and tests. My next question is: [ASK YOUR QUESTION HERE]

