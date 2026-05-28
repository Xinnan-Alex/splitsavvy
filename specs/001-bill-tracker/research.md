# Research: Split Bill & Payment Tracker

This document outlines the technical research and decisions for the SplitSavvy application.

## Decision Log

### 1. Technology Stack
- **Decision**: Next.js 14+ (App Router) + Supabase + Tailwind CSS + Shadcn/UI.
- **Rationale**: 
    - **Next.js App Router**: Provides excellent performance (streaming SSR), SEO, and developer experience.
    - **Supabase**: Backend-as-a-service that handles Auth and PostgreSQL database with minimal configuration. Perfect for rapid MVP development.
    - **Tailwind + Shadcn/UI**: Allows for a highly polished, "fintech feel" UI with accessible components.
- **Alternatives considered**: 
    - **Firebase**: Rejected in favor of Supabase for its relational database (PostgreSQL) and SQL-based Row Level Security (RLS).
    - **Remix**: Strong alternative, but Next.js has a larger ecosystem for Shadcn/UI and Supabase integration.

### 2. Shareable Link Generation
- **Decision**: Use `nanoid` or `short-unique-id` for bill IDs.
- **Rationale**: 
    - Standard UUIDs are long and cumbersome in URLs.
    - Short, URL-friendly IDs (e.g., `8-10` characters) are sufficient for this scale and provide a better user experience when shared via WhatsApp.
- **Implementation**: `app/bill/[shortId]/page.tsx` will be the public route.

### 3. Payment Flow (Manual Confirmation)
- **Decision**: Trust-based manual confirmation.
- **Rationale**: 
    - Real payment gateway integration (Stripe/Vipps/BankID) is out of scope for this MVP bounty.
    - "Manual confirmation" allows participants to mark as "Paid" after they've sent money via their preferred method (e.g., DuitNow, Bank Transfer).
    - The organizer dashboard will show these confirmations, and the organizer can verify them against their bank statement.

### 4. Mobile-First Design
- **Decision**: Optimized for WhatsApp Web View (320px - 450px).
- **Rationale**: 
    - Most users will open links directly from WhatsApp on their mobile phones.
    - UI must be clean, with large touch targets and minimal vertical scrolling.

### 5. Authentication Strategy
- **Decision**: Organizer Auth (Supabase Auth), No Participant Auth.
- **Rationale**: 
    - Organizers need accounts to manage multiple bills and access their dashboard securely.
    - Participants should NOT need to log in to confirm payments (frictionless UX).
    - Participant "identity" is established by selecting their name from the bill's participant list.

## Best Practices
- **Data Fetching**: Use React Server Components for fetching bill details to ensure fast initial load and SEO.
- **Mutations**: Use Server Actions for creating bills and confirming payments.
- **Security**: Implement Supabase Row Level Security (RLS) to ensure organizers can only see/edit their own bills, while participants can only view the specific bill they have a link for.
