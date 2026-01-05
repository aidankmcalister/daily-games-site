# Daily Games Design System

Design guidelines based on the established visual patterns in the Admin Dashboard and Homepage.

---

## Core Aesthetic

The design philosophy is **clean, minimal, and functional**. Dark background with subtle borders and clear typography. No gradients, no heavy effects.

---

## Typography

**Font**: JetBrains Mono throughout the entire application.

| Element       | Classes                                         |
| ------------- | ----------------------------------------------- |
| Page Title    | `text-2xl font-bold tracking-tight md:text-3xl` |
| Section Title | `text-lg font-semibold`                         |
| Body          | `text-sm`                                       |
| Small Text    | `text-xs text-muted-foreground`                 |
| Tiny Label    | `text-xs text-muted-foreground`                 |

---

## Colors

### Backgrounds

- Page: `bg-background` (dark zinc/black)
- Cards: `bg-card`
- Muted areas: `bg-muted/30` or `bg-muted/40`

### Borders

- Standard: `border` (uses border color from theme)
- Dividers: `divide-y` (for lists)

### Text

- Primary: `text-foreground`
- Secondary: `text-muted-foreground`
- Links/Actions: `text-primary`

### Topic Colors (from `lib/constants.ts`)

| Topic         | Badge Classes                                              |
| ------------- | ---------------------------------------------------------- |
| Words         | `bg-blue-500/20 text-blue-700 dark:text-blue-300`          |
| Puzzle        | `bg-purple-500/20 text-purple-700 dark:text-purple-300`    |
| Trivia        | `bg-yellow-500/20 text-yellow-700 dark:text-yellow-300`    |
| Entertainment | `bg-pink-500/20 text-pink-700 dark:text-pink-300`          |
| Geography     | `bg-green-500/20 text-green-700 dark:text-green-300`       |
| Gaming        | `bg-red-500/20 text-red-700 dark:text-red-300`             |
| Nature        | `bg-emerald-500/20 text-emerald-700 dark:text-emerald-300` |
| Food          | `bg-orange-500/20 text-orange-700 dark:text-orange-300`    |
| Sports        | `bg-cyan-500/20 text-cyan-700 dark:text-cyan-300`          |

### Status Colors

| Status  | Icon Container                       | Text               |
| ------- | ------------------------------------ | ------------------ |
| Success | `bg-emerald-500/10 text-emerald-500` | `text-emerald-500` |
| Danger  | `bg-rose-500/10 text-rose-500`       | `text-rose-500`    |
| Warning | `bg-amber-500/10 text-amber-500`     | `text-amber-500`   |
| Default | `bg-primary/10 text-primary`         | `text-primary`     |

---

## Layout

### Page Structure

```tsx
<main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
  <div className="mx-auto max-w-7xl">
    {/* Page Header */}
    {/* Tabs (if any) */}
    {/* Content */}
  </div>
</main>
```

### Spacing

- Page padding: `px-4 py-8 md:px-8 lg:px-12`
- Max width: `max-w-7xl`
- Section gaps: `space-y-4` or `space-y-6`
- Card internal padding: `p-4`

---

## Components

### Page Header

Use the `PageHeader` component:

```tsx
<PageHeader title="Page Title" subtitle="Description text." backHref="/" />
```

### Tab Navigation

```tsx
<div className="flex gap-2 mb-6">
  <Link href="/path">
    <Button variant={isActive ? "default" : "outline"} className="gap-2">
      <Icon className="h-4 w-4" />
      Tab Name
    </Button>
  </Link>
</div>
```

### Cards

Standard card pattern:

```tsx
<Card className="border-border/50 bg-card">
  <CardHeader className="pb-3">
    <CardTitle className="text-lg font-semibold">Title</CardTitle>
  </CardHeader>
  <CardContent>{/* Content */}</CardContent>
</Card>
```

### List Container (Admin Style)

