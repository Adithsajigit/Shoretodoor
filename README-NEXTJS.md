# Kerala Fresh Fish - Wholesale Ordering System

A Next.js-based B2B wholesale fish ordering platform with server-side rendering (SSR) support.

## Features

- ✅ **Server-Side Rendering (SSR)** - Full Next.js App Router implementation
- 🎯 **Tiered Pricing System** - Volume-based discounts (Silver, Gold, Platinum, Diamond)
- 🛒 **Real-time Cart Management** - Live cart updates with tier progression
- 📦 **Packaging Options** - Thermal Box and Vacuum Pack selections
- 🔍 **Product Search & Filtering** - Easy product discovery
- 📱 **Responsive Design** - Mobile-first with desktop ledger view
- 🌐 **API Routes** - Next.js API endpoints for order processing

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19
- **Styling**: Tailwind CSS (via CDN)
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
kerala-fresh-fish-importer/
├── app/
│   ├── api/
│   │   └── order/
│   │       └── route.ts          # API endpoint for order processing
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Main page component
│   └── globals.css               # Global styles
├── components/
│   ├── CartContext.tsx           # Shopping cart state management
│   ├── CartSidebar.tsx           # Mobile cart sidebar
│   ├── CheckoutModal.tsx         # Checkout form modal
│   ├── ProductCard.tsx           # Product display card
│   └── TierProgressBar.tsx       # Pricing tier progress indicator
├── services/
│   └── orderService.ts           # Order submission service
├── constants.ts                  # Tier thresholds and constants
├── data.ts                       # Product catalog data
├── types.ts                      # TypeScript type definitions
├── next.config.js                # Next.js configuration
└── package.json
```

## SSR Implementation

This project uses Next.js App Router for full server-side rendering:

- **Server Components**: `app/layout.tsx` renders on the server
- **Client Components**: Interactive components use `'use client'` directive
- **API Routes**: `/app/api/order/route.ts` handles server-side order processing
- **Metadata**: SEO-friendly metadata configured in layout

## Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_api_key_here
```

## Migration from Vite

This project was migrated from Vite to Next.js for SSR support. Key changes:

- ✅ Replaced Vite with Next.js App Router
- ✅ Converted `App.tsx` to `app/page.tsx` with `'use client'`
- ✅ Added `app/layout.tsx` with metadata
- ✅ Updated all client components with `'use client'` directive
- ✅ Created Next.js API routes
- ✅ Removed Vite-specific files (`vite.config.ts`, `index.html`, `index.tsx`)

## Deployment

This app can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS**
- Any Node.js hosting platform

## License

Private - All rights reserved
