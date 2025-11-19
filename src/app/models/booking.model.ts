export interface Booking {
    id: string;
    gameId: string;
    userId?: string;
    bookingDate: Date;
    bookingTime: string;
    totalPrice: number;
    currency?: string;
    status: BookingStatus;
    paymentMethod: PaymentMethod;
    customerFirstName?: string;
    customerLastName?: string;
    customerEmail?: string;
    customerPhone?: string;
    confirmationNumber: string;
    notes?: string;
    createdAt: Date | string;
    updatedAt?: Date | string;
    bookingGames?: BookingGame[];
}

export interface BookingGame {
    id: string;
    gameId: string;
    gameName: string;
    roomNumber: number;
    playerCount: number;
    price: number | null;
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
    IN_PERSON = 'IN_PERSON'
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
    discountCode?: string | null;
}

export interface BookingResponse {
    booking: Booking;
    paymentUrl?: string;
}

export interface Customer {
    firstName: string,
    lastName: string,
    email: string,
    phone: string
}
