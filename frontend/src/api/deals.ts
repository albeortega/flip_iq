import type { DealEvaluationRequest, DealEvaluationResponse } from "../types/deals";

export async function evaluateDeal(
  request: DealEvaluationRequest
): Promise<DealEvaluationResponse> {
  const response = await fetch("/api/deals/evaluate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<DealEvaluationResponse>;
}

async function getErrorMessage(response: Response): Promise<string> {
  const fallback = "Deal evaluation failed. Check the values and try again.";

  try {
    const payload = (await response.json()) as { message?: string; error?: string };
    return payload.message ?? payload.error ?? fallback;
  } catch {
    return fallback;
  }
}
