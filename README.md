# Rapid Relay - Relay as a Service Platform

A modern, full-stack web application for Rapid Relay - providing Relay as a Service for Modern Trucking with integrated CMS, backend infrastructure, and automated newsletter system.

## Features

### Frontend & UI
- **Modern Tech Stack**: Built with Next.js 16, React 19, TypeScript, and TailwindCSS
- **Smooth Animations**: Powered by Framer Motion for engaging user experience
- **Responsive Design**: Fully responsive across all devices
- **Futuristic Design**: Dark theme with glassmorphism, gradients, and animated elements
- **Performance Optimized**: Fast loading, smooth scrolling, image optimization (AVIF/WebP)
- **SEO Optimized**: 100+ targeted keywords, structured data (JSON-LD), Open Graph, Twitter Cards
- **PWA Ready**: Progressive Web App with manifest.json and service worker support
- **Security Headers**: X-Frame-Options, CSP, and other security best practices

### Backend & Infrastructure
- **PostgreSQL Database**: Supabase-hosted with connection pooling via Prisma PG Adapter
- **Prisma ORM**: Type-safe database access with migrations
- **Email System**: Resend integration for transactional emails
- **Rate Limiting**: IP-based rate limiting for API endpoints
- **Bot Protection**: Honeypot fields for spam prevention

### Content Management (Sanity CMS)
- **Blog System**: Full-featured blog with categories, authors, and rich text content
- **Sanity Studio**: Deployed at `https://rapid-relay.sanity.studio`
- **Read-Only Data Sync**: Contact submissions and newsletter subscribers automatically synced from PostgreSQL to Sanity
- **Custom Actions**: "Send Newsletter" button in Studio to email all subscribers
- **SEO Fields**: Comprehensive SEO metadata for all blog posts

### Email & Newsletter
- **Contact Form**: Validated contact submissions with admin email notifications
- **Newsletter Subscriptions**: Email collection with duplicate prevention
- **Automated Newsletters**: Send blog post updates to all subscribers with one click
- **Batch Email Processing**: Efficient batch sending (100 emails/batch) with rate limiting
- **Unsubscribe System**: One-click unsubscribe with branded confirmation page
- **Beautiful HTML Templates**: Responsive email templates with branded styling

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase account)
- Sanity account
- Resend account for email sending

### Environment Setup

Create a `.env` file in the root directory:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_WRITE_TOKEN=sk_your_write_token
NEWSLETTER_API_KEY=your_random_api_key

# Supabase Database
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Resend Email Configuration
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

### Install Dependencies

```bash
npm install
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy Sanity Studio

```bash
# Login to Sanity CLI
npx sanity login

# Deploy Studio
npx sanity deploy
```

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
rapid-relay-v2/
├── app/
│   ├── about/
│   │   └── page.tsx                # About page
│   ├── blog/
│   │   ├── page.tsx                # Blog listing page
│   │   └── [slug]/page.tsx         # Individual blog post
│   ├── api/
│   │   ├── contact/route.ts        # Contact form submission
│   │   ├── newsletter/
│   │   │   ├── route.ts            # Newsletter subscription
│   │   │   ├── send/route.ts       # Send newsletter to subscribers
│   │   │   ├── check/route.ts      # Check if newsletter sent
│   │   │   └── unsubscribe/route.ts # Unsubscribe endpoint
│   ├── privacy-policy/page.tsx     # Privacy policy
│   ├── terms-and-conditions/page.tsx # Terms of service
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout with SEO
│   ├── page.tsx                    # Main landing page
│   └── sitemap.ts                  # Dynamic sitemap
├── components/
│   ├── Hero.tsx                    # Hero section
│   ├── WhatWeDo.tsx                # What We Do with relay toggle
│   ├── Benefits.tsx                # Benefits section
│   ├── HowItWorks.tsx              # How It Works interactive
│   ├── PlatformDemo.tsx            # Platform features
│   ├── WhoWeServe.tsx              # Target audience
│   ├── Differentiators.tsx         # Differentiators (about)
│   ├── Integrations.tsx            # System integrations
│   ├── CTA.tsx                     # Contact form with validation
│   ├── Blog/
│   │   └── NewsLetterComponent.tsx # Newsletter signup
│   ├── Navigation.tsx              # Header navigation
│   ├── Footer.tsx                  # Footer with links
│   ├── BackToTop.tsx               # Scroll to top button
│   └── ScrollProgress.tsx          # Page scroll indicator
├── lib/
│   ├── prisma.ts                   # Prisma client setup
│   ├── email.ts                    # Email templates & sending
│   ├── rateLimit.ts                # Rate limiting utility
│   ├── sanity-queries.ts           # Sanity GROQ queries
│   ├── sanity-write-client.ts      # Sanity write operations
│   └── hooks/
│       ├── useApiRequest.ts        # API request handler
│       └── useHoneypot.ts          # Bot detection hook
├── prisma/
│   └── schema.prisma               # Database schema
├── sanity/
│   ├── schemas/
│   │   ├── post.ts                 # Blog post schema
│   │   ├── author.ts               # Author schema
│   │   ├── category.ts             # Category schema
│   │   ├── contact.ts              # Contact submission (read-only)
│   │   ├── newsletter.ts           # Newsletter subscriber (read-only)
│   │   └── index.ts                # Schema exports
│   ├── actions/
│   │   └── sendNewsletterAction.ts # Custom "Send Newsletter" action
│   ├── client.ts                   # Sanity read client
│   ├── env.ts                      # Environment helpers
│   └── structure.ts                # Studio structure
├── sanity.config.ts                # Sanity Studio config
└── public/
    ├── robots.txt                  # SEO crawler directives
    ├── manifest.json               # PWA manifest
    └── *.svg, *.png                # Static assets
```

