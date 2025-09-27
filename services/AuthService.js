
/**
 * services/AuthService.js
 * Contains business logic for user authentication: hashing, registration, login, and token generation.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// Get JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

class AuthService {
    /**
     * Registers a new user, hashes the password, and creates the profile.
     * @param {object} userData - All registration data from the request body.
     */
    static async register(userData) {
        const { email, password, name, age, diet_type, goal, medical_history } = userData;
        
        // 1. Validate required fields
        if (!email || !password || !name || !age || !diet_type || !goal) {
            throw new Error('Missing required fields for registration.');
        }

        // 2. Check for existing user
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists.');
        }

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Separate data for the two tables
        const usersTableData = { email, hashedPassword, name, age, diet_type };
        const profilesTableData = { goal, medical_history: medical_history || '' };

        // 5. Create User (sends email, hash, name, age, diet_type)
        const userId = await UserModel.createUser(usersTableData);

        // 6. Create Profile (sends goal, medical_history)
        await UserModel.createProfile(userId, profilesTableData);

        // 7. Generate token for immediate login
        const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

        return { token, userId, email, name };
    }

    /**
     * Logs in a user by verifying credentials and generating a token.
     * @param {string} email - User email.
     * @param {string} password - User password.
     */
    static async login(email, password) {
        const user = await UserModel.findByEmail(email);

        if (!user) {
            throw new Error('Invalid credentials: User not found.');
        }

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            throw new Error('Invalid credentials: Password mismatch.');
        }

        // Generate and return a token
        const token = jwt.sign({ id: user.user_id }, JWT_SECRET, { expiresIn: '7d' });

        return { token, userId: user.user_id, email: user.email, name: user.name };
    }
}

module.exports = AuthService;