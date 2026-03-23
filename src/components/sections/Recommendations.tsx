"use client";

import { motion, type Variants } from "framer-motion";

type RecItem = {
  title: string;
  text: string;
  iconClass: string;
};

const ITEMS: RecItem[] = [
  {
    title: "Traje",
    text: "Adotamos o estilo esporte fino. Para as mulheres, vestidos longos ou midi em tons suaves. Para os homens, camisa social com calça. Evite branco, off-white e preto para que esse momento tenha ainda mais destaque.",
    iconClass: "flaticon-heart",
  },
  {
    title: "Horário",
    text: "Nossa cerimônia terá início pontualmente às 16h. Pedimos que cheguem com cerca de 30 minutos de antecedência para que tudo aconteça com tranquilidade.",
    iconClass: "flaticon-calendar",
  },
  {
    title: "Ambiente & Conforto",
    text: "Teremos momentos em ambiente aberto. Vale escolher um calçado confortável para aproveitar cada etapa do dia com leveza.",
    iconClass: "flaticon-maps-and-flags",
  },
  {
    title: "Nosso momento",
    text: "Mais do que uma celebração, queremos viver esse dia cercados de pessoas especiais. Sua presença vai tornar tudo ainda mais inesquecível.",
    iconClass: "flaticon-wedding-rings",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export function Recommendations() {
  return (
    <section className="wpo-reco-s2 section-padding" id="recommendations">
      <div className="container">
        <div className="wpo-section-title">
          <span>Para nossos convidados</span>
          <h2>Recomendações especiais</h2>
        </div>

        <motion.div
          className="reco-grid"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {ITEMS.map((entry) => (
            <motion.article
              key={entry.title}
              className="reco-card reco-card--premium"
              variants={item}
            >
              <div className="reco-card__inner">
                <div className="reco-card__header">
                  <span className="reco-medal" aria-hidden="true">
                    <span className="reco-medal__ring" />
                    <span className="reco-medal__core">
                      <i className={entry.iconClass} />
                    </span>
                  </span>

                  <div className="reco-head">
                    <span className="reco-kicker">Dica</span>
                    <h3>{entry.title}</h3>
                    <span className="reco-divider" aria-hidden="true" />
                  </div>
                </div>

                <p className="reco-text">{entry.text}</p>
              </div>

              <span className="reco-corner tl" aria-hidden="true" />
              <span className="reco-corner tr" aria-hidden="true" />
              <span className="reco-corner bl" aria-hidden="true" />
              <span className="reco-corner br" aria-hidden="true" />
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
