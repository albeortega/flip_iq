export type DealEvaluationRequest = {
  propertyAddress: string;
  purchasePrice: number;
  afterRepairValue: number;
  rehabCosts: number;
  financingCosts: number;
  holdingCosts: number;
  sellingCosts: number;
};

export type DealEvaluationResponse = {
  propertyAddress: string;
  purchasePrice: number;
  afterRepairValue: number;
  offerRulePercentage: number;
  ruleValue: number;
  rehabCosts: number;
  financingCosts: number;
  holdingCosts: number;
  sellingCosts: number;
  totalProjectCost: number;
  maximumOffer: number;
  projectedProfit: number;
  offerSpread: number;
  recommendation: "PASS" | "REVIEW" | string;
  maximumAllowableOffer?: number;
  dealScore?: number;
  scoreGrade?: string;
  riskLevel?: "Low" | "Medium" | "High" | string;
  riskReasons?: string[];
  roi?: number;
};

export type AiDealReviewRequest = DealEvaluationRequest & {
  purchasePrice: number;
  maximumAllowableOffer: number;
  projectedProfit: number;
  roi: number;
  dealScore: number;
  riskLevel: string;
};

export type AiDealReviewResponse = {
  summary: string;
  strengths: string[];
  warnings: string[];
  recommendation: string;
};

export type AddressSuggestion = {
  placeId: string;
  description: string;
};

export type AddressDetails = {
  placeId: string;
  formattedAddress: string;
  streetNumber: string | null;
  route: string | null;
  city: string | null;
  county: string | null;
  state: string | null;
  stateCode: string | null;
  zipCode: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type EnrichedPropertyResponse = AddressDetails & {
  address: string;
  zestimate?: number | null;
  estimatedValue?: number | null;
  lastSalePrice?: number | null;
  lastSaleDate?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  livingArea?: number | null;
};

export type FlipOpportunitySort =
  | "BEST_FLIP_SCORE"
  | "HIGHEST_PROFIT"
  | "HIGHEST_ROI"
  | "BIGGEST_DISCOUNT"
  | "LOWEST_LIST_PRICE"
  | "NEWEST_LISTING"
  | "BIGGEST_PRICE_DROP";

export type FlipOpportunityProperty = {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  propertyType: string | null;
  listPrice: number | null;
  estimatedValue: number | null;
  estimatedRehabCost: number | null;
  closingCosts: number | null;
  holdingCosts: number | null;
  estimatedProfit: number | null;
  roiPercent: number | null;
  discountPercent: number | null;
  priceDropAmount: number;
  daysOnMarket: number | null;
  rehabRisk: string;
  bedrooms: number | null;
  bathrooms: number | null;
  livingArea: number | null;
  yearBuilt: number | null;
  latitude: number | null;
  longitude: number | null;
  flipScore: number | null;
  recommendation: string;
  highlights: string[];
};

export type FlipOpportunityResponse = {
  zipCode: string;
  count: number;
  sort: FlipOpportunitySort;
  properties: FlipOpportunityProperty[];
};
