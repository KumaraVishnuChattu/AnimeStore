/**
 * Anime Store API Client & Fallback Mock Engine
 * Connects to Spring Boot backend (/api) with graceful local fallback
 */

const API_BASE_URL = 'http://localhost:8080/api';

// Exact 12 Finalized Products
const EXACT_PRODUCTS = [
  {
    id: 1,
    name: "Ash's Cap",
    price: 499.00,
    rating: 4.4,
    description: "The Winner's Cap!",
    imageUrl: "../assets/prod/Ashh.jpg"
  },
  {
    id: 2,
    name: "Death Note",
    price: 1399.00,
    rating: 4.3,
    description: "Do you like writing names!?",
    imageUrl: "../assets/prod/DeathNote.jpg"
  },
  {
    id: 3,
    name: "Red Scarf",
    price: 544.00,
    rating: 5.0,
    description: "Stock Unavailable!",
    imageUrl: "../assets/prod/mykasa.jpg"
  },
  {
    id: 4,
    name: "T-Shirt",
    price: 599.00,
    rating: 4.3,
    description: "I am not Zenin, Took my wife's name!",
    imageUrl: "../assets/prod/notZenin.jpg"
  },
  {
    id: 5,
    name: "Mouse Pad",
    price: 399.00,
    rating: 4.9,
    description: 'Make your Mouse "Ultra Instinct"',
    imageUrl: "../assets/prod/Og.jpg"
  },
  {
    id: 6,
    name: "Anya-Man",
    price: 399.00,
    rating: 4.7,
    description: "The Honoured One!",
    imageUrl: "../assets/prod/theGoat.jpg"
  },
  {
    id: 7,
    name: "The Mask",
    price: 499.00,
    rating: 4.9,
    description: "These fools can never make me sweat.",
    imageUrl: "../assets/prod/tobi.jpg"
  },
  {
    id: 8,
    name: "Mini-Waguri",
    price: 399.00,
    rating: 4.4,
    description: "Cake Loverss all around!",
    imageUrl: "../assets/prod/Waguri.jpg"
  },
  {
    id: 9,
    name: "Umbrella",
    price: 350.00,
    rating: 4.5,
    description: "Get your Infinity!",
    imageUrl: "../assets/prod/GojoUmb.jpg"
  },
  {
    id: 10,
    name: "iPhone Case",
    price: 300.00,
    rating: 4.2,
    description: "Why no one thinks about denji's heart!?",
    imageUrl: "../assets/prod/Denji.jpg"
  },
  {
    id: 11,
    name: "The Cup",
    price: 179.00,
    rating: 4.6,
    description: "Peace.",
    imageUrl: "../assets/prod/Thorfinn.jpg"
  },
  {
    id: 12,
    name: "Hoodie",
    price: 699.00,
    rating: 4.1,
    description: "It's time to wake the inner monster!",
    imageUrl: "../assets/prod/BlueLock.jpg"
  }
];

// Helper: Toast notifications
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Session & Auth Management
const Auth = {
  getUser() {
    const raw = localStorage.getItem('anime_user');
    return raw ? JSON.parse(raw) : null;
  },
  getToken() {
    return localStorage.getItem('anime_token') || '';
  },
  setSession(user, token) {
    localStorage.setItem('anime_user', JSON.stringify(user));
    if (token) localStorage.setItem('anime_token', token);
  },
  clearSession() {
    localStorage.removeItem('anime_user');
    localStorage.removeItem('anime_token');
  },
  isLoggedIn() {
    return !!this.getUser();
  },
  requireAuth(redirectUrl = 'login.html') {
    if (!this.isLoggedIn()) {
      showToast('Please log in to continue', 'error');
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 500);
      return false;
    }
    return true;
  }
};

