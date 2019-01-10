var scrollStarted = false;
$(document).ready(function () {

    //Mobile Footer Nav Items Collapse
    $(".footer h2").click(function () {
        $(this).parent(".footer-nav").toggleClass("open");
        //Commented to stop from scrolling  as per David's request
        //('html, body').animate({ scrollTop: $(this).offset().top - 170 }, 1500 );
    });
    //FAQ Collapse
    $("#accordion h4").click(function () {
        $(this).parent(".card-header").toggleClass("open");
        //Commented to stop from scrolling  as per David's request
        //$('html, body').animate({ scrollTop: $(this).offset().top - 170 }, 1500 );
    });

    //Initialize variables progress bar
    var counter = 0;
    var progressBar;
    var activeBar = $('.carousel-indicators > li.active').find('.progress-bar');
    var activeIndicator = $('.carousel-indicators > li.active');

    /* Function to initialize events based on page scrolling */
    if ($('#quoteCarousel').length) {
        $(window).scroll(function () {
            var hT = $('.quote-section').offset().top,
                hH = $('.quote-section').outerHeight(),
                wH = $(window).height(),
                wS = $(this).scrollTop();
            if (wS > (hT + hH - wH) && wS < (hT + hH - wH) + hH) {   //Start the carousel.
                if (scrollStarted === false) {
                    startQuoteCarousel();
                }
            }
            // else if (wS > (hT + hH - wH) + hH) {                
            //    // console.log('pause');
            //     //Pause the carousel.
            //     //pauseQuoteCarousel();
            // }
        });
    }

    /* Function to update the progress bars to match the carousel interval */
    //Function to update progress bar.
    function progressBarRun(activeBar) {
        //Calculate the interval as carousel interval / 100
        var interval = $('#quoteCarousel').data('interval') / 100;
        progressBar = setInterval(function () {
            counter += 1;
            //Clear counter if full.
            if (counter > 100) clearInterval(progressBar);
            //Update the active progress bar with the counter value.
            activeBar.css("width", counter + "%");
        }, interval);
    }

    /* Function to handle the indicators and intervals */
    $('.carousel-indicators > li').on('click', function () {
        //Only run functions if not already active.
        if (!$(this).hasClass('active')) {
            //Clear all the progress bars.
            $('.progress-bar').css("width", 0);
            //$(this).find('.progress-bar').css("width", '0%');
            counter = 0;
            clearInterval(progressBar);
            if ($(this).is(':first-child')) {
                activeIndicator = $('.carousel-indicators > li').last();
            }
            else {
                activeIndicator = $(this).prev('.carousel-indicators > li');
            }
        }
    });

    /* Function to run on slide change */
    $('#quoteCarousel').on('slide.bs.carousel', function () {
        //Check to see if the current indicator is the last of type.
        if (activeIndicator.is(':last-child')) {
            //Clear all the progress bars.
            $('.progress-bar').css("width", 0);
            //Reset the indicator.
            activeIndicator = $('.carousel-indicators > li').first();
        }
        else {
            //Else get the next sibling.
            activeIndicator = activeIndicator.next('.carousel-indicators > li');
        }
        //Grab the closest progress bar.
        activeBar = activeIndicator.find('.progress-bar');
        counter = 0;
        clearInterval(progressBar);
        progressBarRun(activeBar);
    });

    /* Function to instantiate the quote carousel */
    function startQuoteCarousel() {
        scrollStarted = true;
        if (!$('#quoteCarousel').hasClass('running')) {
            //Grab the closest progress bar.
            activeBar = activeIndicator.find('.progress-bar');
            //Start the progress bar.
            progressBarRun(activeBar);
            //Turn on the carousel cycle.
            $('#quoteCarousel').carousel('cycle');
            //Add a running class.
            $($('#quoteCarousel')).addClass('running');
        }
    }

    /* Function to pause the quote carousel */
    function pauseQuoteCarousel() {

        //Grab the closest progress bar.
        activeBar = activeIndicator.find('.progress-bar');
        counter = 0;
        //Stop the progress bar.
        clearInterval(progressBar);
        //Pause the carousel.
        $('#quoteCarousel').carousel('pause');
        //Remove the running class.
        $($('#quoteCarousel')).removeClass('running');
    }

    /* Function match the heights of the selected elements */
    $('.carousel-item').matchHeight({
        byRow: false,
        property: 'height',
        target: null,
        remove: false
    });

    /* Function match the heights of the selected elements */
    $('.logo-wrapper').matchHeight({
        byRow: false,
        property: 'height',
        target: null,
        remove: false
    });

    /* Function for the form focus */
    $('input, select, textarea').on('focus', function () {
        //Add the focus class to the parent form group.
        $(this).closest('.form-group').addClass('has-focus');
    }).on('blur', function () {
        //Remove existing focus class.
        $(this).closest('.form-group').removeClass('has-focus');
    });

    /* Function for form validation */
    // Setup form validation on trial form
    if ($.validate) {
        $.validate({
            form: '#trial',
            modules: 'html5, date',
            borderColorOnError: '',
            onSuccess: function ($form) {
                //Hide the form.
                $form.hide();
                //Show the success message.
                $('.form-thankyou').show();
                //Stop the form submission.
                return false;
            },
            inlineErrorMessageCallback: function ($input, errorMessage, config) {
                if (errorMessage) {
                    if ($input.attr('type') == 'checkbox' || $input.attr('type') == 'radio') {
                        //Get the form row
                        var row = $input.closest('.form-row');
                        //Attach the has-error class.
                        row.addClass('has-error');
                        //Get the label for the input.
                        var label = row.find(".label-wrapper>label");
                    }
                    else {
                        //Get the label for the input.
                        var label = $input.parent().find("label");
                    }
                    //console.log(label);
                    //Hide the field name.
                    label.find("span.fieldLabel").hide();
                    //Prepend the input with the error message.
                    label.find("span.error-msg").text(errorMessage);
                }
                else {
                    if ($input.attr('type') == 'checkbox' || $input.attr('type') == 'radio') {
                        //Get the form row
                        var row = $input.closest('.form-row');
                        //Attach the has-error class.
                        row.removeClass('has-error');
                        //Get the label for the input.
                        var label = row.find(".label-wrapper>label");
                    }
                    else {
                        //Get the label for the input.
                        var label = $input.parent().find("label");
                    }
                    //Show the field name.
                    label.find("span.fieldLabel").show();
                    //Remove the error message.
                    label.find("span.error-msg").text("");
                }
            }
        });
    }

    /* Function to only validate input fields with a value */
    // Validation event listeners
    $('input, select, textarea').on('beforeValidation', function (value, lang, config) {
        if ($(this).val() == "") {
            $(this).attr('data-validation-skipped', 1);
        }
        else {
            $(this).removeAttr('data-validation-skipped');
        }
    }).on('focus', function () {
        //Get the parent.
        var parent = $(this).parent()
        //Remove the has error class.
        parent.removeClass('has-error');
        //Get the label for the input.
        var label = parent.find("label");
        //Show the field name.
        label.find("span.fieldLabel").show();
        //Remove the error message.
        label.find("span.error-msg").text("");
    });


    /* Function to style the success messages for checkboxes */
    $('input[type=checkbox]').on('change', function () {
        //Get the form row
        var row = $(this).closest('.form-row');
        //Remove the has-success class.
        row.removeClass('has-success');
        if ($(this).isValid() && $('input:checkbox:checked').length > 0) {
            //Attach the has-success class.
            row.addClass('has-success');
        }
    });

    /* Function to style the success messages for radios */
    $('input[type=radio]').on('change', function () {
        //Get the form row
        var row = $(this).closest('.form-row');
        if ($(this).isValid() && $('input:radio:checked').length > 0) {
            //Attach the has-success class.
            row.addClass('has-success');
        }
    });

    /* Function for custom datepicker functions */
    DatePicker = {
        hideOldDays: function () { // hide days for previous month
            var x = $('.datepicker .datepicker-days tr td.old');
            if (x.length > 0) {
                x.css('visibility', 'hidden');
                if (x.length === 7) {
                    x.parent().hide();
                }
            }
        },
        hideNewDays: function () { // hide days for next month
            var x = $('.datepicker .datepicker-days tr td.new');
            if (x.length > 0) {
                x.hide();
            }
        },
        hideOtherMonthDays: function () { // hide days not for current month
            DatePicker.hideOldDays();
            DatePicker.hideNewDays();
        }
    };

    /* Function for the default datepickers */
    if ($.fn.datepicker !== undefined) {
        $('.vw-datepicker').datepicker({
            autoclose: true,
            daysOfWeekDisabled: [0, 6],
            format: 'mm/dd/yyyy',
            templates: {
                leftArrow: '<i class="ico ico-chevron-lft"></i>',
                rightArrow: '<i class="ico ico-chevron-rt"></i>'
            }
        }).on('show', function (e) {
            DatePicker.hideOtherMonthDays();
        });
    }

    /* Function for jwplayer */
    if ($('#videoPlayer').length) {
        var playerInstance = jwplayer("videoPlayer");
        var video = $('#videoPlayer').data('video');
        playerSetup(playerInstance, video);
        $('.header-button').on('click', function () {
            playerInstance.play();
        });
        $('.btn-close').on('click', function () {
            playerInstance.stop();
        });
    }

    function playerSetup(playerInstance, video) {
        playerInstance.setup({
            file: video,
            mediaid: "xxxxYYYY",
            autostart: 'false'
        });
    }
});
// Fixs 
$('.vw-modal').on('hidden.bs.modal', function (e) {
    $('html').removeClass('html-no-scroll');

})

$('.vw-modal').on('show.bs.modal', function (e) {
    $('html').addClass('html-no-scroll');

})