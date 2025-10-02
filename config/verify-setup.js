/**
 * Database and Environment Verification Script
 * Run this to check if your setup is correct before starting the server
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function verifySetup() {
    console.log('🔍 Verifying Fitness Tracker Setup...\n');

    // Check environment variables
    console.log('1. Checking Environment Variables:');
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
    let envCheck = true;

    requiredEnvVars.forEach(varName => {
        if (process.env[varName]) {
            console.log(`   ✅ ${varName}: Set`);
        } else {
            console.log(`   ❌ ${varName}: Missing`);
            envCheck = false;
        }
    });

    if (!envCheck) {
        console.log('\n❌ Environment variables are missing. Please create a .env file with all required variables.');
        return;
    }

    // Check database connection
    console.log('\n2. Testing Database Connection:');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('   ✅ Database connection successful');

        // Check if tables exist
        console.log('\n3. Checking Database Tables:');
        const requiredTables = ['Users', 'UserProfiles', 'LearningModules', 'CalorieEntries', 'SleepEntries', 'Exercises', 'UserSchedules', 'Notifications'];
        
        for (const tableName of requiredTables) {
            try {
                const [rows] = await connection.execute(`SHOW TABLES LIKE '${tableName}'`);
                if (rows.length > 0) {
                    console.log(`   ✅ Table '${tableName}': Exists`);
                } else {
                    console.log(`   ❌ Table '${tableName}': Missing`);
                }
            } catch (error) {
                console.log(`   ❌ Table '${tableName}': Error checking - ${error.message}`);
            }
        }

        // Check Users table structure
        console.log('\n4. Verifying Users Table Structure:');
        try {
            const [columns] = await connection.execute('DESCRIBE Users');
            const requiredColumns = ['user_id', 'email', 'password_hash', 'name', 'age', 'diet_type'];
            
            requiredColumns.forEach(colName => {
                const columnExists = columns.find(col => col.Field === colName);
                if (columnExists) {
                    console.log(`   ✅ Column '${colName}': ${columnExists.Type}`);
                } else {
                    console.log(`   ❌ Column '${colName}': Missing`);
                }
            });
        } catch (error) {
            console.log(`   ❌ Error checking Users table: ${error.message}`);
        }

        // Check UserProfiles table structure
        console.log('\n5. Verifying UserProfiles Table Structure:');
        try {
            const [columns] = await connection.execute('DESCRIBE UserProfiles');
            const requiredColumns = ['profile_id', 'user_id', 'goal', 'medical_history'];
            
            requiredColumns.forEach(colName => {
                const columnExists = columns.find(col => col.Field === colName);
                if (columnExists) {
                    console.log(`   ✅ Column '${colName}': ${columnExists.Type}`);
                } else {
                    console.log(`   ❌ Column '${colName}': Missing`);
                }
            });
        } catch (error) {
            console.log(`   ❌ Error checking UserProfiles table: ${error.message}`);
        }

        await connection.end();
        
        console.log('\n🎉 Setup verification complete!');
        console.log('\nIf all checks passed, you can now run: npm run dev');

    } catch (error) {
        console.log(`   ❌ Database connection failed: ${error.message}`);
        console.log('\nPlease check:');
        console.log('- MySQL server is running');
        console.log('- Database credentials in .env file are correct');
        console.log('- Database "fitness_tracker" exists');
        console.log('- User has proper permissions');
    }
}

// Run verification
verifySetup().catch(console.error);
