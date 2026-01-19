// User Types
export type UserRole = 'client' | 'driver' | 'carwash' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  nrc: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Client specific
  businessName?: string;
  isBusiness?: boolean;
  
  // Driver specific
  licenseNo?: string;
  licenseType?: string;
  licenseExpiry?: string;
  address?: string;
  maritalStatus?: string;
  availability?: boolean;
  
  // Car Wash specific
  carWashName?: string;
  location?: string;
  washingBays?: number;
}

// Vehicle Types
export interface Vehicle {
  _id: string;
  clientId: string;
  make: string;
  model: string;
  plateNo: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// Service Types
export type ServiceName = 
  | 'Full Basic Wash' 
  | 'Engine Wash' 
  | 'Exterior Wash' 
  | 'Interior Wash' 
  | 'Wax and Polishing';

export interface Service {
  _id: string;
  carWashId: string;
  name: ServiceName;
  description?: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Booking Status Types
export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'picked_up'
  | 'at_wash'
  | 'waiting_bay'
  | 'washing_bay'
  | 'drying_bay'
  | 'wash_completed'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'mobile_money' | 'bank_transfer';

// Booking Types
export interface Booking {
  _id: string;
  clientId: string;
  driverId?: string;
  carWashId: string;
  vehicleId: string;
  serviceId: string;
  pickupLocation: string;
  pickupCoordinates?: {
    lat: number;
    lng: number;
  };
  status: BookingStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  scheduledPickupTime?: string;
  actualPickupTime?: string;
  washStartTime?: string;
  washCompleteTime?: string;
  deliveryTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields (when fetched with relations)
  client?: User;
  driver?: User;
  carWash?: User;
  vehicle?: Vehicle;
  service?: Service;
}

// Payment Types
export interface Payment {
  _id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Car Wash Types
export interface CarWash {
  _id: string;
  name: string;
  carWashName: string;
  location: string;
  washingBays: number;
  email: string;
  phone: string;
  services?: Service[];
}

// Dashboard Stats Types
export interface AdminDashboardStats {
  totalBookings: number;
  pendingPickups: number;
  completedWashes: number;
  totalRevenue: number;
  totalClients: number;
  totalDrivers: number;
  totalCarWashes: number;
}

export interface CarWashDashboardStats {
  totalBookings: number;
  pendingBookings: number;
  inProgressBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  count?: number;
}

// Registration Types
export interface ClientRegistrationData {
  name: string;
  email: string;
  password: string;
  phone: string;
  nrc: string;
  role: 'client';
  businessName?: string;
  isBusiness?: boolean;
}

export interface DriverRegistrationData {
  name: string;
  email: string;
  password: string;
  phone: string;
  nrc: string;
  role: 'driver';
  licenseNo: string;
  licenseType: string;
  licenseExpiry: string;
  address: string;
  maritalStatus: string;
}

export interface CarWashRegistrationData {
  name: string;
  email: string;
  password: string;
  phone: string;
  nrc: string;
  role: 'carwash';
  carWashName: string;
  location: string;
  washingBays: number;
}

export type RegistrationData = 
  | ClientRegistrationData 
  | DriverRegistrationData 
  | CarWashRegistrationData;

// Vehicle Status Helper
export const VehicleStatus = {
  PENDING: 'pending' as BookingStatus,
  ACCEPTED: 'accepted' as BookingStatus,
  PICKED_UP: 'picked_up' as BookingStatus,
  AT_WASH: 'at_wash' as BookingStatus,
  WAITING_BAY: 'waiting_bay' as BookingStatus,
  WASHING_BAY: 'washing_bay' as BookingStatus,
  DRYING_BAY: 'drying_bay' as BookingStatus,
  WASH_COMPLETED: 'wash_completed' as BookingStatus,
  DELIVERED: 'delivered' as BookingStatus,
  COMPLETED: 'completed' as BookingStatus,
  CANCELLED: 'cancelled' as BookingStatus,
} as const;

// Status progression helpers
export const getNextStatus = (currentStatus: BookingStatus): BookingStatus | null => {
  const statusFlow: Record<BookingStatus, BookingStatus | null> = {
    pending: 'accepted',
    accepted: 'picked_up',
    declined: null,
    picked_up: 'at_wash',
    at_wash: 'waiting_bay',
    waiting_bay: 'washing_bay',
    washing_bay: 'drying_bay',
    drying_bay: 'wash_completed',
    wash_completed: 'delivered',
    delivered: 'completed',
    completed: null,
    cancelled: null,
  };
  return statusFlow[currentStatus] || null;
};

export const getStatusLabel = (status: BookingStatus): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
