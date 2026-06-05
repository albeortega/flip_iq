import { FormEvent, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { evaluateDeal } from "./api/deals";
import type { DealEvaluationRequest, DealEvaluationResponse } from "./types/deals";

type DealFormState = {
  propertyAddress: string;
  purchasePrice: string;
  afterRepairValue: string;
  rehabCosts: string;
  financingCosts: string;
  holdingCosts: string;
  sellingCosts: string;
  profitBuffer: string;
};

const initialFormState: DealFormState = {
  propertyAddress: "123 Main Street",
  purchasePrice: "90000",
  afterRepairValue: "250000",
  rehabCosts: "35000",
  financingCosts: "8000",
  holdingCosts: "15000",
  sellingCosts: "7000",
  profitBuffer: "25000"
};

const presets: Array<{ label: string; values: DealFormState }> = [
  {
    label: "Light rehab",
    values: {
      propertyAddress: "42 Cedar Avenue",
      purchasePrice: "165000",
      afterRepairValue: "320000",
      rehabCosts: "28000",
      financingCosts: "9000",
      holdingCosts: "12000",
      sellingCosts: "14000",
      profitBuffer: "30000"
    }
  },
  {
    label: "Heavy rehab",
    values: {
      propertyAddress: "88 Magnolia Court",
      purchasePrice: "148000",
      afterRepairValue: "460000",
      rehabCosts: "92000",
      financingCosts: "18000",
      holdingCosts: "21000",
      sellingCosts: "12000",
      profitBuffer: "50000"
    }
  },
  {
    label: "Tight spread",
    values: {
      propertyAddress: "715 Market Street",
      purchasePrice: "82000",
      afterRepairValue: "215000",
      rehabCosts: "62000",
      financingCosts: "6500",
      holdingCosts: "13000",
      sellingCosts: "9000",
      profitBuffer: "26000"
    }
  }
];

const fieldHelp = {
  purchasePrice:
    "Cost of the property and land. Include associated closing costs such as title insurance and escrow fees.",
  afterRepairValue:
    "Estimated market value of the property after renovations are complete. ARV drives the 70% rule.",
  rehabCosts:
    "All renovation costs, including materials, labor, permits, and inspections.",
  financingCosts:
    "Hard money or loan costs, including interest payments and loan-term expenses.",
  holdingCosts:
    "Ongoing ownership expenses such as property taxes, insurance, utilities, and monthly carrying costs.",
  sellingCosts:
    "Costs to sell the property, including realtor fees, staging, closing costs, and related sale expenses.",
  profitBuffer:
    "Target cushion for profit and risk before deciding the maximum offer."
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 0
});

