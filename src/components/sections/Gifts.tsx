"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Gifts() {
  return (
    <section className="wpo-gifts-cta section-padding" id="gifts">
      <div className="container">
        <div className="gifts-cta__wrap">
          {/* LEFT */}
          <motion.div
            className="gifts-cta__content"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="gifts-cta__kicker">Para quem quiser nos presentear</span>

            <h2 className="gifts-cta__title">
              Lista de Presentes <span>com carinho</span>
            </h2>

            <p className="gifts-cta__text">
              Sua presença já é muito especial. Mas, se você quiser nos presentear,
              preparamos uma lista para facilitar — com opções e cotas para todos os estilos.
            </p>

            <div className="gifts-cta__actions">
              <Link href="/gifts" prefetch className="theme-btn">
                Ver lista de presentes
              </Link>
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            className="gifts-cta__visual"
            initial={{ opacity: 0, scale: 0.98, y: 14 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="gifts-cta__frame">
              <img src="/assets/images/slider/hero-2.jpeg" alt="Ismael e Andreza" />
              <span className="gifts-cta__ornament o1" aria-hidden="true" />
              <span className="gifts-cta__ornament o2" aria-hidden="true" />
              <span className="gifts-cta__ornament o3" aria-hidden="true" />
            </div>

            <div className="gifts-cta__badge" aria-hidden="true">
              <span className="gifts-cta__badge-ring" />
              <span className="gifts-cta__badge-core">
                <i className="fi flaticon-heart" />
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}