```tsx
<div className="rounded-md border bg-card">
  <div className="divide-y">
    {items.map((item) => (
      <div
        key={item.id}
        className="px-4 py-3 hover:bg-muted/40 transition-colors"
      >
        {/* Item content */}
      </div>
    ))}
  </div>
</div>
```

### Stat Cards

```tsx
<Card className="border-border/50 bg-card">
  <CardContent className="p-4">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">Label</p>
      </div>
    </div>
  </CardContent>
</Card>
```

### Buttons

```tsx
// Primary action
<Button className="gap-2">
  <Icon className="h-4 w-4" />
  Action
</Button>

// Secondary action
<Button variant="outline" className="gap-2">
  <Icon className="h-4 w-4" />
  Action
</Button>

// Small button
<Button variant="outline" size="sm" className="h-8 gap-1.5">
  <Icon className="h-3.5 w-3.5" />
  Action
</Button>
```

### Badges

```tsx
import { TOPIC_COLORS } from "@/lib/constants";

<Badge variant="secondary" className={cn("capitalize", TOPIC_COLORS[topic])}>
  {topic}
</Badge>;
```

---

## Icons

Use **Lucide React** exclusively.

| Size      | Context                  |
| --------- | ------------------------ |
| `h-4 w-4` | Inline with buttons/text |
| `h-5 w-5` | Inside icon containers   |
| `h-6 w-6` | Larger emphasis          |

---

## What NOT to Do

1. **No gradients** on backgrounds
2. **No heavy shadows** - use `border` instead
3. **No glassmorphism/blur** effects
4. **NEVER use emojis** - use Lucide icons
5. **No custom gradient hero sections**
6. **No "Command Center" style** - keep it simple like Admin Dashboard

---

## File Structure

| Location                     | Purpose                         |
| ---------------------------- | ------------------------------- |
| `components/ui/`             | Shadcn UI base components       |
| `components/design-system/`  | Custom design system components |
| `components/page-header.tsx` | Reusable page header            |
| `lib/constants.ts`           | Topic colors and constants      |

---

## Race-Specific Components

### Race Header Stats

```tsx
// Three equal-width stat cards
<div className="grid grid-cols-3 gap-4 mb-6">
  <Card className="border-border/50 bg-card">
    <CardContent className="p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
        You
      </p>
      <p className="text-2xl font-bold">0/1</p>
    </CardContent>
  </Card>
  {/* Opponent and Timer cards */}
</div>
```

### Race Game Card

```tsx
<Card className="border-border/50 bg-card">
  <CardContent className="p-4">
    <div className="flex items-start justify-between mb-2">
      <div>
        <h3 className="font-semibold">{game.title}</h3>
        <p className="text-xs text-muted-foreground">{game.link}</p>
      </div>
      <Badge>{game.topic}</Badge>
    </div>

    {/* Player status - horizontal layout */}
    <div className="flex gap-4 text-sm mb-4">
      <div>
        <span className="text-muted-foreground">You:</span> ⏳ Racing...
      </div>
      <div>
        <span className="text-muted-foreground">Opponent:</span> ⏳ Racing...
      </div>
    </div>

    {/* Action buttons */}
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="flex-1">
        Play Game
      </Button>
      <Button size="sm" className="flex-1 bg-emerald-500">
        Done
      </Button>
      <Button variant="outline" size="sm" className="flex-1">
        Skip
      </Button>
    </div>
  </CardContent>
</Card>
```

---

## Tooltips

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>{/* Card or element */}</TooltipTrigger>
    <TooltipContent className="max-w-xs">
      <p className="text-sm">{description}</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

- Keep content concise (1-2 sentences max)
- Use `max-w-xs` or `max-w-sm` to prevent overly wide tooltips

---

## Game Status Indicators

| State     | Icon      | Style                                        |
| --------- | --------- | -------------------------------------------- |
| Completed | `Check`   | `text-emerald-500 h-4 w-4`                   |
| Skipped   | `Forward` | `text-amber-500 h-4 w-4`                     |
| Racing    | `Loader2` | `text-muted-foreground h-4 w-4 animate-spin` |
| Pending   | No icon   | Default state                                |

