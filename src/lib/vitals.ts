import { event } from "@/lib/analytics";
import type { NextWebVitalsMetric } from "next/app";

/**
 * Send Web Vitals metrics to Google Analytics
 */
export function sendToAnalytics(metric: NextWebVitalsMetric) {
  const { name, value, id } = metric;
  
  // Send to Google Analytics
  event({
    action: name,
    category: "Web Vitals",
    // Google Analytics will truncate this value to an integer.
    // For CLS, we need to multiply by 1000 for a useful value.
    value: Math.round(name === "CLS" ? value * 1000 : value),
    label: id,
  });
}