// LocalStorage Mock Engine (Directive #3 Graceful Fallback)
const MockEngine = {
  getUsers() {
    const u = localStorage.getItem('mock_anime_users');
    return u ? JSON.parse(u) : [];
  },
  saveUsers(users) {
    localStorage.setItem('mock_anime_users', JSON.stringify(users));
  },
  getCart(userId) {
    const key = `mock_cart_${userId}`;
    const raw = localStorage.getItem(key);
    const items = raw ? JSON.parse(raw) : [];

    let subtotal = 0;
    const formattedItems = items.map(item => {
      const prod = EXACT_PRODUCTS.find(p => p.id === item.productId) || {};
      const lineTotal = (prod.price || 0) * item.quantity;
      subtotal += lineTotal;
      return {
        id: item.id || Date.now() + Math.random(),
        productId: prod.id,
        productName: prod.name,
        productDescription: prod.description,
        price: prod.price,
        rating: prod.rating,
        imageUrl: prod.imageUrl,
        quantity: item.quantity,
        lineTotal: lineTotal
      };
    });

    const platformFee = Math.round(subtotal * 0.044 * 100) / 100;
    const totalAmount = Math.round((subtotal + platformFee) * 100) / 100;
    const itemCount = formattedItems.reduce((acc, cur) => acc + cur.quantity, 0);

    return {
      items: formattedItems,
      subtotal: subtotal,
      platformFee: platformFee,
      totalAmount: totalAmount,
      itemCount: itemCount
    };
  },
  saveCart(userId, items) {
    localStorage.setItem(`mock_cart_${userId}`, JSON.stringify(items));
  },
  getOrders(userId) {
    const key = `mock_orders_${userId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  },
  saveOrder(userId, order) {
    const orders = this.getOrders(userId);
    orders.unshift(order);
    localStorage.setItem(`mock_orders_${userId}`, JSON.stringify(orders));
  }
};

// Unified API Caller with Fallback
async function apiFetch(endpoint, options = {}) {
  const token = Auth.getToken();
  const user = Auth.getUser();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (user && user.id) {
    headers['X-User-Id'] = user.id.toString();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.message || errorJson.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[AnimeStore API] Live call to ${endpoint} failed (${err.message}). Using local fallback.`);
    return null; // Signals fallback to mock
  }
}

