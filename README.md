# LearnCraft2

LearnCraft2 is an interactive learning platform for building and practicing code with AI-powered guidance.

The app combines a React + Vite frontend with an Express-based backend and Firebase integration to deliver:

- course selection and enrollment
- learning content with progress tracking
- user authentication and profile management
- an interactive compiler / playground view
- an AI chatbot for coding assistance and questions

## Features

- **Dynamic course workspace**: Select an active course and continue where you left off
- **AI support**: Chat with a built-in AI assistant while learning
- **Project & progress dashboards**: Track your learning status and manage hands-on projects
- **Firebase-backed persistence**: Stores user state, courses, and progress securely
- **Local development ready**: Includes both frontend and backend entry points

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- Git installed

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open the local development URL shown in the terminal to access the app.

### Build for production

```bash
npm run build
npm start
```

## Configuration

The repository includes Firebase config and service account files. For local development, ensure your environment variables are set in `.env.local` or your own config file. Typical values include Firebase credentials and any backend secrets.

If your project requires third-party API keys, add them to `.env.local` and do not commit secrets to version control.

## Project structure

- `src/` — React frontend application
- `server.ts` — backend server entry point
- `src/components/` — reusable UI and learning workflow components
- `src/api.ts` — API client helpers for the frontend
- `package.json` — project scripts and dependencies

## Notes

This README is intended to describe the app, its core flows, and how to run it locally. For deeper configuration details, review `server.ts`, `src/api.ts`, and the existing Firebase config files.
