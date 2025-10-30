/**
 * routes/dashboardRoutes.js
 * Defines the protected endpoints for dashboard functionality.
 */
const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require authentication
router.use(auth);

// Route to get user profile and goal information
router.get('/profile', dashboardController.getUserProfile);

// Route to get dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// Test route to add sample data for today (for testing purposes)
router.post('/test-data', async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        
        const { pool } = require('../config/db');
        
        // Add test calorie entry for today
        await pool.query(`
            INSERT INTO CalorieEntries (user_id, entry_date, meal_type, food_item, calories, protein_g, carbs_g, fats_g)
            VALUES (?, ?, 'Breakfast', 'Test Breakfast', 300, 20, 40, 10)
            ON DUPLICATE KEY UPDATE calories = calories
        `, [userId, today]);
        
        // Add test sleep entry for today
        await pool.query(`
            INSERT INTO SleepEntries (user_id, sleep_date, start_time, end_time, duration_minutes, quality_rating)
            VALUES (?, ?, '23:00:00', '07:00:00', 480, 'Good')
            ON DUPLICATE KEY UPDATE duration_minutes = duration_minutes
        `, [userId, today]);
        
        res.json({ status: 'success', message: 'Test data added for today' });
    } catch (error) {
        console.error('Error adding test data:', error);
        res.status(500).json({ status: 'error', message: 'Failed to add test data' });
    }
});

