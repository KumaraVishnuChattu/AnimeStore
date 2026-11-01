# 🌸 アニメ STORE (Anime Store) - Full Stack E-Commerce Web Application

An anime-themed e-commerce web platform engineered with Vanilla HTML5, CSS3, JavaScript (Fetch API + LocalStorage), Spring Boot 3.x, Spring Data JPA, and MySQL 8.x.

---

## 📁 Project Architecture & Directory Layout

```
AnimeStore/
├── assets/                       # Image assets and hero video clips
│   ├── prod/                     # 12 Finalized product images
│   ├── bgv1.mp4, bgv2.mp4, ...   # Hero background video loops
│   └── logoicon.jpg              # Cherry blossom store icon
├── backend/                      # Spring Boot 3.x REST API
│   ├── pom.xml                   # Maven dependencies (Spring Boot, JPA, Security, MySQL)
│   └── src/
│       ├── main/
│       │   ├── java/com/animestore/
│       │   │   ├── AnimeStoreApplication.java
│       │   │   ├── config/       # CorsConfig & SecurityConfig (BCrypt)
│       │   │   ├── controller/   # Auth, Product, Cart, Order Controllers
│       │   │   ├── dto/          # Requests & itemized response objects
│       │   │   ├── entity/       # User, Product, CartItem, Order, OrderItem
│       │   │   ├── repository/   # Spring Data JPA Repositories
│       │   │   └── service/      # Auth, Product, Cart, and Order business logic
│       │   └── resources/
│       │       ├── application.properties
│       │       ├── schema.sql    # DDL for MySQL tables
│       │       └── data.sql      # DML for exact 12 products
│       └── test/
├── js/                           # Vanilla JS Frontend Modules
│   ├── api.js                    # Unified REST client with automatic LocalStorage fallback
│   ├── navbar.js                 # Dynamic header nav state & live cart badge
│   ├── products.js               # Dynamic search, sorting, modal popup, & cart integration
│   ├── cart.js                   # Cart quantities (+/-), 4.4% platform fee calculation
│   ├── checkout.js               # Address collection & order submission
│   ├── orders.js                 # Past order receipts & itemized bills
│   ├── profile.js                # Member profile & account details
│   └── auth.js                   # Register with demo 4-digit OTP & Sign In
├── pages/                        # HTML Pages
│   ├── index.html                # Hero video landing page + 12 product cards
│   ├── products.html             # Catalog with search, sorting, and detail pop-up modal
│   ├── cart.html                 # Cart table, line totals, 4.4% fee, and checkout button
│   ├── checkout.html             # Shipping form & receipt preview
│   ├── orders.html               # Order history with CONFIRMED status badge
│   ├── profile.html              # Member account view
│   ├── login.html                # Sign-in form
│   ├── register.html             # Account creation with 4-digit demo OTP
│   ├── about.html                # Store mission & story
│   └── contact.html              # Support inquiry form
├── sql/                          # Standalone MySQL Scripts
│   ├── schema.sql                # Table definitions (users, products, cart_items, orders, order_items)
│   └── data.sql                  # Exact 12 product INSERT statements
├── styles/
│   └── index.css                 # Anime theme styles, gradients, glassmorphism, responsive grids
├── index.html                    # Root redirect to pages/index.html
└── README.md
```

---

## 🎌 The 12 Exact Finalized Products

