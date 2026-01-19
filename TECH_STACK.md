# SuCAR System - Technology Stack

## 📋 Overview

This document provides a comprehensive overview of all technologies, frameworks, libraries, and tools used in the SuCAR (SuKA) Car Wash Pickup Booking System.

---

## 🏗️ Architecture

**Type**: Full-Stack Application
- **Backend**: RESTful API (Node.js/Express)
- **Frontend**: Single Page Application (React)
- **Database**: PostgreSQL (via Supabase)
- **Mobile**: Flutter (planned) / React Native (alternative)

---

## 🔧 Backend Technology Stack

### Core Framework
- **Node.js** (v18+)
  - Runtime environment for JavaScript/TypeScript
  - Event-driven, non-blocking I/O

- **Express.js** (v4.18.2)
  - Web application framework
  - RESTful API routing
  - Middleware support

- **TypeScript** (v5.3.2)
  - Type-safe JavaScript
  - Enhanced developer experience
  - Better code maintainability

### Database & ORM
- **Supabase** (PostgreSQL)
  - Primary database: PostgreSQL
  - Real-time capabilities
  - Row Level Security (RLS)
  - RESTful API auto-generation
  - Authentication & Authorization

- **@supabase/supabase-js** (v2.90.1)
  - Official Supabase JavaScript client
  - Direct database access
  - Real-time subscriptions

- **pg** (v8.17.1)
  - PostgreSQL client for Node.js
  - Direct SQL queries (if needed)

### Authentication & Security
- **jsonwebtoken** (v9.0.2)
  - JWT token generation and verification
  - Stateless authentication

- **bcryptjs** (v2.4.3)
  - Password hashing and verification
  - Secure password storage

- **express-validator** (v7.0.1)
  - Input validation and sanitization
  - Request validation middleware

### Additional Libraries
- **cors** (v2.8.5)
  - Cross-Origin Resource Sharing
  - API access control

- **dotenv** (v16.3.1)
  - Environment variable management
  - Configuration management

- **nodemailer** (v6.9.7)
  - Email sending capabilities
  - Notification emails

- **multer** (v1.4.5-lts.1)
  - File upload handling
  - Multipart form data

- **socket.io** (v4.6.1)
  - Real-time bidirectional communication
  - WebSocket support (for future real-time features)

### Development Tools
- **ts-node-dev** (v2.0.0)
  - TypeScript execution
  - Hot reloading
  - Development server

---

## 🎨 Frontend Technology Stack

### Core Framework
- **React** (v18.2.0)
  - UI library
  - Component-based architecture
  - Virtual DOM

- **TypeScript** (v5.2.2)
  - Type-safe React development
  - Enhanced IntelliSense
  - Compile-time error checking

### Build Tool & Dev Server
- **Vite** (v5.0.0)
  - Fast build tool
  - Hot Module Replacement (HMR)
  - Optimized production builds
  - Development server with proxy

### Routing
- **react-router-dom** (v6.20.0)
  - Client-side routing
  - Navigation management
  - Protected routes

### State Management & Data Fetching
- **@tanstack/react-query** (v5.8.4)
  - Server state management
  - Data fetching and caching
  - Automatic refetching
  - Optimistic updates

- **React Context API**
  - Global state (Authentication)
  - Theme management
  - User context

### HTTP Client
- **axios** (v1.6.2)
  - HTTP requests
  - Request/response interceptors
  - Promise-based API

### Mapping & Location
- **mapbox-gl** (v3.18.0)
  - Interactive maps
  - Custom markers
  - Real-time location tracking
  - Route visualization

- **@types/mapbox-gl** (v3.4.1)
  - TypeScript definitions for Mapbox

### Data Visualization
- **recharts** (v2.10.3)
  - Chart library for React
  - Analytics dashboards
  - Data visualization

### Utilities
- **date-fns** (v2.30.0)
  - Date manipulation and formatting
  - Relative time calculations

### Code Quality
- **ESLint** (v8.53.0)
  - Code linting
  - Code quality enforcement

