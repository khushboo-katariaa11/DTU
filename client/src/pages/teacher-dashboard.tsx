import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Course, insertCourseSchema, Material, insertMaterialSchema } from "@shared/schema";
import { Loader2, Users, BookOpen, FileText, PlusCircle, BarChart, Upload, Play } from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("courses");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [newCourseDialogOpen, setNewCourseDialogOpen] = useState(false);
  const [newMaterialDialogOpen, setNewMaterialDialogOpen] = useState(false);
  
  // Fetch teacher's courses
  const {
    data: courses = [],
    isLoading: coursesLoading,
    refetch: refetchCourses
  } = useQuery<Course[]>({
    queryKey: ["/api/teacher/courses"],
    enabled: user?.role === "teacher"
  });
  
  // Fetch enrollments if course is selected
  const {
    data: enrollments = [],
    isLoading: enrollmentsLoading
  } = useQuery({
    queryKey: [`/api/teacher/courses/${selectedCourse?.id}/enrollments`],
    enabled: !!selectedCourse
  });
  
  // Fetch materials if course is selected
  const {
    data: materials = [],
    isLoading: materialsLoading,
    refetch: refetchMaterials
  } = useQuery<Material[]>({
    queryKey: [`/api/courses/${selectedCourse?.id}/materials`],
    enabled: !!selectedCourse
  });
  
  // Course creation form schema
  const courseFormSchema = insertCourseSchema.extend({
    price: z.number().min(0, "Price cannot be negative"),
  });
  
  // Material creation form schema
  const materialFormSchema = insertMaterialSchema.omit({ courseId: true }).extend({
    content: z.string().min(1, "Content is required"),
  });
  
  type CourseFormValues = z.infer<typeof courseFormSchema>;
  type MaterialFormValues = z.infer<typeof materialFormSchema>;
  
  // Course form
  const courseForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      difficulty: "beginner",
      price: 0,
      thumbnail: "",
      teacherId: user?.id || 0
    }
  });
  
  // Material form
  const materialForm = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      title: "",
      type: "video",
      content: "",
      orderIndex: 0
    }
  });
  
  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormValues) => {
      // Convert price from dollars to cents for storage
      const courseData = {
        ...data,
        price: Math.round(data.price * 100) // Convert to cents
      };
      const res = await apiRequest("POST", "/api/courses", courseData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Course created",
        description: "Your new course has been created successfully.",
      });
      setNewCourseDialogOpen(false);
      courseForm.reset();
      refetchCourses();
    },
    onError: (error) => {
      toast({
        title: "Failed to create course",
        description: error.message || "There was an error creating your course.",
        variant: "destructive",
      });
    }
  });
  
  // Create material mutation
  const createMaterialMutation = useMutation({
    mutationFn: async (data: MaterialFormValues) => {
      if (!selectedCourse) {
        throw new Error("No course selected");
      }
      
      const materialData = {
        ...data,
        courseId: selectedCourse.id
      };
      
      const res = await apiRequest("POST", `/api/courses/${selectedCourse.id}/materials`, materialData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Material added",
        description: "Your new material has been added to the course.",
      });
      setNewMaterialDialogOpen(false);
      materialForm.reset();
      refetchMaterials();
    },
    onError: (error) => {
      toast({
        title: "Failed to add material",
        description: error.message || "There was an error adding your material.",
        variant: "destructive",
      });
    }
  });
  
  // Form submission handlers
  const onCreateCourseSubmit = (data: CourseFormValues) => {
    createCourseMutation.mutate(data);
  };
  
  const onCreateMaterialSubmit = (data: MaterialFormValues) => {
    createMaterialMutation.mutate(data);
  };
  
  const isLoading = coursesLoading;
  
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
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.fullName || user?.username}</p>
        </div>
        <Button onClick={() => setNewCourseDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {courses.length > 0 
                ? `Last updated on ${new Date(courses[0].createdAt).toLocaleDateString()}`
                : 'No courses yet'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.length > 0 
                ? enrollments.length 
                : selectedCourse 
                  ? '0' 
                  : 'Select a course'}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedCourse 
                ? `Enrolled in ${selectedCourse.title}`
                : 'Select a course to view enrollments'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Materials
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {materials.length > 0 
                ? materials.length 
                : selectedCourse 
                  ? '0' 
                  : 'Select a course'}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedCourse 
                ? `Added to ${selectedCourse.title}`
                : 'Select a course to view materials'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Courses and Students Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:w-auto w-full mb-8">
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>
        
        {/* Courses Tab */}
        <TabsContent value="courses">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Courses</h2>
              <Button variant="outline" onClick={() => setNewCourseDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Course
              </Button>
            </div>
            
            {courses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    You haven't created any courses yet.
                  </p>
                  <Button onClick={() => setNewCourseDialogOpen(true)}>
                    Create Your First Course
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <Card 
                    key={course.id} 
                    className={`overflow-hidden cursor-pointer ${selectedCourse?.id === course.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedCourse(course)}
                  >
                    <div className="aspect-video bg-muted relative">
                      <img 
                        src={course.thumbnail || `https://placehold.co/800x400/4F46E5/FFFFFF?text=${encodeURIComponent(course.title)}`} 
                        alt={course.title} 
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <h3 className="text-white font-medium truncate">{course.title}</h3>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge>{course.category}</Badge>
                        <Badge variant="outline" className="capitalize">{course.difficulty}</Badge>
                      </div>
                      <p className="line-clamp-2 text-sm text-muted-foreground mb-2">{course.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">${(course.price / 100).toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground">
                          Created {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex gap-2">
                      <Button variant="outline" className="flex-1" asChild>
                        <Link href={`/courses/${course.id}`}>View</Link>
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Edit
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Students Tab */}
        <TabsContent value="students">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Students</h2>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedCourse ? selectedCourse.id.toString() : ""}
                  onValueChange={(value) => {
                    const course = courses.find(c => c.id.toString() === value);
                    setSelectedCourse(course || null);
                  }}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {!selectedCourse ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    Select a course to view enrolled students.
                  </p>
                </CardContent>
              </Card>
            ) : enrollmentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : enrollments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    No students enrolled in this course yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Students Enrolled in {selectedCourse.title}</CardTitle>
                  <CardDescription>
                    Showing {enrollments.length} enrolled students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <div className="grid grid-cols-4 bg-muted p-4 font-medium">
                      <div>Student</div>
                      <div>Enrolled On</div>
                      <div>Progress</div>
                      <div>Status</div>
                    </div>
                    <div className="divide-y">
                      {enrollments.map((enrollment: any) => (
                        <div key={enrollment.id} className="grid grid-cols-4 p-4 items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                              {enrollment.userId.toString().charAt(0)}
                            </div>
                            <span>Student #{enrollment.userId}</span>
                          </div>
                          <div>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</div>
                          <div>{enrollment.progress}%</div>
                          <div>
                            {enrollment.completed ? (
                              <Badge variant="success">Completed</Badge>
                            ) : (
                              <Badge variant="outline">In Progress</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Materials Tab */}
        <TabsContent value="materials">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Course Materials</h2>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedCourse ? selectedCourse.id.toString() : ""}
                  onValueChange={(value) => {
                    const course = courses.find(c => c.id.toString() === value);
                    setSelectedCourse(course || null);
                  }}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  disabled={!selectedCourse}
                  onClick={() => setNewMaterialDialogOpen(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Material
                </Button>
              </div>
            </div>
            
            {!selectedCourse ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    Select a course to view and manage materials.
                  </p>
                </CardContent>
              </Card>
            ) : materialsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : materials.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    No materials added to this course yet.
                  </p>
                  <Button onClick={() => setNewMaterialDialogOpen(true)}>
                    Add Your First Material
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Materials for {selectedCourse.title}</CardTitle>
                  <CardDescription>
                    Showing {materials.length} course materials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <div className="grid grid-cols-5 bg-muted p-4 font-medium">
                      <div className="col-span-2">Title</div>
                      <div>Type</div>
                      <div>Order</div>
                      <div>Actions</div>
                    </div>
                    <div className="divide-y">
                      {materials.map(material => (
                        <div key={material.id} className="grid grid-cols-5 p-4 items-center">
                          <div className="col-span-2 flex items-center gap-2">
                            {material.type === "video" ? (
                              <Play className="h-5 w-5 text-primary" />
                            ) : (
                              <FileText className="h-5 w-5 text-primary" />
                            )}
                            <span>{material.title}</span>
                          </div>
                          <div className="capitalize">{material.type}</div>
                          <div>{material.orderIndex}</div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="outline" className="text-red-500">Delete</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Create Course Dialog */}
      <Dialog open={newCourseDialogOpen} onOpenChange={setNewCourseDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create a New Course</DialogTitle>
            <DialogDescription>
              Fill in the details to create your new course. Students will see this information when browsing courses.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...courseForm}>
            <form onSubmit={courseForm.handleSubmit(onCreateCourseSubmit)} className="space-y-4">
              <FormField
                control={courseForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter course title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={courseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter course description" 
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={courseForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Web Development" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={courseForm.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={courseForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0.00" 
                          type="number"
                          step="0.01"
                          min="0"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          value={field.value}
                        />
                      </FormControl>
                      <FormDescription>Enter price in USD</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={courseForm.control}
                  name="thumbnail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter image URL" {...field} />
                      </FormControl>
                      <FormDescription>Paste an image URL for your course thumbnail</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createCourseMutation.isPending}
                >
                  {createCourseMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Course'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add Material Dialog */}
      <Dialog open={newMaterialDialogOpen} onOpenChange={setNewMaterialDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Course Material</DialogTitle>
            <DialogDescription>
              Add learning materials to {selectedCourse?.title}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...materialForm}>
            <form onSubmit={materialForm.handleSubmit(onCreateMaterialSubmit)} className="space-y-4">
              <FormField
                control={materialForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter material title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={materialForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={materialForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content URL or Text</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter URL for videos/PDFs or content for assignments/quizzes" 
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      For videos and PDFs, enter a URL. For assignments and quizzes, enter the content directly.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={materialForm.control}
                name="orderIndex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Order in the course (0, 1, 2...)" 
                        type="number" 
                        min={0}
                        onChange={(e) => field.onChange(parseInt(e.target.value))} 
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers will appear first in the course sequence
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createMaterialMutation.isPending}
                >
                  {createMaterialMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Material'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
