# Copilot Instructions for AI Agents

## Project Overview
- **Aedis Management System** is a React + TypeScript app for managing member data, statistics, and visualizations for an organization.
- The app uses a Google Apps Script backend (see `API_URL` in `services/api.ts`) for all data operations (fetch, create, sync members).
- Main UI logic and data flow are in `App.tsx`, with forms and cards in `components/`.

## Key Files & Structure
- `App.tsx`: Main dashboard, data fetching, chart rendering, and state management.
- `components/MemberForm.tsx`: Complex form for member creation/editing, with Ecuador-specific defaults and options.
- `components/MemberCard.tsx`: Member detail display, including Google Drive file viewing.
- `services/api.ts`: All API calls (fetch, create, sync) use a single Google Apps Script endpoint. Payloads use `action` keys.
- `types.ts`: Centralized TypeScript types for members, API responses, and dashboard stats.

## Data Flow & Patterns
- All member data is fetched and synced via the Google Apps Script endpoint. No local DB.
- API requests use `fetch` with JSON payloads and custom `action` fields (e.g., `create`, `sync_all`).
- Member objects are shaped by the `Member` interface in `types.ts`.
- File uploads (e.g., ID images) are base64-encoded and sent as part of the member payload.
- Google Drive links are transformed for direct viewing in `MemberCard`.

## Developer Workflows
- **Install:** `npm install`
- **Run dev server:** `npm run dev`
- **Build:** `npm run build`
- **Preview build:** `npm run preview`
- **API key:** Set `GEMINI_API_KEY` in `.env.local` (see README).

## Project Conventions
- Use TypeScript for all logic and types.
- All API interactions go through `services/api.ts`.
- Use the enums/options in `MemberForm` for Ecuadorian provinces, commissions, etc.
- Charts use `recharts` and color constants from `App.tsx`.
- Use `lucide-react` icons for UI consistency.
- All member state is managed in the main app and passed to components as props.

## Integration Points
- Google Apps Script endpoint (see `API_URL` in `services/api.ts`).
- Google Drive for file storage and viewing (see `linkCedulaDigital` in `Member`).

## Examples
- To add a new member field, update `types.ts`, `MemberForm.tsx`, and any relevant UI in `App.tsx`.
- To add a new chart/stat, extend `DashboardStats` in `types.ts` and update chart logic in `App.tsx`.

---
For further details, see the referenced files. Ask for clarification if any workflow or pattern is unclear.
