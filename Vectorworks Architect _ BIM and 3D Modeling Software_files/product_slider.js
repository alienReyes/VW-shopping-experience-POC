var productSlider;


/*
 * Product slider
 * author RSanchez
 * Date: 0
 */

// panorama configuration objecct
var userInitiated = false;
var viewer;
var slides = $(".slide");
var cSlide;
var isExplorer = false;
var panoBtnLabel = "Click to View Demo";
$(".close-full-screen").hide();

if (navigator.appName == 'Microsoft Internet Explorer' ||  !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== "undefined" && $.browser.msie == 1)) {
    panoBtnLabel = "Your Browser is not Supported";
    isExplorer = true;
}
if (isMobile() ==true) {
    panoBtnLabel = "Tap to View Demo";
}

function initProdSlider() {
    $(".slide").each(function(index) {
        var type = $(this).data("type");
        var slideW = $(this).data("width");
        $(this).css("width", slideW);

        if (type === "image") {

            var contentDiv = $(this).find(".slide-content");
            var imageUrl = $(this).data("content");

        } else if (type === "panorama") {

            //sets the parameters to load the iframe and builds the panorama slide
            var contentDiv = $(this).find(".slide-content");
            var imageUrl = $(this).data("content");
            contentDiv.attr("id", "pano" + index);
            contentDiv.html(
                "<iframe class='panoFrame ' src=''><iframe>"
            );
            contentDiv.append("<button class='close close-full-screen'><i class='ico ico-close-circ-fill'></i></button><img class='pano-background' src='"+imageUrl+"'/><div class='pano-overlay panoLoader'><span class='ico ico-pano-360'></span><p>" + panoBtnLabel + "</p></div> <button class='btn-fullscreen'><i class='ico ico-full-screen'></i></button>");
            contentDiv.find(".close-full-screen").hide();
            contentDiv.find(".btn-fullscreen").hide();
            if (isExplorer == true) {
                $('.pano-overlay').css('pointer-events','none');
            }

        } else if (type === "video") {

            //setup for video
            var slideVidCont = $(this).find(".slide-content");
            var id = "video" + index;
            slideVidCont.append("<div class='productSlider-vidCont' id='"+id+"'></div>");
            // slideVidCont.attr("id", id);
            var videoURL = $(this).data("content");
            var posterIMG = $(this).data("poster");
            jwplayer(id).setup({
                file: videoURL,
                image: posterIMG,
                autostart: "false",
                width: "100%",
                height:"100%" ,
                stretching: "fill"
            });
            slideVidCont.append("<div class='img-overlay' style='background-image:url('" + posterIMG + "')'></div>'");

        }
    });
}

initProdSlider();

$(".product-slider").on("init", function(event, slick) {
    cSlide = 0;
    updateContent(cSlide);
});

// On before slide change
$(".product-slider").on("afterChange", function(
    event,
    slick,
    currentSlide,
    nextSlide
) {
    cSlide = $(".product-slider").slick("slickCurrentSlide");
    userInitiated = false;
    updateContent(cSlide);
});

$(".product-slider").on("beforeChange", function(
    event,
    slick,
    currentSlide,
    nextSlide
) {
    var slideBefore = $(".product-slider").slick("slickCurrentSlide");
    var targetSlide = slides.eq(slideBefore);
    if (targetSlide.data("type") === "panorama") {
        if (userInitiated == true) {
            targetSlide.find(".panoLoader").show();
            targetSlide.find(".btn-fullscreen").hide();
            targetSlide.find(".panoFrame").attr("src", null);
            $('.pano-background').show();
        }
    }
    if (targetSlide.data("type") === "video") {
        var vidID = targetSlide.find(".productSlider-vidCont").attr("id");
        jwplayer(vidID).stop();
    }
    $(".photo-credit-cont").toggleClass("photo-credit-cont-transition");
});

function updateContent(cSlide) {
    var targetSlide = slides.eq(cSlide);
    var i = cSlide + 1;
    if (targetSlide.data("type") === "panorama") {}
    else if (targetSlide.data("type") === "video") {}
    $(".slide-counter").text(i + "/" + $('.product-slider .slide').not('.slick-cloned').length);

    $(".product-slider-photoCredit").text(targetSlide.data("title"));
    $(".photo-credit-cont").toggleClass("photo-credit-cont-transition");

    if(targetSlide.data("title") !== undefined && targetSlide.data("title") !== '') {
        $(".photo-credit-cont .ico-img-credit").css('display', 'inline-block'); //show icon
    } else {
        $(".photo-credit-cont .ico-img-credit").css('display', 'none'); //hide icon
    }
}

productSlider = $(".product-slider").slick({
    centerMode: true,
    infinite: true,
    arrows: false,
    centerPadding: "0",
    slidesToShow: 3,
    speed: 650,
    draggable: false,
    variableWidth: true,
    adaptiveHeight: true,
    useTransform: true,
    autoplaySpeed: 5000,
    swipe: 'false',
    useCSS: true,
    swipeToSlide: 'false',
    touchMove: 'false',
    responsive: [
        {
            breakpoint: 992,
            settings: {
                centerMode: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                variableWidth: false,
                draggable: false,
                adaptiveHeight: false
            }
        },
        {
            breakpoint: 576,
            settings: {
                centerMode: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                draggable: false,
                dots: false,
                variableWidth: false,
                autoplay: false,
                autoplaySpeed: 3000,
                pauseOnHover: true,
                adaptiveHeight: false,
                centerPadding: '-10px'
            }
        }
    ]
});

