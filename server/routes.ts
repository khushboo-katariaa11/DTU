import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertCourseSchema, insertEnrollmentSchema, insertMaterialSchema, insertReviewSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Check if user is authenticated middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).send("Unauthorized");
  };

  // Check if user has specific role
  const hasRole = (role: string) => (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    }
    res.status(403).send("Forbidden");
  };

  // Course routes
  app.get("/api/courses", async (req, res, next) => {
    try {
      const category = req.query.category as string | undefined;
      const difficulty = req.query.difficulty as string | undefined;
      
      const courses = await storage.getCourses(category, difficulty);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/courses/:id", async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).send("Course not found");
      }
      
      res.json(course);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/courses", isAuthenticated, hasRole("teacher"), async (req, res, next) => {
    try {
      const courseData = insertCourseSchema.parse({
        ...req.body,
        teacherId: req.user!.id
      });
      
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/courses/:id", isAuthenticated, hasRole("teacher"), async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).send("Course not found");
      }
      
      if (course.teacherId !== req.user!.id) {
        return res.status(403).send("You don't have permission to update this course");
      }
      
      const updatedCourse = await storage.updateCourse(courseId, req.body);
      res.json(updatedCourse);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/courses/:id", isAuthenticated, async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).send("Course not found");
      }
      
      // Only teacher who created the course or admin can delete
      if (req.user!.role !== "admin" && course.teacherId !== req.user!.id) {
        return res.status(403).send("You don't have permission to delete this course");
      }
      
      await storage.deleteCourse(courseId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Material routes
  app.get("/api/courses/:id/materials", async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.id);
      const materials = await storage.getMaterialsByCourse(courseId);
      res.json(materials);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/courses/:id/materials", isAuthenticated, hasRole("teacher"), async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).send("Course not found");
      }
      
      if (course.teacherId !== req.user!.id) {
        return res.status(403).send("You don't have permission to add materials to this course");
      }
      
      const materialData = insertMaterialSchema.parse({
        ...req.body,
        courseId
      });
      
      const material = await storage.createMaterial(materialData);
      res.status(201).json(material);
    } catch (error) {
      next(error);
    }
  });

  // Enrollment routes
  app.post("/api/enroll", isAuthenticated, async (req, res, next) => {
    try {
      const enrollmentData = insertEnrollmentSchema.parse({
        userId: req.user!.id,
        courseId: req.body.courseId
      });
      
      // Check if already enrolled
      const existingEnrollment = await storage.getEnrollment(req.user!.id, req.body.courseId);
      if (existingEnrollment) {
        return res.status(400).send("Already enrolled in this course");
      }
      
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.status(201).json(enrollment);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/enrollments", isAuthenticated, async (req, res, next) => {
    try {
      const enrollments = await storage.getEnrollmentsByUser(req.user!.id);
      res.json(enrollments);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/enrollments/:courseId/progress", isAuthenticated, async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const progress = parseInt(req.body.progress);
      
      if (isNaN(progress) || progress < 0 || progress > 100) {
        return res.status(400).send("Invalid progress value");
      }
      
      const enrollment = await storage.getEnrollment(req.user!.id, courseId);
      if (!enrollment) {
        return res.status(404).send("Enrollment not found");
      }
      
      const updatedEnrollment = await storage.updateEnrollmentProgress(
        req.user!.id, 
        courseId, 
        progress,
        progress === 100 // Mark as completed if progress is 100%
      );
      
      // If course is completed, generate certificate
      if (progress === 100 && !enrollment.certificateId) {
        const course = await storage.getCourse(courseId);
        const certificateId = randomUUID();
        
        await storage.createCertificate({
          id: certificateId,
          userId: req.user!.id,
          courseId: courseId,
          templateData: {
            studentName: req.user!.fullName,
            courseName: course!.title,
            completionDate: new Date().toISOString(),
            teacherName: "Course Instructor" // This should be improved to get the actual teacher name
          }
        });
        
        // Update enrollment with certificate ID
        await storage.assignCertificateToEnrollment(req.user!.id, courseId, certificateId);
      }
      
      res.json(updatedEnrollment);
    } catch (error) {
      next(error);
    }
  });

  // Review routes
  app.post("/api/courses/:id/reviews", isAuthenticated, async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.id);
      
      // Check if user is enrolled and completed the course
      const enrollment = await storage.getEnrollment(req.user!.id, courseId);
      if (!enrollment || !enrollment.completed) {
        return res.status(403).send("You must complete the course before leaving a review");
      }
      
      const reviewData = insertReviewSchema.parse({
        userId: req.user!.id,
        courseId,
        rating: req.body.rating,
        comment: req.body.comment
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/courses/:id/reviews", async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByCourse(courseId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  });

  // Certificate routes
  app.get("/api/certificates", isAuthenticated, async (req, res, next) => {
    try {
      const certificates = await storage.getCertificatesByUser(req.user!.id);
      res.json(certificates);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/certificates/:id", isAuthenticated, async (req, res, next) => {
    try {
      const certificateId = req.params.id;
      const certificate = await storage.getCertificate(certificateId);
      
      if (!certificate) {
        return res.status(404).send("Certificate not found");
      }
      
      // If not admin or teacher, verify ownership
      if (req.user!.role === "student" && certificate.userId !== req.user!.id) {
        return res.status(403).send("You don't have permission to view this certificate");
      }
      
      res.json(certificate);
    } catch (error) {
      next(error);
    }
  });

  // Admin-specific routes
  app.get("/api/admin/users", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/users/:id/role", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      const role = req.body.role;
      
      if (!role || !["student", "teacher", "admin"].includes(role)) {
        return res.status(400).send("Invalid role");
      }
      
      const updatedUser = await storage.updateUserRole(userId, role);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  // Analytics routes
  app.get("/api/admin/analytics", isAuthenticated, hasRole("admin"), async (req, res, next) => {
    try {
      const userCount = await storage.getUserCount();
      const courseCount = await storage.getCourseCount();
      const enrollmentCount = await storage.getEnrollmentCount();
      
      res.json({
        userCount,
        courseCount,
        enrollmentCount
      });
    } catch (error) {
      next(error);
    }
  });

  // Teacher-specific routes
  app.get("/api/teacher/courses", isAuthenticated, hasRole("teacher"), async (req, res, next) => {
    try {
      const courses = await storage.getCoursesByTeacher(req.user!.id);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/teacher/courses/:id/enrollments", isAuthenticated, hasRole("teacher"), async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).send("Course not found");
      }
      
      if (course.teacherId !== req.user!.id) {
        return res.status(403).send("You don't have permission to view enrollments for this course");
      }
      
      const enrollments = await storage.getEnrollmentsByCourse(courseId);
      res.json(enrollments);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