---

## Button Action Hierarchy

**In Race Context:**

1. **Primary:** Done button - `bg-emerald-500 hover:bg-emerald-600`
2. **Secondary:** Skip button - `variant="outline"` with amber accent on hover
3. **Tertiary:** Play Game - `variant="outline"` or `variant="ghost"`

**General Rule:** One primary action per card

---

## Progress Display

**Format:** `X/Y` (not `/Y` or `X of Y`)

```tsx
<div>
  <p className="text-2xl font-bold">0/5</p>
  <p className="text-xs text-muted-foreground">completed</p>
</div>
```

---

## Timer Display

```tsx
<Card className="border-border/50 bg-card">
  <CardContent className="p-4">
    <div className="flex items-center gap-2">
      <Timer className="h-4 w-4 text-muted-foreground" />
      <p className="text-2xl font-bold tabular-nums">5:18</p>
    </div>
    <p className="text-xs text-muted-foreground mt-1">Race Time</p>
  </CardContent>
</Card>
```

Use `tabular-nums` for consistent width numbers.

---

## Search & Filter Bars

```tsx
<div className="flex items-center gap-2 mb-6">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input placeholder="Search..." className="pl-9" />
  </div>
  <Select>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="All Topics" />
    </SelectTrigger>
  </Select>
</div>
```

---

## Form Fields

```tsx
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label *</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormDescription>Helper text</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

- Required fields: Show asterisk (\*) in label
- Textarea: Use `resize-none` and explicit `rows` count

---

## Loading States

**Spinner:**

```tsx
<Loader2 className="h-4 w-4 animate-spin" />
```

**Skeleton Card:**

```tsx
<Card className="border-border/50">
  <CardContent className="p-4">
    <Skeleton className="h-4 w-3/4 mb-2" />
    <Skeleton className="h-3 w-1/2" />
  </CardContent>
</Card>
```

---

## Empty States

```tsx
<Card className="border-border/50 bg-card">
  <CardContent className="p-12 text-center">
    <div className="h-12 w-12 rounded-lg bg-muted mx-auto mb-4 flex items-center justify-center">
      <Icon className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="font-semibold mb-1">No items found</h3>
    <p className="text-sm text-muted-foreground mb-4">Description</p>
    <Button>Action</Button>
  </CardContent>
</Card>
```

---

## Responsive Breakpoints

| Breakpoint | Width  | Typical Use          |
| ---------- | ------ | -------------------- |
| `sm:`      | 640px  | 2 columns            |
| `md:`      | 768px  | Tablet adjustments   |
| `lg:`      | 1024px | 3-4 columns          |
| `xl:`      | 1280px | Desktop enhancements |

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

---

## Hover States

```tsx
// Interactive cards
className = "hover:bg-muted/40 transition-colors cursor-pointer";
```

---

## Animation

- Transitions: `transition-colors` or `transition-opacity`
- Duration: Default or `duration-200`
- Exception: Loading spinners with `animate-spin`

---

## Consistency Checklist

When creating a new page/feature:

- [ ] Uses JetBrains Mono font
- [ ] Uses standard card pattern with `border-border/50 bg-card`
- [ ] Consistent spacing (`p-4` padding, `gap-4` between elements)
- [ ] Icons from Lucide React only
- [ ] Topic badges use `TOPIC_COLORS` from constants
- [ ] Max width container: `max-w-7xl`
- [ ] Buttons follow hierarchy (one primary per context)
- [ ] Text uses proper muted variants for secondary info
- [ ] No gradients or heavy effects
- [ ] Responsive grid uses standard breakpoints

---

## Mobile-Specific Rules

- Stack action buttons vertically on small screens
- Reduce card padding to `p-3` on mobile
- Single column grid: `grid-cols-1 sm:grid-cols-3`
- Page titles scale: `text-xl md:text-2xl lg:text-3xl`
- Keep body text at `text-sm` minimum
