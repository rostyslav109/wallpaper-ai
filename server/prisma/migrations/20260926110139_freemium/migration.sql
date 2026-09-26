-- CreateEnum
CREATE TYPE "GenerationTier" AS ENUM ('FREE', 'PREMIUM');

-- AlterTable
ALTER TABLE "Generation" ADD COLUMN     "tier" "GenerationTier" NOT NULL DEFAULT 'PREMIUM';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "freeGenerations" INTEGER NOT NULL DEFAULT 2,
ALTER COLUMN "credits" SET DEFAULT 0;
