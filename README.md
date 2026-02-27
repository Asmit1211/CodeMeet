<h1 align="center">🎯 CodeMeet — Tech Interview Platform</h1>

<p align="center">
  <b>A full-stack MERN video calling platform built for conducting real-time technical interviews with collaborative code editing, screen sharing, and instant code execution.</b>
</p>

![Demo App](/frontend/public/screenshot-for-readme.png)

---

## ✨ Features

- 🎥 **1-on-1 & Group Video Calls** — Up to 4 participants per room (powered by Stream Video SDK)
- 🖥️ **Screen Sharing** — Share your screen with all participants in real-time
- 🧑‍💻 **Live Code Editor** — VSCode-powered collaborative editor with syntax highlighting
- ⚙️ **Code Execution** — Secure, sandboxed execution supporting JavaScript, Python, Java, C++, Go, and Rust
- 🎯 **Auto Feedback** — Success/Fail based on test cases with confetti on success
- 💬 **Real-time Chat** — In-call messaging via Stream Chat SDK
- 🔐 **Authentication** — Secure sign-in/sign-up via Clerk
- 🧭 **Dashboard** — Live stats, active sessions, recent history, and interview tips
- 🧩 **Practice Mode** — Solo coding problems page for interview prep
- 🔒 **Room Controls** — Password-protected rooms with participant limits
- 🧠 **Background Jobs** — Async task processing with Inngest
- 📚 **Study Materials** — Premium content with Razorpay payment integration
- 📱 **Responsive Design** — Works on desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, Vite, Tailwind CSS, DaisyUI |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **Video/Chat** | Stream Video SDK, Stream Chat SDK |
| **Auth** | Clerk |
| **Code Execution** | JDoodle API |
| **Payments** | Razorpay |
| **Background Jobs** | Inngest |
| **State Management** | TanStack Query |

---

## 🧪 Environment Variables

### Backend (`/backend/.env`)

```env
PORT=3000
NODE_ENV=development

DB_URL=your_mongodb_connection_url

INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

CLIENT_URL=http://localhost:5173
```

### Frontend (`/frontend/.env`)

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000/api
VITE_STREAM_API_KEY=your_stream_api_key
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/CodeMeet.git
cd CodeMeet
```

### 2. Install dependencies & run

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

### 3. Open in browser

```
http://localhost:5173
```

---

## 📁 Project Structure

```
CodeMeet/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── lib/            # DB, Stream, Env config
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   └── server.js       # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # API client functions
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities (Stream, Piston)
│   │   ├── pages/          # Route pages
│   │   ├── data/           # Problem sets
│   │   └── App.jsx         # Root component
│   └── package.json
├── .gitignore
└── README.md
```

---

## 👨‍💻 Author

Made with ❤️ by **Asmit**
