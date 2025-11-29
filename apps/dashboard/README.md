<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Darevel Dashboard (Frontend)

Personal / team / org dashboards that power the Darevel landing experience. This Vite + React application now lives inside the monorepo (`apps/dashboard`) so it can share workspace tooling, linting, and deployment scripts.

## Getting Started

```bash
# from repo root
npm install            # once, installs all workspace deps
npm run dev --workspace darevel-dashboard
```

The dev server listens on **http://localhost:3007** by default. You can override the port via `DASHBOARD_FRONTEND_PORT` inside `.env.local`.

## Environment Variables

| Name | Purpose | Default |
|------|---------|---------|
| `VITE_DASHBOARD_API_BASE_URL` | Base URL for the dashboard-service backend (Phase B). | `http://localhost:9410/api/dashboard` |
| `DASHBOARD_FRONTEND_PORT` | Local dev server port | `3007` |

When the backend is unavailable, the app automatically falls back to local mock data so designers can keep iterating on widgets.

## Folder Highlights

- `components/` – shared layout primitives, cards, and widget building blocks
- `modules/dashboard/pages/` – view-specific compositions for personal/team/org dashboards
- `services/dashboardService.ts` – thin API client with graceful fallback to mocks

## Next Steps

- Wire the frontend to the upcoming `dashboard-service` microservice.
- Add drag-and-drop widget layout persistence using the `/api/dashboard/user/config` endpoints once they land.
- Surface role-based routing inside the Suite shell so `/dashboard`, `/dashboard/team/:id`, and `/dashboard/org` launch the appropriate view.
