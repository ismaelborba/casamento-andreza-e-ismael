import Image from "next/image";

const INTRO_PARAGRAPHS = [
  "Criamos este espaco para dividir com voces um momento muito especial das nossas vidas.",
  "Aqui voces encontram todas as informacoes do grande dia, como dress code, recomendacoes e lista de presentes. Pedimos, com carinho, que confirmem sua presenca.",
  "Vai ser ainda mais especial ter voces com a gente!",
];

const COUPLE_HIGHLIGHT_IMAGE = "/assets/images/couple/7.jpg";

export function Couple() {
  return (
    <section className="wpo-couple-section-s2 section-padding couple-story-section" id="couple">
      <div className="container">
        <div className="couple-story-intro">
          <Image
            src="/assets/images/logo-sem-fundo.png"
            width={72}
            height={72}
            style={{ display: 'inline' }}
            alt="Andreza e Ismael"
          />
          <h2>Sejam bem-vindos ao nosso site</h2>
          <div className="couple-story-intro-copy">
            {INTRO_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="couple-story-stage">
          <article className="couple-story-card couple-story-card--left">
            <div className="couple-story-card-shape" aria-hidden="true" />
            <div className="couple-story-card-content">
              <h3>Andreza Alves</h3>
              <p>
                Sensivel, leve e cheia de carinho, Andreza e quem transforma pequenos
                instantes em memorias especiais. Seu jeito doce faz desse amor um lugar
                de paz, beleza e acolhimento.
              </p>
            </div>
          </article>

          <div className="couple-story-connector" aria-hidden="true">
            <span className="couple-story-dot" />
            <span className="couple-story-line" />
          </div>

          <div className="couple-story-photo-shell">
            <div className="couple-story-photo-frame">
              {/* Troque a imagem abaixo quando quiser atualizar o retrato central da secao. */}
              <img src={COUPLE_HIGHLIGHT_IMAGE} alt="Andreza e Ismael" />
            </div>
          </div>

          <div className="couple-story-connector couple-story-connector--right" aria-hidden="true">
            <span className="couple-story-line" />
            <span className="couple-story-dot" />
          </div>

          <article className="couple-story-card couple-story-card--right">
            <div className="couple-story-card-shape" aria-hidden="true" />
            <div className="couple-story-card-content">
              <h3>Ismael Borba</h3>
              <p>
                Presenca firme, coracao generoso e sorriso acolhedor. Ismael e parceiro,
                amigo e abrigo, trazendo seguranca e verdade para cada passo dessa
                historia.
              </p>
            </div>
          </article>
        </div>
      </div>

      <div className="left-shape">
        <img src="/assets/images/couple/left.svg" alt="" />
      </div>
      <div className="right-shape">
        <img src="/assets/images/couple/right.svg" alt="" />
      </div>
    </section>
  );
}
