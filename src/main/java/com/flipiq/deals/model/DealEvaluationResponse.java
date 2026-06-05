package com.flipiq.deals.model;

import java.math.BigDecimal;

public record DealEvaluationResponse(
		String propertyAddress,
		BigDecimal afterRepairValue,
		BigDecimal offerRulePercentage,
		BigDecimal ruleValue,
		BigDecimal repairCosts,
		BigDecimal holdingAndSellingCosts,
		BigDecimal profitBuffer,
		BigDecimal maximumOffer,
		BigDecimal estimatedSpread,
		String recommendation) {
}
