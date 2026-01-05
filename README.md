# dles.fun

[dles.fun](https://dles.fun)

A collection of daily puzzle games like Wordle, Connections, and more. Track your stats, build lists, and race against the clock.

## Features

- **Daily Tracking**: Keep track of what you've played today. Syncs with local storage.
- **Races**: Auto-generated daily dashes. Finish a set of logic or word games as fast as you can.
- **Lists**: Organize games into custom lists (e.g., "Morning Routine").
- **Feeling Lucky**: Randomized game picker when you don't know what to play.
- **Guest Sync**: Guests can sign in with Google to save their history without losing progress.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Prisma (Postgres)
- **Auth**: Better Auth
- **UI**: Tailwind v4, shadcn/ui
- **Design**: Custom "Dark Terminal" aesthetic. JetBrains Mono, high contrast, no gradients.

## Running Locally

1.  **Install dependencies**

    ```bash
    bun install
    ```

2.  **Setup Environment**
    Copy `.env.example` to `.env` (or create one):

    ```env
    DATABASE_URL="postgresql://..."
    BETTER_AUTH_SECRET="..."
    BETTER_AUTH_URL="http://localhost:3000"
    GOOGLE_CLIENT_ID="..."
    GOOGLE_CLIENT_SECRET="..."
    ```

3.  **Database**

    ```bash
    bunx prisma db push
    bunx tsx prisma/seed.ts
    ```

4.  **Dev Server**

    ```bash
    bun dev
    ```

    Go to [http://localhost:3000](http://localhost:3000).
