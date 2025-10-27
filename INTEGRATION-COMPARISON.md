# Integration Options Comparison

## Quick Decision Guide

**Question: What do I want users to see first?**

### Just the calendar? → Use `/calendar`
```html
<iframe src="https://yourapp.com/calendar" height="800px"></iframe>
```
✅ Clean, minimal
✅ Fast loading (2 KB)
✅ Looks native to WordPress
✅ Auto-advances to full flow after selection

### The whole booking process? → Use `/booking`
```html
<iframe src="https://yourapp.com/booking" height="900px"></iframe>
```
✅ Shows all 4 steps upfront
✅ Clear progress indicators
✅ Self-contained experience

---

## Visual Comparison

### `/calendar` - Calendar Only Page

```
┌─────────────────────────────────────────┐
│                                         │
│   SELECT YOUR DATE & TIME               │
│   Choose an available slot to continue  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   [Week Navigation: Oct 28 - Nov 3]    │
│                                         │
│   ┌──────┬──────┬──────┬──────┬──────┐ │
│   │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ │
│   ├──────┼──────┼──────┼──────┼──────┤ │
│   │ 9:00 │ ✓    │ ✓    │ Full │ ✓    │ │
│   │10:00 │ ✓    │ Full │ ✓    │ ✓    │ │
│   │11:00 │ Full │ ✓    │ ✓    │ ✓    │ │
│   │ ...  │ ...  │ ...  │ ...  │ ...  │ │
│   └──────┴──────┴──────┴──────┴──────┘ │
│                                         │
│   Legend: ✓ Available | Full | Hold   │
│                                         │
└─────────────────────────────────────────┘
```

**Pros:**
- Immediate focus on availability
- No distracting UI elements
- Works great as a widget
- Smaller height needed (800px)

**User clicks slot → Modal pops up:**
```
┌──────────────────────────────┐
│ Select Number of Rooms       │
├──────────────────────────────┤
│ Friday, October 30 at 6:00PM │
│                              │
│ ℹ️ 2 out of 2 rooms available│
│                              │
│  ┌────┐  ┌────┐              │
│  │ 🚪 │  │ 🚪 │              │
│  │ 1  │  │ 2  │              │
│  └────┘  └────┘              │
│                              │
│ [Cancel] [Continue] ←────────│ Navigates to full booking
└──────────────────────────────┘
```

---

### `/booking` - Full Booking Flow

```
┌─────────────────────────────────────────┐
│                                         │
│        BOOK YOUR VR EXPERIENCE          │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   ┌──────────── Progress ────────────┐ │
│   │  1 ●────● 2 ○────○ 3 ○────○ 4   │ │
│   │  Date    Game   Info    Pay      │ │
│   └──────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   SELECT AVAILABLE DATE & TIME          │
│   Choose your preferred date and time...│
│                                         │
│   [Week Navigation: Oct 28 - Nov 3]    │
│                                         │
│   ┌──────┬──────┬──────┬──────┬──────┐ │
│   │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ │
│   ├──────┼──────┼──────┼──────┼──────┤ │
│   │ 9:00 │ ✓    │ ✓    │ Full │ ✓    │ │
│   │10:00 │ ✓    │ Full │ ✓    │ ✓    │ │
│   │ ...  │ ...  │ ...  │ ...  │ ...  │ │
│   └──────┴──────┴──────┴──────┴──────┘ │
│                                         │
│                       [Cancel]          │
│                                         │
└─────────────────────────────────────────┘
```

**After Step 1 → Shows Step 2:**
```
┌─────────────────────────────────────────┐
│        BOOK YOUR VR EXPERIENCE          │
├─────────────────────────────────────────┤
│   ┌──────────── Progress ────────────┐ │
│   │  1 ●────● 2 ●────○ 3 ○────○ 4   │ │
│   │  Date    Game   Info    Pay      │ │
│   └──────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ ✓ Selected: Friday, Oct 30, 6:00 PM, 2 Rooms
├─────────────────────────────────────────┤
│                                         │
│   SELECT YOUR GAME                      │
│                                         │
│   ┌─────────────┐  ┌─────────────┐    │
│   │   [Image]   │  │   [Image]   │    │
│   │ Depths of   │  │ Dragon      │    │
│   │ Osiris      │  │ Tower       │    │
│   │ 60min | 2-6 │  │ 45min | 2-4 │    │
│   └─────────────┘  └─────────────┘    │
│                                         │
│          [Back] [Continue]              │
└─────────────────────────────────────────┘
```

