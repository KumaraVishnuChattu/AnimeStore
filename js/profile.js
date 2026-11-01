/**
 * Anime Store Profile Controller
 * Displays logged in user information and account details
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth('login.html')) return;
  loadProfilePage();
});

async function loadProfilePage() {
  const user = Auth.getUser();
  if (!user) return;

  const emailEl = document.getElementById('profile-email');
  const mobileEl = document.getElementById('profile-mobile');
  const joinedEl = document.getElementById('profile-joined');
  const ordersCountEl = document.getElementById('profile-orders-count');
  const logoutBtn = document.getElementById('profile-logout-btn');

  if (emailEl) emailEl.textContent = user.email || 'N/A';
  if (mobileEl) mobileEl.textContent = user.mobileNumber || 'Not provided';
  if (joinedEl) {
    joinedEl.textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member';
  }

  try {
    const orders = await API.getMyOrders();
    if (ordersCountEl) ordersCountEl.textContent = orders.length;
  } catch (err) {
    if (ordersCountEl) ordersCountEl.textContent = '0';
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      Auth.clearSession();
      showToast('Logged out successfully', 'info');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 500);
    });
  }
}
