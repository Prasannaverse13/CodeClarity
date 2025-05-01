
'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown'; // Import react-markdown
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, AlertTriangle, Info, Brain, RefreshCw, BookOpen } from 'lucide-react'; // Added icons
import { useToast } from "@/hooks/use-toast";
import type { CodeExplanation } from '@/services/github'; // Still uses this type
import { Badge } from '@/components/ui/badge'; // Import Badge

interface CodeExplanationDisplayProps {
  explanationData: CodeExplanation | null; // Renamed prop
  isLoading: boolean;
  error: string | null;
  onClear: () => void; // Add handler for clearing
}

export function CodeExplanationDisplay({ explanationData, isLoading, error, onClear }: CodeExplanationDisplayProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    // Copy the markdown explanation
    if (explanationData?.explanation_markdown) {
      navigator.clipboard.writeText(explanationData.explanation_markdown)
        .then(() => {
          toast({
            title: "Copied!",
            description: "Explanation (Markdown) copied to clipboard.",
          });
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          toast({
            title: "Error",
            description: "Failed to copy explanation.",
            variant: "destructive",
          });
        });
    }
  };

   // Placeholder function for "Learn More"
  const handleLearnMore = () => {
    toast({
      title: "Learn More",
      description: "Educational content feature coming soon!",
    });
  };

  // Placeholder function for "Explain Another"
  const handleExplainAnother = () => {
     toast({
      title: "Explain Another",
      description: "Functionality to explain another block or refine explanation coming soon!",
    });
     // Consider calling onClear() or similar to reset the state for new input
     onClear(); // Example: Clear the view for a new explanation cycle
  };


  const renderContent = () => {
    // ⚙️ 2. Code Analysis in Steps (Loading State)
    if (isLoading) {
      return (
        <div className="space-y-4 p-4 border border-dashed border-muted rounded-md">
           <div className="flex items-center space-x-2 text-muted-foreground">
             <Brain className="h-5 w-5 animate-pulse" />
             <span>AI Agent is thinking...</span>
           </div>
          <Skeleton className="h-6 w-1/4" /> {/* Language placeholder */}
          <Skeleton className="h-5 w-3/4" /> {/* Header placeholder */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
           <Skeleton className="h-5 w-2/4" /> {/* Summary placeholder */}
          <Skeleton className="h-4 w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Agent Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!explanationData) {
      return (
        <div className="text-muted-foreground text-center py-10 border border-dashed border-muted rounded-md flex flex-col items-center justify-center h-full">
          <Info className="mx-auto h-10 w-10 mb-4 text-primary" />
          <p className="text-lg font-medium mb-2">Awaiting Analysis</p>
          <p className="text-sm">Enter code on the left and click "Explain Code" <br/> to see the AI agent's analysis here.</p>
        </div>
      );
    }

    // 📋 3. Readable Code Explanation & 4. Warnings
    return (
      <>
        {/* Display Detected Language */}
        {explanationData.language && explanationData.language !== "Unknown" && (
          <div className="mb-4">
            <Badge variant="secondary">Detected Language: {explanationData.language}</Badge>
          </div>
        )}

         {/* ⚠️ 4. Agent Warnings & Suggestions */}
        {explanationData.warnings && explanationData.warnings.length > 0 && (
          <Alert variant="destructive" className="mb-6 shadow-sm">
             <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Agent Warnings & Suggestions</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {explanationData.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* 📋 3. Readable Code Explanation (Rendered Markdown) */}
        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-code:text-accent prose-a:text-primary">
           <ReactMarkdown>{explanationData.explanation_markdown}</ReactMarkdown>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-4 mb-4">
         {renderContent()}
      </ScrollArea>

       {/* Action Buttons */}
      {explanationData && !isLoading && !error && (
         <div className="flex flex-wrap gap-2 justify-end items-center mt-auto pt-4 border-t">
            {/* 🧠 5. Knowledge Enhancer */}
             <Button onClick={handleLearnMore} variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                <BookOpen className="mr-2 h-4 w-4" /> Learn More
             </Button>
             {/* 🧮 6. Explain Another Block? */}
              <Button onClick={handleExplainAnother} variant="outline" size="sm" className="text-foreground border-border hover:bg-accent/50">
                <RefreshCw className="mr-2 h-4 w-4" /> Explain Another
             </Button>
             {/* Copy Button */}
            <Button onClick={handleCopy} variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                <Copy className="mr-2 h-4 w-4" /> Copy Explanation
            </Button>
         </div>
      )}
    </div>
  );
}
