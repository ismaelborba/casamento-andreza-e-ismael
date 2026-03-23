import Link from "next/link";

const steps = [
  { href: "/gifts", label: "1. Vitrine", key: "catalog" },
  { href: "/gifts/cart", label: "2. Carrinho", key: "cart" },
  { href: "/gifts/customer", label: "3. Seus dados", key: "customer" },
  { href: "#", label: "4. Checkout", key: "checkout" },
];

export function GiftCheckoutSteps({
  current,
}: {
  current: "catalog" | "cart" | "customer" | "checkout";
}) {
  return (
    <div className="gift-steps">
      {steps.map((step) => {
        const active = step.key === current;
        const complete = steps.findIndex((item) => item.key === step.key) < steps.findIndex((item) => item.key === current);

        if (step.key === "checkout") {
          return (
            <div
              key={step.key}
              className={`gift-step ${active ? "is-active" : ""} ${complete ? "is-complete" : ""}`}
            >
              <span>{step.label}</span>
            </div>
          );
        }

        return (
          <Link
            key={step.key}
            href={step.href}
            className={`gift-step ${active ? "is-active" : ""} ${complete ? "is-complete" : ""}`}
          >
            <span>{step.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