## Database Schema

### PostgreSQL Models (via Prisma)

**Contact** - Contact form submissions
- id, name, email, company, fleetSize, message, createdAt

**Newsletter** - Newsletter subscribers
- id, email (unique), createdAt

**NewsletterSend** - Newsletter send tracking
- id, postSlug (unique), postId, postTitle, recipientCount, failedCount, status, errorMessage, sentAt, updatedAt

**SanitySync** - Sync status tracking
- id, entityType, entityId, sanityId, status, attempts, lastError, createdAt, updatedAt

### Sanity Schemas

**Post** - Blog posts with SEO fields
**Author** - Post authors
**Category** - Post categories
**Contact** - Read-only mirror of contact submissions
**NewsletterSubscriber** - Read-only mirror of newsletter subscribers

## API Endpoints

### Public Endpoints

- `POST /api/contact` - Submit contact form
  - Rate limit: 3 requests/minute
  - Honeypot protection
  - Email validation & spam domain blocking
  - Admin email notification

- `POST /api/newsletter` - Subscribe to newsletter
  - Rate limit: 5 requests/minute
  - Duplicate email prevention
  - Admin notification

- `GET /api/newsletter/unsubscribe?email={email}` - Unsubscribe from newsletter
  - Returns branded HTML confirmation page

### Protected Endpoints (API Key Required)

- `POST /api/newsletter/send` - Send newsletter to all subscribers
  - Requires `x-api-key` header with `NEWSLETTER_API_KEY`
  - Batch processing (100 emails/batch)
  - Duplicate send prevention
  - Status tracking in database

- `GET /api/newsletter/check?slug={slug}` - Check if newsletter sent for post
  - Returns send status and recipient count

## Email System

### Templates

1. **Contact Notification** - Admin receives new contact form submissions
2. **Newsletter Subscription** - Admin receives new subscriber notifications
3. **Blog Newsletter** - Subscribers receive new blog post updates
   - Includes: title, excerpt, featured image, read time, categories
   - Branded with purple gradient header
   - Unsubscribe link in footer

### Sending Strategy

- **Contact/Newsletter**: Immediate single emails via Resend
- **Blog Newsletters**: Batch sending (25 per batch) with 1-second delays
- **Rate Limiting**: Respects Resend's 2 requests/second limit

## Sanity Studio Features

### Custom Document Actions

**Blog Posts:**
- "Send Newsletter" button appears on published posts
- Checks if already sent to prevent duplicates
- Confirmation dialog before sending
- Shows success/failure status with recipient counts

**Contact/Newsletter (Read-Only):**
- Only "Delete" action available
- No Create, Edit, Publish, or Duplicate actions
- No "Published" badge shown
- View-only access to synced data

### Data Sync Flow

```
User submits form → PostgreSQL (primary) → Async → Sanity (read-only mirror)
                         ↓
                  Email notification sent
```

## Security Features

- **Rate Limiting**: IP-based rate limiting on all form endpoints
- **Honeypot Protection**: Hidden fields detect bot submissions
- **Email Validation**: RFC 5322 compliance + disposable domain blocking
- **API Authentication**: Newsletter send endpoint protected with API key
- **CORS Security**: Proper headers and origin validation
- **Input Sanitization**: All inputs trimmed and validated with Zod schemas

