# Ominify E-commerce Project Context and Handoff

Use this document as context when continuing the project. It reflects the repository as inspected on **2026-07-28**. Treat statements under **Current implementation** and **Completed features** as verified observations of the codebase.

---

## How to use this context

When answering questions or building features for this project:

- Preserve the existing **pnpm / Turborepo** monorepo structure.
- Distinguish fully implemented event-driven microservices from remaining operational/production enhancements.
- Prefer incremental implementations that build upon existing shared packages (`@repo/types`, `@repo/kafka`, `@repo/product-db`, `@repo/order-db`).
- Note that microservices communicate asynchronously via **Kafka events** for background tasks (Stripe catalog sync, order creation, welcome/confirmation emails) while maintaining synchronous HTTP APIs for direct client requests.
- Before suggesting code, state which app or package and exact files should change.

---

## Project Goal

**Ominify** is a full-stack, event-driven e-commerce microservices platform featuring:

- **Customer Storefront (`apps/client`)**: Next.js 15 App Router customer interface featuring an auto-playing hero banner carousel, debounced real-time search with a responsive fullscreen mobile search overlay, product catalog with advanced category/price filtering, wishlist management with cross-device PostgreSQL sync, persisted cart with variant selections (size/color), Stripe Embedded Checkout with receipt success modal, customer account portal, and order history tracking.
- **Admin Dashboard (`apps/admin`)**: Next.js 15 App Router management portal protected by Clerk role-based access control (`admin` role), enabling catalog management (products & categories), user administration, and order monitoring.
- **Product & Wishlist Service (`apps/product-service`)**: Express 5 service managing PostgreSQL product catalog and user wishlists via Prisma 7. Emits Kafka events when products are created or deleted, and provides weighted search algorithms (supporting term normalization, pluralization, and hyphens).
- **Order Service (`apps/order-service`)**: Fastify 5 service managing MongoDB order records via Mongoose. Consumes Kafka payment events to persist orders and emits order creation events.
- **Payment Service (`apps/payment-service`)**: Hono 4 service interfacing with Stripe Embedded Checkout. Listens for Stripe webhooks, emits Kafka payment events, and automatically synchronizes catalog items into Stripe products/prices via Kafka event subscriptions.
- **Auth Service (`apps/auth-service`)**: Express 5 service providing admin-protected User CRUD operations interfacing with Clerk Backend SDK. Emits Kafka user creation events.
- **Email Service (`apps/email-service`)**: Event-driven background worker built with KafkaJS and Nodemailer (Gmail OAuth2) that listens for system events (`user.created`, `order.created`) to dispatch automated emails.
- **Kafka Message Broker (`packages/kafka`)**: Multi-broker Apache Kafka cluster managed via Docker Compose (ports 9094, 9095, 9096) with Kafka UI for real-time topic monitoring.

---

## Architecture

This is a pnpm workspace managed by Turborepo containing 7 applications and 6 shared packages.

```text
                                +-------------------+
                                | Customer Browser  |
                                +---------+---------+
                                          |
                                          v
                              +-----------------------+
                              |    client (Next.js)   |
                              |      Port :3002       |
                              +---+---------------+---+
                                  |               |
             +--------------------+               +--------------------+
             | (Catalog / Wishlist / Products)                          | (Checkout / Session)
             v                                                         v
+--------------------------+                               +--------------------------+
| product-service (Express)|                               | payment-service (Hono)   |
|        Port :8000        |                               |        Port :8002        |
+------------+-------------+                               +------------+-------------+
             |                                                          |
             | (Emits product.created / product.deleted)                | (Receives Stripe Webhook)
             v                                                          v
+-------------------------------------------------------------------------------------+
|                              Apache Kafka Cluster                                   |
|                      (docker-compose: 9094, 9095, 9096)                              |
+-----+----------------------------+----------------------------+---------------------+
      |                            |                            |
      | (product.*)                | (payment.successful)       | (user.created & order.created)
      v                            v                            v
+--------------------+   +--------------------+       +-----------------------+
|  payment-service   |   |   order-service    |       |     email-service     |
| (Syncs Stripe catalog)| | (Persists Mongo) |       | (Dispatches Emails)   |
+--------------------+   +---------+----------+       +-----------------------+
                                   |
                                   | (Emits order.created)
                                   +----------------------------+

                                +-------------------+
                                |   Admin Browser   |
                                +---------+---------+
                                          |
                                          v
                              +-----------------------+
                              |    admin (Next.js)    |
                              |      Port :3003       |
                              +---+---------------+---+
                                  |               |
              +-------------------+               +-------------------+
              | (User CRUD)                                           | (Product CRUD)
              v                                                       v
+--------------------------+                             +--------------------------+
|   auth-service (Express) |                             | product-service (Express)|
|        Port :8003        |                             |        Port :8000        |
+------------+-------------+                             +--------------------------+
             | (Emits user.created)
             +--------------------------------------------------+
```

