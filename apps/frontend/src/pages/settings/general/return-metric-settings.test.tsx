import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReturnMetricSettings } from "./return-metric-settings";

const updateSettings = vi.fn();

vi.mock("@/lib/settings-provider", () => ({
  useSettingsContext: () => ({
    settings: { defaultReturnMetric: "twr" },
    updateSettings,
  }),
}));

const renderWithClient = (ui: React.ReactElement, client = new QueryClient()) => {
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe("ReturnMetricSettings", () => {
  beforeEach(() => {
    updateSettings.mockReset().mockResolvedValue(undefined);
  });

  it("renders the performance calculation settings card", () => {
    renderWithClient(<ReturnMetricSettings />);
    expect(screen.getByText("Performance Calculation")).toBeInTheDocument();
    expect(screen.getByTestId("return-metric-select")).toBeInTheDocument();
  });

  it("calls updateSettings when a different return metric is selected", async () => {
    renderWithClient(<ReturnMetricSettings />);
    const selectTrigger = screen.getByTestId("return-metric-select");
    await userEvent.click(selectTrigger);
    const option = await screen.findByText("Modified Dietz (Fast)");
    await userEvent.click(option);
    expect(updateSettings).toHaveBeenCalledWith({
      defaultReturnMetric: "modifiedDietz",
    });
  });
});