## SEO Configuration

### Metadata (`app/layout.tsx`)
- 100+ targeted keywords organized by category
- Open Graph tags for social media
- Twitter Card metadata
- Canonical URLs and robots directives

### Structured Data (`app/page.tsx`)
- Organization schema with social profiles
- WebSite and WebPage schemas
- Service schema with offerings

### Technical SEO
- Dynamic sitemap (`app/sitemap.ts`)
- robots.txt configuration
- PWA manifest for mobile
- Security headers in `next.config.ts`

### Section IDs for Anchor Linking
- `#benefits` - Benefits section
- `#what-we-do` - What We Do section
- `#how-it-works` - How It Works section
- `#integrations` - Integrations section
- `#demo` - Contact/Demo form

## Deployment

### Next.js Application

**Vercel (Recommended):**
```bash
git push  # Auto-deploys from main branch
```

**Manual Build:**
```bash
npm run build
```

### Sanity Studio

**Deploy to Sanity's hosting:**
```bash
npx sanity deploy
```

**When to redeploy Studio:**
- ✅ Schema changes (contact.ts, newsletter.ts, etc.)
- ✅ Config updates (sanity.config.ts)
- ✅ Action modifications (sendNewsletterAction.ts)
- ❌ Not needed for Next.js app changes

**Important:** Studio deploys separately to `https://your-hostname.sanity.studio`, not to your Next.js hosting.

### Environment Variables for Production

Add all variables from `.env` to your hosting provider (Vercel, Netlify, etc.):
- All `NEXT_PUBLIC_*` variables
- `DATABASE_URL`
- `SANITY_API_WRITE_TOKEN`
- `NEWSLETTER_API_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `ADMIN_EMAIL`

## npm Scripts

```json
{
  "dev": "next dev --webpack",           // Run development server
  "build": "prisma generate && next build", // Build for production
  "start": "next start",                 // Start production server
  "lint": "next lint"                    // Run linter
}
```

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Language**: TypeScript

### Backend
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma with PG Adapter
- **Email**: Resend
- **API**: Next.js API Routes

### CMS
- **Headless CMS**: Sanity
- **Studio**: Deployed separately at Sanity
- **Queries**: GROQ

### Development
- **Type Safety**: TypeScript + Zod validation
- **Code Quality**: ESLint
- **Version Control**: Git

## Testing

### Contact Form
1. Submit form on homepage
2. Check PostgreSQL for record
3. Check email for admin notification
4. Check Sanity Studio "Contact Submissions"

### Newsletter Subscription
1. Subscribe on blog page
2. Check PostgreSQL for subscriber
3. Check Sanity Studio "Newsletter Subscribers"
4. Click unsubscribe link → Verify removal

### Newsletter Automation
1. Create/publish blog post in Sanity Studio
2. Click "Send Newsletter" button
3. Check confirmation dialog
4. Verify emails sent to subscribers
5. Check database `newsletter_sends` table

## Troubleshooting

### TypeScript Errors for `prisma.sanitySync`
Restart TypeScript server in VSCode:
```
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Sanity Studio Not Loading
Ensure environment variables are accessible

### Email Not Sending
1. Verify `RESEND_API_KEY` in environment
2. Check `EMAIL_FROM` is verified in Resend dashboard
3. Review logs for error messages

### Newsletter Send Fails
1. Check `NEWSLETTER_API_KEY` matches in:
   - `.env` file
   - Sanity Studio environment (`SANITY_STUDIO_NEWSLETTER_API_KEY`)
2. Verify API endpoint authentication

## Design Inspiration

- Class8.com - Scroll animations and enterprise polish
- Modern SaaS landing pages - Clean, conversion-focused design
- Futuristic UI trends - Glassmorphism, gradients, and smooth animations

## License

Copyright © 2025 Rapid Relay. All rights reserved.

---

## Recent Updates

### January 2026
- ✅ Implemented Sanity CMS with blog system
- ✅ Added PostgreSQL backend with Prisma
- ✅ Integrated Resend email notifications
- ✅ Built contact form with validation
- ✅ Created newsletter subscription system
- ✅ Implemented Sanity sync (PostgreSQL → Sanity read-only)
- ✅ Added automated newsletter emails
- ✅ Deployed Sanity Studio to `https://rapidrelay.sanity.studio`
- ✅ Added batch email processing with rate limiting
- ✅ Implemented unsubscribe functionality
