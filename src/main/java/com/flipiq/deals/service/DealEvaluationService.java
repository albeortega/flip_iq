package com.flipiq.deals.service;

import java.math.BigDecimal;

import com.flipiq.deals.model.DealEvaluationRequest;
import com.flipiq.deals.model.DealEvaluationResponse;
import org.springframework.stereotype.Service;

@Service
public class DealEvaluationService {

	private static final BigDecimal OFFER_RULE_PERCENTAGE = new BigDecimal("0.70");
	private static final int MONEY_SCALE = 2;

	public DealEvaluationResponse evaluate(DealEvaluationRequest request) {
		BigDecimal afterRepairValue = money(request.afterRepairValue());
		BigDecimal repairCosts = money(request.repairCosts());
		BigDecimal holdingAndSellingCosts = money(request.holdingAndSellingCosts());
		BigDecimal profitBuffer = money(request.profitBuffer());
		BigDecimal ruleValue = money(afterRepairValue.multiply(OFFER_RULE_PERCENTAGE));
		BigDecimal maximumOffer = money(ruleValue
				.subtract(repairCosts)
				.subtract(holdingAndSellingCosts)
				.subtract(profitBuffer));
		BigDecimal estimatedSpread = money(afterRepairValue
				.subtract(maximumOffer)
				.subtract(repairCosts)
				.subtract(holdingAndSellingCosts));

		return new DealEvaluationResponse(
				request.propertyAddress(),
				afterRepairValue,
				OFFER_RULE_PERCENTAGE,
				ruleValue,
				repairCosts,
				holdingAndSellingCosts,
				profitBuffer,
				maximumOffer,
				estimatedSpread,
				recommendation(maximumOffer));
	}

	private String recommendation(BigDecimal maximumOffer) {
		if (maximumOffer.signum() <= 0) {
			return "PASS";
		}
		return "REVIEW";
	}

	private BigDecimal money(BigDecimal value) {
		return value.setScale(MONEY_SCALE);
	}
}
