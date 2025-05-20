
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Info, Brain, BookOpen, ExternalLink, Copy, AlertTriangle, CheckCircle, Lightbulb, Wrench, ShieldCheck, ListChecks, Search } from 'lucide-react';
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
  analysisResult: string | null;
  isLoading: boolean;
  error: string | null;
}

interface LearnMoreLink {
  title: string;
  url: string;
}

interface ParsedSection {
  title: string;
  icon: React.ElementType;
  content: string | string[] | Array<{ bug?: string; fix_suggestion?: string; description?: string; code?: string; error?: string, line_number?: number }>;
  isList?: boolean;
  isBugList?: boolean;
  isAlternativeList?: boolean;
  isSyntaxErrorList?: boolean;
}

// Helper function to sanitize and render content that might contain HTML-like structures
const renderSanitizedHTML = (content: string) => {
  // Basic sanitization: replace < and > to prevent simple HTML injection
  // In a real app, use a proper sanitization library if content can be more complex
  const sanitizedContent = content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent.replace(/\n/g, '<br />') }} />;
};


export function CodeExplanationDisplay({
  analysisResult,
  isLoading,
  error,
}: CodeExplanationDisplayProps) {
  const { toast } = useToast();
  const [isLearnMoreDialogOpen, setIsLearnMoreDialogOpen] = useState(false);
  const [learnMoreLinksForDialog, setLearnMoreLinksForDialog] = useState<LearnMoreLink[]>([]);

  const parseAnalysis = (markdown: string | null): ParsedSection[] => {
    if (!markdown) return [];

    const sections: ParsedSection[] = [];

    const sectionMappings = [
      { title: "Detected Language", key: "Detected Language", icon: Info, isScalar: true },
      { title: "Comprehensive Analysis", key: "Comprehensive Analysis", icon: Brain, isScalar: true, isPreformatted: true },
      { title: "Style & Formatting Suggestions", key: "Style & Formatting Suggestions", icon: ListChecks, isList: true },
      { title: "Code Smell Detection", key: "Code Smell Detection", icon: AlertTriangle, isList: true },
      { title: "Security Vulnerability Checks", key: "Security Vulnerability Checks", icon: ShieldCheck, isList: true },
      { title: "Potential Bug Identification & Fix Suggestions", key: "Potential Bug Identification & Fix Suggestions", icon: Wrench, isBugList: true },
      { title: "Alternative Code Approaches", key: "Alternative Code Approaches", icon: Lightbulb, isAlternativeList: true },
      { title: "General Warnings & Suggestions", key: "General Warnings & Suggestions", icon: AlertTriangle, isList: true },
      { title: "Learn More Links", key: "Learn More Links", icon: Search, isList: true, isLearnMore: true },
      { title: "Syntax Errors", key: "Syntax Errors", icon: AlertTriangle, isSyntaxErrorList: true },
    ];

    let remainingMarkdown = markdown;

    for (const mapping of sectionMappings) {
      // Regex to find a section: **Section Title**: (content until next section title or end of string)
      // It looks for bolded titles followed by a colon.
      const sectionRegex = new RegExp(`\\*\\*${mapping.key}\\*\\*:\\s*([\\s\\S]*?)(?=\\n\\n\\*\\*|$)`, 'i');
      const match = remainingMarkdown.match(sectionRegex);

      if (match && match[1]) {
        let content = match[1].trim();
        
        if (mapping.isScalar) {
          sections.push({ title: mapping.title, icon: mapping.icon, content });
        } else if (mapping.isList) {
          const items = content.split('\n').map(item => item.replace(/^-\s*/, '').trim()).filter(item => item);
          sections.push({ title: mapping.title, icon: mapping.icon, content: items, isList: true });
          if (mapping.isLearnMore && items.length > 0) {
            const extractedLinks: LearnMoreLink[] = items.map(query => ({
              title: query,
              url: `https://www.google.com/search?q=${encodeURIComponent(query)}`
            })).slice(0, 10); // Limit to 10 links
            setLearnMoreLinksForDialog(extractedLinks);
          }
        } else if (mapping.isBugList || mapping.isAlternativeList || mapping.isSyntaxErrorList) {
          try {
            // Attempt to parse as JSON if it looks like a JSON array string
            if (content.startsWith('[') && content.endsWith(']')) {
              const parsedArray = JSON.parse(content);
              if (Array.isArray(parsedArray)) {
                sections.push({ 
                  title: mapping.title, 
                  icon: mapping.icon, 
                  content: parsedArray, 
                  isBugList: mapping.isBugList, 
                  isAlternativeList: mapping.isAlternativeList,
                  isSyntaxErrorList: mapping.isSyntaxErrorList
                });
              } else {
                 // Fallback for non-array JSON or malformed
                 sections.push({ title: mapping.title, icon: mapping.icon, content: [content], isList: true });
              }
            } else {
              // If not JSON, treat as a list of strings (fallback)
              const items = content.split('\n').map(item => item.replace(/^-\s*/, '').trim()).filter(item => item);
              sections.push({ title: mapping.title, icon: mapping.icon, content: items, isList: true });
            }
          } catch (e) {
            // If JSON parsing fails, treat as a list of strings
            console.warn(`Failed to parse JSON for ${mapping.title}, treating as list:`, content, e);
            const items = content.split('\n').map(item => item.replace(/^-\s*/, '').trim()).filter(item => item);
            sections.push({ title: mapping.title, icon: mapping.icon, content: items, isList: true });
          }
        }
        // Remove the matched section from remainingMarkdown to avoid re-matching
        // This might be tricky if titles are substrings of each other. A more robust parser would be better.
        // For now, let's assume titles are distinct enough or process in order.
        // remainingMarkdown = remainingMarkdown.replace(sectionRegex, '').trim(); // This can be problematic
      }
    }
    // A simple fallback if no sections were parsed, show the raw content.
    if (sections.length === 0 && markdown.trim().length > 0) {
        sections.push({ title: "Raw Analysis", icon: Info, content: markdown, isScalar: true, isPreformatted: true });
    }

    return sections;
  };


  const parsedSections = useMemo(() => parseAnalysis(analysisResult), [analysisResult]);

  const handleCopyAnalysis = () => {
    if (analysisResult) {
      navigator.clipboard.writeText(analysisResult)
        .then(() => toast({ title: "Copied!", description: "Full analysis markdown copied to clipboard." }))
        .catch(err => {
          console.error("Failed to copy analysis: ", err);
          toast({ title: "Error", description: "Failed to copy analysis.", variant: "destructive" });
        });
    }
  };

  const handleLearnMoreClick = () => {
    if (learnMoreLinksForDialog.length > 0) {
      setIsLearnMoreDialogOpen(true);
      toast({ title: "Learn More", description: `Showing learning resources related to the code.` });
    } else {
      toast({ title: "Learn More", description: "No specific learning links were found in the analysis.", variant: "default" });
      // Optionally, provide some default links or a message.
      setLearnMoreLinksForDialog([
        { title: "General Programming Concepts", url: "https://www.google.com/search?q=programming+concepts+tutorial" },
        { title: "Software Design Principles", url: "https://www.google.com/search?q=software+design+principles" },
      ]);
      setIsLearnMoreDialogOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-1">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-1">
        <Info className="h-4 w-4" />
        <AlertTitle>Analysis Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analysisResult || parsedSections.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-10 border border-dashed border-muted rounded-md flex flex-col items-center justify-center h-full m-1">
        <Info className="mx-auto h-10 w-10 mb-4 text-primary" />
        <p className="text-lg font-medium mb-2">Awaiting Analysis</p>
        <p className="text-sm">Enter code on the left and click "Explain Code".</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-2 mb-4">
        <div className="space-y-3">
          {parsedSections.map((section, index) => (
            <Card key={index} className="shadow-sm">
              <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-base font-semibold flex items-center">
                  <section.icon className="mr-2 h-5 w-5 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm">
                {section.isList && Array.isArray(section.content) ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {section.content.map((item, idx) => (
                      <li key={idx}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                    ))}
                  </ul>
                ) : section.isBugList && Array.isArray(section.content) ? (
                  <ul className="space-y-2">
                    {section.content.map((item, idx) => (
                      typeof item === 'object' && item !== null && ('bug' in item || 'fix_suggestion' in item) ? (
                        <li key={idx} className="p-2 border rounded-md bg-muted/30">
                          {item.bug && <p><strong>Bug:</strong> {item.bug}</p>}
                          {item.fix_suggestion && <p><strong>Fix:</strong> <code className="text-xs bg-gray-200 dark:bg-gray-700 p-1 rounded">{item.fix_suggestion}</code></p>}
                        </li>
                      ) : <li key={idx}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                    ))}
                  </ul>
                ) : section.isAlternativeList && Array.isArray(section.content) ? (
                   <ul className="space-y-2">
                    {section.content.map((item, idx) => (
                       typeof item === 'object' && item !== null && ('description' in item || 'code' in item) ? (
                        <li key={idx} className="p-2 border rounded-md bg-muted/30">
                          {item.description && <p>{item.description}</p>}
                          {item.code && <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto"><code>{item.code}</code></pre>}
                        </li>
                      ) : <li key={idx}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                    ))}
                  </ul>
                ) : section.isSyntaxErrorList && Array.isArray(section.content) ? (
                    <ul className="space-y-2">
                      {section.content.map((item, idx) => (
                        typeof item === 'object' && item !== null && ('error' in item) ? (
                          <li key={idx} className="p-2 border border-destructive/50 rounded-md bg-destructive/10">
                            <p><strong>Error:</strong> {item.error}</p>
                            {item.line_number && <p className="text-xs"><strong>Line:</strong> {item.line_number}</p>}
                          </li>
                        ) : <li key={idx}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                      ))}
                    </ul>
                ) : typeof section.content === 'string' ? (
                  (section.title === "Comprehensive Analysis" || (section as any).isPreformatted) ? (
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{section.content.replace(/###\s*/g, '\n').trim()}</pre>
                  ) : (
                     <p className="leading-relaxed">{section.content}</p>
                  )
                ) : (
                  <p className="leading-relaxed">{JSON.stringify(section.content)}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <CardFooter className="flex flex-wrap gap-2 justify-end items-center mt-auto pt-4 border-t px-1 py-3">
        <Button onClick={handleLearnMoreClick} variant="ghost" size="sm" className="text-primary hover:bg-primary/10" disabled={isLoading || learnMoreLinksForDialog.length === 0}>
          <BookOpen className="mr-1.5 h-4 w-4" /> Learn More
        </Button>
        <Button
          onClick={handleCopyAnalysis}
          variant="outline" size="sm"
          className="border-primary text-primary hover:bg-primary/10"
          disabled={!analysisResult || isLoading}
        >
          <Copy className="mr-1.5 h-4 w-4" /> Copy Analysis
        </Button>
      </CardFooter>

      <Dialog open={isLearnMoreDialogOpen} onOpenChange={setIsLearnMoreDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Learn More
            </DialogTitle>
            <DialogDescription>
              Explore these resources to deepen your understanding of concepts related to the analyzed code.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-6">
            <div className="grid gap-3 py-4">
              {learnMoreLinksForDialog.length > 0 ? (
                learnMoreLinksForDialog.map((link, index) => (
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

    