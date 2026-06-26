<div align="center">
  <h1>🍱 Tiffin Connect</h1>
  <p><strong>The Ultimate Home-Cooked Meals Marketplace</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=nodedotjs" alt="Node" />
    <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
  </p>
  
  <p>
    <em>Bridging the gap between food lovers craving authentic home-cooked meals and passionate local home chefs!</em>
  </p>
</div>

---

## 🌐 Live Links

- **Backend API:** [🚀 Deployed on Render](https://tiffin-connect-backend.onrender.com)
- **Frontend App:** 🚧 *Deploying Soon on Vercel...*

---

## 📖 Table of Contents
1. [About The Project](#about-the-project)
2. [Key Features](#-key-features)
3. [Tech Stack](#-tech-stack)
4. [Getting Started (Local Setup)](#-getting-started)
5. [Environment Variables](#-environment-variables)
6. [Future Scope](#-future-scope)

---

## About The Project

Tiffin Connect solves the everyday problem of finding hygienic, affordable, and home-cooked food. Rather than relying on commercial restaurants or unorganized local vendors, this platform empowers local home-makers to turn their kitchens into a legitimate business. At the same time, it provides users with a flexible, subscription-based meal delivery system where they have full control over their weekly and monthly meal schedules.

---

## ✨ Key Features

### 😋 For Food Lovers (Consumers)
* **Explore Local Kitchens:** Find verified home-cooks near your area through an intuitive search interface. View their complete menus, specialties, and user ratings.
* **Smart Subscriptions:** Seamlessly subscribe to weekly or monthly tiffin plans. Choose specific shifts (Lunch/Dinner) and dietary preferences (Veg, Jain, etc.).
* **Flexible "Pause & Resume" System:** Going out of town or skipping a meal? Pause your active tiffin subscription for specific days. The system automatically extends your validity so your money is never wasted.
* **Ratings & Reviews System:** Make informed decisions by reading authentic feedback from other users, and leave your own reviews to support your favorite chefs.
* **Real-time Order Tracking:** Keep a track of your ongoing subscriptions, upcoming meal deliveries, and past order history through a dedicated Consumer Dashboard.

### 🧑‍🍳 For Home Chefs (Providers)
* **Dedicated Kitchen Dashboard:** A clean, metric-driven UI to manage incoming orders, track active subscribers, and monitor overall kitchen performance.
* **Live Menu Management:** Easily add new Tiffin items, set pricing, update descriptions, and upload mouth-watering images directly to Cloudinary.
* **Subscription Tracking:** See exactly who has subscribed for the week or month, and for which shift, allowing for accurate grocery and meal prep planning.
* **Direct Earnings & Payouts Overview:** Track daily and monthly revenue effortlessly. The system automatically calculates earnings based on active and paused subscriptions.

### 🛡️ For Platform Owners (Admin)
* **Centralized Command Center:** Complete oversight of the entire marketplace, including total active users, registered chefs, and platform revenue.
* **Chef Verification System:** Review applications from new home chefs, verify their FSSAI/hygiene credentials, and approve or reject them to maintain platform quality.
* **User & Content Moderation:** Ability to manage user accounts, resolve disputes, and moderate reviews or inappropriate content across the platform.
* **Global Notifications System:** Push important platform updates, alerts, and promotional messages to specific users or all users simultaneously.

---

## 💻 Tech Stack

| Technology | Usage |
| :--- | :--- |
| **React.js & Vite** | Lightning fast frontend framework for building a dynamic, single-page application (SPA). |
| **Node.js & Express** | Robust, scalable backend architecture handling RESTful APIs. |
| **MongoDB & Mongoose** | Flexible NoSQL database with schema modeling for complex relationships (Users, Orders, Menus). |
| **Tailwind CSS & Framer Motion** | Stunning, responsive UI styling combined with smooth micro-animations. |
| **Cloudinary** | Fast and optimized direct image uploads (serverless upload approach). |
| **JWT & Google OAuth** | Secure, token-based authentication system with social login capabilities. |

---

## 🛠 Getting Started

To run this project locally, follow these simple steps:

### 1. Clone the Repo
```bash
git clone https://github.com/itsmenandini21/Tiffin-Connect.git
cd Tiffin-Connect
```

### 2. Run the Backend
```bash
cd tiffinConnectBackend
npm install
node server.js
```

### 3. Run the Frontend (New Terminal Tab)
```bash
cd tiffinConnectFrontend
npm install
npm run dev
```
> The web app will start at `http://localhost:5173`

---

## 🔑 Environment Variables

Create a `.env` file in both backend and frontend folders.

**Backend (`/tiffinConnectBackend/.env`)**
```env
PORT=3000
MONGO_URI=your_mongodb_atlas_url
JWT_SECRET=your_jwt_secret_key
# (Add Google Client IDs if used)
```

**Frontend (`/tiffinConnectFrontend/.env`)**
```env
VITE_API_BASE_URL=http://localhost:3000/api
# (Or your Render URL if testing with live backend)
```

---

<div align="center">
  <b>Made with ❤️ by Nandini Mehrotra</b>
</div>
