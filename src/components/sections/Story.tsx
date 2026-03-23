const STORY_ITEMS = [
  {
    date: "Quando tudo começou",
    title: "O primeiro encontro",
    text:
      "Nossa história começou de forma leve, com conversa boa, risadas sinceras e aquela sensação gostosa de que havia algo especial acontecendo dali em diante.",
    image: "/assets/images/story/4.jpg",
    flower: "/assets/images/story/flower.svg",
    reverse: false,
  },
  {
    date: "O tempo confirmou",
    title: "Amor construído no dia a dia",
    text:
      "Entre momentos simples e grandes sonhos, fomos construindo uma relação baseada em carinho, parceria, fé e vontade de caminhar lado a lado em cada fase da vida.",
    image: "/assets/images/story/5.jpg",
    flower: "/assets/images/story/flower-2.svg",
    reverse: true,
  },
  {
    date: "Nosso novo capítulo",
    title: "A decisão de dizer sim",
    text:
      "Hoje celebramos não apenas uma data, mas tudo o que vivemos até aqui. Este casamento marca o começo de uma nova etapa, ainda mais bonita, que queremos dividir com quem amamos.",
    image: "/assets/images/story/6.jpg",
    flower: "/assets/images/story/flower.svg",
    reverse: false,
  },
];

export function Story() {
  return (
    <section className="wpo-story-section-s2 section-padding" id="story">
      <div className="container">
        <div className="wpo-section-title">
          <span>Nossa história</span>
          <h2>Como chegamos até aqui</h2>
        </div>

        <div className="wpo-story-wrap">
          {STORY_ITEMS.map((item) => (
            <div className="wpo-story-item" key={item.title}>
              <div className="row">
                <div className={`col col-lg-6 col-12 ${item.reverse ? "order-lg-2 order-1" : ""}`}>
                  <div className="wpo-story-img">
                    <img src={item.image} alt={item.title} />
                  </div>
                </div>

                <div className={`col col-lg-6 col-12 ${item.reverse ? "order-lg-1 order-2" : ""}`}>
                  <div className="wpo-story-content wow flipInX" data-wow-duration="1000ms">
                    <div className="thumb">
                      <span>{item.date}</span>
                      <div className="pin">
                        <img src="/assets/images/story/pin.svg" alt="" />
                      </div>
                    </div>
                    <h2>{item.title}</h2>
                    <p>{item.text}</p>
                    <div className="flower">
                      <img src={item.flower} alt="" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="ring-wrap">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div className="ring" key={idx}>
                    <img src="/assets/images/story/ring.svg" alt="" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flower-shape-1">
        <img src="/assets/images/story/flower-shape1.svg" alt="" />
      </div>
      <div className="flower-shape-2">
        <img src="/assets/images/story/flower-shape2.svg" alt="" />
      </div>
      <div className="flower-shape-3">
        <img src="/assets/images/story/flower-shape3.svg" alt="" />
      </div>
      <div className="flower-shape-4">
        <img src="/assets/images/story/flower-shape4.svg" alt="" />
      </div>
    </section>
  );
}
