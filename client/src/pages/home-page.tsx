import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/course/CourseCard";
import TestimonialCard from "@/components/testimonial/TestimonialCard";
import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();
  
  // Fetch featured courses
  const { data: featuredCourses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: async ({ queryKey }) => {
      // Add some params to limit to a few featured courses
      const res = await fetch(`${queryKey[0]}?limit=3`);
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    }
  });
  
  return (
    <div id="main-content">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 md:py-24">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Education Without Barriers
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100">
                An inclusive learning platform designed specifically for everyone, with specialized accessibility features for learners with disabilities.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/courses">
                  <Button size="lg" variant="secondary">
                    Explore Courses
                  </Button>
                </Link>
                <Link href="#about">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=500&q=80" alt="Diverse students learning together" className="rounded-lg shadow-xl" width="600" height="500" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Inclusive by Design</h2>
            <p className="mt-4 text-xl text-gray-600">Features that make education accessible to everyone</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-indigo-100 rounded-md flex items-center justify-center text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dyslexia Support</h3>
              <p className="text-gray-600">Customize fonts, spacing, and colors to make reading easier for users with dyslexia.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-indigo-100 rounded-md flex items-center justify-center text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Visual Adaptations</h3>
              <p className="text-gray-600">High contrast modes and color schemes designed for users with color blindness and visual impairments.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-indigo-100 rounded-md flex items-center justify-center text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Text-to-Speech</h3>
              <p className="text-gray-600">Integrated screen reading functionality to convert text to speech for easier comprehension.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-indigo-100 rounded-md flex items-center justify-center text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Keyboard Navigation</h3>
              <p className="text-gray-600">Full keyboard accessibility for users with motor impairments who cannot use a mouse.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-indigo-100 rounded-md flex items-center justify-center text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Certifications</h3>
              <p className="text-gray-600">Earn recognized certificates upon course completion to showcase your achievements.</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-indigo-100 rounded-md flex items-center justify-center text-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Visual Roadmaps</h3>
              <p className="text-gray-600">Clear learning paths with visual flowcharts to guide your educational journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section id="courses" className="py-12 bg-gray-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Courses</h2>
            <p className="mt-4 text-xl text-gray-600">Discover courses designed with accessibility in mind</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.length > 0 ? (
              featuredCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course}
                  averageRating={4.8}
                  reviewCount={120}
                />
              ))
            ) : (
              // Sample courses if no data available
              <>
                <CourseCard 
                  course={{
                    id: 1,
                    title: "Accessible Web Development Fundamentals",
                    description: "Learn to build websites that are beautiful and accessible to all users.",
                    category: "Web Development",
                    difficulty: "Beginner",
                    price: 4999,
                    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                    teacherId: 1,
                    createdAt: new Date()
                  }}
                  averageRating={4.8}
                  reviewCount={320}
                />
                
                <CourseCard 
                  course={{
                    id: 2,
                    title: "Inclusive UX/UI Design Principles",
                    description: "Design beautiful interfaces that work for users of all abilities.",
                    category: "Design",
                    difficulty: "Intermediate",
                    price: 6999,
                    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                    teacherId: 2,
                    createdAt: new Date()
                  }}
                  averageRating={4.9}
                  reviewCount={215}
                />
                
                <CourseCard 
                  course={{
                    id: 3,
                    title: "Data Science for Accessibility Research",
                    description: "Use data science to solve real-world accessibility challenges.",
                    category: "Data Science",
                    difficulty: "Advanced",
                    price: 8999,
                    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                    teacherId: 3,
                    createdAt: new Date()
                  }}
                  averageRating={4.7}
                  reviewCount={189}
                />
              </>
            )}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/courses">
              <Button size="lg" className="gap-2">
                View All Courses
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">What Our Students Say</h2>
            <p className="mt-4 text-xl text-indigo-100">Real stories from people who've transformed their learning experience</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Maria Johnson"
              description="Student with dyslexia"
              text="The OpenDyslexic font option and adjustable line spacing made a huge difference for me. For the first time, I could study without getting headaches or losing my place in the text."
              rating={5}
              imageSrc="https://randomuser.me/api/portraits/women/32.jpg"
            />
            
            <TestimonialCard 
              name="Robert Chen"
              description="Student with color blindness"
              text="The high contrast mode and color-blind friendly interfaces allowed me to easily distinguish between different elements. The platform actually considered users like me in their design."
              rating={5}
              imageSrc="https://randomuser.me/api/portraits/men/45.jpg"
            />
            
            <TestimonialCard 
              name="Sophia Williams"
              description="Student with motor impairment"
              text="The keyboard navigation and voice command features were game-changers for me. I can now navigate through courses and complete assignments without requiring assistance."
              rating={4.5}
              imageSrc="https://randomuser.me/api/portraits/women/68.jpg"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80" alt="Diverse group of educators and students" className="rounded-lg shadow-xl" width="600" height="600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About EduAble</h2>
              <p className="text-lg text-gray-600 mb-4">
                We believe that education is a right, not a privilege. Our platform was built from the ground up with accessibility as a core principle, not an afterthought.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Founded by a team of educators, accessibility experts, and technologists, EduAble is committed to breaking down barriers to learning for people with disabilities.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-lg text-gray-600">Developed with input from users with various disabilities</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-lg text-gray-600">Regularly audited for compliance with WCAG 2.1 AA standards</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-lg text-gray-600">Partnerships with organizations serving the disability community</p>
                </div>
              </div>
              
              <Button className="mt-8" size="lg">
                Learn More About Our Mission
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-2xl shadow-xl overflow-hidden">
            <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
              <div className="lg:self-center lg:max-w-3xl">
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  <span className="block">Ready to start your learning journey?</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-indigo-100">
                  Join thousands of students who are already benefiting from our accessible learning platform. Sign up today and get access to a free introductory course.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link href={user ? '/courses' : '/auth?tab=register'}>
                    <Button size="lg" variant="secondary">
                      {user ? 'Explore Courses' : 'Sign Up for Free'}
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                    Contact Us
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
