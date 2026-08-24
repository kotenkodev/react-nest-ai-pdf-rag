# Web Frontend — Retro Windows 95 PDF Assistant UI

A React + Vite single-page application built with `@react95/core`, `@react95/icons`, and `@react95/clippy`, providing an interactive Windows 95 desktop environment for uploading PDF documents and chatting with AI.

---

## 🗺️ Navigation

- 🏠 **[Root Overview](../README.md)** — Full-stack Architecture, Tech Stack & Setup
- 🔌 **[Backend API README](../api/README.md)** — NestJS API, Endpoints, Guards & Database Integrations
- ⚡ **[AWS Infrastructure README](../aws/README.md)** — Serverless Step Functions Pipeline & Lambda Handlers

---

## 🎨 Features & UX Design

- **Retro Win95 Desktop**: Draggable desktop icons, TaskBar, Start menu, Clippy companion, and Win95 window modals.
- **Authentication Emulation**: Email login stored in `localStorage` via Zustand `persist`.
- **PDF Upload Control**:
  - Drag-and-drop & click file picker supporting `.pdf` files up to 10MB.
  - Enforces 1 PDF document per user restriction (requires deleting current document before uploading a new one).
  - Status badge indicators for `PROCESSING`, `READY`, and `ERROR` states.
  - Direct original PDF download support.
- **Interactive Chat Interface**:
  - Input & send button locked until document processing is `READY`.
  - Supports Enter key to send messages.
  - AI thinking indicator with animated typing dots while waiting for LLM response.
  - Markdown rendering (`react-markdown`) for AI responses with code snippets, lists, and bold text.
- **Real-Time Polling & DevTools**:
  - TanStack Query v5 status polling every 2 seconds until processing completes.
  - TanStack Query DevTools integrated for debugging query states.
  - React95 retro `<Alert>` dialog windows for error messages.

---

## 🛠 Tech Stack

- **Framework**: React 19, Vite
- **UI & Theme**: `@react95/core`, `@react95/icons`, `@react95/clippy`, TailwindCSS
- **State & Data Fetching**: `@tanstack/react-query` v5, Zustand, Axios
- **Form & Validation**: `@tanstack/react-form`, Zod
- **Markdown**: `react-markdown`

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## ⚙️ Configuration

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:3000
```