$(".next-slide").click(function(e) {
    userInitiated = true;
    e.preventDefault();
    $(".product-slider").slick("slickNext");
});
$(".prev-slide").click(function(e) {
    userInitiated = true;
    e.preventDefault();
    $(".product-slider").slick("slickPrev");
});

$("body").on("click", ".panoLoader", function() {
    var targetSlide = slides.eq(cSlide);
    var url = targetSlide.data("pano");

    productSlider.slick("slickPause");
    productSlider.slick("slickSetOption", "draggable", false, false);
    if (isMobile() == true) {
        $(".js-panoMobile-cont").fadeIn(400, function () {
            $(".js-panoMobile-cont .js-panoMobile").attr("src", url);
            generateIFRAMEDOM(targetSlide.data("content"), $(".js-panoMobile-cont .js-panoMobile"));
            $(".js-panoMobile-cont .js-panoMobile").fadeIn(600);
            $(".js-panoMobile-cont").find(".close-full-screen").fadeIn(300);
        });
    } else {
        targetSlide.find(".panoFrame").attr("src", url);
        generateIFRAMEDOM(targetSlide.data("content"), targetSlide.find(".panoFrame"));
        $(this).hide();
        $('.pano-background').hide();
        targetSlide.find(".btn-fullscreen").show(100);
    }
});


$("body").on("click", ".btn-fullscreen", function () {
    var targetSlide = slides.eq(cSlide);
    if (targetSlide.data("type") === "panorama") {
        $(this).fadeOut(100);
        $("li[data-type='panorama']").toggleClass('panorama-fullScreen');
        goFullScreen();
    } else if (targetSlide.data("type") === "image") {
        var imgUrl = targetSlide.data("content");
        $("#product-slide-modal").modal("show");
        $("#panzoom").attr("src", imgUrl);
    }
});

$("body").on("click", ".close-full-screen", function () {
    if (isMobile() == true) {
        $(".js-panoMobile-cont").find(".close-full-screen").hide(100);
        $(".js-panoMobile-cont").fadeOut("slow", function () {
            $(".js-panoMobile").attr("src", "null");
        });
    } else {
        goFullScreen();
        $(this).fadeOut(100);
    }
});

function isMobile() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
}

function generateIFRAMEDOM(src, iframe) {
    var pano_iframe = iframe.get(0);
    var pano_body = '<!DOCTYPE html>\
                    <html lang="en">\
                        <head>\
                            <meta charset="UTF-8">\
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">\
                            <meta http-equiv="X-UA-Compatible" content="ie=edge">\
                            <title></title>\
                            <script src="/cs/cached/themes/shared/assets/js/components/aframe.js"></script>\
                            <style>\
                            html, body {\
                                width: 100%;\
                                height: 100%;\
                                min-width: 380px;\
                                min-height: 380px;\
                            }\
                            .pano-container  {\
                                width: 100vw;\
                                height: 100vh;\
                            }\
                            </style>\
                        </head>\
                        <body>\
                            <div class="pano-container">\
                            <a-scene vr-mode-ui="enabled: false">\
                            <a-assets>\
                                <img id="textureImage" src="' + src + '">\
                            </a-assets>\
                            <a-sky src="#textureImage" rotation="0 -90 0"></a-sky>\
                            </a-scene>\
                            </div>\
                        </body>\
                    </html>';

    var iframedoc = pano_iframe.document;
    if (pano_iframe.contentDocument)
        iframedoc = pano_iframe.contentDocument;
    else if (pano_iframe.contentWindow)
        iframedoc = pano_iframe.contentWindow.document;

    if (iframedoc){
        iframedoc.open();
        iframedoc.writeln(pano_body);
        iframedoc.close();
    } else {
        //just in case of browsers that don't support the above 3 properties.
        console.log('Cannot show Panorama in iframe.');
    }
}

/*end of document ready */

function goFullScreen() {
    var targetSlide = slides.eq(cSlide);
    var id = targetSlide.find(".slide-content").attr("id");
    var elem = document.getElementById(id);

    if (
        document.webkitFullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled
    ) {
        if (
            document.exitFullscreen||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        ) {

            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        } else {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            }
            else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        }
    } else {
        console.log("Fullscreen is not supported on your browser.");
    }
}


// FULLSCREEN EVENT LISTENERS
document.addEventListener("fullscreenchange", changeHandler, false);
document.addEventListener("webkitfullscreenchange", changeHandler, false);
document.addEventListener("mozfullscreenchange", changeHandler, false);

function changeHandler(event) {
    var targetSlide = slides.eq(cSlide);
    var id = targetSlide.find(".slide-content").attr("id");
    var elem = document.getElementById(id);
    if (document.webkitIsFullScreen === false)
    {
        $(elem).find(".close-full-screen").hide();
        $(elem).find('.btn-fullscreen').show();
    }
    else if (document.mozFullScreen === false)
    {
        $(elem).find(".close-full-screen").hide();
        $(elem).find('.btn-fullscreen').show();

    }
    else if (document.msFullscreenElement === false)  {
        $(elem).find(".close-full-screen").hide();
        $(elem).find('.btn-fullscreen').show();

    }
    else {
        $(elem).find(".close-full-screen").show();
        $(elem).find('.btn-fullscreen').hide();

    }
    if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement)
    {
        console.log ("exit full screen");
        $("li[data-type='panorama']").toggleClass('panorama-fullScreen');
    }
}


//Resets image on modal from product slidewr
$("#product-slide-modal").on("hidden.bs.modal", function(e) {
    $("#panzoom").panzoom("reset");
});