- **TypeScript ESLint**
  - TypeScript-specific linting rules

---

## 🗄️ Database Technology

### Primary Database
- **PostgreSQL** (via Supabase)
  - Relational database
  - ACID compliance
  - Advanced querying capabilities
  - JSON support

### Database Features
- **Row Level Security (RLS)**
  - Fine-grained access control
  - User-based data filtering

- **Database Triggers**
  - Automated actions
  - Queue position updates
  - Status transitions

- **Foreign Key Constraints**
  - Referential integrity
  - Data consistency

- **Indexes**
  - Query optimization
  - Performance enhancement

---

## 🎯 Styling & UI

### CSS Approach
- **Custom CSS** with CSS Variables
  - Design system with CSS custom properties
  - Theme support (light/dark)
  - Responsive design
  - Mobile-first approach

### Design System
- **CSS Variables** for:
  - Colors (primary, secondary, success, error, warning)
  - Spacing (space-1 to space-16)
  - Typography (text-xs to text-4xl)
  - Border radius (sm, md, lg, xl, full)
  - Shadows (sm, md, lg, xl)
  - Transitions

### Responsive Design
- **Mobile-First** approach
- **Media Queries** for breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

---

## 📱 Mobile App (Planned)

### Framework Options
- **Flutter** (Dart)
  - Cross-platform mobile development
  - Single codebase for iOS and Android
  - Native performance

- **React Native** (Alternative)
  - JavaScript/TypeScript
  - Code sharing with web app

---

## 🔐 Security Technologies

### Authentication
- **JWT (JSON Web Tokens)**
  - Stateless authentication
  - Token-based sessions
  - Secure token storage

### Password Security
- **bcryptjs**
  - Salted password hashing
  - Cost factor configuration

### Data Security
- **Row Level Security (RLS)**
  - Database-level access control
  - User-based data filtering

- **HTTPS** (Production)
  - Encrypted data transmission

- **Input Validation**
  - express-validator
  - XSS prevention
  - SQL injection prevention

---

## 🚀 Deployment & DevOps

### Development
- **Local Supabase** (Docker)
  - Local database instance
  - Development environment

- **Environment Variables**
  - `.env` files
  - Configuration management

### Build Tools
- **TypeScript Compiler**
  - Type checking
  - Code compilation

- **Vite Build**
  - Production optimization
  - Code splitting
  - Asset optimization

---

## 📦 Package Management

- **npm**
  - Node Package Manager
  - Dependency management

---

## 🗂️ Project Structure

```
Sucar/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── config/       # Configuration (Supabase, database)
│   │   ├── controllers/  # Route controllers
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth, validation middleware
│   │   ├── migrations/   # Database migrations
│   │   └── utils/        # Utility functions
│   └── scripts/          # Utility scripts
│
├── frontend/             # React Web Application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React Context (Auth, Theme)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API services
│   │   ├── data/         # Static data (car makes/models)
│   │   └── styles/       # Global styles
│   └── public/           # Static assets
│
├── mobile/               # Mobile app (React Native)
│   └── src/
│       └── screens/      # Mobile screens
│
└── shared-types/         # Shared TypeScript types
```

---

## 🔄 Real-Time Features

### Current Implementation
- **Polling** (HTTP requests at intervals)
  - Bookings: 10-second intervals
  - Chat: 3-second intervals
  - Queue: 5-second intervals

### Future Enhancement
- **WebSocket/Socket.io**
  - True real-time updates
  - Bidirectional communication
  - Lower latency

---

## 📊 Key Libraries & Tools Summary

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | v18+ |
| Express | Web Framework | 4.18.2 |
| TypeScript | Language | 5.3.2 |
| Supabase | Database/Backend | 2.90.1 |
| JWT | Authentication | 9.0.2 |
| bcryptjs | Password Hashing | 2.4.3 |
| express-validator | Validation | 7.0.1 |
| Socket.io | Real-time (Future) | 4.6.1 |

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Library | 18.2.0 |
| TypeScript | Language | 5.2.2 |
| Vite | Build Tool | 5.0.0 |
| React Router | Routing | 6.20.0 |
| React Query | Data Fetching | 5.8.4 |
| Axios | HTTP Client | 1.6.2 |
| Mapbox GL | Maps | 3.18.0 |
| Recharts | Charts | 2.10.3 |

