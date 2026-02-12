import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { adapter } from "../src/helper/adapter"
import bcrypt from "bcrypt"

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  const passwordHash = await bcrypt.hash("password123", 10)

  // ======================
  // USERS
  // ======================
  await prisma.user.createMany({
    data: [
      {
        email: "admin@kitapandu.com",
        name: "System Admin",
        password: passwordHash,
        role: "admin",
      },
      {
        email: "operator1@kitapandu.com",
        name: "Operator One",
        password: passwordHash,
        role: "operator",
      },
      {
        email: "operator2@kitapandu.com",
        name: "Operator Two",
        password: passwordHash,
        role: "operator",
      },
    ],
    skipDuplicates: true,
  })

  // ======================
  // ANNOUNCEMENTS
  // ======================
  await prisma.announcements.createMany({
    data: [
      {
        title: "Libur Nasional",
        category: "libur",
        content: "Sekolah libur pada tanggal merah nasional.",
      },
      {
        title: "Jadwal Baru",
        category: "jadwal",
        content: "Jadwal kelas telah diperbarui.",
      },
      {
        title: "Event Parenting",
        category: "event",
        content: "Akan diadakan seminar parenting bulan ini.",
      },
    ],
  })

  // ======================
  // PROGRAMS
  // ======================
  const [tahfidz, calistung] = await Promise.all([
    prisma.programs.create({
      data: {
        name: "Tahfidz Anak",
        description: "Program hafalan Al-Qur'an untuk anak-anak",
        icon: "quran",
        image: "tahfidz.jpg",
      },
    }),
    prisma.programs.create({
      data: {
        name: "Calistung",
        description: "Belajar membaca, menulis, dan berhitung",
        icon: "book",
        image: "calistung.jpg",
      },
    }),
  ])

  // ======================
  // MENTORS
  // ======================
  const [mentorAhmad, mentorAisyah] = await Promise.all([
    prisma.mentors.create({
      data: {
        name: "Ustadz Ahmad",
        contact: "08123456789",
      },
    }),
    prisma.mentors.create({
      data: {
        name: "Ustadzah Aisyah",
        contact: "08129876123",
      },
    }),
  ])

  // ======================
  // CLASSES
  // ======================
  const [classA, classB] = await Promise.all([
    prisma.classes.create({
      data: {
        program_id: tahfidz.program_id,
        mentor_id: mentorAhmad.mentor_id,
        name: "Tahfidz A",
        min_age: 7,
        max_age: 10,
        status: "active",
        image: "class-tahfidz-a.jpg",
        started_at: new Date("2025-02-01"),
        ended_at: new Date("2025-04-30"),
      },
    }),
    prisma.classes.create({
      data: {
        program_id: calistung.program_id,
        mentor_id: mentorAisyah.mentor_id,
        name: "Calistung B",
        min_age: 5,
        max_age: 7,
        status: "active",
        image: "class-calistung-b.jpg",
        started_at: new Date("2025-03-01"),
        ended_at: new Date("2025-05-31"),
      },
    }),
  ])

  // ======================
  // SCHEDULES (FIXED ✅)
  // ======================
  await prisma.schedules.createMany({
    data: [
      // Tahfidz A → Mon & Wed
      {
        class_id: classA.class_id,
        day_of_week: 1,
        start_time: "16:00",
        end_time: "17:00",
      },
      {
        class_id: classA.class_id,
        day_of_week: 3,
        start_time: "16:00",
        end_time: "17:00",
      },

      // Calistung B → Tue & Thu
      {
        class_id: classB.class_id,
        day_of_week: 2,
        start_time: "15:30",
        end_time: "16:30",
      },
      {
        class_id: classB.class_id,
        day_of_week: 4,
        start_time: "15:30",
        end_time: "16:30",
      },
    ],
  })

  // ======================
  // STUDENTS
  // ======================
  const [ali, fatimah] = await Promise.all([
    prisma.students.create({
      data: {
        student_name: "Ali",
        student_age: 8,
        parent_name: "Bapak Ali",
        whatsapp: "08129876543",
      },
    }),
    prisma.students.create({
      data: {
        student_name: "Fatimah",
        student_age: 6,
        parent_name: "Ibu Fatimah",
        whatsapp: "08127778899",
      },
    }),
  ])

  // ======================
  // ENROLLMENTS
  // ======================
  await prisma.enrollments.createMany({
    data: [
      {
        student_id: ali.student_id,
        class_id: classA.class_id,
        status: "active",
        register_at: new Date(),
        confirmed_at: new Date(),
      },
      {
        student_id: fatimah.student_id,
        class_id: classB.class_id,
        status: "registered",
        register_at: new Date(),
      },
    ],
  })

  // ======================
  // DONATIONS
  // ======================
  const donation = await prisma.donation.create({
    data: {
      title: "Donasi Renovasi Masjid",
      description: "Penggalangan dana renovasi masjid",
      status: "open",
      target_amount: 10_000_000,
      collected_amount: 2_500_000,
      percent: 25,
      google_form_url: "https://forms.gle/example",
      image: "/donation.jpg",
      jumlah_donatur: 12,
      start_date: new Date("2025-01-01"),
      end_date: new Date("2025-03-01"),
    },
  })

  // ======================
  // DONATION ALLOCATIONS
  // ======================
  await prisma.donationAllocation.createMany({
    data: [
      {
        donation_id: donation.donation_id,
        title: "Material Bangunan",
        amount: 1_500_000,
        percent: 60,
      },
      {
        donation_id: donation.donation_id,
        title: "Upah Tukang",
        amount: 1_000_000,
        percent: 40,
      },
    ],
  })

  console.log("✅ Seeding finished successfully")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
