/**
 * Anime Store Orders History Controller
 * Displays order receipts, status badge, itemized breakdown with 4.4% fee
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth('login.html')) return;
  loadOrdersPage();
});

async function loadOrdersPage() {
  const container = document.getElementById('orders-list-container');
  if (!container) return;

  try {
    const orders = await API.getMyOrders();
    renderOrders(orders);
  } catch (err) {
    showToast('Failed to load orders', 'error');
  }
}

function renderOrders(orders) {
  const container = document.getElementById('orders-list-container');
  if (!container) return;

  if (!orders || orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>No Orders Placed Yet!</h2>
        <p>You haven't ordered any anime collectibles yet. Start building your collection!</p>
        <button class="btn-buy" style="max-width: 200px; margin: 0 auto;" onclick="window.location.href='products.html'">Browse Anime Store</button>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map(order => {
    const dateFormatted = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recent';
    const subtotal = Number(order.subtotal).toFixed(2);
    const platformFee = Number(order.platformFee).toFixed(2);
    const totalAmount = Number(order.totalAmount).toFixed(2);

    const itemsRows = (order.items || []).map(item => `
      <tr>
        <td style="display:flex; align-items:center; gap:12px;">
          <img src="${item.imageUrl || '../assets/prod/Ashh.jpg'}" alt="${escapeHtml(item.productName)}" style="width:45px; height:45px; object-fit:cover; border-radius:8px; border:1px solid #D6BE82;">
          <span>${escapeHtml(item.productName)}</span>
        </td>
        <td>${item.quantity}</td>
        <td>$${Number(item.unitPrice).toFixed(2)}</td>
        <td style="text-align:right; font-weight:bold;">$${Number(item.itemTotal || (item.unitPrice * item.quantity)).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <div class="order-box">
        <div class="order-box-header">
          <div>
            <span class="order-box-id">Order #${order.id}</span>
            <div class="order-date">Placed on: ${dateFormatted}</div>
          </div>
          <span class="order-status-badge">${order.status || 'CONFIRMED'}</span>
        </div>

        <table class="order-items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="order-box-footer">
          <div class="shipping-info">
            <strong>Delivery Address:</strong><br>
            ${escapeHtml(order.shippingAddress || 'Standard Delivery')}
          </div>
          <div class="bill-breakdown">
            <div>Subtotal: <strong>$${subtotal}</strong></div>
            <div>Platform Fee (4.4%): <strong>$${platformFee}</strong></div>
            <div class="final-total">Total Amount: <strong>$${totalAmount}</strong></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}
