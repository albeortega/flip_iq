import { FormEvent, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { searchFlipOpportunities } from "./api/addresses";
import { analyzeDealWithAi, evaluateDeal } from "./api/deals";
import flipIqLogo from "./assets/flipiq-logo-primary.jpeg";
import AddressSearchInput from "./components/AddressSearchInput";
import type {
  AiDealReviewResponse,
  DealEvaluationRequest,
  DealEvaluationResponse,
  EnrichedPropertyResponse,
  FlipOpportunityProperty,
  FlipOpportunityResponse,
  FlipOpportunitySort
} from "./types/deals";

type DealFormState = {
  propertyAddress: string;
  purchasePrice: string;
  afterRepairValue: string;
  maoRulePercentage: string;
  holdingAndSellingCosts: string;
  estimatedValue: string;
  lastSalePrice: string;
  lastSaleDate: string;
  bedrooms: string;
  bathrooms: string;
  livingArea: string;
  googlePlaceId: string;
  formattedAddress: string;
  streetNumber: string;
  route: string;
  city: string;
  county: string;
  state: string;
  stateCode: string;
  zipCode: string;
  country: string;
  latitude: string;
  longitude: string;
};

type AnalysisMode = "address" | "zip";

type DealAnalysis = {
  repairCosts: number;
  maximumAllowableOffer: number;
  priceVsMao: number;
  isOfferAcceptable: boolean;
  loanAmount: number;
  monthlyPayment: number;
  totalInterestCost: number;
  pointsCost: number;
  totalFinancingCost: number;
  totalProjectCost: number;
  projectedProfit: number;
  roi: number;
  profitMargin: number;
  dealScore: number;
  scoreGrade: string;
  recommendation: string;
  riskLevel: string;
  riskReasons: string[];
  monthlyCashFlow: number;
  annualCashFlow: number;
  capRate: number;
  cashOnCashReturn: number;
  dscr: number;
  averagePricePerSqFt: number;
  estimatedArvFromComps: number;
  sensitivity: Array<{ name: string; profit: number; roi: number }>;
};

const initialFormState: DealFormState = {
  propertyAddress: "",
  purchasePrice: "",
  afterRepairValue: "",
  maoRulePercentage: "",
  holdingAndSellingCosts: "",
  estimatedValue: "",
  lastSalePrice: "",
  lastSaleDate: "",
  bedrooms: "",
  bathrooms: "",
  livingArea: "",
  googlePlaceId: "",
  formattedAddress: "",
  streetNumber: "",
  route: "",
  city: "",
  county: "",
  state: "",
  stateCode: "",
  zipCode: "",
  country: "",
  latitude: "",
  longitude: ""
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1
});

const sortOptions: Array<{ value: FlipOpportunitySort; label: string }> = [
  { value: "BEST_FLIP_SCORE", label: "Best Flip Score" },
  { value: "HIGHEST_PROFIT", label: "Highest Estimated Profit" },
  { value: "HIGHEST_ROI", label: "Highest ROI" },
  { value: "BIGGEST_DISCOUNT", label: "Biggest Discount" },
  { value: "LOWEST_LIST_PRICE", label: "Lowest List Price" },
  { value: "NEWEST_LISTING", label: "Newest Listing" },
  { value: "BIGGEST_PRICE_DROP", label: "Biggest Price Drop" }
];

