'use client';

import React, { useState } from 'react';
import { CodeInput } from '@/components/code-input';
import { CodeExplanationDisplay } from '@/components/code-explanation-display';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { CodeExplanation } from '@/services/github'; // Updated import path

export default function Home() {
  const [explanation, setExplanation] = useState<CodeExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplanationReceived = (data: CodeExplanation | null, loading: boolean, errorMsg: string | null) => {
    setExplanation(data);
    setIsLoading(loading);
    setError(errorMsg);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold text-center">CodeClarity 🧠</h1>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4 overflow-auto">
          <Card className="h-full">
            <CardContent className="p-6 h-full flex flex-col">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Enter Code Snippet</h2>
              <CodeInput onExplanationReceived={handleExplanationReceived} />
            </CardContent>
          </Card>
        </div>
        <Separator orientation="vertical" className="h-full" />
        <div className="flex-1 p-4 overflow-auto">
           <Card className="h-full">
            <CardContent className="p-6 h-full flex flex-col">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Explanation</h2>
              <CodeExplanationDisplay
                explanation={explanation}
                isLoading={isLoading}
                error={error}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
