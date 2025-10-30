/**
 * Schedule Page JavaScript
 * Handles activity scheduling, calendar view, and notifications
 */

// Global variables
let userProfile = null;
let currentWeek = new Date();
let scheduledActivities = [];
let currentView = 'calendar';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeSchedulePage();
});

/**
 * Initialize the schedule page
 */
async function initializeSchedulePage() {
    try {
        // Check authentication
        const token = localStorage.getItem('authToken');
        if (!token) {
            redirectToLogin();
            return;
        }

        showLoading();

        // Load user profile and activities
        await loadUserProfile();
        await loadScheduledActivities();

        // Initialize UI components
        initializeDateSelector();
        initializeEventListeners();
        renderWeeklyCalendar();
        updateStats();

        hideLoading();
        showMainContent();

    } catch (error) {
        console.error('Schedule page initialization error:', error);
        showError(error.message || 'Failed to load schedule page');
    }
}

/**
 * Load user profile
 */
async function loadUserProfile() {
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch('/api/dashboard/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            userProfile = data.data;
            updateUserInfo();
        }
    } catch (error) {
        console.error('Failed to load user profile:', error);
    }
}

/**
 * Load scheduled activities
 */
async function loadScheduledActivities() {
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch('/api/schedule/activities', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            scheduledActivities = data.data || [];
            console.log('Scheduled activities loaded:', scheduledActivities);
        }
    } catch (error) {
        console.error('Failed to load scheduled activities:', error);
        scheduledActivities = [];
    }
}

/**
 * Initialize date selector
 */
function initializeDateSelector() {
    const today = new Date();
    document.getElementById('activity-date').value = today.toISOString().split('T')[0];
    
    updateWeekDisplay();
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Form submission
    document.getElementById('activity-form').addEventListener('submit', handleActivitySubmission);
    
    // Week navigation
    document.getElementById('prev-week').addEventListener('click', () => navigateWeek(-1));
    document.getElementById('next-week').addEventListener('click', () => navigateWeek(1));
    
    // View toggle
    document.getElementById('list-view').addEventListener('click', () => switchView('list'));
    document.getElementById('calendar-view').addEventListener('click', () => switchView('calendar'));
    
    // Template button
    document.getElementById('template-btn').addEventListener('click', showTemplates);
    
    // Activity type change
    document.getElementById('activity-type').addEventListener('change', handleActivityTypeChange);
}

/**
 * Handle activity form submission
 */
async function handleActivitySubmission(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const activityData = {
        scheduled_date: formData.get('scheduled_date'),
        scheduled_time: formData.get('scheduled_time'),
        activity_type: formData.get('activity_type'),
        activity_details: formData.get('activity_details'),
        notes: formData.get('notes') || ''
    };

    console.log('Submitting activity:', activityData);

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/schedule/activities', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(activityData)
        });
        if (response.ok) {
            const result = await response.json();
            showMessage('Activity scheduled successfully!', 'success');
            
            // Reset form and reload activities
            event.target.reset();
            document.getElementById('activity-date').value = new Date().toISOString().split('T')[0];
            
            await loadScheduledActivities();
            renderWeeklyCalendar();
            updateStats();
        } else {
            const errorData = await response.json();
            showMessage(errorData.message || 'Failed to schedule activity', 'error');
        }
    } catch (error) {
        console.error('Error scheduling activity:', error);
        showMessage('Network error while scheduling activity', 'error');
    }
}

/**
function navigateWeek(direction) {
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    currentWeek = new Date(currentWeek.getTime() + (direction * oneWeek));
    
    updateWeekDisplay();
    renderWeeklyCalendar();
}

/**
 * Update week display
 */
function updateWeekDisplay() {
    const startOfWeek = getStartOfWeek(currentWeek);
    const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    const formatOptions = { month: 'short', day: 'numeric' };
    const startStr = startOfWeek.toLocaleDateString('en-US', formatOptions);
    const endStr = endOfWeek.toLocaleDateString('en-US', formatOptions);
    
    document.getElementById('week-display').textContent = `${startStr} - ${endStr}`;
}

/**
 * Get start of week (Monday)
 */
function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
}

/**
 * Render weekly calendar
 */
function renderWeeklyCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const startOfWeek = getStartOfWeek(currentWeek);
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    let calendarHTML = '<div class="calendar-header">';
    days.forEach(day => {
        calendarHTML += `<div class="day-header">${day}</div>`;
    });
    calendarHTML += '</div>';
    
    // Generate calendar days
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000);
        const dayActivities = getActivitiesForDate(currentDay);
        const isToday = isDateToday(currentDay);
        
        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${currentDay.toISOString().split('T')[0]}">
                <div class="day-number">${currentDay.getDate()}</div>
                <div class="day-activities">
                    ${renderDayActivities(dayActivities)}
                </div>
            </div>
        `;
    }
    
    calendarGrid.innerHTML = calendarHTML;
}

/**
 * Get activities for a specific date
 */
function getActivitiesForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return scheduledActivities.filter(activity => 
        activity.scheduled_date.split('T')[0] === dateStr
    ).sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
}

/**
 * Check if date is today
 */
function isDateToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

/**
 * Render activities for a day
 */
function renderDayActivities(activities) {
    if (activities.length === 0) {
        return '<div class="no-activities">No activities</div>';
    }
    
    return activities.map(activity => {
        const time = activity.scheduled_time.slice(0, 5); // HH:MM format
        const typeIcon = getActivityIcon(activity.activity_type);
        const statusClass = activity.status || 'pending';
        
        return `
            <div class="activity-item ${statusClass}" onclick="showActivityDetails(${activity.schedule_id})">
                <div class="activity-time">${time}</div>
                <div class="activity-info">
                    <i class="${typeIcon}"></i>
                    <span class="activity-name">${activity.activity_details}</span>
                </div>
                <div class="activity-status">
                    ${activity.status === 'completed' ? '<i class="fas fa-check"></i>' : ''}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Get icon for activity type
 */
function getActivityIcon(type) {
    const icons = {
        'Exercise': 'fas fa-dumbbell',
        'Meal': 'fas fa-utensils',
        'Meditation': 'fas fa-om',
        'Sleep': 'fas fa-bed'
    };
    return icons[type] || 'fas fa-calendar-check';
}

/**
 * Switch between calendar and list view
 */
function switchView(view) {
    currentView = view;
    
    // Update button states
    document.getElementById('list-view').classList.toggle('active', view === 'list');
    document.getElementById('calendar-view').classList.toggle('active', view === 'calendar');
    
    // Show/hide containers
    document.getElementById('calendar-container').style.display = view === 'calendar' ? 'block' : 'none';
    document.getElementById('list-container').style.display = view === 'list' ? 'block' : 'none';
    
    if (view === 'list') {
        renderActivitiesList();
    }
}

/**
 * Render activities list view
 */
