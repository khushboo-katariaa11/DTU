import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Enrollment, Course, Certificate } from "@shared/schema";
import { Loader2, GraduationCap, BookOpen, Award, Download } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("my-courses");
  
  // Fetch enrollments
  const { 
    data: enrollments = [], 
    isLoading: enrollmentsLoading
  } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments"],
  });
  
  // Fetch courses to get details for the enrollments
  const {
    data: courses = [],
    isLoading: coursesLoading
  } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
  
  // Fetch certificates
  const {
    data: certificates = [],
    isLoading: certificatesLoading
  } = useQuery<Certificate[]>({
    queryKey: ["/api/certificates"],
  });
  
  // Combine enrollment data with course details
  const enrolledCourses = enrollments.map(enrollment => {
    const course = courses.find(c => c.id === enrollment.courseId);
    return { enrollment, course };
  }).filter(({ course }) => course !== undefined);
  
  // Calculate overall progress
  const totalCourses = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter(({ enrollment }) => enrollment.completed).length;
  const overallProgressPercentage = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;
  
  // Separate active and completed courses
  const activeCourses = enrolledCourses.filter(({ enrollment }) => !enrollment.completed);
  const completedCoursesData = enrolledCourses.filter(({ enrollment }) => enrollment.completed);
  
  const isLoading = enrollmentsLoading || coursesLoading || certificatesLoading;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div id="main-content" className="container py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.fullName || user?.username}</p>
        </div>
        <Button asChild>
          <Link href="/courses">Browse More Courses</Link>
        </Button>
      </div>
      
      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Enrolled Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {activeCourses.length} active, {completedCoursesData.length} completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Progress
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(overallProgressPercentage)}%</div>
            <Progress value={overallProgressPercentage} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Certificates Earned
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.length}</div>
            {certificates.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Last earned on {new Date(certificates[0].issueDate).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for Courses and Certificates */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:w-auto w-full mb-8">
          <TabsTrigger value="my-courses">My Courses</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>
        
        {/* My Courses Tab */}
        <TabsContent value="my-courses">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Courses</h2>
            
            {activeCourses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    You are not enrolled in any courses yet.
                  </p>
                  <Button asChild>
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCourses.map(({ course, enrollment }) => (
                  <Card key={enrollment.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      <img 
                        src={course!.thumbnail || `https://placehold.co/800x400/4F46E5/FFFFFF?text=${encodeURIComponent(course!.title)}`} 
                        alt={course!.title} 
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <h3 className="text-white font-medium truncate">{course!.title}</h3>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span>Progress: {enrollment.progress}%</span>
                        <span>{enrollment.progress}/100</span>
                      </div>
                      <Progress value={enrollment.progress} className="mb-4" />
                      <Button asChild className="w-full">
                        <Link href={`/courses/${course!.id}`}>Continue Learning</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Completed Courses Tab */}
        <TabsContent value="completed">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Completed Courses</h2>
            
            {completedCoursesData.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    You haven't completed any courses yet.
                  </p>
                  <Button asChild>
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCoursesData.map(({ course, enrollment }) => (
                  <Card key={enrollment.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      <img 
                        src={course!.thumbnail || `https://placehold.co/800x400/4F46E5/FFFFFF?text=${encodeURIComponent(course!.title)}`} 
                        alt={course!.title} 
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <h3 className="text-white font-medium truncate">{course!.title}</h3>
                      </div>
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md">
                        Completed
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span>Completed on</span>
                        <span>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</span>
                      </div>
                      <Progress value={100} className="mb-4" />
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" asChild>
                          <Link href={`/courses/${course!.id}`}>Review Course</Link>
                        </Button>
                        {enrollment.certificateId && (
                          <Button className="flex-1">View Certificate</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Certificates Tab */}
        <TabsContent value="certificates">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Certificates</h2>
            
            {certificates.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Award className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    You haven't earned any certificates yet.
                  </p>
                  <Button asChild>
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map(certificate => {
                  const course = courses.find(c => c.id === certificate.courseId);
                  return (
                    <Card key={certificate.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle>{course?.title || 'Course'} Certificate</CardTitle>
                        <CardDescription>
                          Issued on {new Date(certificate.issueDate).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="border border-muted rounded-lg p-4 bg-muted/40 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Award className="h-24 w-24 text-primary/20" />
                          </div>
                          <div className="relative text-center space-y-3 py-4">
                            <h3 className="text-lg font-semibold">Certificate of Completion</h3>
                            <p>This is to certify that</p>
                            <p className="text-xl font-bold">{certificate.templateData.studentName}</p>
                            <p>has successfully completed the course</p>
                            <p className="text-lg font-semibold">{certificate.templateData.courseName}</p>
                            <p className="text-sm">on {new Date(certificate.templateData.completionDate).toLocaleDateString()}</p>
                            <div className="pt-2">
                              <p className="text-sm font-medium">{certificate.templateData.teacherName}</p>
                              <p className="text-xs text-muted-foreground">Instructor</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardContent className="pt-0 flex gap-2">
                        <Button variant="outline" className="flex-1">
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Share
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
