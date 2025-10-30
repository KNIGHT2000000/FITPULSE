/**
 * Sleep Tracker JavaScript
 * Handles sleep tracking functionality with API integration
 */

// Global variables
let currentDate = new Date().toISOString().split('T')[0];
let sleepEntries = [];
let userProfile = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeSleepTracker();
});

/**
 * Initialize the sleep tracker
 */
async function initializeSleepTracker() {
    try {
        // Check authentication
        const token = localStorage.getItem('authToken');
        if (!token) {
            redirectToLogin();
            return;
        }

        showLoading();
        
        // Set current date
        document.getElementById('selected-date').value = currentDate;
        document.getElementById('sleep-date').value = currentDate;
        
        // Setup event listeners
        setupEventListeners();
        
        // Load user profile and data
        await loadUserProfile();
        await loadSleepData();
        
        hideLoading();
        
    } catch (error) {
        console.error('Initialization error:', error);
        showMessage('Failed to load sleep tracker', 'error');
        hideLoading();
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Date navigation
    document.getElementById('prev-date').addEventListener('click', () => changeDate(-1));
    document.getElementById('next-date').addEventListener('click', () => changeDate(1));
    document.getElementById('selected-date').addEventListener('change', onDateChange);
    
    // Form submission
    document.getElementById('sleep-form').addEventListener('submit', handleSleepSubmission);
    
    // Time inputs for duration calculation
    document.getElementById('start-time').addEventListener('change', calculateDuration);
    document.getElementById('end-time').addEventListener('change', calculateDuration);
    
    // Quality selector
    document.querySelectorAll('.quality-option').forEach(option => {
        option.addEventListener('click', selectQuality);
    });
    
    // Quick sleep
    document.getElementById('quick-sleep-btn').addEventListener('click', openQuickSleep);
    
    // Period filter
    document.getElementById('period-filter').addEventListener('change', loadSleepData);
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
 * Update user info in the UI
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
 * Load sleep data
 */
async function loadSleepData() {
    const token = localStorage.getItem('authToken');
    const period = document.getElementById('period-filter').value;
    console.log('Loading sleep data for period:', period); // Debug log
    
    try {
        // Get sleep data from the dashboard stats endpoint
        const response = await fetch(`/api/dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Sleep tracker API response:', data); // Debug log
            sleepEntries = data.data.sleep || [];
            console.log('Sleep entries:', sleepEntries); // Debug log
            updateSleepSummary();
            displaySleepEntries();
            updateInsights();
        } else {
            console.error('Failed to fetch sleep data:', response.status, response.statusText);
            sleepEntries = [];
            updateSleepSummary();
            displaySleepEntries();
            updateInsights();
        }
    } catch (error) {
        console.error('Failed to load sleep data:', error);
        sleepEntries = [];
        updateSleepSummary();
        displaySleepEntries();
        updateInsights();
    }
}

/**
 * Update sleep summary for current date
 */
function updateSleepSummary() {
    const todayEntry = sleepEntries.find(entry => {
        // Convert database datetime to YYYY-MM-DD format
        const entryDate = new Date(entry.sleep_date).toISOString().split('T')[0];
        return entryDate === currentDate;
    });
    
    if (todayEntry) {
        // Update duration
        const hours = Math.floor(todayEntry.duration_minutes / 60);
        const minutes = todayEntry.duration_minutes % 60;
        document.getElementById('sleep-duration').textContent = `${hours}h ${minutes}m`;
        
        // Update progress bar (goal: 8 hours = 480 minutes)
        const percentage = Math.min((todayEntry.duration_minutes / 480) * 100, 100);
        document.getElementById('duration-progress').style.width = `${percentage}%`;
        
        // Update quality
        document.getElementById('sleep-quality').textContent = todayEntry.quality_rating || '-';
        updateQualityStars(todayEntry.quality_rating);
        
        // Update times
        document.getElementById('bedtime').textContent = formatTime(todayEntry.start_time);
        document.getElementById('wake-time').textContent = formatTime(todayEntry.end_time);
        
    } else {
        // No data for today
        document.getElementById('sleep-duration').textContent = '0h 0m';
        document.getElementById('duration-progress').style.width = '0%';
        document.getElementById('sleep-quality').textContent = '-';
        document.getElementById('bedtime').textContent = '--:--';
        document.getElementById('wake-time').textContent = '--:--';
        updateQualityStars(null);
    }
}

/**
 * Update quality stars display
 */
function updateQualityStars(quality) {
    const starsContainer = document.getElementById('quality-stars');
    const qualityText = document.getElementById('quality-text');
    
    let stars = 0;
    switch (quality) {
        case 'Poor': stars = 1; break;
        case 'Fair': stars = 2; break;
        case 'Good': stars = 3; break;
        case 'Excellent': stars = 4; break;
        default: stars = 0;
    }
    
    starsContainer.innerHTML = '';
    for (let i = 1; i <= 4; i++) {
        const star = document.createElement('i');
        star.className = i <= stars ? 'fas fa-star' : 'far fa-star';
        starsContainer.appendChild(star);
    }
    
    qualityText.textContent = quality || 'No data';
}

/**
 * Display sleep entries
 */
function displaySleepEntries() {
    const container = document.getElementById('entries-container');
    
    if (sleepEntries.length === 0) {
        container.innerHTML = `
            <div class="no-entries">
                <i class="fas fa-moon"></i>
                <p>No sleep entries recorded</p>
                <small>Start logging your sleep to track patterns!</small>
            </div>
        `;
        return;
    }

    container.innerHTML = sleepEntries.map(entry => {
        const hours = Math.floor(entry.duration_minutes / 60);
        const minutes = entry.duration_minutes % 60;
        
        return `
            <div class="entry-item">
                <div class="entry-info">
                    <h4>${formatDate(new Date(entry.sleep_date).toISOString().split('T')[0])}</h4>
                    <p><strong>${hours}h ${minutes}m</strong> sleep</p>
                    <div class="entry-meta">
                        <span><i class="fas fa-bed"></i> ${formatTime(entry.start_time)} - ${formatTime(entry.end_time)}</span>
                        <span><i class="fas fa-star"></i> ${entry.quality_rating || 'Not rated'}</span>
                        ${entry.notes ? `<span><i class="fas fa-sticky-note"></i> Has notes</span>` : ''}
                    </div>
                </div>
                <div class="entry-actions">
                    <button class="edit-btn" onclick="editSleepEntry('${entry.sleep_date}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteSleepEntry('${entry.sleep_date}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Update insights section
 */
function updateInsights() {
    if (sleepEntries.length === 0) {
        document.getElementById('weekly-average').textContent = '0h 0m';
        document.getElementById('sleep-debt').textContent = '0h 0m';
        document.getElementById('best-sleep-day').textContent = '-';
        document.getElementById('sleep-consistency').textContent = '-%';
        return;
    }
    
    // Calculate weekly average
    const totalMinutes = sleepEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0);
    const avgMinutes = totalMinutes / sleepEntries.length;
    const avgHours = Math.floor(avgMinutes / 60);
    const avgMins = Math.round(avgMinutes % 60);
    document.getElementById('weekly-average').textContent = `${avgHours}h ${avgMins}m`;
    
    // Calculate sleep debt (assuming 8h goal)
    const goalMinutes = 8 * 60;
    const debtMinutes = Math.max(0, (goalMinutes * sleepEntries.length) - totalMinutes);
    const debtHours = Math.floor(debtMinutes / 60);
    const debtMins = Math.round(debtMinutes % 60);
    document.getElementById('sleep-debt').textContent = `${debtHours}h ${debtMins}m`;
    
    // Find best sleep day
    const bestEntry = sleepEntries.reduce((best, entry) => {
        const qualityScore = getQualityScore(entry.quality_rating);
        const bestScore = getQualityScore(best.quality_rating);
        return qualityScore > bestScore ? entry : best;
    });
    document.getElementById('best-sleep-day').textContent = formatDate(new Date(bestEntry.sleep_date).toISOString().split('T')[0]);
    
    // Calculate consistency (placeholder)
    document.getElementById('sleep-consistency').textContent = '85%';
}

/**
 * Get numeric score for quality rating
 */
function getQualityScore(quality) {
    switch (quality) {
        case 'Poor': return 1;
        case 'Fair': return 2;
        case 'Good': return 3;
        case 'Excellent': return 4;
        default: return 0;
    }
}

/**
 * Handle sleep form submission
 */
async function handleSleepSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const startTime = formData.get('start_time');
    const endTime = formData.get('end_time');
    const quality = formData.get('quality_rating');
    
    if (!quality) {
        showMessage('Please select a sleep quality rating', 'error');
        return;
    }
    
    const duration = calculateDurationMinutes(startTime, endTime);
    
    const sleepData = {
        sleep_date: formData.get('sleep_date'),
        start_time: startTime,
        end_time: endTime,
        duration_minutes: duration,
        quality_rating: quality,
        notes: formData.get('notes') || null
    };

    try {
        console.log('Submitting sleep data:', sleepData); // Debug log
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/track/sleep', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sleepData)
        });

        console.log('Sleep submission response status:', response.status); // Debug log

        if (response.ok) {
            const result = await response.json();
            console.log('Sleep submission result:', result); // Debug log
            showMessage('Sleep entry logged successfully!', 'success');
            e.target.reset();
            document.querySelectorAll('.quality-option').forEach(opt => opt.classList.remove('selected'));
            document.getElementById('duration-display').textContent = 'Calculate duration by selecting times';
            await loadSleepData();
        } else {
            const error = await response.json();
            console.error('Sleep submission error:', error); // Debug log
            showMessage(error.message || 'Failed to log sleep entry', 'error');
        }
    } catch (error) {
        console.error('Error logging sleep entry:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

/**
 * Calculate duration between two times
 */
function calculateDuration() {
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    
    if (startTime && endTime) {
        const duration = calculateDurationMinutes(startTime, endTime);
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        document.getElementById('duration-display').textContent = `${hours}h ${minutes}m`;
    }
}

/**
 * Calculate duration in minutes between two time strings
 */
function calculateDurationMinutes(startTime, endTime) {
    const start = new Date(`2000-01-01 ${startTime}`);
    let end = new Date(`2000-01-01 ${endTime}`);
    
    // If end time is earlier than start time, assume it's the next day
    if (end < start) {
        end = new Date(`2000-01-02 ${endTime}`);
    }
    
    return Math.round((end - start) / (1000 * 60));
}

/**
 * Select quality rating
 */
function selectQuality(e) {
    document.querySelectorAll('.quality-option').forEach(opt => opt.classList.remove('selected'));
    e.currentTarget.classList.add('selected');
    document.getElementById('quality-rating').value = e.currentTarget.dataset.quality;
}

/**
 * Change date
 */
function changeDate(days) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    currentDate = date.toISOString().split('T')[0];
    document.getElementById('selected-date').value = currentDate;
    updateSleepSummary();
}

/**
 * Handle date change
 */
function onDateChange(e) {
    currentDate = e.target.value;
    updateSleepSummary();
}

/**
 * Open quick sleep modal
 */
function openQuickSleep() {
    document.getElementById('quick-sleep-modal').style.display = 'flex';
}

/**
 * Close quick sleep modal
 */
function closeQuickSleep() {
    document.getElementById('quick-sleep-modal').style.display = 'none';
}

/**
 * Quick sleep entry
 */
function quickSleep(hours) {
    const now = new Date();
    const wakeTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const bedtime = new Date(now.getTime() - (hours * 60 * 60 * 1000));
    const bedtimeStr = `${bedtime.getHours().toString().padStart(2, '0')}:${bedtime.getMinutes().toString().padStart(2, '0')}`;
    
    document.getElementById('start-time').value = bedtimeStr;
    document.getElementById('end-time').value = wakeTime;
    calculateDuration();
    
    closeQuickSleep();
    showMessage(`Set ${hours} hours of sleep. Please review and submit.`, 'info');
}

/**
 * Edit sleep entry (placeholder)
 */
function editSleepEntry(date) {
    showMessage('Edit functionality will be available soon!', 'warning');
}

/**
 * Delete sleep entry (placeholder)
 */
function deleteSleepEntry(date) {
    if (confirm('Are you sure you want to delete this sleep entry?')) {
        showMessage('Delete functionality will be available soon!', 'warning');
    }
}

/**
 * Format time string
 */
function formatTime(timeString) {
    if (!timeString) return '--:--';
    return timeString.substring(0, 5);
}

/**
 * Format date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    });
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
 * Logout user
 */
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    redirectToLogin();
}

/**
 * Redirect to login
 */
function redirectToLogin() {
    window.location.href = '/login.html';
}

/**
 * Show loading
 */
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('main-content').style.display = 'none';
}

/**
 * Hide loading
 */
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
}

/**
 * Show message
 */
function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    container.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const quickModal = document.getElementById('quick-sleep-modal');
    const profileModal = document.getElementById('profile-modal');
    
    if (event.target === quickModal) {
        closeQuickSleep();
    }
    if (event.target === profileModal) {
        closeProfile();
    }
});
