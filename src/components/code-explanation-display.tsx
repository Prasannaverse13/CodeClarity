'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, AlertTriangle, Info, Brain, RefreshCw, BookOpen, Lightbulb, Bug, ShieldAlert, DraftingCompass, GitCompareArrows, Terminal, ExternalLink, Sparkles, Palette, SearchCheck, TestTubeDiagonal, FileWarning } from 'lucide-react';
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
import type { ExplainCodeOutput as CodeExplanation } from '@/ai/flows/explain-code';
import { cn } from '@/lib/utils';

export interface SensayInsight {
  text: string;
  rawResponse?: any;
}

interface CodeExplanationDisplayProps {
  explanationData: CodeExplanation | null;
  isLoading: boolean;
  error: string | null;
  onClear: () => void;
  sensayInsight: SensayInsight | null;
  isSensayLoading: boolean;
  sensayError: string | null;
  onGetSensayInsight: () => void;
  hasCode: boolean;
}

interface LearnMoreLink {
  title: string;
  url: string;
}

export function CodeExplanationDisplay({
  explanationData,
  isLoading,
  error,
  onClear,
  sensayInsight,
  isSensayLoading,
  sensayError,
  onGetSensayInsight,
  hasCode,
}: CodeExplanationDisplayProps) {
  const { toast } = useToast();
  const [isLearnMoreDialogOpen, setIsLearnMoreDialogOpen] = useState(false);
  const [learnMoreLinks, setLearnMoreLinks] = useState<LearnMoreLink[]>([]);

  const handleCopy = (textToCopy: string, type: string) => {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          toast({
            title: "Copied!",
            description: `${type} copied to clipboard.`,
          });
        })
        .catch(err => {
          console.error(`Failed to copy ${type}: `, err);
          toast({
            title: "Error",
            description: `Failed to copy ${type}.`,
            variant: "destructive",
          });
        });
    }
  };

  const handleLearnMore = () => {
    const language = explanationData?.language;
    if (language && language !== "Unknown") {
        const concepts = [
            "Basics", "Syntax", "Functions", "Control Flow (if/else, loops)",
            "Data Structures (arrays, objects/maps)", "Error Handling",
            "Asynchronous Programming", "Classes and Objects", "Modules/Imports", "Best Practices"
        ];
        const generatedLinks: LearnMoreLink[] = concepts.slice(0, 10).map(concept => ({
            title: `${language}: ${concept}`,
            url: `https://www.google.com/search?q=${encodeURIComponent(`${language} ${concept} tutorial`)}`
        }));
        setLearnMoreLinks(generatedLinks);
        setIsLearnMoreDialogOpen(true);
        toast({ title: "Learn More", description: `Showing learning resources for ${language}.` });
    } else {
       setLearnMoreLinks([
        { title: "General Programming Concepts", url: "https://www.google.com/search?q=programming+concepts+tutorial" },
        { title: "Introduction to Algorithms", url: "https://www.google.com/search?q=introduction+to+algorithms" },
        { title: "Data Structures Explained", url: "https://www.google.com/search?q=data+structures+explained" }
       ]);
       setIsLearnMoreDialogOpen(true);
       toast({ title: "Learn More", description: "Language not detected. Showing general programming resources.", variant: "default" });
    }
  };

  const handleExplainAnother = () => { onClear(); toast({ title: "Explain Another", description: "Ready for new input!" }); };

  const renderCardSection = <T,>(
    title: string,
    icon: React.ReactNode,
    data: T[] | undefined | null,
    renderItem: (item: T, index: number) => React.ReactNode,
    sectionKey: string
  ) => {
    if (!data || data.length === 0) return null;

    return (
      <Card key={sectionKey} className="mb-4 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon} {title} <Badge variant="outline" className="ml-2">{data.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-none space-y-3 text-sm">
            {data.map(renderItem)}
          </ul>
        </CardContent>
      </Card>
    );
  };


  const renderSensayContent = () => {
    if (isSensayLoading) {
      return (
        <Card className="mt-6 border-purple-500/50 shadow-md">
           <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-purple-600 dark:text-purple-400">
              <Sparkles className="h-5 w-5 animate-pulse" /> Sensay Wisdom Engine Processing...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 p-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </CardContent>
        </Card>
      );
    }
    if (sensayError) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Sensay Error</AlertTitle>
          <AlertDescription>{sensayError}</AlertDescription>
        </Alert>
      );
    }
    if (sensayInsight) {
      return (
        <Card className="mt-6 border-purple-500/50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-purple-600 dark:text-purple-400">
              <Sparkles className="h-5 w-5" /> Sensay Wisdom Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-secondary text-secondary-foreground p-4 rounded-lg shadow-inner">
               <div className={cn(
                  "prose prose-sm max-w-none dark:prose-invert",
                  "prose-headings:text-secondary-foreground prose-p:text-secondary-foreground prose-strong:text-secondary-foreground prose-ul:text-secondary-foreground prose-li:text-secondary-foreground",
                  "dark:prose-headings:text-secondary-foreground dark:prose-p:text-secondary-foreground dark:prose-strong:text-secondary-foreground dark:prose-ul:text-secondary-foreground dark:prose-li:text-secondary-foreground",
                  "prose-code:text-accent prose-code:bg-accent/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
                  "dark:prose-code:text-accent-foreground dark:prose-code:bg-accent/20",
                  "prose-pre:bg-background prose-pre:text-foreground prose-pre:p-3 prose-pre:rounded-md prose-pre:overflow-x-auto",
                  "dark:prose-pre:bg-popover dark:prose-pre:text-popover-foreground",
                  "prose-a:text-primary hover:prose-a:underline"
               )}>
                <ReactMarkdown>{sensayInsight.text}</ReactMarkdown>
              </div>
            </div>
            <Button onClick={() => handleCopy(sensayInsight.text, "Sensay Insight")} variant="ghost" size="sm" className="mt-2 text-xs text-muted-foreground hover:text-primary">
              <Copy className="mr-1.5 h-3 w-3" /> Copy Sensay Insight
            </Button>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  const renderContent = () => {
    if (isLoading && !explanationData) {
      return (
        <div className="space-y-4 p-4 border border-dashed border-muted rounded-md">
           <div className="flex items-center space-x-2 text-muted-foreground">
             <Brain className="h-5 w-5 animate-pulse" />
             <span>AI Agent (Gemini) is analyzing...</span>
           </div>
           <Skeleton className="h-5 w-1/4" />
           <Skeleton className="h-6 w-3/4 mt-4" />
           <Skeleton className="h-4 w-full" />
           <Skeleton className="h-4 w-5/6" />
           <Skeleton className="h-6 w-1/2 mt-4" />
           <Skeleton className="h-4 w-full" />
           <Skeleton className="h-5 w-1/3 mt-4" />
           <Skeleton className="h-5 w-1/3 mt-2" />
        </div>
      );
    }

    if (error && !explanationData) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Agent Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!explanationData && !isLoading && !error && !isSensayLoading && !sensayInsight) {
      return (
        <div className="text-muted-foreground text-center py-10 border border-dashed border-muted rounded-md flex flex-col items-center justify-center h-full">
          <Info className="mx-auto h-10 w-10 mb-4 text-primary" />
          <p className="text-lg font-medium mb-2">Awaiting Analysis</p>
          <p className="text-sm">Enter code on the left and click "Explain Code".</p>
        </div>
      );
    }
    
    const geminiExplanationContent = explanationData && (
      <div className="space-y-6">
        {explanationData.language && (
          <div className="mb-4">
            <Badge variant="secondary" className="text-sm px-3 py-1 shadow">
               <Terminal className="mr-1.5 h-3.5 w-3.5"/> Language: {explanationData.language}
            </Badge>
          </div>
        )}

        {/* Comprehensive Analysis (Main Explanation) */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-green-500"/> Comprehensive Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="bg-secondary text-secondary-foreground p-4 rounded-lg shadow-inner">
                <div className={cn(
                    "prose prose-sm max-w-none dark:prose-invert",
                    "prose-headings:text-secondary-foreground prose-p:text-secondary-foreground prose-strong:text-secondary-foreground prose-ul:text-secondary-foreground prose-li:text-secondary-foreground",
                    "dark:prose-headings:text-secondary-foreground dark:prose-p:text-secondary-foreground dark:prose-strong:text-secondary-foreground dark:prose-ul:text-secondary-foreground dark:prose-li:text-secondary-foreground",
                    "prose-code:text-accent prose-code:bg-accent/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
                    "dark:prose-code:text-accent-foreground dark:prose-code:bg-accent/20",
                    "prose-pre:bg-background prose-pre:text-foreground prose-pre:p-3 prose-pre:rounded-md prose-pre:overflow-x-auto",
                    "dark:prose-pre:bg-popover dark:prose-pre:text-popover-foreground",
                    "prose-a:text-primary hover:prose-a:underline"
                 )}>
                    <ReactMarkdown>{explanationData.explanation_markdown}</ReactMarkdown>
                </div>
            </div>
             <Button onClick={() => handleCopy(explanationData.explanation_markdown, "Comprehensive Analysis")} variant="ghost" size="sm" className="mt-2 text-xs text-muted-foreground hover:text-primary">
                <Copy className="mr-1.5 h-3 w-3" /> Copy Analysis
             </Button>
          </CardContent>
        </Card>

        {/* Style & Formatting Suggestions */}
        {renderCardSection("Style & Formatting Suggestions", <Palette className="h-5 w-5 text-blue-500 dark:text-blue-400" />, explanationData.style_suggestions, (suggestion, index) => (
          <li key={`style-${index}`} className="border-l-2 border-blue-500 dark:border-blue-400 pl-3 py-1.5 bg-blue-500/5 dark:bg-blue-400/10 rounded-r-md">{suggestion}</li>
        ), "style-suggestions")}

        {/* Code Smell Detection */}
        {renderCardSection("Code Smell Detection", <SearchCheck className="h-5 w-5 text-orange-500 dark:text-orange-400" />, explanationData.code_smells, (smell, index) => (
          <li key={`smell-${index}`} className="border-l-2 border-orange-500 dark:border-orange-400 pl-3 py-1.5 bg-orange-500/5 dark:bg-orange-400/10 rounded-r-md">{smell}</li>
        ), "code-smells")}

        {/* Security Vulnerability Checks */}
        {renderCardSection("Security Vulnerability Checks", <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-500" />, explanationData.security_vulnerabilities, (vuln, index) => (
          <li key={`sec-${index}`} className="border-l-2 border-red-600 dark:border-red-500 pl-3 py-1.5 bg-red-600/5 dark:bg-red-500/10 rounded-r-md">{vuln}</li>
        ), "security-vulnerabilities")}

        {/* Potential Bug Identification & Fix Suggestions */}
        {renderCardSection("Potential Bug Identification & Fix Suggestions", <Bug className="h-5 w-5 text-pink-500 dark:text-pink-400" />, explanationData.bug_suggestions, (bug, index) => (
          <li key={`bug-${index}`} className="border-l-2 border-pink-500 dark:border-pink-400 pl-3 py-2 bg-pink-500/5 dark:bg-pink-400/10 rounded-r-md">
             <p><strong>Potential Bug:</strong> {bug.bug}</p>
             <p className="mt-1"><strong>Fix Suggestion:</strong> {bug.fix_suggestion}</p>
          </li>
        ), "bug-suggestions")}
        
        {/* Alternative Code Approaches */}
        {renderCardSection("Alternative Code Approaches", <GitCompareArrows className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />, explanationData.alternative_suggestions, (alt, index) => (
          <li key={`alt-${index}`} className="border-l-2 border-indigo-500 dark:border-indigo-400 pl-3 py-2 bg-indigo-500/5 dark:bg-indigo-400/10 rounded-r-md">
            <p className="mb-1"><strong>Alternative:</strong> {alt.description}</p>
            <div className="mt-1">
              <pre className="bg-muted/70 dark:bg-muted p-2 rounded text-xs font-mono overflow-x-auto relative group/alt-code">
                <code>{alt.code}</code>
                <Button
                   onClick={() => handleCopy(alt.code, `Alternative code ${index + 1}`)}
                   variant="ghost" size="icon"
                   className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover/alt-code:opacity-100 transition-opacity"
                   aria-label="Copy alternative code"
                > <Copy className="h-3.5 w-3.5" /> </Button>
              </pre>
            </div>
          </li>
        ), "alternative-suggestions")}

        {/* General Warnings & Suggestions */}
        {renderCardSection("General Warnings & Suggestions", <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />, explanationData.warnings, (warning, index) => (
          <li key={`warn-${index}`} className="border-l-2 border-yellow-500 dark:border-yellow-400 pl-3 py-1.5 bg-yellow-500/5 dark:bg-yellow-400/10 rounded-r-md">{warning}</li>
        ), "warnings")}

        {/* Syntax Errors */}
        {renderCardSection("Syntax Errors", <FileWarning className="h-5 w-5 text-destructive" />, explanationData.syntax_errors, (err, index) => (
            <li key={`syntax-${index}`} className="border-l-2 border-destructive pl-3 py-1.5 bg-destructive/5 dark:bg-destructive/10 rounded-r-md">
                <p>{err.error} {err.line_number && `(around line ${err.line_number})`}</p>
            </li>
        ), "syntax-errors")}

      </div>
    );

    return (
      <>
        {geminiExplanationContent}
        {renderSensayContent()}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-4 mb-4">
         {renderContent()}
      </ScrollArea>

      <div className="flex flex-wrap gap-2 justify-end items-center mt-auto pt-4 border-t">
            <Button onClick={handleLearnMore} variant="ghost" size="sm" className="text-primary hover:bg-primary/10" disabled={isLoading || !explanationData?.language}>
                <BookOpen className="mr-1.5 h-4 w-4" /> Learn More
            </Button>
            <Button onClick={onGetSensayInsight} variant="outline" size="sm" className="text-purple-600 border-purple-500 hover:bg-purple-500/10 dark:text-purple-400 dark:border-purple-400" disabled={isSensayLoading || isLoading || !hasCode}>
                {isSensayLoading ? <Brain className="mr-1.5 h-4 w-4 animate-pulse" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
                {isSensayLoading ? "Sensay Thinking..." : "Get Sensay Wisdom"}
            </Button>
            <Button onClick={handleExplainAnother} variant="outline" size="sm" className="text-foreground border-border hover:bg-accent/50">
                <RefreshCw className="mr-1.5 h-4 w-4" /> Explain Another
            </Button>
            <Button
                onClick={() => handleCopy(explanationData?.explanation_markdown || '', "Explanation")}
                variant="outline" size="sm"
                className="border-primary text-primary hover:bg-primary/10"
                disabled={!explanationData?.explanation_markdown || isLoading}
            >
                <Copy className="mr-1.5 h-4 w-4" /> Copy Explanation
            </Button>
         </div>

         <Dialog open={isLearnMoreDialogOpen} onOpenChange={setIsLearnMoreDialogOpen}>
           <DialogContent className="sm:max-w-[525px]">
             <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> Learn More: {explanationData?.language || 'Code Concepts'}
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
                    <p className="text-muted-foreground text-center">Feature under development. Educational content related to the code concepts will be shown here.</p>
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

