import { FormEvent, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { analyzeDealWithAi, evaluateDeal } from "./api/deals";
import flipIqLogo from "./assets/flipiq-logo-primary.jpeg";
import type {
  AiDealReviewResponse,
  DealEvaluationRequest,
  DealEvaluationResponse
} from "./types/deals";

type RehabItem = {
  id: number;
  category: string;
  estimatedCost: string;
};

type CompItem = {
  id: number;
  address: string;
  salePrice: string;
  squareFeet: string;
  distanceMiles: string;
  soldDate: string;
  bedrooms: string;
  bathrooms: string;
};

type SavedDeal = {
  id: number;
  propertyAddress: string;
  purchasePrice: number;
  projectedProfit: number;
  roi: number;
  dealScore: number;
  riskLevel: string;
};

type DealFormState = {
  propertyAddress: string;
  purchasePrice: string;
  afterRepairValue: string;
  maoRulePercentage: string;
  holdingAndSellingCosts: string;
  profitBuffer: string;
  financingType: "Cash" | "Hard Money Loan" | "Conventional Loan" | "Private Lender";
  downPaymentPercentage: string;
  interestRate: string;
  loanTermMonths: string;
  points: string;
  holdingMonths: string;
  monthlyRent: string;
  propertyTax: string;
  insurance: string;
  hoa: string;
  maintenance: string;
  vacancyRate: string;
  propertyManagementFee: string;
  subjectSquareFeet: string;
  floridaPropertyTaxes: string;
  floridaInsurance: string;
  floridaHoa: string;
  realtorCommissionPercentage: string;
  titleFees: string;
  transferTaxes: string;
  floodInsurance: string;
  permitCosts: string;
};

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

const rehabCategories = [
  "Kitchen",
  "Bathrooms",
  "Flooring",
  "Paint",
  "Roof",
  "HVAC",
  "Electrical",
  "Plumbing",
  "Landscaping",
  "Permits",
  "Contingency",
  "Other"
];

const initialFormState: DealFormState = {
  propertyAddress: "",
  purchasePrice: "",
  afterRepairValue: "",
  maoRulePercentage: "",
  holdingAndSellingCosts: "",
  profitBuffer: "",
  financingType: "Cash",
  downPaymentPercentage: "",
  interestRate: "",
  loanTermMonths: "",
  points: "",
  holdingMonths: "",
  monthlyRent: "",
  propertyTax: "",
  insurance: "",
  hoa: "",
  maintenance: "",
  vacancyRate: "",
  propertyManagementFee: "",
  subjectSquareFeet: "",
  floridaPropertyTaxes: "",
  floridaInsurance: "",
  floridaHoa: "",
  realtorCommissionPercentage: "",
  titleFees: "",
  transferTaxes: "",
  floodInsurance: "",
  permitCosts: ""
};

const initialRehabItems: RehabItem[] = [
  { id: 1, category: "Kitchen", estimatedCost: "" },
  { id: 2, category: "Bathrooms", estimatedCost: "" },
  { id: 3, category: "Flooring", estimatedCost: "" },
  { id: 4, category: "Paint", estimatedCost: "" },
  { id: 5, category: "Contingency", estimatedCost: "" }
];

const initialComps: CompItem[] = [
  {
    id: 1,
    address: "",
    salePrice: "",
    squareFeet: "",
    distanceMiles: "",
    soldDate: "",
    bedrooms: "",
    bathrooms: ""
  },
  {
    id: 2,
    address: "",
    salePrice: "",
    squareFeet: "",
    distanceMiles: "",
    soldDate: "",
    bedrooms: "",
    bathrooms: ""
  },
  {
    id: 3,
    address: "",
    salePrice: "",
    squareFeet: "",
    distanceMiles: "",
    soldDate: "",
    bedrooms: "",
    bathrooms: ""
  }
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
  notation: "compact"
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1
});

