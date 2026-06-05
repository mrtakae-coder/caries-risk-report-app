import { ShieldCheck } from "lucide-react";

import { getRiskTone } from "@/lib/riskLogic";
import { cn } from "@/lib/utils";
import { riskLabels, type RiskLevel } from "@/types/saliva";

type RiskCardProps = {
  title: string;
  level: RiskLevel;
  description: string;
  scoreLabel?: string;
};

export function RiskCard({ title, level, description, scoreLabel }: RiskCardProps) {
  const tone = getRiskTone(level);

  return (
    <div className={cn("rounded-[22px] border p-4 print:rounded-xl print:p-3", tone.className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold print:text-[9px]">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold print:text-xl">{riskLabels[level]}</span>
            <span className="text-xs font-semibold print:text-[8px]">{tone.label}</span>
          </div>
          {scoreLabel ? <p className="mt-1 text-xs font-bold print:text-[8px]">{scoreLabel}</p> : null}
        </div>
        <div className="rounded-full bg-white/75 p-2 print:p-1">
          <ShieldCheck className="h-5 w-5 print:h-4 print:w-4" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-current/80 print:mt-2 print:text-[8px] print:leading-4">
        {description}
      </p>
    </div>
  );
}
