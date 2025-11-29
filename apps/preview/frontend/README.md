# Darevel Preview Frontend

React + Vite interface that showcases the universal file preview experience (PDF, Office docs, media, and AI insights) backed by the new `preview-service`.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.local` and set at least `VITE_GEMINI_API_KEY`. Adjust `VITE_PREVIEW_API_BASE_URL` once the backend endpoint is available.
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Notes

- Mock data lives in `services/mockData.ts` for now; wire up the REST calls once `/api/preview` endpoints are live.
- Gemini calls are proxied through `services/geminiService.ts` and expect a browser-safe API key via `import.meta.env.VITE_GEMINI_API_KEY`.
- UI primitives (toolbar, modal, AI panel, viewers) are organized under `components/` for reuse inside Drive/Docs shells later.
