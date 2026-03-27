import Link from "next/link";
import { CreditCard, Gift, ShoppingCart, UserRound } from "lucide-react";

const steps = [
  {
    href: "/gifts",
    label: "Vitrine",
    mobileLabel: "Vitrine",
    desktopHint: "Escolha o presente",
    icon: Gift,
    key: "catalog",
  },
  {
    href: "/gifts/cart",
    label: "Carrinho",
    mobileLabel: "Carrinho",
    desktopHint: "Revise os itens",
    icon: ShoppingCart,
    key: "cart",
  },
  {
    href: "/gifts/customer",
    label: "Seus dados",
    mobileLabel: "Dados",
    desktopHint: "Identifique o pedido",
    icon: UserRound,
    key: "customer",
  },
  {
    href: "#",
    label: "Checkout",
    mobileLabel: "Pagamento",
    desktopHint: "Finalize o pagamento",
    icon: CreditCard,
    key: "checkout",
  },
];

export function GiftCheckoutSteps({
  current,
}: {
  current: "catalog" | "cart" | "customer" | "checkout";
}) {
  return (
    <div className="gift-steps">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const active = step.key === current;
        const complete = steps.findIndex((item) => item.key === step.key) < steps.findIndex((item) => item.key === current);
        const content = (
          <>
            <span className="gift-step-icon" aria-hidden="true">
              <StepIcon size={14} strokeWidth={2.2} />
            </span>
            <span className="gift-step-copy">
              <span className="gift-step-kicker">Etapa {index + 1}</span>
              <span className="gift-step-label">{step.label}</span>
              <span className="gift-step-hint">{step.desktopHint}</span>
            </span>
            <span className="gift-step-label-mobile">{step.mobileLabel}</span>
          </>
        );

        if (step.key === "checkout") {
          return (
            <div
              key={step.key}
              className={`gift-step ${active ? "is-active" : ""} ${complete ? "is-complete" : ""}`}
            >
              {content}
            </div>
          );
        }

        return (
          <Link
            key={step.key}
            href={step.href}
            className={`gift-step ${active ? "is-active" : ""} ${complete ? "is-complete" : ""}`}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
