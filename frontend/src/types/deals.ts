export type DealEvaluationRequest = {
  propertyAddress: string;
  purchasePrice: number;
  afterRepairValue: number;
  rehabCosts: number;
  financingCosts: number;
  holdingCosts: number;
  sellingCosts: number;
  profitBuffer: number;
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
  profitBuffer: number;
  totalProjectCost: number;
  maximumOffer: number;
  projectedProfit: number;
  offerSpread: number;
  recommendation: "PASS" | "REVIEW" | string;
  purchasePrice?: number;
  projectedProfit?: number;
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
