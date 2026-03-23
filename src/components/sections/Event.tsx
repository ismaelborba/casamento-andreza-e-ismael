const EVENT_ITEMS = [
  {
    title: "Cerimônia",
    time: "03 de Maio de 2026 • início às 16h",
    address: "Os detalhes de local serão compartilhados com os convidados.",
    contact: "Chegue com antecedência para aproveitar cada momento.",
  },
  {
    title: "Recepção",
    time: "Logo após a cerimônia",
    address: "A celebração continuará com muita alegria ao lado de quem amamos.",
    contact: "Em breve, mais informações por aqui.",
  },
  {
    title: "Localização",
    time: "Mapa e endereço completos",
    address: "Assim que tudo estiver confirmado, atualizaremos esta seção.",
    contact: "Enquanto isso, você pode acompanhar novidades pelo site.",
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
                            Ver atualizações
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
