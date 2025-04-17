import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Course } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCog, BookOpen, GraduationCap, BarChart3, ShieldAlert } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  
  // Fetch all users
  const {
    data: users = [],
    isLoading: usersLoading,
    refetch: refetchUsers
  } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });
  
  // Fetch all courses
  const {
    data: courses = [],
    isLoading: coursesLoading
  } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
  
  // Fetch analytics data
  const {
    data: analytics,
    isLoading: analyticsLoading
  } = useQuery({
    queryKey: ["/api/admin/analytics"],
  });
  
  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number, role: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      });
      setRoleDialogOpen(false);
      refetchUsers();
    },
    onError: (error) => {
      toast({
        title: "Failed to update role",
        description: error.message || "There was an error updating the user role.",
        variant: "destructive",
      });
    }
  });
  
  // Handle role change
  const handleRoleChange = () => {
    if (selectedUser && newRole) {
      updateRoleMutation.mutate({
        userId: selectedUser.id,
        role: newRole
      });
    }
  };
  
  // Open role dialog
  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleDialogOpen(true);
  };
  
  // Count users by role
  const usersByRole = {
    student: users.filter(user => user.role === "student").length,
    teacher: users.filter(user => user.role === "teacher").length,
    admin: users.filter(user => user.role === "admin").length
  };
  
  // Format data for charts
  const roleChartData = [
    { name: "Students", value: usersByRole.student },
    { name: "Teachers", value: usersByRole.teacher },
    { name: "Admins", value: usersByRole.admin }
  ];
  
  const courseChartData = [
    { name: "Web Dev", count: courses.filter(c => c.category === "Web Development").length },
    { name: "Design", count: courses.filter(c => c.category === "Design").length },
    { name: "Data Science", count: courses.filter(c => c.category === "Data Science").length },
    { name: "Business", count: courses.filter(c => c.category === "Business").length },
    { name: "Marketing", count: courses.filter(c => c.category === "Marketing").length },
    { name: "Other", count: courses.filter(c => !["Web Development", "Design", "Data Science", "Business", "Marketing"].includes(c.category)).length }
  ].filter(item => item.count > 0);
  
  const isLoading = usersLoading || coursesLoading || analyticsLoading;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div id="main-content" className="container py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage users, courses, and review platform analytics
        </p>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {usersByRole.student} students, {usersByRole.teacher} teachers, {usersByRole.admin} admins
            </p>
          </CardContent>
        </Card>
        
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
              In {new Set(courses.map(c => c.category)).size} different categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Enrollments
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.enrollmentCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              78%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across all courses
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:w-auto w-full mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="courses">Course Management</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>User Roles Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={roleChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Courses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={courseChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  System events from the past 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="min-w-[50px] text-center">
                      <Badge variant="outline" className="rounded-full px-2">Now</Badge>
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">You logged in to the admin dashboard</p>
                      <p className="text-sm text-muted-foreground">Just now</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="min-w-[50px] text-center">
                      <Badge variant="outline" className="rounded-full px-2">1h</Badge>
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">New user registered</p>
                      <p className="text-sm text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="min-w-[50px] text-center">
                      <Badge variant="outline" className="rounded-full px-2">3h</Badge>
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">New course published</p>
                      <p className="text-sm text-muted-foreground">3 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="min-w-[50px] text-center">
                      <Badge variant="outline" className="rounded-full px-2">1d</Badge>
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">User role updated</p>
                      <p className="text-sm text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>
                          <Badge className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRoleDialog(user)}
                          >
                            Change Role
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Courses Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>
                Manage and monitor all courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No courses found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map(course => (
                      <TableRow key={course.id}>
                        <TableCell>{course.id}</TableCell>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>{course.category}</TableCell>
                        <TableCell className="capitalize">{course.difficulty}</TableCell>
                        <TableCell>${(course.price / 100).toFixed(2)}</TableCell>
                        <TableCell>Teacher #{course.teacherId}</TableCell>
                        <TableCell>{new Date(course.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="destructive" size="sm">
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update role for user: {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={updateRoleMutation.isPending}
              className="gap-2"
            >
              {updateRoleMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4" />
                  Update Role
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
