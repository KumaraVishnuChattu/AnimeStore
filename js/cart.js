/**
 * Anime Store Cart Controller
 * Quantity selectors (+ / -), Line-item totals, 4.4% platform fee, Grand Total
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth('login.html')) return;
  loadCartPage();
});

async function loadCartPage() {
  const container = document.getElementById('cart-content-container');
  if (!container) return;

  try {
    const cart = await API.getCart();
    renderCart(cart);
  } catch (err) {
    showToast('Failed to load cart', 'error');
  }
}

function renderCart(cart) {
  const container = document.getElementById('cart-content-container');
  if (!container) return;

  if (!cart.items || cart.items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>Your Cart is Empty!</h2>
        <p>Looks like you haven't added any anime merchandise yet.</p>
        <button class="btn-buy" style="max-width: 200px; margin: 0 auto;" onclick="window.location.href='products.html'">Browse Products</button>
      </div>
    `;
    updateCartBadge();
    return;
  }

  // Format pricing
  const subtotal = Number(cart.subtotal).toFixed(2);
  const platformFee = Number(cart.platformFee).toFixed(2);
  const totalAmount = Number(cart.totalAmount).toFixed(2);

  const itemsHtml = cart.items.map(item => `
    <div class="cart-item-card" id="cart-item-${item.id}">
      <img src="${item.imageUrl}" alt="${item.productName}" class="cart-item-img">
      <div class="cart-item-details">
        <h3 class="cart-item-name">${item.productName}</h3>
        <p class="cart-item-price">$${Number(item.price).toFixed(2)} each</p>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="updateQty(${item.id}, ${item.quantity - 1})">-</button>
        <span class="qty-display">${item.quantity}</span>
        <button class="qty-btn" onclick="updateQty(${item.id}, ${item.quantity + 1})">+</button>
      </div>
      <div class="item-total-price">
        $${Number(item.lineTotal).toFixed(2)}
      </div>
      <button class="btn-remove-item" onclick="removeItem(${item.id})" title="Remove item">✕</button>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items-container">
        ${itemsHtml}
      </div>

      <div class="summary-card">
        <h3 class="summary-title">Order Summary</h3>
        <div class="summary-row">
          <span>Items Subtotal:</span>
          <span id="summary-subtotal">$${subtotal}</span>
        </div>
        <div class="summary-row">
          <span>Platform Fee (4.4%):</span>
          <span id="summary-fee">$${platformFee}</span>
        </div>
        <div class="summary-row total-row">
          <span>Grand Total:</span>
          <span id="summary-total">$${totalAmount}</span>
        </div>
        <button class="btn-checkout" onclick="window.location.href='checkout.html'">Proceed to Checkout</button>
      </div>
    </div>
  `;

  updateCartBadge();
}

async function updateQty(itemId, newQty) {
  try {
    const updatedCart = await API.updateCartItem(itemId, newQty);
    renderCart(updatedCart);
  } catch (err) {
    showToast('Failed to update quantity', 'error');
  }
}

async function removeItem(itemId) {
  try {
    const updatedCart = await API.removeCartItem(itemId);
    showToast('Item removed from cart', 'info');
    renderCart(updatedCart);
  } catch (err) {
    showToast('Failed to remove item', 'error');
  }
}
