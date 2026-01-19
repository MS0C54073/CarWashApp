// Re-export shared types (can be imported from shared-types package)
// For now, defining here for Next.js compatibility

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
  businessName?: string;
  isBusiness?: boolean;
  licenseNo?: string;
  licenseType?: string;
  licenseExpiry?: string;
  address?: string;
  maritalStatus?: string;
  availability?: boolean;
  carWashName?: string;
  location?: string;
  washingBays?: number;
}

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

export interface Booking {
  _id: string;
  clientId: string;
  driverId?: string;
  carWashId: string;
  vehicleId: string;
  serviceId: string;
  pickupLocation: string;
  status: BookingStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  client?: User;
  driver?: User;
  carWash?: User;
  vehicle?: Vehicle;
  service?: Service;
}

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
