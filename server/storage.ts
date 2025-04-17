import { 
  users, User, InsertUser, 
  courses, Course, InsertCourse,
  enrollments, Enrollment, InsertEnrollment,
  materials, Material, InsertMaterial,
  reviews, Review, InsertReview,
  certificates, Certificate, InsertCertificate,
  AccessibilitySettings
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: number, role: string): Promise<User>;
  updateUserAccessibilitySettings(userId: number, settings: AccessibilitySettings): Promise<User>;
  getUserCount(): Promise<number>;
  
  // Course operations
  getCourse(id: number): Promise<Course | undefined>;
  getCourses(category?: string, difficulty?: string): Promise<Course[]>;
  getCoursesByTeacher(teacherId: number): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, courseData: Partial<Course>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;
  getCourseCount(): Promise<number>;
  
  // Enrollment operations
  getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined>;
  getEnrollmentsByUser(userId: number): Promise<Enrollment[]>;
  getEnrollmentsByCourse(courseId: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollmentProgress(userId: number, courseId: number, progress: number, completed: boolean): Promise<Enrollment>;
  assignCertificateToEnrollment(userId: number, courseId: number, certificateId: string): Promise<Enrollment>;
  getEnrollmentCount(): Promise<number>;
  
  // Material operations
  getMaterial(id: number): Promise<Material | undefined>;
  getMaterialsByCourse(courseId: number): Promise<Material[]>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  
  // Review operations
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByCourse(courseId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Certificate operations
  getCertificate(id: string): Promise<Certificate | undefined>;
  getCertificatesByUser(userId: number): Promise<Certificate[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private coursesData: Map<number, Course>;
  private enrollmentsData: Map<string, Enrollment>;
  private materialsData: Map<number, Material>;
  private reviewsData: Map<number, Review>;
  private certificatesData: Map<string, Certificate>;
  
  userCurrentId: number;
  courseCurrentId: number;
  enrollmentCurrentId: number;
  materialCurrentId: number;
  reviewCurrentId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.usersData = new Map();
    this.coursesData = new Map();
    this.enrollmentsData = new Map();
    this.materialsData = new Map();
    this.reviewsData = new Map();
    this.certificatesData = new Map();
    
    this.userCurrentId = 1;
    this.courseCurrentId = 1;
    this.enrollmentCurrentId = 1;
    this.materialCurrentId = 1;
    this.reviewCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize with sample data
    this.initializeSampleData();
  }
  
  private async initializeSampleData() {
    try {
      // Generate a password hash
      const passwordHash = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8.f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2";
      console.log("Using password hash:", passwordHash);
      
      // Create default admin user
      const adminUser = await this.createUser({
        username: "admin",
        email: "admin@example.com",
        password: passwordHash, // "password"
        fullName: "Admin User",
        role: "admin",
        accessibilitySettings: {
          theme: "light",
          fontFamily: "standard",
          fontSize: "normal",
          enableTTS: false
        }
      });
      
      // Create a teacher
      const teacherUser = await this.createUser({
        username: "teacher",
        email: "teacher@example.com",
        password: passwordHash, // "password"
        fullName: "Dr. Alex Johnson",
        role: "teacher",
        accessibilitySettings: {
          theme: "light",
          fontFamily: "standard",
          fontSize: "normal",
          enableTTS: false
        }
      });
      
      // Create courses
      const courses = [
        {
          title: "Web Accessibility Fundamentals",
          description: "Learn the fundamentals of web accessibility and how to make your websites usable by everyone.",
          thumbnail: "https://placehold.co/800x400/4F46E5/FFFFFF?text=Web+Accessibility",
          price: 9900, // $99.00
          category: "Web Development",
          difficulty: "beginner",
          teacherId: teacherUser.id
        },
        {
          title: "Advanced ARIA Techniques",
          description: "Master advanced ARIA patterns and techniques to create complex accessible interfaces.",
          thumbnail: "https://placehold.co/800x400/4F46E5/FFFFFF?text=Advanced+ARIA",
          price: 12900, // $129.00
          category: "Web Development",
          difficulty: "advanced",
          teacherId: teacherUser.id
        },
        {
          title: "Mobile Accessibility",
          description: "Learn how to make mobile applications accessible to users with disabilities.",
          thumbnail: "https://placehold.co/800x400/4F46E5/FFFFFF?text=Mobile+Accessibility",
          price: 8900, // $89.00
          category: "Mobile Development",
          difficulty: "intermediate",
          teacherId: teacherUser.id
        },
        {
          title: "Inclusive Design Principles",
          description: "Design products that work for everyone by applying inclusive design principles.",
          thumbnail: "https://placehold.co/800x400/4F46E5/FFFFFF?text=Inclusive+Design",
          price: 7900, // $79.00
          category: "Design",
          difficulty: "beginner",
          teacherId: teacherUser.id
        }
      ];
      
      // Add courses
      for (const courseData of courses) {
        const course = await this.createCourse(courseData);
        
        // Add sample materials to each course
        await this.createMaterial({
          title: "Course Introduction",
          content: "Introduction to the course and its objectives.",
          type: "video",
          courseId: course.id,
          order: 1
        });
        
        await this.createMaterial({
          title: "Core Concepts",
          content: "Understanding the core concepts of the subject.",
          type: "text",
          courseId: course.id,
          order: 2
        });
        
        await this.createMaterial({
          title: "Practical Examples",
          content: "Real-world examples and practical applications.",
          type: "text",
          courseId: course.id,
          order: 3
        });
      }
      
      // Create a student
      const studentUser = await this.createUser({
        username: "student",
        email: "student@example.com",
        password: passwordHash, // "password"
        fullName: "Student User",
        role: "student",
        accessibilitySettings: {
          theme: "light",
          fontFamily: "standard",
          fontSize: "normal",
          enableTTS: false
        }
      });
      
      // Enroll student in a course
      const enrollment = await this.createEnrollment({
        userId: studentUser.id,
        courseId: 1, // First course
        progress: 30,
        completed: false
      });
      
      // Add a review
      await this.createReview({
        userId: studentUser.id,
        courseId: 1,
        rating: 5,
        comment: "Excellent course with clear explanations and practical examples!"
      });
      
      console.log("Sample data initialized successfully");
    } catch (error) {
      console.error("Error initializing sample data:", error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now
    };
    this.usersData.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersData.values());
  }

  async updateUserRole(userId: number, role: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser: User = {
      ...user,
      role
    };
    
    this.usersData.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserAccessibilitySettings(userId: number, settings: AccessibilitySettings): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser: User = {
      ...user,
      accessibilitySettings: {
        ...user.accessibilitySettings,
        ...settings
      }
    };
    
    this.usersData.set(userId, updatedUser);
    return updatedUser;
  }

  async getUserCount(): Promise<number> {
    return this.usersData.size;
  }

  // Course operations
  async getCourse(id: number): Promise<Course | undefined> {
    return this.coursesData.get(id);
  }

  async getCourses(category?: string, difficulty?: string): Promise<Course[]> {
    let courses = Array.from(this.coursesData.values());
    
    if (category) {
      courses = courses.filter(course => course.category === category);
    }
    
    if (difficulty) {
      courses = courses.filter(course => course.difficulty === difficulty);
    }
    
    return courses;
  }

  async getCoursesByTeacher(teacherId: number): Promise<Course[]> {
    return Array.from(this.coursesData.values()).filter(
      course => course.teacherId === teacherId
    );
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.courseCurrentId++;
    const now = new Date();
    const course: Course = {
      ...insertCourse,
      id,
      createdAt: now
    };
    
    this.coursesData.set(id, course);
    return course;
  }

  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course> {
    const course = await this.getCourse(id);
    if (!course) {
      throw new Error(`Course with ID ${id} not found`);
    }
    
    const updatedCourse: Course = {
      ...course,
      ...courseData,
      id: course.id, // Ensure ID doesn't change
      teacherId: course.teacherId // Ensure teacher ID doesn't change
    };
    
    this.coursesData.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<void> {
    this.coursesData.delete(id);
    
    // Delete related enrollments, materials, reviews
    // This would be handled by cascading deletes in a real database
    for (const [key, enrollment] of this.enrollmentsData.entries()) {
      if (enrollment.courseId === id) {
        this.enrollmentsData.delete(key);
      }
    }
    
    for (const [key, material] of this.materialsData.entries()) {
      if (material.courseId === id) {
        this.materialsData.delete(key);
      }
    }
    
    for (const [key, review] of this.reviewsData.entries()) {
      if (review.courseId === id) {
        this.reviewsData.delete(key);
      }
    }
  }

  async getCourseCount(): Promise<number> {
    return this.coursesData.size;
  }

  // Enrollment operations
  async getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined> {
    const key = `${userId}-${courseId}`;
    return this.enrollmentsData.get(key);
  }

  async getEnrollmentsByUser(userId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollmentsData.values()).filter(
      enrollment => enrollment.userId === userId
    );
  }

  async getEnrollmentsByCourse(courseId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollmentsData.values()).filter(
      enrollment => enrollment.courseId === courseId
    );
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentCurrentId++;
    const key = `${insertEnrollment.userId}-${insertEnrollment.courseId}`;
    const now = new Date();
    
    const enrollment: Enrollment = {
      ...insertEnrollment,
      id,
      enrollmentDate: now,
      progress: 0,
      completed: false,
      certificateId: null
    };
    
    this.enrollmentsData.set(key, enrollment);
    return enrollment;
  }

  async updateEnrollmentProgress(userId: number, courseId: number, progress: number, completed: boolean): Promise<Enrollment> {
    const key = `${userId}-${courseId}`;
    const enrollment = this.enrollmentsData.get(key);
    
    if (!enrollment) {
      throw new Error(`Enrollment for user ${userId} in course ${courseId} not found`);
    }
    
    const updatedEnrollment: Enrollment = {
      ...enrollment,
      progress,
      completed
    };
    
    this.enrollmentsData.set(key, updatedEnrollment);
    return updatedEnrollment;
  }

  async assignCertificateToEnrollment(userId: number, courseId: number, certificateId: string): Promise<Enrollment> {
    const key = `${userId}-${courseId}`;
    const enrollment = this.enrollmentsData.get(key);
    
    if (!enrollment) {
      throw new Error(`Enrollment for user ${userId} in course ${courseId} not found`);
    }
    
    const updatedEnrollment: Enrollment = {
      ...enrollment,
      certificateId
    };
    
    this.enrollmentsData.set(key, updatedEnrollment);
    return updatedEnrollment;
  }

  async getEnrollmentCount(): Promise<number> {
    return this.enrollmentsData.size;
  }

  // Material operations
  async getMaterial(id: number): Promise<Material | undefined> {
    return this.materialsData.get(id);
  }

  async getMaterialsByCourse(courseId: number): Promise<Material[]> {
    return Array.from(this.materialsData.values())
      .filter(material => material.courseId === courseId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const id = this.materialCurrentId++;
    const now = new Date();
    
    // Handle both field names (order and orderIndex)
    const orderIndex = (insertMaterial as any).order || 0;
    
    const material: Material = {
      ...insertMaterial,
      id,
      createdAt: now,
      orderIndex
    };
    
    this.materialsData.set(id, material);
    return material;
  }

  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviewsData.get(id);
  }

  async getReviewsByCourse(courseId: number): Promise<Review[]> {
    return Array.from(this.reviewsData.values()).filter(
      review => review.courseId === courseId
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewCurrentId++;
    const now = new Date();
    
    const review: Review = {
      ...insertReview,
      id,
      createdAt: now
    };
    
    this.reviewsData.set(id, review);
    return review;
  }

  // Certificate operations
  async getCertificate(id: string): Promise<Certificate | undefined> {
    return this.certificatesData.get(id);
  }

  async getCertificatesByUser(userId: number): Promise<Certificate[]> {
    return Array.from(this.certificatesData.values()).filter(
      certificate => certificate.userId === userId
    );
  }

  async createCertificate(certificate: InsertCertificate): Promise<Certificate> {
    const now = new Date();
    
    const newCertificate: Certificate = {
      ...certificate,
      issueDate: now
    };
    
    this.certificatesData.set(certificate.id, newCertificate);
    return newCertificate;
  }
}

export const storage = new MemStorage();
