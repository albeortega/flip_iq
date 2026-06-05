import { FormEvent, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { evaluateDeal } from "./api/deals";
import type { DealEvaluationRequest, DealEvaluationResponse } from "./types/deals";

type DealFormState = {
  propertyAddress: string;
  afterRepairValue: string;
  repairCosts: string;
  holdingAndSellingCosts: string;
  profitBuffer: string;
};

const initialFormState: DealFormState = {
  propertyAddress: "123 Main Street",
  afterRepairValue: "250000",
  repairCosts: "35000",
  holdingAndSellingCosts: "15000",
  profitBuffer: "25000"
};

const presets: Array<{ label: string; values: DealFormState }> = [
  {
    label: "Light rehab",
    values: {
      propertyAddress: "42 Cedar Avenue",
      afterRepairValue: "320000",
      repairCosts: "28000",
      holdingAndSellingCosts: "18000",
      profitBuffer: "30000"
    }
  },
  {
    label: "Heavy rehab",
    values: {
      propertyAddress: "88 Magnolia Court",
      afterRepairValue: "460000",
      repairCosts: "92000",
      holdingAndSellingCosts: "33000",
      profitBuffer: "50000"
    }
  },
  {
    label: "Tight spread",
    values: {
      propertyAddress: "715 Market Street",
      afterRepairValue: "215000",
      repairCosts: "62000",
      holdingAndSellingCosts: "22000",
      profitBuffer: "26000"
    }
  }
];

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
                <Metric label="Inputs" value="4" detail="Cost levers" />
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
                    label="After-repair value"
                    value={form.afterRepairValue}
                    min="0.01"
                    onChange={(value) =>
                      setForm((current) => ({ ...current, afterRepairValue: value }))
                    }
                  />
                  <CurrencyField
                    label="Repair costs"
                    value={form.repairCosts}
                    onChange={(value) => setForm((current) => ({ ...current, repairCosts: value }))}
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
  min = "0",
  onChange
}: {
  label: string;
  value: string;
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
        slotProps={{ htmlInput: { min, step: "0.01" } }}
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
    ["Repair costs", `-${currencyFormatter.format(result.repairCosts)}`],
    ["Holding and selling", `-${currencyFormatter.format(result.holdingAndSellingCosts)}`],
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
        <ResultMetric label="Spread" value={currencyFormatter.format(result.estimatedSpread)} />
        <ResultMetric label="Rule percent" value={percentFormatter.format(result.offerRulePercentage)} />
        <ResultMetric label="Repairs" value={currencyFormatter.format(result.repairCosts)} />
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
    ["Repair costs", form.repairCosts],
    ["Holding and selling costs", form.holdingAndSellingCosts],
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
    Number(form.repairCosts) -
    Number(form.holdingAndSellingCosts) -
    Number(form.profitBuffer)
  );
}

function toRequest(form: DealFormState): DealEvaluationRequest {
  return {
    propertyAddress: form.propertyAddress.trim(),
    afterRepairValue: Number(form.afterRepairValue),
    repairCosts: Number(form.repairCosts),
    holdingAndSellingCosts: Number(form.holdingAndSellingCosts),
    profitBuffer: Number(form.profitBuffer)
  };
}
