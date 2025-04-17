import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AccessibilitySettings } from "@shared/schema";

type AccessibilityContextType = {
  theme: "light" | "dark" | "high-contrast" | "color-blind";
  fontFamily: "standard" | "dyslexic";
  fontSize: "normal" | "large" | "larger";
  enableTTS: boolean;
  updateSettings: (settings: Partial<AccessibilitySettings>) => Promise<void>;
};

const defaultSettings: AccessibilitySettings = {
  theme: "light",
  fontFamily: "standard",
  fontSize: "normal",
  enableTTS: false
};

export const AccessibilityContext = createContext<AccessibilityContextType>({
  ...defaultSettings,
  updateSettings: async () => {}
});

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  
  // Initialize settings from user or defaults
  useEffect(() => {
    if (user?.accessibilitySettings) {
      setSettings({
        ...defaultSettings,
        ...user.accessibilitySettings
      });
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
    
    // Enable or disable TTS would be handled in components that use it
  }, [settings]);
  
  const updateSettings = async (newSettings: Partial<AccessibilitySettings>) => {
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
