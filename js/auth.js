/**
 * Anime Store Authentication Controller (Register & Login)
 */

document.addEventListener('DOMContentLoaded', () => {
  setupRegistration();
  setupLogin();
});

function setupRegistration() {
  const regForm = document.getElementById('register-form');
  const sendOtpBtn = document.getElementById('btn-send-otp');
  const otpInput = document.getElementById('reg-otp');

  if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', () => {
      // Generate a random 4-digit demo OTP
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      if (otpInput) {
        otpInput.value = generatedOtp;
      }
      showToast(`Demo OTP Generated: ${generatedOtp}`, 'success');
    });
  }

  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('reg-email').value.trim();
      const mobileNumber = document.getElementById('reg-mobile').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById('reg-confirm-password').value;
      const otp = document.getElementById('reg-otp').value.trim();

      if (!email || !password || !confirmPassword || !otp) {
        showToast('Please fill all required fields', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
      }

      if (!/^\d{4}$/.test(otp)) {
        showToast('Please enter a valid 4-digit OTP code', 'error');
        return;
      }

      const submitBtn = document.getElementById('reg-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';
      }

      try {
        await API.register({ email, mobileNumber, password, otp });
        showToast('Registration successful! Welcome to Anime Store!', 'success');
        setTimeout(() => {
          window.location.href = 'products.html';
        }, 1200);
      } catch (err) {
        showToast(err.message || 'Registration failed', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create Anime Account';
        }
      }
    });
  }
}

function setupLogin() {
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      if (!email || !password) {
        showToast('Please provide both email and password', 'error');
        return;
      }

      const submitBtn = document.getElementById('login-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';
      }

      try {
        await API.login({ email, password });
        showToast('Login successful! Welcome back!', 'success');
        setTimeout(() => {
          window.location.href = 'products.html';
        }, 1000);
      } catch (err) {
        showToast(err.message || 'Login failed. Check your credentials.', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign In';
        }
      }
    });
  }
}
