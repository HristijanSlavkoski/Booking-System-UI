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

export interface BookingGameRequest {
  gameId: string;
  roomNumber: number;
  playerCount: number;
  price: number;
}

export interface BookingRequest {
  bookingDate: string;
  bookingTime: string;
  numberOfRooms: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  games: BookingGameRequest[];
}

export interface BookingResponse {
  booking: Booking;
  paymentUrl?: string;
}