### Shared Packages

- **`@repo/kafka`**: Shared Kafka client setup, producer (`createProducer`), and consumer (`createConsumer`) abstraction built on `kafkajs`.
- **`@repo/product-db`**: Prisma 7 PostgreSQL client, schema (`Product`, `Category`, `Wishlist`), and migrations.
- **`@repo/order-db`**: Mongoose connection and MongoDB `Order` model definition (with support for variant size, color, image).
- **`@repo/types`**: Shared TypeScript contracts, Zod schemas, Clerk JWT claim types, and cart/wishlist DTOs.
- **`@repo/eslint-config`**: Monorepo linting rules.
- **`@repo/typescript-config`**: Shared TypeScript compiler configurations.

---

## Folder Structure

```text
ecommerse_app/
|-- apps/
|   |-- client/                 Customer Next.js App Router application (:3002)
|   |   |-- public/             Brand logo (`logo.svg`), promotional hero banners (`banners/`)
|   |   |-- src/app/            (shop) landing, (dashboard) account, cart, categories, orders, products, return, wishlist
|   |   |-- src/components/     HeroCarousel, SearchBar, ProductCard, ProductList, ProductInteraction,
|   |   |                       CategoryCard, Categories, CheckoutForm, PaymentSuccessModal, AppSidebar, RightSidebar, Navbar, Footer
|   |   |-- src/lib/            Category data constants (`categoryData.ts`), UI helper utilities
|   |   `-- src/stores/         Zustand stores: `cartStore.ts` (cart persistence), `wishlistStore.ts` (wishlist state & API sync)
|   |-- admin/                  Admin Next.js App Router dashboard (:3003)
|   |   |-- src/app/            Protected dashboard, products, categories, users, orders
|   |   |-- src/components/     Forms (AddProduct, AddUser, AddCategory), tables, charts, sidebar
|   |   `-- src/middleware.ts   Clerk role-based protection (admin role required)
|   |-- product-service/        Express catalog & wishlist API (:8000)
|   |   `-- src/                Controllers (`product`, `category`, `wishlist`), routes, Prisma client, Kafka producer
|   |-- order-service/          Fastify order API (:8001)
|   |   `-- src/                Order query routes, Mongoose db, Kafka consumer & producer
|   |-- payment-service/        Hono Stripe checkout API (:8002)
|   |   `-- src/                Session creation, Stripe webhooks, Kafka consumer/producer
|   |-- auth-service/           Express user management API (:8003)
|   |   `-- src/                Clerk SDK integration, user CRUD, Kafka producer
|   `-- email-service/          Event-driven email worker (No HTTP port)
|       `-- src/                Kafka topic consumers, Nodemailer Gmail transport
|-- packages/
|   |-- kafka/                  Shared kafkajs client, producer, consumer & Docker Compose
|   |-- product-db/             Prisma 7 PostgreSQL schema (`Product`, `Category`, `Wishlist`), client, and migrations
|   |-- order-db/               Mongoose connection and Order model
|   |-- types/                  Shared TypeScript types, Zod schemas, and JWT claims
|   |-- eslint-config/          Shared ESLint configuration
|   `-- typescript-config/      Shared tsconfig definitions
|-- PROJECT_CONTEXT.md          This project handoff and architecture specification document
|-- package.json                Root pnpm workspace scripts
|-- pnpm-workspace.yaml
`-- turbo.json
```

---

## Tech Stack

