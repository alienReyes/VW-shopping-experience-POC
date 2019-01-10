var panoBtnLabel, isExplorer, tgtContainer, panoURL;

if (navigator.appName == 'Microsoft Internet Explorer' || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== "undefined" && $.browser.msie == 1)) {
    panoBtnLabel = "Your Browser is not Supported";
    isExplorer = true;
}

if (isMobile()) {
    panoBtnLabel = "Tap to View Panorama";
    $('.js-panoInstructions').text(panoBtnLabel);
} else {
    panoBtnLabel = "Click to load Panorama";
    $('.js-panoInstructions').text(panoBtnLabel);
}


$(".js-loadPano").click(function () {
    tgtContainer = $(this).data("container");
    panoURL = $(this).data("url");

    if(panoURL && tgtContainer) {
        if (isMobile()) {
            openMobilePano(panoURL)
        } else {
            if ($(this).hasClass('panorama__overlay')) {
                loadPano(tgtContainer, panoURL, "desktop");
            }
            else if ($(this).hasClass('js-innoIcon')) {
                loadPano(tgtContainer, panoURL, "phone");
            }
        }
    }
});


//Show Pano in Fullscreen
$(".js-fullScreenBtn").click(function () {
    panoFullScreen();
});


//Close Pano
$(".js-closePano").click(function () {
    panoFullScreen();
});


//Close pano in Mobile
$(".js-panoMobileClose").click(function () {
    $(".js-panoMobile-cont").fadeOut(100, function () {
        $(".js-panoMobile").attr("src", null);
        $(".js-panoMobile").hide();
        $(".close-full-screen").hide(300);
    })
});


//Video player click event
if($('.innovation-section li.innovation-section__icon-container').length) {
    var jwp;
    $('.innovation-section li.innovation-section__icon-container').click(function() {
        var data_link, is_video;
        if($(this).data('video-link')) {
            data_link = $(this).data('video-link');
            is_video = true;
        } else if($(this).data('external-link')) {
            data_link = $(this).data('external-link');
            is_video = false;
        }

        if(is_video == true && data_link !== undefined && data_link !== '' && jwplayer.constructor === Function) {
            jwp = jwplayer("innovationSectionVideoPlayer");
            jwp.setup({
                file: data_link,
                //autostart: false,
                mediaid: data_link.substring(data_link.lastIndexOf('/') + 1)
            });

            if(typeof window.vwPage.addJWListeners === "function") {
                window.vwPage.addJWListeners(jwp);
            }

            $('#innovationSectionVideoModal').modal('show');
        } else if(is_video == false && data_link !== undefined && data_link !== '' ) {
            window.open(data_link, '_blank');
        }
    });

    $(window).on('click', function (event) {
        if($('#innovationSectionVideoModal').is(':visible')
            && $('#innovationSectionVideoModal .modal-content').has(event.target).length == 0
            && !$('#innovationSectionVideoModal .modal-content').is(event.target)
            && jwp === Object)
        {
            jwp.stop();
        }
    });
}


$('#innovationSectionVideoModal').on('hidden.bs.modal', function() {
    if($(this).find('.jwplayer').length) {
        jwplayer($(this).find('.jwplayer').attr('id')).remove();
    } else {
        $(this).html('');
    }
});


/**
 * Generate Pano in IFrame
 *
 * @param src
 * @param iframe
 */
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


/**
 * Check if its Mobile
 *
 * @returns {boolean}
 */
function isMobile() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
}


/**
 * Open Panorama in amodal for Mobile
 *
 * @param panoURL
 */
function openMobilePano(panoURL) {
    if($(".js-panoMobile-cont").length) {
        $(".js-panoMobile-cont").fadeIn(300, function () {
            $(".js-panoMobile").attr("src", '(unknown)');
            generateIFRAMEDOM(panoURL, $(".js-panoMobile"));
            $(".js-panoMobile").show(600);
            $(".close-full-screen").fadeIn(300);
        });
    }
}


/**
 * Load Pano in iFrame
 *
 * @param tgtContainer
 * @param panoURL
 * @param contType
 */
function loadPano(tgtContainer, panoURL, contType) {
    var panoContainer = "." + tgtContainer;
    $('.js-panoInstructions').text("Loading Panorama");
    $(panoContainer).attr("src", '(unknown)');
    generateIFRAMEDOM(panoURL, $(panoContainer));

    $(panoContainer).on('load', function () {
        if (contType == "desktop") {
            $('.panorama__overlay').fadeOut(200);
            $('.panorama__panoContainer').contents().find('button').hide();
            $('.js-fullScreenBtn').show();
            $(panoContainer).addClass('panorama_pannoContainer--visible');
        }
    });
}


/**
 * Show/Close Pano Fullscreen
 */
function panoFullScreen() {
    elem = document.querySelector('.panorama');

    if (
        document.webkitFullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled
    ) {
        if (
            document.exitFullscreen ||
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

document.addEventListener("fullscreenchange", changeHandler, false);
document.addEventListener("webkitfullscreenchange", changeHandler, false);
document.addEventListener("mozfullscreenchange", changeHandler, false);


/**
 * Handler Event
 *
 * @param event
 */
function changeHandler(event) {
    if (document.webkitIsFullScreen === false) {
        $('.js-closePano').hide();
        $('.js-fullScreenBtn').show();
    }
    else if (document.mozFullScreen === false) {
        $('.js-closePano').hide();
        $('.js-fullScreenBtn').show();

    }
    else if (document.msFullscreenElement === false) {
        $('.js-closePano').hide();
        $('.js-fullScreenBtn').show();

    }
    else {
        $('.js-closePano').show();
        $('.js-fullScreenBtn').hide();

    }
    if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
        console.log("exit full screen");
    }
}