
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Trash2, MessageCircleQuestion } from 'lucide-react'; // Changed icon here
import { explainCode, type ExplainCodeOutput as CodeExplanation } from '@/ai/flows/explain-code';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface CodeInputProps {
  onExplanationUpdate: (
    explanation: CodeExplanation | null,
    isLoading: boolean,
    error: string | null,
    status: string | null,
    code: string | null
  ) => void;
  onClear: () => void;
  onAskSensayExpert: (code: string, question: string) => void; 
  isSensayLoading: boolean; 
}

export function CodeInput({ 
  onExplanationUpdate, 
  onClear, 
  onAskSensayExpert,
  isSensayLoading 
}: CodeInputProps) {
  const [code, setCode] = useState('');
  const [geminiIsLoading, setGeminiIsLoading] = useState(false);
  const [expertQuestion, setExpertQuestion] = useState('');
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const updateLineNumbers = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      const lineCount = textareaRef.current.value.split('\n').length;
      lineNumbersRef.current.innerHTML = Array.from({ length: lineCount }, (_, i) => `<div>${i + 1}</div>`).join('');
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop; // Sync scroll
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

  const handleSubmitToGemini = async () => {
    if (!code.trim()) {
      toast({
        title: "Input Error",
        description: "Please enter some code to explain.",
        variant: "destructive",
      });
      return;
    }

    setGeminiIsLoading(true);
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
      setGeminiIsLoading(false);
    }
  };

  const handleAskExpertSubmit = () => {
    if (!code.trim()) {
      toast({
        title: "Input Error",
        description: "Please enter some code before asking an expert.",
        variant: "destructive",
      });
      return;
    }
    if (!expertQuestion.trim()) {
      toast({
        title: "Input Error",
        description: "Please enter your question for the expert.",
        variant: "destructive",
      });
      return;
    }
    onAskSensayExpert(code, expertQuestion);
  };

  const handleLocalClear = () => {
    setCode('');
    setExpertQuestion('');
    setGeminiIsLoading(false); 
    onClear(); 
    toast({
      title: "Cleared",
      description: "Input and analysis cleared.",
    });
     // Ensure line numbers reset correctly
    if (textareaRef.current) textareaRef.current.value = '';
    if (lineNumbersRef.current) lineNumbersRef.current.innerHTML = '<div>1</div>';
  };


  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-1 mb-4 rounded-md border border-input shadow-sm overflow-hidden bg-background">
        <div className="flex flex-1 h-[calc(100%-10rem)] min-h-[150px]"> {/* Ensure text area part has enough height */}
          <div
            ref={lineNumbersRef}
            className="p-4 pr-2 text-right bg-muted/50 text-muted-foreground select-none font-mono text-sm overflow-y-hidden whitespace-pre sticky top-0 h-full"
            style={{ lineHeight: '1.5rem' }} 
          >
            <div>1</div>
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
            disabled={geminiIsLoading || isSensayLoading}
            aria-label="Code Input Area"
            spellCheck="false"
            style={{ lineHeight: '1.5rem' }} 
          />
        </div>
        {/* Expert Question Section */}
        <div className="p-4 border-t border-input">
          <label htmlFor="expert-question" className="block text-sm font-medium text-foreground mb-1">
            Ask the Code Mentor (Sensay AI):
          </label>
          <Textarea
            id="expert-question"
            value={expertQuestion}
            onChange={(e) => setExpertQuestion(e.target.value)}
            placeholder="Ask a specific question about the code above..."
            className="text-sm font-mono min-h-[60px]"
            disabled={geminiIsLoading || isSensayLoading}
          />
        </div>
      </div>
       <div className="flex justify-between items-center mt-auto gap-2">
         <Button onClick={handleLocalClear} variant="outline" size="sm" disabled={(geminiIsLoading || isSensayLoading) && !code} className="text-muted-foreground hover:text-destructive hover:border-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Clear All
         </Button>
         <div className="flex gap-2">
            <Button 
                onClick={handleAskExpertSubmit} 
                disabled={geminiIsLoading || isSensayLoading || !expertQuestion.trim() || !code.trim()} 
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-md shadow-md"
                variant="outline"
            >
            {isSensayLoading ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Asking Mentor...
                </>
            ) : (
                <>
                <MessageCircleQuestion className="mr-2 h-4 w-4" /> {/* Changed icon here */}
                Ask Mentor
                </>
            )}
            </Button>
            <Button onClick={handleSubmitToGemini} disabled={geminiIsLoading || isSensayLoading || !code.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md shadow-md">
            {geminiIsLoading ? (
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
    </div>
  );
}
