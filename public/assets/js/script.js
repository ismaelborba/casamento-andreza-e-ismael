(function ($) {

    "use strict";

    /*------------------------------------------
        Nice Select
    -------------------------------------------*/

    $('.select').niceSelect();

    /*------------------------------------------
        = ALL ESSENTIAL FUNCTIONS
    -------------------------------------------*/


    // Toggle mobile navigation
    function toggleMobileNavigation() {
        var navbar = $(".navigation-holder");
        var openBtn = $(".mobail-menu .open-btn");
        var xbutton = $(".mobail-menu .navbar-toggler");

        openBtn.on("click", function (e) {
            e.stopImmediatePropagation();
            navbar.toggleClass("slideInn");
            xbutton.toggleClass("x-close");
            return false;
        })
    }

    toggleMobileNavigation();


    // Function for toggle class for small menu
    function toggleClassForSmallNav() {
        var windowWidth = window.innerWidth;
        var mainNav = $("#navbar > ul");

        if (windowWidth <= 991) {
            mainNav.addClass("small-nav");
        } else {
            mainNav.removeClass("small-nav");
        }
    }

    toggleClassForSmallNav();


    // Function for small menu
    function smallNavFunctionality() {
        var windowWidth = window.innerWidth;
        var mainNav = $(".navigation-holder");
        var smallNav = $(".navigation-holder > .small-nav");
        var subMenu = smallNav.find(".sub-menu");
        var megamenu = smallNav.find(".mega-menu");
        var menuItemWidthSubMenu = smallNav.find(".menu-item-has-children > a");

        if (windowWidth <= 991) {
            subMenu.hide();
            megamenu.hide();
            menuItemWidthSubMenu.on("click", function (e) {
                var $this = $(this);
                $this.siblings().slideToggle();
                e.preventDefault();
                e.stopImmediatePropagation();
                $this.toggleClass("rotate");
            })
        } else if (windowWidth > 991) {
            mainNav.find(".sub-menu").show();
            mainNav.find(".mega-menu").show();
        }
    }

    smallNavFunctionality();


    // function for active menuitem
    function activeMenuItem($links) {
        var top = $(window).scrollTop(),
            windowHeight = $(window).height(),
            documentHeight = $(document).height(),
            cur_pos = top + 2,
            sections = $("section"),
            nav = $links,
            nav_height = nav.outerHeight();


        sections.each(function () {
            var top = $(this).offset().top - nav_height,
                bottom = top + $(this).outerHeight();

            if (cur_pos >= top && cur_pos <= bottom) {
                nav.find("> ul > li > a").parent().removeClass("current-menu-item");
                nav.find("a[href='#" + $(this).attr('id') + "']").parent().addClass("current-menu-item");
            } else if (cur_pos === 2) {
                nav.find("> ul > li > a").parent().removeClass("current-menu-item");
            }

        });
    }


    // smooth-scrolling
    function smoothScrolling($scrollLinks, $topOffset) {
        var links = $scrollLinks;
        var topGap = $topOffset;

        links.on("click", function () {
            if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
                if (target.length) {
                    $("html, body").animate({
                        scrollTop: target.offset().top - topGap
                    }, 1000, "easeInOutExpo");
                    return false;
                }
            }
            return false;
        });
    }



    $("body").on("click", function () {
        $('.navigation-holder').removeClass('slideInn');
    });
    $(".menu-close").on("click", function () {
        $('.navigation-holder').removeClass('slideInn');
    });
    $(".menu-close").on("click", function () {
        $('.open-btn').removeClass('x-close');
    });


    // toggle1
    $('#toggle1').on("click", function () {
        $('.create-account').slideToggle();
        $('.caupon-wrap.s1').toggleClass('active-border')
    })

    // toggle2
    $('#toggle2').on("click", function () {
        $('#open2').slideToggle();
        $('.caupon-wrap.s2').toggleClass('coupon-2')
    })

    // toggle3
    $('#toggle3').on("click", function () {
        $('#open3').slideToggle();
        $('.caupon-wrap.s2').toggleClass('coupon-2')
    })
    // toggle4
    $('#toggle4').on("click", function () {
        $('#open4').slideToggle();
        $('.caupon-wrap.s3').toggleClass('coupon-2')
    })

    $('.payment-select .addToggle').on('click', function () {
        $('.payment-name').addClass('active')
        $('.payment-option').removeClass('active')
    })


    $('.payment-select .removeToggle').on('click', function () {
        $('.payment-option').addClass('active')
        $('.payment-name').removeClass('active')
    });


    $(function () {
        $("#datepicker").datepicker();
    });


    // animation

    if ($("#scene").length) {
        var scene = document.getElementById('scene');
        var parallax = new Parallax(scene);
    }
    if ($("#scene-2").length) {
        var scene = document.getElementById('scene-2');
        var parallax = new Parallax(scene);
    }

    $(window).on('load', function() {
        if ($(".pointparallax").length) {
            $('.pointparallax').pointparallax();
        }
    });
    


    /*==================================
           LOAD MORE JQUERY
   ================================== */
    var list1 = $(".moreload");
    var numToShow1 = 8;
    var button1 = $(".loadmore-btn");
    var numInList1 = list1.length;

    list1.hide();
    if (numInList1 > numToShow1) {
        button1.show();
    }
    list1.slice(0, numToShow1).show();
    button1.on('click', function () {
        var showing1 = list1.filter(':visible').length;
        list1.slice(showing1 - 1, showing1 + numToShow1).fadeIn();
        var nowShowing1 = list1.filter(':visible').length;
        if (nowShowing1 >= numInList1) {
            button1.hide();
        }
    });


    // tooltips

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })


    // Parallax background
    function bgParallax() {
        if ($(".parallax").length) {
            $(".parallax").each(function () {
                var height = $(this).position().top;
                var resize = height - $(window).scrollTop();
                var doParallax = -(resize / 5);
                var positionValue = doParallax + "px";
                var img = $(this).data("bg-image");

                $(this).css({
                    backgroundImage: "url(" + img + ")",
                    backgroundPosition: "50%" + positionValue,
                    backgroundSize: "cover"
                });
            });
        }
    }

    // HERO SLIDER
    var menu = [];
    jQuery('.swiper-slide').each(function (index) {
        menu.push(jQuery(this).find('.slide-inner').attr("data-text"));
    });
    var interleaveOffset = 0.5;
    var swiperOptions = {
        loop: true,
        speed: 1000,
        parallax: true,
        autoplay: {
            delay: 6500,
            disableOnInteraction: false,
        },
        watchSlidesProgress: true,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
            renderBullet: function (index, className) {
                return '<span class="' + className + '">' + (index + 1) + "</span>";
            },
        },

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        on: {
            progress: function () {
                var swiper = this;
                for (var i = 0; i < swiper.slides.length; i++) {
                    var slideProgress = swiper.slides[i].progress;
                    var innerOffset = swiper.width * interleaveOffset;
                    var innerTranslate = slideProgress * innerOffset;
                    swiper.slides[i].querySelector(".slide-inner").style.transform =
                        "translate3d(" + innerTranslate + "px, 0, 0)";
                }
            },

            touchStart: function () {
                var swiper = this;
                for (var i = 0; i < swiper.slides.length; i++) {
                    swiper.slides[i].style.transition = "";
                }
            },

            setTransition: function (speed) {
                var swiper = this;
                for (var i = 0; i < swiper.slides.length; i++) {
                    swiper.slides[i].style.transition = speed + "ms";
                    swiper.slides[i].querySelector(".slide-inner").style.transition =
                        speed + "ms";
                }
            }
        }
    };

    var swiper = new Swiper(".swiper-container", swiperOptions);

    // DATA BACKGROUND IMAGE
    var sliderBgSetting = $(".slide-bg-image");
    sliderBgSetting.each(function (indx) {
        if ($(this).attr("data-background")) {
            $(this).css("background-image", "url(" + $(this).data("background") + ")");
        }
    });



    /*------------------------------------------
        = TOGGLE MUSUC BIX
    -------------------------------------------*/
    if($(".music-box").length) {
        var musicBtn = $(".music-box-toggle-btn"),
            musicBox = $(".music-holder");

        musicBtn.on("click", function() {
            musicBox.toggleClass("toggle-music-box");
            return false;
        })
    }


    /*------------------------------------------
        = HIDE PRELOADER
    -------------------------------------------*/
    function preloader() {
        if ($('.preloader').length) {
            $('.preloader').delay(100).fadeOut(500, function () {

                //active wow
                wow.init();


            });
        }
    }


    /*------------------------------------------
        = WOW ANIMATION SETTING
    -------------------------------------------*/
    var wow = new WOW({
        boxClass: 'wow',      // default
        animateClass: 'animated', // default
        offset: 0,          // default
        mobile: true,       // default
        live: true        // default
    });


    /*------------------------------------------
        = ACTIVE POPUP IMAGE
    -------------------------------------------*/
    if ($(".fancybox").length) {
        $(".fancybox").fancybox({
            openEffect: "elastic",
            closeEffect: "elastic",
            wrapCSS: "project-fancybox-title-style"
        });
    }


    /*------------------------------------------
        = POPUP YOUTUBE, VIMEO, GMAPS
    -------------------------------------------*/
    $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
        type: 'iframe',
        mainClass: 'mfp-fade',
        removalDelay: 160,
        preloader: false,
        fixedContentPos: false
    });



    /*------------------------------------------
        = POPUP VIDEO
    -------------------------------------------*/
    if ($(".video-btn").length) {
        $(".video-btn").on("click", function () {
            $.fancybox({
                href: this.href,
                aspectRatio: true,
                type: $(this).data("type"),
                'title': this.title,
                helpers: {
                    title: { type: 'inside' },
                    media: {}
                },

                beforeShow: function () {
                    $(".fancybox-wrap").addClass("gallery-fancybox");
                }
            });
            return false
        });
    }


    /*------------------------------------------
        = ACTIVE GALLERY POPUP IMAGE
    -------------------------------------------*/
    if ($(".popup-gallery").length) {
        $('.popup-gallery').magnificPopup({
            delegate: 'a',
            type: 'image',

            gallery: {
                enabled: true
            },

            zoom: {
                enabled: true,

                duration: 300,
                easing: 'ease-in-out',
                opener: function (openerElement) {
                    return openerElement.is('img') ? openerElement : openerElement.find('img');
                }
            }
        });
    }


    /*------------------------------------------
        = FUNCTION FORM SORTING GALLERY
    -------------------------------------------*/
    function sortingGallery() {
        if ($(".sortable-gallery .gallery-filters").length) {
            var $container = $('.gallery-container');
            $container.isotope({
                filter: '*',
                animationOptions: {
                    duration: 750,
                    easing: 'linear',
                    queue: false,
                }
            });

            $(".gallery-filters li a").on("click", function () {
                $('.gallery-filters li .current').removeClass('current');
                $(this).addClass('current');
                var selector = $(this).attr('data-filter');
                $container.isotope({
                    filter: selector,
                    animationOptions: {
                        duration: 750,
                        easing: 'linear',
                        queue: false,
                    }
                });
                return false;
            });
        }
    }

    sortingGallery();


    /*------------------------------------------
        = MASONRY GALLERY SETTING
    -------------------------------------------*/
    function masonryGridSetting() {
        if ($('.masonry-gallery').length) {
            var $grid = $('.masonry-gallery').masonry({
                itemSelector: '.grid-item',
                columnWidth: '.grid-item',
                percentPosition: true
            });

            $grid.imagesLoaded().progress(function () {
                $grid.masonry('layout');
            });
        }
    }

    // masonryGridSetting();


    /*------------------------------------------
      = FUNFACT
  -------------------------------------------*/
    if ($(".odometer").length) {
        $('.odometer').appear();
        $(document.body).on('appear', '.odometer', function (e) {
            var odo = $(".odometer");
            odo.each(function () {
                var countNumber = $(this).attr("data-count");
                $(this).html(countNumber);
            });
        });
    }



    /*------------------------------------------
            = STICKY HEADER
        -------------------------------------------*/

    // Function for clone an element for sticky menu
    function cloneNavForSticyMenu($ele, $newElmClass) {
        $ele.addClass('original').clone().insertAfter($ele).addClass($newElmClass).removeClass('original');
    }

    // clone home style 1 navigation for sticky menu
    if ($('.wpo-site-header .navigation').length) {
        cloneNavForSticyMenu($('.wpo-site-header .navigation'), "sticky-header");
    }

    var lastScrollTop = '';

    function stickyMenu($targetMenu, $toggleClass, $topOffset) {
        var st = $(window).scrollTop();
        var mainMenuTop = $('.wpo-site-header .navigation');

        if ($(window).scrollTop() > 500) {
            if (st > lastScrollTop) {
                // hide sticky menu on scroll down
                $targetMenu.addClass($toggleClass);

            } else {
                // active sticky menu on scroll up
                $targetMenu.addClass($toggleClass);
            }

        } else {
            $targetMenu.removeClass($toggleClass);
        }

        lastScrollTop = st;


    }


    /*------------------------------------------
            = Header search toggle
        -------------------------------------------*/
    if ($(".header-search-form-wrapper").length) {
        var searchToggleBtn = $(".search-toggle-btn");
        var searchToggleBtnIcon = $(".search-toggle-btn i");
        var searchContent = $(".header-search-form");
        var body = $("body");

        searchToggleBtn.on("click", function (e) {
            searchContent.toggleClass("header-search-content-toggle");
            searchToggleBtnIcon.toggleClass("fi flaticon-search fi ti-close");
            e.stopPropagation();
        });

        body.on("click", function () {
            searchContent.removeClass("header-search-content-toggle");
        }).find(searchContent).on("click", function (e) {
            e.stopPropagation();
        });
    }


    /*------------------------------------------
        = Header shopping cart toggle
    -------------------------------------------*/
    if ($(".mini-cart").length) {
        var cartToggleBtn = $(".cart-toggle-btn");
        var cartContent = $(".mini-cart-content");
        var cartCloseBtn = $(".mini-cart-close");
        var body = $("body");

        cartToggleBtn.on("click", function (e) {
            cartContent.toggleClass("mini-cart-content-toggle");
            e.stopPropagation();
        });

        cartCloseBtn.on("click", function (e) {
            cartContent.removeClass("mini-cart-content-toggle");
            e.stopPropagation();
        });

        body.on("click", function () {
            cartContent.removeClass("mini-cart-content-toggle");
        }).find(cartContent).on("click", function (e) {
            e.stopPropagation();
        });
    }


    /*------------------------------------------
    Portfolio SLIDER
    -------------------------------------------*/
    if ($(".portfolio-slide").length) {
        $(".portfolio-slide").owlCarousel({
            autoplay: true,
            smartSpeed: 300,
            margin: 0,
            loop: false,
            autoplayHoverPause: true,
            dots: false,
            nav: true,
            navText: ['<i class="fi flaticon-left-arrow"></i>', '<i class="fi flaticon-right-arrow-1"></i>'],
            items: 5,
            responsive: {
                0: {
                    items: 1,
                    dots: true,
                },

                767: {
                    items: 2,
                },
                1200: {
                    items: 3
                },
                1300: {
                    items: 4
                },

                1400: {
                    items: 4,
                },
                1500: {
                    items: 5
                },

            }
        });
    }


    /*------------------------------------------
        = Testimonial slider 1
    -------------------------------------------*/
    if ($(".wpo-testimonial-wrap").length) {
        $('.slider-for').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            fade: true,
            asNavFor: '.slider-nav',
            dots: false,
            responsive: [
                {
                    breakpoint: 991,
                    settings: {
                        dots: false
                    }
                }
            ]
        });
        $('.slider-nav').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            asNavFor: '.slider-for',
            focusOnSelect: true,
            arrows: false,
            dots: true,
            responsive: [
                {
                    breakpoint: 991,
                    settings: {
                        dots: true
                    }
                }
            ]
        });
    }
    /*------------------------------------------
        = Testimonial slider 2
    -------------------------------------------*/
    if ($(".wpo-testimonial-wrap").length) {
        $('.wpo-testimonial-active').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            focusOnSelect: true,
            arrows: false,
            dots: true,
        });
    }    
    
    /*------------------------------------------
        = Testimonial slider 3
    -------------------------------------------*/
    if ($(".wpo-testimonial-wrap-s2").length) {
        $('.wpo-testimonial-active-s2').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            focusOnSelect: true,
            arrows: false,
            dots: true,
        });
    }

    /*------------------------------------------
        = Testimonial slider 4
    -------------------------------------------*/
    if ($(".wpo-portfolio-section-s4").length) {
        $('.gallery-slide').slick({
            slidesToShow: 6,
            slidesToScroll: 1,
            focusOnSelect: true,
            arrows: false,
            dots: false,
            variableWidth: true,
            loop: false,
            autoplay: false,
        });
    }
    /*------------------------------------------
        = Testimonial slider 2
    -------------------------------------------*/
    if ($(".wpo-portfolio-section-s4").length) {
        $('.gallery-slide2').slick({
            slidesToShow: 6,
            slidesToScroll: 1,
            focusOnSelect: true,
            arrows: false,
            dots: false,
            variableWidth: true,
            loop: false,
            autoplay: false,
        });
    }


    /*------------------------------------------
        = Testimonial slider 1
    -------------------------------------------*/
    if ($(".static-hero-s6").length) {
        $('.slider-for').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            asNavFor: '.slider-nav',
            dots: false,
        });
        $('.slider-nav').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            asNavFor: '.slider-for',
            focusOnSelect: true,
            arrows: false,
            fade: true,
            dots: false,
            autoplay: true,
            autoplaySpeed: 3000,
            speed: 2000,
        });
    }


    /*------------------------------------------
        = Testimonial SLIDER
    -------------------------------------------*/
    if ($(".wpo-service-slider").length) {
        $(".wpo-service-slider").owlCarousel({
            autoplay: false,
            smartSpeed: 300,
            margin: 20,
            loop: true,
            autoplayHoverPause: true,
            dots: false,
            nav: true,
            navText: ['<i class="fi flaticon-left-arrow"></i>', '<i class="fi flaticon-right-arrow-1"></i>'],

            responsive: {
                0: {
                    items: 1,
                    dots: true,
                    nav: false
                },

                500: {
                    items: 1,
                    dots: true,
                    nav: false
                },

                768: {
                    items: 2,
                    dots: false,
                },

                1200: {
                    items: 3
                },

                1400: {
                    items: 3
                },

            }
        });
    }


    /*------------------------------------------
        = PARTNERS SLIDER
    -------------------------------------------*/
    if ($(".partners-slider").length) {
        $(".partners-slider").owlCarousel({
            autoplay: true,
            smartSpeed: 300,
            margin: 0,
            loop: true,
            autoplayHoverPause: true,
            dots: false,
            arrows: false,
            nav: false,
            responsive: {
                0: {
                    items: 2
                },

                550: {
                    items: 3
                },

                992: {
                    items: 4
                },

                1200: {
                    items: 5
                }
            }
        });
    }

