-- CreateTable
CREATE TABLE `Announcements` (
    `announcements_id` CHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `category` ENUM('jadwal', 'libur', 'event', 'umum') NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`announcements_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Donation` (
    `donation_id` CHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `status` ENUM('open', 'finished', 'upcoming') NOT NULL,
    `target_amount` INTEGER NOT NULL,
    `collected_amount` INTEGER NOT NULL,
    `percent` INTEGER NOT NULL,
    `google_form_url` TEXT NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`donation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DonationAllocation` (
    `donation_allocation_id` CHAR(36) NOT NULL,
    `donation_id` CHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `percent` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`donation_allocation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Students` (
    `student_id` CHAR(36) NOT NULL,
    `student_name` VARCHAR(191) NOT NULL,
    `student_age` INTEGER NOT NULL,
    `parent_name` VARCHAR(191) NOT NULL,
    `whatsapp` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`student_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Programs` (
    `program_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `icon` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`program_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mentors` (
    `mentor_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`mentor_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Classes` (
    `class_id` CHAR(36) NOT NULL,
    `program_id` CHAR(36) NOT NULL,
    `mentor_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `age_range` VARCHAR(191) NOT NULL,
    `period` VARCHAR(191) NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL,
    `image` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Classes_program_id_idx`(`program_id`),
    INDEX `Classes_mentor_id_idx`(`mentor_id`),
    PRIMARY KEY (`class_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Enrollments` (
    `enrollment_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `class_id` CHAR(36) NOT NULL,
    `status` ENUM('registered', 'confirmed', 'active', 'dropped', 'rejected', 'completed') NOT NULL,
    `register_at` DATETIME(3) NOT NULL,
    `confirmed_at` DATETIME(3) NOT NULL,
    `started_at` DATETIME(3) NOT NULL,
    `ended_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Enrollments_student_id_idx`(`student_id`),
    INDEX `Enrollments_class_id_idx`(`class_id`),
    UNIQUE INDEX `Enrollments_student_id_class_id_key`(`student_id`, `class_id`),
    PRIMARY KEY (`enrollment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Schedules` (
    `schedule_id` CHAR(36) NOT NULL,
    `class_id` CHAR(36) NOT NULL,
    `date` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Schedules_class_id_idx`(`class_id`),
    UNIQUE INDEX `Schedules_class_id_date_key`(`class_id`, `date`),
    PRIMARY KEY (`schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DonationAllocation` ADD CONSTRAINT `DonationAllocation_donation_id_fkey` FOREIGN KEY (`donation_id`) REFERENCES `Donation`(`donation_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Classes` ADD CONSTRAINT `Classes_program_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `Programs`(`program_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Classes` ADD CONSTRAINT `Classes_mentor_id_fkey` FOREIGN KEY (`mentor_id`) REFERENCES `Mentors`(`mentor_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollments` ADD CONSTRAINT `Enrollments_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `Students`(`student_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollments` ADD CONSTRAINT `Enrollments_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `Classes`(`class_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedules` ADD CONSTRAINT `Schedules_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `Classes`(`class_id`) ON DELETE CASCADE ON UPDATE CASCADE;
