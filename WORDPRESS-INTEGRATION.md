# WordPress Integration Guide

## Overview

Your Angular booking system is designed to be embedded into your WordPress site via an iframe, seamlessly matching the dark theme with red accent colors.

## Architecture

### Data Flow

```
WordPress Site (Marketing)
    ↓
User clicks "BOOK NOW" on a game
    ↓
WordPress passes gameId via URL parameter
    ↓
Angular App reads URL parameters
    ↓
Fetches game details from YOUR backend/Supabase
    ↓
User completes booking
    ↓
Data saved to YOUR database
```

### Why This Architecture?

**Single Source of Truth**: Game information, pricing, and availability live in YOUR system (Angular + Supabase), not WordPress.

**Benefits**:
- No data sync issues between WordPress and booking system
- WordPress acts as a beautiful marketing front-end
- Booking logic remains centralized and consistent
- Easy to update games/prices without touching WordPress

## Implementation Steps

### 1. Store Game Data in Supabase

Your games should be stored in Supabase with:
- `id` (slug format: "depths-of-osiris", "dragon-tower")
- `name` (display name: "Depths of Osiris")
- `description`
- `imageUrl`
- `duration`
- `minPlayers` / `maxPlayers`
- `difficulty`
- `pricing` (separate table or JSON)

### 2. WordPress Game Display

On your "Our Rooms" page, WordPress can either:

**Option A: Static Content**
- Manually maintain game cards in WordPress
- Each card links to: `/appointment?gameId=depths-of-osiris`

**Option B: Dynamic (Recommended)**
- Create a simple WordPress plugin/widget
- Fetch game list from YOUR Angular API endpoint
- Display games dynamically
- Always in sync with booking system

Example API endpoint to create:
```
GET /api/games/public
Response: [
  {
    "id": "depths-of-osiris",
    "name": "Depths of Osiris",
    "imageUrl": "...",
    "shortDescription": "...",
    "duration": 60,
    "difficulty": "MEDIUM"
  }
]
```

### 3. WordPress Appointment Page

Create a WordPress page template with the iframe:

```php
<?php
/* Template Name: Booking Page */
get_header();

$gameId = isset($_GET['gameId']) ? sanitize_text_field($_GET['gameId']) : '';
$players = isset($_GET['players']) ? intval($_GET['players']) : '';

$iframeUrl = 'https://your-angular-app.com/booking';

$params = [];
if ($gameId) {
    $params[] = 'gameId=' . urlencode($gameId);
}
if ($players) {
    $params[] = 'players=' . $players;
}

if (!empty($params)) {
    $iframeUrl .= '?' . implode('&', $params);
}
?>

<div class="booking-page-container">
    <iframe
        src="<?php echo esc_url($iframeUrl); ?>"
        width="100%"
        height="900px"
        frameborder="0"
        title="VR Booking System">
    </iframe>
</div>

<?php get_footer(); ?>
```

### 4. Styling the iframe Container

Add to your WordPress theme CSS:

```css
.booking-page-container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0;
}

.booking-page-container iframe {
    width: 100%;
    height: 900px;
    border: none;
    display: block;
}

/* Remove WordPress header/footer for cleaner iframe experience */
.page-template-booking-page .site-header,
.page-template-booking-page .site-footer {
    display: none;
}

.page-template-booking-page body {
    background: #0a0a0a;
}
```

## URL Parameters Reference

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `gameId` | string | `depths-of-osiris` | Pre-selects a specific game |
| `players` | number | `4` | Suggests number of players |

## Game ID Format

Use lowercase, hyphenated slugs that match between WordPress and your database:

| Game Name | Game ID |
|-----------|---------|
| Depths of Osiris | `depths-of-osiris` |
| Dragon Tower | `dragon-tower` |
| Space Station Tiberia | `space-station-tiberia` |
| Manor of Escape | `manor-of-escape` |
| Pirates Plague | `pirates-plague` |
| Time Travel Paradox | `time-travel-paradox` |

## Price Management

Prices should be stored in YOUR system (Supabase), not WordPress:

**Supabase Pricing Config Table**:
```sql
pricing_config:
- base_price_per_player: 1000 MKD
- additional_player_discount: 300 MKD
- weekend_multiplier: 1.2
- holiday_multiplier: 1.5
```

This allows dynamic pricing based on:
- Number of players
- Day of week (weekday/weekend)
- Holidays
- Time of day

## Testing

1. **Local Testing**: Open `iframe-example.html` in your browser
2. **WordPress Testing**:
   - Create test page with iframe
   - Test with different gameId parameters
   - Verify theme matching

## PostMessage API (Advanced)

For more advanced integration, use browser's PostMessage API:

**WordPress → Angular**:
```javascript
const iframe = document.getElementById('booking-iframe');
iframe.contentWindow.postMessage({
  action: 'selectGame',
  gameId: 'depths-of-osiris',
  players: 4
}, 'https://your-angular-app.com');
```

**Angular receives**:
```typescript
window.addEventListener('message', (event) => {
  if (event.origin === 'https://your-wordpress-site.com') {
    const { action, gameId, players } = event.data;
    // Handle the message
  }
});
```

## Security Notes

- Always validate gameId on the backend
- Don't trust client-side parameters for pricing
- Use HTTPS for both WordPress and Angular
- Set proper CORS headers
- Implement rate limiting on booking endpoints

## Support & Maintenance

The booking system is completely independent:
- WordPress can be redesigned without affecting booking logic
- Booking system can be updated without touching WordPress
- Both can scale independently
