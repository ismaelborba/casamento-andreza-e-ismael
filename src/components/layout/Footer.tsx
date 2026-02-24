export function Footer() {
    return (
        <footer className="wpo-site-footer-s2">
            <div className="wpo-upper-footer">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col col-xl-3  col-lg-4 col-md-6 col-sm-12 col-12">
                            <div className="widget link-widget">
                                <div className="widget-title">
                                    <h3>Links</h3>
                                </div>

                                <div className="link-wrap">
                                    <ul>
                                        <li>
                                            <a href="about.html">About</a>
                                        </li>
                                        <li>
                                            <a href="service.html">Services</a>
                                        </li>
                                        <li>
                                            <a href="rsvp.html">RSVP</a>
                                        </li>
                                    </ul>
                                    <ul>
                                        <li>
                                            <a href="gallery.html">Gallery</a>
                                        </li>
                                        <li>
                                            <a href="index.html">Get Quote</a>
                                        </li>
                                        <li>
                                            <a href="contact.html">Contact</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="col col-xl-6 col-lg-4 col-md-6 col-sm-12 col-12">
                            <div className="widget about-widget">
                                <div className="logo widget-title">
                                    <a className="logo" href="index.html">
                                        Habibi
                                    </a>
                                </div>
                                <p>We can’t wait to see all of our beloved friends and relative s at our wedding.</p>

                                <ul>
                                    <li>
                                        <a href="#">
                                            <i className="ti-facebook"></i>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#">
                                            <i className="ti-twitter-alt"></i>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#">
                                            <i className="ti-instagram"></i>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="col col-xl-3  col-lg-4 col-md-6 col-sm-12 col-12">
                            <div className="widget wpo-service-link-widget">
                                <div className="widget-title">
                                    <h3>Contact </h3>
                                </div>
                                <div className="contact-ft">
                                    <p>Habibi@wpoceans.com</p>
                                    <p>
                                        4517 Washington Ave. Manchester,
                                        <br />
                                        Kentucky 39495
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="wpo-lower-footer">
                <div className="container">
                    <div className="row">
                        <div className="col col-xs-12">
                            <p className="copyright">
                                {" "}
                                &copy; Copyright {new Date().getFullYear()} | <a href="https://www.pyxisweb.com.br/" target="_blank" referrerPolicy="no-referrer">Agência PyxisWeb</a> | Todos os direitos reservados.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ft-shape-1">
                <img src="/assets/images/footer-shape-1.svg" alt="" />
            </div>
            <div className="ft-shape-2">
                <img src="/assets/images/footer-shape-2.svg" alt="" />
            </div>
        </footer>
    )
}