# SUKA Car Wash - Next.js Dashboard

Modern dashboard for Admin and Car Wash operators built with Next.js 14.

## Features

- ✅ Admin Dashboard
- ✅ Car Wash Dashboard
- ✅ Real-time statistics
- ✅ Booking management
- ✅ Service management
- ✅ Reports and analytics

## Setup

### Installation

```bash
cd dashboard-nextjs
npm install
```

### Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── admin/       # Admin dashboard
│   ├── carwash/     # Car wash dashboard
│   └── login/       # Login page
├── components/       # React components
├── lib/             # Utilities
└── types/           # TypeScript types
```

## Building

```bash
npm run build
npm start
```
