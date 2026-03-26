"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { centsToBRL } from "@/src/lib/money";
import { GiftCheckoutSteps } from "@/src/components/sections/gifts/GiftCheckoutSteps";
import { useGiftCart } from "@/src/components/sections/gifts/cart-store";
import { usePublicGiftsCatalog } from "@/src/components/sections/gifts/public-gifts-store";
import type { Gift } from "@/src/components/sections/gifts/shop-types";

const STORAGE_KEY = "andreza-ismael-gifts-customer";
const PENDING_CHECKOUT_KEY = "andreza-ismael-gifts-pending-checkout";

type CustomerDraft = {
  buyerName: string;
  buyerEmail: string;
  buyerMessage: string;
};

const emptyDraft: CustomerDraft = {
  buyerName: "",
  buyerEmail: "",
  buyerMessage: "",
};

function readDraft(): CustomerDraft {
  if (typeof window === "undefined") {
    return emptyDraft;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyDraft;
    }

    const parsed = JSON.parse(raw) as Partial<CustomerDraft>;
    return {
      buyerName: parsed.buyerName ?? "",
      buyerEmail: parsed.buyerEmail ?? "",
      buyerMessage: parsed.buyerMessage ?? "",
    };
  } catch {
    return emptyDraft;
  }
}

function readPendingCheckoutOrderId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(PENDING_CHECKOUT_KEY);
}