- **Monorepo**: pnpm 9 workspaces, Turborepo 2, TypeScript 5.9.
- **Customer Frontend (`apps/client`)**: Next.js 15, React 19, Tailwind CSS 4, Zustand 5 (cart & wishlist stores), React Hook Form, Zod, Lucide icons, Stripe Elements (`@stripe/react-stripe-js`), Clerk (`@clerk/nextjs`), Google Fonts (`Outfit`, `Inter`).
- **Admin Frontend (`apps/admin`)**: Next.js 15, React 19, Tailwind CSS 4, Radix UI / shadcn-style components, TanStack Table, Recharts, React Hook Form, Zod, next-themes, Clerk (`@clerk/nextjs`).
- **Authentication & Authorization**: Clerk authentication across Next.js frontends, Express (`@clerk/express`), Fastify (`@clerk/fastify`), and Hono (`@hono/clerk-auth`). Custom claims enforce `metadata.role === "admin"`.
- **Product & Wishlist Service**: Express 5, Prisma 7, PostgreSQL via `@prisma/adapter-pg`.
- **Order Service**: Fastify 5, MongoDB with Mongoose.
- **Payment Service**: Hono 4 on Node.js, Stripe SDK (Checkout sessions & webhooks).
- **Auth Service**: Express 5, `@clerk/express`, `@clerk/backend` SDK.
- **Email Service**: KafkaJS consumer, Nodemailer with OAuth2 (Gmail API).
- **Event Streaming & Infrastructure**: Apache Kafka (3-broker cluster on Docker Compose), Kafka UI.

---

## Data Models and Kafka Contracts

### Product Catalog & Wishlist (PostgreSQL via Prisma)

- **`Product`**: `id` (Int, PK, auto-increment), `name` (String), `shortDescription` (String), `description` (String), `price` (Int, minor units / cents), `sizes` (String[]), `colors` (String[]), `images` (JSON: color-to-image mapping), `categorySlug` (String, FK), `createdAt`, `updatedAt`.
- **`Category`**: `id` (Int, PK, auto-increment), `name` (String), `slug` (String, Unique).
- **`Wishlist`**: `id` (Int, PK, auto-increment), `userId` (String), `productId` (Int, FK -> `Product.id`, Cascade Delete), `createdAt` (DateTime). Unique constraint: `@@unique([userId, productId])`.

### Orders (MongoDB via Mongoose)

- **`Order`**:
  - `userId` (String, required - Clerk User ID)
  - `email` (String, required - Customer Email)
  - `amount` (Number, required - Total order price in minor units / cents)
  - `status` (String, enum: `["success", "failed"]`)
  - `products`: Array of items:
    - `productId` (Number)
    - `name` (String)
    - `quantity` (Number)
    - `price` (Number)
    - `image` (String)
    - `selectedColor` (String)
    - `selectedSize` (String)
  - Timestamps: `createdAt`, `updatedAt`

### Event Streaming Contracts (Kafka Topics)

1. **`user.created`**:
   - Producer: `auth-service` (when a new user is created via Admin API)
   - Consumer: `email-service`
   - Payload: `{ username: string, email: string }`
2. **`product.created`**:
   - Producer: `product-service` (when admin creates a new product)
   - Consumer: `payment-service`
   - Payload: `{ id: string, name: string, price: number }`
3. **`product.deleted`**:
   - Producer: `product-service` (when admin deletes a product)
   - Consumer: `payment-service`
   - Payload: `productId` (number)
4. **`payment.successful`**:
   - Producer: `payment-service` (when Stripe webhook receives `checkout.session.completed`)
   - Consumer: `order-service`
   - Payload: `{ userId: string, email: string, amount: number, status: "success" | "failed", products: OrderProduct[] }`
5. **`order.created`**:
   - Producer: `order-service` (after persisting new order document to MongoDB)
   - Consumer: `email-service`
   - Payload: `{ email: string, amount: number, status: string }`

---

## Current Implementation Details

### 1. Customer Storefront (`apps/client`)

