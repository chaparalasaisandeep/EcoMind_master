/**
 * EcoMind AI Ultra — Digital Twin Edge Function
 * Simulates lifestyle changes and projects carbon impact.
 * Security: Input validation, parameter bounds checking, safe calculations.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Baseline monthly emissions by category (kg CO2e)
const BASELINE_EMISSIONS: Record<string, number> = {
  transport: 120,
  food: 80,
  shopping: 60,
  energy: 100,
  travel: 40,
};

// Reduction factors per scenario type
const SCENARIO_REDUCTIONS: Record<string, Record<string, number>> = {
  public_transport: { transport: 0.35, travel: 0.1 },
  vegetarian: { food: 0.45 },
  reduced_shopping: { shopping: 0.3 },
  renewable_energy: { energy: 0.6 },
  current: {},
  custom: {},
};

// Cost savings per kg CO2e reduced
const COST_SAVINGS: Record<string, number> = {
  transport: 0.15,
  food: 0.08,
  shopping: 0.25,
  energy: 0.12,
  travel: 0.2,
};

interface ScenarioParams {
  userId: string;
  scenarioType: string;
  parameters: Record<string, number>;
}

function validateParams(params: ScenarioParams): { valid: boolean; error?: string } {
  if (!params.userId || typeof params.userId !== "string") {
    return { valid: false, error: "Invalid userId" };
  }
  if (!params.scenarioType || typeof params.scenarioType !== "string") {
    return { valid: false, error: "Invalid scenarioType" };
  }
  const validTypes = ["current", "public_transport", "vegetarian", "reduced_shopping", "renewable_energy", "custom"];
  if (!validTypes.includes(params.scenarioType)) {
    return { valid: false, error: "Invalid scenario type" };
  }
  return { valid: true };
}

function calculateScenario(scenarioType: string, parameters: Record<string, number>) {
  const baselineTotal = Object.values(BASELINE_EMISSIONS).reduce((a, b) => a + b, 0);
  const reductions = SCENARIO_REDUCTIONS[scenarioType] || {};

  let totalReduction = 0;
  let totalMoneySaved = 0;
  const categoryImpacts: Record<string, { baseline: number; new: number; reduction: number }> = {};

  for (const [category, baseline] of Object.entries(BASELINE_EMISSIONS)) {
    const reductionPercent = reductions[category] || 0;
    const customParam = parameters[category] || 0;
    const totalReductionPercent = Math.min(0.95, reductionPercent + customParam / 100);
    const reduction = baseline * totalReductionPercent;
    const newEmission = baseline - reduction;

    totalReduction += reduction;
    totalMoneySaved += reduction * (COST_SAVINGS[category] || 0);

    categoryImpacts[category] = {
      baseline,
      new: Math.round(newEmission * 10) / 10,
      reduction: Math.round(reduction * 10) / 10,
    };
  }

  const projectedCarbon = baselineTotal - totalReduction;
  const carbonReductionPercent = baselineTotal > 0 ? (totalReduction / baselineTotal) * 100 : 0;
  const sustainabilityScore = Math.min(100, Math.round(50 + carbonReductionPercent * 0.5));

  // Calculate success probability based on change magnitude
  const changeMagnitude = Object.values(reductions).reduce((a, b) => a + b, 0) / Object.keys(BASELINE_EMISSIONS).length;
  const successProbability = Math.max(0.3, Math.min(0.95, 0.9 - changeMagnitude));

  return {
    projectedCarbonKg: Math.round(projectedCarbon * 10) / 10,
    projectedSavingsKg: Math.round(totalReduction * 10) / 10,
    projectedMoneySaved: Math.round(totalMoneySaved * 100) / 100,
    carbonReductionPercent: Math.round(carbonReductionPercent * 10) / 10,
    sustainabilityScore,
    successProbability: Math.round(successProbability * 100) / 100,
    categoryImpacts,
    environmentalImpact: generateEnvironmentalImpact(totalReduction),
  };
}

function generateEnvironmentalImpact(totalReductionKg: number): string {
  const treesEquivalent = Math.round(totalReductionKg / 20); // ~20kg CO2e per tree/year
  const carKmEquivalent = Math.round(totalReductionKg / 0.17); // ~0.17kg per km

  if (totalReductionKg > 100) {
    return `This change is equivalent to planting ${treesEquivalent} trees or avoiding ${carKmEquivalent}km of driving per month. You're making a significant impact!`;
  } else if (totalReductionKg > 50) {
    return `This change is equivalent to planting ${treesEquivalent} trees per month. A meaningful step toward sustainability!`;
  } else {
    return `Every kg counts! This saves ${Math.round(totalReductionKg)}kg CO2e monthly — small changes compound into major impact over time.`;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { userId, scenarioType, parameters = {} } = body;

    const validation = validateParams({ userId, scenarioType, parameters });
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = calculateScenario(scenarioType, parameters);

    return new Response(
      JSON.stringify({
        scenarioName: `${scenarioType.charAt(0).toUpperCase() + scenarioType.slice(1).replace(/_/g, " ")} Scenario`,
        ...result,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Digital Twin error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate scenario" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
