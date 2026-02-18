import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { TRPCProvider } from "@/lib/trpc-provider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { SkipLink } from "@/components/ui/skip-link";
import { SessionProvider } from "@/components/auth/session-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PLM System Web",
  description: "Product Lifecycle Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full bg-background text-foreground antialiased`}>
        <SessionProvider>
          <TRPCProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            <div className="min-h-full">
              <SkipLink />
              <Navbar />
              <div className="container mx-auto flex min-h-[calc(100vh-4rem)] gap-4 px-4 py-6 md:gap-6 lg:gap-8">
                {/* Mobile-friendly sidebar - collapsible on small screens */}
                <aside className="hidden w-64 shrink-0 lg:block xl:w-72">
                  <Sidebar />
                </aside>
                <main
                  id="main-content"
                  className="min-w-0 flex-1"
                  tabIndex={-1}
                >
                  {children}
                </main>
              </div>
            </div>
            <Toaster />
          </ThemeProvider>
        </TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
