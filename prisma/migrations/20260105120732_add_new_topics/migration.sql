/*
  Warnings:

  - The values [pending,approved,rejected,duplicate] on the enum `SubmissionStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `description` to the `GameSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RaceStatus" AS ENUM ('waiting', 'ready', 'active', 'completed', 'cancelled');

-- AlterEnum
BEGIN;
CREATE TYPE "SubmissionStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DUPLICATE');
ALTER TABLE "public"."GameSubmission" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "GameSubmission" ALTER COLUMN "status" TYPE "SubmissionStatus_new" USING ("status"::text::"SubmissionStatus_new");
ALTER TYPE "SubmissionStatus" RENAME TO "SubmissionStatus_old";
ALTER TYPE "SubmissionStatus_new" RENAME TO "SubmissionStatus";
DROP TYPE "public"."SubmissionStatus_old";
ALTER TABLE "GameSubmission" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Topic" ADD VALUE 'colors';
ALTER TYPE "Topic" ADD VALUE 'estimation';
ALTER TYPE "Topic" ADD VALUE 'logic';
ALTER TYPE "Topic" ADD VALUE 'history';
ALTER TYPE "Topic" ADD VALUE 'movies_tv';
ALTER TYPE "Topic" ADD VALUE 'music';
ALTER TYPE "Topic" ADD VALUE 'shapes';
ALTER TYPE "Topic" ADD VALUE 'video_games';
ALTER TYPE "Topic" ADD VALUE 'board_games';

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "GameSubmission" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "reviewedBy" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "SiteConfig" ADD COLUMN     "showWelcomeMessage" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Race" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT,
    "status" "RaceStatus" NOT NULL DEFAULT 'waiting',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Race_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaceParticipant" (
    "id" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "userId" TEXT,
    "guestName" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "totalTime" INTEGER,

    CONSTRAINT "RaceParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaceGame" (
    "id" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "RaceGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaceCompletion" (
    "id" TEXT NOT NULL,
    "raceGameId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeToComplete" INTEGER NOT NULL,
    "skipped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RaceCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Race_status_idx" ON "Race"("status");

-- CreateIndex
CREATE INDEX "RaceParticipant_raceId_idx" ON "RaceParticipant"("raceId");

-- CreateIndex
CREATE UNIQUE INDEX "RaceParticipant_raceId_userId_key" ON "RaceParticipant"("raceId", "userId");

-- CreateIndex
CREATE INDEX "RaceGame_raceId_idx" ON "RaceGame"("raceId");

-- CreateIndex
CREATE UNIQUE INDEX "RaceCompletion_raceGameId_participantId_key" ON "RaceCompletion"("raceGameId", "participantId");

-- AddForeignKey
ALTER TABLE "Race" ADD CONSTRAINT "Race_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceParticipant" ADD CONSTRAINT "RaceParticipant_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceParticipant" ADD CONSTRAINT "RaceParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceGame" ADD CONSTRAINT "RaceGame_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceGame" ADD CONSTRAINT "RaceGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceCompletion" ADD CONSTRAINT "RaceCompletion_raceGameId_fkey" FOREIGN KEY ("raceGameId") REFERENCES "RaceGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceCompletion" ADD CONSTRAINT "RaceCompletion_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "RaceParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
