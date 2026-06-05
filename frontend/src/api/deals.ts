import type { DealEvaluationRequest, DealEvaluationResponse } from "../types/deals";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

type DealEvaluationApiRequest = DealEvaluationRequest & {
  repairCosts: number;
  holdingAndSellingCosts: number;
};

export async function evaluateDeal(
  request: DealEvaluationRequest
): Promise<DealEvaluationResponse> {
  const apiRequest: DealEvaluationApiRequest = {
    ...request,
    repairCosts: request.rehabCosts,
    holdingAndSellingCosts: request.holdingCosts + request.sellingCosts
  };

  const response = await fetch(`${API_BASE_URL}/api/deals/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(apiRequest)
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<DealEvaluationResponse>;
}

async function getErrorMessage(response: Response): Promise<string> {
  const fallback = `Deal evaluation failed with ${response.status}. Check the values and try again.`;

  try {
    const payload = (await response.json()) as {
      detail?: string;
      error?: string;
      errors?: string[];
      message?: string;
    };
    return payload.message ?? payload.detail ?? payload.errors?.join(" ") ?? payload.error ?? fallback;
  } catch {
    return fallback;
  }
}
