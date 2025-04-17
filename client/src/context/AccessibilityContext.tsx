import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AccessibilitySettings } from "@shared/schema";

// Extended accessibility settings interface
interface ExtendedAccessibilitySettings extends AccessibilitySettings {
  cursorSize?: "normal" | "large" | "largest";
  lineSpacing?: "normal" | "wide" | "wider";
  textToSpeechRate?: number;
  motionReduced?: boolean;
  autoplay?: boolean;
  highlightLinks?: boolean;
  keyboardNavigation?: boolean;
  imageDescriptions?: boolean;
}

type AccessibilityContextType = {
  theme: "light" | "dark" | "high-contrast" | "color-blind";
  fontFamily: "standard" | "dyslexic";
  fontSize: "normal" | "large" | "larger";
  enableTTS: boolean;
  cursorSize: "normal" | "large" | "largest";
  lineSpacing: "normal" | "wide" | "wider";
  textToSpeechRate: number;
  motionReduced: boolean;
  autoplay: boolean;
  highlightLinks: boolean;
  keyboardNavigation: boolean;
  imageDescriptions: boolean;
  updateSettings: (settings: Partial<ExtendedAccessibilitySettings>) => Promise<void>;
};

const defaultSettings: ExtendedAccessibilitySettings = {
  theme: "light",
  fontFamily: "standard",
  fontSize: "normal",
  enableTTS: false,
  cursorSize: "normal",
  lineSpacing: "normal",
  textToSpeechRate: 1,
  motionReduced: false,
  autoplay: true,
  highlightLinks: false,
  keyboardNavigation: false,
  imageDescriptions: true
};

export const AccessibilityContext = createContext<AccessibilityContextType>({
  ...defaultSettings,
  updateSettings: async () => {}
});

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<ExtendedAccessibilitySettings>(defaultSettings);
  
  // Initialize settings from user, localStorage, or defaults
  useEffect(() => {
    if (user?.accessibilitySettings) {
      setSettings({
        ...defaultSettings,
        ...user.accessibilitySettings
      });
    } else {
      // Try to get settings from localStorage for non-logged in users
      const savedSettings = localStorage.getItem('accessibilitySettings');
      if (savedSettings) {
        try {
          setSettings({
            ...defaultSettings,
            ...JSON.parse(savedSettings)
          });
        } catch (e) {
          console.error("Error parsing saved accessibility settings", e);
        }
      }
    }
  }, [user]);
  
  // Apply settings to document
  useEffect(() => {
    // Apply theme
    document.body.setAttribute('data-theme', settings.theme || 'light');
    
    // Apply font family
    if (settings.fontFamily === 'dyslexic') {
      document.documentElement.classList.add('font-dyslexic');
    } else {
      document.documentElement.classList.remove('font-dyslexic');
    }
    
    // Apply font size
    document.body.setAttribute('data-font-size', settings.fontSize || 'normal');
    
    // Apply line spacing
    document.body.setAttribute('data-line-spacing', settings.lineSpacing || 'normal');
    
    // Apply cursor size
    document.body.setAttribute('data-cursor-size', settings.cursorSize || 'normal');
    
    // Apply reduced motion
    if (settings.motionReduced) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
    
    // Apply link highlighting
    if (settings.highlightLinks) {
      document.body.classList.add('highlight-links');
    } else {
      document.body.classList.remove('highlight-links');
    }
    
    // Apply keyboard navigation enhancement
    if (settings.keyboardNavigation) {
      document.body.classList.add('enhanced-keyboard-navigation');
    } else {
      document.body.classList.remove('enhanced-keyboard-navigation');
    }
  }, [settings]);
  
  const updateSettings = async (newSettings: Partial<ExtendedAccessibilitySettings>) => {
    try {
      // Update local state immediately for better UX
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      
      // If user is logged in, also save to server
      if (user) {
        await apiRequest("PATCH", "/api/user/accessibility", { settings: updatedSettings });
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        toast({
          title: "Settings updated",
          description: "Your accessibility preferences have been saved.",
        });
      } else {
        // Store in localStorage for not logged-in users
        localStorage.setItem('accessibilitySettings', JSON.stringify(updatedSettings));
        toast({
          title: "Settings updated",
          description: "Your accessibility preferences will be saved when you log in.",
        });
      }
    } catch (error) {
      toast({
        title: "Error updating settings",
        description: "There was a problem saving your accessibility preferences.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <AccessibilityContext.Provider
      value={{
        theme: settings.theme || "light",
        fontFamily: settings.fontFamily || "standard",
        fontSize: settings.fontSize || "normal",
        enableTTS: settings.enableTTS || false,
        cursorSize: settings.cursorSize || "normal",
        lineSpacing: settings.lineSpacing || "normal",
        textToSpeechRate: settings.textToSpeechRate || 1,
        motionReduced: settings.motionReduced || false,
        autoplay: settings.autoplay !== undefined ? settings.autoplay : true,
        highlightLinks: settings.highlightLinks || false,
        keyboardNavigation: settings.keyboardNavigation || false,
        imageDescriptions: settings.imageDescriptions !== undefined ? settings.imageDescriptions : true,
        updateSettings
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
