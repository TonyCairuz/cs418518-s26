# CS 418 Project - Milestone 1

A simple website with a green and black theme. I built a login and signup system that works with a database and sends emails for verification.

## Features

- **Signup & Login**:
  - Sign up with UIN and email.
  - Verify email with a code after signing up.
  - Login requires a 2FA code sent to your email.
  - Hashed passwords using bcrypt for safety.
- **Dashboard**:
  - Change your profile name.
  - Change your password.
- **Admin**:
  - Special view for admin users to manage stuff.
- **Design**:
  - Green and black theme.
  - Responsive layout for different screens.

## Tech Stack

- **Frontend**: React, Vite, CSS.
- **Backend**: Node.js, Express.
- **Database**: MySQL.
- **Email**: Nodemailer with Gmail.

## Prerequisites

- Node.js installed.
- MySQL server running locally.

## Getting Started

### 1. Database Configuration

1. Log in to your MySQL terminal or workbench.
2. Run the provided SQL scripts:
   ```sql
   source course_advising.sql;
   source user_info.sql;
   ```
   *Note: These will set up the `COURSE_ADVISING` database and the `user_info` table.*

### 2. Backend Setup (`/server`)

1. Navigate to the server directory:
   ```bash
   cd Project/server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables in a `.env` file:
   ```env
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=COURSE_ADVISING
   FE_ORIGIN=http://localhost:5173
   SMTP_EMAIL=your_gmail@gmail.com
   SMTP_PASSWORD=your_app_password
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Create an Admin User

Run the helper script to generate the first admin account:
```bash
node server/createAdmin.js
```
*Default Credentials: Email: `admin@example.com`, Password: `adminpassword123`*

### 4. Frontend Setup (`/client`)

1. Navigate to the client directory:
   ```bash
   cd Project/client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables in a `.env` file:
   ```env
   VITE_API_KEY=http://localhost:3000/
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open `http://localhost:5173` in your browser.
2. Sign up for a new account using a valid email (to receive OTPs).
3. Verify your email.
4. Log in and enter the 2FA code sent to your email.
5. Explore the dashboard and update your profile!
