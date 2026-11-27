# DoubtX AI — Real-Time Classroom Doubt Queue Management System

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com/satyam-verse/Teacher-Doubt-Queue-Management-System)
[![Flask](https://img.shields.io/badge/Backend-Flask%203.1-blue)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20+%20Vite-indigo)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20Flash-purple)](https://ai.google.dev/)
[![AWS](https://img.shields.io/badge/Cloud-EC2%20%7C%20RDS%20%7C%20S3-orange)](https://aws.amazon.com/)

## 📌 Overview
**DoubtX AI** is an intelligent, real-time classroom queue and doubt resolution platform. It upgrades the traditional doubt management system into an event-driven platform featuring WebSocket-powered live queues, Google Gemini AI automated hints and teacher assistance, direct AWS S3 attachment uploads, JWT authentication, and connection-pooled AWS RDS MySQL persistence.

---

## 🚀 Key Features

### 🎓 Student Portal
- **Real-Time Queue Tracking**: Instant dynamic FIFO queue placement with real-time estimated wait time.
- **Gemini AI Instant Hints**: Automated deflection clues powered by Google Gemini while waiting in queue.
- **S3 File & Screenshot Attachments**: Direct-to-S3 secure uploads via presigned URLs.
- **Audio & Visual Alerts**: Real-time notifications when a teacher claims and begins assisting the student.

### 👨‍🏫 Teacher Console
- **Live 3-Column Kanban Queue**: Columns for *Waiting*, *In Progress*, and *Resolved Today*.
- **1-Click Claim & Attend**: Move doubts into active resolution state with live student notification.
- **Gemini AI Solution Assistant**: Pre-computed solution bullet points and code correction recommendations for teachers.
- **Priority & Categorization**: Automatic topic classification (React, Python, SQL, Algorithms) and priority scoring.

### 🛡️ Enterprise Backend & Cloud Architecture
- **Flask RESTful APIs**: Modular Application Factory structure with JWT role-based access control.
- **Flask-SocketIO WebSockets**: Instant synchronization across student and teacher dashboards.
- **SQLAlchemy & MySQL RDS**: Connection pooling (`pool_size=10`, `pool_recycle=1800`) preventing timeouts.
- **100% Backward Compatibility**: Original `GET /` and `GET /add?name=...&doubt=...` endpoints are fully preserved.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui components, Lucide Icons, Socket.io-client, Axios |
| **Backend** | Python 3.12, Flask, Flask-SQLAlchemy, Flask-Migrate, Flask-JWT-Extended, Flask-SocketIO, Eventlet |
| **AI Engine** | Google Gemini API (`gemini-2.5-flash` via official `google-genai` SDK) with heuristic fallback |
| **Database** | AWS RDS (MySQL 8.0) / SQLite for local development |
| **Cloud Storage** | AWS S3 (Presigned direct-to-S3 client uploads) |
| **Infrastructure** | AWS EC2 (Ubuntu 24.04 LTS), Nginx Reverse Proxy, Gunicorn, systemd, Let's Encrypt SSL |

---

## ⚙️ Quick Start (Local Development)

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/satyam-verse/Teacher-Doubt-Queue-Management-System.git
cd Teacher-Doubt-Queue-Management-System

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Run backend (boots on http://localhost:5000 with local SQLite auto-fallback)
python app.py
```

### 3. Frontend Setup
```bash
# In a new terminal window
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🌐 Usage & API Documentation

### 1. Preserved Legacy Endpoint (100% Compatible)
The original endpoint continues to function without change:
```http
GET http://<your-ec2-ip>:5000/add?name=Alice&doubt=How+does+recursion+work%3F
```
*Response*: `Doubt Added Successfully!`

### 2. Modern REST APIs
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/doubts` | List active doubts with FIFO queue position and stats |
| `POST` | `/api/v1/doubts` | Submit doubt (triggers Gemini AI analysis & WebSocket broadcast) |
| `POST` | `/api/v1/doubts/<id>/claim` | Teacher claims doubt (marks `IN_PROGRESS`) |
| `PATCH` | `/api/v1/doubts/<id>/status` | Update status (`IN_PROGRESS`, `RESOLVED`, `CANCELLED`) |
| `POST` | `/api/v1/uploads/presigned-url` | Generate AWS S3 presigned PUT URL for attachments |
| `POST` | `/api/v1/auth/register` | Register new Student or Teacher account |
| `POST` | `/api/v1/auth/login` | Obtain JWT authentication token |
| `POST` | `/api/v1/ai/analyze` | Request Gemini AI analysis on arbitrary question text |

---

## 🧪 Automated Testing
Run the complete Pytest verification suite:
```bash
pytest -v tests/test_api.py
```

---

## 📖 Deployment Guide
Detailed step-by-step production instructions for AWS EC2, RDS (MySQL), S3, Nginx reverse proxy, and systemd are available in:
- [docs/deployment_guide.md](docs/deployment_guide.md)
- [docs/architecture.md](docs/architecture.md)

---

## 📌 Author
**Satyam Kumar**  
GitHub: [@satyam-verse](https://github.com/satyam-verse)
