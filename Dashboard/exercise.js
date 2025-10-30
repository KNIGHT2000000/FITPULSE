/**
 * Exercise Page JavaScript
 * Handles exercise dashboard functionality with API integration
 */

// Global variables
let exerciseData = null;
let userProfile = null;
let currentYouTubeUrl = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeExercisePage();
});

/**
 * Initialize the exercise page
 */
async function initializeExercisePage() {
    try {
        // Check authentication
        const token = localStorage.getItem('authToken');
        if (!token) {
            redirectToLogin();
            return;
        }

        showLoading();
        
        // Load user profile and exercise data
        await Promise.all([
            loadUserProfile(),
            loadExerciseData()
        ]);
        
        hideLoading();
        
    } catch (error) {
        console.error('Initialization error:', error);
        showMessage('Failed to load exercise page', 'error');
        hideLoading();
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
 * Load exercise data and learning module
 */
async function loadExerciseData() {
    const token = localStorage.getItem('authToken');
    
    try {
        const response = await fetch('/api/exercises/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            exerciseData = data.data;
            console.log('Exercise data loaded:', exerciseData); // Debug log
            
            updateHeroSection();
            updateLearningModule();
            updateExercisesGrid();
        } else {
            console.error('Failed to load exercise data:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            
            // Show error message and fallback
            showMessage(`Failed to load exercise data: ${response.status}`, 'error');
            showNoDataFallback();
        }
    } catch (error) {
        console.error('Failed to load exercise data:', error);
        showMessage('Network error loading exercises', 'error');
        showNoDataFallback();
    }
}

/**
 * Show fallback when no data is available
 */
function showNoDataFallback() {
    // Update hero with default values
    document.getElementById('current-goal').textContent = 'Loading...';
    document.getElementById('total-exercises').textContent = '0';
    document.getElementById('estimated-calories').textContent = '0';
    document.getElementById('total-duration').textContent = '0';
    
    // Show no data message for learning
    document.getElementById('learning-title').textContent = 'Learning Module';
    document.getElementById('learning-content').textContent = 'No learning content available. Please populate the database first.';
    
    // Show no data message for exercises
    const grid = document.getElementById('exercises-grid');
    grid.innerHTML = `
        <div class="exercise-placeholder" style="grid-column: 1 / -1;">
            <i class="fas fa-database" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
            <p>No exercises found in database</p>
            <p><small>Click the button below to populate sample data</small></p>
            <button class="btn-primary" onclick="populateDatabase()" style="margin-top: 15px;">
                <i class="fas fa-plus"></i> Populate Sample Data
            </button>
        </div>
    `;
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
 * Update hero section based on goal and exercise data
 */
function updateHeroSection() {
    if (!exerciseData) return;
    
    const { goal, exercises } = exerciseData;
    const heroSection = document.getElementById('exercise-hero');
    
    // Remove existing goal classes
    heroSection.classList.remove('weight-loss', 'muscle-gain', 'mental-peace');
    
    // Update content based on goal
    switch (goal) {
        case 'Weight Loss':
            heroSection.classList.add('weight-loss');
            document.getElementById('goal-title').textContent = 'Weight Loss Training';
            document.getElementById('goal-description').textContent = 'Burn calories and shed pounds with targeted exercises';
            break;
        case 'Muscle Gain':
            heroSection.classList.add('muscle-gain');
            document.getElementById('goal-title').textContent = 'Muscle Building Program';
            document.getElementById('goal-description').textContent = 'Build strength and muscle mass with focused workouts';
            break;
        case 'Mental Peace':
            heroSection.classList.add('mental-peace');
            document.getElementById('goal-title').textContent = 'Mindfulness & Wellness';
            document.getElementById('goal-description').textContent = 'Find inner peace through mindful movement and meditation';
            break;
    }
    
    document.getElementById('current-goal').textContent = goal;
    
    // Update stats with default values since these columns don't exist in your DB
    const totalExercises = exercises.length;
    const totalCalories = exercises.length * 150; // Default 150 calories per exercise
    const totalDuration = exercises.length * 30;  // Default 30 minutes per exercise
    
    document.getElementById('total-exercises').textContent = totalExercises;
    document.getElementById('estimated-calories').textContent = totalCalories;
    document.getElementById('total-duration').textContent = totalDuration;
}

/**
 * Update learning module section
 */
function updateLearningModule() {
    if (!exerciseData || !exerciseData.learningModule) return;
    
    const { learningModule, goal } = exerciseData;
    
    document.getElementById('learning-title').textContent = learningModule.title;
    document.getElementById('learning-content').textContent = learningModule.content;
    
    // Update learning icon based on goal
    const learningIcon = document.getElementById('learning-icon');
    switch (goal) {
        case 'Weight Loss':
            learningIcon.innerHTML = '<i class="fas fa-weight"></i>';
            break;
        case 'Muscle Gain':
            learningIcon.innerHTML = '<i class="fas fa-dumbbell"></i>';
            break;
        case 'Mental Peace':
            learningIcon.innerHTML = '<i class="fas fa-lotus"></i>';
            break;
        default:
            learningIcon.innerHTML = '<i class="fas fa-book-open"></i>';
    }
}

/**
 * Update exercises grid
 */
function updateExercisesGrid() {
    if (!exerciseData || !exerciseData.exercises) return;
    
    const { exercises } = exerciseData;
    const grid = document.getElementById('exercises-grid');
    
    if (exercises.length === 0) {
        grid.innerHTML = `
            <div class="exercise-placeholder">
                <i class="fas fa-dumbbell" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <p>No exercises found for your goal</p>
                <p><small>Please check back later or contact support</small></p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = exercises.map((exercise, index) => `
        <div class="exercise-card" onclick="openExerciseModal(${index})">
            <div class="exercise-image">
                <img src="${exercise.image_url || getPlaceholderImage(exercise.focus_area)}" 
                     alt="${exercise.name}" 
                     onerror="this.src='${getPlaceholderImage(exercise.focus_area)}'">
                <div class="exercise-overlay">
                    <span class="exercise-badge difficulty">${exercise.difficulty || 'Beginner'}</span>
                    <span class="exercise-badge focus">${exercise.focus_area || 'General'}</span>
                </div>
            </div>
            <div class="exercise-info">
                <h3>${exercise.name}</h3>
                <p class="exercise-description">${exercise.description || 'A great exercise for your fitness goals.'}</p>
                <div class="exercise-stats">
                    <div class="exercise-stat">
                        <i class="fas fa-clock"></i>
                        <span>30 min</span>
                    </div>
                    <div class="exercise-stat">
                        <i class="fas fa-fire"></i>
                        <span>150 cal</span>
                    </div>
                </div>
                <div class="exercise-actions">
                    <button class="btn-primary" onclick="event.stopPropagation(); startExercise(${index})">
                        <i class="fas fa-play"></i> Start
                    </button>
                    <button class="btn-secondary" onclick="event.stopPropagation(); scheduleExercise(${index})">
                        <i class="fas fa-calendar-plus"></i> Schedule
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Generate YouTube search URL based on exercise name and focus area
 */
function generateYouTubeUrl(exerciseName, focusArea) {
    console.log('Generating YouTube URL for:', exerciseName, focusArea); // Debug log
    
    if (!exerciseName) {
        console.warn('Exercise name is missing for YouTube URL generation');
        return null;
    }
    
    // Create search query combining exercise name and focus area
    const searchQuery = `${exerciseName} ${focusArea || 'workout'} tutorial`;
    const encodedQuery = encodeURIComponent(searchQuery);
    
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`;
    console.log('Generated YouTube URL:', youtubeUrl); // Debug log
    
    return youtubeUrl;
}

/**
 * Get placeholder image based on focus area
 */
function getPlaceholderImage(focusArea) {
    const placeholders = {
        'Cardio': 'https://via.placeholder.com/400x200/ff6b6b/ffffff?text=Cardio+Exercise',
        'Upper Body': 'https://via.placeholder.com/400x200/26de81/ffffff?text=Upper+Body',
        'Lower Body': 'https://via.placeholder.com/400x200/667eea/ffffff?text=Lower+Body',
        'Meditation': 'https://via.placeholder.com/400x200/a55eea/ffffff?text=Meditation',
        'Yoga': 'https://via.placeholder.com/400x200/fed330/ffffff?text=Yoga',
        'Strength': 'https://via.placeholder.com/400x200/fd79a8/ffffff?text=Strength'
    };
    
    return placeholders[focusArea] || 'https://via.placeholder.com/400x200/95a5a6/ffffff?text=Exercise';
}

/**
 * Open exercise detail modal
 */
function openExerciseModal(index) {
    if (!exerciseData || !exerciseData.exercises[index]) return;
    
    const exercise = exerciseData.exercises[index];
    
    // Update modal content
    document.getElementById('modal-exercise-name').textContent = exercise.name;
    document.getElementById('modal-difficulty').textContent = exercise.difficulty || 'Beginner';
    document.getElementById('modal-focus').textContent = exercise.focus_area || 'General';
    document.getElementById('modal-duration').textContent = '30 min';
    document.getElementById('modal-calories').textContent = '150 cal';
    document.getElementById('modal-description').textContent = exercise.description || 'A great exercise for your fitness goals.';
    
    // Update image
    const modalImage = document.getElementById('modal-exercise-image');
    modalImage.src = exercise.image_url || getPlaceholderImage(exercise.focus_area);
    modalImage.onerror = () => modalImage.src = getPlaceholderImage(exercise.focus_area);
    
    // Update YouTube section - Generate URL based on exercise name
    const youtubeBtn = document.getElementById('youtube-btn');
    const videoContainer = document.getElementById('video-container');
    
    console.log('Modal opening for exercise:', exercise.name, exercise.focus_area); // Debug log
    
    // Generate YouTube search URL based on exercise name
    const youtubeUrl = generateYouTubeUrl(exercise.name, exercise.focus_area);
    
    if (youtubeUrl) {
        currentYouTubeUrl = youtubeUrl;
        console.log('YouTube URL set to:', currentYouTubeUrl); // Debug log
        
        if (youtubeBtn) youtubeBtn.style.display = 'inline-flex';
        if (videoContainer) {
            videoContainer.innerHTML = `
                <i class="fab fa-youtube"></i>
                <p>Video tutorial available</p>
                <button class="btn-youtube" onclick="openYouTube()">
                    <i class="fab fa-youtube"></i> Watch on YouTube
                </button>
            `;
        }
    } else {
        currentYouTubeUrl = null;
        console.log('No YouTube URL generated'); // Debug log
        
        if (youtubeBtn) youtubeBtn.style.display = 'none';
        if (videoContainer) {
            videoContainer.innerHTML = `
                <i class="fab fa-youtube"></i>
                <p>YouTube tutorial will be available soon</p>
                <small>Search for "${exercise.name || 'this exercise'}" tutorials on YouTube</small>
            `;
        }
    }
    
    // Store current exercise index for actions
    window.currentExerciseIndex = index;
    
    // Show modal
    document.getElementById('exercise-modal').style.display = 'flex';
}

/**
 * Close exercise modal
 */
function closeExerciseModal() {
    document.getElementById('exercise-modal').style.display = 'none';
    window.currentExerciseIndex = null;
    currentYouTubeUrl = null;
}

/**
 * Open YouTube video
 */
function openYouTube() {
    console.log('Opening YouTube URL:', currentYouTubeUrl); // Debug log
    
    if (currentYouTubeUrl) {
        try {
            // Validate URL before opening
            if (currentYouTubeUrl.startsWith('https://www.youtube.com/')) {
                window.open(currentYouTubeUrl, '_blank');
            } else {
                console.error('Invalid YouTube URL format:', currentYouTubeUrl);
                // Fallback to basic YouTube search
                const fallbackUrl = 'https://www.youtube.com/results?search_query=workout+tutorial';
                window.open(fallbackUrl, '_blank');
            }
        } catch (error) {
            console.error('Error opening YouTube URL:', error);
            showMessage('Failed to open YouTube video', 'error');
        }
    } else {
        console.warn('No YouTube URL available');
        // Open general workout search as fallback
        const fallbackUrl = 'https://www.youtube.com/results?search_query=workout+tutorial';
        window.open(fallbackUrl, '_blank');
    }
}

/**
 * Expand learning module
 */
function expandLearning() {
    if (!exerciseData || !exerciseData.learningModule) return;
    
    const { learningModule, goal } = exerciseData;
    
    document.getElementById('modal-learning-title').textContent = learningModule.title;
    document.getElementById('modal-goal-name').textContent = goal;
    document.getElementById('modal-learning-content').innerHTML = formatLearningContent(learningModule.content);
    
    document.getElementById('learning-modal').style.display = 'flex';
}

/**
 * Close learning modal
 */
function closeLearningModal() {
    document.getElementById('learning-modal').style.display = 'none';
}

/**
 * Format learning content for better display
 */
function formatLearningContent(content) {
    // Split content into paragraphs and format
    return content.split('\n').map(paragraph => 
        paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ''
    ).join('');
}

/**
 * Mark learning module as read
 */
function markAsRead() {
    showMessage('Learning module marked as completed!', 'success');
    closeLearningModal();
}

/**
 * Start specific exercise
 */
function startExercise(index) {
    if (!exerciseData || !exerciseData.exercises[index]) return;
    
    const exercise = exerciseData.exercises[index];
    showMessage(`Starting ${exercise.name}! Good luck with your workout!`, 'success');
    
    // TODO: Implement exercise timer/tracker
    console.log('Starting exercise:', exercise);
}

/**
 * Start this exercise (from modal)
 */
function startThisExercise() {
    if (window.currentExerciseIndex !== null) {
        startExercise(window.currentExerciseIndex);
        closeExerciseModal();
    }
}

/**
 * Schedule specific exercise
 */
function scheduleExercise(index) {
    if (!exerciseData || !exerciseData.exercises[index]) return;
    
    const exercise = exerciseData.exercises[index];
    showMessage(`${exercise.name} will be added to your schedule soon!`, 'info');
    
    // TODO: Integrate with scheduling system
    console.log('Scheduling exercise:', exercise);
}

/**
 * Add to schedule (from modal)
 */
function addToSchedule() {
    if (window.currentExerciseIndex !== null) {
        scheduleExercise(window.currentExerciseIndex);
        closeExerciseModal();
    }
}

/**
 * Populate database with sample data
 */
async function populateDatabase() {
    const token = localStorage.getItem('authToken');
    
    try {
        showMessage('Populating database with sample data...', 'info');
        
        const response = await fetch('/api/dashboard/populate-exercises', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            showMessage('Sample data added successfully! Reloading...', 'success');
            
            // Reload the exercise data
            setTimeout(() => {
                loadExerciseData();
            }, 1000);
        } else {
            const errorText = await response.text();
            console.error('Failed to populate database:', errorText);
            showMessage('Failed to populate database', 'error');
        }
    } catch (error) {
        console.error('Error populating database:', error);
        showMessage('Network error while populating database', 'error');
    }
}

/**
 * Quick action functions
 */
function startWorkout() {
    if (exerciseData && exerciseData.exercises.length > 0) {
        startExercise(0);
    } else {
        showMessage('No exercises available to start', 'warning');
    }
}

function scheduleWorkout() {
    window.location.href = '/dashboard/schedule.html';
}

function trackProgress() {
    showMessage('Progress tracking will be available soon!', 'info');
}

function findMoreExercises() {
    showMessage('Exercise library will be available soon!', 'info');
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
    const exerciseModal = document.getElementById('exercise-modal');
    const learningModal = document.getElementById('learning-modal');
    const profileModal = document.getElementById('profile-modal');
    
    if (event.target === exerciseModal) {
        closeExerciseModal();
    }
    if (event.target === learningModal) {
        closeLearningModal();
    }
    if (event.target === profileModal) {
        closeProfile();
    }
});
