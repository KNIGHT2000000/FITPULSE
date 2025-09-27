
/**
 * services/AuthService.js
 * Contains business logic for user authentication: hashing, registration, login, and token generation.
 */
/**
 * models/UserModel.js
 * Handles direct database interaction for Users and UserProfiles.
 * This version correctly separates user (name, age, diet_type) and profile (goal, medical_history) data.
 */
const { pool } = require('../config/db');

class UserModel {
    /**
     * Creates a new user entry in the Users table.
     * @param {object} userData - Email, hashed password, name, age, diet_type.
     * @returns {Promise<string>} The ID of the newly created user (UUID).
     */
    static async createUser(userData) {
        const { email, hashedPassword, name, age, diet_type } = userData;
        const query = `
            INSERT INTO Users (user_id, email, password_hash, name, age, diet_type) 
            VALUES (UUID(), ?, ?, ?, ?, ?)
        `;
        
        try {
            // Execute the insertion into the Users table
            await pool.query(query, [email, hashedPassword, name, age, diet_type]);
            
            // Retrieve the generated user_id
            const [userRow] = await pool.query('SELECT user_id FROM Users WHERE email = ?', [email]);
            
            if (userRow.length === 0) {
                throw new Error("User creation failed, couldn't retrieve generated ID.");
            }
            return userRow[0].user_id;

        } catch (error) {
            // Check for duplicate email error specifically
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('A user with this email already exists.');
            }
            throw error;
        }
    }

    /**
     * Creates the initial user profile (for goal-specific details).
     * @param {string} userId - The ID of the user.
     * @param {object} profileData - Profile details (goal, medical_history).
     */
    static async createProfile(userId, profileData) {
        // Only goal and medical_history are used for the UserProfiles table
        const { medical_history, goal } = profileData;
        
        const query = 'INSERT INTO UserProfiles (user_id, medical_history, goal) VALUES (?, ?, ?)';
        await pool.query(query, [userId, medical_history, goal]);
    }

    /**
     * Finds a user by their email address for login.
     */
    static async findByEmail(email) {
        const query = 'SELECT user_id, email, password_hash, name FROM Users WHERE email = ? LIMIT 1';
        const [rows] = await pool.query(query, [email]);
        return rows.length ? rows[0] : null;
    }
}

module.exports = UserModel;
