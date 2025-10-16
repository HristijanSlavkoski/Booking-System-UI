# VR Escape Room Backend API

Enterprise-grade Spring Boot REST API for VR Escape Room booking system with Keycloak authentication.

## Tech Stack

- **Java 21** (LTS)
- **Spring Boot 3.2.0**
- **PostgreSQL 16**
- **Keycloak 23.0** (OAuth2/OpenID Connect)
- **Spring Data JPA** with Hibernate
- **Spring Security** with OAuth2 Resource Server
- **Lombok** for boilerplate reduction
- **Maven** for dependency management

## Architecture

```
src/
├── main/
│   ├── java/com/vrroom/
│   │   ├── VrEscapeRoomApplication.java
│   │   ├── config/
│   │   │   └── SecurityConfig.java
│   │   ├── controller/
│   │   │   ├── GameController.java
│   │   │   └── BookingController.java
│   │   ├── domain/
│   │   │   ├── entity/
│   │   │   │   ├── User.java
│   │   │   │   ├── Game.java
│   │   │   │   ├── Booking.java
│   │   │   │   ├── BookingGame.java
│   │   │   │   └── SystemConfig.java
│   │   │   └── enums/
│   │   │       ├── Difficulty.java
│   │   │       ├── BookingStatus.java
│   │   │       └── PaymentMethod.java
│   │   ├── dto/
│   │   │   ├── GameDTO.java
│   │   │   ├── BookingDTO.java
│   │   │   ├── UserDTO.java
│   │   │   └── CreateBookingRequest.java
│   │   ├── exception/
│   │   │   ├── ResourceNotFoundException.java
│   │   │   ├── InsufficientCapacityException.java
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── GameRepository.java
│   │   │   ├── BookingRepository.java
│   │   │   └── SystemConfigRepository.java
│   │   └── service/
│   │       ├── GameService.java
│   │       ├── BookingService.java
│   │       └── impl/
│   │           ├── GameServiceImpl.java
│   │           └── BookingServiceImpl.java
│   └── resources/
│       └── application.yml
└── test/
    └── java/
```

## Prerequisites

