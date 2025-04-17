import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Course, Material, Enrollment, Review } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Clock, BarChart, Users, Video, FileText, Heart } from "lucide-react";
import TestimonialCard from "@/components/testimonial/TestimonialCard";
import StudyMaterialCard, { StudySection } from "@/components/study/StudyMaterialCard";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const { speak } = useTextToSpeech();
  
  // Sample study materials (in a real app, these would come from the server)
  const [studyMaterials, setStudyMaterials] = useState<{
    [moduleId: string]: StudySection[];
  }>({
    "module1": [
      {
        id: "1.1",
        title: "Introduction to Web Accessibility",
        content: "Web accessibility means that websites, tools, and technologies are designed and developed so that people with disabilities can use them. More specifically, people can perceive, understand, navigate, and interact with the Web, and contribute to the Web.",
        type: "text",
        estimatedTime: 10,
        isCompleted: false
      },
      {
        id: "1.2",
        title: "Understanding Different Types of Disabilities",
        content: "There are various types of disabilities: visual (blindness, low vision, color blindness), auditory (deafness, hard-of-hearing), motor (inability to use a mouse, slow response time), cognitive (learning disabilities, distractibility, inability to remember).",
        type: "text",
        estimatedTime: 15,
        isCompleted: false
      },
      {
        id: "1.3",
        title: "WCAG Guidelines Overview",
        content: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        type: "video",
        estimatedTime: 20,
        isCompleted: false
      }
    ],
    "module2": [
      {
        id: "2.1",
        title: "Semantic HTML",
        content: "Semantic HTML elements clearly describe their meaning in a human and machine-readable way. Elements such as <header>, <footer>, <article>, and <section> are all semantic elements that provide context about their content to both the browser and the developer.",
        type: "text",
        estimatedTime: 15,
        isCompleted: false
      },
      {
        id: "2.2",
        title: "ARIA Attributes and Roles",
        content: "ARIA (Accessible Rich Internet Applications) is a set of attributes that define ways to make web content and web applications more accessible to people with disabilities. These attributes supplement HTML so that interactions and widgets commonly used in applications can be passed to assistive technologies.",
        type: "text",
        estimatedTime: 20,
        isCompleted: false
      },
      {
        id: "2.3",
        title: "Keyboard Navigation",
        content: "Keyboard navigation is the ability to use a website with just a keyboard, without using a mouse. This is essential for users who cannot use a mouse, including many users with motor disabilities, as well as users who use alternative input devices such as speech-to-text software.",
        type: "text",
        estimatedTime: 15,
        isCompleted: false
      }
    ],
    "module3": [
      {
        id: "3.1",
        title: "Color Contrast and Readability",
        content: "Ensuring sufficient color contrast between text and its background is crucial for users with low vision or color blindness. The WCAG 2.1 guidelines recommend a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.",
        type: "text",
        estimatedTime: 10,
        isCompleted: false
      },
      {
        id: "3.2",
        title: "Screen Readers and Assistive Technologies",
        content: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        type: "video",
        estimatedTime: 25,
        isCompleted: false
      }
    ]
  });
  
  // Function to mark a section as completed
  const handleCompleteMaterial = (sectionId: string) => {
    setStudyMaterials(prev => {
      const newMaterials = { ...prev };
      
      Object.keys(newMaterials).forEach(moduleId => {
        newMaterials[moduleId] = newMaterials[moduleId].map(section => {
          if (section.id === sectionId) {
            return { ...section, isCompleted: true };
          }
          return section;
        });
      });
      
      return newMaterials;
    });
    
    toast({
      title: "Progress Updated",
      description: "Section marked as completed",
    });
  };
  
  // Fetch course details
  const { 
    data: course, 
    isLoading: courseLoading, 
    error: courseError
  } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !isNaN(courseId)
  });
  
  // Fetch materials
  const {
    data: materials = [],
    isLoading: materialsLoading
  } = useQuery<Material[]>({
    queryKey: [`/api/courses/${courseId}/materials`],
    enabled: !isNaN(courseId)
  });
  
  // Fetch reviews
  const {
    data: reviews = [],
    isLoading: reviewsLoading
  } = useQuery<Review[]>({
    queryKey: [`/api/courses/${courseId}/reviews`],
    enabled: !isNaN(courseId)
  });
  
  // Fetch user's enrollment if logged in
  const {
    data: enrollment,
    isLoading: enrollmentLoading
  } = useQuery<Enrollment>({
    queryKey: [`/api/enrollments/${courseId}`],
    queryFn: async () => {
      const res = await fetch(`/api/enrollments`);
      if (!res.ok) throw new Error("Failed to fetch enrollments");
      const enrollments = await res.json();
      return enrollments.find((e: Enrollment) => e.courseId === courseId);
    },
    enabled: !!user && !isNaN(courseId)
  });
  
  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/enroll", { courseId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/enrollments/${courseId}`] });
      toast({
        title: "Enrollment successful",
        description: "You are now enrolled in this course",
      });
    },
    onError: (error) => {
      toast({
        title: "Enrollment failed",
        description: error.message || "There was an error enrolling in the course",
        variant: "destructive",
      });
    }
  });
  
  // Handle enrollment
  const handleEnroll = () => {
    if (!user) {
      // Redirect to login page if not logged in
      navigate("/auth?redirect=/courses/" + courseId);
      return;
    }
    
    enrollMutation.mutate();
  };
  
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  
  if (courseLoading || isNaN(courseId)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!course || courseError) {
    return (
      <div className="container py-16 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The course you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/courses")}>
          Browse All Courses
        </Button>
      </div>
    );
  }
  
  return (
    <div id="main-content" className="container py-12 px-4 sm:px-6 lg:px-8">
      {/* Course Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge>{course.category}</Badge>
            <Badge variant="outline" className="capitalize">{course.difficulty}</Badge>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold">{course.title}</h1>
          
          <p className="text-lg text-muted-foreground">{course.description}</p>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star}
                    className={`h-5 w-5 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-muted-foreground">
                {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            
            <div className="flex items-center">
              <Users className="h-5 w-5 text-muted-foreground mr-1" />
              <span className="text-muted-foreground">
                125 students enrolled
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={`https://randomuser.me/api/portraits/men/${course.teacherId}.jpg`} alt="Teacher" />
              <AvatarFallback>T</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Instructor</p>
              <p>Dr. Alex Johnson</p>
            </div>
          </div>
        </div>
        
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-6">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img 
                  src={course.thumbnail || `https://placehold.co/800x400/4F46E5/FFFFFF?text=${encodeURIComponent(course.title)}`} 
                  alt={course.title} 
                  className="object-cover w-full h-full"
                />
                {enrollment && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Button variant="outline" className="text-white border-white hover:bg-white/20">
                      Continue Learning
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="text-3xl font-bold">${(course.price / 100).toFixed(2)}</div>
              
              {enrollment ? (
                <div className="space-y-3">
                  <p className="font-medium">Your progress</p>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{enrollment.progress}% complete</span>
                    <span>{enrollment.progress}/100</span>
                  </div>
                  <Progress value={enrollment.progress} />
                  
                  <Button className="w-full" size="lg">
                    {enrollment.completed ? 'View Certificate' : 'Continue Learning'}
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    'Enroll Now'
                  )}
                </Button>
              )}
              
              <div className="space-y-3 pt-3">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>8 weeks, 3-5 hours/week</span>
                </div>
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Difficulty: {course.difficulty}</span>
                </div>
                <div className="flex items-center">
                  <Video className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>24 video lessons</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>12 downloadable resources</span>
                </div>
                <div className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Full lifetime access</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Course Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid grid-cols-3 mb-8 w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                <div className="prose max-w-none dark:prose-invert">
                  <p>
                    {course.description}
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Maecenas vel velit vel eros tincidunt tempus. Sed varius metus id ex dignissim, eget fringilla dui efficitur. Proin tincidunt magna ac felis venenatis, vel efficitur libero fermentum.
                  </p>
                  <h3>What you'll learn</h3>
                  <ul>
                    <li>Build fully accessible web applications</li>
                    <li>Understand WCAG standards and compliance</li>
                    <li>Implement keyboard navigation and screen reader support</li>
                    <li>Create inclusive designs for users with various disabilities</li>
                    <li>Test applications for accessibility issues</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-4">Prerequisites</h2>
                <div className="prose max-w-none dark:prose-invert">
                  <ul>
                    <li>Basic knowledge of HTML, CSS, and JavaScript</li>
                    <li>Understanding of web development principles</li>
                    <li>No prior accessibility knowledge required</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-4">Course Roadmap</h2>
                <div className="relative border-l-2 border-muted pl-6 ml-3 space-y-6">
                  {/* Roadmap items */}
                  <div className="relative">
                    <div className="absolute -left-[1.81rem] top-1 h-4 w-4 rounded-full bg-primary"></div>
                    <h3 className="text-lg font-medium">Week 1-2: Foundations</h3>
                    <p className="text-muted-foreground">Introduction to accessibility, WCAG principles, and basic techniques</p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-[1.81rem] top-1 h-4 w-4 rounded-full bg-primary"></div>
                    <h3 className="text-lg font-medium">Week 3-4: Implementation</h3>
                    <p className="text-muted-foreground">Implementing accessible navigation, forms, and media elements</p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-[1.81rem] top-1 h-4 w-4 rounded-full bg-primary"></div>
                    <h3 className="text-lg font-medium">Week 5-6: Advanced Techniques</h3>
                    <p className="text-muted-foreground">Complex UI components, ARIA, and advanced accessibility patterns</p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-[1.81rem] top-1 h-4 w-4 rounded-full bg-primary"></div>
                    <h3 className="text-lg font-medium">Week 7-8: Testing and Deployment</h3>
                    <p className="text-muted-foreground">Accessibility auditing, user testing, and continuous improvement</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-4">Featured Reviews</h2>
              <div className="space-y-4">
                {reviews.slice(0, 3).map(review => (
                  <TestimonialCard
                    key={review.id}
                    name="Student Name" // In a real app, you'd fetch the user details
                    text={review.comment || "Great course!"}
                    rating={review.rating}
                  />
                ))}
                {reviews.length === 0 && (
                  <div className="text-center p-6 bg-muted/30 rounded-lg">
                    <p>No reviews yet. Be the first to review this course!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Curriculum Tab */}
        <TabsContent value="curriculum">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>
              <p className="text-muted-foreground mb-8">
                {Object.values(studyMaterials).flat().length} lessons • 8 weeks • 24 hours of content
              </p>
              
              {materialsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : Object.keys(studyMaterials).length === 0 ? (
                <div className="text-center p-8 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">No materials available yet.</p>
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Module 1: Introduction to Accessibility */}
                  <div>
                    <h3 className="text-2xl font-medium mb-4">Module 1: Introduction to Accessibility</h3>
                    <StudyMaterialCard
                      title="Web Accessibility Fundamentals"
                      description="Learn the basics of web accessibility and why it matters for all users."
                      difficulty="beginner"
                      sections={studyMaterials.module1}
                      onComplete={handleCompleteMaterial}
                      onTextToSpeech={speak}
                    />
                  </div>
                  
                  {/* Module 2: Implementation Techniques */}
                  <div>
                    <h3 className="text-2xl font-medium mb-4">Module 2: Implementation Techniques</h3>
                    <StudyMaterialCard
                      title="Accessibility Implementation"
                      description="Learn practical techniques for building accessible web interfaces."
                      difficulty="intermediate"
                      sections={studyMaterials.module2}
                      onComplete={handleCompleteMaterial}
                      onTextToSpeech={speak}
                    />
                  </div>
                  
                  {/* Module 3: Advanced Accessibility */}
                  <div>
                    <h3 className="text-2xl font-medium mb-4">Module 3: Advanced Accessibility</h3>
                    <StudyMaterialCard
                      title="Advanced Accessibility Techniques"
                      description="Mastering complex accessibility patterns and testing methods."
                      difficulty="advanced"
                      sections={studyMaterials.module3}
                      onComplete={handleCompleteMaterial}
                      onTextToSpeech={speak}
                    />
                  </div>
                  
                  {/* Traditional materials display as fallback */}
                  {materials.length > 0 && (
                    <div className="mt-12 pt-8 border-t">
                      <h3 className="text-xl font-medium mb-6">Additional Course Materials</h3>
                      <Card>
                        <CardContent className="p-0">
                          <div className="divide-y">
                            {materials.map((material, idx) => (
                              <div key={material.id} className="flex items-center justify-between p-4">
                                <div className="flex items-center space-x-3">
                                  {material.type === 'video' ? (
                                    <Video className="h-5 w-5 text-primary" />
                                  ) : (
                                    <FileText className="h-5 w-5 text-primary" />
                                  )}
                                  <div>
                                    <p className="font-medium">{material.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {material.type.charAt(0).toUpperCase() + material.type.slice(1)} • 20 min
                                    </p>
                                  </div>
                                </div>
                                {enrollment ? (
                                  <Button variant="ghost" size="sm">
                                    {enrollment.progress > idx * 20 ? 'Review' : 'Start'}
                                  </Button>
                                ) : (
                                  <Badge variant="outline">Preview</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
                
                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center p-8 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground">No reviews yet. Be the first to review this course!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map(review => (
                      <div key={review.id} className="border rounded-lg p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarFallback>{review.userId.toString().charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">Student #{review.userId}</p>
                              <p className="text-sm text-muted-foreground">
                                {typeof review.createdAt === 'string' ? new Date(review.createdAt).toLocaleDateString() : 'Unknown date'}
                              </p>
                            </div>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg 
                                key={star}
                                className={`h-5 w-5 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p>{review.comment || "Great course!"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Rating Breakdown</h3>
                <div className="space-y-3">
                  {/* Generate rating bars */}
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = reviews.filter(r => r.rating === rating).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center">
                        <div className="flex items-center w-10">
                          <span>{rating}</span>
                          <svg 
                            className="h-4 w-4 text-yellow-400 fill-yellow-400 ml-1" 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <div className="w-full ml-4">
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-yellow-400 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-10 text-right text-sm text-muted-foreground">{count}</div>
                      </div>
                    );
                  })}
                </div>
                
                <Separator className="my-6" />
                
                <div className="text-center space-y-4">
                  <div>
                    <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
                    <div className="flex justify-center mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star}
                          className={`h-6 w-6 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>
                  
                  {enrollment?.completed && (
                    <Button className="w-full">
                      Write a Review
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
