# 🚀 SyncVerse

**Real-time collaborative document editing platform.**
Collaborate on documents with your team in real-time with a seamless, modern interface.

---

## ✨ Features

- 🔄 **Real-time Collaboration**: Edit simultaneously with multi-user presence.
- 📝 **Rich Text Editor**: Premium editing experience powered by Tiptap/Quill.
- 🕒 **Auto-save & History**: Never lose progress with built-in version control.
- 🔒 **Secure Auth**: JWT-based authentication and document permissions.
- 📤 **Export**: Save your work as PDF or Image.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Zustand, Socket.io-client.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io.

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd SyncVerse
npm install
cd client && npm install
```

### 2. Environment Setup
Create a `.env` file in the root:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### 3. Run the App
**Root directory:** `npm run dev` (Starts backend)
**Client directory:** `npm run dev` (Starts frontend)

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Login user |
| `GET` | `/api/documents` | List documents |
| `POST` | `/api/documents` | Create document |

---

## 📄 License
Distributed under the MIT License.
