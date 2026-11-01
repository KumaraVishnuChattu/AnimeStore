/**
 * Anime Store Products Page Controller
 * Handles dynamic search, sorting, modal popup, Cart additions & Buy Now
 */

let allProducts = [];
let currentModalProduct = null;

document.addEventListener('DOMContentLoaded', () => {
  initProductsPage();
});

async function initProductsPage() {
  const container = document.getElementById('products-container');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');

  // Load Initial Products
  await fetchAndRenderProducts();

  // Search filter listener
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      fetchAndRenderProducts();
    });
  }

  // Sort change listener
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      fetchAndRenderProducts();
    });
  }

  // Modal setup
  setupProductModal();
}

async function fetchAndRenderProducts() {
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');

  const search = searchInput ? searchInput.value.trim() : '';
  const sort = sortSelect ? sortSelect.value : '';

  try {
    allProducts = await API.getProducts({ search, sort });
    renderProducts(allProducts);
  } catch (err) {
    console.error('Failed to load products', err);
    showToast('Failed to load products', 'error');
  }
}

function renderProducts(products) {
  const container = document.getElementById('products-container');
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="width: 100%; margin: 40px auto;">
        <h2>No Anime Products Found</h2>
        <p>Try searching for a different anime title or character!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="card" data-id="${product.id}" onclick="openProductModal(${product.id})">
      <div class="card-header">
        <img src="${product.imageUrl}" alt="${escapeHtml(product.name)}">
      </div>
      <div class="card-body">
        <h3 class="product-title">Product: ${escapeHtml(product.name)}</h3>
        <h3 class="product-price">Price: ${product.price}</h3>
        <h3 class="product-rating">Rating: ${product.rating}/5</h3>
        <br>
        <h3 class="product-desc">${escapeHtml(product.description)}</h3>
        <br>
      </div>
      <div class="card-footer" onclick="event.stopPropagation()">
        <button class="btn-buy" onclick="handleBuyNow(${product.id})">Buy</button>
        <button class="btn-cart" onclick="handleAddToCart(${product.id})">Add to Cart</button>
      </div>
    </div>
  `).join('');
}

function setupProductModal() {
  const modal = document.getElementById('product-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeProductModal();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeProductModal);
  }

  // Bind modal action buttons
  const modalAddCartBtn = document.getElementById('modal-add-cart-btn');
  const modalBuyNowBtn = document.getElementById('modal-buy-now-btn');

  if (modalAddCartBtn) {
    modalAddCartBtn.addEventListener('click', () => {
      if (currentModalProduct) {
        handleAddToCart(currentModalProduct.id);
      }
    });
  }

  if (modalBuyNowBtn) {
    modalBuyNowBtn.addEventListener('click', () => {
      if (currentModalProduct) {
        handleBuyNow(currentModalProduct.id);
      }
    });
  }
}

function openProductModal(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  currentModalProduct = product;
  const modal = document.getElementById('product-modal');
  if (!modal) return;

  document.getElementById('modal-img').src = product.imageUrl;
  document.getElementById('modal-title').textContent = product.name;
  document.getElementById('modal-rating').textContent = `★ ${product.rating} / 5 Rating`;
  document.getElementById('modal-price').textContent = `$${Number(product.price).toFixed(2)}`;
  document.getElementById('modal-desc').textContent = product.description;

  modal.classList.add('active');
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) {
    modal.classList.remove('active');
  }
  currentModalProduct = null;
}

async function handleAddToCart(productId) {
  if (!Auth.isLoggedIn()) {
    showToast('Please log in to add items to your cart!', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 800);
    return;
  }

  try {
    await API.addToCart(productId, 1);
    showToast('Added to cart successfully!', 'success');
    updateCartBadge();
  } catch (err) {
    showToast(err.message || 'Could not add to cart', 'error');
  }
}

function handleBuyNow(productId) {
  if (!Auth.isLoggedIn()) {
    showToast('Please log in to proceed with Buy Now!', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 800);
    return;
  }

  // Direct checkout
  window.location.href = `checkout.html?direct=1&productId=${productId}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}
