<div align="center">

  <h1>CodeMeet</h1>
  <p><i>The Ultimate Real-Time Technical Interview & Collaborative Coding Platform.</i></p>
</div>

<div align="center">

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Asmit1211/CodeMeet)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![DaisyUI](https://img.shields.io/badge/DaisyUI-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Stream](https://img.shields.io/badge/Stream-005FFF?style=for-the-badge&logo=stream&logoColor=white)

</div>

<br>

## 📖 About the Project

**CodeMeet** is a scalable, enterprise-grade application explicitly designed to redefine technical interviews and remote pair programming. Evolving far beyond its initial inspiration, CodeMeet eliminates the friction of conducting online assessments by offering a unified, professional environment. It seamlessly combines high-fidelity video/audio streaming with a powerful, real-time synchronized coding workspace. 

Whether you are a recruiter looking to assess candidates with deep precision, or a developer practicing System Design and Data Structures, CodeMeet provides an all-in-one, latency-optimized digital suite built to impress.

## ✨ Key Features

- 🎥 **Seamless Real-Time Interviews:** High-quality, low-latency video and audio calls powered by the Stream SDK to ensure flawless, uninterrupted communication.
- 💻 **Live Collaborative Code Editor:** A state-of-the-art synchronized coding workspace allowing multiple participants to write, review, and debug code simultaneously.
- 🚀 **Integrated Code Execution:** Run code securely right from the browser. View actual, precise execution metrics including **Time (in ms)** and **Memory usage** instantly.
- 📩 **Automated Interview Reporting (Post-Session):** Upon session completion, a smart modal automatically captures the candidate's feedback and email—featuring a strict typo-catcher for invalid domains (e.g., catching `.cpm` or `.con`). It then securely dispatches a beautifully formatted, encrypted HTML interview report straight to their inbox using Nodemailer.
- 📚 **Premium Study Materials:** Access built-in, curated developer resources and interactive guides specifically geared towards DSA (Data Structures & Algorithms) and System Design preparation.

## 🔐 Environment Variables

To run this project, you will need to add the following environment variables to your `.env` files in both the `frontend` and `backend` directories.

### **Frontend (`frontend/.env`)**
| Variable | Description | Value |
| :--- | :--- | :--- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Authentication Public Key | |
| `VITE_STREAM_API_KEY` | Stream SDK API Key | |
| `VITE_BACKEND_URL` | Local or deployed backend server URL | |

### **Backend (`backend/.env`)**
| Variable | Description | Value |
| :--- | :--- | :--- |
| `PORT` | Local server port (e.g., 5000) | |
| `MONGO_URI` | MongoDB Connection String | |
| `CLERK_SECRET_KEY` | Clerk Authentication Secret Key | |
| `STREAM_API_KEY` | Stream SDK API Key | |
| `STREAM_API_SECRET` | Stream SDK Secret Key | |
| `EMAIL_USER` | Email address configured for Nodemailer | |
| `EMAIL_PASS` | App password / SMTP password for Nodemailer | |

## 🚀 Local Setup & Installation

Follow these steps to get a fully functional instance of CodeMeet running on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Asmit1211/CodeMeet.git
cd CodeMeet
```

### 2. Backend Setup
Open a terminal and navigate to the backend directory:
```bash
cd backend

# Install dependencies
npm install

# Create a .env file and fill in required values (refer to the Environment Variables section)
touch .env

# Start the development server
npm run dev
```

### 3. Frontend Setup
Open a **new** terminal instance and navigate to the frontend directory:
```bash
cd frontend

# Install dependencies
npm install

# Create a .env file and fill in required values
touch .env

# Start the frontend application
npm run dev
```

### 4. Open the Workspace
Visit [http://localhost:5173](http://localhost:5173) (or the port specified by Vite) in your browser to experience **CodeMeet**!

---

<div align="center">
  <sub>Built with ❤️ for Developers, by Asmit.</sub>
</div>
