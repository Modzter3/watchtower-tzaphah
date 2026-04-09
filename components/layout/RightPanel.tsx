import { TzaphahGauge } from "@/components/widgets/TzaphahGauge";
import { TopRegions } from "@/components/widgets/TopRegions";
import { ScriptureRotator } from "@/components/widgets/ScriptureRotator";

export function RightPanel() {
  return (
    <div className="flex flex-col gap-6">
      <TzaphahGauge />
      <TopRegions />
      <ScriptureRotator />
    </div>
  );
}
