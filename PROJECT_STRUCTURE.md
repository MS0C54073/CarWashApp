# SUKA Car Wash System - Complete Project Structure

## 📁 Project Overview

```
Sucar/
├── backend/              # Node.js + Express + TypeScript API
├── mobile-flutter/       # Flutter mobile app (iOS & Android)
├── dashboard-nextjs/     # Next.js dashboard (Admin & Car Wash)
├── shared-types/         # Shared TypeScript types package
└── README.md
```

## 🎯 System Architecture

### 1. Backend API (`backend/`)
- **Technology**: Node.js, Express, TypeScript, MongoDB
- **Port**: 5000
- **Features**:
  - RESTful API
  - JWT Authentication
  - Role-based access control
  - MongoDB with Mongoose

### 2. Mobile App (`mobile-flutter/`)
- **Technology**: Flutter (Dart)
- **Platform**: iOS & Android (Cross-platform)
- **Features**:
  - Client interface for booking
  - Driver interface for accepting bookings
  - Real-time status tracking
  - Vehicle management

### 3. Dashboard (`dashboard-nextjs/`)
- **Technology**: Next.js 14, React, TypeScript, Tailwind CSS
- **Port**: 3000
- **Features**:
  - Admin dashboard
  - Car Wash operator dashboard
  - Analytics and reports
  - Booking management

### 4. Shared Types (`shared-types/`)
- **Technology**: TypeScript
- **Purpose**: Common data models shared across projects
- **Types**: User, Booking, Vehicle, Service, etc.

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
npm run dev
```

### Mobile App (Flutter)
```bash
cd mobile-flutter
flutter pub get
flutter run
```

### Dashboard (Next.js)
```bash
cd dashboard-nextjs
npm install
npm run dev
```

## 📱 Cross-Platform Support

### Mobile App
- ✅ **iOS**: Native iOS app via Flutter
- ✅ **Android**: Native Android app via Flutter
- ✅ **Single Codebase**: One Flutter codebase for both platforms

### Dashboard
- ✅ **Web**: Accessible via browser
- ✅ **Responsive**: Works on desktop, tablet, and mobile browsers

## 🔗 Integration

All three components connect to the same backend API:
- **Backend**: `http://localhost:5000/api`
- **Mobile**: Configured in `mobile-flutter/lib/services/api_service.dart`
- **Dashboard**: Configured in `dashboard-nextjs/next.config.js`

## 📊 Data Flow

1. **Client** uses Flutter mobile app to create bookings
2. **Driver** uses Flutter mobile app to accept/manage bookings
3. **Car Wash** uses Next.js dashboard to update wash status
4. **Admin** uses Next.js dashboard to manage system
5. All communicate via **Backend API**

## 🎨 Shared Types

Common data models defined in `shared-types/`:
- `Booking` - Booking status and details
- `User` - User roles and information
- `Vehicle` - Vehicle details
- `Service` - Car wash services
- `VehicleStatus` - Status enumeration helpers

These types ensure consistency across:
- Backend API responses
- Flutter mobile app models
- Next.js dashboard components
