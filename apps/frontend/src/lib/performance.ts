import type { PerformanceResult } from "@/lib/types";

const numberOrNull = (value: number | null | undefined): number | null =>
  value == null || !Number.isFinite(Number(value)) ? null : Number(value);

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ANNUALIZED_DISPLAY_MIN_DAYS = 365;

function dateKeyToUtcMs(value: string | null | undefined): number | null {
  if (!value) return null;

  const [dateKey] = value.split("T");
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;

  const timestamp = Date.UTC(year, month - 1, day);
  if (!Number.isFinite(timestamp)) return null;

  const date = new Date(timestamp);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return timestamp;
}

export function performancePeriodPnl(result: PerformanceResult | null | undefined): number | null {
  if (!result || result.summary?.amountStatus !== "complete") return null;
  return numberOrNull(result.summary.amount);
}

export function performanceSummaryReturn(
  result: PerformanceResult | null | undefined,
): number | null {
  if (!result || result.summary?.percentStatus !== "complete") return null;
  return numberOrNull(result.summary.percent);
}

export function simpleReturnFromNetContribution(
  returnAmount: number | null | undefined,
  netContribution: number | null | undefined,
): number | null {
  const amount = numberOrNull(returnAmount);
  const contribution = numberOrNull(netContribution);
  if (amount == null || contribution == null || contribution <= 0) return null;

  return amount / contribution;
}

export function shouldDisplayAnnualizedPerformanceReturn(
  result: PerformanceResult | null | undefined,
): boolean {
  const start = dateKeyToUtcMs(result?.period.startDate);
  const end = dateKeyToUtcMs(result?.period.endDate);
  if (start == null || end == null || end < start) return false;

  return (end - start) / MS_PER_DAY >= ANNUALIZED_DISPLAY_MIN_DAYS;
}

export interface PerformanceMethodInfo {
  code: "dietz" | "twr" | "irr" | "value" | "price";
  label: string;
  badgeLabel: string;
  description: string;
}

export function getPerformanceMethodInfo(
  result?: PerformanceResult | null,
  configuredMetric?: string | null,
): PerformanceMethodInfo {
  const method = result?.mode || result?.summary?.method;

  if (method === "modifiedDietz") {
    return {
      code: "dietz",
      label: "Modified Dietz",
      badgeLabel: "Dietz",
      description: "Cash-flow weighted return approximation with stepped daily series (fast calculation).",
    };
  }

  if (method === "valueReturn") {
    return {
      code: "value",
      label: "Value Return",
      badgeLabel: "Value",
      description: "Net absolute gain over starting capital (used for holdings/snapshot accounts).",
    };
  }

  if (method === "symbolPriceBased") {
    return {
      code: "price",
      label: "Price Return",
      badgeLabel: "Price",
      description: "Asset price return excluding transaction timing.",
    };
  }

  if (method === "timeWeighted") {
    if (configuredMetric === "irr") {
      return {
        code: "irr",
        label: "Internal Rate of Return",
        badgeLabel: "IRR",
        description: "Money-weighted return (XIRR) sensitive to cash flow timing and scale.",
      };
    }
    return {
      code: "twr",
      label: "Time-Weighted Return",
      badgeLabel: "TWR",
      description: "Daily true TWR compounding, isolating market performance from cash flow timing.",
    };
  }

  // Fallback to configured metric if result method is not available or notApplicable
  if (configuredMetric === "modifiedDietz") {
    return {
      code: "dietz",
      label: "Modified Dietz",
      badgeLabel: "Dietz",
      description: "Cash-flow weighted return approximation with stepped daily series.",
    };
  }

  if (configuredMetric === "irr") {
    return {
      code: "irr",
      label: "Internal Rate of Return",
      badgeLabel: "IRR",
      description: "Money-weighted return (XIRR) sensitive to cash flow timing and scale.",
    };
  }

  if (configuredMetric === "valueReturn") {
    return {
      code: "value",
      label: "Value Return",
      badgeLabel: "Value",
      description: "Net absolute gain over starting capital.",
    };
  }

  return {
    code: "twr",
    label: "Time-Weighted Return",
    badgeLabel: "TWR",
    description: "Daily true TWR compounding, isolating market performance from cash flow timing.",
  };
}
