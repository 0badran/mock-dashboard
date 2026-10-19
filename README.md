# Event Management Dashboard

A modern, responsive event management and RSVP operations dashboard built with React 19, TypeScript, Vite, Tailwind CSS v4, and shadcn UI. The platform supports bilingual localization (Arabic RTL and English LTR), theme customization (Light and Dark modes), and modular administrative workflows.

## Features

- Overview Analytics: KPI statistics, interactive charts, recent event requests, attendance rates, and quick action shortcuts.
- Event Requests: Review, approve, reject, filter, and track incoming event booking requests.
- Events Management: Comprehensive schedule of upcoming and past events, venue details, and capacity tracking.
- Guests and Attendees: Guest lists, RSVP status tracking, companion counts, attendance status, and check-in confirmation.
- Check-in Scanner: Quick attendee verification and check-in processing.
- Invitation Templates: Interactive template gallery with live previews, category filtering, and status controls.
- Broadcasts and Announcements: Scheduled announcements, multi-channel broadcast records, and delivery logs.
- Memory Gallery: Photo and video memories album from past events with category tags and interactive lightbox.
- Venue and Halls Directory: Hall capacity, amenities, location maps, and rental pricing details.
- Clients Directory: Customer profiles, active bookings count, contact channels, and account history.
- Administrative Team: Role-based permissions, assistant accounts, and administrative access control.
- Reference Lookups: Categorized reference datasets (event types, cities, attendance statuses, tags) with inline editing.
- Bilingual and RTL Support: Native Arabic (RTL) and English (LTR) support powered by i18next and custom typography (Almarai and Inter).
- Reusable UI Components: Unified shadcn alert dialogs, custom form inputs, responsive modals, and dynamic data tables.

## Tech Stack

- Framework: React 19
- Language: TypeScript
- Build Tool: Vite
- Styling: Tailwind CSS v4, tw-animate-css
- Component Library: shadcn UI, Radix UI primitives
- Animations: Framer Motion
- Icons: Lucide React
- Routing: React Router v7
- Charts: Recharts
- State and Mock Storage: React Query, Browser LocalStorage with reactive subscription hooks
- Internationalization: i18next, react-i18next
- Notifications: Sonner toast library

## Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm, pnpm, or yarn

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd mock-dashboard
npm install
```

### Development

Start the local development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser to view the application.

### Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Linting

Run code linting:

```bash
npm run lint
```

## Project Structure

```text
mock-dashboard/
├── public/                 # Static assets and favicon
├── src/
│   ├── components/         # Shared and modular UI components
│   │   ├── layout/         # Header, Sidebar, Banner, and DashboardLayout
│   │   ├── shared/         # Reusable components (e.g., ConfirmDialog)
│   │   └── ui/             # shadcn UI primitives (button, dialog, alert-dialog, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── locales/            # Translation dictionary files (ar.json, en.json)
│   ├── pages/              # Route view pages
│   ├── services/           # Mock data models, storage, and persistence layer
│   ├── App.tsx             # Main application component and routing configuration
│   ├── index.css           # Global Tailwind CSS definitions and theme tokens
│   └── main.tsx            # Application entry point
├── package.json            # Project dependencies and npm scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## License

This project is proprietary and intended for event management operations.
