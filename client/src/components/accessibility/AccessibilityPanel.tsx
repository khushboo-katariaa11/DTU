import React, { useState } from 'react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Label 
} from "@/components/ui/label";
import { 
  Switch 
} from "@/components/ui/switch";
import { 
  Button 
} from "@/components/ui/button";
import { Accessibility, Check } from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';

export default function AccessibilityPanel() {
  const { theme, fontFamily, fontSize, enableTTS, updateSettings } = useAccessibility();
  const [open, setOpen] = useState(false);
  
  const [tempSettings, setTempSettings] = useState({
    theme,
    fontFamily,
    fontSize,
    enableTTS
  });
  
  // Reset temp settings when popover opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTempSettings({
        theme,
        fontFamily,
        fontSize,
        enableTTS
      });
    }
    setOpen(isOpen);
  };
  
  const handleApplySettings = async () => {
    await updateSettings(tempSettings);
    setOpen(false);
  };
  
  return (
    <div className="fixed right-4 bottom-4 z-50">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button size="icon" className="h-12 w-12 rounded-full shadow-lg" aria-label="Accessibility Options">
            <Accessibility className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" side="top">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h2 className="text-lg font-semibold">Accessibility Settings</h2>
            </div>
            
            <div className="space-y-4">
              {/* Theme Selection */}
              <div className="space-y-2">
                <Label htmlFor="theme-select">Display Mode</Label>
                <Select 
                  value={tempSettings.theme} 
                  onValueChange={(value: any) => setTempSettings({...tempSettings, theme: value})}
                >
                  <SelectTrigger id="theme-select">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                    <SelectItem value="high-contrast">High Contrast</SelectItem>
                    <SelectItem value="color-blind">Color Blind Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Font Family */}
              <div className="space-y-2">
                <Label htmlFor="font-select">Font Family</Label>
                <Select 
                  value={tempSettings.fontFamily} 
                  onValueChange={(value: any) => setTempSettings({...tempSettings, fontFamily: value})}
                >
                  <SelectTrigger id="font-select">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Font</SelectItem>
                    <SelectItem value="dyslexic">OpenDyslexic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Font Size */}
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size</Label>
                <Select 
                  value={tempSettings.fontSize} 
                  onValueChange={(value: any) => setTempSettings({...tempSettings, fontSize: value})}
                >
                  <SelectTrigger id="font-size">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="larger">Larger</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Text-to-Speech Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="tts-toggle" className="cursor-pointer">Enable Text-to-Speech</Label>
                <Switch 
                  id="tts-toggle" 
                  checked={tempSettings.enableTTS} 
                  onCheckedChange={(checked) => setTempSettings({...tempSettings, enableTTS: checked})}
                />
              </div>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleApplySettings}
            >
              <Check className="mr-2 h-4 w-4" /> Apply Settings
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
