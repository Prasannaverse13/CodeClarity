
'use client';

import React, { useState } from 'react';
import { CodeInput } from '@/components/code-input';
import { CodeExplanationDisplay } from '@/components/code-explanation-display';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { CodeExplanation } from '@/services/github'; // Use the enhanced type
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function Home() {
  // State now holds the enhanced CodeExplanation object
  const [explanationData, setExplanationData] = useState<CodeExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<string | null>(null); // For agent messages

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
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold text-center">CodeClarity 🧠</h1>
        <p className="text-sm text-muted-foreground text-center">Your AI Code Review & Explanation Agent</p>
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
