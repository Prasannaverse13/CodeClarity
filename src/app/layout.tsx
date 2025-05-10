
import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider"; // Import ThemeProvider

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CodeClarity',
  description: 'Understand code snippets with AI-powered explanations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> {/* Add suppressHydrationWarning for next-themes */}
      <body className={`${inter.className} antialiased`}>
         {/* Wrap children with ThemeProvider */}
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
      </body>
    </html>
  );
}
