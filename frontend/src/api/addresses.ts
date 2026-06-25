import type {
  AddressDetails,
  AddressSuggestion,
  EnrichedPropertyResponse,
  FlipOpportunityResponse,
  FlipOpportunitySort
} from "../types/deals";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function autocompleteAddresses(
  input: string,
  sessionToken: string
): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({
    input,
    sessionToken
  });

  const response = await fetch(`${API_BASE_URL}/api/addresses/autocomplete?${params.toString()}`);

  if (!response.ok) {
    throw new Error(await getAddressErrorMessage(response, "Address search failed."));
  }

  return response.json() as Promise<AddressSuggestion[]>;
}

export async function getAddressDetails(
  placeId: string,
  sessionToken: string
): Promise<AddressDetails> {
  const params = new URLSearchParams({
    placeId,
    sessionToken
  });

  const response = await fetch(`${API_BASE_URL}/api/addresses/details?${params.toString()}`);

  if (!response.ok) {
    throw new Error(await getAddressErrorMessage(response, "Address details failed."));
  }

  return response.json() as Promise<AddressDetails>;
}

export async function enrichPropertyFromAddress(params: {
  address: string;
  placeId?: string;
  sessionToken?: string;
}): Promise<EnrichedPropertyResponse> {
  const response = await fetch(`${API_BASE_URL}/api/properties/enrich`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error(await getAddressErrorMessage(response, "Property enrichment failed."));
  }

  return response.json() as Promise<EnrichedPropertyResponse>;
}

export async function searchFlipOpportunities(params: {
  zipCode: string;
  sort?: FlipOpportunitySort;
  limit?: number;
  minProfit?: number;
  minRoi?: number;
  minDiscount?: number;
}): Promise<FlipOpportunityResponse> {
  const searchParams = new URLSearchParams({
    zipCode: params.zipCode
  });
  if (params.sort) {
    searchParams.set("sort", params.sort);
  }
  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }
  if (params.minProfit != null) {
    searchParams.set("minProfit", String(params.minProfit));
  }
  if (params.minRoi != null) {
    searchParams.set("minRoi", String(params.minRoi));
  }
  if (params.minDiscount != null) {
    searchParams.set("minDiscount", String(params.minDiscount));
  }

  const response = await fetch(`${API_BASE_URL}/api/properties/flip-opportunities?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(await getAddressErrorMessage(response, "We could not load properties right now. Please try again."));
  }

  return response.json() as Promise<FlipOpportunityResponse>;
}

async function getAddressErrorMessage(response: Response, fallback: string): Promise<string> {
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
