export function Story() {
    return (
        <section className="wpo-story-section-s2 section-padding" id="story">
            <div className="container">
                <div className="wpo-section-title">
                    <span>Our Story</span>
                    <h2>How it Happened</h2>
                </div>

                <div className="wpo-story-wrap">
                    <div className="wpo-story-item">
                        <div className="row">
                            <div className="col col-lg-6 col-12">
                                <div className="wpo-story-img">
                                    <img src="/assets/images/story/4.jpg" alt="" />
                                </div>
                            </div>

                            <div className="col col-lg-6 col-12">
                                <div className="wpo-story-content wow flipInX" data-wow-duration="1000ms">
                                    <div className="thumb">
                                        <span>15 June 2014</span>
                                        <div className="pin">
                                            <img src="/assets/images/story/pin.svg" alt="" />
                                        </div>
                                    </div>
                                    <h2>How we meet</h2>
                                    <p>
                                        Consectetur adipiscing elit. Fringilla at risus orci, tempus facilisi sed. Enim tortor, faucibus netus
                                        orci donec volutpat adipiscing. Sit condimentum elit convallis libero. Nunc in eu tellus ipsum placerat.
                                    </p>
                                    <div className="flower">
                                        <img src="/assets/images/story/flower.svg" alt="" />
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

                    <div className="wpo-story-item">
                        <div className="row">
                            <div className="col col-lg-6 col-12 order-lg-2 order-1">
                                <div className="wpo-story-img">
                                    <img src="/assets/images/story/5.jpg" alt="" />
                                </div>
                            </div>

                            <div className="col col-lg-6 col-12 order-lg-1 order-2">
                                <div className="wpo-story-content wow flipInX" data-wow-duration="1000ms">
                                    <div className="thumb">
                                        <span>12 Dec 2019</span>
                                        <div className="pin">
                                            <img src="/assets/images/story/pin.svg" alt="" />
                                        </div>
                                    </div>
                                    <h2>He proposed, I said yes</h2>
                                    <p>
                                        Consectetur adipiscing elit. Fringilla at risus orci, tempus facilisi sed. Enim tortor, faucibus netus
                                        orci donec volutpat adipiscing. Sit condimentum elit convallis libero. Nunc in eu tellus ipsum placerat.
                                    </p>
                                    <div className="flower">
                                        <img src="/assets/images/story/flower-2.svg" alt="" />
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

                    <div className="wpo-story-item">
                        <div className="row">
                            <div className="col col-lg-6 col-12">
                                <div className="wpo-story-img">
                                    <img src="/assets/images/story/6.jpg" alt="" />
                                </div>
                            </div>

                            <div className="col col-lg-6 col-12">
                                <div className="wpo-story-content wow flipInX" data-wow-duration="1000ms">
                                    <div className="thumb">
                                        <span>16 Jan 2022</span>
                                        <div className="pin">
                                            <img src="/assets/images/story/pin.svg" alt="" />
                                        </div>
                                    </div>
                                    <h2>Our Engagement Day</h2>
                                    <p>
                                        Consectetur adipiscing elit. Fringilla at risus orci, tempus facilisi sed. Enim tortor, faucibus netus
                                        orci donec volutpat adipiscing. Sit condimentum elit convallis libero. Nunc in eu tellus ipsum placerat.
                                    </p>
                                    <div className="flower">
                                        <img src="/assets/images/story/flower.svg" alt="" />
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
    )
}