// Test route to populate exercise and learning data
router.post('/populate-exercises', async (req, res) => {
    try {
        const { pool } = require('../config/db');
        
        // Sample exercises for each goal
        const exercises = [
            // Weight Loss exercises
            {
                name: 'High-Intensity Interval Training',
                description: 'Burn maximum calories with alternating high and low intensity exercises. Perfect for rapid weight loss.',
                goal_type: 'Weight Loss',
                difficulty: 'Intermediate',
                focus_area: 'Cardio',
                image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
                duration_minutes: 30,
                calories_burned: 350
            },
            {
                name: 'Running & Jogging',
                description: 'Classic cardio exercise that burns calories effectively while improving cardiovascular health.',
                goal_type: 'Weight Loss',
                difficulty: 'Beginner',
                focus_area: 'Cardio',
                image_url: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=200&fit=crop',
                duration_minutes: 45,
                calories_burned: 400
            },
            {
                name: 'Circuit Training',
                description: 'Combine strength and cardio in fast-paced circuits for maximum calorie burn.',
                goal_type: 'Weight Loss',
                difficulty: 'Advanced',
                focus_area: 'Full Body',
                image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=200&fit=crop',
                duration_minutes: 40,
                calories_burned: 450
            },
            // Muscle Gain exercises
            {
                name: 'Strength Training',
                description: 'Build muscle mass with progressive overload using weights and resistance exercises.',
                goal_type: 'Muscle Gain',
                difficulty: 'Intermediate',
                focus_area: 'Strength',
                image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=200&fit=crop',
                duration_minutes: 60,
                calories_burned: 250
            },
            {
                name: 'Compound Movements',
                description: 'Master squats, deadlifts, and bench press for maximum muscle activation.',
                goal_type: 'Muscle Gain',
                difficulty: 'Advanced',
                focus_area: 'Full Body',
                image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=200&fit=crop',
                duration_minutes: 75,
                calories_burned: 300
            },
            {
                name: 'Progressive Overload Training',
                description: 'Gradually increase weight and intensity to stimulate muscle growth.',
                goal_type: 'Muscle Gain',
                difficulty: 'Intermediate',
                focus_area: 'Strength',
                image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=200&fit=crop',
                duration_minutes: 50,
                calories_burned: 200
            },
            // Mental Peace exercises
            {
                name: 'Mindfulness Meditation',
                description: 'Practice present-moment awareness to reduce stress and anxiety.',
                goal_type: 'Mental Peace',
                difficulty: 'Beginner',
                focus_area: 'Meditation',
                image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
                duration_minutes: 20,
                calories_burned: 50
            },
            {
                name: 'Yoga Flow',
                description: 'Gentle movements combined with breathing to promote relaxation and flexibility.',
                goal_type: 'Mental Peace',
                difficulty: 'Beginner',
                focus_area: 'Yoga',
                image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=200&fit=crop',
                duration_minutes: 30,
                calories_burned: 100
            },
            {
                name: 'Breathing Exercises',
                description: 'Deep breathing techniques to calm the mind and reduce stress levels.',
                goal_type: 'Mental Peace',
                difficulty: 'Beginner',
                focus_area: 'Breathing',
                image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
                duration_minutes: 15,
                calories_burned: 30
            }
        ];
        
        // Insert exercises (using only columns that exist in your database)
        for (const exercise of exercises) {
            await pool.query(`
                INSERT INTO exercises (name, description, goal_type, difficulty, focus_area, image_url)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                description = VALUES(description),
                image_url = VALUES(image_url)
            `, [
                exercise.name, exercise.description, exercise.goal_type, exercise.difficulty,
                exercise.focus_area, exercise.image_url
            ]);
        }
        
        // Sample learning modules
        const learningModules = [
            {
                goal: 'Weight Loss',
                title: 'Weight Loss Fundamentals',
                content: `Welcome to your weight loss journey! Understanding the basics is key to sustainable success.

**Caloric Deficit**: Weight loss occurs when you burn more calories than you consume. Aim for a moderate deficit of 300-500 calories per day for healthy, sustainable weight loss.

**Exercise Strategy**: Combine cardio exercises (like HIIT, running) with strength training to maximize calorie burn and preserve muscle mass.

**Nutrition Focus**: 
- Prioritize whole foods: lean proteins, vegetables, fruits, and whole grains
- Stay hydrated with 8-10 glasses of water daily
- Practice portion control and mindful eating

**Timeline**: Healthy weight loss is 1-2 pounds per week. Be patient and consistent with your efforts.

Remember: This is a lifestyle change, not a temporary diet. Focus on building sustainable habits that you can maintain long-term.`
            },
            {
                goal: 'Muscle Gain',
                title: 'Muscle Building Science',
                content: `Building muscle requires a strategic approach combining proper training, nutrition, and recovery.

**Progressive Overload**: Gradually increase weight, reps, or sets to continuously challenge your muscles and stimulate growth.

**Training Principles**:
- Focus on compound movements (squats, deadlifts, bench press)
- Train each muscle group 2-3 times per week
- Allow 48-72 hours recovery between training the same muscle groups

**Nutrition for Growth**:
- Eat in a slight caloric surplus (200-500 calories above maintenance)
- Consume 1.6-2.2g protein per kg of body weight
- Don't neglect carbohydrates - they fuel your workouts

**Recovery**: Muscle growth happens during rest. Aim for 7-9 hours of quality sleep and manage stress levels.

**Timeline**: Noticeable muscle growth typically takes 6-8 weeks of consistent training and proper nutrition.`
            },
            {
                goal: 'Mental Peace',
                title: 'Mindfulness & Mental Wellness',
                content: `Mental peace is achieved through consistent practice and self-awareness. Here's your guide to inner calm.

**Mindfulness Basics**: 
- Practice being present in the moment without judgment
- Start with just 5-10 minutes of daily meditation
- Focus on your breath as an anchor to the present

**Stress Management**:
- Identify your stress triggers and develop healthy coping strategies
- Practice deep breathing exercises during stressful moments
- Regular physical activity helps reduce stress hormones

**Daily Practices**:
- Morning meditation or breathing exercises
- Gratitude journaling - write 3 things you're grateful for daily
- Evening reflection and relaxation routines

**Building Resilience**: Mental peace isn't about avoiding stress, but developing tools to handle it effectively.

**Community**: Consider joining meditation groups or mindfulness communities for support and accountability.

Remember: Mental wellness is a journey, not a destination. Be patient and compassionate with yourself.`
            }
        ];
        
        // Insert learning modules
        for (const module of learningModules) {
            await pool.query(`
                INSERT INTO LearningModules (goal, title, content)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                title = VALUES(title),
                content = VALUES(content)
            `, [module.goal, module.title, module.content]);
        }
        
        res.json({ 
            status: 'success', 
            message: 'Exercise and learning data populated successfully',
            data: {
                exercises_added: exercises.length,
                learning_modules_added: learningModules.length
            }
        });
    } catch (error) {
        console.error('Error populating exercise data:', error);
        res.status(500).json({ status: 'error', message: 'Failed to populate exercise data' });
    }
});

module.exports = router;