/*------------------------------------------
    hero-items
-------------------------------------------*/
    if ($(".hero-items").length) {
        $(".hero-items").owlCarousel({
            autoplay: true,
            smartSpeed: 400,
            margin: 30,
            loop: true,
            autoplayHoverPause: true,
            dots: false,
            arrows: false,
            nav: true,
            center:true,
            navText: ['<i class="fi flaticon-left-arrow"></i>', '<i class="fi flaticon-right-arrow-1"></i>'],
            responsive: {
                0: {
                    items: 1,
                    margin: 10,
                },

                450: {
                    items: 1,
                    margin: 10,
                },
                
                575: {
                    items: 2,
                    center:false,
                    margin: 20,
                },
                
                767: {
                    items: 2,
                    center:false
                },

                992: {
                    items: 3
                },

                1200: {
                    items: 3
                }
            }
        });
    }

    /*------------------------------------------
        = POST SLIDER
    -------------------------------------------*/
    if ($(".post-slider".length)) {
        $(".post-slider").owlCarousel({
            mouseDrag: false,
            smartSpeed: 500,
            margin: 30,
            loop: true,
            nav: true,
            navText: ['<i class="fi ti-arrow-left"></i>', '<i class="fi ti-arrow-right"></i>'],
            dots: false,
            items: 1
        });
    }


    /*------------------------------------------
        = SHOP DETAILS PAGE PRODUCT SLIDER
    -------------------------------------------*/
    if ($(".shop-single-slider").length) {
        $('.slider-for').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            fade: true,
            asNavFor: '.slider-nav',
        });
        $('.slider-nav').slick({
            slidesToShow: 5,
            slidesToScroll: 1,
            asNavFor: '.slider-for',
            vertical: true,
            verticalSwiping: true,
            focusOnSelect: true,
            arrows: false,

            responsive: [
                {
                    breakpoint: 500,
                    settings: {
                        slidesToShow: 5,
                        infinite: true
                    }
                },
                {
                    breakpoint: 400,
                    settings: {
                        slidesToShow: 5
                    }
                }
            ]

        });
    }

    /*------------------------------------------
        = TOUCHSPIN FOR PRODUCT SINGLE PAGE
    -------------------------------------------*/
    if ($("input[name='product-count']").length) {
        $("input[name='product-count']").TouchSpin({
            verticalbuttons: true
        });
    }


    /*----------------------------
        = SHOP PRICE SLIDER
    ------------------------------ */
    if ($("#slider-range").length) {
        $("#slider-range").slider({
            range: true,
            min: 12,
            max: 200,
            values: [0, 100],
            slide: function (event, ui) {
                $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
            }
        });

        $("#amount").val("$" + $("#slider-range").slider("values", 0) + " - $" + $("#slider-range").slider("values", 1));
    }


    /*-----------------------
       cart-plus-minus-button 
     -------------------------*/
    $(".cart-plus-minus").append('<div class="dec qtybutton">-</div><div class="inc qtybutton">+</div>');
    $(".qtybutton").on("click", function () {
        var $button = $(this);
        var oldValue = $button.parent().find("input").val();
        if ($button.text() == "+") {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            // Don't allow decrementing below zero
            if (oldValue > 0) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 0;
            }
        }
        $button.parent().find("input").val(newVal);
    });


    /*------------------------------------------
       = BACK TO TOP BTN SETTING
   -------------------------------------------*/
    $("body").append("<a href='#' class='back-to-top'><i class='ti-arrow-up'></i></a>");

    function toggleBackToTopBtn() {
        var amountScrolled = 1000;
        if ($(window).scrollTop() > amountScrolled) {
            $("a.back-to-top").fadeIn("slow");
        } else {
            $("a.back-to-top").fadeOut("slow");
        }
    }

    $(".back-to-top").on("click", function () {
        $("html,body").animate({
            scrollTop: 0
        }, 700);
        return false;
    })


    /*------------------------------------------
        = COUNTDOWN CLOCK
    -------------------------------------------*/
    if ($("#clock").length) {
        $('#clock').countdown('2026-11-30 20:30:00', function (event) {
            var $this = $(this).html(event.strftime(''
                // + '<div class="box"><div><div class="time">%m</div> <span>Month</span> </div></div>'
                + '<div class="box"><div><div class="time">%D</div> <span>Days</span> </div></div>'
                + '<div class="box"><div><div class="time">%H</div> <span>Hours</span> </div></div>'
                + '<div class="box"><div><div class="time">%M</div> <span>Mins</span> </div></div>'
                + '<div class="box"><div><div class="time">%S</div> <span>Secs</span> </div></div>'));
        });
    }
    /*------------------------------------------
        = COUNTDOWN CLOCK
    -------------------------------------------*/
    if ($("#clock2").length) {
        $('#clock2').countdown('2026-11-30 20:30:00', function (event) {
            var $this = $(this).html(event.strftime(''
                + '<div class="box"><div><div class="time">%D</div> <span>Days</span> </div></div>'
                + '<div class="box"><div><div class="time">%H</div> <span>Hours</span> </div></div>'
                + '<div class="box"><div><div class="time">%M</div> <span>Mins</span> </div></div>'
                + '<div class="box"><div><div class="time">%S</div> <span>Secs</span> </div></div>'));
        });
    }

    /*------------------------------------------
        = COUNTDOWN CLOCK
    -------------------------------------------*/
    if ($("#clock3").length) {
        $('#clock3').countdown('2026-11-01 20:30:00', function (event) {
            var $this = $(this).html(event.strftime(''
                + '<div class="box"><div><div class="time">%D</div> <span>أيام</span> </div></div>'
                + '<div class="box"><div><div class="time">%H</div> <span>ساعات</span> </div></div>'
                + '<div class="box"><div><div class="time">%M</div> <span>دقيقة</span> </div></div>'
                + '<div class="box"><div><div class="time">%S</div> <span>ثانية</span> </div></div>'));
        });
    }



    /*------------------------------------------
        = CONTACT FORM SUBMISSION
    -------------------------------------------*/
    if ($("#contact-form-main").length) {
        $("#contact-form-main").validate({
            rules: {
                name: {
                    required: true,
                    minlength: 2
                },

                email: "required",

                phone: "required",

                adress: "required",

                guest: "required",

                meal: "required",

                date: "required",

                what: "required",

                service: "required",

            },

            messages: {
                name: "Please enter your name",
                email: "Please enter your email address",
                phone: "Please enter your phone number",
                adress: "Please enter your adress",
                guest: "Please select your guest Number",
                meal: "Please select your Meal Name",
                date: "Please select your Date",
                what: "Please select your Reason",
                service: "Please select your Service"
            },

            submitHandler: function (form) {
                $.ajax({
                    type: "POST",
                    url: "mail-contact.php",
                    data: $(form).serialize(),
                    success: function () {
                        $("#loader").hide();
                        $("#success").slideDown("slow");
                        setTimeout(function () {
                            $("#success").slideUp("slow");
                        }, 3000);
                        form.reset();
                    },
                    error: function () {
                        $("#loader").hide();
                        $("#error").slideDown("slow");
                        setTimeout(function () {
                            $("#error").slideUp("slow");
                        }, 3000);
                    }
                });
                return false; // required to block normal submit since you used ajax
            }

        });
    }


    /*==========================================================================
        WHEN DOCUMENT LOADING
    ==========================================================================*/
    $(window).on('load', function () {

        preloader();

        sortingGallery();

        toggleMobileNavigation();

        smallNavFunctionality();

        smoothScrolling($("#navbar > ul > li > a[href^='#'], a.theme-btn-s2[href^='#'], .preview-middle-text a.scrool[href^='#'] "), $(".wpo-site-header .navigation, .site-header .nav").innerHeight());
    });



    /*==========================================================================
        WHEN WINDOW SCROLL
    ==========================================================================*/
    $(window).on("scroll", function () {

        toggleBackToTopBtn();

        activeMenuItem($(".navigation-holder"));

        if ($(".wpo-site-header").length) {
            stickyMenu($('.wpo-site-header .navigation'), "sticky-on");
        }

    });


    /*==========================================================================
        WHEN WINDOW RESIZE
    ==========================================================================*/
    $(window).on("resize", function () {
        toggleClassForSmallNav();
        //smallNavFunctionality();

        clearTimeout($.data(this, 'resizeTimer'));
        $.data(this, 'resizeTimer', setTimeout(function () {
            smallNavFunctionality();

        }, 200));

    });


    /*------------------------------------------
      color toggle
    -------------------------------------------*/
    if($(".color-switcher-wrap").length) {
        var colorToggleBtn = $(".color-toggle-btn");
        var colorContent = $(".color-switcher-item");
        var body = $("body");

        colorToggleBtn.on("click", function(e) {
            colorContent.toggleClass("color-switcher-open");
            e.stopPropagation();
        });

        body.on("click", function() {
            colorContent.removeClass("color-switcher-open");
        }).find(searchContent).on("click", function(e) {
            e.stopPropagation();
        });
    }

    // color-change
    $('.color-switcher-wrap ul li.btn').on("click", function(e){
        e.stopPropagation();
        $('.color-switcher-wrap ul li.btn').removeClass('active')
        $(this).addClass('active')
        let getId = $(this).attr('id')

        $("body").attr('class', '');

        if(getId == 'Button1'){
            $('body').addClass('color1') 
            localStorage.setItem('switerColor', 'color1')
        }else if(getId == 'Button2'){
            $('body').addClass('color2')
            localStorage.setItem('switerColor', 'color2')
        }else if(getId == 'Button3'){
            $('body').addClass('color3')
            localStorage.setItem('switerColor', 'color3')
        }else if(getId == 'Button4'){
            $('body').addClass('color4')
            localStorage.setItem('switerColor', 'color4')
        }else if(getId == 'Button5'){
            $('body').addClass('color5')
            localStorage.setItem('switerColor', 'color5')
        }else if(getId == 'Button6'){
            $('body').addClass('color6')
            localStorage.setItem('switerColor', 'color6')
        }else if(getId == 'Button7'){
            $('body').addClass('color7')
            localStorage.setItem('switerColor', 'color7')
        }else if(getId == 'Button8'){
            $('body').addClass('color8')
            localStorage.setItem('switerColor', 'color8')
        }else if(getId == 'Button9'){
            $('body').addClass('color9')
            localStorage.setItem('switerColor', 'color9')
        }else if(getId == 'Button10'){
            $('body').addClass('color10')
            localStorage.setItem('switerColor', 'color10')
        }else if(getId == 'Button11'){
            $('body').addClass('color11')
            localStorage.setItem('switerColor', 'color11')
        }else if(getId == 'Button12'){
            $('body').addClass('color12')
            localStorage.setItem('switerColor', 'color12')
        }else if(getId == 'Button13'){
            $('body').addClass('color13')
            localStorage.setItem('switerColor', 'color13')
        }else if(getId == 'Button14'){
            $('body').addClass('color14')
            localStorage.setItem('switerColor', 'color14')
        }else if(getId == 'Button15'){
            $('body').addClass('color15')
            localStorage.setItem('switerColor', 'color15')
        }
    });

    $(window).on('load', function(){
        if(localStorage.getItem('switerColor') == 'color1'){
            $('body').addClass('color1') 
            $('#Button1').addClass('active') 
        }else if(localStorage.getItem('switerColor') == 'color2'){
            $('body').addClass('color2')
            $('#Button2').addClass('active') 
        }else if(localStorage.getItem('switerColor') == 'color3'){
            $('body').addClass('color3')
            $('#Button3').addClass('active') 
        }else if(localStorage.getItem('switerColor') == 'color4'){
            $('body').addClass('color4')
            $('#Button4').addClass('active') 
        }else if(localStorage.getItem('switerColor') == 'color5'){
            $('body').addClass('color5')
            $('#Button5').addClass('active') 
        }else if(localStorage.getItem('switerColor') == 'color6'){
            $('body').addClass('color6')
            $('#Button6').addClass('active') 
        }else if(localStorage.getItem('switerColor') == 'color7'){
            $('body').addClass('color7')
            $('#Button7').addClass('active') 
        }else if(localStorage.getItem('switerColor') == 'color8'){
            $('body').addClass('color8')
            $('#Button8').addClass('active') 
        }else if(localStorage.getItem('switerColor') == 'color9'){
            $('body').addClass('color9')
            $('#Button9').addClass('active') 
        }else if(localStorage.getItem('switerColor') == 'color10'){
            $('body').addClass('color10')
            $('#Button10').addClass('active') 
        }else if(localStorage.getItem('switerColor') == 'color11'){
            $('body').addClass('color11')
            $('#Button11').addClass('active') 
        }else if(localStorage.getItem('switerColor') == 'color12'){
            $('body').addClass('color12')
            $('#Button12').addClass('active') 
        }else if(localStorage.getItem('switerColor') == 'color13'){
            $('body').addClass('color13')
            $('#Button13').addClass('active') 
        }else if(localStorage.getItem('switerColor') == 'color14'){
            $('body').addClass('color14')
            $('#Button14').addClass('active') 
        }else if(localStorage.getItem('switerColor') == 'color15'){
            $('body').addClass('color15')
            $('#Button15').addClass('active') 
        }

    })


    // login

    $(".reveal6").on('click', function () {
        var $pwd = $(".pwd6");
        if ($pwd.attr('type') === 'text') {
            $pwd.attr('type', 'password');
        } else {
            $pwd.attr('type', 'text');
        }
    });


    $(".reveal3").on('click', function () {
        var $pwd = $(".pwd2");
        if ($pwd.attr('type') === 'text') {
            $pwd.attr('type', 'password');
        } else {
            $pwd.attr('type', 'text');
        }
    });

    $(".reveal2").on('click', function () {
        var $pwd = $(".pwd3");
        if ($pwd.attr('type') === 'text') {
            $pwd.attr('type', 'password');
        } else {
            $pwd.attr('type', 'text');
        }
    });


})(window.jQuery);
