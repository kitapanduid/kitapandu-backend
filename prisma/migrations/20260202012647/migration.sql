/*
  Warnings:

  - You are about to drop the column `ended_at` on the `Enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `started_at` on the `Enrollments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Classes` ADD COLUMN `ended_at` DATETIME(3) NULL,
    ADD COLUMN `started_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Enrollments` DROP COLUMN `ended_at`,
    DROP COLUMN `started_at`,
    MODIFY `confirmed_at` DATETIME(3) NULL;
