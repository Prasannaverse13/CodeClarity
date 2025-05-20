
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface CodeInputProps {
  initialCode?: string;
  onExplainCode: (code: string) => void;
  onClear: () => void;
  isLoading: boolean;
}

export function CodeInput({
  initialCode = '',
  onExplainCode,
  onClear,
  isLoading
}: CodeInputProps) {
  const [code, setCode] = useState(initialCode);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync code state if initialCode prop changes (e.g., after global clear)
    setCode(initialCode);
  }, [initialCode]);

  const updateLineNumbers = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      const lines = textareaRef.current.value.split('\n');
      const lineCount = lines.length;
      lineNumbersRef.current.innerHTML = Array.from({ length: Math.max(1, lineCount) }, (_, i) => `<div>${i + 1}</div>`).join('');
      // Synchronize scroll positions
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []); 

  useEffect(() => {
    updateLineNumbers();
  }, [code, updateLineNumbers]);

  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(event.target.value);
    // Call updateLineNumbers immediately on change for responsiveness
    // However, the useEffect watching `code` already handles this.
    // Consider if direct call is needed or if useEffect is sufficient.
    // For simplicity and to avoid potential rapid re-renders, let useEffect handle it.
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleSubmit = () => {
    if (!code.trim()) {
      toast({
        title: "Input Error",
        description: "Please enter some code to explain.",
        variant: "destructive",
      });
      return;
    }
    onExplainCode(code);
  };

  const handleLocalClear = () => {
    setCode(''); 
    if (onClear) {
      onClear(); 
    }
    toast({
      title: "Cleared",
      description: "Input cleared.",
    });
  };

  useEffect(() => {
    if (textareaRef.current && !isLoading) {
      textareaRef.current.focus();
    }
  }, [isLoading]);


  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-1 mb-4 rounded-md border border-input shadow-sm overflow-hidden bg-background">
        <div className="flex flex-1 h-[calc(100%-4rem)] min-h-[200px]"> {/* Ensure this has a defined height */}
          <div
            ref={lineNumbersRef}
            className="p-4 pr-2 text-right bg-muted/30 text-muted-foreground select-none font-mono text-sm overflow-y-hidden whitespace-pre sticky top-0 h-full"
            style={{ lineHeight: '1.625rem' }} // Match textarea's line height
          >
            <div>1</div> {/* Initial line number */}
          </div>
          <Textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            onScroll={handleScroll} // Added onScroll handler
            placeholder="Paste your code snippet here..."
            className={cn(
              "flex-1 resize-none p-4 bg-transparent text-foreground text-sm font-mono focus:outline-none border-0 shadow-none focus-visible:ring-0",
              "h-full w-full leading-relaxed" // leading-relaxed is approx 1.625rem
            )}
            disabled={isLoading}
            aria-label="Code Input Area"
            spellCheck="false"
            style={{ lineHeight: '1.625rem' }} // Consistent line height
          />
        </div>
      </div>
      <div className="flex justify-between items-center mt-auto gap-2">
        <Button onClick={handleLocalClear} variant="outline" size="sm" disabled={isLoading && !code.trim()} className="text-muted-foreground hover:text-destructive hover:border-destructive">
          <Trash2 className="mr-1.5 h-4 w-4" /> Clear All
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading || !code.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md shadow-sm text-sm">
          {isLoading ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="mr-1.5 h-4 w-4" />
              Explain Code
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
