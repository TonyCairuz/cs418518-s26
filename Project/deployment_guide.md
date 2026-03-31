# Deployment Guide: CS418/518 Course Advising System

This guide outlines the steps to deploy your **Milestone 2** project using **Render** for the backend and **Firebase** for the frontend.

---

## 1. Prepare for Deployment
Since you are moving this folder to a new repository, ensure you:
1.  Initialize a new Git repository in the `Project` folder.
2.  Add your new GitHub account as the remote.
3.  Push the code to the main branch.

---

## 2. Backend Deployment (Render.com)
Render will host your Node.js/Express API.

### Step-by-Step:
1.  **Create a Web Service**: In the Render Dashboard, click **New > Web Service**.
2.  **Connect Repo**: Connect your new GitHub repository.
3.  **Configure Build/Run**:
    *   **Name**: `course-advising-api` (or similar)
    *   **Root Directory**: `server`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start` (I have already added this to your `package.json`).
4.  **Add Environment Variables**: Go to the **Environment** tab and add:
    *   `DB_HOST`: Your cloud database host (e.g., Aiven, PlanetScale, or Render Managed Redis/MySQL).
    *   `DB_USER`: Your db username.
    *   `DB_PASSWORD`: Your db password.
    *   `DB_NAME`: `COURSE_ADVISING`
    *   `JWT_SECRET`: A secure random string.
    *   `FE_ORIGIN`: Your Firebase URL (e.g., `https://your-project.web.app`).

> [!IMPORTANT]
> **Database for Production**: Your current database is running on `127.0.0.1` (localhost). For a live website, you MUST use a cloud database and update the `DB_HOST` variable in Render.

---

## 3. Frontend Deployment (Firebase Hosting)
Firebase will host your built React application.

### Step-by-Step:
1.  **Install Tools**: `npm install -g firebase-tools`
2.  **Login**: `firebase login`
3.  **Initialize**: Inside the `client` folder, run `firebase init`.
    *   Select **Hosting**.
    *   Select your existing Firebase project.
    *   **Public Directory**: `dist`
    *   **Single-page app**: `Yes`
    *   **GitHub Action**: `No` (unless you want automated deploys).
4.  **Configure API URL**:
    *   Open `client/.env` and update `VITE_API_KEY` to your Render URL (from the step above).
    *   Example: `VITE_API_KEY=https://course-advising-api.onrender.com/`
5.  **Build**: Run `npm run build` inside the `client` folder.
6.  **Deploy**: Run `firebase deploy`.

---

## 4. Post-Deployment Checklist
1.  **CORS**: Ensure your `FE_ORIGIN` in Render matches your actual Firebase URL exactly.
2.  **HTTPS**: Ensure all API calls from the frontend use `https://`.
3.  **Database Migration**: Run your `milestone2.sql` manually on your new cloud database using a tool like DBeaver or phpMyAdmin before testing the live site.

### Skip Render Deployment (for minor edits):
If you edit the README or report, use this commit message:
`git commit -m "[skip render] Documentation update"`
