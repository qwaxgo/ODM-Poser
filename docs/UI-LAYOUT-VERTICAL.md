# Vertical Screen UI Layout

**Target devices:** Tablets, portrait-oriented monitors (tall, narrow screens)  
**Date:** 2026-11-05

## Layout Structure

```
┌─────────────────────────────────────────────┐
│           CANVAS DISPLAY (top)              │
│  (fixed height, or adjustable by drag)      │
└─────────────────────────────────────────────┘

┌─────────────┬────────────────────────────────┐
│   SIDEBAR   │   MENU AREA (horizontal scroll)│
│  (tabs,     │  [Tool1] [Tool2] [Tool3] ...→  │
│   vertical) │                                │
│             │  (scrollable left/right)       │
│  [Tab 1]    │                                │
│  [Tab 2]    │  Content changes per tab       │
│  [Tab 3]    │                                │
│  ...        │                                │
└─────────────┴────────────────────────────────┘
```

## Key Design Rules

### Canvas (top section)
- Display height: fixed or user-adjustable (drag to resize)
- Shows the current work (pose, image, etc.)
- Remains visible while user interacts with menus below

### Sidebar (bottom-left)
- **Tabs (vertical stack):** unchanged from current design
  - Each tab is a category/mode
  - Clicking a tab switches the menu content
  - Examples: "Pose", "Geometry", "Tools", "Settings"
- Width: narrow, fits tablet/phone screen

### Menu area (bottom-right, main content)
- **Horizontal layout:** buttons/controls in a row
- **Scrollable:** if menu items don't fit, user can scroll left/right
- Content changes based on selected tab
- Example: Tab "Pose" → shows pose-related tools horizontally

## Interaction Flow

1. User sees canvas at top
2. User selects a tab from sidebar (left)
3. Menu updates to show relevant tools (right)
4. User can scroll the menu horizontally to access more tools
5. Canvas remains visible and interactive

## Why This Layout?

- **Tablets/portraits:** Vertical screens have more height than width
- **Readability:** Canvas visible while editing (no stacking)
- **Accessibility:** Large touch targets for tabs and menu items
- **Scalability:** Horizontal scroll allows unlimited menu items

## Implementation Notes

- **Responsive:** adapt to screen size (tablet vs. large monitor)
- **Touch-friendly:** tap tabs, swipe menu horizontally
- **Desktop fallback:** on landscape/wide screens, may revert to current sidebar layout
- **Canvas resize:** optional drag handle between canvas and menus
