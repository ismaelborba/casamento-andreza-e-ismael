export function RSVP() {
    return (
        <section className="wpo-contact-section-s2 section-padding" id="rsvp">
            <div className="container-fluid">
                <div className="row justify-content-center">
                    <div className="col col-xl-4 col-lg-6 col-md-6 col-12">
                        <div className="wpo-contact-section-wrapper">
                            <div className="wpo-section-title">
                                <h2>Are You Attending?</h2>
                            </div>

                            <div className="wpo-contact-form-area">
                                <form method="post" className="contact-validation-active" id="contact-form-main">
                                    <div>
                                        <input type="text" className="form-control" name="name" id="name" placeholder="Name" />
                                    </div>
                                    <div>
                                        <input type="email" className="form-control" name="email" id="email" placeholder="Email" />
                                    </div>

                                    <div className="radio-buttons">
                                        <p>
                                            <input type="radio" id="attend" name="radio-group" defaultChecked />
                                            <label htmlFor="attend">Yes, I will be there</label>
                                        </p>
                                        <p>
                                            <input type="radio" id="not" name="radio-group" />
                                            <label htmlFor="not">Sorry, I can’t come</label>
                                        </p>
                                    </div>

                                    <div>
                                        <select name="guest" className="form-control">
                                            <option disabled selected>
                                                Number Of Guests
                                            </option>
                                            <option>01</option>
                                            <option>02</option>
                                            <option>03</option>
                                            <option>04</option>
                                            <option>05</option>
                                        </select>
                                    </div>

                                    <div>
                                        <input type="text" className="form-control" name="what" id="what" placeholder="What Will You Be Attending" />
                                    </div>

                                    <div>
                                        <select name="meal" className="form-control last">
                                            <option disabled selected>
                                                Meal Preferences
                                            </option>
                                            <option>Chicken Soup</option>
                                            <option>Motton Kabab</option>
                                            <option>Chicken BBQ</option>
                                            <option>Mix Salad</option>
                                            <option>Beef Ribs </option>
                                        </select>
                                    </div>

                                    <div className="submit-area">
                                        <button type="submit" className="theme-btn">
                                            RSVP
                                        </button>
                                        <div id="c-loader">
                                            <i className="ti-reload"></i>
                                        </div>
                                    </div>

                                    <div className="clearfix error-handling-messages">
                                        <div id="success">Thank you, Message Send</div>
                                        <div id="error"> Error occurred while sending email. Please try again later.</div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bottom-bg">
                <svg viewBox="0 0 1920 634" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        className="bg-path"
                        d="M207 286C162.2 87.6 39 44.6667 -17 48L-91 22L-71 726H13L1977 670L1957 424C1926.6 318.4 1815 392 1763 442C1619.8 570 1503.33 495.333 1463 442C1270.2 162.8 1197.33 325.667 1185 442C1159.4 584.4 1117 537.333 1099 496C953.4 192.8 868.333 328.333 844 434C791.2 649.2 649.333 555.667 585 482C455.4 356.4 380.333 429.667 359 482C315 616.4 273.333 547.333 258 496L207 286Z"
                        fill=""
                    />
                    <path
                        className="bg-stroke"
                        d="M207 266C162.2 67.6 39 24.6667 -17 28L-91 2L-71 706H13L1977 650L1957 404C1926.6 298.4 1815 372 1763 422C1619.8 550 1503.33 475.333 1463 422C1270.2 142.8 1197.33 305.667 1185 422C1159.4 564.4 1117 517.333 1099 476C953.4 172.8 868.333 308.333 844 414C791.2 629.2 649.333 535.667 585 462C455.4 336.4 380.333 409.667 359 462C315 596.4 273.333 527.333 258 476L207 266Z"
                        stroke=""
                        strokeWidth="2"
                    />
                </svg>

                <div className="shape-1">
                    <img src="/assets/images/rsvp/shape.svg" alt="" />
                </div>
                <div className="shape-2 wow fadeInUp" data-wow-duration="1000ms">
                    <img src="/assets/images/rsvp/shape2.svg" alt="" />
                </div>
                <div className="shape-3 wow fadeInUp" data-wow-duration="1200ms">
                    <img src="/assets/images/rsvp/shape3.svg" alt="" />
                </div>
                <div className="shape-4 wow fadeInUp" data-wow-duration="1400ms">
                    <img src="/assets/images/rsvp/shape4.svg" alt="" />
                </div>
                <div className="shape-5 wow fadeInUp" data-wow-duration="1600ms">
                    <img src="/assets/images/rsvp/shape5.svg" alt="" />
                </div>
                <div className="shape-6 wow fadeInUp" data-wow-duration="1800ms">
                    <img src="/assets/images/rsvp/shape6.svg" alt="" />
                </div>
            </div>
        </section>
    )
}