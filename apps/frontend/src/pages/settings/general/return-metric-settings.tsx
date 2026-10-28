import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@wealthfolio/ui/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@wealthfolio/ui/components/ui/select";
import { useSettingsContext } from "@/lib/settings-provider";
import { Settings } from "@/lib/types";

export function ReturnMetricSettings() {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettingsContext();

  const currentMetric = settings?.defaultReturnMetric || "twr";

  const handleMetricChange = async (value: Settings["defaultReturnMetric"] | null) => {
    if (!value) return;
    try {
      await updateSettings({
        defaultReturnMetric: value,
      });
    } catch (error) {
      console.error("Failed to update return calculation metric:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t("settings:performance_engine_title", "Performance Calculation")}
        </CardTitle>
        <CardDescription>
          {t(
            "settings:performance_engine_description",
            "Choose the return calculation methodology used for your portfolio and account performance.",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full max-w-md">
          <Select value={currentMetric} onValueChange={handleMetricChange}>
            <SelectTrigger
              aria-label={t("settings:performance_engine_title", "Performance Calculation")}
              data-testid="return-metric-select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="twr">
                <div className="flex flex-col py-1">
                  <span className="font-medium">
                    {t("settings:return_metric_twr", "Time-Weighted Return (TWR)")}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {t(
                      "settings:return_metric_twr_desc",
                      "Daily true TWR compounding, isolating market performance from cash flow timing (Standard).",
                    )}
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="modifiedDietz">
                <div className="flex flex-col py-1">
                  <span className="font-medium">
                    {t("settings:return_metric_modified_dietz", "Modified Dietz (Fast)")}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {t(
                      "settings:return_metric_modified_dietz_desc",
                      "Cash-flow weighted return calculation for high performance with stepped daily series.",
                    )}
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="irr">
                <div className="flex flex-col py-1">
                  <span className="font-medium">
                    {t("settings:return_metric_irr", "Internal Rate of Return (IRR)")}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {t(
                      "settings:return_metric_irr_desc",
                      "Iterative money-weighted return (XIRR) sensitive to cash flow timing and scale.",
                    )}
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="valueReturn">
                <div className="flex flex-col py-1">
                  <span className="font-medium">
                    {t("settings:return_metric_value_return", "Value Return")}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {t(
                      "settings:return_metric_value_return_desc",
                      "Net absolute value gain over starting capital.",
                    )}
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