export default function App() {
  const [form, setForm] = useState<DealFormState>(initialFormState);
  const [result, setResult] = useState<DealEvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationError = useMemo(() => getValidationError(form), [form]);
  const canSubmit = !validationError && !isSubmitting;
  const previewMaximumOffer = useMemo(() => calculatePreviewOffer(form), [form]);

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
      const response = await evaluateDeal(toRequest(form));
      setResult(response);
    } catch (caughtError) {
      setResult(null);
      setError(caughtError instanceof Error ? caughtError.message : "Unexpected error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box component="main" className="app-shell">
      <Container maxWidth="lg" className="page-container">
        <Stack spacing={3}>
          <Box className="top-bar">
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box className="brand-icon">F</Box>
              <Typography className="brand-mark">FlipIQ</Typography>
            </Stack>
            <Stack component="nav" direction="row" spacing={2.5} className="nav-links">
              <Typography>Analyzer</Typography>
              <Typography>Deals</Typography>
              <Typography>Funding</Typography>
            </Stack>
            <Button variant="outlined" className="nav-cta" href="#deal-form">
              Start Analysis
            </Button>
          </Box>

          <Box className="home-grid">
            <Stack spacing={3.5} className="intro">
              <Stack direction="row" spacing={1} className="hero-tags">
                <Chip label="Fix & flip analyzer" color="secondary" className="rule-chip" />
                <Chip label="Live deal API" className="api-chip" />
              </Stack>

              <Box>
                <Typography variant="h1" gutterBottom>
                  Analyze your next flip with confidence.
                </Typography>
                <Typography color="text.secondary" className="lede">
                  Run quick ARV, rehab, holding cost, and profit-buffer checks from a focused
                  deal desk built for real estate investors.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.5} className="hero-actions">
                <Button variant="contained" size="large" className="primary-action" href="#deal-form">
                  Run a Deal
                </Button>
                <Button variant="text" size="large" className="secondary-action" href="#deal-form">
                  View Formula
                </Button>
              </Stack>

              <Paper elevation={0} className="insight-panel">
                <Stack direction="row" spacing={1} className="mini-tabs">
                  <Chip label="Analyze" size="small" color="primary" />
                  <Chip label="Offer" size="small" />
                  <Chip label="Close" size="small" />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "end" }}>
                  <Box className="preview-offer">
                    <Typography className="eyebrow">Current draft</Typography>
                    <Typography className="preview-offer-value">
                      {previewMaximumOffer === null ? "Enter values" : currencyFormatter.format(previewMaximumOffer)}
                    </Typography>
                    <Typography color="text.secondary">Estimated maximum offer</Typography>
                  </Box>
                  <Typography color="text.secondary" className="preview-note">
                    Final numbers come from the API after evaluation.
                  </Typography>
                </Stack>
              </Paper>

              <Box className="market-snapshot">
                <Metric label="Rule" value="70%" detail="ARV ceiling" />
                <Metric label="Inputs" value="7" detail="Cost levers" />
                <Metric label="Speed" value="API" detail="Instant result" />
              </Box>
            </Stack>

            <Box className="workspace-stack">
              <Box className="deal-visual" aria-hidden="true">
                <Box className="phone-shell">
                  <Stack spacing={2}>
                    <Box className="phone-header">
                      <Typography>Deal Flow</Typography>
                      <Chip label="Live" size="small" />
                    </Box>
                    <Box className="property-card">
                      <Box className="property-image" />
                      <Typography className="property-title">Magnolia Court</Typography>
                      <Typography color="text.secondary">$460k ARV · Heavy rehab</Typography>
                    </Box>
                    <Box className="score-card">
                      <Typography color="text.secondary">Offer confidence</Typography>
                      <Typography>82%</Typography>
                    </Box>
                    <Box className="visual-bars">
                      <span />
                      <span />
                      <span />
                    </Box>
                  </Stack>
                </Box>
                <Box className="floating-card floating-card-top">
                  <Typography color="text.secondary">Max offer</Typography>
                  <Typography>$147,000</Typography>
                </Box>
                <Box className="floating-card floating-card-bottom">
                  <Typography color="text.secondary">Spread</Typography>
                  <Typography>$221,000</Typography>
                </Box>
              </Box>

            <Paper component="section" elevation={0} className="deal-panel" id="deal-form">
              <Stack
                component="form"
                spacing={3}
                onSubmit={handleSubmit}
                noValidate
                aria-label="Deal evaluation form"
              >
                <Stack spacing={1}>
                  <Typography className="eyebrow">Deal worksheet</Typography>
                  <Typography variant="h2">Evaluate a property</Typography>
                  {error ? <Alert severity="error">{error}</Alert> : null}
                </Stack>

                <Stack direction="row" spacing={1} className="preset-row">
                  {presets.map((preset) => (
                    <Button
                      key={preset.label}
                      type="button"
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setForm(preset.values);
                        setError(null);
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </Stack>

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
                    tooltip={fieldHelp.purchasePrice}
                    onChange={(value) => setForm((current) => ({ ...current, purchasePrice: value }))}
                  />
                  <CurrencyField
                    label="After-repair value"
                    value={form.afterRepairValue}
                    min="0.01"
                    tooltip={fieldHelp.afterRepairValue}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, afterRepairValue: value }))
                    }
                  />
                  <CurrencyField
                    label="Rehab costs"
                    value={form.rehabCosts}
                    tooltip={fieldHelp.rehabCosts}
                    onChange={(value) => setForm((current) => ({ ...current, rehabCosts: value }))}
                  />
                  <CurrencyField
                    label="Financing costs"
                    value={form.financingCosts}
                    tooltip={fieldHelp.financingCosts}
                    onChange={(value) => setForm((current) => ({ ...current, financingCosts: value }))}
                  />
                  <CurrencyField
                    label="Holding costs"
                    value={form.holdingCosts}
                    tooltip={fieldHelp.holdingCosts}
                    onChange={(value) => setForm((current) => ({ ...current, holdingCosts: value }))}
                  />
                  <CurrencyField
                    label="Cost of sale"
                    value={form.sellingCosts}
                    tooltip={fieldHelp.sellingCosts}
                    onChange={(value) => setForm((current) => ({ ...current, sellingCosts: value }))}
                  />
                  <CurrencyField
                    label="Profit buffer"
                    value={form.profitBuffer}
                    tooltip={fieldHelp.profitBuffer}
                    onChange={(value) => setForm((current) => ({ ...current, profitBuffer: value }))}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  className="submit-button"
                  disabled={!canSubmit}
                  startIcon={isSubmitting ? <CircularProgress color="inherit" size={18} /> : null}
                >
                  {isSubmitting ? "Evaluating" : "Evaluate"}
                </Button>
              </Stack>

              {result ? (
                <>
                  <Divider className="panel-divider" />
                  <DealResult result={result} />
                </>
              ) : null}
            </Paper>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

