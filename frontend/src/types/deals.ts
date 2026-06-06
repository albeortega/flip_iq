export type DealEvaluationRequest = {
  propertyAddress: string;
  afterRepairValue: number;
  repairCosts: number;
  holdingAndSellingCosts: number;
  profitBuffer: number;
};

export type DealEvaluationResponse = {
  propertyAddress: string;
  afterRepairValue: number;
  offerRulePercentage: number;
  ruleValue: number;
  repairCosts: number;
  holdingAndSellingCosts: number;
  profitBuffer: number;
  maximumOffer: number;
  estimatedSpread: number;
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
