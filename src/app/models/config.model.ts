export interface SystemConfig {
  maxConcurrentBookings: number;
  bookingSlotDuration: number;
  minBookingNotice: number;
  maxBookingAdvance: number;
  businessHours: BusinessHours;
  holidays: Holiday[];
  blockedDates: string[];
}

export interface BusinessHours {
  start: string;
  end: string;
  breakTime?: BreakTime;
}

export interface BreakTime {
  start: string;
  end: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  isRecurring: boolean;
}

export interface Discount {
  id: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  applicableGames?: string[];
  minPlayers?: number;
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT'
}
