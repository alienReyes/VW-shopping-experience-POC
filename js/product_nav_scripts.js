$(document).ready(function() {

    //Get the sticky nav object.
    var stickyNav = $('#productStickyNav');
    //Compute it's height.
    var navHeight = stickyNav.outerHeight();
    navHeight = (navHeight == undefined) ? 80 : navHeight;
    //Create a negative margin equal to the height.
    stickyNav.css('margin-bottom', -navHeight);
    //Scroll function to change style.
    $(document).scroll(function () {
        stickyNav.toggleClass('scrolled', $(this).scrollTop() > navHeight);
        $('#logoBlack').toggleClass('hide', $(this).scrollTop() < navHeight);
        $('#logoWhite').toggleClass('hide', $(this).scrollTop() > navHeight);
        clearTimeout();
        setTimeout(setHeight, 0);
    });
    //Window resize function
    function setHeight() {
        //Get the sticky nav object.
        //stickyNav = $('#productStickyNav');
        //Compute it's height.
        navHeight = stickyNav.outerHeight();
        //Create a negative margin equal to the height.
        stickyNav.css('margin-bottom', -navHeight);
    }

    $(window).resize(function() {
        clearTimeout();
        setTimeout(setHeight, 0);
    }).trigger('resize');

});