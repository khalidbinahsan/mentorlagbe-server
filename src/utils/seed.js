import dotenv from "dotenv";
dotenv.config();

import { connectDB, usersCollection, tuitionsCollection, applicationsCollection } from "../config/db.js";
import { auth } from "../config/auth.js";

const testAccounts = [
  {
    name: "Platform Admin",
    email: "admin@mentorlagbe.com",
    password: "Password123!",
    role: "admin",
    plan: "pro",
    phone: "+8801711000001",
    bio: "Lead platform administrator for MentorLagbe.",
  },
  {
    name: "Tanvir Ahmed",
    email: "tutor@mentorlagbe.com",
    password: "Password123!",
    role: "tutor",
    plan: "pro",
    phone: "+8801711000002",
    bio: "BUET CSE Graduate with 5+ years of experience teaching HSC Physics, Higher Math, and Python Programming.",
  },
  {
    name: "Nusrat Jahan",
    email: "nusrat.tutor@mentorlagbe.com",
    password: "Password123!",
    role: "tutor",
    plan: "free",
    phone: "+8801711000003",
    bio: "DU English Literature alumna & IELTS Band 8.5 scorer specializing in Spoken English and Academic Writing.",
  },
  {
    name: "Rafiqul Islam",
    email: "rafiq.tutor@mentorlagbe.com",
    password: "Password123!",
    role: "tutor",
    plan: "pro",
    phone: "+8801711000004",
    bio: "Medical College final-year student teaching SSC & HSC Biology and Chemistry.",
  },
  {
    name: "Sadia Rahman",
    email: "student@mentorlagbe.com",
    password: "Password123!",
    role: "student",
    plan: "free",
    phone: "+8801711000005",
    bio: "HSC 2nd Year Science student preparing for engineering admission.",
  },
];

