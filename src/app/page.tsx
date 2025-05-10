
'use client';

import React, { useState, useCallback } from 'react';
import { CodeInput } from '@/components/code-input';
import { CodeExplanationDisplay, type SensayInsight } from '@/components/code-explanation-display';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ExplainCodeOutput as CodeExplanation } from '@/ai/flows/explain-code'; // Updated type
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Github, Brain } from 'lucide-react'; // Changed Settings to Brain for AI
import { getSensayCodeInsight, type SensayCodeInsightOutput } from '@/ai/flows/sensay-code-insight-flow';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const [explanationData, setExplanationData] = useState<CodeExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  
  const [currentCodeSnippet, setCurrentCodeSnippet] = useState<string>('');

  const [sensayInsight, setSensayInsight] = useState<SensayInsight | null>(null);
  const [isSensayLoading, setIsSensayLoading] = useState(false);
  const [sensayError, setSensayError] = useState<string | null>(null);


  const handleExplanationUpdate = (
    data: CodeExplanation | null,
    loading: boolean,
    errorMsg: string | null,
    status: string | null,
    code: string | null
  ) => {
    setExplanationData(data);
    setIsLoading(loading);
    setError(errorMsg);
    setAgentStatus(status);
    if (code) {
      setCurrentCodeSnippet(code);
    }
    setSensayInsight(null);
    setSensayError(null);
  };

  const handleClear = () => {
    setExplanationData(null);
    setIsLoading(false);
    setError(null);
    setAgentStatus(null);
    setCurrentCodeSnippet('');
    setSensayInsight(null);
    setIsSensayLoading(false);
    setSensayError(null);
  };

  const handleSensayInsightRequest = useCallback(async () => {
    if (!currentCodeSnippet) {
      setSensayError("No code snippet available to analyze with Sensay.");
      return;
    }

    setIsSensayLoading(true);
    setSensayError(null);
    setSensayInsight(null);

    try {
      setAgentStatus("Requesting deeper insights from Sensay Wisdom Engine...");
      const result: SensayCodeInsightOutput = await getSensayCodeInsight({ codeSnippet: currentCodeSnippet });
      setSensayInsight({
        text: result.insight,
        rawResponse: result.rawSensayResponse,
      });
      setAgentStatus("Sensay insights received.");
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "An unexpected error occurred while fetching Sensay insights.";
      setSensayError(errorMsg);
      setAgentStatus("Error receiving Sensay insights.");
      console.error("Sensay Insight Error:", e);
    } finally {
      setIsSensayLoading(false);
    }
  }, [currentCodeSnippet]);


  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b flex justify-between items-center relative">
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold">CodeClarity 🧠</h1>
          <p className="text-sm text-muted-foreground">Your AI Code Review & Explanation Agent</p>
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
              <h2 className="text-xl font-semibold mb-4 text-foreground">Enter Code Snippet</h2>
              <CodeInput onExplanationUpdate={handleExplanationUpdate} onClear={handleClear} />
            </CardContent>
          </Card>
        </div>

        <Separator orientation="vertical" className="h-full bg-border" />

        <div className="flex-1 p-4 overflow-auto">
           <Card className="h-full shadow-md">
            <CardContent className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-foreground">Agent Analysis</h2>
              </div>

              {agentStatus && !isLoading && !error && (
                 <Alert variant="default" className="mb-4 bg-accent/10 border-accent/50">
                   <Info className="h-4 w-4 text-accent" />
                   <AlertTitle className="text-accent font-semibold">Agent Status</AlertTitle>
                   <AlertDescription>{agentStatus}</AlertDescription>
                 </Alert>
              )}

              <CodeExplanationDisplay
                explanationData={explanationData}
                isLoading={isLoading}
                error={error}
                onClear={handleClear}
                sensayInsight={sensayInsight}
                isSensayLoading={isSensayLoading}
                sensayError={sensayError}
                onGetSensayInsight={handleSensayInsightRequest}
                hasCode={!!currentCodeSnippet}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
