/*
  Warnings:

  - You are about to drop the column `played` on the `Game` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('owner', 'coowner', 'admin', 'member');

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "played",
ADD COLUMN     "playCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'member';

-- CreateIndex
CREATE INDEX "Game_playCount_idx" ON "Game"("playCount");