// API Service
const API = {
  // 1. Auth Service
  async register({ email, mobileNumber, password, otp }) {
    const live = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, mobileNumber, password, otp })
    });

    if (live && live.success) {
      Auth.setSession({ id: live.id, email: live.email, mobileNumber: live.mobileNumber, createdAt: live.createdAt }, live.token);
      return live;
    }

    // Mock fallback
    if (!otp || !/^\d{4}$/.test(otp)) {
      throw new Error("OTP must be a valid 4-digit code");
    }

    const users = MockEngine.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      throw new Error("Email is already registered");
    }

    const newUser = {
      id: Date.now(),
      email: email.trim().toLowerCase(),
      mobileNumber: mobileNumber || '',
      password: password, // In mock we store plain, backend uses BCrypt
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    MockEngine.saveUsers(users);

    const sessionUser = { id: newUser.id, email: newUser.email, mobileNumber: newUser.mobileNumber, createdAt: newUser.createdAt };
    Auth.setSession(sessionUser, `tok_${newUser.id}_mock`);
    return { success: true, message: "Registration successful (Local Mode)", ...sessionUser };
  },

  async login({ email, password }) {
    const live = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (live && live.success) {
      Auth.setSession({ id: live.id, email: live.email, mobileNumber: live.mobileNumber, createdAt: live.createdAt }, live.token);
      return live;
    }

    // Mock fallback
    const users = MockEngine.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user || user.password !== password) {
      // Demo test user check
      if (email === 'demo@animestore.com' && password === 'demo123') {
        const demoUser = { id: 100, email: 'demo@animestore.com', mobileNumber: '+81-90-1234-5678', createdAt: new Date().toISOString() };
        Auth.setSession(demoUser, 'tok_100_mock');
        return { success: true, message: "Login successful", ...demoUser };
      }
      throw new Error("Invalid email or password");
    }

    const sessionUser = { id: user.id, email: user.email, mobileNumber: user.mobileNumber, createdAt: user.createdAt };
    Auth.setSession(sessionUser, `tok_${user.id}_mock`);
    return { success: true, message: "Login successful (Local Mode)", ...sessionUser };
  },

  // 2. Product Service
  async getProducts({ search = '', sort = '' } = {}) {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (sort) query.append('sort', sort);

    const live = await apiFetch(`/products?${query.toString()}`);
    if (live && Array.isArray(live)) {
      return live;
    }

    // Mock fallback: Exact 12 products
    let list = [...EXACT_PRODUCTS];

    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    if (sort === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating_desc') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  },

  async getProductById(id) {
    const live = await apiFetch(`/products/${id}`);
    if (live && live.id) {
      return live;
    }
    return EXACT_PRODUCTS.find(p => p.id === Number(id)) || null;
  },

  // 3. Cart Service
  async getCart() {
    const user = Auth.getUser();
    if (!user) return { items: [], subtotal: 0, platformFee: 0, totalAmount: 0, itemCount: 0 };

    const live = await apiFetch('/cart');
    if (live && live.items) {
      return live;
    }

    return MockEngine.getCart(user.id);
  },

  async addToCart(productId, quantity = 1) {
    const user = Auth.getUser();
    if (!user) {
      throw new Error("Please log in to add items to cart");
    }

    const live = await apiFetch('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
    if (live && live.items) {
      return live;
    }

    // Mock fallback
    const key = `mock_cart_${user.id}`;
    let items = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : [];
    const existing = items.find(i => i.productId === Number(productId));
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ id: Date.now(), productId: Number(productId), quantity });
    }
    MockEngine.saveCart(user.id, items);
    return MockEngine.getCart(user.id);
  },

  async updateCartItem(itemId, quantity) {
    const user = Auth.getUser();
    if (!user) return;

    const live = await apiFetch(`/cart/item/${itemId}?quantity=${quantity}`, {
      method: 'PUT'
    });
    if (live && live.items) {
      return live;
    }

    // Mock fallback
    const key = `mock_cart_${user.id}`;
    let items = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : [];
    if (quantity <= 0) {
      items = items.filter(i => (i.id !== Number(itemId) && i.productId !== Number(itemId)));
    } else {
      const match = items.find(i => i.id === Number(itemId) || i.productId === Number(itemId));
      if (match) match.quantity = quantity;
    }
    MockEngine.saveCart(user.id, items);
    return MockEngine.getCart(user.id);
  },

  async removeCartItem(itemId) {
    return this.updateCartItem(itemId, 0);
  },

  async clearCart() {
    const user = Auth.getUser();
    if (!user) return;

    await apiFetch('/cart/clear', { method: 'DELETE' });
    MockEngine.saveCart(user.id, []);
  },

  // 4. Order Service
  async checkout({ shippingAddress, isDirectBuy = false, directItem = null, items = null }) {
    const user = Auth.getUser();
    if (!user) throw new Error("Please log in to checkout");

    const live = await apiFetch('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress, isDirectBuy, directItem, items })
    });
    if (live && live.id) {
      return live;
    }

    // Mock fallback
    let orderItemsData = [];
    if (isDirectBuy && directItem) {
      const prod = EXACT_PRODUCTS.find(p => p.id === Number(directItem.productId));
      if (prod) {
        orderItemsData.push({
          id: Date.now(),
          productId: prod.id,
          productName: prod.name,
          imageUrl: prod.imageUrl,
          quantity: directItem.quantity,
          unitPrice: prod.price,
          itemTotal: prod.price * directItem.quantity
        });
      }
    } else {
      const currentCart = MockEngine.getCart(user.id);
      if (!currentCart.items.length) {
        throw new Error("Cart is empty");
      }
      orderItemsData = currentCart.items.map(item => ({
        id: Date.now() + Math.random(),
        productId: item.productId,
        productName: item.productName,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
        unitPrice: item.price,
        itemTotal: item.lineTotal
      }));
      // Clear cart
      MockEngine.saveCart(user.id, []);
    }

    const subtotal = orderItemsData.reduce((acc, cur) => acc + cur.itemTotal, 0);
    const platformFee = Math.round(subtotal * 0.044 * 100) / 100;
    const totalAmount = Math.round((subtotal + platformFee) * 100) / 100;

    const mockOrder = {
      id: Math.floor(1000 + Math.random() * 9000),
      userId: user.id,
      subtotal: subtotal,
      platformFee: platformFee,
      totalAmount: totalAmount,
      shippingAddress: shippingAddress,
      status: "CONFIRMED",
      createdAt: new Date().toISOString(),
      items: orderItemsData
    };

    MockEngine.saveOrder(user.id, mockOrder);
    return mockOrder;
  },

  async getMyOrders() {
    const user = Auth.getUser();
    if (!user) return [];

    const live = await apiFetch('/orders/my-orders');
    if (live && Array.isArray(live)) {
      return live;
    }

    return MockEngine.getOrders(user.id);
  }
};
