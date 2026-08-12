# LevelUp — Gamified Learning Platform 🚀

**LevelUp** is an interactive, gamified learning application designed to help users master new topics through micro-lessons, quizzes, XP rewards, streaks, and badges.

---

## 🛠️ Tech Stack

- **Frontend**: React 18/19 + Vite + TypeScript + Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Routing**: React Router DOM (`v6`/`v7`)
- **Icons**: Lucide React (`lucide-react`)
- **Backend**: Node.js + Express (TypeScript proxy server for secure LLM API calls)

---

## 📁 Project Structure

```text
LevelUp/
├── client/                   # React + Vite Frontend
│   ├── src/
│   │   ├── components/       # UI Components (Navbar, Layout, etc.)
│   │   ├── pages/            # Page Views (Home, Lesson, Quiz, Dashboard, Leaderboard)
│   │   ├── store/            # Zustand global state stores (useGameStore)
│   │   ├── lib/              # API helpers and utilities
│   │   ├── types/            # TypeScript domain interfaces
│   │   ├── App.tsx           # Router and main view renderer
│   │   ├── index.css         # Tailwind directives & custom game design system
│   │   └── main.tsx          # Client entry point
│   ├── .env.example
│   ├── index.html
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                   # Express Backend Proxy
│   ├── routes/               # Express API routes
│   │   └── lessonRoutes.ts
│   ├── services/             # Lesson processing & mock services
│   │   └── lessonService.ts
│   ├── src/                  # Express app entry point
│   │   └── index.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── package.json              # Root workspace package.json
└── README.md                 # Project Documentation
```

---

## ⚡ Quick Start

### 1. Installation

Install dependencies for root, client, and server:

```bash
# Install root, client, and server dependencies in one command
npm run install:all
```

Alternatively, install individually:

```bash
# Server dependencies
cd server && npm install

# Client dependencies
cd ../client && npm install
```

---

### 2. Environment Configuration

Copy the example environment files:

```bash
# Server env
cp server/.env.example server/.env

# Client env
cp client/.env.example client/.env
```

**Environment Variables:**
- `server/.env`:
  - `PORT=3001`
  - `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` (for upcoming LLM integrations)
- `client/.env`:
  - `VITE_API_URL=http://localhost:3001`

---

### 3. Running the Application

#### Option A: Concurrently (Recommended)
From the project root:

```bash
npm run dev
```

This starts both:
- **Express Backend**: [http://localhost:3001](http://localhost:3001)
- **Vite Frontend**: [http://localhost:5173](http://localhost:5173)

#### Option B: Separate Terminals

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

---

## 📡 API Endpoints

- `POST /api/generate-lesson`
  - **Body**: `{ "topicId": "web-dev-101", "topicTitle": "Web Development" }`
  - **Returns**: Lesson object containing title, summary, key takeaways, and mock questions.

---

## 🎮 Features Baseline

- 🌌 **Gaming Dark Theme**: Dark navy background (`#0b0f19`), neon green (`#00ff9d`), cyan (`#00f0ff`), and gold (`#ffd700`) accents.
- ⚡ **XP & Level Progress**: Global state managed via Zustand tracking XP, levels, and streaks.
- 🏆 **Badges & Achievements**: Showcase unlocked achievements on the Dashboard.
- 🔗 **Full Router Navigation**: Home (`/`), Lesson (`/lesson/:topicId`), Quiz (`/quiz/:topicId`), Dashboard (`/dashboard`), Leaderboard (`/leaderboard`).
