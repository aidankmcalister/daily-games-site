# Daily Games

[dles.fun](https://dles.fun)

A premium, curated platform for discovering and tracking daily puzzle games. Built with a "Dark Terminal" aesthetic, it offers a seamless experience for tracking progress, competing in races, and organizing your favorite daily challenges.

## 🚀 Key Features

### 🎮 **Game Discovery & Tracking**

- **Curated Library**: Browse a vast collection of daily games (Wordle, Connections, etc.) by category.
- **Daily Tracking**: Mark games as played to track consistency.
- **Streaks**: Maintain daily streaks to gamify your habit.
- **"Feeling Lucky"**: A premium, randomized game picker with a "Softened Terminal" aesthetic to find your next challenge instantly.

### 🏎️ **Races (New)**

- **Competitive Play**: Start a "Race" to challenge yourself or friends against the clock.
- **System Service**: Auto-generated daily races based on logic, words, or random themes.
- **Live Status**: Track progress in real-time with "Racing...", "Completed", and "Skipped" states.
- **History**: View detailed breakdown of past race performance in the dashboard.

### 📊 **Personal Dashboard**

- **Enhanced Stats**: Visual breakdown of games played, completion rates, and category preferences.
- **Custom Lists**: Create and manage personalized game lists (e.g., "Morning Coffee", "Hard Mode").
- **Guest Sync**: Persistent banner for guest users to easily sign in and save their progress.

### 🛡️ **Admin Panel**

- **Content Management**: Add/Edit/Delete games and manage topic assignments.
- **User Management**: Role-based access control (Owner/Admin/User).
- **System Config**: Toggle maintenance mode, customize welcome messages, and manage site-wide settings.

---

## 🎨 Design System

The application follows a **"Dark Terminal Premium"** design philosophy defined in `design-guidelines.md`:

- **Typography**: **JetBrains Mono** exclusively for a clean, developer-centric feel.
- **Aesthetic**:
  - **No Gradients**: Pure, high-contrast dark backgrounds (`bg-zinc-950`).
  - **Subtle Borders**: `border-zinc-800` for structure without visual noise.
  - **No "Hacker" Clichés**: Avoids bright green terminal text in favor of softened, professional monochrome with purposeful color accents.
- **Components**: Custom-built using `shadcn/ui` primitives but significantly styled for the specific design system.

---

## 🛠️ Tech Stack

| Component       | Technology                                               |
| --------------- | -------------------------------------------------------- |
| **Framework**   | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **Language**    | TypeScript                                               |
| **Styling**     | Tailwind CSS 4, shadcn/ui, Lucide React                  |
| **Database**    | Prisma Postgres, Prisma ORM                              |
| **Auth**        | Better Auth (Google OAuth)                               |
| **State**       | React Context (Optimistic UI updates)                    |
| **Package Mgr** | Bun                                                      |

---

## 📂 File Structure

```
daily-games/
├── app/
│   ├── api/            # Next.js API Routes (Races, Games, Auth)
│   ├── dashboard/      # User stats and list management
│   ├── race/           # Race mode logic and UI
│   ├── admin/          # Admin management screens
│   └── page.tsx        # Main discovery grid
├── components/
│   ├── design-system/  # Core layout primitives
│   ├── feeling-lucky/  # The unique randomizer modal components
│   ├── game-card.tsx   # The primary game display unit
│   └── ...
├── lib/                # Utilities, hooks, and constants
└── prisma/             # Database schema and seed scripts
```

---

## ⚡ Getting Started

1.  **Install dependencies**:

    ```bash
    bun install
    ```

2.  **Environment Setup**:
    Create a `.env` file:

    ```env
    DATABASE_URL="postgresql://..."
    BETTER_AUTH_SECRET="..."
    BETTER_AUTH_URL="http://localhost:3000"
    GOOGLE_CLIENT_ID="..."
    GOOGLE_CLIENT_SECRET="..."
    ```

3.  **Database**:

    ```bash
    # Push schema
    bunx prisma db push

    # Seed verified game data
    bunx tsx prisma/seed.ts
    ```

4.  **Run Development Server**:

    ```bash
    bun dev
    ```

    Visit [http://localhost:3000](http://localhost:3000).

---

## 🧪 Commands

- `bun run build`: Build for production.
- `bun run lint`: Run ESLint.
- `bunx prisma studio`: Open database GUI.
