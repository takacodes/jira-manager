/*
  Warnings:

  - You are about to drop the column `filterId` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `jiraApiKey` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `jiraEmail` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `jiraUrl` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `projectName` on the `Setting` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[keySetting]` on the table `Setting` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `keySetting` to the `Setting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valueSetting` to the `Setting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Setting" DROP COLUMN "filterId",
DROP COLUMN "jiraApiKey",
DROP COLUMN "jiraEmail",
DROP COLUMN "jiraUrl",
DROP COLUMN "projectName",
ADD COLUMN     "keySetting" TEXT NOT NULL,
ADD COLUMN     "valueSetting" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Setting_keySetting_key" ON "Setting"("keySetting");
