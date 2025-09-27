/**
 * middleware/auth.js
 * Middleware to verify JWT token and attach user ID to the request object (req.user.id).
 */
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const auth = (req, res, next) => {
    // 1. Check for token in the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            status: 'error', 
            message: 'Authorization token required.' 
        });
    }

    // 2. Extract the token (remove "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // 3. Verify the token using the secret
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 4. Attach the decoded user ID to the request object
        req.user = { id: decoded.id };
        
        // 5. Proceed to the next middleware/controller
        next();

    } catch (error) {
        // Handle token expiration or invalid signature
        console.error('JWT Verification Failed:', error.message);
        return res.status(403).json({ 
            status: 'error', 
            message: 'Invalid or expired token. Please log in again.' 
        });
    }
};

module.exports = auth;