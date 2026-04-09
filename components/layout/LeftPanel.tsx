import { WatchmanBrief } from "@/components/widgets/WatchmanBrief";
import { CategoryDonut } from "@/components/widgets/CategoryDonut";

export function LeftPanel() {
  return (
    <div className="flex flex-col gap-6">
      <WatchmanBrief />
      <CategoryDonut />
    </div>
  );
}
