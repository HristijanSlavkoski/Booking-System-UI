export interface Game {
  id: string;
  name: string;
  code: string,
  description: string;
  shortDescription: string;
  imageUrl: string;
  duration: number;
  minPlayers: number;
  maxPlayers: number;
  difficulty: number;
  active: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GamePrice {
  gameId: string;
  playerCount: number;
  price: number;
  currency: string;
}

export interface GameAvailability {
  gameId: string;
  date: Date;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  time: string;
  availableSpots: number;
  isAvailable: boolean;
  bookedCount: number;
}
