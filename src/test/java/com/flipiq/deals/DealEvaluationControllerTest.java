package com.flipiq.deals;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;

import com.flipiq.deals.api.DealEvaluationController;
import com.flipiq.deals.model.DealEvaluationResponse;
import com.flipiq.deals.service.DealEvaluationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DealEvaluationController.class)
class DealEvaluationControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private DealEvaluationService dealEvaluationService;

	@Test
	void returnsEvaluationForValidRequest() throws Exception {
		when(dealEvaluationService.evaluate(any())).thenReturn(new DealEvaluationResponse(
				"123 Main Street",
				new BigDecimal("250000.00"),
				new BigDecimal("0.70"),
				new BigDecimal("175000.00"),
				new BigDecimal("35000.00"),
				new BigDecimal("15000.00"),
				new BigDecimal("25000.00"),
				new BigDecimal("100000.00"),
				new BigDecimal("100000.00"),
				"REVIEW"));

		mockMvc.perform(post("/api/deals/evaluate")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "propertyAddress": "123 Main Street",
								  "afterRepairValue": 250000,
								  "repairCosts": 35000,
								  "holdingAndSellingCosts": 15000,
								  "profitBuffer": 25000
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.maximumOffer").value(100000.00))
				.andExpect(jsonPath("$.recommendation").value("REVIEW"));
	}

	@Test
	void rejectsMissingNumbers() throws Exception {
		mockMvc.perform(post("/api/deals/evaluate")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{}"))
				.andExpect(status().isBadRequest());
	}
}
