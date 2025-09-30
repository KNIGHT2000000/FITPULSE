/**
 * routes/schedulingRoutes.js
 * Routes for creating/listing schedules and handling notifications.
 */
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const schedulingController = require('../controllers/schedulingController');

// All routes below require auth
router.use(auth);

// Create a new schedule (meal/sleep/exercise/meditation)
router.post('/', schedulingController.createSchedule);

// List schedules for a specific date
router.get('/date/:date', schedulingController.listSchedulesForDate);

// Notifications: list due (for polling or a worker)
router.get('/notifications/due', schedulingController.listDueNotifications);

// Notifications: mark as read
router.patch('/notifications/:id/read', schedulingController.markNotificationRead);

// Toggle schedule complete/incomplete
router.patch('/:id/toggle', schedulingController.toggleScheduleCompleted);

// Mark schedule complete/incomplete
router.patch('/:id', schedulingController.markScheduleCompleted);

// Get single schedule by id (for verification)
router.get('/:id', schedulingController.getScheduleById);

module.exports = router;


