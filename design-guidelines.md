# dles.fun Design System

extracted from code analysis on 2026-01-05

## 1. Color System

The system uses `oklch` values defined in `app/globals.css` via Tailwind v4 CSS variables.

### Semantic Palette (Light/Dark Mode)

| Token                  | Light Value                 | Dark Value                     | Usage                         |
| ---------------------- | --------------------------- | ------------------------------ | ----------------------------- |
| `--background`         | `oklch(1 0 0)` (White)      | `oklch(0.145 0 0)` (Dark Zinc) | Page background               |
| `--foreground`         | `oklch(0.145 0 0)`          | `oklch(0.985 0 0)`             | Main text                     |
| `--primary`            | `oklch(0.205 0 0)` (Black)  | `oklch(0.87 0 0)` (White)      | Primary actions/buttons       |
| `--primary-foreground` | `oklch(0.985 0 0)`          | `oklch(0.205 0 0)`             | Text on primary               |
| `--secondary`          | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`             | Secondary buttons/backgrounds |
| `--muted`              | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`             | Muted backgrounds             |
| `--muted-foreground`   | `oklch(0.556 0 0)`          | `oklch(0.708 0 0)`             | Secondary text                |
| `--border`             | `oklch(0.922 0 0)`          | `oklch(1 0 0 / 10%)`           | Borders                       |
| `--card`               | `oklch(1 0 0)`              | `oklch(0.205 0 0)`             | Card background               |
| `--destructive`        | `oklch(0.58 0.22 27)` (Red) | `oklch(0.704 0.191 22.216)`    | Error states                  |

### Topic Colors (from `lib/constants.ts`)

Used for Badges and Topic Indicators. Scale pattern: `bg-{color}-500/20 text-{color}-700` (Light) / `text-{color}-300` (Dark).

- **Words**: Blue
- **Geography**: Green
- **Trivia**: Yellow
- **Entertainment**: Pink (implied from previous context, currently 'Movies/TV' is Violet, 'Music' is Rose)
- **Nature**: Emerald
- **Food**: Orange
- **Sports**: Cyan
- ...and more (Logic: Slate, History: Amber).

### Status Colors

- **Success**: `text-emerald-500`
- **Warning**: `text-amber-500`
- **Danger**: `text-rose-500`

---

## 2. Typography

**Font Family**: `JetBrains Mono` (via var `--font-jetbrains-mono` in `globals.css`).
_Note: Design guidelines mention "JetBrains Mono", and code now implements it._

### Scale

| Role              | Class                                              | Size/Weight     | Usage                              |
| ----------------- | -------------------------------------------------- | --------------- | ---------------------------------- |
| **Page Title**    | `text-2xl font-bold tracking-tight`                | ~1.5rem / 700   | Main page headers (`h1`)           |
| **Section Title** | `text-lg font-semibold`                            | ~1.125rem / 600 | Major sections                     |
| **Card Title**    | `text-sm font-bold`                                | 0.875rem / 700  | Card headers                       |
| **Body Default**  | `text-sm`                                          | 0.875rem        | Standard text                      |
| **Small Label**   | `text-xs font-medium`                              | 0.75rem / 500   | Button text, secondary labels      |
| **Micro Label**   | `text-[10px] font-black uppercase tracking-widest` | 0.625rem / 900  | Steps, decorative labels (Race UI) |

---

## 3. Spacing & Layout

The system appears to be `4px` based (Tailwind standard).

### Global Layout

- **Container**: `max-w-7xl` (`mx-auto`)
- **Page Padding**: `px-4 py-8 md:px-8 lg:px-12`
- **Section Spacing**: `space-y-4` (tight) or `space-y-8` (loose)

### Component Spacing

- **Card Padding**: `p-4` (Default), `p-3` (Small/Mobile)
- **Grid Gaps**: `gap-3` or `gap-4`

---

## 4. Components

### Buttons

**Standard Button (`components/ui/button.tsx`)**

- **Default Size**: `h-7 px-2 text-xs` (Very Compact)
- **Variants**: `default` (Solid Primary), `outline` (Border), `ghost` (Hover only), `secondary`.
- **Radius**: `rounded-md`

**DlesButton (`components/ui/dles-button.tsx`) - _New Standard_**

- **Default Size**: `h-10` (Standard Height)
- **Text**: `text-xs font-medium`
- **Style**: Implicit `outline` (`border-primary/20 hover:bg-primary/5`)
- **Animation**: `transition-colors` (plus `hover:scale` in some contexts from previous tasks)

### Cards (`components/ui/card.tsx`)

- **Background**: `bg-card`
- **Border**: `ring-1 ring-foreground/10` (or `border border-border` in overrides)
- **Radius**: `rounded-lg`
- **Shadow**: None by default, minimal borders.

### Inputs

- **Height**: `h-10` (Standard)
- **Background**: `bg-muted` or `bg-transparent`
- **Border**: `border-border` focus `border-primary/30`
- **Radius**: `rounded-md`

### Badges

- **Style**: `rounded-full` or `rounded-sm` (Race UI).
- **Size**: `text-[10px]` (Race UI) or standard `text-xs`.

---

## 5. Design Rules & Patterns

1.  **"Dark Terminal Premium" Aesthetic**: High contrast, crisp borders, minimal shadows.
2.  **Border Radius**:
    - `rounded-md` (Buttons, Inputs)
    - `rounded-lg` (Cards, Containers)
    - `rounded-xl` (Larger containers in Race UI)
3.  **Shadows**: Generally avoided in favor of borders (`ring-1`, `border`). Hover states use `bg-primary/5` rather than shadow lift.
4.  **Icons**: Lucide React. Sizes `h-3.5` (Buttons), `h-4` (Standard), `h-5` (Feature).

---

## 6. CSS Variables (Tailwind v4)

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --card: oklch(1 0 0);
  --border: oklch(0.922 0 0);
  --radius: 0.625rem;
  --font-geist-mono: "Geist Mono", monospace;
}
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.87 0 0);
  --card: oklch(0.205 0 0);
  --border: oklch(1 0 0 / 10%);
}
```

## 7. Inconsistencies Detected

1.  **Button Sizing**:

    - `components/ui/button.tsx` defaults to `h-7` (Compact).
    - `DlesButton` and `app/race/new` use `h-10` (Standard).
    - _Recommendation_: Standardize on `h-10` for main interactions.

2.  **Font Family**:

    - Code uses `Geist Mono`.
    - Old Guidelines verify `JetBrains Mono`.
    - _Reality_: Geist Mono is live.

3.  **Card Titles**:
    - `CardTitle` component is `text-sm font-medium`.
    - `app/page.tsx` uses `text-2xl` for page headers.
    - Race UI uses `text-[10px]` uppercase headers.
    - _Pattern_: Very disparate hierarchy.
