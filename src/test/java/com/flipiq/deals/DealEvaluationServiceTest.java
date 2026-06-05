package com.flipiq.deals;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import com.flipiq.deals.model.DealEvaluationRequest;
import com.flipiq.deals.model.DealEvaluationResponse;
import com.flipiq.deals.service.DealEvaluationService;
import org.junit.jupiter.api.Test;

class DealEvaluationServiceTest {

	private final DealEvaluationService service = new DealEvaluationService();

	@Test
	void calculatesMaximumOfferUsingSeventyPercentRule() {
		DealEvaluationResponse response = service.evaluate(new DealEvaluationRequest(
				"123 Main Street",
				new BigDecimal("250000"),
				new BigDecimal("35000"),
				new BigDecimal("15000"),
				new BigDecimal("25000")));

		assertThat(response.ruleValue()).isEqualByComparingTo("175000.00");
		assertThat(response.maximumOffer()).isEqualByComparingTo("100000.00");
		assertThat(response.estimatedSpread()).isEqualByComparingTo("100000.00");
		assertThat(response.recommendation()).isEqualTo("REVIEW");
	}
}
