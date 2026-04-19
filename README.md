# 🛒 Grocery Website

## 🚀 Overview

A full-stack grocery shopping web application where users can browse products, add items to cart, and place orders with secure authentication and payment integration.


## ✨ Features

* 🛍️ Browse grocery products
* 🛒 Add to cart & manage items
* 🔐 User authentication
* 💳 Online payment integration
* 📦 Order placement system


## 🛠️ Tech Stack

* Frontend: React.js
* Backend: Node.js, Express.js
* Database: MongoDB
* Payment: Stripe


## 📂 Project Structure

client/   → Frontend (React)
server/   → Backend (Node.js + Express)


## ▶️ Run Locally

### 1. Start Backend Server

cd server
npm install
npm run server

### 2. Start Frontend Client

cd client
npm install
npm run dev

### 3. Open in Browser

http://localhost:5173


## ⚙️ Environment Variables

Create a `.env` file in both **client** and **server** folders and add required keys like:

JWT_SECRET=your_key
NODE_ENV=your_key

SELLER_EMAIL=your_email
SELLER_PASSWORD=your_password

MONGODB_URI=your_key

CLOUDINARY_CLOUD_NAME=your_key
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_key

STRIPE_PUBLISHABLE_KEY=your_key
STRIPE_SECRET_KEY=your_key
