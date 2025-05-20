
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CodeInput } from '@/components/code-input';
import { CodeExplanationDisplay } from '@/components/code-explanation-display';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Github, MessageSquareHeart, Send as SendIcon, Bot, User, Settings2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [sensayAnalysisResult, setSensayAnalysisResult] = useState<string | null>(null);
  const [isSensayLoading, setIsSensayLoading] = useState(false);
  const [sensayError, setSensayError] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<'explain' | 'chat' | null>(null);

  const [currentCodeSnippet, setCurrentCodeSnippet] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentUserChatMessage, setCurrentUserChatMessage] = useState<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSensayRequest = async (code: string, question: string, isGeneralExplanation: boolean) => {
    setIsSensayLoading(true);
    setSensayError(null);
    setCurrentAction(isGeneralExplanation ? 'explain' : 'chat');

    if (isGeneralExplanation) {
      setSensayAnalysisResult(null); 
      // Optionally clear chat history or add a system message when new code is explained
      // setChatHistory([]); // Clears chat history
    }

    try {
      const response = await fetch('/api/ask-sensay-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          question,
          isGeneralExplanationRequest: isGeneralExplanation,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        if (isGeneralExplanation) {
          setSensayAnalysisResult(responseData.expertAnswer);
          toast({ title: "Code Explained", description: "Sensay AI has provided an analysis." });
          setChatHistory(prev => [...prev, {id: crypto.randomUUID(), role: 'assistant', content: "I've analyzed the code. Feel free to ask follow-up questions here."}]);
        } else {
          setChatHistory(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: responseData.expertAnswer }]);
        }
      } else {
        const errorMsg = responseData.error || `Sensay API error: ${response.statusText}`;
        setSensayError(errorMsg);
        if (isGeneralExplanation) {
          toast({ title: "Analysis Error", description: errorMsg, variant: "destructive" });
        } else {
          setChatHistory(prev => [...prev, {id: crypto.randomUUID(), role: 'assistant', content: `Sorry, I encountered an error: ${errorMsg}`}]);
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unknown error occurred while contacting Sensay.";
      setSensayError(msg);
      if (isGeneralExplanation) {
        toast({ title: "Connection Error", description: msg, variant: "destructive" });
      } else {
         setChatHistory(prev => [...prev, {id: crypto.randomUUID(), role: 'assistant', content: `Sorry, I couldn't connect: ${msg}`}]);
      }
    } finally {
      setIsSensayLoading(false);
      setCurrentAction(null);
    }
  };

  const handleExplainCode = (codeToExplain: string) => {
    if (!codeToExplain.trim()) {
      toast({ title: "Input Error", description: "Please enter some code to explain.", variant: "destructive" });
      return;
    }
    setCurrentCodeSnippet(codeToExplain);
    // This detailed prompt is now constructed here and passed as the 'question' for a general explanation
    const detailedPrompt = `Please provide a comprehensive analysis of the following code snippet. Your analysis MUST be in well-formatted markdown and include ALL of the following sections if applicable, each clearly delineated by its title in bold (e.g., **Detected Language**:, **Comprehensive Analysis**:, etc.):
1.  **Detected Language**: (e.g., Python, JavaScript, or "Could not reliably detect language")
2.  **Comprehensive Analysis**: 
    *   Start with "### 🔍 What this code does:" 
    *   Provide a step-by-step breakdown of the code's logic, inputs, outputs, and its overall purpose. 
    *   Include a "### 💡 Summary:" of the main purpose.
3.  **Style & Formatting Suggestions**: (e.g., "Consider renaming variable 'x' to 'userInput'.")
4.  **Code Smell Detection**: (e.g., "Function 'calculateTotal' is too long.")
5.  **Security Vulnerability Checks**: (e.g., "No input validation detected for 'queryParam'.")
6.  **Potential Bug Identification & Fix Suggestions**: (Provide as a JSON array string, e.g., "[{ \\"bug\\": \\"Possible null pointer dereference.\\", \\"fix_suggestion\\": \\"Add a null check.\\" }]")
7.  **Alternative Code Approaches**: (Provide as a JSON array string, e.g., "[{ \\"description\\": \\"Using a ternary operator.\\", \\"code\\": \\"const result = condition ? value1 : value2;\\" }]")
8.  **General Warnings & Suggestions**: (e.g., "The code uses a deprecated library function.")
9.  **Syntax Errors**: (Provide as a JSON array string if errors are obvious, e.g., "[{ \\"error\\": \\"Missing semicolon.\\", \\"line_number\\": 5 }]")
10. **Learn More Links**: Provide 3-10 relevant Google search query strings (NOT full URLs) for concepts found in the code. Format each as a bullet point starting with '-', e.g., "- Python list comprehensions tutorial"

If a section is not applicable or has no specific items, state "None found" or provide an empty array [] for JSON array sections.
The code to analyze is:
\`\`\`
${codeToExplain}
\`\`\`
`;
    handleSensayRequest(codeToExplain, detailedPrompt, true);
  };

  const handleSendChatMessage = () => {
    if (!currentUserChatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: currentUserChatMessage,
    };
    setChatHistory(prev => [...prev, newMessage]);
    
    // Use currentCodeSnippet for context, even if it's empty
    handleSensayRequest(currentCodeSnippet, currentUserChatMessage, false);
    setCurrentUserChatMessage('');
  };

  const handleClear = () => {
    setSensayAnalysisResult(null);
    setIsSensayLoading(false);
    setSensayError(null);
    setCurrentCodeSnippet('');
    setChatHistory([]);
    setCurrentUserChatMessage('');
    setCurrentAction(null);
    // Clear the code in CodeInput as well
    // This might require a ref or a callback to CodeInput if it maintains its own state
    // For now, let's assume CodeInput's state will be reset via its props or key change.
    toast({ title: "Cleared", description: "All inputs and analyses have been cleared." });
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b flex justify-between items-center sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
            <Settings2 className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold">CodeClarity 🧠</h1>
        </div>
        <p className="text-sm text-muted-foreground hidden md:block">Your AI Code Review & Explanation Agent + Code Mentor</p>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <a
            href="https://github.com/Prasannaverse13"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
            title="Visit Prasannaverse13's GitHub profile"
          >
            <Github className="h-5 w-5" />
            <span className="hidden sm:inline font-medium text-muted-foreground">Developed by Prasannaverse13</span>
          </a>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Column 1: Code Input */}
        <div className="w-full md:w-1/3 flex flex-col">
          <Card className="h-full shadow-lg flex flex-col">
            <CardHeader className="py-4 px-6">
              <CardTitle className="text-lg">Enter Code Snippet</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4">
              <CodeInput
                initialCode={currentCodeSnippet}
                onExplainCode={handleExplainCode}
                onClear={handleClear} // Pass handleClear to CodeInput
                isLoading={isSensayLoading && currentAction === 'explain'}
              />
            </CardContent>
          </Card>
        </div>

        {/* Column 2: AI Analysis Display */}
        <div className="w-full md:w-1/3 flex flex-col">
          <Card className="h-full shadow-lg flex flex-col">
            <CardHeader className="py-4 px-6">
              <CardTitle className="text-lg">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-1 overflow-y-auto">
              {/* This div ensures consistent padding/margin if CodeExplanationDisplay returns null */}
              <div className="h-full"> 
                <CodeExplanationDisplay
                  analysisResult={sensayAnalysisResult}
                  isLoading={isSensayLoading && currentAction === 'explain'}
                  error={sensayError && currentAction === 'explain' ? sensayError : null}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 3: Conversational Code Mentor Chat */}
        <div className="w-full md:w-1/3 flex flex-col">
          <Card className="h-full shadow-lg flex flex-col">
            <CardHeader className="py-4 px-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquareHeart className="h-6 w-6 text-primary" />
                Code Mentor (Sensay AI)
              </CardTitle>
            </CardHeader>
            <CardContent ref={chatContainerRef} className="flex-1 p-4 space-y-3 overflow-y-auto bg-muted/20 rounded-t-md">
              {chatHistory.length === 0 && !(isSensayLoading && currentAction === 'chat') && (
                <div className="text-center text-muted-foreground py-10">
                  <MessageSquareHeart className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>Ask the Code Mentor anything about your code or general programming concepts.</p>
                </div>
              )}
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "p-3 rounded-lg max-w-[85%] shadow-sm flex flex-col text-sm",
                    msg.role === 'user' ? 'bg-primary text-primary-foreground self-end ml-auto' : 'bg-card text-card-foreground self-start mr-auto border'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === 'assistant' ? <Bot className="h-5 w-5 text-primary" /> : <User className="h-5 w-5" />}
                    <span className="font-semibold">{msg.role === 'user' ? 'You' : 'Code Mentor'}</span>
                  </div>
                  {/* Using pre-wrap to respect newlines and prevent markdown interpretation for chat */}
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                </div>
              ))}
              {(isSensayLoading && currentAction === 'chat') && (
                 <div className="flex items-center space-x-2 text-muted-foreground self-start p-3">
                    <Bot className="h-5 w-5 animate-pulse text-primary" />
                    <span>Mentor is typing...</span>
                  </div>
              )}
            </CardContent>
            <CardFooter className="p-4 border-t bg-background rounded-b-md">
              <div className="flex w-full items-center gap-2">
                <Textarea
                  value={currentUserChatMessage}
                  onChange={(e) => setCurrentUserChatMessage(e.target.value)}
                  placeholder="Ask the mentor..."
                  className="flex-1 min-h-[40px] max-h-[120px] resize-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChatMessage();
                    }
                  }}
                  disabled={isSensayLoading && currentAction === 'chat'}
                />
                <Button
                  onClick={handleSendChatMessage}
                  disabled={isSensayLoading && currentAction === 'chat' || !currentUserChatMessage.trim()}
                  size="icon"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  aria-label="Send chat message"
                >
                  <SendIcon className="h-5 w-5" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}


    