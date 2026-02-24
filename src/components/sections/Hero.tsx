export function Hero() {
    return (
        <section className="static-hero-s2">
            <div className="hero-container">
                <div className="hero-inner">
                    <div className="container-fluid">
                        <div className="row align-items-center">
                            <div className="col-xl-6 col-lg-6 col-12">
                                <div className="wpo-static-hero-inner">
                                    <div className="slide-title-sub wow fadeInUp" data-wow-duration="1400ms">
                                        <h3>Ismael &amp; Andreza</h3>
                                    </div>

                                    <div className="slide-title wow fadeInUp" data-wow-duration="1500ms">
                                        <h2>Save the Date</h2>
                                    </div>

                                    <div data-swiper-parallax="400" className="slide-text wow fadeInUp" data-wow-duration="1600ms">
                                        <p>We Are Getting Married November 15,2024</p>
                                    </div>

                                    <div className="shape-2 wow fadeInUp" data-wow-duration="1800ms">
                                        <img src="/assets/images/slider/shape2.svg" alt="" />
                                    </div>

                                    <div className="clearfix"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="static-hero-right">
                <div className="static-hero-img scene" id="scene">
                    <div className="static-hero-img-inner">
                        <img className="zoom" src="/assets/images/slider/hero-2.jpg" alt="" />
                        <div className="hero-img-inner-shape">
                            <img src="/assets/images/slider/shape9.svg" alt="" />
                        </div>
                        <div className="hero-img-inner-shape-2">
                            <img src="/assets/images/slider/shape10.svg" alt="" />
                        </div>
                    </div>

                    <div className="static-hero-shape-1 wow fadeInUp" data-wow-delay=".5s">
                        <img src="/assets/images/slider/shape7.svg" alt="" />
                    </div>
                    <div className="static-hero-shape-2 wow fadeInDown" data-wow-delay=".5s">
                        <img src="/assets/images/slider/shape8.svg" alt="" />
                    </div>

                    <div className="inner-image-1">
                        <span className="layer" data-depth="0.25">
                            <img src="/assets/images/slider/inner-1.jpg" alt="" />
                        </span>
                    </div>
                    <div className="inner-image-2">
                        <span className="layer" data-depth="0.45">
                            <img src="/assets/images/slider/inner-2.jpg" alt="" />
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}