export default function App() {
  const [form, setForm] = useState<DealFormState>(initialFormState);
  const [result, setResult] = useState<DealEvaluationResponse | null>(null);
  const [aiReview, setAiReview] = useState<AiDealReviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("address");
  const [zipOpportunities, setZipOpportunities] = useState<FlipOpportunityResponse | null>(null);
  const [zipError, setZipError] = useState<string | null>(null);
  const [isZipSearching, setIsZipSearching] = useState(false);
  const [zipSort, setZipSort] = useState<FlipOpportunitySort>("BEST_FLIP_SCORE");

  const analysis = useMemo(() => calculateAnalysis(form), [form]);
  const hasAddressAnalysis = Boolean(form.formattedAddress);
  const hasAnalysisStarted = hasAddressAnalysis;
  const showPropertyAutofill = analysisMode === "address" && hasAddressAnalysis;
  const canSubmit = !isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextValidationError = getValidationError(form);
    if (nextValidationError) {
      setError(nextValidationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await evaluateDeal(toRequest(form, analysis));
      setResult(response);
    } catch (caughtError) {
      setResult(null);
      setError(caughtError instanceof Error ? caughtError.message : "Unexpected error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAiReview() {
    setIsAiLoading(true);
    setAiError(null);

    try {
      const response = await analyzeDealWithAi({
        ...toRequest(form, analysis),
        purchasePrice: toNumber(form.purchasePrice),
        maximumAllowableOffer: analysis.maximumAllowableOffer,
        projectedProfit: analysis.projectedProfit,
        roi: analysis.roi,
        dealScore: analysis.dealScore,
        riskLevel: analysis.riskLevel
      });
      setAiReview(response);
    } catch (caughtError) {
      setAiReview(getFallbackAiReview(analysis));
      setAiError(
        caughtError instanceof Error
          ? `${caughtError.message} Showing a local review instead.`
          : "AI review is unavailable. Showing a local review instead."
      );
    } finally {
      setIsAiLoading(false);
    }
  }

  function handleExportPdf() {
    const lines = [
      "FlipIQ Investor Report",
      `Property: ${form.propertyAddress}`,
      `Purchase Price: ${currencyFormatter.format(toNumber(form.purchasePrice))}`,
      `ARV: ${currencyFormatter.format(toNumber(form.afterRepairValue))}`,
      `MAO: ${currencyFormatter.format(analysis.maximumAllowableOffer)}`,
      `Projected Profit: ${currencyFormatter.format(analysis.projectedProfit)}`,
      `ROI: ${numberFormatter.format(analysis.roi)}%`,
      `Deal Score: ${analysis.dealScore} (${analysis.scoreGrade})`,
      `Risk Level: ${analysis.riskLevel}`,
      `Recommendation: ${analysis.recommendation}`
    ];
    const blob = new Blob([createSimplePdf(lines)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(form.propertyAddress || "flipiq-deal")}-report.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handlePropertyEnriched(property: EnrichedPropertyResponse) {
    const estimatedValue = property.estimatedValue ?? property.zestimate;
    const livingArea = property.livingArea;

    setAnalysisMode("address");
    clearZipSearch();
    setForm((current) => ({
      ...current,
      propertyAddress: property.formattedAddress || property.address || current.propertyAddress,
      afterRepairValue: estimatedValue == null ? current.afterRepairValue : String(estimatedValue),
      purchasePrice:
        property.lastSalePrice == null || current.purchasePrice
          ? current.purchasePrice
          : String(property.lastSalePrice),
      estimatedValue: estimatedValue == null ? "" : String(estimatedValue),
      lastSalePrice: property.lastSalePrice == null ? "" : String(property.lastSalePrice),
      lastSaleDate: property.lastSaleDate ?? "",
      bedrooms: property.bedrooms == null ? "" : String(property.bedrooms),
      bathrooms: property.bathrooms == null ? "" : String(property.bathrooms),
      livingArea: livingArea == null ? "" : String(livingArea),
      googlePlaceId: property.placeId,
      formattedAddress: property.formattedAddress,
      streetNumber: property.streetNumber ?? "",
      route: property.route ?? "",
      city: property.city ?? "",
      county: property.county ?? "",
      state: property.state ?? "",
      stateCode: property.stateCode ?? "",
      zipCode: property.zipCode ?? "",
      country: property.country ?? "",
      latitude: property.latitude?.toString() ?? "",
      longitude: property.longitude?.toString() ?? ""
    }));
  }

  function resetAnalysis() {
    setForm(initialFormState);
    setResult(null);
    setAiReview(null);
    setError(null);
    setAiError(null);
    setAnalysisMode("address");
    setZipOpportunities(null);
    setZipError(null);
    setIsZipSearching(false);
    setZipSort("BEST_FLIP_SCORE");
  }

  function clearAnalysisOutputs() {
    setResult(null);
    setAiReview(null);
    setError(null);
    setAiError(null);
  }

  function handleAnalysisModeChange(_: unknown, nextMode: AnalysisMode | null) {
    if (!nextMode || nextMode === analysisMode) {
      return;
    }

    setAnalysisMode(nextMode);
    setForm(initialFormState);
    clearAnalysisOutputs();
    clearZipSearch();
  }

  function handleAddressInputChange(value: string) {
    clearZipSearch();
    setForm((current) => ({
      ...current,
      propertyAddress: value,
      googlePlaceId: "",
      formattedAddress: "",
      streetNumber: "",
      route: "",
      city: "",
      county: "",
      state: "",
      stateCode: "",
      zipCode: "",
      country: "",
      latitude: "",
      longitude: "",
      estimatedValue: "",
      lastSalePrice: "",
      lastSaleDate: "",
      bedrooms: "",
      bathrooms: "",
      livingArea: ""
    }));
    clearAnalysisOutputs();
  }

  function handleZipCodeChange(value: string) {
    const nextZipCode = value.replace(/\D/g, "").slice(0, 5);
    setZipOpportunities(null);
    setZipError(null);
    setForm((current) => ({
      ...current,
      propertyAddress: "",
      googlePlaceId: "",
      formattedAddress: "",
      streetNumber: "",
      route: "",
      city: "",
      county: "",
      state: "",
      stateCode: "",
      zipCode: nextZipCode,
      country: "",
      latitude: "",
      longitude: "",
      estimatedValue: "",
      lastSalePrice: "",
      lastSaleDate: "",
      bedrooms: "",
      bathrooms: "",
      livingArea: ""
    }));
    clearAnalysisOutputs();
  }

  function clearZipSearch() {
    setZipOpportunities(null);
    setZipError(null);
    setIsZipSearching(false);
  }

  async function handleZipSearch(nextSort: FlipOpportunitySort = zipSort) {
    if (!isValidZipCode(form.zipCode)) {
      setZipError("Please enter a valid 5-digit ZIP code.");
      return;
    }

    clearAnalysisOutputs();
    setZipError(null);
    setIsZipSearching(true);

    try {
      const response = await searchFlipOpportunities({
        zipCode: form.zipCode,
        sort: nextSort
      });
      setZipOpportunities(response);
    } catch (caughtError) {
      console.error(caughtError);
      setZipOpportunities(null);
      setZipError("We could not load properties right now. Please try again.");
    } finally {
      setIsZipSearching(false);
    }
  }

  function handleZipSortChange(nextSort: FlipOpportunitySort) {
    setZipSort(nextSort);
    if (zipOpportunities && isValidZipCode(form.zipCode)) {
      void handleZipSearch(nextSort);
    }
  }

  function handleAnalyzeOpportunity(property: FlipOpportunityProperty) {
    const holdingAndSellingCosts = nullableSum(
      property.estimatedRehabCost,
      property.closingCosts,
      property.holdingCosts
    );

    setAnalysisMode("address");
    setZipOpportunities(null);
    setZipError(null);
    setForm((current) => ({
      ...current,
      propertyAddress: property.address,
      purchasePrice: toOptionalString(property.listPrice),
      afterRepairValue: toOptionalString(property.estimatedValue),
      holdingAndSellingCosts: toOptionalString(holdingAndSellingCosts),
      estimatedValue: toOptionalString(property.estimatedValue),
      lastSalePrice: "",
      lastSaleDate: "",
      bedrooms: property.bedrooms == null ? "" : String(property.bedrooms),
      bathrooms: property.bathrooms == null ? "" : String(property.bathrooms),
      livingArea: toOptionalString(property.livingArea),
      googlePlaceId: "",
      formattedAddress: property.address,
      streetNumber: "",
      route: "",
      city: property.city ?? "",
      county: "",
      state: property.state ?? "",
      stateCode: property.state ?? "",
      zipCode: property.zipCode ?? form.zipCode,
      country: "",
      latitude: property.latitude?.toString() ?? "",
      longitude: property.longitude?.toString() ?? ""
    }));
  }

  return (
    <Box component="main" className="app-shell">
      <Container maxWidth="xl" className="page-container">
        <Stack spacing={3} className="page-stack">
          <Box className="top-bar">
            <Box className="brand-lockup" aria-label="FlipIQ">
              <Box component="img" src={flipIqLogo} alt="FlipIQ" className="brand-logo" />
            </Box>
            <Stack component="nav" direction="row" spacing={2.25} className="nav-links">
              <Typography>Analyzer</Typography>
              <Typography>Comps</Typography>
            </Stack>
            <Button variant="outlined" href="#deal-form" onClick={resetAnalysis}>
              New Analysis
            </Button>
          </Box>

          <Box className={hasAnalysisStarted ? "analysis-grid" : "analysis-grid analysis-grid-start"}>
            <Stack spacing={3}>
              <Paper component="section" elevation={0} className="deal-panel" id="deal-form">
                <Stack
                  component="form"
                  spacing={3}
                  className="deal-form-stack"
                  onSubmit={handleSubmit}
                  noValidate
                  aria-label="Deal evaluation form"
                >
                  <SectionHeader
                    eyebrow="Deal worksheet"
                    title={hasAnalysisStarted ? "Property and offer inputs" : "Start a new analysis"}
                  />
                  {error ? <Alert severity="error">{error}</Alert> : null}

                <Box className="analysis-entry-stack">
                  <ToggleButtonGroup
                    exclusive
                    value={analysisMode}
                    onChange={handleAnalysisModeChange}
                    className="analysis-mode-toggle"
                    aria-label="Analysis start method"
                  >
                    <ToggleButton value="address">Property address</ToggleButton>
                    <ToggleButton value="zip">ZIP code</ToggleButton>
                  </ToggleButtonGroup>

                  {analysisMode === "address" ? (
                    <AddressSearchInput
                      value={form.propertyAddress}
                      onInputChange={handleAddressInputChange}
                      onPropertyEnriched={handlePropertyEnriched}
                    />
                  ) : (
                    <Stack spacing={2}>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "flex-start" }}>
                        <TextField
                          label="ZIP code"
                          value={form.zipCode}
                          onChange={(event) => handleZipCodeChange(event.target.value)}
                          placeholder="33101"
                          error={Boolean(zipError && !isValidZipCode(form.zipCode))}
                          helperText={zipError && !isValidZipCode(form.zipCode) ? zipError : "Must be exactly 5 digits."}
                          slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 5 } }}
                          fullWidth
                        />
                        <Button
                          type="button"
                          variant="contained"
                          size="large"
                          className="zip-continue-button"
                          disabled={!isValidZipCode(form.zipCode) || isZipSearching}
                          startIcon={isZipSearching ? <CircularProgress color="inherit" size={18} /> : null}
                          onClick={() => void handleZipSearch()}
                        >
                          {isZipSearching ? "Searching" : "Search"}
                        </Button>
                      </Stack>
                      {zipError && isValidZipCode(form.zipCode) ? <Alert severity="error">{zipError}</Alert> : null}
                    </Stack>
                  )}
                </Box>

                {hasAnalysisStarted ? (
                  <>
                    <Box className="field-grid">
                      <CurrencyField
                        label="Purchase price"
                        value={form.purchasePrice}
                        onChange={(value) => setForm((current) => ({ ...current, purchasePrice: value }))}
                      />
                      <CurrencyField
                        label="After-repair value"
                        value={form.afterRepairValue}
                        min="0.01"
                        onChange={(value) =>
                          setForm((current) => ({ ...current, afterRepairValue: value }))
                        }
                      />
                      <NumberField
                        label="MAO rule percentage"
                        value={form.maoRulePercentage}
                        suffix="%"
                        onChange={(value) =>
                          setForm((current) => ({ ...current, maoRulePercentage: value }))
                        }
                      />
                      <CurrencyField
                        label="Reparation and selling cost"
                        value={form.holdingAndSellingCosts}
                        onChange={(value) =>
                          setForm((current) => ({ ...current, holdingAndSellingCosts: value }))
                        }
                      />
                    </Box>

                    {showPropertyAutofill ? (
                      <Box className="field-grid">
                        <CurrencyField label="Estimated value" value={form.estimatedValue} readOnly />
                        <CurrencyField label="Last sale price" value={form.lastSalePrice} readOnly />
                        <TextField
                          label="Last sale date"
                          type="date"
                          value={form.lastSaleDate}
                          slotProps={{
                            htmlInput: { readOnly: true },
                            inputLabel: { shrink: true }
                          }}
                          fullWidth
                        />
                        <NumberField label="Bedrooms" value={form.bedrooms} suffix="beds" readOnly />
                        <NumberField label="Bathrooms" value={form.bathrooms} suffix="baths" readOnly />
                        <NumberField label="Living area" value={form.livingArea} suffix="sq ft" readOnly />
                      </Box>
                    ) : null}

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} className="form-actions">
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={!canSubmit}
                        startIcon={isSubmitting ? <CircularProgress color="inherit" size={18} /> : null}
                      >
                        {isSubmitting ? "Evaluating" : "Evaluate Deal"}
                      </Button>
                      <Button type="button" variant="outlined" size="large" onClick={handleAiReview}>
                        {isAiLoading ? "Analyzing" : "Analyze This Deal"}
                      </Button>
                      <Button type="button" variant="text" size="large" onClick={handleExportPdf}>
                        Export PDF Report
                      </Button>
                    </Stack>
                  </>
                ) : null}
                </Stack>
              </Paper>

              {hasAddressAnalysis ? (
                <Box className="hero-band">
                  <Box>
                    <Typography variant="h1" className="hero-title">
                      Deal Analyzer
                    </Typography>
                    <Typography color="text.secondary" className="lede">
                      Model MAO, property value, offer spread, projected profit, and risk in one worksheet.
                    </Typography>
                  </Box>
                  <Box className="hero-metrics">
                    <Metric label="MAO" value={currencyFormatter.format(analysis.maximumAllowableOffer)} />
                    <Metric label="Score" value={`${analysis.dealScore}/100`} tone={scoreTone(analysis.dealScore)} />
                    <Metric label="Risk" value={analysis.riskLevel} tone={riskTone(analysis.riskLevel)} />
                  </Box>
                </Box>
              ) : null}

              {analysisMode === "zip" ? (
                <FlipOpportunitiesPanel
                  response={zipOpportunities}
                  zipCode={form.zipCode}
                  sort={zipSort}
                  isLoading={isZipSearching}
                  onSortChange={handleZipSortChange}
                  onAnalyze={handleAnalyzeOpportunity}
                />
              ) : null}
            </Stack>

            {hasAnalysisStarted ? (
              <Stack spacing={3}>
                <MaoCard analysis={analysis} form={form} />
                <DealScoreCard analysis={analysis} />
                <RiskMeter analysis={analysis} />
                <ResultPanel result={result} analysis={analysis} />
                <SensitivityPanel analysis={analysis} />
                <AiReviewPanel review={aiReview} error={aiError} />
              </Stack>
            ) : null}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

