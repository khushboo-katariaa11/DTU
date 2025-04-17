import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CoursesPage from "@/pages/courses-page";
import CourseDetailsPage from "@/pages/course-details-page";
import StudentDashboard from "@/pages/student-dashboard";
import TeacherDashboard from "@/pages/teacher-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth, AuthProvider } from "./hooks/use-auth";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import AccessibilityPanel from "./components/accessibility/AccessibilityPanel";

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/courses" component={CoursesPage} />
      <Route path="/courses/:id" component={CourseDetailsPage} />
      
      {/* Role-specific protected routes */}
      <ProtectedRoute
        path="/student/dashboard"
        component={StudentDashboard}
        requiredRole="student"
      />
      <ProtectedRoute
        path="/teacher/dashboard"
        component={TeacherDashboard}
        requiredRole="teacher"
      />
      <ProtectedRoute
        path="/admin/dashboard"
        component={AdminDashboard}
        requiredRole="admin"
      />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        <Toaster />
        <AuthProvider>
          <AccessibilityProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Router />
              </main>
              <Footer />
              <AccessibilityPanel />
            </div>
          </AccessibilityProvider>
        </AuthProvider>
      </div>
    </QueryClientProvider>
  );
}

export default App;
