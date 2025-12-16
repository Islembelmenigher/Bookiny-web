# 🚀 Project Setup Guide

This guide provides step-by-step instructions to set up the **Booksy Clone** project on your local machine. It is designed for developers of all levels.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your computer:

1.  **Node.js** (Version 18 or higher)
    - To check: run `node -v` in your terminal.
    - [Download Node.js](https://nodejs.org/)
2.  **npm** (Node Package Manager)
    - Included with Node.js.
    - To check: run `npm -v`.
3.  **Git**
    - To clone the repository.
    - To check: run `git --version`.
    - [Download Git](https://git-scm.com/)
4.  **VS Code** (Recommended IDE)
    - [Download VS Code](https://code.visualstudio.com/)

---

## 🛠️ Step-by-Step Installation

### 1. Clone the Repository

First, you need to get the code onto your machine. Open your terminal (Command Prompt, PowerShell, or Terminal) and run:

```bash
git clone <YOUR_GIT_REPOSITORY_URL>
```

_Replace `<YOUR_GIT_REPOSITORY_URL>` with the actual URL provided by the repository owner._

### 2. Navigate to the Project Folder

Move into the project directory you just cloned:

```bash
cd localbook-studio
```

### 3. Install Dependencies

This project uses `npm` to manage external libraries. Run this command to install everything listed in `package.json`:

```bash
npm install
```

_This may take a few minutes as it downloads React, Supabase client, Tailwind, and other tools._

### 4. Application Configuration

This application connects to **Supabase** (Lovable Cloud) for its database and authentication.

1.  Locate the `.env` file in the root directory.
2.  Ensure it contains the following keys (these are usually pre-configured for this project, but if missing, ask the project owner):

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

> **Note:** Never share your `ANON_KEY` or `URL` publicly in un-protected environments, although they are safe to be exposed to the browser for public clients.

### 5. Start the Development Server

Now you are ready to run the app!

```bash
npm run dev
```

If successful, the terminal will show something like:

```
  VITE v5.4.10  ready in 350 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
```

### 6. Open in Browser

Hold `Ctrl` (or `Cmd`) and click the link `http://localhost:8080/` shown in your terminal, or type it into your browser's address bar.

---

## 🐛 Troubleshooting Common Issues

### "Address already in use"

**Error:** `Error: listen EADDRINUSE: address already in use 127.0.0.1:8080`
**Solution:**
Another program is using port 8080. You can either:

1.  Kill the other process.
2.  Let Vite choose a different port automatically (it often does this by default).

### "npm install fails"

**Solution:**

1.  Delete the `node_modules` folder and `package-lock.json` file.
    - Windows: `rmdir /s /q node_modules` and `del package-lock.json`
    - Mac/Linux: `rm -rf node_modules package-lock.json`
2.  Run `npm install` again.

### "Blank Screen" or "404 Error"

**Solution:**

1.  Check the browser console (F12 > Console tab) for red error messages.
2.  Ensure you have the correct `.env` variables if the app fails to fetch data.

---

## 📚 Essential Commands Cheat Sheet

| Command           | Description                                                |
| :---------------- | :--------------------------------------------------------- |
| `npm run dev`     | Starts the local development server.                       |
| `npm run build`   | Builds the project for production (creates `dist` folder). |
| `npm run lint`    | Checks code for errors using ESLint.                       |
| `npm run preview` | Previews the production build locally.                     |

---

## 🤝 Need Help?

If you get stuck, please reach out to the project owner or check the documentation links in the `README.md` file.
