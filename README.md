# SplitSavvy

SplitSavvy is a web app for creating a bill, splitting it across participants, and tracking who has paid.

**Key flows**
- Create a bill (with optional receipt scan autofill): `/create`
- Organizer dashboard: `/dashboard`
- Participant bill view: `/bill/[shortId]`

## Tech Stack

- Next.js, React, TypeScript
- Supabase (Auth + Postgres)
- Tailwind + shadcn/ui components
- Receipt OCR: `tesseract.js` (runs in the browser; receipt photos are not persisted)

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env.local` file (gitignored) with:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Optional dev/testing flags:

```env
# Uses in-memory stores instead of Supabase (used by Playwright config)
E2E_STUB=1
NEXT_PUBLIC_E2E_STUB=1

# Uses a deterministic OCR stub instead of running Tesseract
OCR_STUB=1
NEXT_PUBLIC_OCR_STUB=1
```

### 3) (Optional) Run Supabase locally

If you have the Supabase CLI installed, you can run a local Supabase stack:

```bash
npm run supabase:start
supabase db reset
```

Use the Supabase CLI output values for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

### 4) Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

- Unit tests:

```bash
npm test
```

- E2E tests (starts a dev server on port 3100 with stubs enabled):

```bash
npm run test:e2e
```

## Receipt Scan (OCR)

- Entry point: bill creation page (`/create`)
- Output: suggests a Title and Total Amount; the form remains fully editable
- Privacy: receipt images are not retained as part of a bill

To force OCR stub mode locally:

```bash
NEXT_PUBLIC_OCR_STUB=1 npm run dev
```
