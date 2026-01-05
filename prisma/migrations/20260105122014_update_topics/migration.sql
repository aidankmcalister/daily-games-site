/*
  Warnings:

  - The values [puzzle,entertainment,gaming] on the enum `Topic` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Topic_new" AS ENUM ('words', 'geography', 'trivia', 'nature', 'food', 'sports', 'colors', 'estimation', 'logic', 'history', 'movies_tv', 'music', 'shapes', 'video_games', 'board_games');
ALTER TABLE "public"."Game" ALTER COLUMN "topic" DROP DEFAULT;
ALTER TABLE "Game" ALTER COLUMN "topic" TYPE "Topic_new" USING ("topic"::text::"Topic_new");
ALTER TABLE "GameSubmission" ALTER COLUMN "topic" TYPE "Topic_new" USING ("topic"::text::"Topic_new");
ALTER TYPE "Topic" RENAME TO "Topic_old";
ALTER TYPE "Topic_new" RENAME TO "Topic";
DROP TYPE "public"."Topic_old";
ALTER TABLE "Game" ALTER COLUMN "topic" SET DEFAULT 'words';
COMMIT;

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "topic" SET DEFAULT 'words';
