---
name: Antigravity Design System
colors:
  surface: '#11131b'
  surface-dim: '#11131b'
  surface-bright: '#373942'
  surface-container-lowest: '#0c0e16'
  surface-container-low: '#191b24'
  surface-container: '#1d1f28'
  surface-container-high: '#282a32'
  surface-container-highest: '#33343e'
  on-surface: '#e2e1ee'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e2e1ee'
  inverse-on-surface: '#2e3039'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#c0c1ff'
  on-secondary: '#1000a9'
  secondary-container: '#3131c0'
  on-secondary-container: '#b0b2ff'
  tertiary: '#bcc7de'
  on-tertiary: '#263143'
  tertiary-container: '#8691a7'
  on-tertiary-container: '#1f2a3c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#11131b'
  on-background: '#e2e1ee'
  surface-variant: '#33343e'
typography:
  headline-lg:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 24px
  sidebar-width: 240px
  sidebar-collapsed: 64px
---

## Brand & Style

This design system is engineered for high-performance developer tools, prioritizing technical precision and high information density. The brand personality is **utilitarian, premium, and calm**, evoking the feeling of a sophisticated command center. 

The aesthetic is a refined **Corporate Modern** style with a dark, developer-centric focus. It leverages a "Deep Space" visual metaphor—utilizing heavy, dark navy backgrounds to reduce eye strain during long coding sessions, while using restrained electric blue accents to guide the eye toward critical actions and terminal outputs. The interface avoids all decorative flourishes like glassmorphism or illustrations, instead relying on mathematical spacing, crisp typography, and subtle tonal layering to communicate hierarchy.

## Colors

The palette is anchored by **Deep Midnight Navy** and **Near-Black**, providing a low-luminance foundation that makes code and data pop. 

- **Backgrounds:** The primary canvas uses `#05060b` for the deepest layers (terminal backgrounds, app-wide base), while `#0a0c14` serves as the standard background for UI containers.
- **Surfaces:** Functional panels and sidebars use `#121624`, creating a subtle tonal lift that defines structure without the need for heavy borders.
- **Accents:** Electric Blue (`#3b82f6`) and Indigo (`#6366f1`) are used exclusively for primary actions, active states, and progress indicators. Cobalt Blue (`#2563eb`) is reserved for high-contrast selection states in lists or menus.
- **Status:** Standard semantic colors apply but are desaturated to fit the dark theme: 
    - **Info:** Primary Blue
    - **Success:** Emerald 500
    - **Warning:** Amber 500 
    - **Danger:** Rose 500

## Typography

This design system utilizes a dual-font strategy to distinguish between the "Interface" and the "Data."

**Geist** is the primary UI typeface. It is a highly legible, geometric sans-serif designed for developers. It handles compact labeling and dense metadata blocks with exceptional clarity.

**JetBrains Mono** is used for all code blocks, terminal outputs, keyboard shortcuts, and CLI hints. It features increased letter spacing and distinct character shapes to prevent reading errors in technical strings.

Typography is scaled aggressively for density; most functional labels hover between 12px and 14px to maximize the visible information on screen.

## Layout & Spacing

The design system employs a **Fluid-Fixed Hybrid** layout. Sidebars and tool panels are fixed in width to maintain consistent hit targets, while the main workspace (Terminal/Code Editor) expands fluidly to fill the viewport.

The spacing rhythm is based on a **4px grid**.
- **High Density:** Padding within components (buttons, input fields, cards) is kept tight (8px to 12px) to allow for more content.
- **Structural Spacing:** 16px gutters are used between major layout blocks. 
- **Reflow:** On mobile, the sidebar collapses into a bottom navigation bar or a hamburger menu, and internal card margins reduce from 24px to 16px.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Low-Contrast Outlines** rather than traditional shadows. 

1.  **Base (Z-0):** The primary application background (`#05060b`).
2.  **Surface (Z-1):** Cards, sidebars, and panels (`#121624`).
3.  **Overlay (Z-2):** Tooltips and dropdown menus, which use a slightly lighter navy (`#1c2136`) and a very subtle 1px border (`#1e293b`).

Shadows, if used at all, are "Hard Ambient" shadows: 0px 4px 12px with 40% opacity in pure black, used only for floating modals to provide a slight lift from the dark background.

## Shapes

The design system uses a **Rounded** shape language to soften the "industrial" feel of the CLI and make the interface feel modern and premium. 

- **Base Radius:** 8px for standard components like buttons and small input fields.
- **Container Radius:** 12px to 14px for cards, terminal windows, and sidebar panels.
- **Interactive States:** Active selection markers in the sidebar use a 6px radius or a "pill" shape (Z-height / 2) to signify selection clearly.

## Components

### Sidebar & Navigation
The sidebar is compact. Icons are 20px, paired with 13px Medium labels. The "Active" state uses the Selection Cobalt (`#2563eb`) as a background for the entire row or a vertical 3px indicator on the left edge.

### Header / Metadata Bar
A slim (40px height) bar at the top of panels. It displays breadcrumbs, git branches, and status indicators in `label-sm` typography. Use `#1e293b` for a subtle bottom border separator.

### Technical Cards
Cards feature a 1px border of `#1e293b`. For "Tool Calls" or "Permissions," the card header should have a subtle background tint based on severity (e.g., a 10% red tint for Danger).

### Code & Terminal Blocks
Terminal backgrounds are `#05060b` with no border. Text uses `code-md`. Syntax highlighting should follow a "Nord" or "Subtle Dark" scheme—avoiding overly bright neon colors in favor of pastels.

### Buttons
- **Primary:** Solid `#3b82f6` with white text. 
- **Secondary:** Transparent with `#1e293b` border and Geist Medium text.
- **Ghost:** No background/border; only text and icon. Used for auxiliary header actions.

### Permissions & Severity
Use small, high-contrast icons (14px) with subtle background washes:
- **Info:** Light blue icon, no background.
- **Warning:** Amber icon, 10% amber background pulse.
- **Danger:** Rose icon, 10% rose background wash.