**Pros:**
- Shows complete process upfront
- Users know what to expect
- Clear progress tracking
- Single dedicated experience

**Cons:**
- Takes more vertical space (900px)
- Step indicators might be confusing on WordPress
- Heavier initial load

---

## Real-World Usage Examples

### Scenario 1: Homepage Widget

**❌ Don't Use Full Booking:**
```
[Your Site Header]
[Hero Section]
[Full Booking Flow ← feels too detailed here]
[About Section]
[Footer]
```

**✅ Use Calendar Only:**
```
[Your Site Header]
[Hero Section]
[Calendar Widget ← perfect!]
[About Section]
[Footer]
```

---

### Scenario 2: Game Detail Page

**WordPress Page: "Depths of Osiris" Game**

**❌ Don't Use Full Booking:**
- User already chose a game
- Step 2 (game selection) is redundant
- Extra steps confuse the flow

**✅ Use Calendar with gameId:**
```html
<iframe src="https://yourapp.com/calendar?gameId=depths-of-osiris"></iframe>
```
- Shows calendar immediately
- After selection → jumps to player count (skips game selection)
- Seamless experience

---

### Scenario 3: Dedicated Appointment Page

**Either works, but consider:**

**Option A: Calendar Only (Recommended)**
```
[WordPress Header]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BOOK YOUR EXPERIENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Calendar Widget]
```
Cleaner, more focused

**Option B: Full Booking Flow**
```
[WordPress Header]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     BOOK YOUR EXPERIENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Full Booking with Steps 1-4]
```
Works if header/footer are hidden

---

## iframe Height Recommendations

### Calendar Only: `800px`
```html
<iframe src=".../calendar" height="800px"></iframe>
```
Fits calendar + header comfortably

### Full Booking: `900px`
```html
<iframe src=".../booking" height="900px"></iframe>
```
Accommodates all steps + indicators

### Mobile Responsive:
```css
@media (max-width: 768px) {
  iframe {
    height: 700px; /* Tighter on mobile */
  }
}
```

---

## Performance Comparison

### Calendar Only (`/calendar`)
- **Bundle Size:** ~2 KB (lazy-loaded)
- **Load Time:** < 200ms
- **Initial View:** Calendar immediately visible
- **Subsequent Pages:** Loads booking flow when needed

### Full Booking (`/booking`)
- **Bundle Size:** ~30 KB (lazy-loaded)
- **Load Time:** < 500ms
- **Initial View:** Step 1 (calendar) visible
- **Subsequent Pages:** Already loaded, instant navigation

**Winner:** Calendar only for initial load, but difference is minimal

---

## Final Recommendation

### Default Choice: Use `/calendar`

✅ **Use Calendar Everywhere:**
- Homepage booking widget
- Game detail pages
- Sidebar modules
- Any embedded location

✅ **Use Full Booking Only When:**
- Dedicated full-page booking experience
- WordPress header/footer are hidden
- You specifically want to show all steps

### Rule of Thumb:
**If you're embedding it *within* a WordPress page → Use `/calendar`**
**If the entire page *IS* the booking → Use `/booking`**

---

## Code Templates

### WordPress: Homepage Calendar Widget
```php
<section class="booking-section">
  <h2>Check Availability</h2>
  <p>Select your preferred date and time</p>
  <iframe
    src="<?php echo esc_url(get_option('vr_booking_url')); ?>/calendar"
    width="100%"
    height="800px"
    frameborder="0"
    title="Booking Calendar">
  </iframe>
</section>
```

### WordPress: Game Page Calendar
```php
<?php
$game_slug = get_post_meta(get_the_ID(), 'game_slug', true);
$booking_url = get_option('vr_booking_url');
?>

<div class="game-booking-widget">
  <h3>Book This Experience</h3>
  <iframe
    src="<?php echo esc_url($booking_url); ?>/calendar?gameId=<?php echo esc_attr($game_slug); ?>"
    width="100%"
    height="800px"
    frameborder="0">
  </iframe>
</div>
```

### WordPress: Dedicated Booking Page
```php
<?php /* Template Name: Booking Page */ ?>
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 0; background: #0a0a0a; }
    iframe { width: 100%; height: 100vh; border: none; display: block; }
  </style>
</head>
<body>
  <iframe
    src="<?php echo esc_url(get_option('vr_booking_url')); ?>/calendar"
    title="VR Booking System">
  </iframe>
</body>
</html>
```
