# Project Todo — Full Stack App

A full-featured Project TODO application with role-based access control.

---

## 🗂 Project Structure

```
project-todo/
├── backend/       Node.js + Express + MongoDB API
└── frontend/      Angular 20 + Angular Material UI
```

---

## 👥 Roles

| Role  | Permissions |
|-------|-------------|
| **Admin** | Full access to all data, create/manage leads, manage users |
| **Lead**  | Create projects, add steps/items, invite users via email |
| **User**  | View assigned projects, toggle items, create public/private todos |
| **Guest** | Create private todos only (no project access) |

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Google OAuth, Gmail credentials
npm run dev
```

Backend runs at: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
ng serve
```

Frontend runs at: `http://localhost:4200`

---

## ⚙️ Environment Variables (backend/.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/project-todo
JWT_SECRET=change_this_to_a_strong_secret
JWT_EXPIRES_IN=7d

# Google OAuth (from console.cloud.google.com)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Gmail (use App Password, not account password)
MAIL_USER=your@gmail.com
MAIL_PASS=your_gmail_app_password

FRONTEND_URL=http://localhost:4200
```

---

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project → Enable "Google+ API"
3. Credentials → Create OAuth 2.0 Client ID
4. Add `http://localhost:5000/api/auth/google/callback` as authorized redirect URI
5. Copy Client ID and Secret to `.env`

---

## 📧 Gmail Setup (for email invites)

1. Enable 2FA on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Generate an App Password for "Mail"
4. Use that 16-character password as `MAIL_PASS`

---

## 🌗 Theme

- Toggle dark/light mode from the sidebar user menu or toolbar
- Theme preference is persisted in localStorage

---

## 📡 API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register with email |
| GET  | `/api/auth/verify-email/:token` | Verify email |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/google` | Google OAuth |
| POST | `/api/auth/forgot-password` | Request reset |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/accept-invite` | Accept invite |
| POST | `/api/auth/guest` | Guest access |
| GET  | `/api/auth/me` | Current user |

### Projects (Admin/Lead)
| Method | Path | Description |
|--------|------|-------------|
| GET    | `/api/projects` | List projects |
| POST   | `/api/projects` | Create project |
| GET    | `/api/projects/:id` | Get project |
| PUT    | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST   | `/api/projects/:id/invite` | Invite member |
| GET    | `/api/projects/dashboard` | Dashboard stats |

### Steps & Items
| Method | Path |
|--------|------|
| POST   | `/api/projects/:id/steps` |
| PUT    | `/api/projects/:id/steps/:stepId` |
| DELETE | `/api/projects/:id/steps/:stepId` |
| POST   | `/api/projects/:id/steps/:stepId/items` |
| PATCH  | `/api/projects/:id/steps/:stepId/items/:itemId/toggle` |
| DELETE | `/api/projects/:id/steps/:stepId/items/:itemId` |

### Todos
| Method | Path |
|--------|------|
| GET    | `/api/todos` |
| POST   | `/api/todos` |
| GET    | `/api/todos/:id` |
| PUT    | `/api/todos/:id` |
| DELETE | `/api/todos/:id` |

---

## 🧰 Tech Stack

- **Frontend**: Angular 20, Angular Material, TypeScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + Google OAuth 2.0 (Passport.js)
- **Email**: Nodemailer (Gmail)
