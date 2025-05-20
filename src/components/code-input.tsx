
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface CodeInputProps {
  onExplainCode: (code: string) => void;
  onClear: () => void;
  isLoading: boolean;
}

export function CodeInput({
  onExplainCode,
  onClear,
  isLoading
}: CodeInputProps) {
  const [code, setCode] = useState('');
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const updateLineNumbers = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      const lines = textareaRef.current.value.split('\n');
      const lineCount = lines.length;
      // Ensure there's always at least one line number, even if empty
      lineNumbersRef.current.innerHTML = Array.from({ length: Math.max(1, lineCount) }, (_, i) => `<div>${i + 1}</div>`).join('');
      // Synchronize scrolling
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  useEffect(() => {
    updateLineNumbers();
  }, [code]); // Re-calculate on code change

  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(event.target.value);
    // updateLineNumbers is called by useEffect
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleSubmitToSensay = async () => {
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
    onClear();
    toast({
      title: "Cleared",
      description: "Input and analysis cleared.",
    });
    // Ensure line numbers reset correctly after clearing
    if (textareaRef.current) textareaRef.current.value = ''; // Explicitly clear textarea
    // The useEffect for code will call updateLineNumbers
  };


  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-1 mb-4 rounded-md border border-input shadow-sm overflow-hidden bg-background">
        <div className="flex flex-1 h-[calc(100%-4rem)] min-h-[200px]"> {/* Adjusted height */}
          <div
            ref={lineNumbersRef}
            className="p-4 pr-2 text-right bg-muted/50 text-muted-foreground select-none font-mono text-sm overflow-y-hidden whitespace-pre sticky top-0 h-full"
            style={{ lineHeight: '1.5rem' }}
          >
            <div>1</div> {/* Initial line number */}
          </div>
          <Textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            onScroll={handleScroll}
            placeholder="Paste your code snippet here..."
            className={cn(
              "flex-1 resize-none p-4 bg-transparent text-foreground text-sm font-mono focus:outline-none",
              "h-full w-full leading-relaxed"
            )}
            disabled={isLoading}
            aria-label="Code Input Area"
            spellCheck="false"
            style={{ lineHeight: '1.5rem' }}
          />
        </div>
      </div>
      <div className="flex justify-between items-center mt-auto gap-2">
        <Button onClick={handleLocalClear} variant="outline" size="sm" disabled={isLoading && !code} className="text-muted-foreground hover:text-destructive hover:border-destructive">
          <Trash2 className="mr-2 h-4 w-4" /> Clear All
        </Button>
        <Button onClick={handleSubmitToSensay} disabled={isLoading || !code.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md shadow-md">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Explain Code
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
