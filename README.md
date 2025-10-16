# VR Escape Room Booking System

A modern, responsive Angular 19 application for managing VR escape room bookings with a beautiful UI and comprehensive admin dashboard.

## Features

### Public Features
- **Home Page**: Beautiful landing page with hero section, features, and game previews
- **Games Catalog**: Browse all available VR games with detailed information
- **Game Details**: View full game descriptions, pricing, and difficulty levels
- **Booking System**: Interactive booking with date/time selection and player count
- **Guest Checkout**: Book without creating an account
- **User Authentication**: Login and registration for returning customers

### User Features (Logged In)
- **Profile Management**: Update personal information
- **Booking History**: View all past and upcoming bookings
- **Quick Booking**: Pre-filled customer information for faster checkout

### Admin Features
- **Dashboard**: Overview of daily bookings, revenue, and occupancy rates
- **Schedule View**: Visual timeline of all bookings
- **Booking Management**: View, modify, and cancel bookings
- **Games Management**: Add, edit, and manage VR games
- **Configuration**: Set holidays, pricing, and system settings

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:4200`

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Using the Application

### For Regular Users

#### 1. Browse Games
- Visit the homepage at `http://localhost:4200`
- Click "View Games" or navigate to `/games`
- Browse through 3 available games:
  - **Alien Laboratory Escape** (60 min, 2-6 players, Medium difficulty)
  - **Haunted Manor Mystery** (60 min, 2-5 players, Hard difficulty)
  - **Underwater Treasure Hunt** (45 min, 2-4 players, Easy difficulty)

#### 2. View Game Details
- Click on any game card to see full details
- View pricing per player count
- See game description, duration, and difficulty

#### 3. Book a Game
- Click "Book Now" on any game or navigate to `/booking`
- **Step 1**: Select a game from the dropdown
- **Step 2**: Choose date (today or future dates)
- **Step 3**: Select time slot (9:00 AM - 9:30 PM, every 30 minutes)
- **Step 4**: Choose number of players (see dynamic pricing)
- **Step 5**: Enter customer information:
  - First Name
  - Last Name
  - Email
  - Phone
- **Step 6**: Select payment method:
  - **Pay Online**: Proceed to payment gateway
  - **Pay with Cash**: Pay upon arrival
- Click "Complete Booking" or "Proceed to Payment"

#### 4. Guest Checkout
- You can book without creating an account
- Simply fill in your information in the booking form

#### 5. Register/Login
- Click "Login" in the header
- For testing, use these credentials:
  - **Regular User**:
    - Email: `user@example.com`
    - Password: `user123`
  - Or click "Sign up" to create a new account
- Once logged in, your information will auto-fill in booking forms

### For Administrators

#### 1. Admin Login
- Navigate to `http://localhost:4200/login`
- Use admin credentials:
  - **Email**: `admin@vrescape.com`
  - **Password**: `admin123`
- After login, you'll see "Admin" link in the header

#### 2. Access Admin Dashboard
- Click "Admin" in the header or navigate to `/admin`
- The dashboard shows:
  - Today's bookings count
  - Confirmed bookings
  - Today's revenue
  - Occupancy rate
  - Recent bookings table with:
    - Time, Customer, Game, Players, Status, Payment

#### 3. Admin Pages
Available admin pages (accessible from dashboard):
- **Schedule** (`/admin/schedule`): Daily schedule view
- **Manage Bookings** (`/admin/bookings`): Full booking management
- **Manage Games** (`/admin/games`): Add/edit games
- **Settings** (`/admin/config`): System configuration

## Mock Data

The application includes mock data for development:

### Games
1. **Alien Laboratory Escape**
   - Sci-fi themed, 60 minutes
   - 2-6 players
   - Pricing: 2000-4800 MKD

2. **Haunted Manor Mystery**
   - Horror themed, 60 minutes
   - 2-5 players
   - Pricing: 2200-4600 MKD

3. **Underwater Treasure Hunt**
   - Adventure themed, 45 minutes
   - 2-4 players
   - Pricing: 1800-3200 MKD

### Test Users
- **Admin**: admin@vrescape.com / admin123
- **User**: user@example.com / user123

### Sample Bookings
- 2 bookings for today are pre-loaded to demonstrate the admin dashboard

## Configuration

### API Gateway Configuration
The application is configured to connect to a backend API gateway at:
- **Development**: `http://localhost:8080/escape`
- **Production**: Update in `src/environments/environment.prod.ts`

### Proxy Configuration
The `proxy.conf.json` file redirects API calls during development to avoid CORS issues.

### Backend Integration
When your Spring Boot backend is ready:
1. Start your backend on `http://localhost:8080`
2. Ensure your endpoints follow this pattern:
   - `/escape/games` - Get all games
   - `/escape/games/{id}` - Get game by ID
   - `/escape/bookings` - Create booking
   - `/escape/auth/login` - User login
   - `/escape/admin/*` - Admin endpoints

The application will automatically use the backend API. If the backend is unavailable, it falls back to mock data.

## Project Structure

```
src/
├── app/
│   ├── core/                      # Core services and guards
│   │   ├── guards/               # Auth and admin guards
│   │   └── services/             # API, auth, booking services
│   ├── models/                   # TypeScript interfaces
│   ├── shared/                   # Shared components
│   │   └── components/          # Reusable UI components
│   └── pages/                    # Feature pages
│       ├── home/                # Landing page
│       ├── games/               # Games catalog and details
│       ├── booking/             # Booking flow
│       ├── auth/                # Login and registration
│       ├── user/                # User profile and bookings
│       └── admin/               # Admin dashboard
├── environments/                 # Environment configs
└── global_styles.css            # Global styles
```

## Technologies Used

- **Angular 19**: Latest LTS version with standalone components
- **RxJS**: Reactive programming
- **TypeScript**: Type-safe development
- **Lazy Loading**: Optimized bundle sizes
- **Route Guards**: Protected admin routes

## Next Steps

1. **Connect Backend**: Update API URLs in environment files
2. **Payment Integration**: Implement actual payment gateway
3. **Email/SMS**: Connect notification services
4. **Complete Admin Features**: Finish admin management pages
5. **Internationalization**: Add Macedonian language support