| ID | Product Name | Price (₹/$) | Rating | Image Path | Description |
|---|---|---|---|---|---|
| 1 | `Ash's Cap` | 499.00 | 4.4 / 5 | `../assets/prod/Ashh.jpg` | The Winner's Cap! |
| 2 | `Death Note` | 1399.00 | 4.3 / 5 | `../assets/prod/DeathNote.jpg` | Do you like writing names!? |
| 3 | `Red Scarf` | 544.00 | 5.0 / 5 | `../assets/prod/mykasa.jpg` | Stock Unavailable! |
| 4 | `T-Shirt` | 599.00 | 4.3 / 5 | `../assets/prod/notZenin.jpg` | I am not Zenin, Took my wife's name! |
| 5 | `Mouse Pad` | 399.00 | 4.9 / 5 | `../assets/prod/Og.jpg` | Make your Mouse "Ultra Instinct" |
| 6 | `Anya-Man` | 399.00 | 4.7 / 5 | `../assets/prod/theGoat.jpg` | The Honoured One! |
| 7 | `The Mask` | 499.00 | 4.9 / 5 | `../assets/prod/tobi.jpg` | These fools can never make me sweat. |
| 8 | `Mini-Waguri` | 399.00 | 4.4 / 5 | `../assets/prod/Waguri.jpg` | Cake Loverss all around! |
| 9 | `Umbrella` | 350.00 | 4.5 / 5 | `../assets/prod/GojoUmb.jpg` | Get your Infinity! |
| 10 | `iPhone Case` | 300.00 | 4.2 / 5 | `../assets/prod/Denji.jpg` | Why no one thinks about denji's heart!? |
| 11 | `The Cup` | 179.00 | 4.6 / 5 | `../assets/prod/Thorfinn.jpg` | Peace. |
| 12 | `Hoodie` | 699.00 | 4.1 / 5 | `../assets/prod/BlueLock.jpg` | It's time to wake the inner monster! |

---

## 🗄️ Database Setup (MySQL 8.x)

1. Open MySQL Workbench, MySQL Shell, or command line:
   ```bash
   mysql -u root -p < sql/schema.sql
   mysql -u root -p < sql/data.sql
   ```
2. The database `anime_store_db` will be initialized with:
   - `users`: `id`, `email`, `password_hash`, `mobile_number`, `created_at`
   - `products`: `id`, `name`, `description`, `price`, `rating`, `image_url`
   - `cart_items`: `id`, `user_id`, `product_id`, `quantity`
   - `orders`: `id`, `user_id`, `subtotal`, `platform_fee`, `total_amount`, `shipping_address`, `status`, `created_at`
   - `order_items`: `id`, `order_id`, `product_id`, `quantity`, `unit_price`

---

## 🚀 Running the Spring Boot Backend

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Make sure MySQL is running on `localhost:3306` with username `root` and password `root` (or update `src/main/resources/application.properties`).
3. Run with Maven or open in IntelliJ IDEA / VS Code:
   ```bash
   mvn clean spring-boot:run
   ```
4. Backend REST API will start on `http://localhost:8080`.

### REST API Endpoints

- **Auth**
  - `POST /api/auth/register`: `{ "email": "...", "mobileNumber": "...", "password": "...", "otp": "5440" }`
  - `POST /api/auth/login`: `{ "email": "...", "password": "..." }`
  - `GET /api/auth/me`: Current user session
- **Products**
  - `GET /api/products`: Query params `search` and `sort` (`price_asc`, `price_desc`, `rating_desc`)
  - `GET /api/products/{id}`: Single product
- **Cart (Authenticated)**
  - `GET /api/cart`: Fetch user's cart with subtotal & 4.4% platform fee
  - `POST /api/cart/add`: Add product `{ "productId": 1, "quantity": 1 }`
  - `PUT /api/cart/item/{id}?quantity=X`: Adjust quantity
  - `DELETE /api/cart/item/{id}`: Remove item
  - `DELETE /api/cart/clear`: Empty cart
- **Orders (Authenticated)**
  - `POST /api/orders/checkout`: Place order (Direct Buy or Cart checkout), calculates 4.4% fee, clears cart, saves receipt
  - `GET /api/orders/my-orders`: Retrieve itemized past orders

---

## 🌐 Running the Frontend

- Open `pages/index.html` directly in any web browser, or launch using VS Code Live Server (`http://localhost:5500`).
- **Seamless Offline / Disconnected Fallback (Execution Directive 3):**
  If the Spring Boot backend or MySQL is not running, the application automatically activates the local fallback mode in `js/api.js`. Users can still register, sign in, search & sort the 12 products, interact with the pop-up modal, add items to cart, compute the 4.4% platform fee, and complete checkouts saved to `localStorage`!
