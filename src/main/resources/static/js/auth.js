// Global variables
let isEmailChecked = false;
let isNicknameChecked = false;

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
    animateStats();
    setupFormValidation();
    setupPasswordToggle();
    setupPasswordStrength();
    setupEmailCheck();
    setupNicknameCheck();
    setupAgreementHandlers();
    setupSocialLogin();
});

// Initialize authentication functionality
function initializeAuth() {
    // Check which page we're on and initialize accordingly
    if (loginForm) {
        initializeLogin();
    }
    if (signupForm) {
        initializeSignup();
    }
    
    // Add form animation
    const authCard = document.querySelector('.auth-card');
    if (authCard) {
        authCard.style.opacity = '0';
        authCard.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            authCard.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            authCard.style.opacity = '1';
            authCard.style.transform = 'translateY(0)';
        }, 300);
    }
}

// Initialize login page
function initializeLogin() {
    loginForm.addEventListener('submit', handleLogin);
    
    // Auto-focus first input
    const firstInput = loginForm.querySelector('input');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 500);
    }
    
    // Remember me functionality
    const rememberCheckbox = document.getElementById('remember');
    const emailInput = document.getElementById('email');
    
    // Load saved email if exists
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail && rememberCheckbox) {
        emailInput.value = savedEmail;
        rememberCheckbox.checked = true;
    }
}

// Initialize signup page
function initializeSignup() {
    signupForm.addEventListener('submit', handleSignup);
    
    // Auto-focus first input
    const firstInput = signupForm.querySelector('input');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 500);
    }
    
    // Real-time validation
    setupRealTimeValidation();
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');
    const remember = formData.get('remember');
    
    // Clear previous errors
    clearErrors();
    
    // Validate
    if (!validateEmail(email)) {
        showError('emailError', '올바른 이메일 주소를 입력해주세요.');
        return;
    }
    
    if (!password || password.length < 6) {
        showError('passwordError', '비밀번호는 최소 6자 이상이어야 합니다.');
        return;
    }
    
    // Show loading state
    setButtonLoading('loginBtn', true);
    setFormLoading(loginForm, true);
    
    try {
        // TODO: 실제 백엔드 API 호출
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, remember })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || '로그인에 실패했습니다.');
        }
        
        // Handle remember me
        if (remember) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
        
        // Store auth token
        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }
        
        // Success
        showNotification('로그인이 완료되었습니다! 환영합니다! 🌱', 'success');
        setFormState(loginForm, 'success');
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        showError('passwordError', error.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
        setFormState(loginForm, 'error');
        setButtonLoading('loginBtn', false);
        setFormLoading(loginForm, false);
    }
}

// Handle signup form submission
async function handleSignup(e) {
    e.preventDefault();
    
    const formData = new FormData(signupForm);
    const email = formData.get('email');
    const nickname = formData.get('nickname');
    const password = formData.get('password');
    const passwordConfirm = formData.get('passwordConfirm');
    const region = formData.get('region');
    const agreeTerms = formData.get('agreeTerms');
    const agreePrivacy = formData.get('agreePrivacy');
    const agreeAge = formData.get('agreeAge');
    
    // Clear previous errors
    clearErrors();
    
    // Validate
    let hasError = false;
    
    if (!validateEmail(email)) {
        showError('emailError', '올바른 이메일 주소를 입력해주세요.');
        hasError = true;
    } else if (!isEmailChecked) {
        showError('emailError', '이메일 중복확인을 해주세요.');
        hasError = true;
    }
    
    if (!validateNickname(nickname)) {
        showError('nicknameError', '닉네임은 2-20자 사이로 입력해주세요.');
        hasError = true;
    } else if (!isNicknameChecked) {
        showError('nicknameError', '닉네임 중복확인을 해주세요.');
        hasError = true;
    }
    
    if (!validatePassword(password)) {
        showError('passwordError', '비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.');
        hasError = true;
    }
    
    if (password !== passwordConfirm) {
        showError('passwordConfirmError', '비밀번호가 일치하지 않습니다.');
        hasError = true;
    }
    
    if (!region) {
        showError('regionError', '지역을 선택해주세요.');
        hasError = true;
    }
    
    if (!agreeTerms || !agreePrivacy || !agreeAge) {
        showNotification('필수 약관에 동의해주세요.', 'error');
        hasError = true;
    }
    
    if (hasError) {
        setFormState(signupForm, 'error');
        return;
    }
    
    // Show loading state
    setButtonLoading('signupBtn', true);
    setFormLoading(signupForm, true);
    
    try {
        // TODO: 실제 백엔드 API 호출
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                nickname,
                password,
                region,
                agreements: {
                    terms: agreeTerms,
                    privacy: agreePrivacy,
                    age: agreeAge
                }
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || '회원가입에 실패했습니다.');
        }
        
        // Success
        showNotification('회원가입이 완료되었습니다! 환경을 지키는 여정을 시작해보세요! 🌱', 'success');
        setFormState(signupForm, 'success');
        
        // Redirect to login after delay
        setTimeout(() => {
            window.location.href = `login.html?email=${encodeURIComponent(email)}`;
        }, 1500);
        
    } catch (error) {
        showNotification(error.message || '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
        setFormState(signupForm, 'error');
        setButtonLoading('signupBtn', false);
        setFormLoading(signupForm, false);
    }
}

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Nickname validation
function validateNickname(nickname) {
    return nickname && nickname.length >= 2 && nickname.length <= 20;
}

