/*
  Warnings:

  - You are about to drop the column `token` on the `TokenBlacklist` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[jti]` on the table `TokenBlacklist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jti` to the `TokenBlacklist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TokenBlacklist` DROP COLUMN `token`,
    ADD COLUMN `jti` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `TokenBlacklist_jti_key` ON `TokenBlacklist`(`jti`);

-- CreateIndex
CREATE INDEX `TokenBlacklist_userId_idx` ON `TokenBlacklist`(`userId`);
