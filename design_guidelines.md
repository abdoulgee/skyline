# Skyline LTD Design Guidelines

## Design Approach
**Reference-Based**: Luxury entertainment platform inspired by premium booking services (Airbnb luxury tier) combined with corporate fintech professionalism. The design must convey celebrity-grade exclusivity while maintaining mobile-first accessibility.

## Brand Identity
High-end celebrity engagement platform mixing luxury entertainment with corporate professionalism. Target: premium users booking celebrity services with crypto-funded wallets.

## Color Palette
- **Primary**: Royal Navy Blue `#0A1A2F`
- **Accent**: Skyline Cyan `#00B8D4`
- **Highlight**: Luxury Gold `#F5C542`
- **Background**: Pure White `#FFFFFF`
- **Section Background**: Slate Gray `#ECEFF1`

## Typography
- **Headings**: Poppins ExtraBold (Google Fonts)
- **Body**: Inter Regular (Google Fonts)
- **Hierarchy**: Large hero titles (3xl-6xl), section headings (2xl-3xl), card titles (xl-2xl), body text (base-lg)

## Layout System
**Mobile-First Spacing** (80% mobile usage):
- Primary units: `p-4`, `p-6`, `p-8` for sections
- Card spacing: `gap-4` mobile, `gap-6` desktop
- Container: `max-w-7xl` with `px-4 md:px-6 lg:px-8`
- Generous touch targets: minimum `h-12` for buttons

## Visual Effects & Animations
- **3D Text**: CSS transform layers on hero headings with depth shadows
- **Smooth Transitions**: Fade-ins on scroll for sections (opacity + translateY)
- **Hover Effects**: Scale zoom (1.05) on celebrity cards with shadow lift
- **Page Transitions**: Subtle fade between route changes
- **Gradient Overlays**: Linear gradients on hero banners (navy to cyan)
- **Parallax**: Subtle background scroll effects on homepage sections
- **Mobile Menu**: Slide-in drawer animation from right

## Component Specifications

### Navigation
- **Desktop**: Sticky header with logo left, nav center, wallet/profile right
- **Mobile**: Bottom fixed navbar (4-5 icons: home, bookings, campaigns, messages, profile) + hamburger menu drawer

### Hero Section (Homepage)
- **Large Hero Image**: Full-width celebrity showcase with gradient overlay (navy to transparent)
- **3D Heading**: Multi-layered text effect with gold accent highlights
- **Animated Slider**: Auto-rotating celebrity carousel with smooth transitions
- **CTA Buttons**: Large, blurred background buttons with gold accent on primary action

### Celebrity Cards
- **Image**: Rounded-xl with soft shadows, aspect-ratio-square
- **Hover**: Zoom effect with shadow elevation
- **Content**: Name, category badge, price in gold, brief tagline
- **Grid**: 1 column mobile, 2 tablet, 3-4 desktop

### Chat Interface
- **Unified Center**: Single message hub for bookings + campaigns
- **Thread List**: Left sidebar desktop, full-screen mobile with back navigation
- **Messages**: Bubble design, user (cyan), admin/agent (navy)
- **Agent Banner**: Clear indicator showing "Chatting as [Celebrity Name]"

### Dashboard Layout
- **Mobile**: Bottom fixed navbar for primary navigation, swipeable tab content
- **Desktop**: Sidebar navigation with main content area
- **Cards**: Elevated white cards on slate background with rounded corners

### Wallet & Transaction UI
- **Balance Display**: Large prominent number in gold
- **Crypto Selector**: Radio buttons with coin icons (BTC/ETH/USDT)
- **Live Rates**: Auto-updating display showing conversion calculation
- **QR Code**: Admin wallet address with copy button
- **Status Badges**: Color-coded (pending: gold, approved: cyan, rejected: red)

### Notification Center
- **Badge**: Red counter on bell icon
- **List View**: Card-based with icons, timestamps, read/unread states
- **Mobile Gestures**: Swipe to dismiss functionality

### Forms
- **Input Fields**: Clean borders, focus state with cyan accent
- **Large Touch Targets**: Minimum height 48px for mobile
- **Error States**: Red underline with helper text
- **Success States**: Cyan checkmark with confirmation message

## Images Strategy
- **Hero**: Full-width celebrity lifestyle image with premium aesthetic
- **Celebrity Profiles**: High-quality professional headshots, square format
- **About Page**: New York skyline or luxury office imagery
- **Background Patterns**: Subtle geometric overlays on sections

## Icons
- **Library**: Heroicons via CDN
- **Usage**: Navigation icons, status indicators, feature highlights
- **Style**: Outline style for consistency with premium aesthetic

## Accessibility
- Minimum contrast ratios maintained (navy/white, cyan/navy)
- Focus indicators visible on all interactive elements
- Touch targets 44px+ for mobile
- Screen reader labels on icon-only buttons

## Performance Requirements
- Mobile-first loading strategy
- Lazy load celebrity images below fold
- Optimized animations (CSS transforms/opacity only)
- Minimal JavaScript bundle size (Alpine.js for interactions)