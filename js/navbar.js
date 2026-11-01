/**
 * Anime Store Shared Navigation Controller
 * Updates header links, cart badge count, and active states
 */

document.addEventListener('DOMContentLoaded', () => {
  setupNavbar();
  updateCartBadge();
});

function setupNavbar() {
  const navOl = document.querySelector('header ol');
  if (!navOl) return;

  const currentPath = window.location.pathname.toLowerCase();
  const isLoggedIn = Auth.isLoggedIn();
  const user = Auth.getUser();

  // Determine path prefix based on whether current page is in /pages/ or root
  const isInPagesDir = currentPath.includes('/pages/') || (!currentPath.endsWith('/') && !currentPath.endsWith('index.html') && !currentPath.includes('.html')) || window.location.href.includes('/pages/');
  const prefix = isInPagesDir ? '' : 'pages/';

  let navHtml = `
    <li class="${isActive('index.html', currentPath)}"><a href="${isInPagesDir ? 'index.html' : 'pages/index.html'}">Home</a></li>
    <li class="${isActive('products.html', currentPath)}"><a href="${isInPagesDir ? 'products.html' : 'pages/products.html'}">Products</a></li>
    <li class="${isActive('cart.html', currentPath)}">
      <a href="${isInPagesDir ? 'cart.html' : 'pages/cart.html'}">
        Cart <span id="cart-badge-count" class="nav-badge" style="display:none">0</span>
      </a>
    </li>
    <li class="${isActive('about.html', currentPath)}"><a href="${isInPagesDir ? 'about.html' : 'pages/about.html'}">About</a></li>
    <li class="${isActive('contact.html', currentPath)}"><a href="${isInPagesDir ? 'contact.html' : 'pages/contact.html'}">Contact</a></li>
  `;

  if (isLoggedIn) {
    navHtml += `
      <li class="${isActive('orders.html', currentPath)}"><a href="${isInPagesDir ? 'orders.html' : 'pages/orders.html'}">My Orders</a></li>
      <li class="${isActive('profile.html', currentPath)}"><a href="${isInPagesDir ? 'profile.html' : 'pages/profile.html'}">Profile</a></li>
      <li><a href="#" id="nav-logout-btn" style="color:#FF4C3C;">Logout</a></li>
    `;
  } else {
    navHtml += `
      <li class="${isActive('login.html', currentPath)}"><a href="${isInPagesDir ? 'login.html' : 'pages/login.html'}">Login</a></li>
      <li class="${isActive('register.html', currentPath)}"><a href="${isInPagesDir ? 'register.html' : 'pages/register.html'}">Register</a></li>
    `;
  }

  navOl.innerHTML = navHtml;

  // Bind logout action
  const logoutBtn = document.getElementById('nav-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.clearSession();
      showToast('Logged out successfully', 'info');
      setTimeout(() => {
        window.location.href = isInPagesDir ? 'login.html' : 'pages/login.html';
      }, 400);
    });
  }
}

function isActive(pageName, currentPath) {
  if (currentPath.endsWith(pageName)) {
    return 'active';
  }
  if (pageName === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('animestore/'))) {
    return 'active';
  }
  return '';
}

async function updateCartBadge() {
  const badge = document.getElementById('cart-badge-count');
  if (!badge) return;

  try {
    const cart = await API.getCart();
    const count = cart.itemCount || (cart.items ? cart.items.reduce((s, i) => s + i.quantity, 0) : 0);
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  } catch (err) {
    badge.style.display = 'none';
  }
}