// Password validation
function validatePassword(password) {
    if (!password || password.length < 8) return false;
    
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasLetter && hasNumber && hasSpecial;
}

// Setup form validation
function setupFormValidation() {
    const inputs = document.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
    });
}

// Validate individual field
function validateField(input) {
    const value = input.value.trim();
    const fieldName = input.name;
    let isValid = true;
    let errorMessage = '';
    
    // Clear previous states
    input.classList.remove('error', 'success');
    
    if (!value && input.required) {
        isValid = false;
        errorMessage = '필수 입력 항목입니다.';
    } else if (value) {
        switch (fieldName) {
            case 'email':
            case 'signupEmail':
                isValid = validateEmail(value);
                errorMessage = '올바른 이메일 주소를 입력해주세요.';
                break;
            case 'nickname':
                isValid = validateNickname(value);
                errorMessage = '닉네임은 2-20자 사이로 입력해주세요.';
                break;
            case 'password':
            case 'signupPassword':
                if (input.id === 'signupPassword') {
                    isValid = validatePassword(value);
                    errorMessage = '8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.';
                } else {
                    isValid = value.length >= 6;
                    errorMessage = '비밀번호는 최소 6자 이상이어야 합니다.';
                }
                break;
            case 'passwordConfirm':
                const passwordField = document.getElementById('signupPassword');
                isValid = passwordField && value === passwordField.value;
                errorMessage = '비밀번호가 일치하지 않습니다.';
                break;
        }
    }
    
    const errorElement = document.getElementById(fieldName + 'Error') || 
                        document.getElementById(input.id + 'Error');
    
    if (isValid && value) {
        input.classList.add('success');
        if (errorElement) errorElement.textContent = '';
    } else if (!isValid) {
        input.classList.add('error');
        if (errorElement) errorElement.textContent = errorMessage;
    }
    
    return isValid;
}

// Setup real-time validation for signup
function setupRealTimeValidation() {
    if (!signupForm) return;
    
    const inputs = signupForm.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            // Reset duplicate check flags when input changes
            if (input.name === 'email') {
                isEmailChecked = false;
                updateCheckButton('checkEmail', false);
            }
            if (input.name === 'nickname') {
                isNicknameChecked = false;
                updateCheckButton('checkNickname', false);
            }
            
            updateSignupButtonState();
        });
    });
    
    // Agreement checkboxes
    const checkboxes = signupForm.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSignupButtonState);
    });
    
    // Region select
    const regionSelect = document.getElementById('region');
    if (regionSelect) {
        regionSelect.addEventListener('change', updateSignupButtonState);
    }
}

// Update signup button state
function updateSignupButtonState() {
    if (!signupForm) return;
    
    const signupBtn = document.getElementById('signupBtn');
    const email = document.getElementById('signupEmail').value;
    const nickname = document.getElementById('nickname').value;
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const region = document.getElementById('region').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const agreePrivacy = document.getElementById('agreePrivacy').checked;
    const agreeAge = document.getElementById('agreeAge').checked;
    
    const isFormValid = 
        validateEmail(email) && isEmailChecked &&
        validateNickname(nickname) && isNicknameChecked &&
        validatePassword(password) &&
        password === passwordConfirm &&
        region &&
        agreeTerms && agreePrivacy && agreeAge;
    
    signupBtn.disabled = !isFormValid;
}

