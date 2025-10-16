export interface Booking {
  id: string;
  gameId: string;
  gameName?: string;
  userId?: string;
  bookingDate: Date;
  bookingTime: string;
  playerCount: number;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerInfo: CustomerInfo;
  confirmationNumber: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW'
}

export enum PaymentMethod {
  ONLINE = 'ONLINE',
  CASH = 'CASH'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface BookingRequest {
  gameId: string;
  bookingDate: string;
  bookingTime: string;
  playerCount: number;
  paymentMethod: PaymentMethod;
  customerInfo: CustomerInfo;
  userId?: string;
}

export interface BookingResponse {
  booking: Booking;
  paymentUrl?: string;
}
