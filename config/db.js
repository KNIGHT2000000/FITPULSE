/**
 * Database Connection Setup (MySQL with mysql2/promise)
 * This file sets up a connection pool for efficient database interaction.
 */

const mysql = require('mysql2/promise');

// Load config from environment variables
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create the connection pool
const pool = mysql.createPool(dbConfig);

// Helper function to get a connection from the pool (mostly used for testing connection)
async function getConnection() {
    try {
        const connection = await pool.getConnection();
        connection.release(); // Release it immediately after successful retrieval
        return pool; // Return the pool object
    } catch (error) {
        // Specifically check for critical connection errors
        if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ENOTFOUND') {
            console.error('Critical DB Error: Check DB_HOST, DB_USER, and if your MySQL server is running.');
        }
        throw new Error(`Database connection failed: ${error.message}`);
    }
}

// Export the pool instance and the helper function
module.exports = {
    getConnection,
    pool
};