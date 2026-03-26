const DEFAULT_CARD_FLAT_FEE_CENTS = 49;
const DEFAULT_CARD_RATE_2_TO_6 = 0.0349;
const DEFAULT_CARD_RATE_7_TO_12 = 0.0399;
const DEFAULT_CARD_RATE_13_TO_21 = 0.0429;
const DEFAULT_CARD_SAFE_MIN_INSTALLMENT_AMOUNT_CENTS = 5000;
const DEFAULT_CARD_MAX_INSTALLMENTS = 6;

function numberFromEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function creditCardRateForInstallments(installmentCount: number) {
  if (installmentCount <= 1) {
    return 0;
  }

  if (installmentCount <= 6) {
    return numberFromEnv("ASAAS_CARD_RATE_2_TO_6", DEFAULT_CARD_RATE_2_TO_6);
  }

  if (installmentCount <= 12) {
    return numberFromEnv("ASAAS_CARD_RATE_7_TO_12", DEFAULT_CARD_RATE_7_TO_12);
  }

  return numberFromEnv("ASAAS_CARD_RATE_13_TO_21", DEFAULT_CARD_RATE_13_TO_21);
}

export function creditCardFlatFeeCents() {
  return Math.max(
    0,
    Math.round(numberFromEnv("ASAAS_CARD_FLAT_FEE_CENTS", DEFAULT_CARD_FLAT_FEE_CENTS)),
  );
}

export function creditCardSafeMinimumInstallmentAmountCents() {
  return Math.max(
    0,
    Math.round(
      numberFromEnv(
        "ASAAS_CARD_SAFE_MIN_INSTALLMENT_AMOUNT_CENTS",
        DEFAULT_CARD_SAFE_MIN_INSTALLMENT_AMOUNT_CENTS,
      ),
    ),
  );
}

export function creditCardMaximumInstallments() {
  return Math.max(
    1,
    Math.round(numberFromEnv("ASAAS_CARD_MAX_INSTALLMENTS", DEFAULT_CARD_MAX_INSTALLMENTS)),
  );
}

export function calculateCreditCardCharge(baseAmountCents: number, installmentCount: number) {
  const normalizedBase = Math.max(0, Math.round(baseAmountCents));
  const normalizedInstallments = Math.max(1, Math.floor(installmentCount));

  if (normalizedInstallments <= 1) {
    return {
      baseAmountCents: normalizedBase,
      feeAmountCents: 0,
      totalAmountCents: normalizedBase,
      installmentCount: 1,
      installmentAmountCents: normalizedBase,
      percentRate: 0,
      fixedFeeCents: 0,
    };
  }

  const percentRate = creditCardRateForInstallments(normalizedInstallments);
  const fixedFeeCents = creditCardFlatFeeCents();
  const gross = Math.ceil((normalizedBase + fixedFeeCents) / (1 - percentRate));
  const feeAmountCents = Math.max(0, gross - normalizedBase);
  const installmentAmountCents = Math.ceil(gross / normalizedInstallments);

  return {
    baseAmountCents: normalizedBase,
    feeAmountCents,
    totalAmountCents: gross,
    installmentCount: normalizedInstallments,
    installmentAmountCents,
    percentRate,
    fixedFeeCents,
  };
}

export function listAvailableCreditCardInstallments(
  baseAmountCents: number,
  maxInstallments = creditCardMaximumInstallments(),
) {
  const normalizedMaxInstallments = Math.max(1, Math.floor(maxInstallments));
  const minimumInstallmentAmountCents = creditCardSafeMinimumInstallmentAmountCents();

  return Array.from({ length: normalizedMaxInstallments }, (_, index) => index + 1)
    .map((installmentCount) => calculateCreditCardCharge(baseAmountCents, installmentCount))
    .filter((pricing) => pricing.installmentAmountCents >= minimumInstallmentAmountCents);
}
