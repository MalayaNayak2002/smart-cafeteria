# 🍽️ Smart Cafeteria

A full-stack cafeteria ordering system that lets users browse the menu, place orders, and checkout — with a staff dashboard for order management and an AI-powered upsell engine to recommend add-ons. Built across three platforms: a web app, a REST API, and a native Android app.

## 📌 Features

- 📋 Browse cafeteria menu items
- 🛒 Place and checkout orders
- 👨‍🍳 Staff dashboard to view and manage incoming orders
- 🤖 AI-powered upsell engine — suggests relevant add-ons during checkout
- 📱 Native Android app for on-the-go ordering
- 🔐 User authentication

## 🛠️ Tech Stack

**Web Frontend**
- Next.js
- TypeScript
- React

**Backend API**
- Fastify
- Node.js
- TypeScript
- Prisma ORM
- PostgreSQL

**Android App**
- Kotlin
- Jetpack Compose

**Infrastructure**
- Docker & Docker Compose

## 📂 Project Structure

```
smart-cafeteria/
├── web/              # Next.js frontend
│   └── app/
│       ├── menu/
│       ├── checkout/
│       ├── orders/
│       └── staff/
├── api/              # Fastify backend (REST API)
│   ├── src/
│   │   └── routes/
│   │       ├── auth.ts
│   │       ├── menu.ts
│   │       ├── orders.ts
│   │       └── upsell.ts
│   └── prisma/       # Database schema & migrations
├── android/          # Kotlin/Jetpack Compose Android app
│   └── app/src/main/java/com/cafeteria/app/
└── docker-compose.yml
```

## 🔌 API Overview

| Module    | Description                              |
|-----------|-------------------------------------------|
| `auth`    | User authentication and login              |
| `menu`    | Fetch and manage cafeteria menu items       |
| `orders`  | Place, view, and update orders              |
| `upsell`  | AI-powered upsell recommendations           |

## 🚀 Getting Started

### Prerequisites
- Node.js
- PostgreSQL (or use Docker Compose to spin it up)
- Android Studio (for the Android app)
- Docker (optional, for containerized setup)

### Quick Start with Docker

```bash
docker-compose up
```

This spins up the database and backend services together.

### Manual Setup

**Backend (API)**
```bash
cd api
npm install
npx prisma migrate dev
npm run dev
```

**Web Frontend**
```bash
cd web
npm install
npm run dev
```

**Android App**
1. Open the `android/` folder in Android Studio
2. Let Gradle sync
3. Run the app on an emulator or physical device

## 👤 Author

**Malaya Nayak**
- GitHub: [@MalayaNayak2002](https://github.com/MalayaNayak2002)
- LinkedIn: [malaya-nayak](https://www.linkedin.com/in/malaya-nayak)

## 📝 License

This project is open source and available for learning purposes.
