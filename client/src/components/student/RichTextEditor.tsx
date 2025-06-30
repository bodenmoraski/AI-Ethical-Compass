import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  placeholder?: string;
  autoSave?: boolean;
  autoSaveInterval?: number; // in milliseconds
  maxLength?: number;
  readOnly?: boolean;
  className?: string;
}

interface FormatButton {
  icon: React.ReactNode;
  format: string;
  label: string;
  shortcut?: string;
}

const formatButtons: FormatButton[] = [
  { icon: <Bold className="h-4 w-4" />, format: 'bold', label: 'Bold', shortcut: 'Ctrl+B' },
  { icon: <Italic className="h-4 w-4" />, format: 'italic', label: 'Italic', shortcut: 'Ctrl+I' },
  { icon: <Underline className="h-4 w-4" />, format: 'underline', label: 'Underline', shortcut: 'Ctrl+U' },
  { icon: <List className="h-4 w-4" />, format: 'bullet', label: 'Bullet List' },
  { icon: <ListOrdered className="h-4 w-4" />, format: 'ordered', label: 'Numbered List' },
  { icon: <Quote className="h-4 w-4" />, format: 'quote', label: 'Quote' },
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onSave,
  placeholder = 'Start writing your ethical analysis...',
  autoSave = true,
  autoSaveInterval = 30000, // 30 seconds
  maxLength = 5000,
  readOnly = false,
  className = ''
}) => {
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate word and character count
  useEffect(() => {
    const text = value.replace(/<[^>]*>/g, ''); // Remove HTML tags for counting
    setCharCount(text.length);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  }, [value]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && isDirty && !readOnly) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [value, isDirty, autoSave, autoSaveInterval, readOnly]);

  const handleAutoSave = async () => {
    if (!onSave) return;

    setSaveStatus('saving');
    try {
      await onSave();
      setSaveStatus('saved');
      setIsDirty(false);
      setLastSaved(new Date());
      
      // Clear saved status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Auto-save failed:', error);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newValue = e.currentTarget.innerHTML;
    onChange(newValue);
    setIsDirty(true);
  };

  const formatText = (format: string) => {
    if (!editorRef.current || readOnly) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText) return;

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        formattedText = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'bullet':
        formattedText = `<ul><li>${selectedText}</li></ul>`;
        break;
      case 'ordered':
        formattedText = `<ol><li>${selectedText}</li></ol>`;
        break;
      case 'quote':
        formattedText = `<blockquote>${selectedText}</blockquote>`;
        break;
      default:
        return;
    }

    // Replace selected text with formatted text
    range.deleteContents();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formattedText;
    const fragment = document.createDocumentFragment();
    
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    
    range.insertNode(fragment);
    selection.removeAllRanges();
    
    // Trigger change event
    const event = new Event('input', { bubbles: true });
    editorRef.current.dispatchEvent(event);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
        case 'u':
          e.preventDefault();
          formatText('underline');
          break;
        case 's':
          e.preventDefault();
          if (onSave) {
            handleAutoSave();
          }
          break;
      }
    }

    // Handle Enter key for lists
    if (e.key === 'Enter' && editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const parentElement = range.commonAncestorContainer.parentElement;
        
        if (parentElement?.tagName === 'LI') {
          e.preventDefault();
          const newLi = document.createElement('li');
          parentElement.parentNode?.insertBefore(newLi, parentElement.nextSibling);
          
          const newRange = document.createRange();
          newRange.setStart(newLi, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    }
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />;
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return lastSaved ? `Saved at ${lastSaved.toLocaleTimeString()}` : 'Saved';
      case 'error':
        return 'Save failed';
      default:
        return isDirty ? 'Unsaved changes' : 'All changes saved';
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4">
        {/* Toolbar */}
        {!readOnly && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              {formatButtons.map((button) => (
                <Button
                  key={button.format}
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText(button.format)}
                  title={`${button.label} ${button.shortcut ? `(${button.shortcut})` : ''}`}
                  className="h-8 w-8 p-0"
                >
                  {button.icon}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              {autoSave && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getSaveStatusIcon()}
                  <span>{getSaveStatusText()}</span>
                </div>
              )}
              
              {onSave && (
                <Button
                  onClick={handleAutoSave}
                  size="sm"
                  disabled={saveStatus === 'saving'}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              )}
            </div>
          </div>
        )}

        <Separator className="mb-4" />

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className={`
            min-h-[200px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${readOnly ? 'bg-gray-50 cursor-default' : 'bg-white'}
            prose prose-sm max-w-none
          `}
          dangerouslySetInnerHTML={{ __html: value }}
          placeholder={placeholder}
          style={{ 
            minHeight: '200px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}
        />

        {/* Character and word count */}
        <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            {maxLength && (
              <span className={charCount > maxLength ? 'text-red-600' : ''}>
                {charCount}/{maxLength} max
              </span>
            )}
          </div>
          
          {isDirty && !readOnly && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Unsaved
            </Badge>
          )}
        </div>

        {/* Formatting help */}
        {!readOnly && (
          <div className="mt-3 text-xs text-muted-foreground">
            <p>Keyboard shortcuts: <strong>Ctrl+B</strong> (Bold), <strong>Ctrl+I</strong> (Italic), <strong>Ctrl+U</strong> (Underline), <strong>Ctrl+S</strong> (Save)</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RichTextEditor; 