function CurrencyField({
  label,
  value,
  tooltip,
  min = "0",
  onChange
}: {
  label: string;
  value: string;
  tooltip: string;
  min?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Box>
      <TextField
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="number"
        slotProps={{
          htmlInput: { min, step: "0.01" },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={tooltip} arrow>
                  <Box component="span" className="field-help" tabIndex={0} aria-label={`${label} help`}>
                    ?
                  </Box>
                </Tooltip>
              </InputAdornment>
            )
          }
        }}
        fullWidth
        required
      />
    </Box>
  );
}

function DealResult({ result }: { result: DealEvaluationResponse }) {
  const isPass = result.recommendation === "PASS";
  const breakdown = [
    ["After-repair value", currencyFormatter.format(result.afterRepairValue)],
    ["70% rule value", currencyFormatter.format(result.ruleValue)],
    ["Purchase price", currencyFormatter.format(result.purchasePrice)],
    ["Rehab costs", `-${currencyFormatter.format(result.rehabCosts)}`],
    ["Financing costs", currencyFormatter.format(result.financingCosts)],
    ["Holding costs", `-${currencyFormatter.format(result.holdingCosts)}`],
    ["Cost of sale", `-${currencyFormatter.format(result.sellingCosts)}`],
    ["Profit buffer", `-${currencyFormatter.format(result.profitBuffer)}`]
  ];

  return (
    <Stack spacing={3} aria-live="polite">
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
        <Box className="offer-box">
          <Typography className="eyebrow">API result</Typography>
          <Typography color="text.secondary">Maximum offer</Typography>
          <Typography className="offer-value">{currencyFormatter.format(result.maximumOffer)}</Typography>
        </Box>
        <Chip
          label={result.recommendation}
          color={isPass ? "error" : "primary"}
          className="recommendation-chip"
        />
      </Stack>

      <Box className="result-grid">
        <ResultMetric label="Rule value" value={currencyFormatter.format(result.ruleValue)} />
        <ResultMetric label="Projected profit" value={currencyFormatter.format(result.projectedProfit)} />
        <ResultMetric label="Rule percent" value={percentFormatter.format(result.offerRulePercentage)} />
        <ResultMetric label="Offer spread" value={currencyFormatter.format(result.offerSpread)} />
      </Box>

      <Box className="breakdown">
        {breakdown.map(([label, value]) => (
          <Box key={label} className="breakdown-row">
            <Typography color="text.secondary">{label}</Typography>
            <Typography>{value}</Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Box className="metric">
      <Typography color="text.secondary">{label}</Typography>
      <Typography>{value}</Typography>
      <Typography color="text.secondary" className="metric-detail">
        {detail}
      </Typography>
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

function getValidationError(form: DealFormState): string | null {
  if (!isPositiveNumber(form.afterRepairValue)) {
    return "After-repair value must be greater than zero.";
  }

  const nonNegativeFields = [
    ["Purchase price", form.purchasePrice],
    ["Rehab costs", form.rehabCosts],
    ["Financing costs", form.financingCosts],
    ["Holding costs", form.holdingCosts],
    ["Cost of sale", form.sellingCosts],
    ["Profit buffer", form.profitBuffer]
  ] as const;

  const invalidField = nonNegativeFields.find(([, value]) => !isNonNegativeNumber(value));
  if (invalidField) {
    return `${invalidField[0]} must be zero or greater.`;
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

function calculatePreviewOffer(form: DealFormState): number | null {
  if (getValidationError(form)) {
    return null;
  }

  return (
    Number(form.afterRepairValue) * 0.7 -
    Number(form.rehabCosts) -
    Number(form.holdingCosts) -
    Number(form.sellingCosts) -
    Number(form.profitBuffer)
  );
}

function toRequest(form: DealFormState): DealEvaluationRequest {
  return {
    propertyAddress: form.propertyAddress.trim(),
    purchasePrice: Number(form.purchasePrice),
    afterRepairValue: Number(form.afterRepairValue),
    rehabCosts: Number(form.rehabCosts),
    financingCosts: Number(form.financingCosts),
    holdingCosts: Number(form.holdingCosts),
    sellingCosts: Number(form.sellingCosts),
    profitBuffer: Number(form.profitBuffer)
  };
}
