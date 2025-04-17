import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book, Video, FileText, Clock, Award, Download, Volume2 } from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';

export interface StudySection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'pdf' | 'audio';
  estimatedTime?: number; // in minutes
  isCompleted?: boolean;
}

interface StudyMaterialCardProps {
  title: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sections: StudySection[];
  onComplete?: (sectionId: string) => void;
  onTextToSpeech?: (text: string) => void;
}

export default function StudyMaterialCard({
  title,
  description,
  difficulty,
  sections,
  onComplete,
  onTextToSpeech,
}: StudyMaterialCardProps) {
  const { enableTTS } = useAccessibility();

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  };

  const getSectionIcon = (type: StudySection['type']) => {
    switch (type) {
      case 'text':
        return <FileText className="h-4 w-4 mr-2" />;
      case 'video':
        return <Video className="h-4 w-4 mr-2" />;
      case 'pdf':
        return <Book className="h-4 w-4 mr-2" />;
      case 'audio':
        return <Volume2 className="h-4 w-4 mr-2" />;
      default:
        return <FileText className="h-4 w-4 mr-2" />;
    }
  };

  const handleTTS = (text: string) => {
    if (enableTTS && onTextToSpeech) {
      onTextToSpeech(text);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Badge className={difficultyColors[difficulty]}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {sections.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center text-left">
                  {getSectionIcon(section.type)}
                  <span className="mr-2">{section.title}</span>
                  {section.isCompleted && (
                    <Badge variant="outline" className="ml-auto mr-2 bg-green-50 text-green-700 border-green-200">
                      Completed
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    {section.estimatedTime && (
                      <div className="flex items-center text-muted-foreground mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{section.estimatedTime} min</span>
                      </div>
                    )}
                    
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {section.type === 'text' ? (
                        <div>
                          <p>{section.content}</p>
                          {enableTTS && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleTTS(section.content)}
                              className="mt-2"
                            >
                              <Volume2 className="h-4 w-4 mr-2" />
                              Read Aloud
                            </Button>
                          )}
                        </div>
                      ) : section.type === 'video' ? (
                        <div className="relative pt-[56.25%]">
                          <iframe 
                            className="absolute top-0 left-0 w-full h-full rounded-md"
                            src={section.content}
                            title={section.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      ) : section.type === 'pdf' ? (
                        <div>
                          <Button variant="outline" className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      ) : section.type === 'audio' ? (
                        <audio 
                          controls 
                          className="w-full mt-2" 
                          src={section.content}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      ) : (
                        <p>{section.content}</p>
                      )}
                    </div>
                  </div>
                  
                  {onComplete && !section.isCompleted && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => onComplete(section.id)}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {sections.filter(s => s.isCompleted).length} of {sections.length} sections completed
        </div>
      </CardFooter>
    </Card>
  );
}