function FlipOpportunitiesPanel({
  response,
  zipCode,
  sort,
  isLoading,
  onSortChange,
  onAnalyze
}: {
  response: FlipOpportunityResponse | null;
  zipCode: string;
  sort: FlipOpportunitySort;
  isLoading: boolean;
  onSortChange: (sort: FlipOpportunitySort) => void;
  onAnalyze: (property: FlipOpportunityProperty) => void;
}) {
  if (!response && !isLoading) {
    return null;
  }

  return (
    <Paper elevation={0} className="flip-opportunities-panel">
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ md: "center" }}
        >
          <SectionHeader eyebrow="ZIP opportunity finder" title="Best flip deals" />
          <TextField
            select
            label="Sort"
            value={sort}
            className="flip-sort-select"
            onChange={(event) => onSortChange(event.target.value as FlipOpportunitySort)}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {isLoading ? (
          <Stack direction="row" spacing={1.5} alignItems="center" className="zip-loading-state">
            <CircularProgress color="inherit" size={20} />
            <Typography>Finding the best flip opportunities near {zipCode}...</Typography>
          </Stack>
        ) : null}

        {!isLoading && response && response.properties.length === 0 ? (
          <Alert severity="info">
            No strong flip opportunities found in this ZIP code. Try another ZIP code or lower the filters.
          </Alert>
        ) : null}

        {!isLoading && response && response.properties.length > 0 ? (
          <Stack spacing={1.5}>
            <Typography color="text.secondary">
              Showing {response.count} active properties with enough data to calculate flip metrics.
            </Typography>
            {response.properties.map((property, index) => (
              <FlipOpportunityCard
                key={property.id}
                property={property}
                rank={index + 1}
                onAnalyze={onAnalyze}
              />
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}

function FlipOpportunityCard({
  property,
  rank,
  onAnalyze
}: {
  property: FlipOpportunityProperty;
  rank: number;
  onAnalyze: (property: FlipOpportunityProperty) => void;
}) {
  const bedBathArea = [
    property.propertyType,
    property.bedrooms == null ? null : `${property.bedrooms} bd`,
    property.bathrooms == null ? null : `${numberFormatter.format(property.bathrooms)} ba`,
    property.livingArea == null ? null : `${numberFormatter.format(property.livingArea)} sqft`
  ].filter(Boolean);

  return (
    <Box className="flip-opportunity-card">
      <Stack spacing={1.6}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip
              label={property.recommendation}
              className={`opportunity-badge ${recommendationClass(property.recommendation)}`}
            />
            <Typography className="opportunity-rank">#{rank} Best Flip Deal</Typography>
          </Stack>
          <Typography className="opportunity-score">
            Flip Score: {property.flipScore == null ? "N/A" : `${property.flipScore}/100`}
          </Typography>
        </Stack>

        <Box>
          <Typography variant="h3" className="opportunity-address">
            {property.address}
          </Typography>
          <Typography color="text.secondary">{bedBathArea.join(" • ")}</Typography>
        </Box>

        <Box className="opportunity-metrics">
          <ResultMetric label="List Price" value={formatCurrencyValue(property.listPrice)} />
          <ResultMetric label="Estimated Value" value={formatCurrencyValue(property.estimatedValue)} />
          <ResultMetric label="Estimated Profit" value={formatCurrencyValue(property.estimatedProfit)} />
          <ResultMetric label="ROI" value={formatPercentValue(property.roiPercent)} />
          <ResultMetric label="Discount" value={formatPercentValue(property.discountPercent)} />
          <ResultMetric label="Price Drop" value={formatCurrencyValue(property.priceDropAmount)} />
        </Box>

        <Stack spacing={0.6}>
          <Typography className="summary-title">Highlights</Typography>
          {property.highlights.map((highlight) => (
            <Typography color="text.secondary" key={highlight}>
              {highlight}
            </Typography>
          ))}
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} className="opportunity-actions">
          <Button type="button" variant="outlined" onClick={() => onAnalyze(property)}>
            Analyze Deal
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography className="eyebrow">{eyebrow}</Typography>
      <Typography variant="h2">{title}</Typography>
    </Stack>
  );
}

function CurrencyField({
  label,
  value,
  min = "0",
  onChange,
  readOnly = false
}: {
  label: string;
  value: string;
  min?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <TextField
      label={label}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      type="number"
      slotProps={{ htmlInput: { min, readOnly, step: "0.01" } }}
      fullWidth
      required={!readOnly}
    />
  );
}

function NumberField({
  label,
  value,
  suffix,
  onChange,
  readOnly = false
}: {
  label: string;
  value: string;
  suffix: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <TextField
      label={`${label} (${suffix})`}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      type="number"
      slotProps={{ htmlInput: { min: "0", readOnly, step: "0.01" } }}
      fullWidth
      required={!readOnly}
    />
  );
}

function MaoCard({ analysis, form }: { analysis: DealAnalysis; form: DealFormState }) {
  return (
    <Paper elevation={0} className="insight-card">
      <SectionHeader eyebrow="Maximum Allowable Offer" title="MAO analysis" />
      <Box className="result-grid">
        <ResultMetric label="ARV" value={currencyFormatter.format(toNumber(form.afterRepairValue))} />
        <ResultMetric label="MAO percentage" value={`${toNumber(form.maoRulePercentage)}%`} />
        <ResultMetric
          label="Calculated MAO"
          value={currencyFormatter.format(analysis.maximumAllowableOffer)}
        />
        <ResultMetric
          label="Purchase vs MAO"
          value={currencyFormatter.format(Math.abs(analysis.priceVsMao))}
        />
      </Box>
      <Alert severity={analysis.isOfferAcceptable ? "success" : "warning"} className="section-alert">
        {analysis.isOfferAcceptable
          ? "This deal is within the recommended offer range."
          : "This purchase price is above the recommended maximum offer."}
      </Alert>
    </Paper>
  );
}

function DealScoreCard({ analysis }: { analysis: DealAnalysis }) {
  return (
    <Paper elevation={0} className={`insight-card score-${scoreTone(analysis.dealScore)}`}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
        <Box className="score-ring">{analysis.dealScore}</Box>
        <Box>
          <Typography className="eyebrow">Deal Score</Typography>
          <Typography variant="h2">{analysis.dealScore} / 100</Typography>
          <Typography color="text.secondary">Grade: {analysis.scoreGrade}</Typography>
          <Typography>{analysis.recommendation}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function RiskMeter({ analysis }: { analysis: DealAnalysis }) {
  return (
    <Paper elevation={0} className="insight-card">
      <SectionHeader eyebrow="Risk meter" title={`Risk Level: ${analysis.riskLevel}`} />
      <Box className={`risk-bar risk-${riskTone(analysis.riskLevel)}`}>
        <span />
      </Box>
      <Stack spacing={0.75}>
        {analysis.riskReasons.map((reason) => (
          <Typography key={reason} color="text.secondary">
            {reason}
          </Typography>
        ))}
      </Stack>
    </Paper>
  );
}

function ResultPanel({
  result,
  analysis
}: {
  result: DealEvaluationResponse | null;
  analysis: DealAnalysis;
}) {
  return (
    <Paper elevation={0} className="insight-card">
      <SectionHeader eyebrow="Profit calculation" title="Expected flip outcome" />
      <Box className="result-grid">
        <ResultMetric label="Projected profit" value={currencyFormatter.format(analysis.projectedProfit)} />
        <ResultMetric label="ROI" value={`${numberFormatter.format(analysis.roi)}%`} />
        <ResultMetric label="Total project cost" value={currencyFormatter.format(analysis.totalProjectCost)} />
        <ResultMetric
          label="Backend max offer"
          value={result ? currencyFormatter.format(result.maximumOffer) : "Run evaluation"}
        />
      </Box>
      {result ? (
        <Chip
          label={`API recommendation: ${result.recommendation}`}
          color={result.recommendation === "PASS" ? "error" : "primary"}
          className="section-chip"
        />
      ) : null}
    </Paper>
  );
}

function SensitivityPanel({ analysis }: { analysis: DealAnalysis }) {
  return (
    <Paper elevation={0} className="insight-card">
      <SectionHeader eyebrow="Sensitivity analysis" title="Best, expected, and worst case" />
      <Box className="scenario-table">
        <Typography>Scenario</Typography>
        <Typography>Profit</Typography>
        <Typography>ROI</Typography>
        {analysis.sensitivity.map((scenario) => (
          <Box className="scenario-row" key={scenario.name}>
            <Typography>{scenario.name}</Typography>
            <Typography>
              {currencyFormatter.format(scenario.profit)}
            </Typography>
            <Typography>{numberFormatter.format(scenario.roi)}%</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function AiReviewPanel({
  review,
  error
}: {
  review: AiDealReviewResponse | null;
  error: string | null;
}) {
  return (
    <Paper elevation={0} className="insight-card">
      <SectionHeader eyebrow="AI Deal Review" title="Plain-English explanation" />
      {error ? <Alert severity="info">{error}</Alert> : null}
      {review ? (
        <Stack spacing={1.5}>
          <Typography>{review.summary}</Typography>
          <SummaryList title="Strengths" items={review.strengths} />
          <SummaryList title="Warnings" items={review.warnings} />
          <Typography>
            <strong>Recommendation:</strong> {review.recommendation}
          </Typography>
        </Stack>
      ) : (
        <Typography color="text.secondary">Run Analyze This Deal to generate the review.</Typography>
      )}
    </Paper>
  );
}

function SummaryList({ title, items }: { title: string; items: string[] }) {
  return (
    <Box>
      <Typography className="summary-title">{title}</Typography>
      <Stack spacing={0.5}>
        {items.map((item) => (
          <Typography color="text.secondary" key={item}>
            {item}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}

function Metric({
  label,
  value,
  tone = "neutral"
}: {
  label: string;
  value: string;
  tone?: "green" | "yellow" | "red" | "neutral";
}) {
  return (
    <Box className={`metric metric-${tone}`}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography>{value}</Typography>
    </Box>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <Box className="result-metric">
      <Typography color="text.secondary">{label}</Typography>
      <Typography>{value}</Typography>
    </Box>
  );
}

function calculateAnalysis(form: DealFormState): DealAnalysis {
  const purchasePrice = toNumber(form.purchasePrice);
  const arv = toNumber(form.afterRepairValue);
  const maoRule = toNumber(form.maoRulePercentage) / 100 || 0.7;
  const repairCosts = 0;
  const holdingAndSellingCosts = toNumber(form.holdingAndSellingCosts);
  const maximumAllowableOffer = arv * maoRule - repairCosts;
  const priceVsMao = purchasePrice - maximumAllowableOffer;
  const isOfferAcceptable = purchasePrice <= maximumAllowableOffer;
  const loanAmount = 0;
  const monthlyPayment = 0;
  const totalInterestCost = 0;
  const pointsCost = 0;
  const totalFinancingCost = totalInterestCost + pointsCost;
  const totalProjectCost = purchasePrice + repairCosts + holdingAndSellingCosts + totalFinancingCost;
  const projectedProfit = arv - totalProjectCost;
  const cashInvested = Math.max(1, purchasePrice - loanAmount + repairCosts + pointsCost);
  const roi = (projectedProfit / cashInvested) * 100;
  const profitMargin = safeDivide(projectedProfit, arv) * 100;
  const score = getDealScore({
    profitMargin,
    roi,
    isOfferAcceptable,
    holdingAndSellingCosts
  });
  const riskReasons = getRiskReasons({
    profitMargin,
    isOfferAcceptable
  });
  const riskLevel = riskReasons.length >= 4 ? "High" : riskReasons.length >= 2 ? "Medium" : "Low";
  const monthlyCashFlow = 0;
  const annualCashFlow = 0;
  const capRate = 0;
  const cashOnCashReturn = 0;
  const dscr = 0;
  const averagePricePerSqFt = 0;
  const estimatedArvFromComps = 0;
  const sensitivity = [
    getScenario("Best Case", arv * 1.05, repairCosts * 0.9, repairCosts, totalProjectCost, cashInvested),
    getScenario("Expected Case", arv, repairCosts, repairCosts, totalProjectCost, cashInvested),
    getScenario("Worst Case", arv * 0.92, repairCosts * 1.15, repairCosts, totalProjectCost, cashInvested)
  ];

  return {
    repairCosts,
    maximumAllowableOffer,
    priceVsMao,
    isOfferAcceptable,
    loanAmount,
    monthlyPayment,
    totalInterestCost,
    pointsCost,
    totalFinancingCost,
    totalProjectCost,
    projectedProfit,
    roi,
    profitMargin,
    dealScore: score,
    scoreGrade: getScoreGrade(score),
    recommendation: getRecommendation(score),
    riskLevel,
    riskReasons: riskReasons.length ? riskReasons : ["Primary assumptions are inside target ranges."],
    monthlyCashFlow,
    annualCashFlow,
    capRate,
    cashOnCashReturn,
    dscr,
    averagePricePerSqFt,
    estimatedArvFromComps,
    sensitivity
  };
}

function getScenario(
  name: string,
  scenarioArv: number,
  scenarioRepairCosts: number,
  expectedRepairCosts: number,
  totalProjectCost: number,
  cashInvested: number
) {
  const profit = scenarioArv - (totalProjectCost - expectedRepairCosts + scenarioRepairCosts);
  return {
    name,
    profit,
    roi: safeDivide(profit, cashInvested) * 100
  };
}

function getDealScore({
  profitMargin,
  roi,
  isOfferAcceptable,
  holdingAndSellingCosts
}: {
  profitMargin: number;
  roi: number;
  isOfferAcceptable: boolean;
  holdingAndSellingCosts: number;
}) {
  let score = 100;
  if (profitMargin < 15) score -= 20;
  if (roi < 12) score -= 15;
  if (!isOfferAcceptable) score -= 15;
  if (holdingAndSellingCosts > 25000) score -= 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getScoreGrade(score: number) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function getRecommendation(score: number) {
  if (score >= 90) return "Strong Buy";
  if (score >= 80) return "Good Deal";
  if (score >= 70) return "Review Carefully";
  if (score >= 60) return "High Risk";
  return "Avoid";
}

function getRiskReasons({
  profitMargin,
  isOfferAcceptable
}: {
  profitMargin: number;
  isOfferAcceptable: boolean;
}) {
  const reasons: string[] = [];
  if (profitMargin < 15) reasons.push("Profit margin is below 15%.");
  if (!isOfferAcceptable) reasons.push("Purchase price is above MAO.");
  return reasons;
}

function getValidationError(form: DealFormState): string | null {
  if (!form.propertyAddress.trim() && !isValidZipCode(form.zipCode)) {
    return "Select a property address or enter a valid ZIP code.";
  }
  if (!isPositiveNumber(form.afterRepairValue)) return "After-repair value must be greater than zero.";
  if (!isNonNegativeNumber(form.purchasePrice)) return "Purchase price must be zero or greater.";
  if (!isPositiveNumber(form.maoRulePercentage)) return "MAO percentage must be greater than zero.";
  if (!isNonNegativeNumber(form.holdingAndSellingCosts)) {
    return "Reparation and selling cost must be zero or greater.";
  }
  return null;
}

function isPositiveNumber(value: string): boolean {
  const parsed = Number(value);
  return value.trim() !== "" && Number.isFinite(parsed) && parsed > 0;
}

function isNonNegativeNumber(value: string): boolean {
  const parsed = Number(value);
  return value.trim() !== "" && Number.isFinite(parsed) && parsed >= 0;
}

function isValidZipCode(value: string): boolean {
  return /^\d{5}$/.test(value.trim());
}

function toRequest(form: DealFormState, analysis: DealAnalysis): DealEvaluationRequest {
  return {
    propertyAddress: form.propertyAddress.trim() || form.zipCode.trim(),
    purchasePrice: toNumber(form.purchasePrice),
    afterRepairValue: toNumber(form.afterRepairValue),
    rehabCosts: analysis.repairCosts,
    financingCosts: analysis.totalFinancingCost,
    holdingCosts: toNumber(form.holdingAndSellingCosts),
    sellingCosts: 0
  };
}

function getFallbackAiReview(analysis: DealAnalysis): AiDealReviewResponse {
  return {
    summary: `This deal shows a projected profit of ${currencyFormatter.format(
      analysis.projectedProfit
    )} and an ROI of ${numberFormatter.format(analysis.roi)}%.`,
    strengths: [
      analysis.projectedProfit > 0 ? "Positive projected profit." : "Clear downside is visible before purchase.",
      analysis.isOfferAcceptable ? "Purchase price is inside MAO." : "MAO gap is clearly identified."
    ],
    warnings: analysis.riskReasons,
    recommendation: analysis.recommendation
  };
}

function scoreTone(score: number): "green" | "yellow" | "red" {
  if (score >= 80) return "green";
  if (score >= 60) return "yellow";
  return "red";
}

function riskTone(riskLevel: string): "green" | "yellow" | "red" {
  if (riskLevel === "Low") return "green";
  if (riskLevel === "Medium") return "yellow";
  return "red";
}

function recommendationClass(recommendation: string) {
  if (recommendation === "Strong Flip Candidate") return "opportunity-badge-strong";
  if (recommendation === "Good Deal") return "opportunity-badge-good";
  if (recommendation === "Maybe") return "opportunity-badge-maybe";
  if (recommendation === "Needs Review") return "opportunity-badge-maybe";
  return "opportunity-badge-avoid";
}

function formatCurrencyValue(value: number | null): string {
  return value == null ? "N/A" : currencyFormatter.format(value);
}

function formatPercentValue(value: number | null): string {
  return value == null ? "N/A" : `${numberFormatter.format(value)}%`;
}

function toOptionalString(value: number | null): string {
  return value == null ? "" : String(value);
}

function nullableSum(...values: Array<number | null>): number | null {
  if (values.some((value) => value == null)) {
    return null;
  }
  return values.reduce<number>((total, value) => total + (value ?? 0), 0);
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function safeDivide(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator;
}

function createSimplePdf(lines: string[]) {
  const escapedLines = lines.map((line) => line.replace(/[()\\]/g, "\\$&"));
  const text = escapedLines.map((line, index) => `1 0 0 1 72 ${742 - index * 24} Tm (${line}) Tj`).join("\n");
  const stream = `BT /F1 12 Tf ${text} ET`;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return pdf;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