export default function App() {
  const [form, setForm] = useState<DealFormState>(initialFormState);
  const [rehabItems, setRehabItems] = useState<RehabItem[]>(initialRehabItems);
  const [comps, setComps] = useState<CompItem[]>(initialComps);
  const [result, setResult] = useState<DealEvaluationResponse | null>(null);
  const [aiReview, setAiReview] = useState<AiDealReviewResponse | null>(null);
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const analysis = useMemo(() => calculateAnalysis(form, rehabItems, comps), [form, rehabItems, comps]);
  const canSubmit = !isSubmitting;
  const dashboardSummary = useMemo(() => getDashboardSummary(savedDeals), [savedDeals]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextValidationError = getValidationError(form, rehabItems, comps);
    if (nextValidationError) {
      setError(nextValidationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await evaluateDeal(toRequest(form, analysis));
      setResult(response);
      setSavedDeals((current) => [
        {
          id: Date.now(),
          propertyAddress: form.propertyAddress.trim() || "Untitled deal",
          purchasePrice: toNumber(form.purchasePrice),
          projectedProfit: analysis.projectedProfit,
          roi: analysis.roi,
          dealScore: analysis.dealScore,
          riskLevel: analysis.riskLevel
        },
        ...current
      ]);
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
      `Rehab Budget: ${currencyFormatter.format(analysis.repairCosts)}`,
      `MAO: ${currencyFormatter.format(analysis.maximumAllowableOffer)}`,
      `Projected Profit: ${currencyFormatter.format(analysis.projectedProfit)}`,
      `ROI: ${numberFormatter.format(analysis.roi)}%`,
      `Deal Score: ${analysis.dealScore} (${analysis.scoreGrade})`,
      `Risk Level: ${analysis.riskLevel}`,
      `Financing: ${form.financingType}`,
      `Rental Cash Flow: ${currencyFormatter.format(analysis.monthlyCashFlow)}`,
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
              <Typography>Dashboard</Typography>
            </Stack>
            <Button variant="outlined" href="#deal-form">
              New Analysis
            </Button>
          </Box>

          <Box className="hero-band">
            <Box>
              <Typography variant="h1" className="hero-title">
                Deal Analyzer
              </Typography>
              <Typography color="text.secondary" className="lede">
                Model MAO, rehab, financing, rental fallback, comps, and risk in one worksheet.
              </Typography>
            </Box>
            <Box className="hero-metrics">
              <Metric label="MAO" value={currencyFormatter.format(analysis.maximumAllowableOffer)} />
              <Metric label="Score" value={`${analysis.dealScore}/100`} tone={scoreTone(analysis.dealScore)} />
              <Metric label="Risk" value={analysis.riskLevel} tone={riskTone(analysis.riskLevel)} />
            </Box>
          </Box>

          <Box className="analysis-grid">
            <Paper component="section" elevation={0} className="deal-panel" id="deal-form">
              <Stack
                component="form"
                spacing={3}
                className="deal-form-stack"
                onSubmit={handleSubmit}
                noValidate
                aria-label="Deal evaluation form"
              >
                <SectionHeader eyebrow="Deal worksheet" title="Property and offer inputs" />
                {error ? <Alert severity="error">{error}</Alert> : null}

                <TextField
                  label="Property address"
                  value={form.propertyAddress}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, propertyAddress: event.target.value }))
                  }
                  fullWidth
                />

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
                    label="Holding and selling costs"
                    value={form.holdingAndSellingCosts}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, holdingAndSellingCosts: value }))
                    }
                  />
                  <CurrencyField
                    label="Profit buffer"
                    value={form.profitBuffer}
                    onChange={(value) => setForm((current) => ({ ...current, profitBuffer: value }))}
                  />
                  <NumberField
                    label="Holding period"
                    value={form.holdingMonths}
                    suffix="months"
                    onChange={(value) => setForm((current) => ({ ...current, holdingMonths: value }))}
                  />
                </Box>

                <SectionHeader eyebrow="Rehab budget" title="Editable repair breakdown" />
                <Stack spacing={1.25}>
                  {rehabItems.map((item) => (
                    <Box className="editable-row" key={item.id}>
                      <Select
                        value={item.category}
                        onChange={(event) =>
                          setRehabItems((current) =>
                            current.map((row) =>
                              row.id === item.id ? { ...row, category: event.target.value } : row
                            )
                          )
                        }
                        size="small"
                      >
                        {rehabCategories.map((category) => (
                          <MenuItem value={category} key={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                      <CurrencyField
                        label="Estimated cost"
                        value={item.estimatedCost}
                        onChange={(value) =>
                          setRehabItems((current) =>
                            current.map((row) =>
                              row.id === item.id ? { ...row, estimatedCost: value } : row
                            )
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="text"
                        color="error"
                        onClick={() =>
                          setRehabItems((current) => current.filter((row) => row.id !== item.id))
                        }
                        disabled={rehabItems.length === 1}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ sm: "center" }}
                    className="rehab-actions"
                  >
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() =>
                        setRehabItems((current) => [
                          ...current,
                          { id: Date.now(), category: "Other", estimatedCost: "" }
                        ])
                      }
                    >
                      Add Rehab Row
                    </Button>
                    <Typography className="inline-total">
                      Total Rehab Budget: {currencyFormatter.format(analysis.repairCosts)}
                    </Typography>
                  </Stack>
                </Stack>

                <SectionHeader eyebrow="Financing" title="Purchase method and loan costs" />
                <Box className="field-grid">
                  <Box>
                    <Typography className="field-label">Financing type</Typography>
                    <Select
                      value={form.financingType}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          financingType: event.target.value as DealFormState["financingType"]
                        }))
                      }
                      fullWidth
                    >
                      <MenuItem value="Cash">Cash</MenuItem>
                      <MenuItem value="Hard Money Loan">Hard Money Loan</MenuItem>
                      <MenuItem value="Conventional Loan">Conventional Loan</MenuItem>
                      <MenuItem value="Private Lender">Private Lender</MenuItem>
                    </Select>
                  </Box>
                  {form.financingType === "Cash" ? (
                    <ResultMetric label="Financing cost" value={currencyFormatter.format(0)} />
                  ) : (
                    <>
                      <NumberField
                        label="Down payment"
                        value={form.downPaymentPercentage}
                        suffix="%"
                        onChange={(value) =>
                          setForm((current) => ({ ...current, downPaymentPercentage: value }))
                        }
                      />
                      <NumberField
                        label="Interest rate"
                        value={form.interestRate}
                        suffix="%"
                        onChange={(value) => setForm((current) => ({ ...current, interestRate: value }))}
                      />
                      <NumberField
                        label="Points"
                        value={form.points}
                        suffix="%"
                        onChange={(value) => setForm((current) => ({ ...current, points: value }))}
                      />
                      <NumberField
                        label="Loan term"
                        value={form.loanTermMonths}
                        suffix="months"
                        onChange={(value) =>
                          setForm((current) => ({ ...current, loanTermMonths: value }))
                        }
                      />
                    </>
                  )}
                </Box>
                <Box className="result-grid">
                  <ResultMetric label="Loan amount" value={currencyFormatter.format(analysis.loanAmount)} />
                  <ResultMetric
                    label="Monthly payment"
                    value={currencyFormatter.format(analysis.monthlyPayment)}
                  />
                  <ResultMetric
                    label="Interest during hold"
                    value={currencyFormatter.format(analysis.totalInterestCost)}
                  />
                  <ResultMetric label="Points cost" value={currencyFormatter.format(analysis.pointsCost)} />
                </Box>

                <SectionHeader eyebrow="Rental backup analysis" title="Exit strategy fallback" />
                <Box className="field-grid">
                  <CurrencyField
                    label="Monthly rent"
                    value={form.monthlyRent}
                    onChange={(value) => setForm((current) => ({ ...current, monthlyRent: value }))}
                  />
                  <CurrencyField
                    label="Property tax"
                    value={form.propertyTax}
                    onChange={(value) => setForm((current) => ({ ...current, propertyTax: value }))}
                  />
                  <CurrencyField
                    label="Insurance"
                    value={form.insurance}
                    onChange={(value) => setForm((current) => ({ ...current, insurance: value }))}
                  />
                  <CurrencyField
                    label="HOA"
                    value={form.hoa}
                    onChange={(value) => setForm((current) => ({ ...current, hoa: value }))}
                  />
                  <CurrencyField
                    label="Maintenance"
                    value={form.maintenance}
                    onChange={(value) => setForm((current) => ({ ...current, maintenance: value }))}
                  />
                  <NumberField
                    label="Vacancy rate"
                    value={form.vacancyRate}
                    suffix="%"
                    onChange={(value) => setForm((current) => ({ ...current, vacancyRate: value }))}
                  />
                  <NumberField
                    label="Property management"
                    value={form.propertyManagementFee}
                    suffix="%"
                    onChange={(value) =>
                      setForm((current) => ({ ...current, propertyManagementFee: value }))
                    }
                  />
                </Box>

                <SectionHeader eyebrow="Florida costs" title="Optional local cost assumptions" />
                <Box className="field-grid">
                  <CurrencyField
                    label="Property taxes"
                    value={form.floridaPropertyTaxes}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, floridaPropertyTaxes: value }))
                    }
                  />
                  <CurrencyField
                    label="Insurance"
                    value={form.floridaInsurance}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, floridaInsurance: value }))
                    }
                  />
                  <CurrencyField
                    label="HOA"
                    value={form.floridaHoa}
                    onChange={(value) => setForm((current) => ({ ...current, floridaHoa: value }))}
                  />
                  <NumberField
                    label="Realtor commission"
                    value={form.realtorCommissionPercentage}
                    suffix="%"
                    onChange={(value) =>
                      setForm((current) => ({ ...current, realtorCommissionPercentage: value }))
                    }
                  />
                  <CurrencyField
                    label="Title fees"
                    value={form.titleFees}
                    onChange={(value) => setForm((current) => ({ ...current, titleFees: value }))}
                  />
                  <CurrencyField
                    label="Transfer taxes"
                    value={form.transferTaxes}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, transferTaxes: value }))
                    }
                  />
                  <CurrencyField
                    label="Flood insurance"
                    value={form.floodInsurance}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, floodInsurance: value }))
                    }
                  />
                  <CurrencyField
                    label="Permits"
                    value={form.permitCosts}
                    onChange={(value) => setForm((current) => ({ ...current, permitCosts: value }))}
                  />
                </Box>

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
              </Stack>
            </Paper>

            <Stack spacing={3}>
              <MaoCard analysis={analysis} form={form} />
              <DealScoreCard analysis={analysis} />
              <RiskMeter analysis={analysis} />
              <ResultPanel result={result} analysis={analysis} />
              <RentalPanel analysis={analysis} />
              <CompsPanel comps={comps} setComps={setComps} form={form} setForm={setForm} analysis={analysis} />
              <SensitivityPanel analysis={analysis} />
              <AiReviewPanel review={aiReview} error={aiError} />
              <DashboardPanel summary={dashboardSummary} savedDeals={savedDeals} />
            </Stack>
          </Box>
        </Stack>
      </Container>
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
  onChange
}: {
  label: string;
  value: string;
  min?: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      type="number"
      slotProps={{ htmlInput: { min, step: "0.01" } }}
      fullWidth
      required
    />
  );
}

