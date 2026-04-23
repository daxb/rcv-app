import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import NavTabs from "@/components/NavTabs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ranked Choice Voting",
  description: "Create and participate in ranked choice elections",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors`}>
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex items-center justify-between py-3">
              <Link href="/" className="text-base font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0">
                Ranked Choice Voting
              </Link>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link
                  href="/create"
                  className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Election
                </Link>
              </div>
            </div>
            <NavTabs />
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-gray-200 dark:border-gray-800 mt-8">
          <div className="max-w-3xl mx-auto px-4 py-4 text-center text-xs text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} Verdant Coast LLC. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
