document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous messages
        messageDiv.innerHTML = '';
        messageDiv.className = '';

        // Get form data
        const formData = new FormData(loginForm);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        // Debug: Log the form data
        console.log('Form data:', loginData);

        // Basic validation
        if (!loginData.email || !loginData.password) {
            console.log('Validation failed - Email:', loginData.email, 'Password:', loginData.password ? '[PROVIDED]' : '[MISSING]');
            showMessage('Please fill in all fields.', 'error');
            return;
        }

        try {
            showMessage('Logging in...', 'info');
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
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
                showMessage('Login successful! Welcome back!', 'success');
                
                // Store token for authenticated requests
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('userEmail', loginData.email);
                }
                
                // Redirect to dashboard after 1.5 seconds
                setTimeout(() => {
                    window.location.href = '/dashboard/dashboard.html';
                }, 1500);
            } else {
                showMessage(data.message || 'Login failed. Please check your credentials.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
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

    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
        // Optionally verify token with backend
        showMessage('You are already logged in. Redirecting...', 'info');
        setTimeout(() => {
            window.location.href = '/dashboard/dashboard.html';
        }, 1500);
    }
});
