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
};
