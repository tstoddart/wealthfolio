import { useInRouterContext, useNavigate } from "react-router-dom";
import { Badge } from "@wealthfolio/ui/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@wealthfolio/ui/components/ui/tooltip";
import { Spinner } from "@wealthfolio/ui/components/ui/spinner";
import { useSettingsContext } from "@/lib/settings-provider";
import { getPerformanceMethodInfo } from "@/lib/performance";
import { PerformanceResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PerformanceMethodBadgeProps {
  result?: PerformanceResult | null;
  fallbackTrackingMode?: string | null;
  isFetching?: boolean;
  className?: string;
  showStatusText?: boolean;
}

export function PerformanceMethodBadge({
  result,
  fallbackTrackingMode,
  isFetching = false,
  className,
  showStatusText = false,
}: PerformanceMethodBadgeProps) {
  const inRouter = useInRouterContext();
  const navigate = inRouter ? useNavigate() : null;
  const { settings } = useSettingsContext();
  const configuredMetric = settings?.defaultReturnMetric;
  const methodInfo = getPerformanceMethodInfo(result, configuredMetric, fallbackTrackingMode);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigate) {
      navigate("/settings");
    }
  };

  const targetLabel =
    configuredMetric === "irr"
      ? "IRR"
      : configuredMetric === "modifiedDietz"
        ? "Modified Dietz"
        : configuredMetric === "valueReturn"
          ? "Value Return"
          : "TWR";

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={handleClick}
              aria-label={`Performance calculation method: ${methodInfo.label}`}
              className="inline-flex items-center focus:outline-none"
            />
          }
        >
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer select-none text-[9px] font-semibold tracking-wider uppercase px-1 py-0 h-3.5 leading-none border-muted-foreground/30 hover:border-primary/50 text-muted-foreground hover:text-foreground transition-colors shrink-0",
              isFetching && "border-primary/40 text-primary",
            )}
          >
            {methodInfo.badgeLabel}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs space-y-1.5 text-xs p-2.5 shadow-md">
          <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-1">
            <p className="font-semibold text-foreground">{methodInfo.label}</p>
            <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-muted text-muted-foreground">
              {methodInfo.badgeLabel}
            </span>
          </div>
          <p className="text-muted-foreground leading-relaxed">{methodInfo.description}</p>
          {isFetching && (
            <p className="text-primary font-medium pt-0.5 animate-pulse">
              Recalculating with {targetLabel}...
            </p>
          )}
          <p className="text-[10px] text-muted-foreground/80 italic pt-0.5">
            Click to configure in Settings
          </p>
        </TooltipContent>
      </Tooltip>

      {isFetching && (
        <div
          data-testid="performance-recalculating-indicator"
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground animate-pulse"
        >
          <Spinner className="h-3 w-3 animate-spin text-primary" />
          {showStatusText && <span>Calculating...</span>}
        </div>
      )}
    </div>
  );
}
