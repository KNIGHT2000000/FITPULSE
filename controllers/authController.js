// /**
/**
 * controllers/authController.js
 * Handles API request/response for registration and login.
 * FIX: Passes the entire req.body to the service to ensure all fields are validated and processed.
 */
const AuthService = require('../services/AuthService');

/**
 * Handles the registration and initial profile creation process.
 * Endpoint: POST /api/auth/register
 */
exports.register = async (req, res, next) => {
    try {
        // Pass the entire request body directly to the service.
        // The service (AuthService.js) handles separation and validation.
        const userData = req.body; 

        // Call the service to handle hashing, user creation, profile creation, and token generation
        const result = await AuthService.register(userData);

        // Success response
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully, profile created.',
            token: result.token,
            userId: result.userId // Returning userId for convenience
        });

    } catch (error) {
        // Basic input validation caught here (status 400 is handled by service throwing an error)
        if (error.message.includes('Missing required fields')) {
            return res.status(400).json({ status: 'error', message: error.message });
        }
        
        // Handle specific errors from AuthService (e.g., duplicate email)
        if (error.message.includes('User with this email already exists')) {
            error.statusCode = 409; // Conflict
        }
        next(error); // Pass error to the global error handler in server.js
    }
};

/**
 * Handles the user login process.
 * Endpoint: POST /api/auth/login
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Call the service to handle login logic and token generation
        const result = await AuthService.login(email, password);

        res.status(200).json({
            status: 'success',
            message: 'Login successful.',
            token: result.token
        });
    } catch (error) {
        // Handle specific errors from AuthService (e.g., invalid credentials)
        if (error.message.includes('Invalid credentials')) {
            return res.status(401).json({ status: 'error', message: error.message }); // Unauthorized
        }
        next(error); // Pass error to the global error handler
    }
};
//  * controllers/authController.js
//  * Handles API request/response for registration and login.
//  */
// const AuthService = require('../services/AuthService');

// /**
//  * Handles the registration and initial profile creation process.
//  * Endpoint: POST /api/auth/register
//  */
// exports.register = async (req, res, next) => {
//     try {
//         const { email, password, name, age, medical_history, diet_type, goal } = req.body;

//         // Basic input validation (You'll want more robust Joi/validator checks later)
//         if (!email || !password || !name || !age || !diet_type || !goal) {
//             return res.status(400).json({ message: 'Missing required registration fields.' });
//         }

//         // Separate data for authentication and profile creation
//         const userData = { email, password };
//         const profileData = { name, age, medical_history, diet_type, goal };

//         // Call the service to handle hashing, user creation, profile creation, and token generation
//         const token = await AuthService.register(userData, profileData);

//         // Success response
//         res.status(201).json({
//             status: 'success',
//             message: 'User registered successfully, profile created.',
//             token
//         });

//     } catch (error) {
//         // Handle specific errors from AuthService (e.g., duplicate email)
//         if (error.message.includes('User with this email already exists')) {
//             error.statusCode = 409; // Conflict
//         }
//         next(error); // Pass error to the global error handler in server.js
//     }
// };

// /**
//  * Handles the user login process.
//  * Endpoint: POST /api/auth/login
//  */
// exports.login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({ message: 'Email and password are required.' });
//         }

//         // Call the service to handle login logic and token generation
//         const token = await AuthService.login(email, password);

//         res.status(200).json({
//             status: 'success',
//             message: 'Login successful.',
//             token
//         });
//     } catch (error) {
//         // Handle specific errors from AuthService (e.g., invalid credentials)
//         if (error.message.includes('Invalid email or password')) {
//             error.statusCode = 401; // Unauthorized
//         }
//         next(error); // Pass error to the global error handler
//     }
// };