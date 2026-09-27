-- AlterTable
ALTER TABLE "Generation" ADD COLUMN     "analysis" JSONB,
ADD COLUMN     "prompt" TEXT,
ADD COLUMN     "steps" JSONB;
