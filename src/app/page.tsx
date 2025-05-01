
'use client';

import React, { useState, useEffect } from 'react';
import { CodeInput } from '@/components/code-input';
import { CodeExplanationDisplay } from '@/components/code-explanation-display';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { CodeExplanation } from '@/services/github'; // Use the enhanced type
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Github, Eye } from 'lucide-react'; // Import Github and Eye icons

export default function Home() {
  // State now holds the enhanced CodeExplanation object
  const [explanationData, setExplanationData] = useState<CodeExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<string | null>(null); // For agent messages
  const [viewCount, setViewCount] = useState<number | string>('...'); // State for view counter

  useEffect(() => {
    // Simulate fetching/setting a view count only on the client-side
    // A true live counter requires backend infrastructure (WebSockets, etc.)
    // This is a placeholder to prevent hydration errors.
    const simulatedCount = Math.floor(Math.random() * 150) + 10; // Example random count
    setViewCount(simulatedCount);
  }, []); // Empty dependency array ensures this runs once on mount

  const handleExplanationUpdate = (
    data: CodeExplanation | null, // Expects the enhanced type
    loading: boolean,
    errorMsg: string | null,
    status: string | null // Receive agent status updates
  ) => {
    setExplanationData(data);
    setIsLoading(loading);
    setError(errorMsg);
    setAgentStatus(status);
  };

  const handleClear = () => {
    setExplanationData(null);
    setIsLoading(false);
    setError(null);
    setAgentStatus(null);
    // Potentially also clear the CodeInput state if needed via a ref or callback
  };


  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b flex justify-center items-center relative"> {/* Use flex and relative */}
        {/* Title and Subtitle (centered) */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">CodeClarity 🧠</h1>
          <p className="text-sm text-muted-foreground">Your AI Code Review & Explanation Agent</p>
        </div>

        {/* Right-aligned section for GitHub link and view counter */}
        <div className="absolute top-4 right-4 flex items-center gap-4">
          {/* View Counter */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground" title="Simulated live views (client-side)">
            <Eye className="h-4 w-4" />
            <span>{viewCount} watching</span>
          </div>
          {/* GitHub Link */}
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
        {/* Left Panel: Code Input */}
        <div className="flex-1 p-4 overflow-auto">
          <Card className="h-full shadow-md">
            <CardContent className="p-6 h-full flex flex-col">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Enter Code Snippet</h2>
              <CodeInput onExplanationUpdate={handleExplanationUpdate} />
            </CardContent>
          </Card>
        </div>

        <Separator orientation="vertical" className="h-full bg-border" />

        {/* Right Panel: Explanation & Agent Output */}
        <div className="flex-1 p-4 overflow-auto">
           <Card className="h-full shadow-md">
            <CardContent className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-foreground">Agent Analysis</h2>
                {/* Add other controls here if needed, e.g., history toggle */}
              </div>

              {/* Agent Status Area */}
              {agentStatus && !isLoading && !error && (
                 <Alert variant="default" className="mb-4 bg-accent/10 border-accent/50">
                   <Info className="h-4 w-4 text-accent" />
                   <AlertTitle className="text-accent font-semibold">Agent Status</AlertTitle>
                   <AlertDescription>{agentStatus}</AlertDescription>
                 </Alert>
              )}

              {/* Main Explanation Display */}
              <CodeExplanationDisplay
                explanationData={explanationData} // Pass the full data object
                isLoading={isLoading}
                error={error}
                onClear={handleClear} // Pass clear handler
              />
            </CardContent>
          </Card>
        </div>
      </main>
      {/* Footer could go here if needed */}
    </div>
  );
}