---

## 🌐 API Architecture

### API Style
- **RESTful API**
  - Standard HTTP methods (GET, POST, PUT, DELETE)
  - Resource-based URLs
  - JSON request/response format

### API Endpoints Structure
```
/api/auth/*          - Authentication
/api/bookings/*      - Booking management
/api/drivers/*       - Driver operations
/api/carwash/*       - Car wash operations
/api/admin/*         - Admin operations
/api/vehicles/*      - Vehicle management
/api/payments/*      - Payment processing
/api/chat/*          - Chat/messaging
/api/queue/*         - Queue management
```

---

## 🎨 UI/UX Technologies

### Design Approach
- **Component-Based Design**
  - Reusable UI components
  - Consistent design system

### Styling
- **CSS Custom Properties**
  - Theme variables
  - Dynamic theming

- **Responsive CSS**
  - Mobile-first design
  - Flexible layouts
  - Media queries

---

## 🔍 Development Workflow

### Backend Development
1. **TypeScript** → Compile to JavaScript
2. **ts-node-dev** → Hot reloading
3. **Express** → API server
4. **Supabase** → Database connection

### Frontend Development
1. **Vite** → Development server
2. **React** → Component rendering
3. **React Query** → Data fetching
4. **Hot Module Replacement** → Instant updates

---

## 📈 Performance Optimizations

### Frontend
- **Code Splitting** (Vite)
- **Lazy Loading** (React)
- **Query Caching** (React Query)
- **Optimistic Updates**

### Backend
- **Database Indexing**
- **Query Optimization**
- **Connection Pooling** (Supabase)

---

## 🔒 Security Features

1. **Authentication**: JWT tokens
2. **Authorization**: Role-based access control
3. **Password Security**: bcrypt hashing
4. **Input Validation**: express-validator
5. **Database Security**: Row Level Security (RLS)
6. **CORS**: Configured for specific origins

---

## 📝 Code Quality

- **TypeScript**: Type safety
- **ESLint**: Code linting
- **Strict Mode**: Enabled
- **Code Organization**: Modular structure

---

## 🚀 Deployment Ready

### Production Build
- **Backend**: `npm run build` → `dist/` folder
- **Frontend**: `npm run build` → `dist/` folder
- **Environment Variables**: Configured via `.env`

### Hosting Options
- **Backend**: Node.js hosting (Heroku, Railway, AWS, etc.)
- **Frontend**: Static hosting (Vercel, Netlify, AWS S3, etc.)
- **Database**: Supabase Cloud or self-hosted PostgreSQL

---

## 📚 Additional Tools & Services

### Mapping
- **Mapbox GL JS**
  - Interactive maps
  - Custom markers
  - Real-time tracking

### Notifications (Planned)
- **Email**: nodemailer
- **SMS**: Third-party service (Twilio, etc.)
- **Push Notifications**: Firebase Cloud Messaging (FCM)

---

## 🎯 Summary

**SuCAR** is built with a modern, production-ready tech stack:

- ✅ **TypeScript** throughout (type safety)
- ✅ **React** for frontend (component-based UI)
- ✅ **Node.js/Express** for backend (RESTful API)
- ✅ **PostgreSQL/Supabase** for database (relational, secure)
- ✅ **Modern tooling** (Vite, React Query, Mapbox)
- ✅ **Security-first** (JWT, bcrypt, RLS)
- ✅ **Scalable architecture** (modular, service-oriented)
- ✅ **Production-ready** (optimized builds, error handling)

This stack provides a solid foundation for a scalable, maintainable, and secure car wash booking platform.
