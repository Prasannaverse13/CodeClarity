
'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Trash2 } from 'lucide-react'; // Added Trash2
import { explainCode } from '@/ai/flows/explain-code';
import type { CodeExplanation } from '@/services/github'; // Keep using this type
import { useToast } from "@/hooks/use-toast";

interface CodeInputProps {
  // Renamed for clarity, now includes status updates
  onExplanationUpdate: (
    explanation: CodeExplanation | null,
    isLoading: boolean,
    error: string | null,
    status: string | null // Added agent status message
  ) => void;
}

export function CodeInput({ onExplanationUpdate }: CodeInputProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    // 🧭 1. Intent Confirmation & Context Detection (Initial Status)
    onExplanationUpdate(null, true, null, "Got it! Analyzing your code to understand what it does...");

    try {
      // ⚙️ 2. Code Analysis in Steps (Simulated via API call)
      // The actual step-by-step is handled by the backend/service.
      // We can update status before the call if needed, but the main wait is here.
      onExplanationUpdate(null, true, null, "Processing request with AI model...");

      const result = await explainCode({ codeSnippet: code });

      // Success: Update with result and final status
      const detectedLang = result.language ? `Detected language: ${result.language}. ` : '';
      onExplanationUpdate(result, false, null, `${detectedLang}Analysis complete.`); // Send successful result and status
    } catch (error) {
      console.error('Error explaining code:', error);
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred.';
      onExplanationUpdate(null, false, errorMsg, "Agent encountered an error."); // Send error message and status
       toast({
        title: "Error",
        description: `Failed to get explanation: ${errorMsg}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setCode('');
    // Also notify parent to clear its state
    onExplanationUpdate(null, false, null, null);
     toast({
      title: "Cleared",
      description: "Input and explanation cleared.",
    });
  };


  return (
    <div className="flex flex-col h-full">
      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code snippet here..."
        className="flex-1 resize-none mb-4 bg-secondary text-secondary-foreground p-4 rounded-md text-sm font-mono h-[calc(100%-8rem)] shadow-inner" // Adjusted height, added shadow
        disabled={isLoading}
        aria-label="Code Input Area"
      />
       <div className="flex justify-between items-center mt-4">
         <Button onClick={handleClear} variant="outline" size="sm" disabled={isLoading || !code} className="text-muted-foreground hover:text-destructive hover:border-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Clear
         </Button>
         <Button onClick={handleSubmit} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md shadow-md">
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