export function GiftsCustomerClient({ gifts }: { gifts: Gift[] }) {
  const router = useRouter();
  const { gifts: catalog, loading: loadingCatalog } = usePublicGiftsCatalog(gifts);
  const { cartItems, hydrated, items, totals, clearCart } = useGiftCart(catalog);
  const [form, setForm] = useState<CustomerDraft>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const waitingForCatalog = items.length > 0 && cartItems.length === 0 && loadingCatalog;

  useEffect(() => {
    setForm(readDraft());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    }
  }, [form]);

  useEffect(() => {
    if (hydrated && !waitingForCatalog && cartItems.length === 0) {
      const pendingOrderId = readPendingCheckoutOrderId();

      if (pendingOrderId) {
        router.replace(`/checkout/${pendingOrderId}`);
        return;
      }

      router.replace("/gifts/cart");
    }
  }, [cartItems.length, hydrated, router, waitingForCatalog]);

  async function handleSubmit() {
    if (!cartItems.length) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            giftId: item.gift.id,
            quantity: item.quantity,
          })),
          buyerName: form.buyerName,
          buyerEmail: form.buyerEmail,
          buyerMessage: form.buyerMessage || null,
        }),
      });

      const json = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(json?.error?.formErrors?.[0] ?? json?.error ?? "Não foi possível criar o pedido.");
      }

      const orderId = typeof json?.orderId === "string" ? json.orderId : null;
      if (!orderId) {
        throw new Error("O pedido foi criado, mas não foi possível abrir o checkout.");
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(PENDING_CHECKOUT_KEY, orderId);
        window.localStorage.removeItem(STORAGE_KEY);
      }

      clearCart();

      if (typeof window !== "undefined") {
        window.location.assign(`/checkout/${orderId}`);
        return;
      }

      router.replace(`/checkout/${orderId}`);
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Não foi possível criar o pedido.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="gifts-shell">
      <GiftCheckoutSteps current="customer" />

      <section className="gift-shop-header">
        <div>
          <span className="gift-eyebrow">Seus dados</span>
          <h1>Conte para o casal quem está enviando esse carinho.</h1>
          <p>
            Preencha seus dados, deixe uma mensagem se quiser e siga para o checkout para escolher Pix ou cartão.
          </p>
        </div>
      </section>

      {!hydrated || waitingForCatalog ? (
        <div className="gift-loading">Carregando...</div>
      ) : (
        <section className="gift-layout-two gift-customer-layout">
          <div className="admin-gift-form-shell gift-customer-form-shell">
            <div className="admin-gift-form-main">
              <div className="admin-gift-form-section">
                <div className="admin-gift-form-section-head">
                  <span className="admin-gift-step-badge">1</span>
                  <div>
                    <h3>Identificação do comprador</h3>
                    <p>Esses dados acompanham o pedido e ajudam o casal a saber quem enviou o presente.</p>
                  </div>
                </div>

                <div className="admin-form-grid">
                  <div className="admin-form-row">
                    <div className="admin-field">
                      <label htmlFor="customer-name">Seu nome</label>
                      <input
                        id="customer-name"
                        className="admin-input"
                        value={form.buyerName}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, buyerName: event.target.value }))
                        }
                        placeholder="Como você quer aparecer para o casal"
                      />
                    </div>

                    <div className="admin-field">
                      <label htmlFor="customer-email">Seu e-mail</label>
                      <input
                        id="customer-email"
                        className="admin-input"
                        type="email"
                        value={form.buyerEmail}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, buyerEmail: event.target.value }))
                        }
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-gift-form-section">
                <div className="admin-gift-form-section-head">
                  <span className="admin-gift-step-badge">2</span>
                  <div>
                    <h3>Mensagem para os noivos</h3>
                    <p>Se quiser, deixe uma dedicatória para acompanhar o presente no pedido.</p>
                  </div>
                </div>

                <div className="admin-form-grid">
                  <div className="admin-field">
                    <label htmlFor="customer-message">Sua mensagem</label>
                    <textarea
                      id="customer-message"
                      className="admin-textarea gift-customer-textarea"
                      value={form.buyerMessage}
                      maxLength={280}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, buyerMessage: event.target.value }))
                      }
                      placeholder="Escreva uma mensagem carinhosa para acompanhar o presente."
                    />
                    <span className="admin-inline-note">
                      A mensagem é opcional, mas aparece para o casal junto com a compra.
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-gift-form-section">
                <div className="admin-gift-form-section-head">
                  <span className="admin-gift-step-badge">3</span>
                  <div>
                    <h3>Conferência e próximo passo</h3>
                    <p>Revise os dados antes de seguir para escolher Pix ou cartão no checkout.</p>
                  </div>
                </div>

                <div className="gift-customer-review">
                  <div className="admin-gift-summary-card gift-customer-review-card">
                    <span className="admin-card-label">Como o casal vai ver</span>
                    <strong>{form.buyerName || "Seu nome aparecerá aqui"}</strong>
                    <p className="admin-gift-summary-description">
                      {form.buyerMessage || "Sua mensagem para os noivos aparecerá aqui assim que você escrever algo."}
                    </p>

                    <div className="gift-customer-review-meta">
                      <div className="gift-customer-review-meta-item gift-customer-review-meta-item-email">
                        <span>E-mail</span>
                        <strong>{form.buyerEmail || "email@exemplo.com"}</strong>
                      </div>
                      <div className="gift-customer-review-stats">
                        <div className="gift-customer-review-meta-item">
                          <span>Itens</span>
                          <strong>{totals.quantity}</strong>
                        </div>
                        <div className="gift-customer-review-meta-item">
                          <span>Total</span>
                          <strong>{centsToBRL(totals.subtotalCents)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="admin-gift-upload-tips gift-customer-tips">
                    <div>
                      <span>Use o nome pelo qual vocês são conhecidos para o casal.</span>
                    </div>
                    <div>
                      <span>Depois desta etapa, você escolhe a forma de pagamento no checkout.</span>
                    </div>
                  </div>
                </div>

                {error ? <p className="gift-form-error">{error}</p> : null}

                <div className="gift-actions-inline gift-customer-actions">
                  <button
                    type="button"
                    className="admin-button"
                    onClick={handleSubmit}
                    disabled={submitting || !form.buyerName || !form.buyerEmail || !cartItems.length}
                  >
                    {submitting ? "Criando pedido..." : "Ir para o checkout"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="admin-gift-form-section gift-customer-summary">
            <div className="admin-gift-form-section-head">
              <span className="admin-gift-step-badge">4</span>
              <div>
                <h3>Resumo da compra</h3>
                <p>Confira os presentes adicionados antes de seguir para o pagamento.</p>
              </div>
            </div>

            <div className="admin-gifts-list gift-customer-summary-list">
              {cartItems.map((item) => (
                <div key={item.gift.id} className="admin-gift-row gift-customer-summary-row">
                  <div className="admin-gift-row-main">
                    <div className="admin-gift-row-head">
                      <div className="admin-gift-row-hero">
                        <div className="admin-gift-row-thumb">
                          {item.gift.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.gift.imageUrl} alt={item.gift.name} />
                          ) : (
                            <span>Presente</span>
                          )}
                        </div>

                        <div>
                          <h4 className="admin-gift-row-title">{item.gift.name}</h4>
                          <p className="admin-gift-row-description">
                            {item.quantity} x {centsToBRL(item.gift.priceCents)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="admin-gift-row-side">
                    <strong className="admin-gift-row-price">
                      {centsToBRL(item.quantity * item.gift.priceCents)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-gift-summary-card gift-customer-total-card">
              <span className="admin-card-label">Total do pedido</span>
              <strong>{centsToBRL(totals.subtotalCents)}</strong>
              <p>{totals.quantity} item(ns) selecionado(s) para presentear o casal.</p>
            </div>
          </aside>
        </section>
      )}
    </div>
  );
}
