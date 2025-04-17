import { Card, CardContent } from "@/components/ui/card";
import { Star, StarHalf } from "lucide-react";

type TestimonialCardProps = {
  name: string;
  description?: string;
  text: string;
  rating: number;
  imageSrc?: string;
};

export default function TestimonialCard({
  name,
  description,
  text,
  rating,
  imageSrc
}: TestimonialCardProps) {
  // Generate rating stars
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`star-${i}`} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half-star" className="h-5 w-5 text-yellow-400 fill-yellow-400" />
      );
    }
    
    // Add empty stars to make 5 total
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-star-${i}`} className="h-5 w-5 text-yellow-400" />
      );
    }
    
    return stars;
  };
  
  return (
    <Card className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border border-white border-opacity-20">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt={name} 
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
              {name.charAt(0)}
            </div>
          )}
          <div className="ml-4">
            <h4 className="font-medium">{name}</h4>
            {description && (
              <p className="text-indigo-200 text-sm">{description}</p>
            )}
          </div>
        </div>
        <p className="italic">{text}</p>
        <div className="mt-4 flex">
          {renderStars()}
        </div>
      </CardContent>
    </Card>
  );
}
