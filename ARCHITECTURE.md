# SuCAR System Architecture

## Overview

SuCAR is a car wash booking system with the following architecture:

## System Components

### 1. Backend API (Node.js + Express + TypeScript)
- RESTful API
- Supabase (PostgreSQL) database
- JWT authentication
- Role-based access control

### 2. Frontend Web App (React + TypeScript + Vite)
- React 18 with hooks
- React Query for data fetching
- React Router for navigation
- Mapbox for maps

### 3. Mobile App (React Native/Flutter)
- Cross-platform mobile app
- Real-time updates
- Push notifications

## Architecture Layers

### Backend Layers

```
┌─────────────────────────────────────┐
│         API Layer (Routes)          │
│  - Express routes                   │
│  - Request validation              │
│  - Response formatting             │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      Controller Layer               │
│  - Request handling                │
│  - Business logic orchestration    │
│  - Error handling                  │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│       Service Layer                 │
│  - Business logic                  │
│  - Data transformation             │
│  - External service integration    │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│    Repository/Data Layer            │
│  - Database queries                │
│  - Data access                     │
│  - Caching                         │
└─────────────────────────────────────┘
```

### Frontend Layers

```
┌─────────────────────────────────────┐
│         Presentation Layer           │
│  - React Components                │
│  - Pages                           │
│  - UI Components                   │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│        State Management             │
│  - React Query (Server State)      │
│  - Context API (Global State)     │
│  - Local State (Component State)   │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         Service Layer               │
│  - API Client                      │
│  - Data transformation             │
│  - Error handling                  │
└─────────────────────────────────────┘
```

## Data Flow

### Request Flow (Frontend → Backend)

1. User action in React component
2. Hook calls API service
3. API service makes HTTP request
4. Backend route receives request
5. Middleware validates/auth
6. Controller processes request
7. Service executes business logic
8. Repository queries database
9. Response flows back through layers
10. React Query updates cache
11. Component re-renders

### Error Flow

1. Error occurs in any layer
2. Caught by error handler
3. Transformed to standard format
4. Logged appropriately
5. Returned to client
6. React Query handles error
7. UI displays error message

## Security Architecture

### Authentication
- JWT tokens
- Token refresh mechanism
- Secure token storage

### Authorization
- Role-based access control (RBAC)
- Route-level protection
- Resource-level permissions

### Data Protection
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration

## Database Architecture

### Tables
- users (clients, drivers, carwashes, admins)
- vehicles
- bookings
- services
- payments
- messages
- location_history

### Relationships
- One-to-many: User → Vehicles, User → Bookings
- Many-to-many: Bookings ↔ Services
- One-to-one: Booking → Payment

## API Design

### RESTful Conventions
- GET for retrieval
- POST for creation
- PUT for updates
- DELETE for deletion

### Response Format
```typescript
{
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  count?: number;
}
```

### Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Performance Considerations

### Backend
- Database indexing
- Query optimization
- Connection pooling
- Caching strategy

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- React Query caching

## Scalability

### Horizontal Scaling
- Stateless API design
- Database connection pooling
- Load balancing ready

### Vertical Scaling
- Efficient queries
- Caching layers
- Optimized algorithms

## Monitoring & Logging

### Backend
- Request logging
- Error logging
- Performance metrics
- Database query logging

### Frontend
- Error boundary
- Console logging (dev)
- Error tracking (production)

## Deployment Architecture

### Development
- Local database
- Hot reload
- Dev tools

### Production
- Cloud database (Supabase)
- Build optimization
- Error tracking
- Performance monitoring
