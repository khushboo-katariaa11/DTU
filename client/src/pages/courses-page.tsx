import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import CourseCard from "@/components/course/CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  
  // Fetch courses with optional filters
  const { data: courses = [], isLoading, error } = useQuery<Course[]>({
    queryKey: [
      "/api/courses", 
      selectedCategory ? `category=${selectedCategory}` : "",
      selectedDifficulty ? `difficulty=${selectedDifficulty}` : ""
    ],
    queryFn: async ({ queryKey }) => {
      const categoryParam = selectedCategory ? `category=${selectedCategory}` : "";
      const difficultyParam = selectedDifficulty ? `difficulty=${selectedDifficulty}` : "";
      const queryParams = [categoryParam, difficultyParam].filter(Boolean).join("&");
      
      const url = `${queryKey[0]}${queryParams ? `?${queryParams}` : ""}`;
      const res = await fetch(url);
      
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    }
  });
  
  // Filter courses by search term
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setSelectedDifficulty(null);
  };
  
  // Sample categories and difficulties - in a real app these would likely come from the API
  const categories = ["Web Development", "Design", "Data Science", "Business", "Marketing"];
  const difficulties = ["Beginner", "Intermediate", "Advanced"];
  
  return (
    <div id="main-content" className="container py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Explore Our Courses</h1>
        <p className="text-xl text-muted-foreground">
          Discover courses designed with accessibility in mind for all learners
        </p>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-10 space-y-6">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-4">
            <Select
              value={selectedDifficulty || ""}
              onValueChange={(value) => setSelectedDifficulty(value || null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Difficulty: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Difficulties</SelectItem>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="ghost" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
      
      {/* Course Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Courses</h3>
          <p className="text-muted-foreground">
            There was a problem loading courses. Please try again later.
          </p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Courses Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <Button className="mt-4" onClick={resetFilters}>
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              averageRating={4.5} // This should come from the API in a real app
              reviewCount={100} // This should come from the API in a real app
            />
          ))}
        </div>
      )}
      
      {/* If there are many courses, add pagination here */}
    </div>
  );
}
