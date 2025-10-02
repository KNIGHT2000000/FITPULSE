# 🚀 Fitness Tracker Setup Guide

Follow these steps to get your fitness tracker application running:

## 📋 Prerequisites

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/)
3. **Git** (optional) - [Download here](https://git-scm.com/)

## 🗄️ Step 1: Database Setup

### 1.1 Create Database
Open MySQL Command Line or MySQL Workbench and run:

```sql
CREATE DATABASE fitness_tracker;
USE fitness_tracker;
```

### 1.2 Create Tables
Run the SQL schema from `database.scheme.sql`:

```sql
-- Copy and paste the entire content of database.scheme.sql file
-- Or run: source /path/to/database.scheme.sql
```

**Important**: The schema includes a `medical_history` field in the `UserProfiles` table (line 24), which is what the backend expects.

## ⚙️ Step 2: Environment Configuration

### 2.1 Create .env file
Create a `.env` file in the root directory (same level as `server.js`):

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=fitness_tracker

# JWT Secret (Use a secure random string - at least 32 characters)
JWT_SECRET=your_very_secure_jwt_secret_key_here_make_it_long_and_random

# Server Configuration
PORT=3000
```

**Replace `your_mysql_password_here` with your actual MySQL root password!**

### 2.2 Generate Secure JWT Secret
You can generate a secure JWT secret using:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📦 Step 3: Install Dependencies

Open terminal in the project root directory and run:

```bash
npm install
```

This will install:
- express (web framework)
- mysql2 (MySQL driver)
- bcryptjs (password hashing)
- jsonwebtoken (JWT tokens)
- dotenv (environment variables)

## 🚀 Step 4: Start the Application

### 4.1 Start the Server
```bash
npm run dev
```

You should see:
```
[Database] MySQL connected successfully.
[Server] Server running on http://localhost:3000
[Project] Goal: Implement Auth, Profiles, Tracking, and Scheduling.
```

### 4.2 Access the Application
Open your browser and go to:
- **Home Page**: http://localhost:3000/
- **Register**: http://localhost:3000/register.html
- **Login**: http://localhost:3000/login.html

## 🧪 Step 5: Test the Application

### 5.1 Test Registration
1. Go to http://localhost:3000/register.html
2. Fill out the form with:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
   - Age: 25
   - Diet Type: Veg or Non-Veg
   - Medical History: (optional)
   - Goal: Weight Loss, Muscle Gain, or Mental Peace
3. Click "Register"
4. You should be redirected to the dashboard

### 5.2 Test Login
1. Go to http://localhost:3000/login.html
2. Use the credentials you just created
3. Click "Login"
4. You should be redirected to the dashboard

## 🔧 Troubleshooting

### Database Connection Issues
- **Error**: `Database connection failed`
- **Solution**: Check your MySQL server is running and credentials in `.env` are correct

### 405 Method Not Allowed
- **Error**: `405 (Method Not Allowed)`
- **Solution**: This has been fixed by reordering routes in server.js (API routes before static files)

### JSON Parsing Error
- **Error**: `Failed to execute 'json' on 'Response'`
- **Solution**: This has been fixed with better error handling in the frontend

### Port Already in Use
- **Error**: `EADDRINUSE: address already in use :::3000`
- **Solution**: Change the PORT in `.env` file or kill the process using port 3000

### Missing .env File
- **Error**: Various undefined environment variable errors
- **Solution**: Make sure `.env` file exists in root directory with all required variables

## 📁 Project Structure

```
fitness-tracker/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   └── authController.js     # Authentication logic
├── models/
│   └── UserModel.js          # Database models
├── routes/
│   └── authRoutes.js         # API routes
├── services/
│   └── AuthService.js        # Business logic
├── flexi signin/             # Frontend files
│   ├── index.html           # Home page
│   ├── login.html           # Login page
│   ├── register.html        # Registration page
│   ├── dashboard.html       # User dashboard
│   ├── login.js             # Login functionality
│   └── register.js          # Registration functionality
├── server.js                # Main server file
├── package.json             # Dependencies
├── database.scheme.sql      # Database schema
└── .env                     # Environment variables (create this)
```

## 🎯 Next Steps

After successful setup:
1. Customize the frontend styling
2. Add more features (calorie tracking, exercise logging, etc.)
3. Implement additional API endpoints
4. Add data validation and security improvements
5. Deploy to production server

## 🆘 Need Help?

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure MySQL server is running
4. Check that all dependencies are installed
5. Verify the database schema was created correctly

The application should now be fully functional with user registration and login capabilities!
