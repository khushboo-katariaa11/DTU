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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Slider 
} from "@/components/ui/slider";
import { 
  Accessibility, 
  Check, 
  Monitor, 
  Type, 
  Volume2, 
  MousePointer2, 
  ZoomIn 
} from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';

export default function AccessibilityPanel() {
  const { theme, fontFamily, fontSize, enableTTS, updateSettings } = useAccessibility();
  const [open, setOpen] = useState(false);
  
  const [tempSettings, setTempSettings] = useState({
    theme,
    fontFamily,
    fontSize,
    enableTTS,
    // Additional settings
    cursorSize: "normal" as "normal" | "large" | "largest",
    lineSpacing: "normal" as "normal" | "wide" | "wider",
    textToSpeechRate: 1,
    motionReduced: false,
    autoplay: false,
    highlightLinks: false,
    keyboardNavigation: false,
    imageDescriptions: true
  });
  
  // Reset temp settings when popover opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTempSettings({
        ...tempSettings,
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
        <PopoverContent className="w-96 p-4" side="top">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h2 className="text-lg font-semibold">Accessibility Settings</h2>
            </div>
            
            <Tabs defaultValue="display">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="display">
                  <Monitor className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Display</span>
                </TabsTrigger>
                <TabsTrigger value="text">
                  <Type className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Text</span>
                </TabsTrigger>
                <TabsTrigger value="audio">
                  <Volume2 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Audio</span>
                </TabsTrigger>
                <TabsTrigger value="navigation">
                  <MousePointer2 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Navigation</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="display" className="space-y-4 pt-4">
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
                
                {/* Motion Reduced */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="motion-toggle" className="cursor-pointer">Reduce Animations</Label>
                  <Switch 
                    id="motion-toggle" 
                    checked={tempSettings.motionReduced} 
                    onCheckedChange={(checked) => setTempSettings({...tempSettings, motionReduced: checked})}
                  />
                </div>
                
                {/* Autoplay Media */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoplay-toggle" className="cursor-pointer">Allow Autoplay Media</Label>
                  <Switch 
                    id="autoplay-toggle" 
                    checked={tempSettings.autoplay} 
                    onCheckedChange={(checked) => setTempSettings({...tempSettings, autoplay: checked})}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="text" className="space-y-4 pt-4">
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
                
                {/* Line Spacing */}
                <div className="space-y-2">
                  <Label htmlFor="line-spacing">Line Spacing</Label>
                  <Select 
                    value={tempSettings.lineSpacing} 
                    onValueChange={(value: any) => setTempSettings({...tempSettings, lineSpacing: value})}
                  >
                    <SelectTrigger id="line-spacing">
                      <SelectValue placeholder="Select spacing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="wide">Wide</SelectItem>
                      <SelectItem value="wider">Wider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Highlight Links */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="highlight-links-toggle" className="cursor-pointer">Highlight Links</Label>
                  <Switch 
                    id="highlight-links-toggle" 
                    checked={tempSettings.highlightLinks} 
                    onCheckedChange={(checked) => setTempSettings({...tempSettings, highlightLinks: checked})}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="audio" className="space-y-4 pt-4">
                {/* Text-to-Speech Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="tts-toggle" className="cursor-pointer">Enable Text-to-Speech</Label>
                  <Switch 
                    id="tts-toggle" 
                    checked={tempSettings.enableTTS} 
                    onCheckedChange={(checked) => setTempSettings({...tempSettings, enableTTS: checked})}
                  />
                </div>
                
                {/* TTS Speed */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="tts-rate">Speech Rate</Label>
                    <span className="text-sm text-muted-foreground">
                      {tempSettings.textToSpeechRate}x
                    </span>
                  </div>
                  <Slider 
                    id="tts-rate"
                    disabled={!tempSettings.enableTTS}
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[tempSettings.textToSpeechRate]}
                    onValueChange={(value) => setTempSettings({...tempSettings, textToSpeechRate: value[0]})}
                  />
                </div>
                
                {/* Image Descriptions */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="image-descriptions-toggle" className="cursor-pointer">Read Image Descriptions</Label>
                  <Switch 
                    id="image-descriptions-toggle" 
                    checked={tempSettings.imageDescriptions} 
                    onCheckedChange={(checked) => setTempSettings({...tempSettings, imageDescriptions: checked})}
                    disabled={!tempSettings.enableTTS}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="navigation" className="space-y-4 pt-4">
                {/* Cursor Size */}
                <div className="space-y-2">
                  <Label htmlFor="cursor-size">Cursor Size</Label>
                  <Select 
                    value={tempSettings.cursorSize} 
                    onValueChange={(value: any) => setTempSettings({...tempSettings, cursorSize: value})}
                  >
                    <SelectTrigger id="cursor-size">
                      <SelectValue placeholder="Select cursor size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="largest">Largest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Keyboard Navigation */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="keyboard-navigation-toggle" className="cursor-pointer">Enhanced Keyboard Navigation</Label>
                  <Switch 
                    id="keyboard-navigation-toggle" 
                    checked={tempSettings.keyboardNavigation} 
                    onCheckedChange={(checked) => setTempSettings({...tempSettings, keyboardNavigation: checked})}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
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
