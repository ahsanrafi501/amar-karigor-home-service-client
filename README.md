# Amar Karigor frontend

A responsive home-services marketplace built against the separately hosted Amar Karigor Express/Prisma API. The interface uses warm ivory, forest green and lime, with accessible forms and honest loading, empty and error states.

## Stack

The requested dependency ranges are retained in `package.json`: Next.js **15.5.29**, React/React DOM **19.1.0**, TypeScript, Tailwind CSS 4, TanStack Query 5, Axios, React Hook Form, Zod/resolvers, date-fns, Lucide, Sonner, clsx, and tailwind-merge. The Google OAuth SDK/provider is installed but **Google sign-in is not enabled** because the backend has no OAuth exchange endpoint. Radix Slot and class-variance-authority support the shadcn-style primitives.

The official local **shadcn MCP server** was used to inspect button/card/input/badge/textarea/label registry items, retrieve usage examples, and run its audit checklist. Shared components live in `components/ui/` and are adapted to the marketplace design tokens in `app/globals.css`. `components.json` configures the New York style and aliases.

## Run locally

Use Node.js 22 or newer. Install the frontend dependencies from this directory:

```sh
npm ci
```

Run the [backend repository](https://github.com/ahsanrafi501/amar-karigor-home-services-server) separately using its database environment. It needs to listen on port 8000 for the default frontend configuration:

```sh
PORT=8000 npm run dev
```

In this frontend directory, set `BACKEND_API_URL` in `.env.local` if the backend URL differs. Include the `/api` suffix:

```env
BACKEND_API_URL=http://localhost:8000/api
```

The existing `NEXT_PUBLIC_API_URL` setting remains a compatibility fallback. No backend credentials or JWT signing secrets are needed in this client. Do not replace an existing `.env.local` blindly; `.env.example` documents the supported settings.

```sh
npm run dev
```

Open http://localhost:3000. For production builds use `npm run build`, then `npm start`.

## Implemented screens

| Area | Routes and behavior |
| --- | --- |
| Public | Home, searchable service offers, technician directory/detail, about/how it works, contact, 404 and error recovery. |
| Account | Registration, sign-in, session restoration/refresh, role-aware navigation and local sign-out. Selected booking offers survive a sign-in redirect. |
| Customer | Dashboard, own booking list/detail, filters, scheduling against an offer ID, completed-booking payment initiation and reviews. |
| Payment return | `/bookings/payment-result` verifies the owner’s saved payment and displays a receipt; paid bookings show a disabled **Paid** button. |
| Technician | Application/status, private profile/availability editing, offered services and assigned bookings with forward job transitions. |
| Admin | Overview, private application review/approval, all bookings, category/master-service creation and known-account status controls. |

Forms use React Hook Form and Zod. Queries use TanStack Query with account-scoped workspace keys; successful mutations invalidate affected reads. Backend response nesting is represented by `types/index.ts` and endpoint-specific adapters.

## API and session boundary

Browser requests use Axios against the same-origin `/api/backend/*` route. The server calls the configured Express API and stores access/refresh tokens in HttpOnly, same-site cookies. Tokens are removed from response JSON and never stored in localStorage. Production cookies are secure; state-changing requests have an origin check.

The proxy checks the current account's database role, allowlists route/method combinations and validates mutation bodies. It filters password/token/stack fields and removes technician NID/private addresses from public discovery **and customer booking responses**. Private own-profile and admin application reads remain protected:

- `/api/backend/technician/me` derives the profile matching the authenticated User ID.
- `/api/backend/admin/technicians` exposes the application list only to an ADMIN.

These are frontend aggregation routes over existing backend APIs, not new Express endpoints. They do not resolve the underlying backend's independent authorization/privacy issues; backend fixes must be maintained in the separate API repository.

## Backend constraints reflected in the UI

- A booking uses `TechnicianService.id` (a priced offer), not `Service.id`. The supported lifecycle is `PENDING → CONFIRMED → IN_PROGRESS → COMPLETED`, with cancellation from pending/confirmed. The proxy enforces forward transitions.
- Customer cancellation, profile/password editing, offer editing/deletion, uploads, chat, notifications and analytics have no supported flow yet.
- The complete master-service catalog and user list have no endpoints. Administrators and professionals can use known IDs for the existing creation/status operations; the UI does not fabricate missing records.
- Technician rejection is disabled because its backend implementation updates the wrong model. Approval uses the technician **profile** ID.
- Availability is free text. The scheduling form requests a time; it does not claim to display conflict-checked slots. Booking dates are submitted as ISO timestamps; workspace display uses Asia/Dhaka, while time inputs explicitly use the device's local timezone.
- The booking model has no customer service-address/contact fields or agreed-price snapshot. The UI shows the listed price and does not pretend to save unsupported fields.
- Checkout is gated to the authenticated customer's completed booking and a price of at least BDT 10. The backend currently targets SSLCommerz sandbox. Gateway callback validation/replay binding still needs backend hardening.
- Gateway callbacks redirect with HTTP 303 to `/bookings/payment-result` after processing. Configure `FRONTEND_URL` on the **backend** (default `http://localhost:3000`) and `BACKEND_URL` for gateway callbacks (fallback `APP_URL`, then `http://localhost:8000`). Keep the frontend hostname consistent with the one used to sign in so its session cookies are available on return.
- Owner booking reads include saved payment metadata. The return page verifies this record, refreshes booking caches, and shows the receipt and **Paid** button only when a payment exists. A `status=success` query parameter alone cannot mark a booking paid. Pending confirmation has bounded polling and a manual retry. Existing paid bookings are recognized after reload and repeat checkout is blocked.
- Booking reads still omit review metadata, so an already submitted review may only be identified by the backend's duplicate-review error after reload.
- Local sign-out clears this device's frontend cookies. The backend has no token revocation/logout endpoint, so it does not revoke previously issued JWTs elsewhere.

## Checks and verification

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

This repository contains frontend-only regression tests. Backend callback/database tests remain in the backend workspace and are not required to run this repository. The Vitest suite covers route allowlists, current-role authorization, private profile isolation/redaction, public/customer booking privacy, HttpOnly cookie handling, refresh, CSRF origin rejection, payment ownership/eligibility, booking transitions, date/review constraints, redirect validation and session races/account-switch failures. Tests mock upstream calls and do not mutate the real database.

Read-only HTTP checks verified all 23 page URLs, expected 404 behavior, local image delivery and anonymous API rejection. Live proxy → Express → PostgreSQL checks verified service offers, categories, technician lists/detail and filtering, with no private field leaks in checked responses. Browser visual/interaction verification could not run because the browser-control host was unavailable. No real accounts, bookings, reviews, status updates or payments were created by verification.

The senior engineer assigned the junior's workspaces, independently reviewed them, requested corrections, then reviewed the integration and approved the source after the fixes and regression tests.

## Image credit

Decorative home-repair photo by [Charles Deluvio on Unsplash](https://unsplash.com/photos/person-holding-yellow-and-black-cordless-hand-drill-6fA1ldyxSbw), stored locally in `public/images/home-repair.jpg`. It illustrates the service category and does not represent a listed professional.
