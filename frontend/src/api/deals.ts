import type {
  AiDealReviewRequest,
  AiDealReviewResponse,
  DealEvaluationRequest,
  DealEvaluationResponse
} from "../types/deals";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function evaluateDeal(
  request: DealEvaluationRequest
): Promise<DealEvaluationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/deals/evaluate`, {
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

export async function analyzeDealWithAi(
  request: AiDealReviewRequest
): Promise<AiDealReviewResponse> {
  const response = await fetch(`${API_BASE_URL}/api/deals/analyze-ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<AiDealReviewResponse>;
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