- **Hero Carousel & Branding**: Storefront home page features an auto-rotating hero banner (`HeroCarousel.tsx`) with custom promotional slides (`banner1.png`, `banner2.png`, `banner3.png`), quick navigation CTAs, and refreshed Ominify branding.
- **Search Bar & Mobile Search Overlay**: `SearchBar.tsx` provides debounced real-time product search with dropdown suggestions and keyboard shortcuts (`Ctrl+K`). On mobile viewports, it opens a responsive full-screen search modal with instant results and touch-friendly back/close triggers.
- **Wishlist System**: Powered by Zustand `wishlistStore.ts` combined with backend sync via `product-service` (`/wishlist`). Wishlist heart toggles on `ProductCard` and `ProductInteraction` reflect real-time active states. Customer can view saved items on `/wishlist`.
- **Account Dashboard**: `/account` route provides a personalized customer portal displaying Clerk profile information, order summary statistics, saved addresses, quick actions, and settings.
- **Category Browsing**: `/categories` route provides visual category cards (`CategoryCard.tsx`) backed by curated category metadata (`categoryData.ts`), displaying product counts and direct filter links.
- **Catalog & Detail Pages**: Connected to live `product-service` API (`/products`). Features category filter tabs, search, price sorting, empty states, and error boundary fallbacks. Product detail route fetches dynamic product information and variant selectors.
- **Cart Management**: Client-side Zustand store persisted in browser `localStorage`. Identifies cart lines by composite key `(productId, selectedSize, selectedColor)`.
- **Checkout & Payment**: Form collects shipping details, sends cart line items to `payment-service` (`/sessions/create-checkout-session`), obtains a Stripe embedded client secret, and renders Stripe Elements with an interactive `PaymentSuccessModal`.
- **Order History**: `orders/page.tsx` fetches user orders from `order-service` (`/user-orders`) passing Clerk JWT bearer tokens. Renders order status badges, product item breakdowns, selected variants, and direct product links.

### 2. Admin Dashboard (`apps/admin`)

- **Route & API Protection**: Next.js middleware verifies Clerk authentication and checks `sessionClaims.metadata.role === "admin"`. Non-admin users are automatically redirected to `/unauthorized`.
- **User Management**: Integrated with `auth-service` on port 8003. Lists Clerk users, allows user creation (which triggers welcome emails via Kafka), and permits user deletion.
- **Product & Category Management**: AddProduct and AddCategory sheets post data directly to `product-service` on port 8000. Creating a product automatically emits a `product.created` event to Kafka.
- **Orders View**: Displays real-time order data fetched from `order-service` on port 8001.

### 3. Product & Wishlist Service (`apps/product-service`)

- **Port**: `8000` (Express 5).
- **Public Endpoints**:
  - `GET /products`: Supports search, category, sort, and limit. Includes weighted search algorithms handling pluralization, hyphens, title, description, and category fields.
  - `GET /products/:id`: Retrieves individual product details.
  - `GET /categories`: Lists all catalog categories.
  - `GET /wishlist`: Fetches user's saved wishlist products (requires Clerk Auth).
  - `POST /wishlist`: Saves a product to user's wishlist (requires Clerk Auth).
  - `DELETE /wishlist/:productId`: Removes a product from user's wishlist (requires Clerk Auth).
