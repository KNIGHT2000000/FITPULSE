--
-- SQL Schema for Fitness Tracker Backend (MySQL)
-- Designed to support user authentication, goal setting, tracking, and recommendations.
--

-- 1. Users Table (Authentication and basic details)
CREATE TABLE Users (
    user_id VARCHAR(36) PRIMARY KEY, -- Using UUID for user IDs
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash CHAR(60) NOT NULL, -- Recommended length for bcrypt hash
    name VARCHAR(100) NOT NULL,
    age INT,
    diet_type ENUM('Veg', 'Non-Veg') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. UserProfiles Table (Personalized/Onboarding Data)
-- Stores the in-depth information collected during registration/onboarding.
CREATE TABLE UserProfiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL,
    goal ENUM('Weight Loss', 'Muscle Gain', 'Mental Peace') NOT NULL,
    medical_history TEXT, -- Store detailed medical history as text (e.g., JSON string or simple notes)
    target_weight_kg DECIMAL(5, 2), -- Optional: Target weight
    target_body_fat DECIMAL(4, 2),  -- Optional: Target body fat percentage
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 3. LearningModules Table (Goal-specific content)
CREATE TABLE LearningModules (
    module_id INT AUTO_INCREMENT PRIMARY KEY,
    goal ENUM('Weight Loss', 'Muscle Gain', 'Mental Peace')  NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL -- The learning process/guide for the specific goal
);

-- 4. Diet/Calorie Tracking Table
CREATE TABLE CalorieEntries (
    entry_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    entry_date DATE NOT NULL,
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other') NOT NULL,
    food_item VARCHAR(255) NOT NULL,
    calories INT NOT NULL,
    protein_g DECIMAL(5, 2) DEFAULT 0.00,
    carbs_g DECIMAL(5, 2) DEFAULT 0.00,
    fats_g DECIMAL(5, 2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX (user_id, entry_date)
);

-- 5. Sleep Tracking Table
CREATE TABLE SleepEntries (
    sleep_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    sleep_date DATE NOT NULL UNIQUE, -- Only one entry per user per day
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    quality_rating ENUM('Poor', 'Fair', 'Good', 'Excellent'),
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 6. Exercise Recommendations/Catalogue
CREATE TABLE Exercises (
    exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    goal_type ENUM('Weight Loss', 'Muscle Gain', 'Mental Peace') NOT NULL,
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced'),
    focus_area VARCHAR(100), -- e.g., 'Cardio', 'Upper Body', 'Meditation'
    image_url VARCHAR(500), -- URL for exercise image/gif
    duration_minutes INT DEFAULT 30, -- Recommended duration
    calories_burned INT DEFAULT 100 -- Estimated calories burned
);

-- 7. User Scheduling (Planned exercises/activities)
CREATE TABLE UserSchedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    activity_type ENUM('Exercise', 'Meal', 'Meditation', 'Sleep') NOT NULL,
    activity_details VARCHAR(255) NOT NULL, -- Name of exercise or meal plan reference
    notes TEXT, -- Additional notes for the activity
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 8. Notifications/Motivation Table
CREATE TABLE Notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    scheduled_time TIMESTAMP NOT NULL, -- When the notification is scheduled to be sent
    sent_at TIMESTAMP NULL, -- When the notification was actually sent
    type ENUM('quote', 'reminder', 'alert', 'activity_reminder') NOT NULL,
    reference_id INT NULL, -- Reference to related record (e.g., schedule_id for activity reminders)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);