// Setup password toggle functionality
function setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.parentElement.querySelector('input');
            const eyeIcon = button.querySelector('.eye-icon');
            
            if (input.type === 'password') {
                input.type = 'text';
                eyeIcon.textContent = '🙈';
            } else {
                input.type = 'password';
                eyeIcon.textContent = '👁️';
            }
        });
    });
}

// Setup password strength indicator
function setupPasswordStrength() {
    const passwordInput = document.getElementById('signupPassword');
    if (!passwordInput) return;
    
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = calculatePasswordStrength(password);
        
        // Update bar
        strengthBar.className = 'strength-fill ' + strength.level;
        
        // Update text
        strengthText.textContent = strength.text;
    });
}

// Calculate password strength
function calculatePasswordStrength(password) {
    if (!password) {
        return { level: '', text: '비밀번호 강도' };
    }
    
    let score = 0;
    
    // Length
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 10;
    
    // Character types
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/\d/.test(password)) score += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;
    
    // Determine level
    if (score < 30) {
        return { level: 'weak', text: '약함' };
    } else if (score < 60) {
        return { level: 'fair', text: '보통' };
    } else if (score < 80) {
        return { level: 'good', text: '좋음' };
    } else {
        return { level: 'strong', text: '강함' };
    }
}

// Setup email duplicate check
function setupEmailCheck() {
    const checkEmailBtn = document.getElementById('checkEmail');
    if (!checkEmailBtn) return;
    
    checkEmailBtn.addEventListener('click', async () => {
        const emailInput = document.getElementById('signupEmail');
        const email = emailInput.value.trim();
        
        if (!validateEmail(email)) {
            showError('emailError', '올바른 이메일 주소를 입력해주세요.');
            return;
        }
        
        // Show loading
        checkEmailBtn.disabled = true;
        checkEmailBtn.textContent = '확인중...';
        
        try {
            // TODO: 실제 백엔드 API 호출
            const response = await fetch('/api/auth/check-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '이메일 확인 중 오류가 발생했습니다.');
            }
            
            if (data.available) {
                isEmailChecked = true;
                showSuccess('emailSuccess', '사용 가능한 이메일입니다.');
                showError('emailError', '');
                updateCheckButton('checkEmail', true);
            } else {
                isEmailChecked = false;
                showError('emailError', '이미 사용 중인 이메일입니다.');
                showSuccess('emailSuccess', '');
                updateCheckButton('checkEmail', false);
            }
            
        } catch (error) {
            showError('emailError', error.message || '확인 중 오류가 발생했습니다.');
            updateCheckButton('checkEmail', false);
        }
        
        updateSignupButtonState();
    });
}

// Setup nickname duplicate check
function setupNicknameCheck() {
    const checkNicknameBtn = document.getElementById('checkNickname');
    if (!checkNicknameBtn) return;
    
    checkNicknameBtn.addEventListener('click', async () => {
        const nicknameInput = document.getElementById('nickname');
        const nickname = nicknameInput.value.trim();
        
        if (!validateNickname(nickname)) {
            showError('nicknameError', '닉네임은 2-20자 사이로 입력해주세요.');
            return;
        }
        
        // Show loading
        checkNicknameBtn.disabled = true;
        checkNicknameBtn.textContent = '확인중...';
        
        try {
            // TODO: 실제 백엔드 API 호출
            const response = await fetch('/api/auth/check-nickname', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nickname })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || '닉네임 확인 중 오류가 발생했습니다.');
            }
            
            if (data.available) {
                isNicknameChecked = true;
                showSuccess('nicknameSuccess', '사용 가능한 닉네임입니다.');
                showError('nicknameError', '');
                updateCheckButton('checkNickname', true);
            } else {
                isNicknameChecked = false;
                showError('nicknameError', '이미 사용 중인 닉네임입니다.');
                showSuccess('nicknameSuccess', '');
                updateCheckButton('checkNickname', false);
            }
            
        } catch (error) {
            showError('nicknameError', error.message || '확인 중 오류가 발생했습니다.');
            updateCheckButton('checkNickname', false);
        }
        
        updateSignupButtonState();
    });
}

// Update check button state
function updateCheckButton(buttonId, isChecked) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    if (isChecked) {
        button.textContent = '확인완료';
        button.style.background = 'var(--success-green)';
        button.style.color = 'white';
        button.disabled = true;
    } else {
        button.textContent = '중복확인';
        button.style.background = '';
        button.style.color = '';
        button.disabled = false;
    }
}

