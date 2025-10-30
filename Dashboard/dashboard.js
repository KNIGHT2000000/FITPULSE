/**
 * Dashboard JavaScript - Handles dynamic goal-based rendering and API interactions
 */

// Global variables
let userProfile = null;
let dashboardStats = null;

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

/**
 * Initialize the dashboard by fetching user data and rendering content
 */
async function initializeDashboard() {
    try {
        // Check if user is authenticated
        const token = localStorage.getItem('authToken');
        if (!token) {
            redirectToLogin();
            return;
        }
        
        // Show loading screen
        showLoading();

        // Load data and update UI
        await fetchUserProfile();
        await fetchDashboardStats();
        
        // Render the dashboard with loaded data
        renderDashboard();
        
        // Setup event listeners
        setupStartButton();
        
        hideLoading();
        showDashboard();

    } catch (error) {
        console.error('Dashboard initialization error:', error);
        showError(error.message || 'Failed to load dashboard');
    }
}

/**
 * Fetch user profile data from API
 */
async function fetchUserProfile() {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch('/api/dashboard/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            redirectToLogin();
            return;
        }
        throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    userProfile = data.data;
}

/**
 * Fetch dashboard statistics from API
 */
async function fetchDashboardStats() {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch('/api/dashboard/stats', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            redirectToLogin();
            return;
        }
        throw new Error('Failed to fetch dashboard stats');
    }

    const data = await response.json();
    dashboardStats = data.data;
}

/**
 * Render the dashboard based on user's goal
 */
function renderDashboard() {
    if (!userProfile) return;

    const { user, profile } = userProfile;
    const goal = profile.goal;

    // Helper function to safely update elements
    const setElementText = (id, text) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    };

    // Update welcome section
    setElementText('welcome-name', user.name);
    setElementText('user-name', user.name);
    
    // Update goal-specific content
    updateGoalContent(goal);
    
    // Update profile modal
    updateProfileModal(user, profile);
    
    // Update statistics
    updateStatistics();
}

/**
 * Update goal-specific content and styling
 */
function updateGoalContent(goal) {
    const heroSection = document.getElementById('hero-section');
    const goalTitle = document.getElementById('goal-title');
    const goalType = document.getElementById('goal-type');
    
    // Helper function to safely update elements
    const setElementText = (element, text) => {
        if (element) element.textContent = text;
    };
    
    // Remove existing goal classes
    if (heroSection) {
        heroSection.classList.remove('weight-loss', 'muscle-gain', 'mental-peace');
    }
    
    switch (goal) {
        case 'Weight Loss':
            if (heroSection) heroSection.classList.add('weight-loss');
            setElementText(goalTitle, 'Weight Loss Journey');
            setElementText(goalType, 'weight loss');
            break;
        case 'Muscle Gain':
            if (heroSection) heroSection.classList.add('muscle-gain');
            setElementText(goalTitle, 'Muscle Building');
            setElementText(goalType, 'muscle gain');
            break;
        case 'Mental Peace':
            if (heroSection) heroSection.classList.add('mental-peace');
            setElementText(goalTitle, 'Mental Wellness');
            setElementText(goalType, 'mental wellness');
            break;
        default:
            setElementText(goalType, 'fitness');
    }
}

/**
 * Update profile modal content
 */
function updateProfileModal(user, profile) {
    const setElementText = (id, text) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    };
    
    setElementText('profile-name', user.name);
    setElementText('profile-email', user.email);
    setElementText('profile-age', user.age ? `${user.age} years old` : 'Not specified');
    setElementText('profile-diet', user.diet_type);
    setElementText('profile-goal', profile.goal);
}

/**
 * Update user info in the UI
 */
function updateUserInfo() {
    if (userProfile && userProfile.user) {
        const setElementText = (id, text) => {
            const element = document.getElementById(id);
            if (element) element.textContent = text;
        };
        
        setElementText('profile-name', userProfile.user.name);
        setElementText('profile-email', userProfile.user.email);
        setElementText('profile-goal', userProfile.profile.goal);
    }
}

/**
 * Update dashboard statistics
 */
function updateStatistics() {
    if (!dashboardStats) return;

    const { summary, calories } = dashboardStats;
    
    // Helper function to safely update elements
    const setElementText = (id, text) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    };
    
    // Calculate today's calories
    const today = new Date().toISOString().split('T')[0];
    console.log('Dashboard - Today\'s date:', today); // Debug log
    console.log('Dashboard - Calories data:', calories); // Debug log
    
    const todayCalories = calories.find(entry => {
        // Convert database datetime to YYYY-MM-DD format
        const entryDate = new Date(entry.entry_date).toISOString().split('T')[0];
        console.log('Dashboard - Comparing dates:', entryDate, 'vs', today); // Debug log
        return entryDate === today;
    });
    
    console.log('Dashboard - Today\'s calories found:', todayCalories); // Debug log
    
    setElementText('calories-today', todayCalories ? todayCalories.daily_calories : '0');
    setElementText('sleep-hours', summary.avg_sleep_hours ? `${summary.avg_sleep_hours}h` : '0h');
    setElementText('completed-activities', summary.completed_activities || '0');
    setElementText('days-tracked', summary.total_days_tracked || '0');
}

/**
 * Show loading screen
 */
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('error').style.display = 'none';
}

/**
 * Hide loading screen
 */
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

/**
 * Show dashboard
 */
function showDashboard() {
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('error').style.display = 'none';
}

/**
 * Show error screen
 */
function showError(message) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('error').style.display = 'flex';
    document.getElementById('error-message').textContent = message;
}

/**
 * Show profile modal
 */
function showProfile() {
    document.getElementById('profile-modal').style.display = 'flex';
}

/**
 * Close profile modal
 */
function closeProfile() {
    document.getElementById('profile-modal').style.display = 'none';
}

/**
 * Open sleep tracker
 */
function openSleepTracker() {
    window.location.href = '/dashboard/sleep-tracker.html';
}

/**
 * Open nutrition tracker
 */
function openNutrition() {
    window.location.href = '/dashboard/calorie-tracker.html';
}

/**
 * Logout user
 */
function logout() {
    // Clear stored data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    
    // Redirect to login
    redirectToLogin();
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
    window.location.href = '/login.html';
}

/**
 * Start fitness journey - navigate to exercise page
 */
function startJourney() {
    window.location.href = '/dashboard/exercise.html';
}

/**
 * Handle main start button click
 */
function setupStartButton() {
    const mainStartBtn = document.getElementById('main-start-btn');
    if (mainStartBtn) {
        mainStartBtn.addEventListener('click', startJourney);
    }
}

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    const modal = document.getElementById('profile-modal');
    if (event.target === modal) {
        closeProfile();
    }
});

// Handle navigation clicks
document.addEventListener('DOMContentLoaded', function() {
    // Activity navigation
    const activityLink = document.querySelector('.activity');
    if (activityLink) {
        activityLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/dashboard/sleep-tracker.html';
        });
    }
    
    // Nutrition navigation
    const nutritionLink = document.querySelector('.nutrition');
    if (nutritionLink) {
        nutritionLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/dashboard/calorie-tracker.html';
        });
    }
});
