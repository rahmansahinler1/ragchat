function initLoginWidgets({
    loginForm,
    emailInput,
    passwordInput,
    loginButton,
    togglePasswordButton
}) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handleLogin(emailInput.value, passwordInput.value);
    });
    // Real-time checkings for email and password
    emailInput.addEventListener('input', validateEmail);
    passwordInput.addEventListener('input', validatePassword);
    // Password toggle
    togglePasswordButton.addEventListener('click', () => togglePassword(passwordInput, togglePasswordButton));
}

async function handleLogin(email, password) {
    try {
        const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                user_email: email, 
                user_password: password 
            }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('sessionId', data.session_id);
            window.location.href = '/app';
        } else {
            displayError(data.message || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        displayError('An error occurred during login.');
    }
}

async function startChatSession() {
    try {
        const sessionId = localStorage.getItem('sessionId');
        const response = await fetch('/api/v1/chat/start', {
            method: 'POST',
            headers: {
                'Authorization': sessionId,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('chatSessionId', data.chat_session_id);
            window.location.href = `/app/${data.chat_session_id}`;  // Redirect to the chat with the new session ID
        } else {
            displayError('Failed to start chat session.');
        }
    } catch (error) {
        console.error('Error starting chat session:', error);
        displayError('An error occurred while starting the chat session.');
    }
}

function validateEmail() {
    // Implement email validation logic
}

function validatePassword() {
    // Implement password validation logic
}

function displayError(message) {
    // Implement error display logic
    alert(message); // For now, we'll use a simple alert. You can replace this with a more user-friendly UI later.
}

function togglePassword(passwordInput, toggleButton) {
    const toggleIcon = toggleButton.querySelector('i');
    const toggleText = toggleButton.querySelector('span');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
        toggleText.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
        toggleText.textContent = 'Show';
    }
}

// Make initLoginWidgets accessible globally
window.initLoginWidgets = initLoginWidgets;