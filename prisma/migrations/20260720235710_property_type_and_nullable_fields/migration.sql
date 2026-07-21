/*
  Warnings:

  - Changed the type of `type` on the `properties` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('NAME', 'DESCRIPTION', 'CATEGORY', 'TAG', 'LOCATION');

-- AlterTable
ALTER TABLE "items" ALTER COLUMN "totalQty" DROP NOT NULL,
ALTER COLUMN "totalQty" DROP DEFAULT,
ALTER COLUMN "notifyThreshold" DROP NOT NULL,
ALTER COLUMN "notifyThreshold" DROP DEFAULT;

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "type",
ADD COLUMN     "type" "PropertyType" NOT NULL;

-- CreateIndex
CREATE INDEX "properties_type_idx" ON "properties"("type");

-- CreateIndex
CREATE UNIQUE INDEX "properties_type_title_key" ON "properties"("type", "title");
