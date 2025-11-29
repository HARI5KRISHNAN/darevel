# Darevel Admin Frontend

React 19 + Vite implementation of the Darevel admin console experience used to manage organizations, users, teams, and security settings.

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment in `.env.local` (at minimum set `VITE_GEMINI_API_KEY`). Optional admin API vars are already stubbed.
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Notes

- The mock services live in `services/mockApi.ts` for now; replace them with real API calls when the admin backend is ready.
- AI-assisted insights call Gemini via `services/geminiService.ts`, which reads `import.meta.env.VITE_GEMINI_API_KEY`.
- UI primitives (buttons, cards, modals, badges, inputs) are centralized in `components/ui/UIComponents.tsx` for easy reuse.
