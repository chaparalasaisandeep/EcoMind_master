/**
 * EcoMind AI Ultra — Carbon Forecasting Edge Function
 * Generates AI-powered emission predictions based on historical data.
 * Security: Input validation, safe calculations, no data leakage.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Simple exponential smoothing for forecasting
function exponentialSmoothing(data: number[], alpha = 0.3): number[] {
  if (data.length === 0) return [];
  const smoothed: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    smoothed.push(alpha * data[i] + (1 - alpha) * smoothed[i - 1]);
  }
  return smoothed;
}

function generateForecast(historicalData: number[], days = 7): number[] {
  if (historicalData.length < 3) {
    // Not enough data — return conservative estimates
    const avg = historicalData.length > 0
      ? historicalData.reduce((a, b) => a + b, 0) / historicalData.length
      : 15;
    return Array(days).fill(Math.round(avg * 10) / 10);
  }

  const smoothed = exponentialSmoothing(historicalData, 0.3);
  const trend = smoothed.length > 1
    ? smoothed[smoothed.length - 1] - smoothed[smoothed.length - 2]
    : 0;

  const lastValue = smoothed[smoothed.length - 1];
  const forecasts: number[] = [];

  for (let i = 1; i <= days; i++) {
    const forecast = Math.max(0, lastValue + trend * i);
    forecasts.push(Math.round(forecast * 10) / 10);
  }

  return forecasts;
}

function calculateConfidence(historicalData: number[]): number {
  if (historicalData.length < 7) return 0.5;
  if (historicalData.length < 14) return 0.65;
  if (historicalData.length < 30) return 0.75;
  return 0.85;
}

function determineTrend(historicalData: number[]): "improving" | "stable" | "worsening" {
  if (historicalData.length < 7) return "stable";

  const half = Math.floor(historicalData.length / 2);
  const firstHalf = historicalData.slice(0, half);
  const secondHalf = historicalData.slice(half);

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const change = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (change < -5) return "improving";
  if (change > 5) return "worsening";
  return "stable";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { historicalData, days = 7 } = body;

    if (!Array.isArray(historicalData)) {
      return new Response(
        JSON.stringify({ error: "historicalData must be an array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate all entries are numbers
    const validData = historicalData.filter((d): d is number => typeof d === "number" && !isNaN(d));

    const forecasts = generateForecast(validData, days);
    const confidence = calculateConfidence(validData);
    const trend = determineTrend(validData);

    // Generate reasoning
    let reasoning = "";
    if (trend === "improving") {
      reasoning = "Your emissions are trending downward. Keep up the good work! Your recent sustainable choices are making a measurable difference.";
    } else if (trend === "worsening") {
      reasoning = "Your emissions have increased recently. Consider reviewing your transport and energy habits for quick wins.";
    } else {
      reasoning = "Your emissions are stable. Small adjustments to daily habits could help you break through to the next level.";
    }

    return new Response(
      JSON.stringify({
        forecasts,
        confidence,
        trend,
        reasoning,
        generatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Forecast error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate forecast" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
