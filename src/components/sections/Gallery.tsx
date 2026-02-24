export function Gallery() {
    return (
        <section className="wpo-portfolio-section section-padding" id="gallery">
            <h2 className="hidden">some</h2>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="portfolio-grids gallery-container clearfix portfolio-slide owl-carousel">
                            {["1", "2", "3", "4", "5", "6"].map((n) => (
                                <div className="grid" key={n}>
                                    <div className="img-holder">
                                        <a href={`/assets/images/portfolio/${n}.jpg`} className="fancybox" data-fancybox-group="gall-1">
                                            <img src={`/assets/images/portfolio/${n}.jpg`} alt="" className="img img-responsive" />
                                            <div className="hover-content">
                                                <i className="ti-plus"></i>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}