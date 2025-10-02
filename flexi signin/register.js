document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');
    const medicalSelect = document.getElementById('medical_history');
    const medicalOther = document.getElementById('medical_other');

    // Show/hide medical other input based on selection
    medicalSelect.addEventListener('change', function() {
        if (this.value === 'other') {
            medicalOther.style.display = 'block';
            medicalOther.required = true;
        } else {
            medicalOther.style.display = 'none';
            medicalOther.required = false;
            medicalOther.value = '';
        }
    });

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous messages
        messageDiv.innerHTML = '';
        messageDiv.className = '';

        // Get form data
        const formData = new FormData(registerForm);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm-password');

        // Validate passwords match
        if (password !== confirmPassword) {
            showMessage('Passwords do not match!', 'error');
            return;
        }

        // Prepare data for API
        const registrationData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: password,
            age: parseInt(formData.get('age')),
            diet_type: formData.get('diet_type'),
            goal: formData.get('goal'),
            medical_history: formData.get('medical_history') === 'other' ? 
                formData.get('medical_other') : formData.get('medical_history')
        };

        try {
            showMessage('Registering...', 'info');
            
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData)
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('JSON parsing error:', jsonError);
                showMessage('Server response error. Please try again.', 'error');
                return;
            }

            if (response.ok) {
                showMessage('Registration successful! Redirecting to dashboard...', 'success');
                
                // Store token if provided (for auto-login)
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('userEmail', registrationData.email);
                }
                
                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                showMessage(data.message || 'Registration failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showMessage('Network error. Please check your connection and try again.', 'error');
        }
    });

    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        
        // Add some basic styling
        messageDiv.style.padding = '10px';
        messageDiv.style.marginTop = '10px';
        messageDiv.style.borderRadius = '4px';
        messageDiv.style.textAlign = 'center';
        
        switch(type) {
            case 'success':
                messageDiv.style.backgroundColor = '#d4edda';
                messageDiv.style.color = '#155724';
                messageDiv.style.border = '1px solid #c3e6cb';
                break;
            case 'error':
                messageDiv.style.backgroundColor = '#f8d7da';
                messageDiv.style.color = '#721c24';
                messageDiv.style.border = '1px solid #f5c6cb';
                break;
            case 'info':
                messageDiv.style.backgroundColor = '#d1ecf1';
                messageDiv.style.color = '#0c5460';
                messageDiv.style.border = '1px solid #bee5eb';
                break;
        }
    }
});
