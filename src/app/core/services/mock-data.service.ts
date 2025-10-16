import { Injectable } from '@angular/core';
import { Game, GameDifficulty, GamePrice } from '../../models/game.model';
import { Booking, BookingStatus, PaymentMethod, PaymentStatus } from '../../models/booking.model';
import { User, UserRole } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private mockGames: Game[] = [
    {
      id: '1',
      name: 'Alien Laboratory Escape',
      description: 'You and your team have been captured by aliens and locked in their research laboratory. Solve puzzles, decode alien technology, and find a way to escape before they return. Experience zero gravity, encounter mysterious artifacts, and race against time in this thrilling sci-fi adventure.',
      shortDescription: 'Escape from an alien research lab using futuristic technology and teamwork.',
      imageUrl: 'https://images.pexels.com/photos/8728382/pexels-photo-8728382.jpeg?auto=compress&cs=tinysrgb&w=800',
      duration: 60,
      minPlayers: 2,
      maxPlayers: 6,
      difficulty: GameDifficulty.MEDIUM,
      isActive: true,
      tags: ['Sci-Fi', 'Puzzle', 'Adventure'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Haunted Manor Mystery',
      description: 'Enter the cursed mansion of the late Count Dragomir. Legend says his spirit still roams the halls, protecting a hidden treasure. Navigate through dark corridors, solve ancient riddles, and uncover the secrets of the haunted manor. But beware - you only have 60 minutes before you become part of the mansion forever.',
      shortDescription: 'Explore a haunted Victorian mansion and uncover its dark secrets.',
      imageUrl: 'https://images.pexels.com/photos/7362647/pexels-photo-7362647.jpeg?auto=compress&cs=tinysrgb&w=800',
      duration: 60,
      minPlayers: 2,
      maxPlayers: 5,
      difficulty: GameDifficulty.HARD,
      isActive: true,
      tags: ['Horror', 'Mystery', 'Paranormal'],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '3',
      name: 'Underwater Treasure Hunt',
      description: 'Dive deep into the ocean to discover the legendary lost city of Atlantis. Navigate through coral reefs, ancient ruins, and underwater caves. Solve water-based puzzles, avoid sea creatures, and find the legendary treasure before your oxygen runs out. Perfect for adventure seekers and treasure hunters!',
      shortDescription: 'Dive into an underwater adventure to find the lost city of Atlantis.',
      imageUrl: 'https://images.pexels.com/photos/8728380/pexels-photo-8728380.jpeg?auto=compress&cs=tinysrgb&w=800',
      duration: 45,
      minPlayers: 2,
      maxPlayers: 4,
      difficulty: GameDifficulty.EASY,
      isActive: true,
      tags: ['Adventure', 'Exploration', 'Treasure'],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    }
  ];

  private mockPricing: { [gameId: string]: GamePrice[] } = {
    '1': [
      { gameId: '1', playerCount: 2, price: 2000, currency: 'MKD' },
      { gameId: '1', playerCount: 3, price: 2900, currency: 'MKD' },
      { gameId: '1', playerCount: 4, price: 3600, currency: 'MKD' },
      { gameId: '1', playerCount: 5, price: 4200, currency: 'MKD' },
      { gameId: '1', playerCount: 6, price: 4800, currency: 'MKD' }
    ],
    '2': [
      { gameId: '2', playerCount: 2, price: 2200, currency: 'MKD' },
      { gameId: '2', playerCount: 3, price: 3100, currency: 'MKD' },
      { gameId: '2', playerCount: 4, price: 3900, currency: 'MKD' },
      { gameId: '2', playerCount: 5, price: 4600, currency: 'MKD' }
    ],
    '3': [
      { gameId: '3', playerCount: 2, price: 1800, currency: 'MKD' },
      { gameId: '3', playerCount: 3, price: 2500, currency: 'MKD' },
      { gameId: '3', playerCount: 4, price: 3200, currency: 'MKD' }
    ]
  };

  private mockBookings: Booking[] = [
    {
      id: 'B001',
      gameId: '1',
      gameName: 'Alien Laboratory Escape',
      userId: 'U001',
      bookingDate: new Date(),
      bookingTime: '14:00',
      playerCount: 4,
      totalPrice: 3600,
      currency: 'MKD',
      status: BookingStatus.CONFIRMED,
      paymentMethod: PaymentMethod.ONLINE,
      paymentStatus: PaymentStatus.PAID,
      customerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+389 70 123 456'
      },
      confirmationNumber: 'VR-2024-001',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'B002',
      gameId: '2',
      gameName: 'Haunted Manor Mystery',
      bookingDate: new Date(),
      bookingTime: '16:30',
      playerCount: 3,
      totalPrice: 3100,
      currency: 'MKD',
      status: BookingStatus.CONFIRMED,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.PENDING,
      customerInfo: {
        firstName: 'Sarah',
        lastName: 'Smith',
        email: 'sarah.smith@example.com',
        phone: '+389 71 234 567'
      },
      confirmationNumber: 'VR-2024-002',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private mockAdminUser: User = {
    id: 'admin',
    email: 'admin@vrescape.com',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+389 70 000 000',
    role: UserRole.ADMIN,
    createdAt: new Date()
  };

  private mockRegularUser: User = {
    id: 'user1',
    email: 'user@example.com',
    firstName: 'Test',
    lastName: 'User',
    phone: '+389 70 111 111',
    role: UserRole.USER,
    createdAt: new Date()
  };

  getGames(): Game[] {
    return [...this.mockGames];
  }

  getGameById(id: string): Game | undefined {
    return this.mockGames.find(game => game.id === id);
  }

  getGamePricing(gameId: string): GamePrice[] {
    return this.mockPricing[gameId] || [];
  }

  getBookings(): Booking[] {
    return [...this.mockBookings];
  }

  getBookingsByDate(date: string): Booking[] {
    return this.mockBookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate).toISOString().split('T')[0];
      return bookingDate === date;
    });
  }

  createBooking(booking: Partial<Booking>): Booking {
    const newBooking: Booking = {
      id: `B${String(this.mockBookings.length + 1).padStart(3, '0')}`,
      gameId: booking.gameId!,
      gameName: this.getGameById(booking.gameId!)?.name || 'Unknown Game',
      userId: booking.userId,
      bookingDate: new Date(booking.bookingDate!),
      bookingTime: booking.bookingTime!,
      playerCount: booking.playerCount!,
      totalPrice: booking.totalPrice!,
      currency: booking.currency || 'MKD',
      status: BookingStatus.CONFIRMED,
      paymentMethod: booking.paymentMethod!,
      paymentStatus: booking.paymentMethod === PaymentMethod.ONLINE ? PaymentStatus.PAID : PaymentStatus.PENDING,
      customerInfo: booking.customerInfo!,
      confirmationNumber: `VR-${new Date().getFullYear()}-${String(this.mockBookings.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockBookings.push(newBooking);
    return newBooking;
  }

  getAdminUser(): User {
    return { ...this.mockAdminUser };
  }

  getRegularUser(): User {
    return { ...this.mockRegularUser };
  }

  authenticateUser(email: string, password: string): User | null {
    if (email === 'admin@vrescape.com' && password === 'admin123') {
      return this.getAdminUser();
    }
    if (email === 'user@example.com' && password === 'user123') {
      return this.getRegularUser();
    }
    return null;
  }

  getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = this.getBookingsByDate(today);

    return {
      todayBookings: todayBookings.length,
      confirmedBookings: todayBookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
      todayRevenue: todayBookings.reduce((sum, b) => sum + b.totalPrice, 0),
      occupancyRate: Math.round((todayBookings.length / 15) * 100)
    };
  }
}
