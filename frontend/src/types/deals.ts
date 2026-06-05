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
};
