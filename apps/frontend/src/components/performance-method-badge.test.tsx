import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PerformanceMethodBadge } from "./performance-method-badge";
import { PerformanceResult } from "@/lib/types";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useInRouterContext: () => true,
}));

vi.mock("@/lib/settings-provider", () => ({
  useSettingsContext: () => ({
    settings: { defaultReturnMetric: "modifiedDietz" },
  }),
}));

const mockResult = (mode: PerformanceResult["mode"]): PerformanceResult => ({
  scope: { id: "test", currency: "USD" },
  period: { startDate: "2026-01-01", endDate: "2026-06-01" },
  mode,
  returns: {},
  attribution: {
    contributions: 0,
    distributions: 0,
    income: 0,
    realizedPnl: 0,
    unrealizedPnlChange: 0,
    fxEffect: 0,
    fees: 0,
    taxes: 0,
    residual: 0,
  },
  risk: {},
  dataQuality: { status: "ok", warnings: [], notApplicableReasons: [] },
  basisStatus: "complete",
  summary: {
    amount: 100,
    percent: 0.1,
    method: mode,
    basis: "marketValue",
    quality: "ok",
    amountStatus: "complete",
    percentStatus: "complete",
    basisStatus: "complete",
    reasons: [],
  },
  series: [],
});

describe("PerformanceMethodBadge", () => {
  it("renders the Dietz badge for modifiedDietz result", () => {
    render(<PerformanceMethodBadge result={mockResult("modifiedDietz")} />);
    expect(screen.getByText("Dietz")).toBeInTheDocument();
  });

  it("renders recalculating spinner when isFetching is true", () => {
    render(
      <PerformanceMethodBadge
        result={mockResult("modifiedDietz")}
        isFetching={true}
        showStatusText={true}
      />,
    );
    expect(screen.getByTestId("performance-recalculating-indicator")).toBeInTheDocument();
    expect(screen.getByText("Calculating...")).toBeInTheDocument();
  });

  it("navigates to settings on badge click", async () => {
    render(<PerformanceMethodBadge result={mockResult("modifiedDietz")} />);
    const button = screen.getByRole("button", { name: /Performance calculation method/i });
    await userEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith("/settings");
  });
});