function renderActivitiesList() {
    const listContainer = document.getElementById('activities-list');
    
    if (scheduledActivities.length === 0) {
        listContainer.innerHTML = `
            <div class="no-activities-message">
                <i class="fas fa-calendar-times"></i>
                <h3>No Activities Scheduled</h3>
                <p>Start by scheduling your first activity above!</p>
            </div>
        `;
        return;
    }
    
    // Group activities by date
    const groupedActivities = {};
    scheduledActivities.forEach(activity => {
        const date = activity.scheduled_date.split('T')[0];
        if (!groupedActivities[date]) {
            groupedActivities[date] = [];
        }
        groupedActivities[date].push(activity);
    });
    
    let listHTML = '';
    Object.keys(groupedActivities).sort().forEach(date => {
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        listHTML += `
            <div class="date-group">
                <h3 class="date-header">${formattedDate}</h3>
                <div class="activities-for-date">
                    ${groupedActivities[date].map(activity => `
                        <div class="list-activity-item ${activity.status || 'pending'}" onclick="showActivityDetails(${activity.schedule_id})">
                            <div class="activity-icon">
                                <i class="${getActivityIcon(activity.activity_type)}"></i>
                            </div>
                            <div class="activity-content">
                                <div class="activity-title">${activity.activity_details}</div>
                                <div class="activity-meta">
                                    <span class="activity-time">${activity.scheduled_time.slice(0, 5)}</span>
                                    <span class="activity-type">${activity.activity_type}</span>
                                    ${activity.notes ? `<span class="activity-notes">${activity.notes}</span>` : ''}
                                </div>
                            </div>
                            <div class="activity-actions">
                                ${activity.status !== 'completed' ? 
                                    `<button class="complete-btn" onclick="event.stopPropagation(); markAsCompleted(${activity.schedule_id})">
                                        <i class="fas fa-check"></i>
                                    </button>` : 
                                    '<i class="fas fa-check-circle completed-icon"></i>'
                                }
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    listContainer.innerHTML = listHTML;
}

/**
 * Show activity templates
 */
function showTemplates() {
    if (!userProfile) return;
    
    const goal = userProfile.profile.goal;
    const templates = getTemplatesForGoal(goal);
    
    const templatesGrid = document.getElementById('templates-grid');
    templatesGrid.innerHTML = templates.map(template => `
        <div class="template-card" onclick="useTemplate('${template.type}', '${template.details}', '${template.time}')">
            <div class="template-icon">
                <i class="${getActivityIcon(template.type)}"></i>
            </div>
            <div class="template-info">
                <h4>${template.details}</h4>
                <p>${template.type} • ${template.time}</p>
                <small>${template.description}</small>
            </div>
        </div>
    `).join('');
    
    document.getElementById('templates-modal').style.display = 'flex';
}

/**
 * Get templates based on user goal
 */
function getTemplatesForGoal(goal) {
    const templates = {
        'Weight Loss': [
            { type: 'Exercise', details: 'Morning Cardio', time: '07:00', description: 'High-intensity cardio session' },
            { type: 'Meal', details: 'Healthy Breakfast', time: '08:00', description: 'Protein-rich breakfast' },
            { type: 'Exercise', details: 'Evening Walk', time: '18:00', description: 'Light cardio for fat burning' },
            { type: 'Meal', details: 'Light Dinner', time: '19:00', description: 'Low-calorie dinner' }
        ],
        'Muscle Gain': [
            { type: 'Exercise', details: 'Strength Training', time: '08:00', description: 'Weight lifting session' },
            { type: 'Meal', details: 'Protein Breakfast', time: '09:00', description: 'High-protein meal' },
            { type: 'Meal', details: 'Post-Workout Meal', time: '10:00', description: 'Recovery nutrition' },
            { type: 'Exercise', details: 'Evening Workout', time: '17:00', description: 'Muscle building exercises' }
        ],
        'Mental Peace': [
            { type: 'Meditation', details: 'Morning Meditation', time: '06:30', description: 'Start day with mindfulness' },
            { type: 'Exercise', details: 'Yoga Session', time: '07:30', description: 'Gentle yoga practice' },
            { type: 'Meditation', details: 'Breathing Exercise', time: '12:00', description: 'Midday stress relief' },
            { type: 'Meditation', details: 'Evening Relaxation', time: '20:00', description: 'Wind down meditation' }
        ]
    };
    
    return templates[goal] || templates['Weight Loss'];
}

/**
 * Use template to fill form
 */
function useTemplate(type, details, time) {
    document.getElementById('activity-type').value = type;
    document.getElementById('activity-details').value = details;
    document.getElementById('activity-time').value = time;
    
    closeTemplates();
    
    // Scroll to form
    document.getElementById('activity-form').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Handle activity type change
 */
function handleActivityTypeChange(event) {
    const type = event.target.value;
    const detailsInput = document.getElementById('activity-details');
    
    // Provide suggestions based on type
    const suggestions = {
        'Exercise': 'Morning Run, Gym Workout, Yoga Session, Strength Training',
        'Meal': 'Breakfast, Lunch, Dinner, Healthy Snack, Post-Workout Meal',
        'Meditation': 'Morning Meditation, Breathing Exercise, Mindfulness Session'
    };
    
    if (suggestions[type]) {
        detailsInput.placeholder = `e.g., ${suggestions[type]}`;
    }
}

/**
 * Mark activity as completed
 */
async function markAsCompleted(scheduleId) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/schedule/activities/${scheduleId}/complete`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showMessage('Activity marked as completed!', 'success');
            await loadScheduledActivities();
            
            if (currentView === 'calendar') {
                renderWeeklyCalendar();
            } else {
                renderActivitiesList();
            }
            
            updateStats();
        } else {
            showMessage('Failed to update activity status', 'error');
        }
    } catch (error) {
        console.error('Error marking activity as completed:', error);
        showMessage('Network error', 'error');
    }
}

/**
 * Show activity details
 */
function showActivityDetails(scheduleId) {
    const activity = scheduledActivities.find(a => a.schedule_id === scheduleId);
    if (!activity) return;
    
    const detailsContent = document.getElementById('activity-details-content');
    const activityDate = new Date(activity.scheduled_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    detailsContent.innerHTML = `
        <div class="activity-detail-header">
            <div class="activity-detail-icon">
                <i class="${getActivityIcon(activity.activity_type)}"></i>
            </div>
            <div class="activity-detail-info">
                <h3>${activity.activity_details}</h3>
                <p class="activity-detail-meta">
                    ${activity.activity_type} • ${activityDate} • ${activity.scheduled_time.slice(0, 5)}
                </p>
            </div>
            <div class="activity-status-badge ${activity.status || 'pending'}">
                ${activity.status || 'pending'}
            </div>
        </div>
        
        ${activity.notes ? `
            <div class="activity-notes-section">
                <h4>Notes</h4>
                <p>${activity.notes}</p>
            </div>
        ` : ''}
        
        <div class="activity-actions-section">
            ${activity.status !== 'completed' ? `
                <button class="btn-primary" onclick="markAsCompleted(${activity.schedule_id})">
                    <i class="fas fa-check"></i> Mark as Completed
                </button>
            ` : `
                <div class="completed-message">
                    <i class="fas fa-check-circle"></i> Activity Completed
                </div>
            `}
            <button class="btn-secondary" onclick="deleteActivity(${activity.schedule_id})">
                <i class="fas fa-trash"></i> Delete Activity
            </button>
        </div>
    `;
    
    document.getElementById('activity-modal').style.display = 'flex';
}

/**
 * Delete activity
 */
async function deleteActivity(scheduleId) {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/schedule/activities/${scheduleId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showMessage('Activity deleted successfully', 'success');
            closeActivityModal();
            await loadScheduledActivities();
            
            if (currentView === 'calendar') {
                renderWeeklyCalendar();
            } else {
                renderActivitiesList();
            }
            
            updateStats();
        } else {
            showMessage('Failed to delete activity', 'error');
        }
    } catch (error) {
        console.error('Error deleting activity:', error);
        showMessage('Network error', 'error');
    }
}

/**
 * Update statistics
 */
function updateStats() {
    const now = new Date();
    const startOfWeek = getStartOfWeek(now);
    const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    // Filter activities for current week
    const weekActivities = scheduledActivities.filter(activity => {
        const activityDate = new Date(activity.scheduled_date);
        return activityDate >= startOfWeek && activityDate <= endOfWeek;
    });
    
    const completedActivities = weekActivities.filter(a => a.status === 'completed');
    const completionRate = weekActivities.length > 0 ? 
        Math.round((completedActivities.length / weekActivities.length) * 100) : 0;
    
    // Update UI
    document.getElementById('scheduled-activities').textContent = weekActivities.length;
    document.getElementById('completed-activities').textContent = completedActivities.length;
    document.getElementById('completion-rate').textContent = `${completionRate}% completion rate`;
    document.getElementById('completion-progress').style.width = `${completionRate}%`;
    
    // Calculate streak (simplified - consecutive days with completed activities)
    const streak = calculateStreak();
    document.getElementById('streak-count').textContent = streak;
    
    // Find next activity
    const upcomingActivities = scheduledActivities
        .filter(activity => {
            const activityDateTime = new Date(`${activity.scheduled_date.split('T')[0]}T${activity.scheduled_time}`);
            return activityDateTime > now && activity.status !== 'completed';
        })
        .sort((a, b) => {
            const dateTimeA = new Date(`${a.scheduled_date.split('T')[0]}T${a.scheduled_time}`);
            const dateTimeB = new Date(`${b.scheduled_date.split('T')[0]}T${b.scheduled_time}`);
            return dateTimeA - dateTimeB;
        });
    
    if (upcomingActivities.length > 0) {
        const nextActivity = upcomingActivities[0];
        document.getElementById('next-activity').textContent = nextActivity.scheduled_time.slice(0, 5);
        document.getElementById('next-activity-name').textContent = nextActivity.activity_details;
    } else {
        document.getElementById('next-activity').textContent = '--:--';
        document.getElementById('next-activity-name').textContent = 'No upcoming activities';
    }
}

/**
 * Calculate streak (simplified version)
 */
function calculateStreak() {
    // This is a simplified streak calculation
    // In a real app, you'd want more sophisticated logic
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
        const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const dayActivities = scheduledActivities.filter(activity => 
            activity.scheduled_date.split('T')[0] === dateStr &&
            activity.status === 'completed'
        );
        
        if (dayActivities.length > 0) {
            streak++;
        } else if (i > 0) { // Don't break on today if no activities yet
            break;
        }
    }
    
    return streak;
}

/**
 * Update user info
 */
function updateUserInfo() {
    if (userProfile) {
        document.getElementById('user-name').textContent = userProfile.user.name;
        document.getElementById('profile-name').textContent = userProfile.user.name;
        document.getElementById('profile-email').textContent = userProfile.user.email;
        document.getElementById('profile-goal').textContent = userProfile.profile.goal;
    }
}

/**
 * UI Helper Functions
 */
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showMainContent() {
    document.getElementById('main-content').style.display = 'block';
}

function showError(message) {
    hideLoading();
    showMessage(message, 'error');
}

function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="close-message">×</button>
    `;
    
    container.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}

/**
 * Modal Functions
 */
function showProfile() {
    document.getElementById('profile-modal').style.display = 'flex';
}

function closeProfile() {
    document.getElementById('profile-modal').style.display = 'none';
}

function closeTemplates() {
    document.getElementById('templates-modal').style.display = 'none';
}

function closeActivityModal() {
    document.getElementById('activity-modal').style.display = 'none';
}

/**
 * Authentication Functions
 */
function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
}

function redirectToLogin() {
    window.location.href = '/login.html';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};
