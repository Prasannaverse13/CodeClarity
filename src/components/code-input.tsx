
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Trash2 } from 'lucide-react';
import { explainCode, type ExplainCodeOutput as CodeExplanation } from '@/ai/flows/explain-code'; // Updated import
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

interface CodeInputProps {
  onExplanationUpdate: (
    explanation: CodeExplanation | null,
    isLoading: boolean,
    error: string | null,
    status: string | null,
    code: string | null
  ) => void;
  onClear: () => void;
}

export function CodeInput({ onExplanationUpdate, onClear }: CodeInputProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const updateLineNumbers = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      const lineCount = textareaRef.current.value.split('\n').length;
      lineNumbersRef.current.innerHTML = Array.from({ length: lineCount }, (_, i) => `<div>${i + 1}</div>`).join('');
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  useEffect(() => {
    updateLineNumbers();
  }, [code]);

  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(event.target.value);
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast({
        title: "Input Error",
        description: "Please enter some code to explain.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Reset previous data and error states immediately
    onExplanationUpdate(null, true, null, "Received! Analyzing your code with Gemini...", code);


    try {
      onExplanationUpdate(null, true, null, "Processing request with Google Gemini model... This may take a moment.", code);
      const result = await explainCode({ codeSnippet: code });
      const detectedLang = result.language && result.language !== "Unknown"
        ? `Detected language: ${result.language}. `
        : '';
      onExplanationUpdate(result, false, null, `${detectedLang}Gemini model analysis complete.`, code);
    } catch (error) {
      console.error('Error explaining code with Gemini model:', error);
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred.';
      onExplanationUpdate(null, false, errorMsg, "Gemini Agent encountered an error during analysis.", code);
       toast({
        title: "Gemini Analysis Error",
        description: `Failed to get explanation: ${errorMsg}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalClear = () => {
    setCode('');
    setIsLoading(false); // Ensure loading is reset
    onClear(); 
    toast({
      title: "Cleared",
      description: "Input and analysis cleared.",
    });
  };


  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 mb-4 rounded-md border border-input shadow-sm overflow-hidden bg-background">
        <div
          ref={lineNumbersRef}
          className="p-4 pr-2 text-right bg-muted/50 text-muted-foreground select-none font-mono text-sm overflow-y-hidden whitespace-pre sticky top-0 h-full"
          style={{ lineHeight: '1.5rem' }}
        >
          <div>1</div>
        </div>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          onScroll={handleScroll}
          placeholder="Paste your code snippet here..."
          className={cn(
            "flex-1 resize-none p-4 bg-transparent text-foreground text-sm font-mono focus:outline-none", // Changed background to transparent
            "h-full min-h-[calc(100%-8rem)] sm:min-h-[200px] leading-relaxed" 
          )}
          disabled={isLoading}
          aria-label="Code Input Area"
          spellCheck="false"
          style={{ lineHeight: '1.5rem' }} 
        />
      </div>
       <div className="flex justify-between items-center mt-auto">
         <Button onClick={handleLocalClear} variant="outline" size="sm" disabled={isLoading && !code} className="text-muted-foreground hover:text-destructive hover:border-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Clear
         </Button>
         <Button onClick={handleSubmit} disabled={isLoading || !code.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md shadow-md">
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
