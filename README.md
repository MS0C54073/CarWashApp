# SuCAR - Car Wash Pickup Booking System

A comprehensive cross-platform car wash booking system that connects clients, drivers, car wash operators, and administrators.

## System Overview

SuCAR (SuKA) is a full-stack application designed to automate car wash bookings and pickups, reducing client waiting time and improving service efficiency.

## Features

### Client Features
- Register/Login
- Book car wash pickup
- Select preferred driver and car wash
- Track booking status in real-time
- Manage vehicles
- View booking history

### Driver Features
- Register/Login
- Accept/decline booking requests
- Update booking status (Picked Up → Delivered)
- View assigned bookings
- Track performance

### Car Wash Features
- Register/Login
- Manage services and pricing
- Update vehicle status (Waiting Bay → Washing Bay → Drying Bay → Done)
- View incoming bookings
- Monitor revenue

### Admin Features
- Dashboard with statistics
- Manage drivers
- Manage bookings
- Assign drivers to bookings
- View reports and analytics
- Payment tracking

## Technology Stack

### Backend
- **Node.js** with **Express**
- **TypeScript**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend (Web Dashboard)
- **React** with **TypeScript**
- **Vite** for build tooling
- **React Router** for navigation
- **React Query** for data fetching
- **Recharts** for analytics

### Mobile App
- **React Native** with **Expo**
- **TypeScript**
- **React Navigation**
- **Axios** for API calls
- **AsyncStorage** for local storage

## Project Structure

```
Sucar/
├── backend/          # Node.js/Express API
│   ├── src/
│   │   ├── models/      # MongoDB models
│   │   ├── controllers/ # Route controllers
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Auth middleware
│   │   └── config/      # Database config
│   └── package.json
├── frontend/        # React web dashboard
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── context/     # Auth context
│   └── package.json
└── mobile/         # React Native app
    ├── src/
    │   ├── screens/     # Screen components
    │   └── context/     # Auth context
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sucar
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup (Web Dashboard)

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### Mobile App Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `src/context/AuthContext.tsx`:
```typescript
const API_URL = 'http://YOUR_IP_ADDRESS:5000/api'; // Use your computer's IP for emulator/device
```

4. Start Expo:
```bash
npm start
```

5. For iOS Simulator:
```bash
npm run ios
```

6. For Android Emulator:
```bash
npm run android
```

## Testing with Emulators

### iOS Simulator (macOS only)
1. Install Xcode from App Store
2. Open Xcode and install iOS Simulator
3. Run `npm run ios` in the mobile directory

### Android Emulator
1. Install Android Studio
2. Set up Android Virtual Device (AVD)
3. Start the emulator from Android Studio
4. Run `npm run android` in the mobile directory

### Web Testing
- Frontend dashboard: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Bookings
- `GET /api/bookings` - Get all bookings (filtered by role)
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/status` - Update booking status
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Drivers
- `GET /api/drivers/available` - Get available drivers
- `GET /api/drivers/bookings` - Get driver bookings
- `PUT /api/drivers/bookings/:id/accept` - Accept booking
- `PUT /api/drivers/bookings/:id/decline` - Decline booking

### Car Wash
- `GET /api/carwash/list` - Get all car washes
- `GET /api/carwash/services` - Get services
- `GET /api/carwash/bookings` - Get car wash bookings
- `GET /api/carwash/dashboard` - Get dashboard stats
- `POST /api/carwash/services` - Create service
- `PUT /api/carwash/services/:id` - Update service

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/bookings` - Get all bookings
- `PUT /api/admin/bookings/:id/assign-driver` - Assign driver
- `GET /api/admin/reports` - Get reports

### Vehicles
- `GET /api/vehicles` - Get user vehicles
- `POST /api/vehicles` - Add vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `GET /api/payments/booking/:bookingId` - Get payment by booking

## User Roles

1. **Client**: Can book car washes, manage vehicles, track bookings
2. **Driver**: Can accept bookings, update pickup/delivery status
3. **Car Wash**: Can manage services, update wash status
4. **Admin**: Full system access, manage all entities

## Database Schema

- **Users**: Clients, Drivers, Car Washes, Admins
- **Vehicles**: Client vehicle information
- **Bookings**: Booking records with status tracking
- **Services**: Car wash services and pricing
- **Payments**: Payment records

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation
- Protected API routes

## Future Enhancements

- GPS-based live vehicle tracking
- Push notifications
- Payment gateway integration
- Real-time updates with WebSockets
- AI-driven route optimization
- Business intelligence dashboards

## License

ISC

## Support

For issues and questions, please contact the development team.
