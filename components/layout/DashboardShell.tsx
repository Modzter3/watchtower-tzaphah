"use client";

import { ArticleDataProvider } from "@/components/providers/ArticleDataProvider";
import { ArticleFeed } from "@/components/feed/ArticleFeed";
import { LeftPanel } from "@/components/layout/LeftPanel";
import { RightPanel } from "@/components/layout/RightPanel";
import { Ticker } from "@/components/layout/Ticker";

export function DashboardShell() {
  return (
    <ArticleDataProvider>
      <div className="relative min-h-screen bg-background-base pb-16 text-text-primary">
        {/* Background Decorative Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-gold/5 blur-[120px] animate-float" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-accent-amber/5 blur-[100px] animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] mix-blend-overlay" />
          <div className="scanline absolute top-0 left-0 animate-scanline" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-[1920px] grid-cols-1 gap-6 p-6 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <LeftPanel />
          </aside>
          <main className="lg:col-span-6">
            <ArticleFeed />
          </main>
          <aside className="lg:col-span-3">
            <RightPanel />
          </aside>
        </div>
        <Ticker />
      </div>
    </ArticleDataProvider>
  );
}
