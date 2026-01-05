---
description: Project conventions and AI assistant rules for dles-fun
---

# dles-fun Project Rules

Follow these rules for all development on the dles.fun platform.

> [!CAUTION] > **STRICT DESIGN ADHERENCE REQUIRED**
> You must follow the [Design Guidelines](design-guidelines.md) to a T.
> Do not deviate from the specified colors, typography, or component patterns.
> If you find inconsistencies, consult the design-guidelines.md file as the source of truth.

---

## 1. Design Philosophy

- **Clean and minimal** - No gradients, no heavy shadows
- **Consistent with Admin Dashboard** - Use the same patterns
- **Dark theme** with subtle borders

---

## 2. Typography

- **Font**: JetBrains Mono throughout
- **Page titles**: `text-2xl font-bold tracking-tight md:text-3xl`
- **Section titles**: `text-lg font-semibold`
- **Body text**: `text-sm`
- **Small/meta text**: `text-xs text-muted-foreground`

---

## 3. Layout

### Page Structure

```tsx
<main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
  <div className="mx-auto max-w-7xl">
    <PageHeader title="..." subtitle="..." backHref="/" />
    {/* Tabs if needed */}
    {/* Content */}
  </div>
</main>
```

### Spacing

- Section gaps: `space-y-4` or `space-y-6`
- Card padding: `p-4`
- Tabs margin: `mb-6`

---

## 4. Cards

```tsx
<Card className="border-border/50 bg-card">
  <CardHeader className="pb-3">
    <CardTitle className="text-lg font-semibold">Title</CardTitle>
  </CardHeader>
  <CardContent>{/* Content */}</CardContent>
</Card>
```

---

## 5. Lists (Admin Style)

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

---

## 6. Stat Cards

```tsx
<Card className="border-border/50 bg-card">
  <CardContent className="p-4">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-{color}-500/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-{color}-500" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">Label</p>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 7. Buttons

```tsx
// Primary
<Button className="gap-2">
  <Icon className="h-4 w-4" />
  Label
</Button>

// Secondary
<Button variant="outline" className="gap-2">
  <Icon className="h-4 w-4" />
  Label
</Button>
```

---

## 8. Topic Colors

Use `TOPIC_COLORS` from `@/lib/constants`:

```tsx
import { TOPIC_COLORS } from "@/lib/constants";

<Badge variant="secondary" className={cn("capitalize", TOPIC_COLORS[topic])}>
  {topic}
</Badge>;
```

---

## 9. Status Colors

| Status  | Container           | Text               |
| ------- | ------------------- | ------------------ |
| Success | `bg-emerald-500/10` | `text-emerald-500` |
| Danger  | `bg-rose-500/10`    | `text-rose-500`    |
| Warning | `bg-amber-500/10`   | `text-amber-500`   |
| Primary | `bg-primary/10`     | `text-primary`     |

---

## 10. Icons

Use **Lucide React** only. No emojis.

- Inline: `h-4 w-4`
- Icon containers: `h-5 w-5`

---

## 11. What NOT to Do

1. No gradients
2. No glassmorphism/blur
3. No heavy shadows
4. No "Command Center" or "Battle Arena" style hero sections
5. No emojis
6. No custom fonts (stick to JetBrains Mono)

---

## 12. Daily Progress Logic

- "Played Today" resets at midnight
- Use `gte: startOfToday` in queries
- Hidden games are excluded from all counts / percentages

---

## 13. Feedback

Use `sonner` for toasts:

```tsx
import { toast } from "sonner";

toast.success("Done!");
toast.error("Failed");
```
