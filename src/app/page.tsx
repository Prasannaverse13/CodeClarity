
'use client';

import React, { useState, useCallback } from 'react';
import { CodeInput } from '@/components/code-input';
import { CodeExplanationDisplay } from '@/components/code-explanation-display';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ExplainCodeOutput as CodeExplanation } from '@/ai/flows/explain-code';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Github, Brain, MessageSquareHeart } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { SensayExpertDisplay } from '@/components/sensay-expert-display'; // New component
import { useToast } from '@/hooks/use-toast';


export default function Home() {
  const [geminiExplanationData, setGeminiExplanationData] = useState<CodeExplanation | null>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [geminiAgentStatus, setGeminiAgentStatus] = useState<string | null>(null);
  
  const [currentCodeSnippet, setCurrentCodeSnippet] = useState<string>('');

  const [sensayExpertAnswer, setSensayExpertAnswer] = useState<string | null>(null);
  const [isSensayLoading, setIsSensayLoading] = useState(false);
  const [sensayError, setSensayError] = useState<string | null>(null);
  const [sensayAgentStatus, setSensayAgentStatus] = useState<string | null>(null);

  const { toast } = useToast();

  const handleGeminiExplanationUpdate = (
    data: CodeExplanation | null,
    loading: boolean,
    errorMsg: string | null,
    status: string | null,
    code: string | null
  ) => {
    setGeminiExplanationData(data);
    setIsGeminiLoading(loading);
    setGeminiError(errorMsg);
    setGeminiAgentStatus(status);
    if (code) {
      setCurrentCodeSnippet(code);
    }
    if (errorMsg && !data) { // Clear Sensay if Gemini fails and has no data
        setSensayExpertAnswer(null);
        setSensayError(null);
        setSensayAgentStatus(null);
    }
  };

  const handleAskSensayExpert = async (codeToAnalyze: string, question: string) => {
    setIsSensayLoading(true);
    setSensayError(null);
    setSensayExpertAnswer(null);
    setSensayAgentStatus("Contacting Sensay AI Code Mentor...");
    setCurrentCodeSnippet(codeToAnalyze); // Keep current code context

    try {
      const response = await fetch('/api/ask-sensay-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToAnalyze, question }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSensayExpertAnswer(responseData.expertAnswer);
        setSensayAgentStatus("Mentor's response received.");
        toast({ title: "Mentor Replied", description: "Sensay AI Code Mentor has provided an answer." });
      } else {
        setSensayError(responseData.error || `Sensay API error: ${response.statusText}`);
        setSensayAgentStatus("Error receiving response from Sensay Mentor.");
        toast({ title: "Mentor Error", description: responseData.error || "Could not get a response from Sensay.", variant: "destructive" });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unknown error occurred while contacting Sensay.";
      setSensayError(msg);
      setSensayAgentStatus("Failed to connect to Sensay Mentor.");
      toast({ title: "Connection Error", description: msg, variant: "destructive" });
    } finally {
      setIsSensayLoading(false);
    }
  };

  const handleClear = () => {
    setGeminiExplanationData(null);
    setIsGeminiLoading(false);
    setGeminiError(null);
    setGeminiAgentStatus(null);
    
    setSensayExpertAnswer(null);
    setIsSensayLoading(false);
    setSensayError(null);
    setSensayAgentStatus(null);

    setCurrentCodeSnippet('');
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b flex justify-between items-center relative">
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold">CodeClarity 🧠</h1>
          <p className="text-sm text-muted-foreground">Your AI Code Review & Explanation Agent + Code Mentor</p>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-4">
          <ThemeToggle />
           <div className="flex items-center gap-1 text-sm text-muted-foreground">
             <span>Developed by</span>
              <a
                 href="https://github.com/Prasannaverse13"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center gap-1 hover:text-primary transition-colors"
                 title="Visit Prasannaverse13's GitHub profile"
               >
                <Github className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">Prasannaverse13</span>
              </a>
           </div>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4 overflow-auto">
          <Card className="h-full shadow-md">
            <CardContent className="p-6 h-full flex flex-col">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Enter Code & Ask Mentor</h2>
              <CodeInput 
                onExplanationUpdate={handleGeminiExplanationUpdate} 
                onClear={handleClear}
                onAskSensayExpert={handleAskSensayExpert}
                isSensayLoading={isSensayLoading}
              />
            </CardContent>
          </Card>
        </div>

        <Separator orientation="vertical" className="h-full bg-border" />

        <div className="flex-1 p-4 overflow-auto">
           <Card className="h-full shadow-md">
            <CardContent className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-foreground">AI Analysis & Mentor Insights</h2>
              </div>
              
              {/* Gemini Analysis Section */}
              {geminiAgentStatus && !isGeminiLoading && !geminiError && (
                 <Alert variant="default" className="mb-4 bg-accent/10 border-accent/50">
                   <Info className="h-4 w-4 text-accent" />
                   <AlertTitle className="text-accent font-semibold">Gemini Agent Status</AlertTitle>
                   <AlertDescription>{geminiAgentStatus}</AlertDescription>
                 </Alert>
              )}
              <CodeExplanationDisplay
                explanationData={geminiExplanationData}
                isLoading={isGeminiLoading}
                error={geminiError}
                onClear={handleClear} // This clear button clears everything
                hasCode={!!currentCodeSnippet}
              />

              {/* Sensay Expert Answer Section - Render if there's an answer or loading/error state for Sensay */}
              {(sensayExpertAnswer || isSensayLoading || sensayError || sensayAgentStatus) && (
                <>
                  <Separator className="my-6" />
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquareHeart className="h-6 w-6 text-purple-500" />
                    <h3 className="text-lg font-semibold text-foreground">Code Mentor (Sensay AI)</h3>
                  </div>
                  {sensayAgentStatus && !isSensayLoading && !sensayError && (
                    <Alert variant="default" className="mb-4 bg-purple-500/10 border-purple-500/50">
                      <Info className="h-4 w-4 text-purple-600" />
                      <AlertTitle className="text-purple-700 font-semibold">Mentor Status</AlertTitle>
                      <AlertDescription>{sensayAgentStatus}</AlertDescription>
                    </Alert>
                  )}
                  <SensayExpertDisplay
                    expertAnswer={sensayExpertAnswer}
                    isLoading={isSensayLoading}
                    error={sensayError}
                  />
                </>
              )}

            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