- **Admin Endpoints**: `POST /products`, `PUT /products/:id`, `DELETE /products/:id`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id` (protected by Clerk `shouldBeAdmin` middleware).
- **Kafka Integration**: `createProduct` emits `product.created`; `deleteProduct` emits `product.deleted`.

### 4. Payment Service (`apps/payment-service`)

- **Port**: `8002` (Hono 4).
- **Stripe Checkout**: Authenticated `POST /sessions/create-checkout-session` resolves Stripe product prices and returns client secrets for Embedded Checkout.
- **Stripe Webhook**: Mounted at `POST /webhooks/stripe`. Validates signature using `STRIPE_WEBHOOK_SECRET`. On `checkout.session.completed`, retrieves session line items and metadata, then emits `payment.successful` to Kafka.
- **Automated Catalog Sync**: Kafka consumer subscribes to `product.created` and `product.deleted` from `product-service`, automatically creating/deleting Stripe Products and Prices dynamically via `stripe.products.create` and `stripe.products.del`.

### 5. Order Service (`apps/order-service`)

- **Port**: `8001` (Fastify 5).
- **Database**: MongoDB connection with Mongoose `Order` model.
- **Authenticated Endpoint**: `GET /user-orders` retrieves orders matching `request.userId`.
- **Kafka Consumer**: Subscribes to `payment.successful` events from Kafka, creates a new `Order` document in MongoDB, and emits an `order.created` event.

### 6. Auth Service (`apps/auth-service`)

- **Port**: `8003` (Express 5).
- **Admin Endpoints**: `/users` (GET all, GET by ID, POST create, DELETE by ID), protected by Clerk `shouldBeAdmin` middleware.
- **Kafka Integration**: On user creation (`POST /users`), emits `user.created` event containing username and email.

### 7. Email Service (`apps/email-service`)

- **Execution**: Event-driven background process (no HTTP port required).
- **Kafka Consumer Group**: `email-service`.
- **Subscribed Topics**:
  - `user.created`: Sends a welcome email via Nodemailer.
  - `order.created`: Sends an order confirmation email containing order total and payment status.

---

## Completed Milestones

- [x] **Event-Driven Architecture**: Integrated Apache Kafka multi-broker cluster (`packages/kafka`) with sub-second message passing across services.
- [x] **Complete Purchase Lifecycle (P0)**: Stripe checkout session -> Webhook event -> `payment.successful` Kafka event -> MongoDB Order creation -> `order.created` Kafka event -> Automated confirmation email.
- [x] **Stripe Catalog Synchronization**: Product service creation/deletion events automatically sync with Stripe Products & Prices.
- [x] **Wishlist System (P1)**: PostgreSQL database schema (`Wishlist` model), `product-service` wishlist API endpoints, client Zustand wishlist store, product heart toggles, and dedicated `/wishlist` view.
- [x] **Live Search & Fullscreen Mobile Search Overlay (P1)**: Debounced suggestion dropdown, category-aware weighted search, keyboard shortcuts (`Ctrl+K`), and full-screen mobile search modal.
- [x] **Hero Banner Carousel & Brand Refresh (P1)**: Promotional hero carousel component, responsive banner assets, updated typography (`Outfit`/`Inter`), and Ominify visual identity.
- [x] **Account Portal & Category Discovery Hub (P1)**: Dedicated `/account` dashboard view with stats/profile and `/categories` discovery page with curated category cards.
- [x] **Payment Success & Receipt Modal (P1)**: Integrated `PaymentSuccessModal` rendering confirmation feedback and order navigation triggers.
- [x] **Storefront & Admin Authorization (P1)**: Customer client and Admin dashboard fully connected to backend APIs with Clerk RBAC (`admin` role enforcement).

---

## Remaining Roadmap and Next Steps

### 1. Operations & Cloud Infrastructure (P2)
- **Image Upload & Storage**: Replace local static image references with cloud image uploads (e.g., S3 / Cloudinary) in admin forms.
- **SKU & Inventory Model**: Expand product sizes/colors from primitive string arrays into explicit SKU variants with stock level tracking.
- **Webhooks Idempotency**: Add Stripe event ID checks / deduplication in `order-service` to prevent duplicate order generation.

### 2. Operational Hardening (P3)
- **Unified Environment Configuration**: Provide comprehensive `.env.example` templates for all 7 apps/services.
- **Containerization & Deployment**: Create Dockerfiles for all microservices and Next.js frontends to allow unified `docker-compose` or Kubernetes orchestration.
- **End-to-End Testing**: Add integration tests for Kafka event handlers and Cypress/Playwright E2E tests for the purchase flow.

---

## Useful Development Commands

```bash
# Start all microservices, frontends, and Turbo tasks
pnpm dev

# Build all applications and packages
pnpm build

# Run linting across the monorepo
pnpm lint

# Check TypeScript types across all projects
pnpm check-types

# Start Kafka cluster locally (Run from packages/kafka)
cd packages/kafka && docker compose up -d

# Regenerate Prisma Client (Run from packages/product-db)
pnpm --filter @repo/product-db db:generate

# Run Prisma Database Migrations (Run from packages/product-db)
pnpm --filter @repo/product-db db:migrate
```
