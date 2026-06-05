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
        <Box className="home-grid">
          <Box>
            <Stack spacing={3} className="intro">
              <Chip label="70% rule" color="secondary" className="rule-chip" />
              <Box>
                <Typography variant="h1" gutterBottom>
                  FlipIQ Deal Desk
                </Typography>
                <Typography color="text.secondary" className="lede">
                  Price fix-and-flip opportunities with a fast maximum-offer calculation.
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} className="summary-strip">
                <Metric label="Rule" value="70%" />
                <Metric label="API" value="/api" />
              </Stack>
            </Stack>
          </Box>

          <Box>
            <Paper component="section" elevation={0} className="deal-panel">
              <Stack
                component="form"
                spacing={3}
                onSubmit={handleSubmit}
                noValidate
                aria-label="Deal evaluation form"
              >
                <Stack spacing={1}>
                  <Typography variant="h2">Evaluate Deal</Typography>
                  {error ? <Alert severity="error">{error}</Alert> : null}
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
        inputProps={{ min, step: "0.01" }}
        fullWidth
        required
      />
    </Box>
  );
}

function DealResult({ result }: { result: DealEvaluationResponse }) {
  const isPass = result.recommendation === "PASS";

  return (
    <Stack spacing={2.5} aria-live="polite">
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
        <Box className="offer-box">
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
    </Stack>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Box className="metric">
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

function toRequest(form: DealFormState): DealEvaluationRequest {
  return {
    propertyAddress: form.propertyAddress.trim(),
    afterRepairValue: Number(form.afterRepairValue),
    repairCosts: Number(form.repairCosts),
    holdingAndSellingCosts: Number(form.holdingAndSellingCosts),
    profitBuffer: Number(form.profitBuffer)
  };
}
