import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: () => React.JSX.Element;
  requiredRole?: "admin" | "teacher" | "student";
};

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole
}: ProtectedRouteProps) {
  const { user, isLoading, isAdmin, isTeacher, isStudent } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // If no user, redirect to auth page
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If role is required, check user's role
  if (requiredRole) {
    let hasRequiredRole = false;
    
    switch (requiredRole) {
      case "admin":
        hasRequiredRole = isAdmin;
        break;
      case "teacher":
        hasRequiredRole = isTeacher || isAdmin; // Admin can access teacher routes
        break;
      case "student":
        hasRequiredRole = isStudent || isTeacher || isAdmin; // Any authenticated user can access student routes
        break;
    }
    
    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on user's role
      let redirectPath = "/";
      if (isAdmin) redirectPath = "/admin/dashboard";
      else if (isTeacher) redirectPath = "/teacher/dashboard";
      else if (isStudent) redirectPath = "/student/dashboard";
      
      return (
        <Route path={path}>
          <Redirect to={redirectPath} />
        </Route>
      );
    }
  }

  return <Route path={path} component={Component} />;
}
