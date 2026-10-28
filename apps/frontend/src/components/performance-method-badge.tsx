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
  isFetching?: boolean;
  className?: string;
  showStatusText?: boolean;
}

export function PerformanceMethodBadge({
  result,
  isFetching = false,
  className,
  showStatusText = false,
}: PerformanceMethodBadgeProps) {
  const inRouter = useInRouterContext();
  const navigate = inRouter ? useNavigate() : null;
  const { settings } = useSettingsContext();
  const configuredMetric = settings?.defaultReturnMetric;
  const methodInfo = getPerformanceMethodInfo(result, configuredMetric);

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
              "cursor-pointer select-none text-[10px] font-medium tracking-wide uppercase px-1.5 py-0 h-4 border-muted-foreground/30 hover:border-primary/50 text-muted-foreground hover:text-foreground transition-colors",
              isFetching && "border-primary/40 text-primary",
            )}
          >
            {methodInfo.badgeLabel}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs space-y-1 text-xs">
          <p className="font-semibold">{methodInfo.label}</p>
          <p className="text-muted-foreground">{methodInfo.description}</p>
          {isFetching && (
            <p className="text-primary font-medium pt-0.5">
              Recalculating with {targetLabel}...
            </p>
          )}
          <p className="text-[10px] text-muted-foreground/80 italic pt-1 border-t border-border/50">
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
