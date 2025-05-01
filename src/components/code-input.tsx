'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { explainCode } from '@/ai/flows/explain-code'; // Use the existing AI flow
import type { CodeExplanation } from '@/services/github'; // Updated import path
import { useToast } from "@/hooks/use-toast";

interface CodeInputProps {
  onExplanationReceived: (explanation: CodeExplanation | null, isLoading: boolean, error: string | null) => void;
}

export function CodeInput({ onExplanationReceived }: CodeInputProps) {
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
    onExplanationReceived(null, true, null); // Notify parent about loading state

    try {
      const result = await explainCode({ codeSnippet: code });
      onExplanationReceived(result, false, null); // Send successful result
    } catch (error) {
      console.error('Error explaining code:', error);
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred.';
      onExplanationReceived(null, false, errorMsg); // Send error message
       toast({
        title: "Error",
        description: `Failed to get explanation: ${errorMsg}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code snippet here..."
        className="flex-1 resize-none mb-4 bg-secondary text-secondary-foreground p-4 rounded-md text-sm font-mono h-[calc(100%-4rem)]" // Ensure textarea fills space
        disabled={isLoading}
      />
      <Button onClick={handleSubmit} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
  );
}
