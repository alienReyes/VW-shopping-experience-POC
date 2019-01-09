var vwPage;

(function($) {
    var baseUrl = ($('meta[name="base_url"]').attr('content') !== undefined) ? $('meta[name="base_url"]').attr('content') : window.location.protocol + "//" + window.location.hostname,
        pageLocale = ($('meta[name="locale"]').attr('content') !== undefined) ? $('meta[name="locale"]').attr('content') : "en",
        pageURI = ($('meta[name="page-uri"]').attr('content') !== undefined) ? $('meta[name="page-uri"]').attr('content') : "",
        pageURILocalized = ($('meta[name="page-uri-localized"]').attr('content') !== undefined) ? $('meta[name="page-uri-localized"]').attr('content') : "",
        pageCSRFToken = ($('meta[name="vwcms_csrf_token"]').attr('content') !== undefined) ? $('meta[name="vwcms_csrf_token"]').attr('content') : ""

    vwPage = {
        vw_modal: $('#vwModal'),
        vw_video_modal: $('#vwVideoModal'),
        urls: {
            fetch_modal: baseUrl + "/cs/ajax/fetch-modal-content",
            load_features_by_capability: baseUrl + "/cs/ajax/load-features-by-capability",
            load_jwplayer_playlist: baseUrl + "/cs/ajax/load-jwplayer-playlist",
        },
        dom_added_assets: [],
        templates : {
            feature_modal: '<div class="feature-container">\
                                    <h2 class="feature-title">{title}</h2>\
                                    <p class="subtitle">{short_description}</p>\
                                    <div class="feature-video" data-video="{video_url}" data-image="{main_image}"></div>\
                                    <p class="feature-description talign-c">{long_description}</p>\
                                    <div class="related-features">\
                                        <div class="row">\
                                            <div class="col-8 col-md-10"><h3>Related Features</h3></div>\
                                            <div class="col-4 col-md-2 controls">\
                                                <button class="control-left"><i class="ico ico-chevron-lft-box"></i></button>\
                                                <button class="control-right"><i class="ico ico-chevron-rt-box"></i></button>\
                                            </div>\
                                        </div>\
                                        <div class="feature-carousel linked-thumbs row">\
                                            <div align="middle" style="width:100%;"><img src="/cs/assets/images/loading-ring.gif" style="width:50px;"></div>\
                                        </div>\
                                    </div>\
                                </div>'
        },
        loadResource: function(resourceIdentifier, resourceType, callback, location, placement) {
            if(resourceType == undefined) {
                resourceType = resourceIdentifier.split('.').pop().toLowerCase();
            }
            if(vwPage.dom_added_assets.indexOf(resourceIdentifier) == -1) {
                var resourceHandler, loaded = false;
                if (resourceType === "js") {
                    resourceHandler = document.createElement("script");
                    resourceHandler.setAttribute("type", "text/javascript");
                    resourceHandler.setAttribute("src", resourceIdentifier)
                } else {
                    if (resourceType === "css") {
                        resourceHandler = document.createElement("link");
                        resourceHandler.setAttribute("rel", "stylesheet");
                        resourceHandler.setAttribute("type", "text/css");
                        resourceHandler.setAttribute("href", resourceIdentifier)
                    }
                }
                if (resourceHandler === undefined) {
                    return
                }

                vwPage.dom_added_assets.push(resourceIdentifier);
                location = (location !== undefined && location == 'footer') ? 'body' : 'head';

                if (placement !== undefined && placement == 'before') {
                    document.getElementsByTagName(location)[0].insertBefore(resourceHandler, document.getElementsByTagName(location)[0].firstChild)
                } else {
                    document.getElementsByTagName(location)[0].appendChild(resourceHandler)
                }

                resourceHandler.onload = resourceHandler.onreadystatechange = function () {
                    if (!loaded && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                        loaded = true;
                        if (callback) {
                            callback()
                        }
                        resourceHandler.onload = resourceHandler.onreadystatechange = null
                    }
                };
            } else {
                if (callback) {
                    callback()
                }
            }
        },
        init: function() {
            $(document).ready(function () {
                vwPage.init_jwplayer_event();
                vwPage.init_format_prototype();
                vwPage.init_page();
            });
        },
        init_page: function() {
            vwPage.init_ajax_controller();
            vwPage.init_social_sharer();
            vwPage.init_history_state_event_listener();
            vwPage.init_modal_event();
            vwPage.init_show_modal_by_url_param();
            vwPage.init_page_events();
        },
        init_page_events:  function() {

            /**
             * Specific Product Feature open in Modal
             */
            if(window.product_feature_json !== undefined) {
                var fake_feature_product_trigger = $("<a role='button' class='thumb-link modal-link feature-modal-trigger' data-feature-json='" + window.product_feature_json + "'>Product Feature Trigger</a>");
                vwPage.product_feature_modal_event(fake_feature_product_trigger);
            }

            /**
             * function to redirect to product features page
             */
            $("#features_product").on('change', function () {
                var ajax_data = ($(this).data('page-component')) ? {product : $(this).val(), version_year : $(this).data('version-year'), limit : 8} : {product : $(this).val(), with_capabilities : true};
                vwPage.ajax(baseUrl + '/cs/ajax/load-features-by-product', ajax_data, 'feature_product_modify_dom', null, $(this));
            });

            /**
             * function to update features
             */
            $("#features_capability").on('change', function() {
                var ajax_data = {product : $('#features_product').val(), capability : $(this).val()};
                vwPage.ajax(baseUrl + '/cs/ajax/load-features-by-capability', ajax_data, 'feature_capability_modify_dom', null, $(this));
            });

            /**
             * Trial Request
             */
            $('body').on('click', '.trial-form-submit', function(e) {
                e.preventDefault();

                var btn = $(this);
                var form = $('#vwModal').find('form');
                var post_uri = btn.attr('data-uri');
                var post_data;
                var step = btn.attr('data-step');
                var current_uri = btn.data('uri-path');
                var step_names = [];
                step_names[1] = 'Country selection';
                step_names[2] = 'Language selection';
                step_names[3] = 'Information input';
                step_names[4] = 'Localization downloads';

                if (step == 1 && $("select[name='user_type']").val() == 'student') {
                    vwPage.addLoqTag("trial_student_redirect");
                    //Send to GTM
                    if(window.dataLayer !== undefined) {
                        dataLayer.push({'event' : 'Trial_Student_Redirect'});
                    }
                    window.location.href = 'http://student.myvectorworks.net';
                    return false;
                }

                if (step == 1 || step == 2 || step == 3 || step == 4) {
                    vwPage.loadResource("//cdnjs.cloudflare.com/ajax/libs/jquery-form-validator/2.3.26/jquery.form-validator.min.js", "js", function () {
                        if (form !== undefined && form.isValid()) {
                            post_data = $('#trial_form').serialize();
                            if (step == 4) {
                                post_data = {'download': btn.attr('data-version')};
                            }
                            btn.data('text', btn.text()).html('...').prop('disabled', true);
                            vwPage.ajax(window.location.protocol + "//" + window.location.hostname + '/trial/' + post_uri, post_data, 'trial_form_function', 'trial_form_error_function', btn);
                        }
                    });
                }
            });

            /**
             * Feature Item Click Open Modal
             */
            if($('.feature-modal-trigger').length) {
                $('body').on('click', '.feature-modal-trigger', function() {
                    vwPage.product_feature_modal_event($(this));
                });
            }

            /**
             * Customer stories filter event
             */
            $('.customer-showcase-filter select.filter-dropdown').on('change', function() {
                var ajax_data = {};
                ajax_data.filter_val = $(this).val();
                if($(this).hasClass('industry-filter')) {
                    ajax_data.filter_type = 'industry';
                } else if($(this).hasClass('topic-filter')) {
                    ajax_data.filter_type = 'topic';
                }

                vwPage.ajax(baseUrl + '/cs/ajax/load-customer-stories-by-filter', ajax_data, 'customer_stories_filter_modify_dom', null, $(this));
            });
        },
        init_format_prototype: function() {
            String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
                function () {
                    "use strict";
                    var str = this.toString();
                    if (arguments.length) {
                        var t = typeof arguments[0];
                        var key;
                        var args = ("string" === t || "number" === t) ?
                            Array.prototype.slice.call(arguments)
                            : arguments[0];

                        for (key in args) {
                            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
                        }
                    }
                    return str;
                };
        },
        init_jwplayer_event: function(trigger_on_element) {
            //check that jwplayer plugin is loaded
            if(jwplayer.constructor === Function) {
                var video_control_elements = (trigger_on_element !== undefined) ? trigger_on_element : $('[data-video-control="true"]');
                if(video_control_elements.length > 0) {
                    video_control_elements.each(function(i, v) {
                        var video_player_file = $(v).data('video-file');
                        var video_container = ($(v).data('video-target-id') && $(v).data('video-target-id') !== undefined) ? $('#' + $(v).data('video-target-id')) : $(this);

                        if(video_container.length && video_player_file !== '') {
                            var video_container_id;
                            if(video_container.attr('id') !== undefined && video_container.attr('id') !== null) {
                                video_container_id = video_container.attr('id');
                            } else {
                                video_container_id = 'jw_player_id_' + Math.random().toString(36).substr(2, 9);
                                video_container.attr('id', video_container_id);
                            }
                            var jwplayer_instance = jwplayer(video_container_id);
                            if(jwplayer_instance) {
                                // var jwplayer_config = {
                                //     file: video_player_file,
                                //     autostart: 'false',
                                //     mediaid: video_player_file.substring(video_player_file.lastIndexOf('/')+1)
                                // };

                                var jwplayer_config = {autostart: 'false'};

                                if($(v).data('video-image-file')) {
                                    jwplayer_config.image = $(v).data('video-image-file');
                                }

                                if(video_player_file.indexOf('https://content.jwplatform.com/v2/media/') === 0) {
                                    $.ajax({
                                        url: vwPage.urls.load_jwplayer_playlist,
                                        data: {'playlist_url' : video_player_file},
                                        type: 'POST'
                                    }).done(function(data) {
                                        data = $.parseJSON(data);
                                        if(data) {
                                            if ($(v).data('video-image-file') !== undefined && $(v).data('video-image-file') !== '') {
                                                data.playlist[0].image = $(v).data('video-image-file');
                                            }
                                            data.playlist[0].title = '';
                                            jwplayer_config.playlist = data.playlist;
                                            jwplayer_instance.setup(jwplayer_config);
                                        } else {
                                            console.warn('Could not load playlist file ' . video_file);
                                        }
                                    });
                                } else {
                                    jwplayer_config.file = video_player_file;
                                    jwplayer_config.mediaid = video_player_file.substring(video_player_file.lastIndexOf('/')+1);
                                    jwplayer_instance.setup(jwplayer_config);
                                }

                                //Play video trigger
                                if($(v).find('.video-player-control').length == 1) {
                                    var video_control = $(v).find('.video-player-control');
                                    video_control.on('click', function () {
                                        jwplayer_instance.play();
                                    });
                                }

                                vwPage.addJWListeners(jwplayer_instance);
                            }
                        }
                    });
                }
            }
        },
        init_ajax_controller: function() {
            $(document).on('click', '[data-control="ajax"]', function(e) {
                e.preventDefault();
                var elem = $(this);
                var form = elem.closest('form');
                var url = elem.data('ajax-url') ? elem.data('ajax-url') : $('meta[name="page_uri"]').attr('content');
                var data = elem.data('ajax-data') ? elem.data('ajax-data') : {};
                var success_callback = elem.data('ajax-success-callback') ? elem.data('ajax-success-callback') : '';
                var error_callback = elem.data('ajax-error-callback') ? elem.data('ajax-error-callback') : '';

                //Check if the form is connected with the form validate plugin
                if(form !== undefined && form.data('form-validate')) {
                    vwPage.loadResource("//cdnjs.cloudflare.com/ajax/libs/jquery-form-validator/2.3.26/jquery.form-validator.min.js", "js", function() {
                        if(form.isValid()) {
                            //Check if it has a form if to grab data
                            if(elem.data('ajax-form-id')) {
                                var o = {};
                                var a = $('#' + elem.data('ajax-form-id')).serializeArray();
                                $.each(a, function () {
                                    if (o[this.name]) {
                                        if (!o[this.name].push) {
                                            o[this.name] = [o[this.name]];
                                        }
                                        o[this.name].push(this.value || '');
                                    } else {
                                        o[this.name] = this.value || '';
                                    }
                                });

                                $.extend(data, o);
                            }

                            vwPage.ajax(url, data, success_callback, error_callback, elem);
                        }
                    });
                } else {
                    vwPage.ajax(url, data, success_callback, error_callback, elem);
                }
            });
        },
        reload_jwplayer: function(player_id, video_file, video_image) {
            if($('div#' + player_id).length) {
                var jwplayer_instance = jwplayer(player_id);
                //var jw_options = {'file': video_file, autostart: 'false', mediaid: video_file.substring(video_file.lastIndexOf('/')+1)};
                var jw_options = { autostart: 'false' };

                if(video_image !== undefined && video_image !== '') {
                    jw_options.image = video_image;
                }

                if(video_file.indexOf('https://content.jwplatform.com/v2/media/') === 0) {
                    $.ajax({
                        url: vwPage.urls.load_jwplayer_playlist,
                        data: {'playlist_url' : video_file},
                        type: 'POST'
                    }).done(function(data) {
                        data = $.parseJSON(data);
                        if(data) {
                            if (video_image !== undefined && video_image !== '') {
                                data.playlist[0].image = video_image;
                            }
                            data.playlist[0].title = '';
                            jw_options.playlist = data.playlist;
                            jwplayer_instance.setup(jw_options);
                        } else {
                            console.warn('Could not load playlist file ' . video_file);
                        }
                    });
                } else {
                    jw_options.file = video_file;
                    jw_options.mediaid = video_file.substring(video_file.lastIndexOf('/')+1);
                    jwplayer_instance.setup(jw_options);
                }

                vwPage.addJWListeners(jwplayer_instance);
            }
        },
        init_social_sharer: function() {
            $(document).on('click', '[data-control="article-social-share"] [data-social-share="true"]', function (e) {
                e.preventDefault();
                if ($(this).data('social-share-url') !== '') {
                    var width = 500;
                    var height = 350;
                    var left = (screen.width / 2) - (width / 2),
                        top = (screen.height / 2) - (height / 2);

                    window.open(
                        $(this).data('social-share-url'),
                        "",
                        "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=" + width + ",height=" + height + ",top=" + top + ",left=" + left
                    );
                }
            });
        },
        init_modal_event: function(trigger_on_element) {
            if(trigger_on_element !== undefined) {
                vwPage.modal_event_function(trigger_on_element);
            } else {
                $(document).on('click', '[data-modal-control="true"]', function(e) {
                    e.preventDefault();
                    vwPage.modal_event_function($(this));
                });
            }

            vwPage.close_clean_up_modal();
        },
        init_show_modal_by_url_param: function() {
            var url_modal_key, fake_trigger;
            if(url_modal_key = vwPage.getUrlParameter('showModal')) {
                if(url_modal_key == 'trial-form') {
                    var url_params = vwPage.getUrlParameter();
                    url_params = (Object.keys(url_params).length > 1) ? url_params : {};
                    fake_trigger = $("<a class='vw-btn' href='" + window.location.href + "' data-modal-control='true' data-modal-controller-method='trial-form' data-controller-method-param='" + JSON.stringify(url_params) + "' data-modal-size='fullscreen'>URL Trigger</a>");
                } else {
                    fake_trigger = $("<a class='vw-btn' href='" + window.location.href + "' data-modal-control='true' data-modal-controller-method='" + url_modal_key + "' data-modal-size='fullscreen'>URL Trigger</a>");
                }

                if(fake_trigger !== undefined) {
                    vwPage.init_modal_event(fake_trigger);
                }
            }
        },
        modal_event_function: function(trigger_element) {
            if(trigger_element.data('modal-controller-method')) {
                var modal_key = trigger_element.data('modal-controller-method');
                var modal_key_function = modal_key.replace(/-/g, '_');

                var params = {modal_key: modal_key};
                if(trigger_element.data('controller-method-param')) {
                    $.extend(params, JSON.parse(JSON.stringify(trigger_element.data('controller-method-param'))));
                }

                //If before load function exist for this modal_key
                if(typeof vwPage[modal_key_function + '_modal_before_open'] === 'function') {
                    vwPage[modal_key_function + '_modal_before_open'](trigger_element, params);
                }

                if(trigger_element.data('modal-controller-ajax') === undefined || (trigger_element.data('modal-controller-ajax') !== undefined && trigger_element.data('modal-controller-ajax'))) {
                    vwPage.show_modal(modal_key);
                    vwPage.ajax(
                        vwPage.urls.fetch_modal,
                        params,
                        function(response) {
                            vwPage.build_modal(modal_key, response, trigger_element);
                        }
                    );
                }
            }
        },
        show_modal: function(modal_key, content_loaded) {
            var modal = (modal_key == 'video') ? vwPage.vw_video_modal : vwPage.vw_modal;
            modal.data('modal-key', modal_key);
            if(content_loaded == undefined) {
                modal.data('modal-content-loaded', false);
            } else {
                modal.data('modal-content-loaded', content_loaded);
            }

            if(!vwPage.modal_is_open(modal_key)) {
                modal.modal('show');
                $('body').addClass('modal-open');
            }
        },
        build_modal: function(modal_key, modal_response, trigger_element) {
            if(!modal_response.error && modal_response.modal_dom !== undefined && modal_response.modal_dom !== '') {
                var modal = (modal_key == 'video') ? vwPage.vw_video_modal : vwPage.vw_modal;
                var modal_key_function = modal_key.replace(/-/g, '_');
                var modal_content = $('<div></div>').css('visibility', 'hidden');
                modal_content.html(modal_response.modal_dom);

                if(vwPage.modal_is_open(modal_key)) {
                    modal.find('.vw-modal-container').fadeOut('slow', function() {
                        $(this).html(modal_content);
                        modal_content.css('visibility', 'visible');
                        modal.data('modal-content-loaded', true);
                        if(!modal.data('modal-key') || modal.data('modal-key') !== modal_key) {
                            modal.data('modal-key', modal_key);
                        }
                        modal.find('.modal-content').css('height', 'auto');
                        $(this).fadeIn('slow');
                    });
                } else {
                    modal.find('.vw-modal-container').html(modal_content.css('visibility', 'visible'));
                    modal.find('.modal-content').css({'height':'auto', 'min-height' : '100%'});
                    vwPage.show_modal(modal_key, true);
                }

                //Send data to LOQ
                vwPage.addLoqTag("open_modal:" + modal_key);

                //If after load function exist for this modal_key
                if(typeof vwPage[modal_key_function + '_modal_after_open'] === 'function') {
                    vwPage[modal_key_function + '_modal_after_open'](trigger_element, modal_response);
                }
            }
        },
        close_clean_up_modal: function() {
            vwPage.vw_modal.on('hidden.bs.modal', function() {
                var modal_key = $('#vwModal').data('modal-key');
                var modal_key_function;
                if(modal_key !== undefined) {
                    modal_key_function = modal_key.replace(/-/g, '_');
                    modal_key_function = modal_key_function + '_modal_on_close';
                    //Send data to LOQ
                    vwPage.addLoqTag("close_modal:" + modal_key);
                }
                if(modal_key !== undefined && typeof vwPage[modal_key_function] === 'function') {
                    vwPage[modal_key_function]();
                }

                if(vwPage.vw_modal.data('init-path') && vwPage.vw_modal.data('init-path') !== '') {
                    (vwPage.vw_modal.data('init-path-callback')) ? vwPage.save_current_state(vwPage.vw_modal.data('init-path-callback')) :  vwPage.save_current_state();
                    vwPage.push_history_state(vwPage.vw_modal.data('init-path'), vwPage.vw_modal.data('init-path-title'));
                }

                $('body').removeClass('modal-open');
                vwPage.vw_modal.find('.vw-modal-container').html(vwPage.insert_modal_is_loading_text());
                vwPage.vw_modal.find('.modal-content').css('height', 'inherit');
                vwPage.vw_modal.data('modal-content-loaded', false);
                vwPage.vw_modal.removeData('modal-key');
                vwPage.vw_modal.removeAttr('modal-key');
                vwPage.vw_modal.removeData('init-path');
                vwPage.vw_modal.removeAttr('init-path-title');
            });

            vwPage.vw_video_modal.on('hidden.bs.modal', function() {
                vwPage.vw_video_modal.find('.vw-modal-container').html('');
                vwPage.vw_video_modal.data('modal-content-loaded', false);
                vwPage.vw_video_modal.removeData('modal-key');
                vwPage.vw_video_modal.removeAttr('modal-key');
                $('body').removeClass('modal-open');
            });
        },
        video_modal_before_open: function(trigger_element) {
            var video_player_file = (trigger_element.data('video-file')) ? trigger_element.data('video-file') : trigger_element.attr('href');
            var player_id = 'jw_player_id_' + Math.random().toString(36).substr(2, 9);
            var video_player_div = $('<div id="'+player_id+'"></div>');
            var modal_object = {
                error: false,
                modal_dom: video_player_div.prop('outerHTML')
            };
            vwPage.build_modal('video', modal_object, trigger_element);

            if(vwPage.vw_video_modal.find('#' + player_id) && vwPage.vw_video_modal.find('#' + player_id).length && video_player_file !== '') {
                var jwplayer_instance = jwplayer(player_id);
                if(jwplayer_instance) {
                    var jwplayer_config = {autostart: 'true'};

                    if(video_player_file.indexOf('https://content.jwplatform.com/v2/media/') === 0) {
                        $.ajax({
                            url: vwPage.urls.load_jwplayer_playlist,
                            data: {'playlist_url' : video_player_file},
                            type: 'POST'
                        }).done(function(data) {
                            data = $.parseJSON(data);
                            if(data) {
                                if (trigger_element.data('video-image-file') !== undefined && trigger_element.data('video-image-file') !== '') {
                                    data.playlist[0].image = trigger_element.data('video-image-file');
                                }
                                data.playlist[0].title = '';
                                jwplayer_config.playlist = data.playlist;
                                jwplayer_instance.setup(jwplayer_config);
                            } else {
                                console.warn('Could not load playlist file ' . video_file);
                            }
                        });
                    } else {
                        jwplayer_config.file = video_player_file;
                        jwplayer_config.mediaid = video_player_file.substring(video_player_file.lastIndexOf('/')+1);
                        if(trigger_element.data('video-image-file')) {
                            jwplayer_config.image = trigger_element.data('video-image-file');
                        }
                        jwplayer_instance.setup(jwplayer_config);
                    }

                    vwPage.addJWListeners(jwplayer_instance);
                }
            }
        },
        product_feature_modal_event: function(feature_element) {
            var feature_obj = feature_element.data('feature-json');
            var feature_modal_content, player_id;
            if(feature_obj) {
                if(feature_element.parent().hasClass('related-feature') && vwPage.modal_is_open() && vwPage.vw_modal.data('modal-key') === 'product-feature') {
                    //fade out container
                    vwPage.vw_modal.find('.vw-modal-container').fadeOut('slow', function() {
                        vwPage.vw_modal.find('.feature-container h2.feature-title').text(feature_obj.title);
                        if(feature_obj.short_description !== undefined) {
                            vwPage.vw_modal.find('.feature-container p.subtitle').text(feature_obj.short_description);
                        }
                        if(feature_obj.long_description !== undefined) {
                            vwPage.vw_modal.find('.feature-container p.feature-description').text(feature_obj.long_description);
                        }
                        if(feature_obj.video_url !== undefined && feature_obj.video_url !== '') {
                            if(vwPage.vw_modal.find('.feature-container .jwplayer').length) {
                                player_id = vwPage.vw_modal.find('.feature-container .jwplayer').attr('id');
                            } else if(vwPage.vw_modal.find('.feature-container .feature-video').length) {
                                player_id = vwPage.vw_modal.find('.feature-container .feature-video').attr('id');
                            }
                            vwPage.reload_jwplayer(player_id, feature_obj.video_url, feature_obj.main_image);
                        } else if(feature_obj.main_image !== undefined && feature_obj.main_image !== ''){
                            //check if jwplayer is already loaded, if yes, destroy it
                            if(vwPage.vw_modal.find('.feature-container .jwplayer').length) {
                                jwplayer(vwPage.vw_modal.find('.feature-container .jwplayer').attr('id')).remove();
                            }
                            vwPage.vw_modal.find('.feature-container .feature-video').html('<img class="img-fluid" src="'+ feature_obj.main_image +'">');
                        }
                        $(this).fadeIn('slow');
                    });

                    return 0;
                }

                var translation_strings = feature_element.closest('div#product-feat-pg').data('trans-json');

                feature_modal_content = $(vwPage.templates.feature_modal.formatUnicorn(feature_obj));
                player_id = 'jw_player_id_' + Math.random().toString(36).substr(2, 9);
                feature_modal_content.find('.feature-video').attr('id', player_id);
                //Update related/additional feature header if 2019 page
                if(window.location.pathname.replace(/^\//, "").split('/')[1] == '2019') {
                    if(translation_strings && translation_strings !== undefined && translation_strings !== '' && translation_strings.additional_features !== undefined) {
                        feature_modal_content.find('.related-features h3:first').text(translation_strings.additional_features);
                    } else {
                        feature_modal_content.find('.related-features h3:first').text('Additional Features');
                    }
                }

                vwPage.show_modal('product-feature');
                var modal_content_obj = {
                    error: false,
                    modal_dom: feature_modal_content
                };
                vwPage.build_modal('product-feature', modal_content_obj, $(this));
                $('.product-feature-thumbs .product-feature-row .filter-item').removeClass('selected-feature');
                $(this).parent().addClass('selected-feature');
                var video_file = feature_modal_content.find('.feature-video').data('video');
                var image_file = feature_modal_content.find('.feature-video').data('image');
                if(video_file) {
                    var jwplayer_instance = jwplayer(player_id);
                    var jwplayer_config = { autostart: 'false'};

                    if(image_file !== undefined && image_file !== '') {
                        jwplayer_config.image = image_file;
                    }

                    if(video_file.indexOf('https://content.jwplatform.com/v2/media/') === 0) {
                        $.ajax({
                            url: vwPage.urls.load_jwplayer_playlist,
                            data: {'playlist_url' : video_file},
                            type: 'POST'
                        }).done(function(data) {
                            data = $.parseJSON(data);
                            if(data) {
                                if(image_file !== undefined && image_file !== '') {
                                    data.playlist[0].image = image_file;
                                }
                                data.playlist[0].title = '';
                                jwplayer_config.playlist = data.playlist;
                                jwplayer_instance.setup(jwplayer_config);
                            } else {
                                console.warn('Could not load playlist file ' . video_file);
                            }
                        });
                    } else {
                        jwplayer_config.file = video_file;
                        jwplayer_config.mediaid = video_file.substring(video_file.lastIndexOf('/')+1);
                        jwplayer_instance.setup(jwplayer_config);
                    }
                    vwPage.addJWListeners(jwplayer_instance);
                } else if(image_file !== undefined && image_file !== '') {
                    feature_modal_content.find('.feature-video').html('<img class="img-fluid" src="'+ image_file +'">');
                }

                //Load related features
                var related_features = '';
                var other_features = $('.product-feature-thumbs .product-feature-row .filter-item').not('.selected-feature');
                var feature_count = other_features.length;

                if(feature_count >= 1) {
                    feature_count = feature_count > 6 ? 6 : feature_count;
                    for(var i = 0; i <= feature_count; i++) {
                        var related_feature = $(other_features[i]).clone().removeClass('thumb filter-item');
                        related_feature.addClass('related-feature');
                        if(related_feature[0] !== undefined && $(other_features[i]).find('a:first') !== $(this)) {
                            related_features += related_feature[0].outerHTML;
                        }
                    }

                    // var f_no = [];
                    // do {
                    //     var i = Math.floor(Math.random() * (feature_count - 1 + 1)) + 1;
                    //     if($.inArray(i, f_no) === -1) {
                    //         var related_feature = $(other_features[i]).clone().removeClass('thumb filter-item');
                    //         related_feature.addClass('related-feature');
                    //         if(related_feature[0] !== undefined && $(other_features[i]).find('a:first') !== $(this)) {
                    //             related_features += related_feature[0].outerHTML;
                    //             f_no.push(i);
                    //         }
                    //     }
                    // } while(f_no.length < feature_count);

                    if(related_features !== '') {
                        var carousel_container = $('.feature-container .feature-carousel');
                        vwPage.loadResource("https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.5.5/slick.min.css", "css");
                        vwPage.loadResource("https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.5.5/slick.min.js", "js", function() {
                            carousel_container.fadeOut('slow', function() {
                                carousel_container.html(related_features);
                                carousel_container.css('visibility', 'hidden');
                                carousel_container.slick({
                                    dots: false,
                                    prevArrow: $('.control-left'),
                                    nextArrow: $('.control-right'),
                                    infinite: false,
                                    speed: 300,
                                    slidesToShow: 4,
                                    slidesToScroll: 4,
                                    responsive: [
                                        {
                                            breakpoint: 992,
                                            settings: {
                                                slidesToShow: 2,
                                                slidesToScroll: 2
                                            }
                                        },
                                        {
                                            breakpoint: 576,
                                            settings: {
                                                slidesToShow: 1,
                                                slidesToScroll: 1
                                            }
                                        }
                                    ]
                                });
                                carousel_container.show();
                                carousel_container.slick('refresh');
                                carousel_container.hide().css('visibility', 'visible').fadeIn('slow');
                            });
                        });
                    }
                } else {
                    //Hide Related Features DIV
                    $('.feature-container .related-features').hide();
                }
            }
        },
        product_feature_modal_after_open: function() {
            console.log('product feature function');
        },
        load_more_product_features: function (response, trigger_element) {
            if(response.product_features_dom !== undefined && response.product_features_dom !== '') {
                if(response.has_content) {
                    $('.product-feature-thumbs .product-feature-row').append(response.product_features_dom);
                    $('.product-feature-thumbs .product-feature-row').find('.fresh-load').not('.loaded').fadeIn('slow', function() {
                        var ajax_data = trigger_element.data('ajax-data') ? trigger_element.data('ajax-data') : {};
                        ajax_data.offset = response.offset !== undefined ? response.offset : 12;
                        //add selected capability
                        ajax_data.capability = $('#features_capability').val();
                        trigger_element.data('ajax-data', ajax_data);
                        $(this).addClass('loaded');
                    });
                } else {
                    trigger_element.hide();
                }
            }
        },
        load_more_customer_stories: function(response, trigger_element) {
            if(response.customer_stories_dom !== undefined && response.customer_stories_dom !== '') {
                if (response.has_content) {
                    $('.customer-stories-container .customer-stories-row').append(response.customer_stories_dom);
                    $('.customer-stories-container .customer-stories-row').find('.fresh-load').not('.loaded').fadeIn('slow', function() {
                        var ajax_data = trigger_element.data('ajax-data') ? trigger_element.data('ajax-data') : {};
                        ajax_data.offset = response.offset !== undefined ? response.offset : 8;
                        ajax_data.industry = $('.customer-showcase-filter select.industry-filter').val();
                        trigger_element.data('ajax-data', ajax_data);
                        $(this).addClass('loaded');
                    });
                } else {
                    trigger_element.hide();
                }
            }
        },
        feature_capability_modify_dom: function(response, trigger_element) {
            if(response.product_features_dom !== undefined && response.product_features_dom !== '') {
                $('.product-feature-thumbs .product-feature-row').html(response.product_features_dom);
                $('.product-feature-thumbs .product-feature-row').find('.fresh-load').not('.loaded').fadeIn('slow', function() {
                    $('#product-features-load-more').hide();
                    $(this).addClass('loaded');
                });
            }
        },
        feature_product_modify_dom: function(response, trigger_element) {
            if(response.product_features_dom !== undefined && response.product_features_dom !== '') {
                $('.product-feature-thumbs .product-feature-row').html(response.product_features_dom);
                if(response.product_capabilities_dom !== undefined && response.product_capabilities_dom !== '') {
                    $('#features_capability').html(response.product_capabilities_dom);
                }

                $('.product-feature-thumbs .product-feature-row').find('.fresh-load').not('.loaded').fadeIn('slow', function() {
                    $(this).addClass('loaded');
                    if($('#product-features-load-more').is(':hidden')) {
                        $('#product-features-load-more').show();
                    }
                    var ajax_data = $('#product-features-load-more').data('ajax-data') ? $('#product-features-load-more').data('ajax-data') : {};
                    ajax_data.offset = response.offset !== undefined ? response.offset : 12;
                    ajax_data.product = trigger_element.val();
                    $('#product-features-load-more').data('ajax-data', ajax_data);
                    if(!trigger_element.data('page-component')) {
                        //Update URL
                        vwPage.push_history_state(response.page_path, response.page_title);
                    }

                    if(response.request_params !== undefined && response.request_params.product !== undefined && response.request_params.product == 'fundamentals') {
                        $('#product-features-load-more').hide();
                    }
                });
            }

            if(trigger_element.data('page-component')) {
                var prd = trigger_element.val();
                prd = (prd == 'spotlight') ? 'entertainment' : prd;
                prd = (prd == 'all') ? 'designer' : prd;
                var v_cm_data = $('#product-compare-versions').data('controller-method-param') ? $('#product-compare-versions').data('controller-method-param') : {};
                v_cm_data.product = prd;
                $('#product-compare-versions').data('controller-method-param', v_cm_data);
            }
        },
        customer_stories_filter_modify_dom: function(response, trigger_element) {
            if(response.customer_stories_dom !== undefined && response.customer_stories_dom !== '') {
                $('.customer-stories-container .customer-stories-row').html(response.customer_stories_dom);
                $('.customer-stories-container .customer-stories-row').find('.fresh-load').not('.loaded').fadeIn('slow', function() {
                    $('#customer-stories-load-more').hide();
                    $(this).addClass('loaded');
                });
            }
        },
        customer_showcase_modal_before_open: function(trigger_element, params) {
            vwPage.vw_modal.data('init-path', window.location.href);
            vwPage.vw_modal.data('init-path-title', document.title);
            vwPage.vw_modal.data('init-path-callback', {callback: 'reload_customer_showcase_modal', callback_param: params.path});

            //Save current state
            var reload_state = false;
            var current_url = baseUrl + '/' + pageLocale + '/customer-showcase';
            if(window.location.href.substring(0, current_url.length) !== current_url || window.location.href.length === current_url.length) {
                reload_state = true;
            }
            vwPage.save_current_state({reload_page : reload_state});
            //update url with page url
            var cs_title = trigger_element.data('title') ? trigger_element.data('title') : '';
            vwPage.push_history_state(trigger_element.attr('href'), cs_title, {callback: 'reload_customer_showcase_modal', callback_param: params.path});
        },
        customer_showcase_modal_after_open: function(trigger_element, params) {
            setTimeout(function() {
                vwPage.init_jwplayer_event();
            }, 2000);
            //Update meta tags

        },
        reload_customer_showcase_modal: function(path, history_state) {
            var fake_anchor = $("<a class='vw-btn fill' href='" + history_state.page_url + "' data-title='" + history_state.page_title + "' data-modal-control='true' data-modal-controller-method='customer-showcase' data-modal-size='fullscreen' data-controller-method-param='" + JSON.stringify({"path":path}) + "'>Read More</a>");
            vwPage.init_modal_event(fake_anchor);
        },
        trial_form_modal_after_open: function() {
            if(window.dataLayer !== undefined) {
                dataLayer.push({'event' : 'Trial_Step_1'});
            }
        },
        trial_form_error_function: function(response, trigger_element) {
            var error_div = '<div class="trial-error-msg alert alert-danger">' + response.error_message + '</div>';
            $('#vwModal #trial_form').find('div.trial-error-msg').remove();
            $('#vwModal #trial_form').prepend(error_div);
            $('#vwModal #trial_form').find('div.trial-error-msg').fadeIn('slow');
            $('#vwModal').animate({scrollTop: 0}, 'slow');

            trigger_element.html(trigger_element.data('text')).prop('disabled', false);
        },
        trial_form_function: function(response, trigger_element) {
            var response_data = response.data;
            var step_names = [];
            step_names[1] = 'Country selection';
            step_names[2] = 'Language selection';
            step_names[3] = 'Information input';
            step_names[4] = 'Localization downloads';
            var view_html = $(response_data.view_html);
            var p_title = ($(view_html[0]) !== undefined && $(view_html[0]).prop('tagName').toLocaleLowerCase() == 'p') ? $(view_html[0]).prop('innerHTML').replace(/↵/g, "<br/>") : '';
            $('#vwModal h3:first').after('<p>' + p_title + '</p>');

            if(response_data['step'] == 2 || response_data['step'] == 3) {
                //We need to reconstruct new form dom
                var new_form_html = '<div class="form-row">';
                var form_elem_count = view_html.find('input, select, textarea').length;

                if(form_elem_count > 0) {
                    var radio_input_names = [];
                    view_html.find('input, select, textarea').each(function(i, form_elem) {
                        form_elem = $(form_elem);
                        var form_label = view_html.find(form_elem.prop("tagName") + '[name="' + form_elem.attr('name') + '"]').closest('.form-group').find('label:first').text();
                        form_label = form_label.replace('*', '');
                        var form_elem_type = form_elem.prop('type');
                        var req_text = form_elem.hasClass('required') ? '<span class="text-danger">*</span>' : '';
                        form_elem.removeAttr('tabindex, style').addClass('form-control');
                        var is_auth_check = form_elem.prop('name') == 'i_authorize' ? true : false;
                        if(form_elem.hasClass('required')) {
                            if(form_elem.prop('name') == 'email') {
                                form_elem.attr('data-validation', 'email');
                            } else {
                                form_elem.attr('data-validation', 'required');
                            }
                        }

                        if(form_elem_count >= 2) {
                            if(form_elem_type == 'checkbox') {
                                var row_class = is_auth_check ? 'col-sm-12' : 'col-12 col-sm-6';
                                new_form_html += '<div class="form-check form-check-inline ' + row_class + '">\
                                                      '+ form_elem.addClass('form-check-input').prop('outerHTML') +'\
                                                        <label for="' + form_elem.attr('name') + '" class="form-check-label">\
                                                            ' + form_label + ' ' + req_text + '\
                                                        </label>\
                                                      </div>';
                            } else if(form_elem_type == 'radio') {
                                if($.inArray(form_elem.attr('name'), radio_input_names) == -1) {
                                    var radio_inputs = view_html.find('input[type="radio"][name="' + form_elem.attr('name') + '"]');
                                    radio_input_names.push(form_elem.attr('name'));
                                    new_form_html += '<div class="form-group col-12 col-sm-6">';
                                    new_form_html += '<div class="label-wrapper"><label>\
                                                        <span class="fieldLabel">' + form_label + ' ' + req_text + '</span>\
                                                        <span class="error-msg text-danger"></span>\
                                                      </label></div>';
                                    radio_inputs.each(function (i, radio) {
                                        if ($(radio).attr('value') !== undefined && $(radio).attr('value') !== '') {
                                            var radio_inline_css = (i==0) ? 'margin-left: 5px; margin-right: 25px;' : 'margin-left: 25px; margin-right: 25px;';
                                            var radio_class = ($(radio).attr('class') !== undefined) ? $(radio).attr('class') : '';
                                            new_form_html += '<div class="form-check form-check-inline" style="flex: none; '+radio_inline_css+'">\
                                                                <input class="form-check-input ' + radio_class + '" type="radio" name="' + form_elem.attr('name') + '" value="' + $(radio).attr('value') + '">\
                                                                <label class="form-check-label" for="' + form_elem.attr('name') + '">' + $(radio).attr('value') + '</label>\
                                                              </div>';
                                        }
                                    });
                                    new_form_html += '</div>';
                                }
                            } else {
                                new_form_html += '<div class="form-group col-12 col-sm-6">\
                                                    <label for="' + form_elem.attr('name') + '">\
                                                        <span class="fieldLabel">' + form_label + ' ' + req_text + '</span>\
                                                        <span class="error-msg text-danger"></span>\
                                                    </label>\
                                                    ' + form_elem.prop('outerHTML') + '\
                                                  </div>';
                            }

                            if((i+1) % 2 == 0 && !is_auth_check) {
                                new_form_html += '</div><div class="form-row">'
                            }
                        } else {
                            new_form_html += '<div class="form-group col-12 col-sm-6">\
                                                    <label for="' + form_elem.attr('name') + '">\
                                                        <span class="fieldLabel">' + form_label + ' ' + req_text + '</span>\
                                                        <span class="error-msg text-danger"></span>\
                                                    </label>\
                                                    '+ form_elem.prop('outerHTML') +'\
                                                  </div>';
                        }
                    });
                }

                new_form_html += '</div>';

                $('#vwModal #trial_form').fadeOut('slow', function() {
                    $(this).html(new_form_html);
                    $(this).fadeIn('slow');

                    //Send to GTM
                    if(response_data['step'] == 2) {
                        if(window.dataLayer !== undefined) { dataLayer.push({'event' : 'Trial_Step_2'}); }
                        //if(window.fbq !== undefined) { fbq('track', 'Lead', {content_name: 'Trial Request Step 2', content_category: 'Trial'}); }
                    } else {
                        if(window.dataLayer !== undefined) { dataLayer.push({'event' : 'Trial_Step_3'}); }
                        //if(window.fbq !== undefined) { fbq('track', 'Lead', {content_name: 'Trial Request Step 3', content_category: 'Trial'}); }
                    }
                });
            } else {
                $('#vwModal #trial_form').fadeOut('slow', function() {
                    $(this).after('<div class="row">' + response_data['view_html'] + '</div>');
                    $(this).remove();

                    if(response_data['step'] == 4) {
                        //Send to GTM
                        if(window.dataLayer !== undefined) {
                            dataLayer.push({'event' : 'Trial_Step_4'});
                        }
                        trigger_element.hide();
                    } else if (response_data['step'] == 'thanks') {
                        $('#vwModal').find('h3:first').html('Your Vectorworks Trial Request has been received.');
                        $('#vwModal').find('a.dl-installer-btn').each(function(i, v){
                            if(i==0){
                                $(v).css('margin-left', '30px');
                            }
                            $(v).removeClass('vw-btn-fill-2016').addClass('vw-btn fill');
                            $(v).css({'float':'none', 'width':'200px', 'margin-top' : '20px'});
                        });
                        $('#vwModal').find('a.dl-installer-btn:first').parent().css({'width':'100%', 'float':'left'});
                        trigger_element.hide();

                        //Send to GTM
                        if(window.dataLayer !== undefined) {
                            dataLayer.push({'event' : 'Trial_Step_Thanks'});
                        }

                        //Send data to LOQ
                        vwPage.addLoqTag("trial_success_" + pageURILocalized.replace(/\//g, '_'));

                        //Send to FB
                        // if(window.fbq !== undefined) {
                        //     fbq('track', 'Lead', {content_name: 'Trial Request Success', content_category: 'Trial'});
                        // }
                    }
                });
            }

            trigger_element.html(trigger_element.data('text')).prop('disabled', false);
            trigger_element.attr('data-step', response_data['step']);
            if (response_data['step'] == 3) {
                trigger_element.text('Submit');
                trigger_element.attr('data-email-error', response_data['error_msgs']['email_error']);
                trigger_element.attr('data-required-error', response_data['error_msgs']['required_error']);
            }
            trigger_element.attr('data-uri', response_data['post_uri']);
        },
        modal_is_open: function(modal_key) {
            var modal = (modal_key !== undefined && modal_key == 'video') ? vwPage.vw_video_modal : vwPage.vw_modal;
            return $('body').hasClass('modal-open') && modal.is(':visible');
        },
        insert_modal_is_loading_text: function() {
            //var is_loading_markup = '<span style="margin: 0 auto; display: block; text-align: center; position: absolute; top: 45%; left: 45%;">Loading...Please wait!</span>';
            var is_loading_markup = '<span class="load-txt" style="width:100%; display: inline-block; text-align: center;"><img src="http://preloaders.net/preloaders/287/Filling%20broken%20ring.gif" style="width:50px;"></span>';
            return is_loading_markup;
        },
        init_history_state_event_listener: function() {
            window.addEventListener('popstate', function (event) {
                if (history.state && history.state.page_url === window.location.href) {
                    if(history.state.reload_page !== undefined && history.state.reload_page === true) {
                        window.location.reload(false);
                    } else if(history.state.callback !== undefined && typeof vwPage[history.state.callback] === 'function') {
                        if(history.state.callback_param !== undefined) {
                            vwPage[history.state.callback](history.state.callback_param, history.state);
                        } else {
                            vwPage[history.state.callback]();
                        }
                    }
                }
            }, false);
        },
        push_history_state: function(page_url, page_title, optional_data) {
            if (typeof (history.pushState) !== "undefined") {
                var data_obj = {page_url: page_url, page_title: page_title};
                if(optional_data !== undefined) {
                    $.extend(data_obj, optional_data);
                }
                if(page_title !== '') {
                    document.title = page_title;
                }
                history.pushState(data_obj, page_title, page_url);
            } else {
                window.location.href = page_url;
            }
        },
        save_current_state: function(optional_data) {
            if (typeof (history.replaceState) !== "undefined") {
                var data_obj = {page_url: window.location.href, page_title: document.title, page_body: $('body').html()};
                if(optional_data !== undefined) {
                    $.extend(data_obj, optional_data);
                }
                history.replaceState(data_obj, data_obj.page_title, data_obj.page_url);
            }
        },
        ajax: function(url, data, success_callback, error_callback, trigger_element, async) {
            $.ajaxSetup({
                headers: { 'X-CSRF-TOKEN': pageCSRFToken, 'X-Requested-With': 'XMLHttpRequest'}
            });

            //Add default page params to request data
            var default_data = {page_locale: pageLocale, page_uri: pageURI, page_path: window.location.pathname};
            if(data !== undefined && data) {
                $.extend(data, default_data);
            } else {
                data = default_data;
            }

            var async = (async !== undefined) ? async : true;
            var ajax_options = {
                url: url,
                type: "POST",
                dataType: "json",
                data: data,
                async: async,
                timeout: 45000,
                complete: function(xhr, status) {},
                success: function(response) {
                    if (response.error || response.is_error) {
                        if(error_callback && typeof error_callback === 'function') {
                            error_callback(response, trigger_element)
                        } else if(error_callback && typeof vwPage[error_callback] === 'function') {
                            vwPage[error_callback](response, trigger_element);
                        }
                    } else {
                        if(success_callback && typeof success_callback === 'function') {
                            success_callback(response, trigger_element)
                        } else if(success_callback && typeof vwPage[success_callback] === 'function') {
                            vwPage[success_callback](response, trigger_element);
                        }
                    }
                }
            };

            $.ajax(ajax_options)
        },
        modal_form_success_thank_you: function(response) {
            if($('#vwModal form:first').length && $('#vwModal .form-thank-you').length) {
                $('#vwModal form:first').fadeOut('slow', function() {
                    $('#vwModal .form-thank-you').fadeIn('slow');
                });
            }
        },
        getUrlParameter: function(name) {
            if(name !== undefined) {
                name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
                var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
                var results = regex.exec(location.search);
                return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
            } else {
                var q = window.location.search.slice(1);
                if(q) {
                    q = q.split('#')[0];
                    var query_parts = q.split('&');
                    var results = {};
                    for(var i=0; i<query_parts.length; i++) {
                        var query_array = query_parts[i].split('=');
                        if(query_array[0]) {
                            results[query_array[0]] = vwPage.getUrlParameter(query_array[0]);
                        }
                    }
                    return results;
                }
            }
        },
        addLoqTag: function(tag_name) {
            //Send tag to LOQ
            window._loq = window._loq || [];
            window._loq.push(["tag", tag_name]);
        },
        addJWListeners: function(jwplayer_instance) {
            if(jwplayer_instance) {
                //Play event
                jwplayer_instance.on('play', function(event) {
                    if(window.dataLayer !== undefined) {
                        dataLayer.push({
                            'event' : 'JW_Video_Player',
                            'event_type' : 'Play',
                            'player_id': this.id,
                            'video_name': this.getPlaylistItem().file.substring(this.getPlaylistItem().file.lastIndexOf('/') + 1),
                            'video_url': this.getPlaylistItem().file,
                            'started_from': this.getPosition()
                        });
                    }
                });

                //Pause event
                jwplayer_instance.on('pause', function(event) {
                    var pos = this.getPosition() || null;
                    var dur = this.getDuration() || null;

                    if(window.dataLayer !== undefined) {
                        dataLayer.push({
                            'event' : 'JW_Video_Player',
                            'event_type' : 'Pause',
                            'player_id': this.id,
                            'video_name': this.getPlaylistItem().file.substring(this.getPlaylistItem().file.lastIndexOf('/') + 1),
                            'video_url': this.getPlaylistItem().file,
                            'paused_at': pos + '/' + dur
                        });
                    }
                });

                //Complete event
                jwplayer_instance.on('complete', function(event) {
                    if(window.dataLayer !== undefined) {
                        dataLayer.push({
                            'event': 'JW_Video_Player',
                            'event_type': 'Complete',
                            'player_id': this.id,
                            'video_name': this.getPlaylistItem().file.substring(this.getPlaylistItem().file.lastIndexOf('/') + 1),
                            'video_url': this.getPlaylistItem().file,
                            'completed_at': this.getPosition() + ' / ' + this.getDuration()
                        });
                    }
                });

                //Error event
                jwplayer_instance.on('error', function(event) {
                    if(window.dataLayer !== undefined) {
                        dataLayer.push({
                            'event': 'JW_Video_Player',
                            'event_type': 'Error',
                            'player_id': this.id,
                            'video_name': this.getPlaylistItem().file.substring(this.getPlaylistItem().file.lastIndexOf('/') + 1),
                            'video_url': this.getPlaylistItem().file,
                            'error': event.message
                        });
                    }
                });
            }
        }
    };

    //Init of theme main js
    vwPage.init();

}(jQuery));