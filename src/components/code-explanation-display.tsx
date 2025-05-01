'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, AlertTriangle, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { CodeExplanation } from '@/services/github'; // Updated import path

interface CodeExplanationDisplayProps {
  explanation: CodeExplanation | null;
  isLoading: boolean;
  error: string | null;
}

export function CodeExplanationDisplay({ explanation, isLoading, error }: CodeExplanationDisplayProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    if (explanation?.explanation) {
      navigator.clipboard.writeText(explanation.explanation)
        .then(() => {
          toast({
            title: "Copied!",
            description: "Explanation copied to clipboard.",
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!explanation) {
      return (
        <div className="text-muted-foreground text-center py-10">
          <Info className="mx-auto h-10 w-10 mb-2" />
          Enter some code on the left and click "Explain Code" to see the explanation here.
        </div>
      );
    }

    return (
      <>
        {explanation.warnings && explanation.warnings.length > 0 && (
          <Alert variant="destructive" className="mb-4">
             <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warnings</AlertTitle>
            <AlertDescription>
              <ul>
                {explanation.warnings.map((warning, index) => (
                  <li key={index} className="ml-4 list-disc">{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{explanation.explanation}</p>
      </>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-4 mb-4">
        <div className="prose prose-sm max-w-none text-foreground">
           {renderContent()}
        </div>
      </ScrollArea>
      {explanation && !isLoading && !error && (
         <Button onClick={handleCopy} variant="outline" size="sm" className="self-end mt-auto border-primary text-primary hover:bg-primary/10">
          <Copy className="mr-2 h-4 w-4" />
          Copy Explanation
        </Button>
      )}
    </div>
  );
}
