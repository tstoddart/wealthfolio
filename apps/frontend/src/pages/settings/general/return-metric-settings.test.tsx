import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReturnMetricSettings } from "./return-metric-settings";

const updateSettings = vi.fn();

vi.mock("@/lib/settings-provider", () => ({
  useSettingsContext: () => ({
    settings: { defaultReturnMetric: "twr" },
    updateSettings,
  }),
}));

describe("ReturnMetricSettings", () => {
  beforeEach(() => {
    updateSettings.mockReset().mockResolvedValue(undefined);
  });

  it("renders the performance calculation settings card", () => {
    render(<ReturnMetricSettings />);
    expect(screen.getByText("Performance Calculation")).toBeInTheDocument();
    expect(screen.getByTestId("return-metric-select")).toBeInTheDocument();
  });

  it("calls updateSettings when a different return metric is selected", async () => {
    render(<ReturnMetricSettings />);
    const selectTrigger = screen.getByTestId("return-metric-select");
    await userEvent.click(selectTrigger);
    const option = await screen.findByText("Modified Dietz (Fast)");
    await userEvent.click(option);
    expect(updateSettings).toHaveBeenCalledWith({
      defaultReturnMetric: "modifiedDietz",
    });
  });
});
