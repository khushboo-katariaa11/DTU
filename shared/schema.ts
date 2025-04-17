import { pgTable, text, serial, integer, boolean, json, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("student"),
  createdAt: timestamp("created_at").defaultNow(),
  accessibilitySettings: json("accessibility_settings").$type<AccessibilitySettings>(),
});

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail"),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  price: integer("price").notNull(),
  teacherId: integer("teacher_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enrollments table
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  certificateId: text("certificate_id"),
});

// Materials table
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  type: text("type").notNull(), // video, pdf, assignment, quiz
  content: text("content").notNull(), // URL for videos, base64 for PDFs, or JSON for assignments/quizzes
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Certificates table
export const certificates = pgTable("certificates", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  issueDate: timestamp("issue_date").defaultNow(),
  templateData: json("template_data").$type<CertificateTemplateData>(),
});

// Types
export type AccessibilitySettings = {
  theme?: "light" | "dark" | "high-contrast" | "color-blind"; 
  fontFamily?: "standard" | "dyslexic";
  fontSize?: "normal" | "large" | "larger";
  enableTTS?: boolean;
};

export type CertificateTemplateData = {
  studentName: string;
  courseName: string;
  completionDate: string;
  teacherName: string;
  teacherSignature?: string;
};

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrollmentDate: true,
  progress: true,
  completed: true,
  certificateId: true,
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  issueDate: true,
});

// Types for CRUD operations
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;

// Extended validation schemas for client use
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginData = z.infer<typeof loginSchema>;
