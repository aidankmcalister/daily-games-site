# Design Guidelines

A comprehensive design system for dles.fun establishing consistent typography, spacing, colors, and component patterns.

---

## Core Aesthetic

**Philosophy:** Dark Terminal Premium

- Clean, minimal interfaces with monospace typography
- Subtle borders and backgrounds, never heavy
- Purposeful animations and micro-interactions

---

## Typography

### Font Stack

```css
--font-heading: var(--font-jetbrains);
--font-body: var(--font-jetbrains);
```

### Text Scale

| Class                   | Size        | Weight        | Tracking                   | Usage               |
| ----------------------- | ----------- | ------------- | -------------------------- | ------------------- |
| `.text-heading-page`    | `text-3xl`  | `font-black`  | `tracking-tight`           | Page titles         |
| `.text-heading-section` | `text-lg`   | `font-bold`   | —                          | Section headers     |
| `.text-heading-card`    | `text-base` | `font-bold`   | `tracking-tight`           | Card titles         |
| `.text-body`            | `text-sm`   | `font-medium` | —                          | Body text           |
| `.text-body-small`      | `text-xs`   | `font-medium` | —                          | Small text, buttons |
| `.text-micro`           | `10px`      | `font-bold`   | `uppercase tracking-wider` | Labels, badges      |

### Usage Examples

```tsx
// Page title
<h1 className="text-heading-page text-foreground">Lists</h1>

// Section header
<h2 className="text-heading-section text-foreground">Your Game Lists</h2>

// Micro label
<span className="text-micro text-muted-foreground">4 games</span>
```

---

## Spacing

### Scale

| Token     | Tailwind             | Pixels | Usage                  |
| --------- | -------------------- | ------ | ---------------------- |
| `space-1` | `gap-1`, `p-1`       | 4px    | Tight internal spacing |
| `space-2` | `gap-2`, `p-2`       | 8px    | Component internal     |
| `space-3` | `gap-3`, `p-3`       | 12px   | Related elements       |
| `space-4` | `gap-4`, `p-4`       | 16px   | Card padding           |
| `space-6` | `gap-6`, `space-y-6` | 24px   | Section spacing        |
| `space-8` | `py-8`               | 32px   | Page sections          |

### Page Layout

```tsx
// Standard page container
<main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
  <div className="mx-auto max-w-7xl">{/* content */}</div>
</main>
```

---

## Colors

### Semantic Colors (CSS Variables)

- `--background` / `--foreground` — Base colors
- `--muted` / `--muted-foreground` — Secondary text, disabled states
- `--primary` / `--primary-foreground` — Actions, brand emphasis
- `--destructive` — Error states, delete actions
- `--border` / `--border-subtle` — Dividers, card borders

### Topic Colors

Located in `lib/constants.ts`:

- `TOPIC_COLORS` — Badge styling (bg + border + text)
- `TOPIC_BAR_COLORS` — Solid fills for progress bars
- `TOPIC_SHADOWS` — Hover glow effects

### List Colors

- `LIST_COLORS` — 18-color palette for custom lists
- `LIST_CARD_STYLES` — Card styling with dot indicators

---

## Components

### Buttons

Use `DlesButton` which extends shadcn `Button`:

```tsx
// Default (outline)
<DlesButton>Action</DlesButton>

// Primary
<DlesButton variant="default">Save</DlesButton>

// Ghost
<DlesButton variant="ghost" size="icon"><Icon /></DlesButton>

// With href (renders as Link)
<DlesButton href="/path">Navigate</DlesButton>
```

**Sizes:** `default` (h-10), `sm` (h-9), `lg` (h-11), `icon` (h-10 w-10), `icon-sm` (h-8 w-8)

### Cards

#### Standard Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

#### Grid Card (New Standard)

Used for data-dense dashboards like Race Stats and Admin Settings.

```tsx
<div className="rounded-xl border border-border/40 bg-card p-4">
  <div className="flex items-center gap-2 mb-4">
    <Icon className="h-4 w-4 text-muted-foreground" />
    <h3 className="text-heading-card">Card Title</h3>
  </div>
  {/* Content */}
</div>
```

### Badges & Topics

Use `DlesTopic` for category badges:

```tsx
<DlesTopic topic="words" size="sm" />
```

**Sizes:** `xs`, `sm`, `md`, `lg`

---

## What NOT to Do

❌ Hardcode colors: `text-blue-500` (use topic constants or semantic colors)
❌ Arbitrary spacing: `mt-[13px]` (use spacing scale)
❌ Mixed typography: `text-[10px]` (use `.text-micro`)
❌ Inline opacity: `text-muted-foreground/60` (use defined classes)
❌ Direct `<Button>` usage (use `DlesButton` wrapper)

---

## Animation Guidelines

### Transitions

- Default: `transition-colors` for hover states
- Cards: `transition-all duration-200` for hover transforms
- Fade-in: `animate-in fade-in duration-200`

### Loading States

- Use `Loader2` with `animate-spin`
- Skeletons for content loading

---

## Accessibility

- All interactive elements must have visible focus states
- Color contrast: minimum 4.5:1 for text
- Keyboard navigation supported
- ARIA labels on icon-only buttons
