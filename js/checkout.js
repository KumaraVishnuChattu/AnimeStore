/**
 * Anime Store Checkout Controller
 * Handles address form, 4.4% platform fee calculation, Direct Buy / Cart checkout
 */

let checkoutState = {
  isDirectBuy: false,
  directItem: null,
  cartData: null,
  subtotal: 0,
  platformFee: 0,
  totalAmount: 0
};

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth('login.html')) return;
  initCheckoutPage();
});

async function initCheckoutPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const isDirect = urlParams.get('direct') === '1';
  const productId = urlParams.get('productId');
  const qty = parseInt(urlParams.get('qty') || '1', 10);

  checkoutState.isDirectBuy = isDirect && !!productId;

  const previewContainer = document.getElementById('checkout-items-preview');
  const user = Auth.getUser();

  // Pre-fill user mobile if present
  const mobileInput = document.getElementById('ship-phone');
  if (mobileInput && user && user.mobileNumber) {
    mobileInput.value = user.mobileNumber;
  }

  if (checkoutState.isDirectBuy) {
    // Single Item "Buy Now"
    const product = await API.getProductById(productId);
    if (!product) {
      showToast('Product not found', 'error');
      setTimeout(() => window.location.href = 'products.html', 1000);
      return;
    }

    checkoutState.directItem = { productId: product.id, quantity: qty };
    const lineTotal = product.price * qty;
    checkoutState.subtotal = lineTotal;
    checkoutState.platformFee = Math.round(lineTotal * 0.044 * 100) / 100;
    checkoutState.totalAmount = Math.round((lineTotal + checkoutState.platformFee) * 100) / 100;

    renderOrderSummary([{
      name: product.name,
      quantity: qty,
      price: product.price,
      total: lineTotal
    }]);
  } else {
    // Cart Checkout
    const cart = await API.getCart();
    if (!cart.items || cart.items.length === 0) {
      showToast('Your cart is empty!', 'error');
      setTimeout(() => window.location.href = 'cart.html', 1000);
      return;
    }

    checkoutState.cartData = cart;
    checkoutState.subtotal = cart.subtotal;
    checkoutState.platformFee = cart.platformFee;
    checkoutState.totalAmount = cart.totalAmount;

    renderOrderSummary(cart.items.map(i => ({
      name: i.productName,
      quantity: i.quantity,
      price: i.price,
      total: i.lineTotal
    })));
  }

  // Setup form submit
  const form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', handleCheckoutSubmit);
  }
}

function renderOrderSummary(items) {
  const listEl = document.getElementById('checkout-items-preview');
  const subtotalEl = document.getElementById('summary-subtotal');
  const feeEl = document.getElementById('summary-fee');
  const totalEl = document.getElementById('summary-total');

  if (listEl) {
    listEl.innerHTML = items.map(item => `
      <div class="preview-item">
        <span>${escapeHtml(item.name)} (x${item.quantity})</span>
        <span style="font-weight:bold;">$${Number(item.total).toFixed(2)}</span>
      </div>
    `).join('');
  }

  if (subtotalEl) subtotalEl.textContent = `$${Number(checkoutState.subtotal).toFixed(2)}`;
  if (feeEl) feeEl.textContent = `$${Number(checkoutState.platformFee).toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${Number(checkoutState.totalAmount).toFixed(2)}`;
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('ship-name').value.trim();
  const address = document.getElementById('ship-address').value.trim();
  const city = document.getElementById('ship-city').value.trim();
  const zip = document.getElementById('ship-zip').value.trim();
  const phone = document.getElementById('ship-phone').value.trim();

  if (!name || !address || !city || !zip) {
    showToast('Please complete all shipping address fields', 'error');
    return;
  }

  const fullShippingAddress = `${name}, ${address}, ${city} - ${zip}. Contact: ${phone}`;

  const submitBtn = document.getElementById('btn-place-order');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing Order...';
  }

  try {
    const payload = {
      shippingAddress: fullShippingAddress,
      isDirectBuy: checkoutState.isDirectBuy,
      directItem: checkoutState.directItem
    };

    const orderResult = await API.checkout(payload);
    showToast('Order confirmed! Arigato!', 'success');
    updateCartBadge();

    setTimeout(() => {
      window.location.href = 'orders.html';
    }, 1200);
  } catch (err) {
    showToast(err.message || 'Checkout failed', 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Order & Pay';
    }
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}
