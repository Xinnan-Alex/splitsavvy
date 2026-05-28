# Research: Receipt Scan Autofill

## Decisions

### 1) How users capture an image

**Decision**: Use a file picker that can invoke the device camera (where supported) and accept photos from the gallery.

**Rationale**:
- Works across mobile browsers without building a full camera UI.
- Keeps the flow simple (capture → recognize → prefill) and easy to retry.
- Avoids complex permission and streaming video handling for an MVP.

**Alternatives considered**:
- Building a live camera preview with a custom capture UI.
- Requiring users to upload only from the photo gallery.

### 2) Where recognition runs (privacy + cost)

**Decision**: Run text recognition on the user’s device for the MVP.

**Rationale**:
- Avoids uploading receipt photos to a server, aligning with privacy expectations.
- Avoids operational costs and secret management for third-party OCR services.
- Keeps the “scan to prefill” feature usable even when users prefer not to share images.

**Alternatives considered**:
- Server-side recognition (more accurate for some receipts but introduces secrets, cost, and privacy considerations).
- A hybrid approach (client-first, server fallback) which adds complexity.

### 3) What gets extracted and how suggestions are formed

**Decision**: Extract and suggest only the minimum fields that unlock the biggest speed-up: Title and Total Amount.

**Rationale**:
- Title and Total Amount are the highest-friction fields and are present on most receipts.
- Participant names and split shares vary widely and are not reliably extractable from receipts.
- Minimizes incorrect autofill while still saving meaningful time.

**Alternatives considered**:
- Attempting to infer participants and shares from item lines (high error risk, increases user correction burden).

### 4) Total amount detection strategy

**Decision**: Use a best-effort heuristic to suggest Total Amount, designed for easy correction.

**Rationale**:
- Receipts use inconsistent formats; a single strict rule will fail often.
- A heuristic approach can provide good suggestions for common cases while never blocking manual entry.

**Heuristic outline (non-exhaustive)**:
- Prefer amounts near keywords like “TOTAL”, “GRAND TOTAL”, “AMOUNT DUE”.
- If multiple totals exist, prefer the most likely grand total.
- If no keyword match is found, fall back to the largest plausible amount on the receipt.

**Alternatives considered**:
- Requiring a user to highlight/select the total region (more effort than intended for MVP).

## Non-Goals (MVP)

- Storing receipt images or extracted raw text as part of a bill record.
- Guaranteeing perfect recognition for blurry, low-light, handwritten, or heavily stylized receipts.
- Automatically splitting by items or inferring participant shares.
