"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/src/components/layout/Header";
import { GiftCheckoutSteps } from "@/src/components/sections/gifts/GiftCheckoutSteps";
import { centsToBRL } from "@/src/lib/money";
import {
  creditCardSafeMinimumInstallmentAmountCents,
  listAvailableCreditCardInstallments,
} from "@/src/lib/payment-pricing";

type OrderResponse = {
  order: {
    id: string;
    status: string;
    totalAmountCents: number;
  };
  payment: {
    status: string;
    method: "pix" | "credit_card" | "boleto";
    invoiceUrl?: string | null;
    pixQrCode?: string | null;
    pixPayload?: string | null;
    amountCents?: number;
    feeAmountCents?: number;
    installmentCount?: number;
    cardLast4?: string | null;
  } | null;
  buyer: { name: string; email: string } | null;
  items: Array<{
    giftName: string;
    quantity: number;
    unitPriceCents: number;
  }>;
  summary: {
    itemsSubtotalCents: number;
    feeAmountCents: number;
    totalChargeCents: number;
    installmentCount: number;
  };
};

type PaymentMethod = "pix" | "credit_card";

type CardForm = {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  addressComplement: string;
  phone: string;
};

type PixForm = {
  cpfCnpj: string;
  phone: string;
};

const emptyCardForm: CardForm = {
  holderName: "",
  number: "",
  expiryMonth: "",
  expiryYear: "",
  ccv: "",
  cpfCnpj: "",
  postalCode: "",
  addressNumber: "",
  addressComplement: "",
  phone: "",
};

const emptyPixForm: PixForm = {
  cpfCnpj: "",
  phone: "",
};

const PENDING_CHECKOUT_KEY = "andreza-ismael-gifts-pending-checkout";

function methodLabel(method?: string | null) {
  if (method === "credit_card") return "Cartão";
  if (method === "pix") return "Pix";
  if (method === "boleto") return "Boleto";
  return "Não definido";
}

function statusLabel(status?: string) {
  if (status === "paid") return "Pago";
  if (status === "pending") return "Pendente";
  if (status === "failed") return "Falhou";
  if (status === "canceled") return "Cancelado";
  if (status === "expired") return "Expirado";
  if (status === "refunded") return "Estornado";
  return status ?? "-";
}

