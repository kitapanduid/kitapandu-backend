/*
  Warnings:

  - You are about to drop the column `age_range` on the `Classes` table. All the data in the column will be lost.
  - You are about to drop the column `period` on the `Classes` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Schedules` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[class_id,day_of_week,start_time]` on the table `Schedules` will be added. If there are existing duplicate values, this will fail.
  - Made the column `ended_at` on table `Classes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `started_at` on table `Classes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Schedules` DROP FOREIGN KEY `Schedules_class_id_fkey`;

-- DropIndex
DROP INDEX `Schedules_class_id_date_key` ON `Schedules`;

-- AlterTable
ALTER TABLE `Classes` DROP COLUMN `age_range`,
    DROP COLUMN `period`,
    ADD COLUMN `max_age` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `min_age` INTEGER NOT NULL DEFAULT 0,
    MODIFY `ended_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Schedules` DROP COLUMN `date`,
    ADD COLUMN `day_of_week` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `end_time` VARCHAR(191) NOT NULL DEFAULT '00:00',
    ADD COLUMN `start_time` VARCHAR(191) NOT NULL DEFAULT '00:00';

-- CreateIndex
CREATE UNIQUE INDEX `Schedules_class_id_day_of_week_start_time_key` ON `Schedules`(`class_id`, `day_of_week`, `start_time`);

-- AddForeignKey
ALTER TABLE `Schedules` ADD CONSTRAINT `Schedules_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `Classes`(`class_id`) ON DELETE CASCADE ON UPDATE CASCADE;
