# Design Guidelines: Admin Management System

## Design Approach

**Framework**: Material Design System  
**Rationale**: Utility-focused admin dashboard requiring clear information hierarchy, robust form handling, and data table displays. Material Design provides proven patterns for enterprise applications with excellent Vue 3 component support.

**Core Principles**:
- Clarity over decoration
- Consistent, predictable interactions
- Efficient information density
- Professional, trustworthy appearance

---

## Typography

**Font Family**: Roboto (Material Design standard) via Google Fonts
- Headings: Roboto Medium (500)
- Body: Roboto Regular (400)
- Labels: Roboto Medium (500)
- Data/Tables: Roboto Regular (400)

**Scale**:
- Page Title: text-3xl (30px)
- Section Headers: text-xl (20px)
- Card Titles: text-lg (18px)
- Body/Forms: text-base (16px)
- Labels/Captions: text-sm (14px)
- Table Data: text-sm (14px)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16**
- Micro spacing (within components): p-2, gap-2
- Component internal: p-4, gap-4
- Section spacing: p-8, gap-8
- Page margins: p-12 or p-16

**Grid Structure**:
- Two-column dashboard layout: Sidebar (256px fixed) + Main content (flex-1)
- Forms: Single column, max-w-md for optimal readability
- Tables: Full width within container, max-w-7xl
- Cards: Grid layout for dashboard metrics (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)

---

## Component Library

### Navigation
**Sidebar Navigation** (Fixed left, h-screen):
- Logo/branding at top (h-16)
- Navigation items with icons (h-12 each)
- User profile section at bottom
- Active state: subtle background highlight
- Collapsed state for mobile (hamburger menu)

**Top Bar** (sticky, h-16):
- Page title (left)
- User avatar + role badge + logout (right)
- Breadcrumbs for nested pages

### Authentication
**Login Page** (Centered card, max-w-md):
- Application logo/title
- Email and password inputs (full width)
- "Remember me" checkbox
- Primary login button (full width)
- Minimal, focused design without distractions

### Forms
**Input Fields**:
- Outlined style (Material Design)
- Floating labels
- Helper text below inputs
- Error states with red outline and message
- Required field indicator (*)

**Buttons**:
- Primary: Filled, elevated shadow
- Secondary: Outlined
- Heights: h-10 (standard), h-12 (prominent)
- Full width for mobile forms

### Data Display
**User Management Table**:
- Striped rows for readability
- Fixed header (sticky top)
- Columns: Avatar, Name, Email, Role Badge, Actions
- Action icons: Edit (pencil), Delete (trash)
- Hover state on rows (subtle background)
- Pagination at bottom (showing "X-Y of Z results")

**Role Badges**:
- Admin: Elevated badge, distinct treatment
- User: Subtle badge
- Small size (text-xs), rounded-full, px-3 py-1

**Cards** (Dashboard metrics):
- Elevation shadow (shadow-md)
- Rounded corners (rounded-lg)
- Icon + Label + Value layout
- p-6 internal padding

### Dialogs/Modals
**Add/Edit User Modal**:
- Overlay backdrop (backdrop-blur-sm)
- Centered card (max-w-lg)
- Header with title and close button
- Form fields
- Action buttons at bottom (Cancel + Save)

---

## Page Layouts

### Login Page
- Centered vertically and horizontally
- Single card (max-w-md)
- Minimal surrounding elements
- Subtle background pattern or gradient

### Admin Dashboard (Landing after login)
- Sidebar navigation (left)
- Main content area with:
  - Welcome message with user name
  - Metrics cards (4 columns): Total Users, Admin Users, Active Sessions, Recent Signups
  - Quick actions section
  - Recent activity feed

### User Management Page
- Sidebar navigation (left)
- Main content:
  - Page header with "User Management" title + "Add User" button (right)
  - Search/filter bar (full width)
  - Data table (full width)
  - Pagination controls

### Add/Edit User Modal
- Form fields: Name, Email, Password (only for new), Role (dropdown)
- Role selection: Radio buttons or select dropdown
- Clear cancel and save actions

---

## Interaction Patterns

**Loading States**: Skeleton screens for tables, spinner overlays for forms  
**Empty States**: Centered message with icon and "Add User" CTA  
**Confirmations**: Dialog for destructive actions (delete user)  
**Toasts**: Success/error notifications (top-right, auto-dismiss after 3s)  
**Form Validation**: Real-time validation with clear error messages

---

## Responsive Behavior

- **Desktop** (lg): Full sidebar + multi-column layouts
- **Tablet** (md): Collapsible sidebar + 2-column grids
- **Mobile** (base): Hamburger menu + single column + stacked forms

---

## Accessibility

- All interactive elements keyboard accessible
- Focus indicators on all inputs (ring-2 ring-blue-500)
- ARIA labels on icon buttons
- Sufficient contrast ratios (WCAG AA minimum)
- Form inputs properly labeled with `<label>` elements

---

This design creates a professional, efficient admin system that prioritizes usability and clear information hierarchy while maintaining a modern, polished appearance.