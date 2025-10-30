/**
 * services/ExerciseService.js
 * Business logic to fetch top 3 exercises for the user's goal.
 */
const LearningModel = require('../models/LearningModel');
const ExerciseModel = require('../models/ExerciseModel');

class ExerciseService {
    /**
     * Gets the user's goal and returns top exercises for that goal.
     * @param {string} userId
     * @returns {Promise<{ goal: string, exercises: Array<object> }>} payload with goal and exercises
     */
    static async getTopExercisesForUser(userId) {
        if (!userId) {
            const err = new Error('Unauthorized access.');
            err.statusCode = 401;
            throw err;
        }

        console.log('ExerciseService: Getting goal for user:', userId); // Debug log
        const goal = await LearningModel.getUserGoal(userId);
        console.log('ExerciseService: User goal found:', goal); // Debug log
        
        if (!goal) {
            const err = new Error('User profile not found or goal is not set.');
            err.statusCode = 404;
            throw err;
        }

        console.log('ExerciseService: Fetching exercises for goal:', goal); // Debug log
        const exercises = await ExerciseModel.getTopExercisesByGoal(goal);
        console.log('ExerciseService: Exercises found:', exercises.length, exercises); // Debug log

        return { goal, exercises };
    }
}

module.exports = ExerciseService;


