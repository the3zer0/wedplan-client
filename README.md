# WedPlan Client

WedPlan is a wedding planning marketplace where couples can discover wedding services, send booking requests, and manage their celebration planning. Vendors can publish services, manage requests, and upgrade their subscription, while administrators moderate the marketplace.

## Features

- Wedding-themed responsive public homepage and service discovery
- Search, filtering, sorting, and pagination for services
- Protected service details and booking requests
- Better Auth cookie sessions with JWT-backed API requests
- Google and email authentication
- Role-based vendor, customer, and admin dashboards
- Vendor service, booking, profile, and subscription management
- Customer booking tracking and cancellation
- Admin user, service moderation, and transaction views
- Stripe payment confirmation and subscription verification flow
- ImgBB image upload support through the server API
- Accessible loading, empty, error, and toast feedback states

## Tech stack

- Next.js App Router
- React
- Tailwind CSS
- ShadCN UI / Base UI
- Better Auth
- React Hook Form and Zod
- Framer Motion
- Sonner
- Lucide React

## Installation

```bash
npm install
```

Copy the example environment file and configure the client:

```bash
cp .env.example .env.local
```

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

## Run locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Quality checks:

```bash
npm run lint
npm run build
```

## Links

- Live site: <PASTE_LIVE_CLIENT_URL>
- Client repository: https://github.com/the3zer0/wedplan-client
- Server repository: https://github.com/the3zer0/wedplan-server

## Environment variables

The client reads these variables:

- `NEXT_PUBLIC_SERVER_URL`
- `NEXT_PUBLIC_APP_URL`

## Required application URLs

Configure these URLs in the server, Better Auth provider, Google OAuth application, Stripe checkout settings, and deployment platform as appropriate:

- Client application: `http://localhost:3000`
- API server: `http://localhost:5000`
- Sign-in page: `http://localhost:3000/signin`
- OAuth callback base: `http://localhost:3000`
- Stripe success URL: `http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}`
- Stripe cancel URL: `http://localhost:3000/payment/cancel`

For production, replace the localhost values with the deployed client and API URLs.