- **Java 21** - [Download](https://adoptium.net/)
- **Maven 3.9+** - [Download](https://maven.apache.org/download.cgi)
- **Docker & Docker Compose** - [Download](https://www.docker.com/products/docker-desktop)

## Quick Start

### 1. Start Infrastructure (PostgreSQL + Keycloak)

```bash
cd backend
docker-compose up -d
```

This starts:
- **PostgreSQL** on port `5432`
- **Keycloak** on port `8080`

Wait for services to be healthy:
```bash
docker-compose ps
```

### 2. Configure Keycloak

#### Access Keycloak Admin Console
- URL: http://localhost:8080
- Username: `admin`
- Password: `admin`

#### Create Realm
1. Click dropdown top-left (says "master") → **Create Realm**
2. Name: `vrroom`
3. Click **Create**

#### Create Client
1. Go to **Clients** → **Create client**
2. **Client ID**: `vrroom-app`
3. **Client authentication**: ON
4. **Valid redirect URIs**: `http://localhost:4200/*`
5. **Web origins**: `http://localhost:4200`
6. Save

7. Go to **Credentials** tab
8. Copy the **Client Secret** (you'll need this for frontend)

#### Create Roles
1. Go to **Realm roles** → **Create role**
2. Create two roles:
   - `USER` (default role)
   - `ADMIN` (for admin users)

#### Create Users
1. Go to **Users** → **Create new user**
2. Fill in details
3. Go to **Credentials** tab → Set password (disable "Temporary")
4. Go to **Role mapping** → Assign roles
5. Create at least one ADMIN user and one regular USER

### 3. Run the Application

```bash
# Install dependencies and run
mvn spring-boot:run
```

The API will start on http://localhost:8081/api

### 4. Verify Installation

```bash
# Check health (no auth required)
curl http://localhost:8081/api/games

# Should return empty array [] or sample games
```

## API Endpoints

### Public Endpoints (No Auth Required)

#### Games
- `GET /api/games` - Get all active games
- `GET /api/games/{id}` - Get game by ID
- `GET /api/games/difficulty/{difficulty}` - Filter by difficulty (EASY, MEDIUM, HARD)

#### Availability
- `GET /api/bookings/availability?date=2024-12-20&time=14:00:00&rooms=2` - Check slot availability

### Authenticated Endpoints

#### Bookings (USER role)
- `GET /api/bookings/my-bookings` - Get current user's bookings
- `GET /api/bookings/{id}` - Get booking details
- `POST /api/bookings` - Create new booking
- `DELETE /api/bookings/{id}` - Cancel booking

#### Admin Endpoints (ADMIN role)
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/status/{status}` - Filter by status
- `PATCH /api/bookings/{id}/status?status=CONFIRMED` - Update booking status
- `POST /api/games` - Create game
- `PUT /api/games/{id}` - Update game
- `DELETE /api/games/{id}` - Delete game
- `PATCH /api/games/{id}/deactivate` - Deactivate game

## Sample API Calls

### Get Access Token from Keycloak

```bash
curl -X POST http://localhost:8080/realms/vrroom/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=vrroom-app" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "username=user@example.com" \
  -d "password=password" \
  -d "grant_type=password"
```

Response:
```json
{
  "access_token": "eyJhbGci...",
  "expires_in": 300,
  "refresh_token": "eyJhbGci..."
}
```

### Create Booking (Authenticated)

```bash
curl -X POST http://localhost:8081/api/bookings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingDate": "2024-12-20",
    "bookingTime": "14:00:00",
    "numberOfRooms": 2,
    "totalPrice": 5100,
    "paymentMethod": "CASH",
    "customerFirstName": "John",
    "customerLastName": "Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "1234567890",
    "games": [
      {
        "gameId": "game-uuid-1",
        "roomNumber": 1,
        "playerCount": 4,
        "price": 2900
      },
      {
        "gameId": "game-uuid-2",
        "roomNumber": 2,
        "playerCount": 3,
        "price": 2200
      }
    ]
  }'
```

### Create Game (Admin Only)

```bash
curl -X POST http://localhost:8081/api/games \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Space Station Escape",
    "description": "Escape from a damaged space station",
    "duration": 60,
    "minPlayers": 2,
    "maxPlayers": 6,
    "difficulty": "HARD",
    "imageUrl": "https://example.com/space.jpg",
    "active": true
  }'
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  keycloak_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);
```

### Games Table
```sql
CREATE TABLE games (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  min_players INTEGER NOT NULL,
  max_players INTEGER NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  image_url VARCHAR(500),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  number_of_rooms INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  payment_method VARCHAR(20),
  customer_first_name VARCHAR(255) NOT NULL,
  customer_last_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);
```

### Booking Games Table (Join Table)
```sql
CREATE TABLE booking_games (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  game_id UUID REFERENCES games(id),
  room_number INTEGER NOT NULL,
  player_count INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
```

## Configuration

### application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/vrroom
    username: vrroom
    password: vrroom123

  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8080/realms/vrroom

server:
  port: 8081
  servlet:
    context-path: /api

cors:
  allowed-origins: http://localhost:4200
```

## Security

### Authentication Flow
1. User logs in via frontend (Angular)
2. Frontend sends credentials to Keycloak
3. Keycloak returns JWT access token
4. Frontend includes token in `Authorization: Bearer <token>` header
5. Spring Security validates token with Keycloak
6. If valid, request proceeds; otherwise 401 Unauthorized

### Role-Based Access Control
- **PUBLIC**: `/games/*`, `/bookings/availability`
- **USER**: Create bookings, view own bookings
- **ADMIN**: Full CRUD on games, manage all bookings

## Development Tips

### Hot Reload
```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.devtools.restart.enabled=true"
```

### Database Reset
```bash
docker-compose down -v
docker-compose up -d
# Wait for Keycloak to be ready, then re-configure
```

### View Logs
```bash
# Application logs
mvn spring-boot:run

# PostgreSQL logs
docker-compose logs -f postgres

# Keycloak logs
docker-compose logs -f keycloak
```

## Testing with Postman

1. Import the Postman collection (create one with all endpoints)
2. Set environment variables:
   - `base_url`: `http://localhost:8081/api`
   - `keycloak_url`: `http://localhost:8080/realms/vrroom`
   - `access_token`: (obtained from login)

## Production Deployment

### Environment Variables
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://prod-db:5432/vrroom
export SPRING_DATASOURCE_USERNAME=vrroom_prod
export SPRING_DATASOURCE_PASSWORD=secure_password
export KEYCLOAK_ISSUER_URI=https://keycloak.yourdomain.com/realms/vrroom
export CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

### Build JAR
```bash
mvn clean package -DskipTests
java -jar target/vr-escape-room-api-1.0.0.jar
```

### Docker Build
```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Troubleshooting

### Keycloak Connection Error
- Ensure Keycloak is running: `docker-compose ps`
- Check realm name matches: `vrroom`
- Verify issuer URI in application.yml

### Database Connection Error
- Check PostgreSQL is running: `docker-compose ps`
- Verify credentials in application.yml
- Check port 5432 is not in use

### 401 Unauthorized
- Token expired (default 5 minutes)
- Use refresh token to get new access token
- Check user has correct roles in Keycloak

## License

MIT License - Free for commercial and personal use

## Support

For issues or questions, please open a GitHub issue or contact the development team.