const sampleTuitions = [
  {
    title: "HSC Physics 1st & 2nd Paper Complete Batch",
    subject: "Physics",
    classLevel: "HSC",
    mode: "Online",
    location: "Zoom & Google Classroom",
    monthlyFee: 2500,
    daysPerWeek: 3,
    bannerImage: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
    description: "In-depth conceptual classes on Mechanics, Electromagnetism, and Modern Physics with weekly CQ & MCQ model tests.",
    tutorName: "Tanvir Ahmed",
    tutorEmail: "tutor@mentorlagbe.com",
    approvalStatus: "approved",
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
  },
  {
    title: "HSC Higher Mathematics Problem Solving Mentorship",
    subject: "Math",
    classLevel: "HSC",
    mode: "Offline",
    location: "Dhanmondi, Dhaka",
    monthlyFee: 4000,
    daysPerWeek: 3,
    bannerImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    description: "1-on-1 or small group mentorship covering Calculus, Trigonometry, and Vectors with board question bank mastery.",
    tutorName: "Tanvir Ahmed",
    tutorEmail: "tutor@mentorlagbe.com",
    approvalStatus: "approved",
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11),
  },
  {
    title: "Python & Web Programming Bootcamp for Beginners",
    subject: "Programming",
    classLevel: "Undergraduate",
    mode: "Online",
    location: "Live Interactive Session",
    monthlyFee: 3500,
    daysPerWeek: 2,
    bannerImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80",
    description: "Learn Python fundamentals, data structures, and build real-world projects from scratch.",
    tutorName: "Tanvir Ahmed",
    tutorEmail: "tutor@mentorlagbe.com",
    approvalStatus: "approved",
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
  {
    title: "IELTS Academic & General Intensive Prep (Target 7.5+)",
    subject: "IELTS",
    classLevel: "Admission / IELTS",
    mode: "Online",
    location: "Google Meet",
    monthlyFee: 3000,
    daysPerWeek: 3,
    bannerImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    description: "Complete Reading, Writing Task 1 & 2 feedback, Listening drills, and 1-on-1 Speaking mock interviews.",
    tutorName: "Nusrat Jahan",
    tutorEmail: "nusrat.tutor@mentorlagbe.com",
    approvalStatus: "approved",
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
  },
  {
    title: "SSC & HSC English 1st & 2nd Paper Grammar Mastery",
    subject: "English",
    classLevel: "SSC",
    mode: "Offline",
    location: "Uttara, Dhaka",
    monthlyFee: 2800,
    daysPerWeek: 3,
    bannerImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    description: "Build strong grammar foundations, paragraph/essay writing skills, and vocabulary for board exams.",
    tutorName: "Nusrat Jahan",
    tutorEmail: "nusrat.tutor@mentorlagbe.com",
    approvalStatus: "approved",
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
  },
  {
    title: "HSC Organic & Physical Chemistry Special Batch",
    subject: "Chemistry",
    classLevel: "HSC",
    mode: "Online",
    location: "Zoom",
    monthlyFee: 2200,
    daysPerWeek: 3,
    bannerImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
    description: "Master Organic Chemistry reaction mechanisms, Quantitative Chemistry, and Electrochemistry with visual notes.",
    tutorName: "Rafiqul Islam",
    tutorEmail: "rafiq.tutor@mentorlagbe.com",
    approvalStatus: "approved",
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
  {
    title: "HSC Biology & Medical Admission Foundation",
    subject: "Biology",
    classLevel: "HSC",
    mode: "Offline",
    location: "Mirpur, Dhaka",
    monthlyFee: 3200,
    daysPerWeek: 3,
    bannerImage: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80",
    description: "Line-by-line textbook mastery of Botany and Zoology with daily MCQ quizzes modeled on medical admission exams.",
    tutorName: "Rafiqul Islam",
    tutorEmail: "rafiq.tutor@mentorlagbe.com",
    approvalStatus: "approved",
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
  },
  {
    title: "SSC General Math & Higher Math Crash Course",
    subject: "Math",
    classLevel: "SSC",
    mode: "Online",
    location: "Zoom",
    monthlyFee: 1800,
    daysPerWeek: 4,
    bannerImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
    description: "Complete syllabus revision with chapter-wise creative question solving for Class 9 and 10 students.",
    tutorName: "Tanvir Ahmed",
    tutorEmail: "tutor@mentorlagbe.com",
    approvalStatus: "approved",
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  {
    title: "Class 8 All Science & Mathematics 1-on-1 Home Tuition",
    subject: "Math",
    classLevel: "Class 6-8",
    mode: "Offline",
    location: "Gulshan, Dhaka",
    monthlyFee: 4500,
    daysPerWeek: 4,
    bannerImage: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80",
    description: "Personalized home tutoring focusing on conceptual clarity in Mathematics, General Science, and ICT.",
    tutorName: "Tanvir Ahmed",
    tutorEmail: "tutor@mentorlagbe.com",
    approvalStatus: "approved",
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
  },
  {
    title: "JavaScript & React Frontend Mentorship",
    subject: "Programming",
    classLevel: "Undergraduate",
    mode: "Online",
    location: "Discord & Google Meet",
    monthlyFee: 4000,
    daysPerWeek: 2,
    bannerImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    description: "Hands-on mentorship covering ES6+, React Hooks, Next.js fundamentals, and portfolio project reviews.",
    tutorName: "Tanvir Ahmed",
    tutorEmail: "tutor@mentorlagbe.com",
    approvalStatus: "approved",
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    title: "SSC Physics & Chemistry Combined Batch",
    subject: "Physics",
    classLevel: "SSC",
    mode: "Offline",
    location: "Mohammadpur, Dhaka",
    monthlyFee: 2600,
    daysPerWeek: 3,
    bannerImage: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800&q=80",
    description: "Clear explanations of Physics numericals and Chemical equations with bi-weekly progress reports for parents.",
    tutorName: "Rafiqul Islam",
    tutorEmail: "rafiq.tutor@mentorlagbe.com",
    approvalStatus: "approved",
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    title: "HSC ICT (C Programming, HTML & Database) Crash Batch",
    subject: "Programming",
    classLevel: "HSC",
    mode: "Online",
    location: "Zoom",
    monthlyFee: 1500,
    daysPerWeek: 2,
    bannerImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    description: "Guaranteed A+ preparation for HSC ICT covering Number Systems, Digital Devices, HTML, C Programming, and SQL.",
    tutorName: "Tanvir Ahmed",
    tutorEmail: "tutor@mentorlagbe.com",
    approvalStatus: "approved",
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  },
  {
    title: "Engineering Admission Physics Masterclass (Pending Demo)",
    subject: "Physics",
    classLevel: "Admission / IELTS",
    mode: "Online",
    location: "Zoom",
    monthlyFee: 5000,
    daysPerWeek: 4,
    bannerImage: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
    description: "Advanced problem solving for BUET, CKRUET, and IUT admission aspirants.",
    tutorName: "Tanvir Ahmed",
    tutorEmail: "tutor@mentorlagbe.com",
    approvalStatus: "pending",
    isActive: true,
    createdAt: new Date(),
  },
];

async function seedDatabase() {
  try {
    await connectDB();
    console.log("🌱 Seeding MentorLagbe database...");

    // 1. Create Test Accounts via BetterAuth API
    for (const acc of testAccounts) {
      const exists = await usersCollection.findOne({ email: acc.email });
      if (!exists) {
        await auth.api.signUpEmail({
          body: {
            name: acc.name,
            email: acc.email,
            password: acc.password,
          },
        });
      }
      // Ensure role, plan, phone, and bio are updated accurately
      await usersCollection.updateOne(
        { email: acc.email },
        {
          $set: {
            role: acc.role,
            plan: acc.plan,
            phone: acc.phone,
            bio: acc.bio,
          },
        }
      );
    }
    console.log("✅ Test accounts seeded (Admin, Tutors, Student)");

    // 2. Seed Tuitions (Clear old seed tuitions to avoid duplicates)
    await tuitionsCollection.deleteMany({});
    const insertResult = await tuitionsCollection.insertMany(sampleTuitions);
    console.log(`✅ Seeded ${insertResult.insertedCount} tuition listings`);

    // 3. Seed 1 Sample Application for Sadia Rahman
    await applicationsCollection.deleteMany({});
    const firstTuition = await tuitionsCollection.findOne({ approvalStatus: "approved" });
    if (firstTuition) {
      await applicationsCollection.insertOne({
        tuitionId: firstTuition._id.toString(),
        tuitionTitle: firstTuition.title,
        subject: firstTuition.subject,
        monthlyFee: firstTuition.monthlyFee,
        tutorEmail: firstTuition.tutorEmail,
        studentName: "Sadia Rahman",
        studentEmail: "student@mentorlagbe.com",
        studentPhone: "+8801711000005",
        preferredSchedule: "Sat, Mon, Wed - 7:00 PM",
        studentNote: "Looking forward to joining this batch for HSC Physics preparation.",
        status: "pending",
        appliedAt: new Date(),
      });
      console.log("✅ Seeded sample student application");
    }

    console.log("\n🎉 Seeding Complete! Test Credentials:");
    console.log("   Admin:   admin@mentorlagbe.com   | Password123!");
    console.log("   Tutor:   tutor@mentorlagbe.com   | Password123!");
    console.log("   Student: student@mentorlagbe.com | Password123!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();