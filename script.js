import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    sendPasswordResetEmail, 
    signInWithPopup, 
    GoogleAuthProvider,
    onAuthStateChanged // Fix 1: Tambahkan import ini
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyABp1sNwc8ON5LhWvlDFeQLXWztz-mD9G0",
    authDomain: "jft-basic-a2.firebaseapp.com",
    projectId: "jft-basic-a2",
    storageBucket: "jft-basic-a2.firebasestorage.app",
    messagingSenderId: "856700351880",
    appId: "1:856700351880:web:a1a126470d664cb453f63d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

// Fix 2: Pindahkan pengecekan ke luar (segera berjalan saat halaman dimuat)
// Jika pengguna terdeteksi SUDAH login, langsung lempar ke repository ujian!
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "https://anbyofficial.github.io/JFT-BASIC-A2/";
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const passwordToggle = document.getElementById('passwordToggle');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const successMessage = document.getElementById('successMessage');
    const successTitle = document.getElementById('successTitle');
    const successDesc = document.getElementById('successDesc');
    
    const toggleText = document.getElementById('toggleText');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const googleLoginBtn = document.getElementById('googleLoginBtn');

    let isSignUpMode = false;

    // 1. Password Visibility Toggle
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', () => {
            const isPass = passwordInput.type === 'password';
            passwordInput.type = isPass ? 'text' : 'password';
            passwordToggle.style.transform = isPass ? 'rotate(180deg)' : 'rotate(0deg)';
        });
    }

    // Helper Error Display
    function showError(type, message) {
        if (type === 'email' && emailError) {
            emailError.textContent = message;
            emailError.classList.add('show');
            const group = emailError.closest('.form-group');
            if (group) group.classList.add('error');
        } else if (type === 'password' && passwordError) {
            passwordError.textContent = message;
            passwordError.classList.add('show');
            const group = passwordError.closest('.form-group');
            if (group) group.classList.add('error');
        }
    }

    function clearErrors() {
        if (emailError) {
            emailError.textContent = '';
            emailError.classList.remove('show');
            const group = emailError.closest('.form-group');
            if (group) group.classList.remove('error');
        }
        if (passwordError) {
            passwordError.textContent = '';
            passwordError.classList.remove('show');
            const group = passwordError.closest('.form-group');
            if (group) group.classList.remove('error');
        }
    }

    // 2. Fitur Toggle Mode (Sign In <-> Sign Up)
    const toggleBtn = document.getElementById('toggleModeBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearErrors();
            isSignUpMode = !isSignUpMode;
            
            const headerTitle = document.querySelector('.login-header h1');
            const headerDesc = document.querySelector('.login-header p');

            if (isSignUpMode) {
                if(headerTitle) headerTitle.textContent = "Create an Account";
                if(headerDesc) headerDesc.textContent = "Sign up to your account.";
                if(btnText) btnText.textContent = "Sign Up";
                if(toggleText) toggleText.innerHTML = `Already have an account? <a href="#" id="toggleModeBtn">Sign in</a>`;
            } else {
                if(headerTitle) headerTitle.textContent = "Sign in to ujian Jft";
                if(headerDesc) headerDesc.textContent = "Continue to account";
                if(btnText) btnText.textContent = "Sign In";
                if(toggleText) toggleText.innerHTML = `Don't have an account? <a href="#" id="toggleModeBtn">Sign up free</a>`;
            }
            // Fix 3: Hapus panggilan setupToggleMode() di dalam event listener
        });
    }

    // 3. Submit Form Login / Register
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearErrors();

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email) {
                showError('email', 'Email address is required');
                return;
            }
            if (!password) {
                showError('password', 'Password is required');
                return;
            }
            if (password.length < 6) {
                showError('password', 'Password must be at least 6 characters');
                return;
            }

            if (submitBtn) submitBtn.classList.add('loading');

            if (isSignUpMode) {
                createUserWithEmailAndPassword(auth, email, password)
                    .then(() => {
                        if (successTitle) successTitle.textContent = "Account Created!";
                        if (successDesc) successDesc.textContent = "Redirecting...";
                        if (successMessage) successMessage.classList.add('show');
                        setTimeout(() => {
                            window.location.href = "https://anbyofficial.github.io/JFT-BASIC-A2/";
                        }, 1500);
                    })
                    .catch((error) => {
                        if (submitBtn) submitBtn.classList.remove('loading');
                        if (error.code.includes('email')) {
                            showError('email', error.message);
                        } else {
                            showError('password', error.message);
                        }
                    });
            } else {
                signInWithEmailAndPassword(auth, email, password)
                    .then(() => {
                        if (successTitle) successTitle.textContent = "Welcome back!";
                        if (successDesc) successDesc.textContent = "Switching to your account...";
                        if (successMessage) successMessage.classList.add('show');
                        setTimeout(() => {
                            window.location.href = "https://anbyofficial.github.io/JFT-BASIC-A2/";
                        }, 1500);
                    })
                    .catch((error) => {
                        if (submitBtn) submitBtn.classList.remove('loading');
                        showError('password', 'Invalid email or password.');
                    });
            }
        });
    }

    // 4. Forgot Password
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            clearErrors();
            const email = emailInput.value.trim();

            if (!email) {
                showError('email', 'Please enter your email address first.');
                return;
            }

            sendPasswordResetEmail(auth, email)
                .then(() => {
                    alert("Password reset link sent to your email!");
                })
                .catch((error) => {
                    showError('email', error.message);
                });
        });
    }

    // 5. Google Sign-In
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
                .then(() => {
                    if (successTitle) successTitle.textContent = "Google Login Success!";
                    if (successDesc) successDesc.textContent = "Redirecting...";
                    if (successMessage) successMessage.classList.add('show');
                    
                    setTimeout(() => {
                        window.location.href = "https://anbyofficial.github.io/JFT-BASIC-A2/";
                    }, 1500);
                })
                .catch((error) => {
                    alert("Google Sign-In Error: " + error.message);
                });
        });
    }
});