// Setup agreement handlers
function setupAgreementHandlers() {
    const agreeAllCheckbox = document.getElementById('agreeAll');
    if (!agreeAllCheckbox) return;
    
    const agreementCheckboxes = document.querySelectorAll('.agreement-details input[type="checkbox"]');
    
    // Handle "agree all" checkbox
    agreeAllCheckbox.addEventListener('change', () => {
        const isChecked = agreeAllCheckbox.checked;
        agreementCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        updateSignupButtonState();
    });
    
    // Handle individual checkboxes
    agreementCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const allChecked = Array.from(agreementCheckboxes).every(cb => cb.checked);
            agreeAllCheckbox.checked = allChecked;
            updateSignupButtonState();
        });
    });
}

// Setup social login
function setupSocialLogin() {
    const socialButtons = document.querySelectorAll('.social-btn');
    
    socialButtons.forEach(button => {
        button.addEventListener('click', () => {
            const provider = button.classList.contains('google') ? 'Google' : 'Kakao';
            showNotification(`${provider} 로그인을 준비 중입니다...`, 'info');
            
            // TODO: 소셜 로그인 API 연동
            // 실제로는 OAuth 플로우로 진행
            setTimeout(() => {
                showNotification(`${provider} 로그인이 일시적으로 사용할 수 없습니다.`, 'error');
            }, 1500);
        });
    });
}

// Helper functions
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.opacity = message ? '1' : '0';
    }
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.opacity = message ? '1' : '0';
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    const successElements = document.querySelectorAll('.success-message');
    
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.opacity = '0';
    });
    
    successElements.forEach(element => {
        element.textContent = '';
        element.style.opacity = '0';
    });
    
    // Clear input states
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.classList.remove('error', 'success');
    });
}

function setButtonLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        button.disabled = true;
    } else {
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        button.disabled = false;
    }
}

function setFormLoading(form, isLoading) {
    if (isLoading) {
        form.classList.add('form-loading');
    } else {
        form.classList.remove('form-loading');
    }
}

function setFormState(form, state) {
    form.classList.remove('form-success', 'form-error');
    if (state) {
        form.classList.add('form-' + state);
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    const closeButton = notification.querySelector('.notification-close');
    closeButton.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: opacity 0.2s ease;
    `;
    
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.opacity = '1';
        closeButton.style.background = 'rgba(255,255,255,0.2)';
    });
    
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.opacity = '0.8';
        closeButton.style.background = 'none';
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#28a745';
        case 'error': return '#dc3545';
        case 'warning': return '#ffc107';
        case 'info': return '#17a2b8';
        default: return '#6c757d';
    }
}

// Animate stats numbers
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(number => {
        observer.observe(number);
    });
}

function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeOutQuart);
        
        element.textContent = current.toLocaleString();
        element.classList.add('counting');
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Handle URL parameters (for login page with pre-filled email)
function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    
    if (email && loginForm) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = email;
            // Focus password field instead
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                setTimeout(() => passwordInput.focus(), 500);
            }
        }
    }
}

// Initialize URL parameters after DOM is loaded
document.addEventListener('DOMContentLoaded', handleUrlParameters);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Enter key to submit forms
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        const form = e.target.closest('form');
        if (form) {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton && !submitButton.disabled) {
                submitButton.click();
            }
        }
    }
    
    // Escape key to clear focus
    if (e.key === 'Escape') {
        document.activeElement.blur();
    }
});

// Prevent form submission on Enter in specific fields
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input[type="email"], input[type="text"]')) {
        const form = e.target.closest('form');
        const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"])'));
        const currentIndex = inputs.indexOf(e.target);
        const nextInput = inputs[currentIndex + 1];
        
        if (nextInput) {
            e.preventDefault();
            nextInput.focus();
        }
    }
});

// Add loading animation to page
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Performance monitoring
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        console.log('🌱 GreenCycle 인증 시스템이 준비되었습니다.');
    });
}

// Error handling
window.addEventListener('error', (e) => {
    console.warn('Authentication error:', e.error);
    showNotification('일시적인 오류가 발생했습니다. 페이지를 새로고침해주세요.', 'error');
});

// Handle offline/online status
window.addEventListener('offline', () => {
    showNotification('인터넷 연결이 끊어졌습니다. 연결을 확인해주세요.', 'warning');
});

window.addEventListener('online', () => {
    showNotification('인터넷에 다시 연결되었습니다.', 'success');
});

// Export functions for global access (if needed)
window.GreenCycleAuth = {
    showNotification,
    validateEmail,
    validatePassword,
    validateNickname
};