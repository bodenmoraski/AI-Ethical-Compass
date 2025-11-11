import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface AccessibilityControlsProps {
  onFontSizeChange: (size: number) => void;
  onHighContrastToggle: (enabled: boolean) => void;
  onScreenReaderToggle: (enabled: boolean) => void;
}

const AccessibilityControls = ({
  onFontSizeChange,
  onHighContrastToggle,
  onScreenReaderToggle,
}: AccessibilityControlsProps) => {
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Apply initial accessibility settings
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
    document.documentElement.classList.toggle('high-contrast', highContrast);
    document.documentElement.setAttribute('aria-live', screenReader ? 'polite' : 'off');
  }, [fontSize, highContrast, screenReader]);

  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    onFontSizeChange(newSize);
  };

  const handleHighContrastToggle = (checked: boolean) => {
    setHighContrast(checked);
    onHighContrastToggle(checked);
  };

  const handleScreenReaderToggle = (checked: boolean) => {
    setScreenReader(checked);
    onScreenReaderToggle(checked);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary-600 text-white p-2 rounded-full shadow-lg"
        aria-label="Accessibility controls"
      >
        <span className="material-icons">accessibility</span>
      </Button>

      {isOpen && (
        <div className="absolute bottom-0 right-0 bg-white p-4 rounded-lg shadow-lg w-64">
          <h2 className="text-lg font-semibold mb-4">Accessibility Settings</h2>
          
          <div className="space-y-4">
            {/* Font Size Control */}
            <div>
              <Label htmlFor="font-size">Font Size</Label>
              <Slider
                id="font-size"
                min={12}
                max={24}
                step={1}
                value={[fontSize]}
                onValueChange={handleFontSizeChange}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-neutral-600 mt-1">
                <span>A</span>
                <span>A</span>
                <span>A</span>
              </div>
            </div>

            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast">High Contrast Mode</Label>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={handleHighContrastToggle}
              />
            </div>

            {/* Screen Reader Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="screen-reader">Screen Reader Mode</Label>
              <Switch
                id="screen-reader"
                checked={screenReader}
                onCheckedChange={handleScreenReaderToggle}
              />
            </div>

            {/* Keyboard Shortcuts */}
            <div className="pt-2 border-t">
              <h3 className="text-sm font-medium mb-2">Keyboard Shortcuts</h3>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>Alt + 1: Toggle High Contrast</li>
                <li>Alt + 2: Increase Font Size</li>
                <li>Alt + 3: Decrease Font Size</li>
                <li>Alt + 4: Toggle Screen Reader</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityControls; 