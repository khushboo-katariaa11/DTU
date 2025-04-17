import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Course, Enrollment } from "@shared/schema";
import { Star } from "lucide-react";

type CourseCardProps = {
  course: Course;
  enrollment?: Enrollment;
  averageRating?: number;
  reviewCount?: number;
  onClick?: () => void;
};

export default function CourseCard({
  course,
  enrollment,
  averageRating = 0,
  reviewCount = 0,
  onClick
}: CourseCardProps) {
  const { id, title, description, thumbnail, category, difficulty, price } = course;
  
  // Determine difficulty badge color
  const difficultyColor = {
    "beginner": "bg-indigo-500",
    "intermediate": "bg-pink-500",
    "advanced": "bg-blue-500"
  }[difficulty.toLowerCase()] || "bg-indigo-500";
  
  // Truncate description
  const truncatedDescription = description.length > 100
    ? `${description.substring(0, 100)}...`
    : description;
  
  // Determine enrollment progress
  const progress = enrollment?.progress || 0;
  const isEnrolled = !!enrollment;
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={thumbnail || `https://placehold.co/800x400/4F46E5/FFFFFF?text=${encodeURIComponent(title)}`} 
          alt={title} 
          className="w-full h-48 object-cover"
        />
        <div className={`absolute top-0 right-0 ${difficultyColor} text-white px-3 py-1 m-2 rounded-md text-sm font-medium`}>
          {difficulty}
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline">{category}</Badge>
          {averageRating > 0 && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                {averageRating.toFixed(1)} ({reviewCount})
              </span>
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-bold mb-2 line-clamp-2">{title}</h3>
        <p className="text-muted-foreground mb-4 line-clamp-2">{truncatedDescription}</p>
        
        {/* Teacher info would go here, we'll just show a placeholder */}
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
            T
          </div>
          <span className="ml-2 text-sm text-muted-foreground">By Course Instructor</span>
        </div>
        
        {isEnrolled && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <span className="text-2xl font-bold">${(price / 100).toFixed(2)}</span>
        
        <Link href={`/courses/${id}`}>
          <Button onClick={onClick}>
            {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
