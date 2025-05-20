
'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Info, Brain, RefreshCw, BookOpen, ExternalLink, Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

interface CodeExplanationDisplayProps {
  analysisResult: string | null; // Now expects a single markdown string
  isLoading: boolean;
  error: string | null;
}

interface LearnMoreLink {
  title: string;
  url: string;
}

export function CodeExplanationDisplay({
  analysisResult,
  isLoading,
  error,
}: CodeExplanationDisplayProps) {
  const { toast } = useToast();
  const [isLearnMoreDialogOpen, setIsLearnMoreDialogOpen] = useState(false);
  const [learnMoreLinks, setLearnMoreLinks] = useState<LearnMoreLink[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  useEffect(() => {
    if (analysisResult) {
      // Try to extract language from the markdown
      const langMatch = analysisResult.match(/\*\*Detected Language\*\*:\s*([^\n]+)/i);
      if (langMatch && langMatch[1] && langMatch[1].toLowerCase() !== "could not reliably detect language") {
        setDetectedLanguage(langMatch[1].trim());
      } else {
        setDetectedLanguage(null);
      }

      // Try to extract "Learn More Links" from the markdown
      const learnMoreSectionMatch = analysisResult.match(/\*\*Learn More Links\*\*:\s*([\s\S]+)/i);
      if (learnMoreSectionMatch && learnMoreSectionMatch[1]) {
        const linksText = learnMoreSectionMatch[1];
        const linkMatches = Array.from(linksText.matchAll(/-\s*([^\n]+)/g));
        const extractedLinks: LearnMoreLink[] = linkMatches.map(match => {
          const query = match[1].trim();
          return {
            title: query,
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}`
          };
        }).slice(0, 5); // Limit to 5 links
        setLearnMoreLinks(extractedLinks);
      } else {
        setLearnMoreLinks([]);
      }
    } else {
      setDetectedLanguage(null);
      setLearnMoreLinks([]);
    }
  }, [analysisResult]);


  const handleCopy = (textToCopy: string | null, type: string) => {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => toast({ title: "Copied!", description: `${type} copied to clipboard.` }))
        .catch(err => {
          console.error(`Failed to copy ${type}: `, err);
          toast({ title: "Error", description: `Failed to copy ${type}.`, variant: "destructive" });
        });
    }
  };

  const handleLearnMore = () => {
    if (learnMoreLinks.length > 0) {
        setIsLearnMoreDialogOpen(true);
        toast({ title: "Learn More", description: `Showing learning resources related to the code.` });
    } else if (detectedLanguage) {
        // Fallback if specific links weren't extracted but language was
        const concepts = ["Basics", "Syntax", "Best Practices"];
        const generatedLinks: LearnMoreLink[] = concepts.map(concept => ({
            title: `${detectedLanguage}: ${concept}`,
            url: `https://www.google.com/search?q=${encodeURIComponent(`${detectedLanguage} ${concept} tutorial`)}`
        }));
        setLearnMoreLinks(generatedLinks);
        setIsLearnMoreDialogOpen(true);
        toast({ title: "Learn More", description: `Showing general learning resources for ${detectedLanguage}.` });
    } else {
       setLearnMoreLinks([
        { title: "General Programming Concepts", url: "https://www.google.com/search?q=programming+concepts+tutorial" },
       ]);
       setIsLearnMoreDialogOpen(true);
       toast({ title: "Learn More", description: "Language not detected. Showing general programming resources."});
    }
  };


  if (isLoading) {
    return (
      <div className="space-y-4 p-4 border border-dashed border-muted rounded-md">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Brain className="h-5 w-5 animate-pulse" />
          <span>AI Agent is analyzing...</span>
        </div>
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-20 w-full mt-2" />
        <Skeleton className="h-10 w-3/4 mt-4" />
        <Skeleton className="h-16 w-full mt-2" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Analysis Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analysisResult) {
    return (
      <div className="text-muted-foreground text-center py-10 border border-dashed border-muted rounded-md flex flex-col items-center justify-center h-full">
        <Info className="mx-auto h-10 w-10 mb-4 text-primary" />
        <p className="text-lg font-medium mb-2">Awaiting Analysis</p>
        <p className="text-sm">Enter code on the left and click "Explain Code".</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-2 mb-4">
        <div className={cn(
          "prose prose-sm max-w-none dark:prose-invert",
          "prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-headings:border-b prose-headings:pb-1",
          "prose-p:leading-relaxed prose-p:my-2",
          "prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1 prose-ul:my-2",
          "prose-li:my-0.5",
          "prose-code:bg-muted/70 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-accent-foreground dark:prose-code:bg-muted dark:prose-code:text-accent-foreground",
          "prose-pre:bg-secondary prose-pre:text-secondary-foreground prose-pre:p-3 prose-pre:rounded-md prose-pre:overflow-x-auto prose-pre:my-3",
          "prose-pre:code:bg-transparent prose-pre:code:p-0 prose-pre:code:text-secondary-foreground",
          "prose-strong:font-semibold",
          "prose-a:text-primary hover:prose-a:underline"
        )}>
          <ReactMarkdown>{analysisResult}</ReactMarkdown>
        </div>
      </ScrollArea>

      <div className="flex flex-wrap gap-2 justify-end items-center mt-auto pt-4 border-t">
        <Button onClick={handleLearnMore} variant="ghost" size="sm" className="text-primary hover:bg-primary/10" disabled={isLoading || (!detectedLanguage && learnMoreLinks.length === 0) }>
          <BookOpen className="mr-1.5 h-4 w-4" /> Learn More
        </Button>
        <Button
          onClick={() => handleCopy(analysisResult, "Full Analysis")}
          variant="outline" size="sm"
          className="border-primary text-primary hover:bg-primary/10"
          disabled={!analysisResult || isLoading}
        >
          <Copy className="mr-1.5 h-4 w-4" /> Copy Analysis
        </Button>
      </div>

      <Dialog open={isLearnMoreDialogOpen} onOpenChange={setIsLearnMoreDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Learn More: {detectedLanguage || 'Code Concepts'}
            </DialogTitle>
            <DialogDescription>
              Explore these resources to deepen your understanding of concepts related to the analyzed code.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-6">
            <div className="grid gap-3 py-4">
              {learnMoreLinks.length > 0 ? (
                learnMoreLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-md border hover:bg-accent hover:text-accent-foreground transition-colors text-sm group"
                  >
                    <span className="font-medium">{link.title}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                  </a>
                ))
              ) : (
                <p className="text-muted-foreground text-center">No specific learning links were generated for this code. Try a general search or ask the mentor for resources.</p>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary"> Close </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
