// ImageLoader.js
// ------------------
// This module is responsible of of the lazy loading of images - this is loading only those images that are in the current browser's viewport and start loading
// the other images when the user scrolls into them. In general this module has two parts - first it exposes the function _.printImage() so images with this
// behavior can be easily printed in templates&macros and then it contains the logic of loading the images when the user scrolls the window.
// This module won't affect the Page Generator output code - only browser's

// Module fixes for the 1.06
// Please see the code comments below to know the changes and fixes

define('ImageLoader', ['Merchandising.Zone'], function (MerchandisingZone) {

    'use strict';

    var default_height = 200;

    var image_urls = {};

    if (SC.ENVIRONMENT.jsEnvironment === 'browser') {

        jQuery.fn.originalSlider = jQuery.fn.bxSlider;

        jQuery.fn.bxSlider = function (options) { // 1.06 FIX: Override the bxSlider function in order to load the images before the slider start to avoid height errors.
            resolvePendingImages(true);
            return this.originalSlider(options);
        }

    }

    var fixImagesForLoader = function (s) {
        if (typeof s === 'object' && s.innerHTML) {
            s = s.innerHTML;
        }// 1.06 FIX: On the PDP the product_list_contro_new_pl_tml cames as object

        return s && s.replace && s.replace(/<img([^>]*)src="([^"]+)"([^>]*)/gi, function (all, textBefore, url, textAfter) {
                if (image_urls[url]) {
                    return all;
                }
                textBefore = textBefore || '';
                textAfter = textAfter || '';
                // do nothing if image contains data-loader="false" attribute
                if ((textBefore && textBefore.indexOf('data-loader="false"') !== -1) || (textAfter && textAfter.indexOf('data-loader="false"') !== -1)) {
                    return all;
                }

                var params = _.parseUrlOptions(url),
                    height = params.resizeh || default_height,
                    style_attrs = all.match(/style=\"([^\"]+)\"/gi);

                // 1.06 FIX: We need to maintain the style tag if the image already has it
                if (style_attrs) {
                    style_attrs = _.first(style_attrs).replace('style="', 'style="height:auto;min-width:100%;"')

                } else {
                    style_attrs = 'style="height:auto;min-width:100%"';
                }

                return '<img data-image-status="pending" data-src="' + url + '" ' + style_attrs + textBefore + ' ' + textAfter;
            });
    };

    var isElementInViewport = function ($el) {
        if (!$el.is(':visible')) {
            return false;
        }
        var el_rect = {
            left: $el.offset().left
            , top: $el.offset().top
            , bottom: $el.offset().top + $el.height()
            , right: $el.offset().left + $el.width()
        };
        var window_rect = {
            left: jQuery(window).scrollLeft()
            , top: jQuery(window).scrollTop()
            , bottom: jQuery(window).scrollTop() + jQuery(window).height()
            , right: jQuery(window).scrollLeft() + jQuery(window).width()
        };

        return rectangleIntercept(el_rect, window_rect);
    };

    var rectangleIntercept = function (r1, r2) {
        return !(
        r1.left > r2.right ||
        r1.right < r2.left ||
        r1.top > r2.bottom ||
        r1.bottom < r2.top
        );
    };

    // the main imageloader function resolvePendingImages. It will iterate all images marked with data-image-status="pending" and start loading them.
    // If passed parameter onlyIfVisible is true it will load ony those images that are currently visible.
    var resolvePendingImages = function (onlyIfVisible) {
        jQuery('[data-image-status="pending"]').each(function () {
            var $image = jQuery(this);
            if (!onlyIfVisible || isElementInViewport($image)) {
                var src = $image.attr('data-src');
                $image.attr({src: $image.attr('data-src')})
                    .attr('data-image-status', 'done')
                    .css('opacity', 0)
                    .on('load error', function () // 1.06 FIX: Changed the .data('image-status', 'done') to .attr('data-image-status', 'done') because was not working well
                    {
                        $image.animate({'opacity': 1}, 500);
                        $image.css('minHeight', '').css('minWidth', '');  // 1.06 FIX: Now we only remove the min-height and min-width styles;
                        image_urls[src] = true;
                    });
            }
        });
    };

    // 1.06: Removed the afterRender trigger
    _.extend(MerchandisingZone.prototype, {
        appendItems: function () {
            var items = this.items;

            if (items.length) {
                // we try to get the 'template' from either
                // the merchandising rule or the default configuration
                var model = this.model
                    , application = this.application
                    , template = SC.macros[model.get('template')] || SC.macros[application.getConfig('macros.merchandisingZone')];

                // then we append the parsed template to the element
                this.$element.append(
                    template({
                        application: application
                        , title: model.get('title')
                        , description: model.get('description')
                        , items: _.first(items.models, model.get('show'))
                    })
                );
            }

            jQuery(window).trigger('scroll');

            items.trigger('appended');

            return this;
        }
    });


    return {
        mountToApp: function (application) {
            window.fixImagesForLoader = fixImagesForLoader;


            if (!SC.isPageGenerator()) {
                var showInterval;
                // we listen when the full document is scrolled and check if there is any pending image and load them if they are visible
                jQuery(window).on('resize scroll', _.throttle(function () {
                    resolvePendingImages(true);
                    clearInterval(showInterval);
                }, 200));

                var Layout = application.getLayout();

                // 1.06 FIX: We need to trigger the resolve images after a content is rendered.
                Layout.on('renderEnhancedPageContent', function (view, content_zone) {
                    resolvePendingImages(true);
                });

                // 1.06 FIX: I removed the afterRender listener because is triggered before the after append view of the main content
                // so you only will have the header and footer and for that reason the footer is visible on the actual viewport and it will load the images
                Layout.on('afterAppendView', function () {
                    resolvePendingImages(true);
                    showInterval = setInterval(function () {
                        resolvePendingImages(true);
                    }, 1000);
                    // Creates an interval to resolve pending images, this fix the recently view and slider miniatures error.
                });

                //There may be image markup that are there but in hidden parents that may be shown when user clicks or touch something.
                jQuery('body').on('click touchend', function () {
                    clearInterval(showInterval);
                    resolvePendingImages(false);
                });
            }

        }


        //exposing utility methods so we can test them.

        , resolvePendingImages: resolvePendingImages

        , rectangleIntercept: rectangleIntercept

        , isElementInViewport: isElementInViewport

        , fixImagesForLoader: fixImagesForLoader

        , default_height: default_height

    };

});
