import { ArticleFeed } from "@/components/feed/ArticleFeed";
import { LeftPanel } from "@/components/layout/LeftPanel";
import { RightPanel } from "@/components/layout/RightPanel";
import { Ticker } from "@/components/layout/Ticker";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background-base pb-16 text-text-primary">
      <div className="mx-auto grid max-w-[1920px] grid-cols-1 gap-6 p-6 lg:grid-cols-12">
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
  );
}
