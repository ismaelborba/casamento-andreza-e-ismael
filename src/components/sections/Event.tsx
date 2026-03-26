const EVENT_ITEMS = [
  {
    title: "Cerimonia",
    time: "03 de Maio de 2026 - inicio as 16h",
    address: "Os detalhes de local serao compartilhados com os convidados.",
    contact: "Chegue com antecedencia para aproveitar cada momento.",
  },
  {
    title: "Recepcao",
    time: "Logo apos a cerimonia",
    address: "A celebracao continuara com muita alegria ao lado de quem amamos.",
    contact: "Em breve, mais informacoes por aqui.",
  },
  {
    title: "Localizacao",
    time: "Mapa e endereco completos",
    address: "Assim que tudo estiver confirmado, atualizaremos esta secao.",
    contact: "Enquanto isso, voce pode acompanhar novidades pelo site.",
  },
];

export function Event() {
  return (
    <section className="wpo-event-section section-padding" id="event">
      <div className="container">
        <div className="wpo-section-title">
          <span>Nosso casamento</span>
          <h2>Quando e onde</h2>
        </div>

        <div className="wpo-event-wrap">
          <div className="row">
            {["1", "2", "3"].map((imageId, idx) => {
              const item = EVENT_ITEMS[idx];

              return (
                <div className="col col-lg-4 col-md-6 col-12" key={imageId}>
                  <div className="wpo-event-item wow fadeInUp" data-wow-duration={`${1000 + idx * 200}ms`}>
                    <div className="wpo-event-img">
                      <div className="wpo-event-img-inner">
                        <img src={`/assets/images/event/${imageId}.jpg`} alt={item.title} />
                      </div>
                    </div>

                    <div className="wpo-event-text">
                      <div className="title">
                        <h2>{item.title}</h2>
                      </div>

                      <ul>
                        <li>{item.time}</li>
                        <li>{item.address}</li>
                        <li>{item.contact}</li>
                        <li>
                          <a className="popup-gmaps" href="/#rsvp">
                            Ver atualizacoes
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
