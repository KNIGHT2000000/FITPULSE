/**
 * Calorie Tracker JavaScript
 * Handles calorie tracking functionality with API integration
 */

// Global variables
let currentDate = new Date().toISOString().split('T')[0];
let dailyEntries = [];
let userProfile = null;

// Nutritional goals (can be customized based on user profile)
const nutritionGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 67
};

// Quick add foods database
const quickFoods = [
    { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fats: 0.3 },
    { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
    { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
    { name: 'Brown Rice (1 cup)', calories: 216, protein: 5, carbs: 45, fats: 1.8 },
    { name: 'Greek Yogurt (1 cup)', calories: 130, protein: 23, carbs: 9, fats: 0.4 },
    { name: 'Almonds (28g)', calories: 164, protein: 6, carbs: 6, fats: 14 },
    { name: 'Oatmeal (1 cup)', calories: 147, protein: 5.3, carbs: 25, fats: 2.8 },
    { name: 'Egg (1 large)', calories: 70, protein: 6, carbs: 0.6, fats: 5 }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeCalorieTracker();
});

/**
 * Initialize the calorie tracker
 */
async function initializeCalorieTracker() {
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
        
        // Setup event listeners
        setupEventListeners();
        
        // Load user profile and data
        await loadUserProfile();
        await loadDailyData();
        
        // Populate quick foods
        populateQuickFoods();
        
        hideLoading();
        
    } catch (error) {
        console.error('Initialization error:', error);
        showMessage('Failed to load calorie tracker', 'error');
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
    document.getElementById('food-form').addEventListener('submit', handleFoodSubmission);
    
    // Quick add
    document.getElementById('quick-add-btn').addEventListener('click', openQuickAdd);
    
    // Meal filter
    document.getElementById('meal-filter').addEventListener('change', filterEntries);
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
            adjustGoalsBasedOnProfile();
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
 * Adjust nutritional goals based on user profile
 */
function adjustGoalsBasedOnProfile() {
    if (!userProfile) return;
    
    const goal = userProfile.profile.goal;
    
    // Adjust goals based on fitness goal
    switch (goal) {
        case 'Weight Loss':
            nutritionGoals.calories = 1800;
            nutritionGoals.protein = 140;
            nutritionGoals.carbs = 180;
            nutritionGoals.fats = 60;
            break;
        case 'Muscle Gain':
            nutritionGoals.calories = 2500;
            nutritionGoals.protein = 200;
            nutritionGoals.carbs = 300;
            nutritionGoals.fats = 80;
            break;
        case 'Mental Peace':
            nutritionGoals.calories = 2000;
            nutritionGoals.protein = 150;
            nutritionGoals.carbs = 250;
            nutritionGoals.fats = 67;
            break;
    }
    
    // Update goal displays
    document.getElementById('calories-goal').textContent = `Goal: ${nutritionGoals.calories} kcal`;
    document.getElementById('protein-goal').textContent = `Goal: ${nutritionGoals.protein}g`;
    document.getElementById('carbs-goal').textContent = `Goal: ${nutritionGoals.carbs}g`;
    document.getElementById('fats-goal').textContent = `Goal: ${nutritionGoals.fats}g`;
}

/**
 * Load daily calorie data
 */
async function loadDailyData() {
    const token = localStorage.getItem('authToken');
    console.log('Loading data for date:', currentDate); // Debug log
    
    try {
        const response = await fetch(`/api/track/summary/${currentDate}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Calorie tracker API response:', data); // Debug log
            dailyEntries = data.data.calories.entries || [];
            console.log('Daily entries:', dailyEntries); // Debug log
            updateSummaryCards();
            displayEntries();
        } else {
            console.error('Failed to fetch calorie data:', response.status, response.statusText);
            dailyEntries = [];
            updateSummaryCards();
            displayEntries();
        }
    } catch (error) {
        console.error('Failed to load daily data:', error);
        dailyEntries = [];
        updateSummaryCards();
        displayEntries();
    }
}

/**
 * Update summary cards with totals
 */
function updateSummaryCards() {
    const totals = dailyEntries.reduce((acc, entry) => {
        acc.calories += entry.calories || 0;
        acc.protein += parseFloat(entry.protein_g) || 0;
        acc.carbs += parseFloat(entry.carbs_g) || 0;
        acc.fats += parseFloat(entry.fats_g) || 0;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    // Update displays
    document.getElementById('total-calories').textContent = totals.calories;
    document.getElementById('total-protein').textContent = `${totals.protein.toFixed(1)}g`;
    document.getElementById('total-carbs').textContent = `${totals.carbs.toFixed(1)}g`;
    document.getElementById('total-fats').textContent = `${totals.fats.toFixed(1)}g`;

    // Update progress bars
    updateProgressBar('calories-progress', totals.calories, nutritionGoals.calories);
    updateProgressBar('protein-progress', totals.protein, nutritionGoals.protein);
    updateProgressBar('carbs-progress', totals.carbs, nutritionGoals.carbs);
    updateProgressBar('fats-progress', totals.fats, nutritionGoals.fats);
}

/**
 * Update progress bar
 */
function updateProgressBar(elementId, current, goal) {
    const percentage = Math.min((current / goal) * 100, 100);
    document.getElementById(elementId).style.width = `${percentage}%`;
}

/**
 * Display food entries
 */
function displayEntries() {
    const container = document.getElementById('entries-container');
    const filter = document.getElementById('meal-filter').value;
    
    let filteredEntries = dailyEntries;
    if (filter) {
        filteredEntries = dailyEntries.filter(entry => entry.meal_type === filter);
    }

    if (filteredEntries.length === 0) {
        container.innerHTML = `
            <div class="no-entries">
                <i class="fas fa-utensils"></i>
                <p>No food entries for this date</p>
                <small>Add your first meal above to get started!</small>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredEntries.map(entry => `
        <div class="entry-item">
            <div class="entry-info">
                <h4>${entry.food_item}</h4>
                <p><strong>${entry.meal_type}</strong></p>
                <div class="entry-meta">
                    <span><i class="fas fa-fire"></i> ${entry.calories} kcal</span>
                    <span><i class="fas fa-drumstick-bite"></i> ${entry.protein_g || 0}g protein</span>
                    <span><i class="fas fa-bread-slice"></i> ${entry.carbs_g || 0}g carbs</span>
                    <span><i class="fas fa-cheese"></i> ${entry.fats_g || 0}g fats</span>
                </div>
            </div>
            <div class="entry-actions">
                <button class="edit-btn" onclick="editEntry(${entry.entry_id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteEntry(${entry.entry_id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Handle food form submission
 */
async function handleFoodSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const foodData = {
        entry_date: currentDate,
        meal_type: formData.get('meal_type'),
        food_item: formData.get('food_item'),
        calories: parseInt(formData.get('calories')),
        protein_g: parseFloat(formData.get('protein_g')) || 0,
        carbs_g: parseFloat(formData.get('carbs_g')) || 0,
        fats_g: parseFloat(formData.get('fats_g')) || 0
    };

    try {
        console.log('Submitting food data:', foodData); // Debug log
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/track/calories', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(foodData)
        });

        console.log('Food submission response status:', response.status); // Debug log
        
        if (response.ok) {
            const result = await response.json();
            console.log('Food submission result:', result); // Debug log
            showMessage('Food entry added successfully!', 'success');
            e.target.reset();
            await loadDailyData();
        } else {
            const error = await response.json();
            console.error('Food submission error:', error); // Debug log
            showMessage(error.message || 'Failed to add food entry', 'error');
        }
    } catch (error) {
        console.error('Error adding food entry:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

/**
 * Change date
 */
function changeDate(days) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    currentDate = date.toISOString().split('T')[0];
    document.getElementById('selected-date').value = currentDate;
    loadDailyData();
}

/**
 * Handle date change
 */
function onDateChange(e) {
    currentDate = e.target.value;
    loadDailyData();
}

/**
 * Filter entries by meal type
 */
function filterEntries() {
    displayEntries();
}

/**
 * Populate quick foods modal
 */
function populateQuickFoods() {
    const container = document.getElementById('quick-foods-grid');
    container.innerHTML = quickFoods.map(food => `
        <div class="quick-food-item" onclick="addQuickFood('${food.name}', ${food.calories}, ${food.protein}, ${food.carbs}, ${food.fats})">
            <h4>${food.name}</h4>
            <p>${food.calories} kcal</p>
            <p>P: ${food.protein}g | C: ${food.carbs}g | F: ${food.fats}g</p>
        </div>
    `).join('');
}

/**
 * Open quick add modal
 */
function openQuickAdd() {
    document.getElementById('quick-add-modal').style.display = 'flex';
}

/**
 * Close quick add modal
 */
function closeQuickAdd() {
    document.getElementById('quick-add-modal').style.display = 'none';
}

/**
 * Add quick food to form
 */
function addQuickFood(name, calories, protein, carbs, fats) {
    document.getElementById('food-item').value = name;
    document.getElementById('calories').value = calories;
    document.getElementById('protein').value = protein;
    document.getElementById('carbs').value = carbs;
    document.getElementById('fats').value = fats;
    closeQuickAdd();
    
    // Focus on meal type if not selected
    const mealType = document.getElementById('meal-type');
    if (!mealType.value) {
        mealType.focus();
    }
}

/**
 * Edit entry (placeholder)
 */
function editEntry(entryId) {
    showMessage('Edit functionality will be available soon!', 'warning');
}

/**
 * Delete entry (placeholder)
 */
function deleteEntry(entryId) {
    if (confirm('Are you sure you want to delete this entry?')) {
        showMessage('Delete functionality will be available soon!', 'warning');
    }
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
    const quickModal = document.getElementById('quick-add-modal');
    const profileModal = document.getElementById('profile-modal');
    
    if (event.target === quickModal) {
        closeQuickAdd();
    }
    if (event.target === profileModal) {
        closeProfile();
    }
});
