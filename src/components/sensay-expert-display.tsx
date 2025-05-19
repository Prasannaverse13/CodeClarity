
'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquareHeart, AlertTriangle, Info } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

interface SensayExpertDisplayProps {
  expertAnswer: string | null;
  isLoading: boolean;
  error: string | null;
}

export function SensayExpertDisplay({ expertAnswer, isLoading, error }: SensayExpertDisplayProps) {
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquareHeart className="h-5 w-5 text-purple-500 animate-pulse" /> Mentor is Thinking...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Sensay Mentor Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!expertAnswer && !isLoading && !error) {
    // Don't show anything if there's no interaction yet,
    // The parent component (page.tsx) will handle the initial "no data" state.
    return null; 
  }
  
  if (expertAnswer) {
    return (
      <Card className="shadow-md border-purple-500/50">
        <CardContent className="pt-6"> {/* Add padding top if no header */}
           <div className={cn(
              "prose prose-sm max-w-none dark:prose-invert",
              "prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-li:text-foreground",
              "prose-code:text-accent prose-code:bg-accent/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
              "dark:prose-code:text-accent-foreground dark:prose-code:bg-accent/20",
              "prose-pre:bg-secondary prose-pre:text-secondary-foreground prose-pre:p-3 prose-pre:rounded-md prose-pre:overflow-x-auto",
              "prose-a:text-primary hover:prose-a:underline"
            )}>
            <ReactMarkdown>{expertAnswer}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null; // Fallback, should be handled by page.tsx initial state
}
