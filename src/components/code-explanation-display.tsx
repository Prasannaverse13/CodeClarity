
'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, AlertTriangle, Info, Brain, RefreshCw, BookOpen, Lightbulb, Bug, ShieldAlert, DraftingCompass, GitCompareArrows, Terminal, ExternalLink } from 'lucide-react';
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
import type { CodeExplanation } from '@/services/github';
import { cn } from '@/lib/utils'; // Import cn utility

interface CodeExplanationDisplayProps {
  explanationData: CodeExplanation | null;
  isLoading: boolean;
  error: string | null;
  onClear: () => void;
}

interface LearnMoreLink {
  title: string;
  url: string;
}

export function CodeExplanationDisplay({ explanationData, isLoading, error, onClear }: CodeExplanationDisplayProps) {
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

  // Updated Learn More button handler to generate links and open dialog
  const handleLearnMore = () => {
    const language = explanationData?.language;
    if (language && language !== "Unknown") {
        // Basic concepts to search for - could be enhanced by analyzing explanation content
        const concepts = [
            "Basics",
            "Syntax",
            "Functions",
            "Control Flow (if/else, loops)",
            "Data Structures (arrays, objects/maps)",
            "Error Handling",
            "Asynchronous Programming (if applicable)", // Add more relevant general concepts
            "Classes and Objects",
            "Modules/Imports",
            "Best Practices"
        ];

        const generatedLinks: LearnMoreLink[] = concepts.map(concept => {
            const searchTerm = `${language} ${concept} tutorial`;
            return {
                title: `${language}: ${concept}`,
                url: `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`
            };
        });

        setLearnMoreLinks(generatedLinks);
        setIsLearnMoreDialogOpen(true); // Open the dialog

        toast({
            title: "Learn More",
            description: `Showing learning resources for ${language}.`,
        });
    } else {
        toast({
            title: "Learn More",
            description: "Cannot determine the language to search for. Try analyzing a different snippet.",
            variant: "default"
        });
    }
   };

  const handleExplainAnother = () => { onClear(); toast({ title: "Explain Another", description: "Ready for new input!" }); };

  const renderSection = (title: string, icon: React.ReactNode, data: string[] | undefined | null, renderItem: (item: any, index: number) => React.ReactNode) => {
    if (!data || data.length === 0) return null;
    return (
      <AccordionItem value={title.toLowerCase().replace(/\s+/g, '-')}>
        <AccordionTrigger className="text-base font-semibold hover:no-underline">
          <div className="flex items-center gap-2">
            {icon} {title} <Badge variant="outline" className="ml-2">{data.length}</Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2 pb-4 pl-2 pr-2">
          <ul className="list-none space-y-2 text-sm">
            {data.map(renderItem)}
          </ul>
        </AccordionContent>
      </AccordionItem>
    );
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 p-4 border border-dashed border-muted rounded-md">
           <div className="flex items-center space-x-2 text-muted-foreground">
             <Brain className="h-5 w-5 animate-pulse" />
             <span>AI Agent is analyzing...</span>
           </div>
           <Skeleton className="h-5 w-1/4" /> {/* Language */}
           <Skeleton className="h-6 w-3/4 mt-4" /> {/* Main Explanation Title */}
           <Skeleton className="h-4 w-full" />
           <Skeleton className="h-4 w-5/6" />
           <Skeleton className="h-6 w-1/2 mt-4" /> {/* Summary Title */}
           <Skeleton className="h-4 w-full" />
           <Skeleton className="h-5 w-1/3 mt-4" /> {/* Accordion Title */}
           <Skeleton className="h-5 w-1/3 mt-2" /> {/* Accordion Title */}
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

    // Render the full analysis including new sections
    return (
      <div className="space-y-6">
         {/* Detected Language */}
        {explanationData.language && (
          <div>
            <Badge variant="secondary" className="text-sm">
               <Terminal className="mr-1.5 h-3.5 w-3.5"/> Language: {explanationData.language}
            </Badge>
          </div>
        )}

        {/* Main Explanation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5"/> Code Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Added dark background container for explanation */}
             <div className="bg-secondary text-secondary-foreground p-4 rounded-lg shadow-inner">
                <div className={cn(
                    "prose prose-sm max-w-none", // Base prose styles
                    "prose-headings:text-secondary-foreground prose-p:text-secondary-foreground prose-strong:text-secondary-foreground prose-ul:text-secondary-foreground prose-li:text-secondary-foreground", // Force text color
                    "prose-code:text-accent prose-code:bg-accent/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded", // Specific inline code styling for dark bg
                    "prose-pre:bg-background prose-pre:text-foreground prose-pre:p-3 prose-pre:rounded-md prose-pre:overflow-x-auto", // Code block styling for dark bg
                    "prose-a:text-primary hover:prose-a:underline" // Link styling
                 )}>
                    <ReactMarkdown>{explanationData.explanation_markdown}</ReactMarkdown>
                </div>
            </div>
             <Button onClick={() => handleCopy(explanationData.explanation_markdown, "Explanation")} variant="ghost" size="sm" className="mt-2 text-xs text-muted-foreground hover:text-primary">
                <Copy className="mr-1.5 h-3 w-3" /> Copy Explanation
             </Button>
          </CardContent>
        </Card>

        {/* Accordion for Suggestions and Analysis */}
        <Accordion type="multiple" collapsible className="w-full">
          {/* Warnings */}
          {renderSection("General Warnings & Suggestions", <AlertTriangle className="h-4 w-4 text-destructive" />, explanationData.warnings, (warning, index) => (
            <li key={`warn-${index}`} className="border-l-2 border-destructive pl-3 py-1">{warning}</li>
          ))}

          {/* Style Suggestions */}
           {renderSection("Style & Formatting", <DraftingCompass className="h-4 w-4 text-blue-500" />, explanationData.style_suggestions, (suggestion, index) => (
            <li key={`style-${index}`} className="border-l-2 border-blue-500 pl-3 py-1">{suggestion}</li>
          ))}

           {/* Code Smells */}
           {renderSection("Code Smells", <Bug className="h-4 w-4 text-yellow-600" />, explanationData.code_smells, (smell, index) => (
            <li key={`smell-${index}`} className="border-l-2 border-yellow-600 pl-3 py-1">{smell}</li>
          ))}

          {/* Security Vulnerabilities */}
           {renderSection("Security Check", <ShieldAlert className="h-4 w-4 text-red-600" />, explanationData.security_vulnerabilities, (vuln, index) => (
            <li key={`sec-${index}`} className="border-l-2 border-red-600 pl-3 py-1">{vuln}</li>
          ))}

          {/* Bug Suggestions */}
          {explanationData.bug_suggestions && explanationData.bug_suggestions.length > 0 && (
             <AccordionItem value="bug-suggestions">
               <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4 text-orange-500" /> Bug Analysis <Badge variant="outline" className="ml-2">{explanationData.bug_suggestions.length}</Badge>
                  </div>
               </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 pl-2 pr-2 space-y-3">
                 {explanationData.bug_suggestions.map((bug, index) => (
                    <div key={`bug-${index}`} className="border-l-2 border-orange-500 pl-3 py-1 text-sm">
                       <p><strong>Potential Bug:</strong> {bug.bug}</p>
                       <p className="mt-1"><strong>Suggestion:</strong> {bug.fix_suggestion}</p>
                    </div>
                 ))}
               </AccordionContent>
             </AccordionItem>
          )}

          {/* Alternative Suggestions */}
          {explanationData.alternative_suggestions && explanationData.alternative_suggestions.length > 0 && (
             <AccordionItem value="alternative-suggestions">
               <AccordionTrigger className="text-base font-semibold hover:no-underline">
                 <div className="flex items-center gap-2">
                   <GitCompareArrows className="h-4 w-4 text-purple-500" /> Alternative Approaches <Badge variant="outline" className="ml-2">{explanationData.alternative_suggestions.length}</Badge>
                 </div>
               </AccordionTrigger>
               <AccordionContent className="pt-2 pb-4 pl-2 pr-2 space-y-4">
                 {explanationData.alternative_suggestions.map((alt, index) => (
                   <div key={`alt-${index}`} className="border-l-2 border-purple-500 pl-3 py-1 text-sm">
                     <p><strong>Alternative:</strong> {alt.description}</p>
                     <div className="mt-2">
                       <pre className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto relative group/alt-code">
                         <code>{alt.code}</code>
                         <Button
                            onClick={() => handleCopy(alt.code, `Alternative code ${index + 1}`)}
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover/alt-code:opacity-100 transition-opacity"
                            aria-label="Copy alternative code"
                         >
                            <Copy className="h-3.5 w-3.5" />
                         </Button>
                       </pre>
                     </div>
                   </div>
                 ))}
               </AccordionContent>
             </AccordionItem>
          )}

        </Accordion>

      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-4 mb-4">
         {renderContent()}
      </ScrollArea>

       {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end items-center mt-auto pt-4 border-t">
           {/* Updated Learn More Button */}
            <Button onClick={handleLearnMore} variant="ghost" size="sm" className="text-primary hover:bg-primary/10" disabled={isLoading || !explanationData || !explanationData.language || explanationData.language === 'Unknown'}>
                <BookOpen className="mr-1.5 h-4 w-4" /> Learn More
            </Button>
            <Button onClick={handleExplainAnother} variant="outline" size="sm" className="text-foreground border-border hover:bg-accent/50">
                <RefreshCw className="mr-1.5 h-4 w-4" /> Explain Another
            </Button>
             {/* Copy Main Explanation Button */}
            <Button
                onClick={() => handleCopy(explanationData?.explanation_markdown || '', "Explanation")}
                variant="outline" size="sm"
                className="border-primary text-primary hover:bg-primary/10"
                disabled={!explanationData?.explanation_markdown || isLoading}
            >
                <Copy className="mr-1.5 h-4 w-4" /> Copy Explanation
            </Button>
         </div>

        {/* Learn More Dialog */}
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
                    <p className="text-muted-foreground text-center">No specific concepts identified for searching.</p>
                  )}
                </div>
             </ScrollArea>
             <DialogFooter>
                <DialogClose asChild>
                 <Button type="button" variant="secondary">
                   Close
                 </Button>
               </DialogClose>
             </DialogFooter>
           </DialogContent>
         </Dialog>
    </div>
  );
}
