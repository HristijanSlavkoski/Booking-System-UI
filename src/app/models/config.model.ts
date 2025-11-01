import {Game} from "./game.model";

export interface SystemConfig {
    id?: string;
    maxConcurrentBookings: number;
    openingTime?: string;
    closingTime?: string;
    slotDurationMinutes?: number;
    bookingSlotDuration?: number;
    minBookingNotice?: number;
    maxBookingAdvance?: number;
    businessHours?: BusinessHours;
    holidays: Holiday[];
    blockedDates?: string[];
    pricingConfig?: PricingConfig;
    taxPercentage?: number;
}

export interface PricingConfig {
    id?: string;
    tiers?: Tier[];
    weekendMultiplier: number;
    holidayMultiplier: number;
    groupDiscount: number;
    groupDiscountThreshold: number;
    active: boolean;
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
    id?: string;
    name: string;
    date: string;
    isRecurring?: boolean;
    active?: boolean;
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

export type Tier = { minPlayers: number; maxPlayers: number; pricePerPlayer: number };

// TODO: Move these so other model class
type RoomSummary = { name: string | null; playerCount: number };

export type RoomSelection = { game: Game | null; playerCount: number };