function NumberField({
  label,
  value,
  suffix,
  onChange
}: {
  label: string;
  value: string;
  suffix: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      label={`${label} (${suffix})`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      type="number"
      slotProps={{ htmlInput: { min: "0", step: "0.01" } }}
      fullWidth
      required
    />
  );
}

function MaoCard({ analysis, form }: { analysis: DealAnalysis; form: DealFormState }) {
  return (
    <Paper elevation={0} className="insight-card">
      <SectionHeader eyebrow="Maximum Allowable Offer" title="MAO analysis" />
      <Box className="result-grid">
        <ResultMetric label="ARV" value={currencyFormatter.format(toNumber(form.afterRepairValue))} />
        <ResultMetric label="Repair cost" value={currencyFormatter.format(analysis.repairCosts)} />
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

function RentalPanel({ analysis }: { analysis: DealAnalysis }) {
  return (
    <Paper elevation={0} className="insight-card">
      <SectionHeader eyebrow="Rental Backup Analysis" title="Hold scenario" />
      <Box className="result-grid">
        <ResultMetric label="Monthly cash flow" value={currencyFormatter.format(analysis.monthlyCashFlow)} />
        <ResultMetric label="Cap rate" value={`${numberFormatter.format(analysis.capRate)}%`} />
        <ResultMetric
          label="Cash-on-cash return"
          value={`${numberFormatter.format(analysis.cashOnCashReturn)}%`}
        />
        <ResultMetric label="DSCR" value={numberFormatter.format(analysis.dscr)} />
      </Box>
    </Paper>
  );
}

function CompsPanel({
  comps,
  setComps,
  form,
  setForm,
  analysis
}: {
  comps: CompItem[];
  setComps: (updater: (current: CompItem[]) => CompItem[]) => void;
  form: DealFormState;
  setForm: (updater: (current: DealFormState) => DealFormState) => void;
  analysis: DealAnalysis;
}) {
  return (
    <Paper elevation={0} className="insight-card">
      <SectionHeader eyebrow="Comparable sales" title="ARV support" />
      <Box className="field-grid">
        <NumberField
          label="Subject square feet"
          value={form.subjectSquareFeet}
          suffix="sq ft"
          onChange={(value) => setForm((current) => ({ ...current, subjectSquareFeet: value }))}
        />
        <ResultMetric
          label="Estimated ARV from comps"
          value={currencyFormatter.format(analysis.estimatedArvFromComps)}
        />
      </Box>
      <Stack spacing={1.25} className="table-stack">
        {comps.map((comp) => {
          const pricePerSqFt = safeDivide(toNumber(comp.salePrice), toNumber(comp.squareFeet));
          return (
            <Box className="comp-row" key={comp.id}>
              <TextField
                label="Address"
                value={comp.address}
                onChange={(event) =>
                  setComps((current) =>
                    current.map((row) =>
                      row.id === comp.id ? { ...row, address: event.target.value } : row
                    )
                  )
                }
              />
              <CurrencyField
                label="Sale price"
                value={comp.salePrice}
                onChange={(value) =>
                  setComps((current) =>
                    current.map((row) => (row.id === comp.id ? { ...row, salePrice: value } : row))
                  )
                }
              />
              <NumberField
                label="Square feet"
                value={comp.squareFeet}
                suffix="sq ft"
                onChange={(value) =>
                  setComps((current) =>
                    current.map((row) => (row.id === comp.id ? { ...row, squareFeet: value } : row))
                  )
                }
              />
              <ResultMetric label="$/sq ft" value={currencyFormatter.format(pricePerSqFt)} />
            </Box>
          );
        })}
        <Button
          type="button"
          variant="outlined"
          onClick={() =>
            setComps((current) => [
              ...current,
              {
                id: Date.now(),
                address: "",
                salePrice: "",
                squareFeet: "",
                distanceMiles: "",
                soldDate: "",
                bedrooms: "",
                bathrooms: ""
              }
            ])
          }
        >
          Add Comp
        </Button>
      </Stack>
      <Typography color="text.secondary">
        Average price per square foot: {currencyFormatter.format(analysis.averagePricePerSqFt)}
      </Typography>
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

function DashboardPanel({
  summary,
  savedDeals
}: {
  summary: {
    totalDealsAnalyzed: number;
    averageROI: number;
    averageProjectedProfit: number;
    bestDeal: SavedDeal | null;
    highestDealScore: number;
  };
  savedDeals: SavedDeal[];
}) {
  return (
    <Paper elevation={0} className="insight-card">
      <SectionHeader eyebrow="Portfolio Dashboard" title="Session deal comparison" />
      <Box className="result-grid">
        <ResultMetric label="Total deals analyzed" value={String(summary.totalDealsAnalyzed)} />
        <ResultMetric label="Average ROI" value={`${numberFormatter.format(summary.averageROI)}%`} />
        <ResultMetric
          label="Average profit"
          value={currencyFormatter.format(summary.averageProjectedProfit)}
        />
        <ResultMetric
          label="Highest score"
          value={summary.highestDealScore ? String(summary.highestDealScore) : "No deals"}
        />
      </Box>
      <Box className="deal-table">
        {savedDeals.length === 0 ? (
          <Typography color="text.secondary">Evaluated deals will appear here.</Typography>
        ) : (
          savedDeals.slice(0, 5).map((deal) => (
            <Box className="deal-row" key={deal.id}>
              <Typography>{deal.propertyAddress}</Typography>
              <Typography>{compactCurrencyFormatter.format(deal.purchasePrice)}</Typography>
              <Typography>{compactCurrencyFormatter.format(deal.projectedProfit)}</Typography>
              <Typography>{numberFormatter.format(deal.roi)}%</Typography>
              <Chip label={deal.riskLevel} size="small" />
            </Box>
          ))
        )}
      </Box>
      {summary.bestDeal ? (
        <Typography color="text.secondary">Best deal: {summary.bestDeal.propertyAddress}</Typography>
      ) : null}
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

function calculateAnalysis(form: DealFormState, rehabItems: RehabItem[], comps: CompItem[]): DealAnalysis {
  const purchasePrice = toNumber(form.purchasePrice);
  const arv = toNumber(form.afterRepairValue);
  const maoRule = toNumber(form.maoRulePercentage) / 100 || 0.7;
  const repairCosts = rehabItems.reduce((total, item) => total + toNumber(item.estimatedCost), 0);
  const holdingAndSellingCosts = toNumber(form.holdingAndSellingCosts);
  const profitBuffer = toNumber(form.profitBuffer);
  const holdingMonths = toNumber(form.holdingMonths);
  const maximumAllowableOffer = arv * maoRule - repairCosts;
  const priceVsMao = purchasePrice - maximumAllowableOffer;
  const isOfferAcceptable = purchasePrice <= maximumAllowableOffer;
  const downPaymentPercentage = form.financingType === "Cash" ? 100 : toNumber(form.downPaymentPercentage);
  const loanAmount = Math.max(0, purchasePrice * (1 - downPaymentPercentage / 100));
  const monthlyRate = toNumber(form.interestRate) / 100 / 12;
  const loanTermMonths = Math.max(1, toNumber(form.loanTermMonths));
  const monthlyPayment =
    form.financingType === "Cash" || monthlyRate === 0
      ? 0
      : loanAmount * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -loanTermMonths)));
  const totalInterestCost = form.financingType === "Cash" ? 0 : loanAmount * monthlyRate * holdingMonths;
  const pointsCost = form.financingType === "Cash" ? 0 : loanAmount * (toNumber(form.points) / 100);
  const totalFinancingCost = totalInterestCost + pointsCost;
  const floridaCosts =
    toNumber(form.floridaPropertyTaxes) +
    toNumber(form.floridaInsurance) +
    toNumber(form.floridaHoa) +
    toNumber(form.titleFees) +
    toNumber(form.transferTaxes) +
    toNumber(form.floodInsurance) +
    toNumber(form.permitCosts);
  const realtorCost = arv * (toNumber(form.realtorCommissionPercentage) / 100);
  const totalProjectCost =
    purchasePrice + repairCosts + holdingAndSellingCosts + totalFinancingCost + floridaCosts + realtorCost;
  const projectedProfit = arv - totalProjectCost;
  const cashInvested = Math.max(1, purchasePrice - loanAmount + repairCosts + pointsCost);
  const roi = (projectedProfit / cashInvested) * 100;
  const profitMargin = safeDivide(projectedProfit, arv) * 100;
  const rehabCostPercentage = safeDivide(repairCosts, arv) * 100;
  const score = getDealScore({
    profitMargin,
    roi,
    isOfferAcceptable,
    rehabCostPercentage,
    holdingMonths,
    totalFinancingCost,
    holdingAndSellingCosts
  });
  const riskReasons = getRiskReasons({
    profitMargin,
    rehabCostPercentage,
    holdingMonths,
    totalFinancingCost,
    isOfferAcceptable
  });
  const riskLevel = riskReasons.length >= 4 ? "High" : riskReasons.length >= 2 ? "Medium" : "Low";
  const monthlyMortgage = monthlyPayment;
  const monthlyRent = toNumber(form.monthlyRent);
  const monthlyExpenses =
    monthlyMortgage +
    toNumber(form.propertyTax) +
    toNumber(form.insurance) +
    toNumber(form.hoa) +
    toNumber(form.maintenance) +
    monthlyRent * (toNumber(form.vacancyRate) / 100) +
    monthlyRent * (toNumber(form.propertyManagementFee) / 100);
  const monthlyCashFlow = monthlyRent - monthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;
  const annualNoi = (monthlyRent - monthlyExpenses + monthlyMortgage) * 12;
  const capRate = safeDivide(annualNoi, arv) * 100;
  const cashOnCashReturn = safeDivide(annualCashFlow, cashInvested) * 100;
  const dscr = safeDivide(annualNoi, monthlyMortgage * 12);
  const validComps = comps.filter((comp) => toNumber(comp.salePrice) > 0 && toNumber(comp.squareFeet) > 0);
  const averagePricePerSqFt = validComps.length
    ? validComps.reduce(
        (total, comp) => total + safeDivide(toNumber(comp.salePrice), toNumber(comp.squareFeet)),
        0
      ) / validComps.length
    : 0;
  const estimatedArvFromComps = toNumber(form.subjectSquareFeet) * averagePricePerSqFt;
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
  rehabCostPercentage,
  holdingMonths,
  totalFinancingCost,
  holdingAndSellingCosts
}: {
  profitMargin: number;
  roi: number;
  isOfferAcceptable: boolean;
  rehabCostPercentage: number;
  holdingMonths: number;
  totalFinancingCost: number;
  holdingAndSellingCosts: number;
}) {
  let score = 100;
  if (profitMargin < 15) score -= 20;
  if (roi < 12) score -= 15;
  if (!isOfferAcceptable) score -= 15;
  if (rehabCostPercentage > 25) score -= 10;
  if (holdingMonths > 6) score -= 10;
  if (totalFinancingCost > 15000) score -= 7;
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
  rehabCostPercentage,
  holdingMonths,
  totalFinancingCost,
  isOfferAcceptable
}: {
  profitMargin: number;
  rehabCostPercentage: number;
  holdingMonths: number;
  totalFinancingCost: number;
  isOfferAcceptable: boolean;
}) {
  const reasons: string[] = [];
  if (profitMargin < 15) reasons.push("Profit margin is below 15%.");
  if (rehabCostPercentage > 25) reasons.push("Rehab budget is more than 25% of ARV.");
  if (holdingMonths > 6) reasons.push("Holding period is longer than 6 months.");
  if (totalFinancingCost > 15000) reasons.push("Financing costs are above $15,000.");
  if (!isOfferAcceptable) reasons.push("Purchase price is above MAO.");
  return reasons;
}

function getValidationError(form: DealFormState, rehabItems: RehabItem[], comps: CompItem[]): string | null {
  if (!isPositiveNumber(form.afterRepairValue)) return "After-repair value must be greater than zero.";
  if (!isNonNegativeNumber(form.purchasePrice)) return "Purchase price must be zero or greater.";
  if (!isPositiveNumber(form.maoRulePercentage)) return "MAO percentage must be greater than zero.";
  if (!isNonNegativeNumber(form.holdingAndSellingCosts)) {
    return "Holding and selling costs must be zero or greater.";
  }
  if (!isNonNegativeNumber(form.profitBuffer)) return "Profit buffer must be zero or greater.";
  if (!rehabItems.every((item) => isNonNegativeNumber(item.estimatedCost))) {
    return "Every rehab row must have a cost of zero or greater.";
  }
  if (comps.length < 3) return "Add at least 3 comparable sales.";
  if (!comps.every((comp) => isNonNegativeNumber(comp.salePrice) && isNonNegativeNumber(comp.squareFeet))) {
    return "Every comp must have valid sale price and square footage values.";
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

function toRequest(form: DealFormState, analysis: DealAnalysis): DealEvaluationRequest {
  return {
    propertyAddress: form.propertyAddress.trim(),
    purchasePrice: toNumber(form.purchasePrice),
    afterRepairValue: toNumber(form.afterRepairValue),
    rehabCosts: analysis.repairCosts,
    financingCosts: analysis.totalFinancingCost,
    holdingCosts: toNumber(form.holdingAndSellingCosts),
    sellingCosts: 0,
    profitBuffer: toNumber(form.profitBuffer)
  };
}

function getDashboardSummary(savedDeals: SavedDeal[]) {
  const totalDealsAnalyzed = savedDeals.length;
  const bestDeal = savedDeals.reduce<SavedDeal | null>(
    (best, deal) => (!best || deal.dealScore > best.dealScore ? deal : best),
    null
  );
  return {
    totalDealsAnalyzed,
    averageROI: totalDealsAnalyzed
      ? savedDeals.reduce((total, deal) => total + deal.roi, 0) / totalDealsAnalyzed
      : 0,
    averageProjectedProfit: totalDealsAnalyzed
      ? savedDeals.reduce((total, deal) => total + deal.projectedProfit, 0) / totalDealsAnalyzed
      : 0,
    bestDeal,
    highestDealScore: bestDeal?.dealScore ?? 0
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
