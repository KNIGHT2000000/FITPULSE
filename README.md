# Fitness Tracker Backend with Frontend Integration From Vyomesh shukla and team

A comprehensive fitness tracking application with user authentication, goal setting, and personalized recommendations.


## Features

- User Registration and Authentication
- Goal-based fitness tracking (Weight Loss, Muscle Gain, Mental Peace)
- Diet type preferences (Vegetarian/Non-Vegetarian)
- Medical history tracking
- JWT-based authentication
- Responsive frontend interface

## Setup Instructions

### 1. Database Setup

1. Create a MySQL database named `fitness_tracker`
2. Run the SQL schema from `database.scheme.sql` to create the required tables

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=fitness_tracker

# JWT Secret (Use a secure random string)
JWT_SECRET=your_secure_jwt_secret_key_here

# Server Configuration
PORT=3000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Frontend Pages

- **Home**: `http://localhost:3000/` - Landing page
- **Register**: `http://localhost:3000/register.html` - User registration
- **Login**: `http://localhost:3000/login.html` - User login
- **Dashboard**: `http://localhost:3000/dashboard.html` - User dashboard (requires login)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Request/Response Examples

#### Registration
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "age": 25,
  "diet_type": "Non-Veg",
  "goal": "Weight Loss",
  "medical_history": "diabetes"
}
```

#### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

## Database Schema

The application uses the following main tables:
- `Users` - Basic user information and authentication
- `UserProfiles` - Detailed user profiles with goals and medical history
- `LearningModules` - Goal-specific content and guides
- `CalorieEntries` - Diet and nutrition tracking
- `SleepEntries` - Sleep pattern tracking
- `Exercises` - Exercise recommendations
- `UserSchedules` - User activity scheduling
- `Notifications` - User notifications and reminders

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with mysql2
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Frontend**: HTML, CSS, JavaScript (Vanilla)

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Input validation and sanitization
- CORS enabled for frontend communication
- Environment variable configuration for sensitive data

## Development

The application is structured with:
- `controllers/` - Request handlers
- `models/` - Database interaction layer
- `services/` - Business logic
- `routes/` - API route definitions
- `middleware/` - Authentication middleware
- `config/` - Database configuration
- `flexi signin/` - Frontend files

## Next Steps

After setting up the basic authentication:
1. Implement additional tracking features (calories, sleep, exercises)
2. Add user profile management
3. Create scheduling and notification systems
4. Implement data visualization and analytics
5. Add mobile responsiveness improvements
