# Calendar-Only vs Full Booking Integration

## Overview

You now have **two distinct pages** you can embed in WordPress:

1. **Calendar-Only Page** (`/calendar`) - Shows only the availability calendar
2. **Full Booking Flow** (`/booking`) - Shows the complete 4-step booking process

## Option 1: Calendar-Only Page (Recommended)

### What It Shows
- Clean, minimal interface
- Just the calendar grid with available slots
- "Select Your Date & Time" header
- No step indicators or extra UI

### User Flow
```
WordPress Page (with /calendar iframe)
    ↓
User clicks available slot
    ↓
Selects number of rooms
    ↓
Clicks "Continue to Game Selection"
    ↓
**STAYS IN IFRAME** → Navigates to full booking flow
    ↓
Continues with game selection → player count → payment
```

### WordPress Implementation

```html
<!-- On your main appointment page -->
<iframe
  src="https://yourangularapp.com/calendar"
  width="100%"
  height="800px"
  frameborder="0">
</iframe>
```

### With Pre-selected Game

When user clicks "BOOK NOW" on a specific game:

```html
<!-- WordPress passes the gameId -->
<iframe
  src="https://yourangularapp.com/calendar?gameId=depths-of-osiris"
  width="100%"
  height="800px"
  frameborder="0">
</iframe>
```

**What happens:**
1. User sees calendar for that specific game
2. After selecting slot, automatically goes to player count (skips game selection)
3. Seamless experience

### Why This is Better

✅ **Cleaner WordPress Integration**
- No confusing step indicators on WordPress page
- Looks like a native WordPress element
- Less visual clutter

✅ **Better UX**
- User sees calendar immediately
- Clear call-to-action
- Progressive disclosure (complexity revealed as needed)

✅ **Easier to Embed Multiple Places**
- Can put calendar widget in sidebar
- Can embed on homepage
- Can embed on individual game pages

## Option 2: Full Booking Flow

### What It Shows
- Complete 4-step process with indicators at top:
  - Step 1: Choose Date & Time
  - Step 2: Select Game
  - Step 3: Players & Details
  - Step 4: Payment
- Progress bar showing current step
- Navigation buttons (Back/Continue)

### When to Use This

Use the full booking flow when:
- You want to show the complete process upfront
- You have a dedicated "Booking" page with nothing else
- Users need to understand all steps before starting

### WordPress Implementation

```html
<iframe
  src="https://yourangularapp.com/booking"
  width="100%"
  height="900px"
  frameborder="0">
</iframe>
```

## URL Parameters (Both Pages Support)

| Parameter | Type | Example | Effect |
|-----------|------|---------|--------|
| `gameId` | string | `depths-of-osiris` | Pre-selects game, skips game selection step |
| `players` | number | `4` | Suggests number of players (optional hint) |

### Calendar Page Specific

The calendar page will pass selected information to the booking flow:

```
/calendar → User selects slot → Redirects to:
/booking?date=2025-10-30&time=18:00&rooms=2
```

If gameId was provided to calendar:
```
/calendar?gameId=depths-of-osiris → User selects slot → Redirects to:
/booking?date=2025-10-30&time=18:00&rooms=2&gameId=depths-of-osiris
```

## Recommended WordPress Setup

### Homepage

```html
<section class="booking-widget">
  <h2>Check Availability</h2>
  <iframe
    src="https://yourangularapp.com/calendar"
    width="100%"
    height="800px"
    frameborder="0">
  </iframe>
</section>
```

### Individual Game Pages

```php
<?php
$gameId = get_post_meta(get_the_ID(), 'game_id', true);
?>

<div class="game-booking">
  <h2>Book This Experience</h2>
  <iframe
    src="https://yourangularapp.com/calendar?gameId=<?php echo esc_attr($gameId); ?>"
    width="100%"
    height="800px"
    frameborder="0">
  </iframe>
</div>
```

### Generic Appointment Page

Either option works, but calendar-only is cleaner:

```html
<!-- Option A: Calendar Only -->
<iframe
  src="https://yourangularapp.com/calendar"
  width="100%"
  height="800px">
</iframe>

<!-- Option B: Full Flow -->
<iframe
  src="https://yourangularapp.com/booking"
  width="100%"
  height="900px">
</iframe>
```

## Styling Tips

### Remove WordPress Header/Footer for Cleaner Look

```css
/* When iframe is on a dedicated page */
.page-template-booking .site-header,
.page-template-booking .site-footer,
.page-template-booking .breadcrumbs {
  display: none;
}

.page-template-booking {
  background: #0a0a0a;
}

.page-template-booking .site-content {
  padding: 0;
  max-width: 100%;
}
```

### Make Iframe Responsive

```css
.iframe-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.iframe-container iframe {
  width: 100%;
  border: none;
  display: block;
}

/* Adjust height for mobile */
@media (max-width: 768px) {
  .iframe-container iframe {
    height: 700px;
  }
}
```

## Navigation Flow Examples

### Example 1: Homepage Calendar

```
WordPress Homepage
    ↓
[Calendar Widget - /calendar]
    ↓
User selects Oct 30, 6 PM, 2 rooms
    ↓
**Iframe navigates to:**
/booking?date=2025-10-30&time=18:00&rooms=2
    ↓
Shows game selection (Step 2)
    ↓
User selects games & continues
    ↓
Complete booking in iframe
```

### Example 2: Game Detail Page

```
WordPress Game Page: "Depths of Osiris"
    ↓
[Calendar Widget - /calendar?gameId=depths-of-osiris]
    ↓
User selects Oct 30, 6 PM, 1 room
    ↓
**Iframe navigates to:**
/booking?date=2025-10-30&time=18:00&rooms=1&gameId=depths-of-osiris
    ↓
Skips game selection, goes straight to player count (Step 3)
    ↓
Complete booking
```

## Technical Details

### Calendar Component (`/calendar`)

**Route:** `/calendar`
**Component:** `CalendarOnlyComponent`
**Bundle Size:** ~2 KB (minimal, fast loading)

**Features:**
- Standalone calendar view
- Reads `gameId` parameter (optional)
- On slot selection → navigates to `/booking` with parameters
- Dark theme matching WordPress

### Booking Component (`/booking`)

**Route:** `/booking`
**Component:** `BookingComponent`
**Bundle Size:** ~30 KB (full featured)

**Features:**
- Complete 4-step wizard
- Handles URL parameters for pre-filling
- Can skip steps based on parameters
- Maintains state throughout process

## Testing

### Test Calendar-Only
```
http://localhost:4200/calendar
http://localhost:4200/calendar?gameId=depths-of-osiris
```

### Test Full Booking
```
http://localhost:4200/booking
http://localhost:4200/booking?gameId=depths-of-osiris
```

### Test Deep Linking (from calendar to booking)
```
http://localhost:4200/booking?date=2025-10-30&time=18:00&rooms=2&gameId=depths-of-osiris
```

## Recommendation

**Use Calendar-Only (`/calendar`) for:**
- Homepage widgets
- Individual game pages
- Sidebar booking modules
- Any place where you want minimal UI

**Use Full Booking Flow (`/booking`) for:**
- Dedicated booking page with nothing else
- When you need to show the complete process upfront
- When WordPress header/footer are hidden

**Most Flexible Approach:**
- Use `/calendar` on all game pages
- Use `/calendar` on homepage
- Have a dedicated "/book" page with full flow if needed

The calendar automatically transitions to the full booking flow after selection, so you get the best of both worlds!
