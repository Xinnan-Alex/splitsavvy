# Quickstart: Receipt Scan Autofill

## Run locally

```bash
npm install
npm run dev
```

Open:
- `http://localhost:3000/create`

## Test the feature manually

1. Go to the create bill page.
2. Choose the “Scan receipt” action.
3. Allow camera access when prompted (or select a photo from the gallery).
4. Confirm the Title and Total Amount fields are prefilled with suggested values.
5. Edit any suggested values as needed, then create the bill as usual.

## Expected behavior

- If recognition fails, the UI explains the failure and manual entry still works without extra steps.
- Retaking a photo replaces the previous suggestions.
- Receipt photos are not stored as part of the created bill.
