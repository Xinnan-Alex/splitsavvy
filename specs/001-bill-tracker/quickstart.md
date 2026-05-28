# Quickstart: Split Bill & Payment Tracker

Follow these steps to set up the development environment and start building the SplitSavvy application.

## Prerequisites
- Node.js 20+ and npm/pnpm
- Supabase CLI (optional, for local development)
- A Supabase account and project

## 1. Project Initialization
```bash
npx create-next-app@latest . --typescript --tailwind --eslint
# Select "Yes" for App Router, "No" for src/ directory (or as per project structure decision)
```

## 2. Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr lucide-react nanoid clsx tailwind-merge
npm install -D vitest @testing-library/react @vitejs/plugin-react jsdom playwright
```

## 3. Environment Setup
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 4. Supabase Schema Setup
Run the SQL found in `specs/001-bill-tracker/data-model.md` in your Supabase SQL Editor to create the necessary tables and RLS policies.

## 5. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## 6. Testing
```bash
# Run unit tests
npm run test

# Run E2E tests
npx playwright test
```

## Feature Entry Points
- **Bill Creation**: `/create`
- **Organizer Dashboard**: `/dashboard`
- **Participant Bill View**: `/bill/[shortId]`
