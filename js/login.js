// Login Module
document.addEventListener('DOMContentLoaded', function() {
  // Only run on login page
  if (!window.location.pathname.endsWith('login.html')) return;

  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    // Hide previous error
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }

    // Get the current admin email - check if it was ever changed
    const savedAdminEmail = localStorage.getItem('adminEmail');
    // If admin email was changed, only accept the new one
    // If never changed, accept the default 'admin@aquaruse'
    const adminEmail = savedAdminEmail || 'admin@aquaruse';
    
    // Admin login
    if (email === adminEmail) {
      localStorage.setItem('userEmail', email);
      window.location.href = 'spa.html';
      return;
    }

    // Reject old default admin email if admin has changed their email
    if (savedAdminEmail && email === 'admin@aquaruse') {
      if (errorDiv) {
        errorDiv.textContent = 'Invalid email or password. Please try again.';
        errorDiv.style.display = 'block';
      }
      return;
    }

    // Staff login
    let staffAccounts = JSON.parse(localStorage.getItem('staffAccounts') || '[]');
    let staff = staffAccounts.find(acc => acc.email === email);
    
    if (staff && staff.password === password) {
      localStorage.setItem('userEmail', email);
      window.location.href = 'spa.html';
      return;
    }

    // Login failed
    if (errorDiv) {
      errorDiv.textContent = 'Invalid email or password. Please try again.';
      errorDiv.style.display = 'block';
    }
  });
});