export default function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [data, setData] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("pix");
  const [installmentCount, setInstallmentCount] = useState(1);
  const [cardForm, setCardForm] = useState<CardForm>(emptyCardForm);
  const [pixForm, setPixForm] = useState<PixForm>(emptyPixForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const response = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
    const json = await response.json().catch(() => null);
    setData(response.ok ? json : null);
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (typeof window !== "undefined" && orderId) {
      window.localStorage.removeItem(PENDING_CHECKOUT_KEY);
    }
  }, [orderId]);

  useEffect(() => {
    if (data?.payment?.method === "credit_card") {
      setSelectedMethod("credit_card");
      setInstallmentCount(data.payment.installmentCount ?? 1);
      return;
    }

    if (data?.payment?.method === "pix") {
      setSelectedMethod("pix");
    }
  }, [data?.payment?.installmentCount, data?.payment?.method]);

  const paid = data?.order.status === "paid";
  const safeMinimumInstallmentAmountCents = creditCardSafeMinimumInstallmentAmountCents();

  const installmentOptions = useMemo(() => {
    if (!data) return [];
    return listAvailableCreditCardInstallments(data.summary.itemsSubtotalCents);
  }, [data]);

  const canPayWithCard = installmentOptions.length > 0;
  const effectiveInstallmentCount = installmentOptions.some(
    (option) => option.installmentCount === installmentCount,
  )
    ? installmentCount
    : installmentOptions[0]?.installmentCount ?? 1;

  const cardPricing = useMemo(() => {
    return (
      installmentOptions.find(
        (option) => option.installmentCount === effectiveInstallmentCount,
      ) ?? null
    );
  }, [effectiveInstallmentCount, installmentOptions]);

  const effectiveSelectedMethod =
    selectedMethod === "credit_card" && canPayWithCard ? "credit_card" : "pix";

  const selectedTotalCents = useMemo(() => {
    if (!data) return 0;
    if (paid) return data.summary.totalChargeCents;
    if (effectiveSelectedMethod === "credit_card" && cardPricing) {
      return cardPricing.totalAmountCents;
    }
    return data.summary.itemsSubtotalCents;
  }, [cardPricing, data, effectiveSelectedMethod, paid]);

  async function handleGeneratePix() {
    setSubmitting(true);
    setError(null);
    setCopyFeedback(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "pix",
          cpfCnpj: pixForm.cpfCnpj,
          phone: pixForm.phone || null,
        }),
      });

      const json = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          json?.error?.formErrors?.[0] ?? json?.error ?? "Não foi possível gerar o Pix.",
        );
      }

      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível gerar o Pix.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePayWithCard() {
    if (!cardPricing || !canPayWithCard) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "credit_card",
          installmentCount: effectiveInstallmentCount,
          card: {
            holderName: cardForm.holderName,
            number: cardForm.number,
            expiryMonth: cardForm.expiryMonth,
            expiryYear: cardForm.expiryYear,
            ccv: cardForm.ccv,
          },
          holder: {
            cpfCnpj: cardForm.cpfCnpj,
            postalCode: cardForm.postalCode,
            addressNumber: cardForm.addressNumber,
            addressComplement: cardForm.addressComplement || null,
            phone: cardForm.phone,
          },
        }),
      });

      const json = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          json?.error?.formErrors?.[0] ??
            json?.error ??
            "Não foi possível processar o cartão.",
        );
      }

      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível processar o cartão.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyPixPayload() {
    if (!data?.payment?.pixPayload) return;

    try {
      await navigator.clipboard.writeText(data.payment.pixPayload);
      setCopyFeedback("Código Pix copiado.");
    } catch {
      setCopyFeedback("Não foi possível copiar o código Pix.");
    }
  }

  const cardDisabled =
    submitting ||
    !canPayWithCard ||
    !cardForm.holderName ||
    !cardForm.number ||
    !cardForm.expiryMonth ||
    !cardForm.expiryYear ||
    !cardForm.ccv ||
    !cardForm.cpfCnpj ||
    !cardForm.postalCode ||
    !cardForm.addressNumber ||
    !cardForm.phone;

  return (
    <div className="gift-checkout-page gift-checkout-page--flow-header">
      <Header brandHref={null} showCart={false} floating={false} />

      <main className="gift-checkout-shell">
        <GiftCheckoutSteps current="checkout" />

        {loading ? (
          <div className="gift-loading">Carregando seu pagamento...</div>
        ) : !data ? (
          <div className="gift-empty-state">Pedido não encontrado.</div>
        ) : (
          <>
            <section className="gift-checkout-intro gift-checkout-intro-simple">
              <div className="gift-checkout-intro-copy">
                <div className="gift-checkout-toolbar">
                  <button
                    type="button"
                    className="gift-button-secondary"
                    onClick={() => router.push("/gifts/customer")}
                  >
                    Voltar para seus dados
                  </button>
                  <span className="gift-checkout-order-id">Pedido {data.order.id}</span>
                </div>

                <span className="gift-eyebrow">Checkout</span>
                <h1>{paid ? "Pagamento confirmado." : "Finalize seu presente."}</h1>
                <p>
                  {paid
                    ? "Seu presente já foi registrado com sucesso."
                    : "Escolha Pix ou cartão e conclua o pagamento com segurança."}
                </p>

                <div className="gift-checkout-hero-metrics">
                  <article>
                    <span>Total</span>
                    <strong>{centsToBRL(selectedTotalCents)}</strong>
                  </article>
                  <article>
                    <span>Status</span>
                    <strong>{statusLabel(data.order.status)}</strong>
                  </article>
                </div>
              </div>
            </section>

            <section className="gift-layout-two gift-checkout-layout">
              <div className="gift-purchase-panel gift-checkout-main">
                <div className="gift-section-header gift-checkout-section-header">
                  <div>
                    <h2>Pagamento</h2>
                    <p>Escolha a forma de pagamento e siga só com o essencial.</p>
                  </div>
                </div>

                {!paid ? (
                  <>
                    <div className="gift-method-switch gift-method-switch-grid">
                      <button
                        type="button"
                        className={`gift-method-chip ${effectiveSelectedMethod === "pix" ? "is-active" : ""}`}
                        onClick={() => setSelectedMethod("pix")}
                      >
                        <strong>Pix</strong>
                        <span>Pagamento à vista.</span>
                      </button>

                      <button
                        type="button"
                        className={`gift-method-chip ${effectiveSelectedMethod === "credit_card" ? "is-active" : ""}`}
                        onClick={() => setSelectedMethod("credit_card")}
                        disabled={!canPayWithCard}
                      >
                        <strong>Cartão</strong>
                        <span>Parcelamento com taxa já incluída.</span>
                      </button>
                    </div>

                    {!canPayWithCard ? (
                      <p className="gift-checkout-note gift-checkout-note-inline">
                        O cartÃ£o sÃ³ aparece quando cada parcela fica em pelo menos{" "}
                        {centsToBRL(safeMinimumInstallmentAmountCents)}.
                      </p>
                    ) : null}

                    {effectiveSelectedMethod === "pix" ? (
                      <div className="gift-payment-card gift-payment-card-strong">
                        <div className="gift-payment-card-head">
                          <div>
                            <h3>Pagar com Pix</h3>
                            <p>Gere o código e pague no app do seu banco.</p>
                          </div>
                          <div className="gift-payment-badge">Sem taxa</div>
                        </div>

                        <div className="gift-payment-compact-stats">
                          <div>
                            <span>Total</span>
                            <strong>{centsToBRL(data.summary.itemsSubtotalCents)}</strong>
                          </div>
                        </div>

                        {!data.payment?.pixQrCode ? (
                          <div className="gift-card-form-group">
                            <div className="gift-card-form-head">
                              <h4>Identificação para o Pix</h4>
                              <p>O Asaas exige pelo menos o CPF ou CNPJ do pagador para criar a cobrança.</p>
                            </div>

                            <div className="admin-form-grid" style={{ marginTop: 18 }}>
                              <div className="admin-form-row">
                                <div className="admin-field">
                                  <label htmlFor="pix-cpf-cnpj">CPF/CNPJ</label>
                                  <input
                                    id="pix-cpf-cnpj"
                                    className="gift-input"
                                    value={pixForm.cpfCnpj}
                                    onChange={(event) =>
                                      setPixForm((current) => ({
                                        ...current,
                                        cpfCnpj: event.target.value,
                                      }))
                                    }
                                    placeholder="Digite o CPF ou CNPJ"
                                  />
                                </div>

                                <div className="admin-field">
                                  <label htmlFor="pix-phone">Telefone</label>
                                  <input
                                    id="pix-phone"
                                    className="gift-input"
                                    value={pixForm.phone}
                                    onChange={(event) =>
                                      setPixForm((current) => ({
                                        ...current,
                                        phone: event.target.value,
                                      }))
                                    }
                                    placeholder="Opcional"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {data.payment?.method === "pix" && data.payment.pixQrCode ? (
                          <div className="gift-pix-layout">
                            <div className="gift-pix-card">
                              <div className="gift-qr">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  alt="QR Code Pix"
                                  src={`data:image/png;base64,${data.payment.pixQrCode}`}
                                />
                              </div>
                              <p className="gift-payment-caption">
                                Escaneie o QR Code para concluir.
                              </p>
                            </div>

                            <div className="gift-pix-card gift-pix-card-copy">
                              <div className="gift-copy-box">
                                <label htmlFor="pix-payload" className="gift-field-label">
                                  Pix copia e cola
                                </label>
                                <textarea
                                  id="pix-payload"
                                  className="gift-textarea"
                                  readOnly
                                  value={data.payment.pixPayload ?? ""}
                                />
                              </div>

                              <div className="gift-actions-inline gift-actions-inline-stretch">
                                <button
                                  type="button"
                                  className="gift-button"
                                  onClick={handleCopyPixPayload}
                                >
                                  Copiar código Pix
                                </button>
                                <button
                                  type="button"
                                  className="gift-button-secondary"
                                  onClick={reload}
                                  disabled={submitting}
                                >
                                  Atualizar status
                                </button>
                              </div>

                              {copyFeedback ? (
                                <p className="gift-inline-feedback">{copyFeedback}</p>
                              ) : null}
                            </div>
                          </div>
                        ) : (
                            <div className="gift-checkout-actions-block">
                              <p className="gift-checkout-note">
                                Gere o Pix para visualizar o QR Code e o código copia e cola.
                              </p>
                              <div className="gift-actions-inline">
                                <button
                                  type="button"
                                  className="gift-button"
                                  onClick={handleGeneratePix}
                                  disabled={submitting || pixForm.cpfCnpj.trim().length < 11}
                                >
                                  {submitting ? "Gerando Pix..." : "Gerar Pix agora"}
                                </button>
                              </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="gift-payment-card gift-payment-card-strong">
                        <div className="gift-payment-card-head">
                          <div>
                            <h3>Pagar com cartão</h3>
                            <p>Preencha os dados abaixo e confirme o pagamento.</p>
                          </div>
                        </div>

                        <div className="admin-form-row gift-card-top-row">
                          <div className="admin-field">
                            <label htmlFor="installment-count">Parcelas</label>
                            <select
                              id="installment-count"
                              className="gift-select"
                              value={effectiveInstallmentCount}
                              onChange={(event) => setInstallmentCount(Number(event.target.value))}
                            >
                              {installmentOptions.map((option) => (
                                <option
                                  key={option.installmentCount}
                                  value={option.installmentCount}
                                >
                                  {option.installmentCount}x de{" "}
                                  {centsToBRL(option.installmentAmountCents)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {cardPricing ? (
                          <div className="gift-payment-compact-stats gift-payment-compact-stats-card">
                            <div>
                              <span>Total</span>
                              <strong>{centsToBRL(cardPricing.totalAmountCents)}</strong>
                            </div>
                            <div>
                              <span>Taxa</span>
                              <strong>{centsToBRL(cardPricing.feeAmountCents)}</strong>
                            </div>
                            <div>
                              <span>Parcela</span>
                              <strong>
                                {effectiveInstallmentCount}x de{" "}
                                {centsToBRL(cardPricing.installmentAmountCents)}
                              </strong>
                            </div>
                          </div>
                        ) : null}

                        <div className="gift-card-form-group">
                          <div className="gift-card-form-head">
                            <h4>Dados do cartão</h4>
                          </div>

                          <div className="admin-form-grid" style={{ marginTop: 18 }}>
                            <div className="admin-form-row">
                              <div className="admin-field">
                                <label htmlFor="card-holder-name">Nome no cartão</label>
                                <input
                                  id="card-holder-name"
                                  className="gift-input"
                                  value={cardForm.holderName}
                                  onChange={(event) =>
                                    setCardForm((current) => ({
                                      ...current,
                                      holderName: event.target.value,
                                    }))
                                  }
                                />
                              </div>

                              <div className="admin-field">
                                <label htmlFor="card-number">Número do cartão</label>
                                <input
                                  id="card-number"
                                  className="gift-input"
                                  value={cardForm.number}
                                  onChange={(event) =>
                                    setCardForm((current) => ({
                                      ...current,
                                      number: event.target.value,
                                    }))
                                  }
                                  placeholder="0000 0000 0000 0000"
                                />
                              </div>
                            </div>

                            <div className="admin-form-row-3">
                              <div className="admin-field">
                                <label htmlFor="card-exp-month">Mês</label>
                                <input
                                  id="card-exp-month"
                                  className="gift-input"
                                  value={cardForm.expiryMonth}
                                  onChange={(event) =>
                                    setCardForm((current) => ({
                                      ...current,
                                      expiryMonth: event.target.value,
                                    }))
                                  }
                                  placeholder="MM"
                                />
                              </div>

                              <div className="admin-field">
                                <label htmlFor="card-exp-year">Ano</label>
                                <input
                                  id="card-exp-year"
                                  className="gift-input"
                                  value={cardForm.expiryYear}
                                  onChange={(event) =>
                                    setCardForm((current) => ({
                                      ...current,
                                      expiryYear: event.target.value,
                                    }))
                                  }
                                  placeholder="AA"
                                />
                              </div>

                              <div className="admin-field">
                                <label htmlFor="card-ccv">CVV</label>
                                <input
                                  id="card-ccv"
                                  className="gift-input"
                                  value={cardForm.ccv}
                                  onChange={(event) =>
                                    setCardForm((current) => ({
                                      ...current,
                                      ccv: event.target.value,
                                    }))
                                  }
                                  placeholder="123"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="gift-card-form-group">
                          <div className="gift-card-form-head">
                            <h4>Dados do titular</h4>
                          </div>

                          <div className="admin-form-grid" style={{ marginTop: 18 }}>
                            <div className="admin-form-row">
                              <div className="admin-field">
                                <label htmlFor="holder-cpf">CPF/CNPJ</label>
                                <input
                                  id="holder-cpf"
                                  className="gift-input"
                                  value={cardForm.cpfCnpj}
                                  onChange={(event) =>
                                    setCardForm((current) => ({
                                      ...current,
                                      cpfCnpj: event.target.value,
                                    }))
                                  }
                                />
                              </div>

                              <div className="admin-field">
                                <label htmlFor="holder-phone">Telefone</label>
                                <input
                                  id="holder-phone"
                                  className="gift-input"
                                  value={cardForm.phone}
                                  onChange={(event) =>
                                    setCardForm((current) => ({
                                      ...current,
                                      phone: event.target.value,
                                    }))
                                  }
                                />
                              </div>
                            </div>

                            <div className="admin-form-row">
                              <div className="admin-field">
                                <label htmlFor="holder-postal">CEP</label>
                                <input
                                  id="holder-postal"
                                  className="gift-input"
                                  value={cardForm.postalCode}
                                  onChange={(event) =>
                                    setCardForm((current) => ({
                                      ...current,
                                      postalCode: event.target.value,
                                    }))
                                  }
                                />
                              </div>

                              <div className="admin-field">
                                <label htmlFor="holder-address-number">Número</label>
                                <input
                                  id="holder-address-number"
                                  className="gift-input"
                                  value={cardForm.addressNumber}
                                  onChange={(event) =>
                                    setCardForm((current) => ({
                                      ...current,
                                      addressNumber: event.target.value,
                                    }))
                                  }
                                />
                              </div>
                            </div>

                            <div className="admin-field">
                              <label htmlFor="holder-complement">Complemento</label>
                              <input
                                id="holder-complement"
                                className="gift-input"
                                value={cardForm.addressComplement}
                                onChange={(event) =>
                                  setCardForm((current) => ({
                                    ...current,
                                    addressComplement: event.target.value,
                                  }))
                                }
                                placeholder="Opcional"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="gift-actions-inline gift-actions-inline-stretch">
                          <button
                            type="button"
                            className="gift-button"
                            onClick={handlePayWithCard}
                            disabled={cardDisabled}
                          >
                            {submitting ? "Processando cartão..." : "Pagar com cartão"}
                          </button>
                        </div>
                      </div>
                    )}

                    {error ? (
                      <p className="gift-form-error" style={{ marginTop: 16 }}>
                        {error}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <div className="gift-payment-card gift-payment-card-strong">
                    <div className="gift-payment-card-head">
                      <div>
                        <h3>Pagamento confirmado</h3>
                        <p>
                          {data.payment?.method === "credit_card"
                            ? `Seu pagamento foi aprovado${
                                data.payment.cardLast4
                                  ? ` no cartão final ${data.payment.cardLast4}`
                                  : ""
                              }.`
                            : "Seu Pix foi registrado com sucesso."}
                        </p>
                      </div>
                      <div className="gift-payment-badge is-success">Confirmado</div>
                    </div>

                    <div className="gift-payment-compact-stats gift-payment-compact-stats-card">
                      <div>
                        <span>Total pago</span>
                        <strong>{centsToBRL(data.summary.totalChargeCents)}</strong>
                      </div>
                      <div>
                        <span>Método</span>
                        <strong>{methodLabel(data.payment?.method)}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <aside className="gift-summary gift-checkout-summary gift-cart-summary">
                <div className="gift-checkout-summary-head">
                  <div>
                    <span className="gift-summary-kicker">Resumo do pedido</span>
                    <h2>Seu pedido</h2>
                  </div>
                  <strong>{centsToBRL(selectedTotalCents)}</strong>
                </div>

                <div className="gift-summary-list">
                  {data.items.map((item, index) => (
                    <div key={`${item.giftName}-${index}`} className="gift-summary-item">
                      <div>
                        <strong>{item.giftName}</strong>
                        <p>
                          {item.quantity} cota(s) x {centsToBRL(item.unitPriceCents)}
                        </p>
                      </div>
                      <strong>{centsToBRL(item.unitPriceCents * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
              </aside>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
