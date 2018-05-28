/**
 * @file
 * JS View handler implementation for ads which are using the 'adtech_default' view plugin.
 */

(function (ad_entity, window) {

  ad_entity.viewHandlers = ad_entity.viewHandlers || {};

  ad_entity.viewHandlers.adtech_default = {
    initialize: function (containers, context, settings) {
      var load_arguments = [];
      var argsNotEmpty = false;
      var onPageLoad = true;
      var container;
      var container_id;
      var ad_tag;
      var ad_el;
      var argument;
      var targeting;
      var delay;

      if (typeof window.atf_lib !== 'undefined') {
        ad_entity.adtechLoadingAttempts = true;

        if (this.numberOfAds > 0) {
          onPageLoad = false;
        }
        for (container_id in containers) {
          if (containers.hasOwnProperty(container_id)) {
            container = containers[container_id];
            ad_el = container.el.querySelector('.adtech-factory-ad');
            if (ad_el === null) {
              continue;
            }

            this.numberOfAds++;
            ad_tag = {
              el: ad_el,
              data: function (key, value) {
                return ad_entity.helpers.metadata(this.el, this, key, value);
              }
            };
            container.ad_tag = ad_tag;
            argument = {element: ad_el};
            targeting = container.data('data-ad-entity-targeting');
            if (typeof targeting === 'object') {
              argument.targeting = targeting;
            }
            else {
              argument.targeting = {};
              container.data('data-ad-entity-targeting', argument.targeting);
            }
            argument.targeting.slotNumber = this.numberOfAds;
            argument.targeting.onPageLoad = onPageLoad;
            load_arguments.push(argument);
            argsNotEmpty = true;
            this.addEventsFor(container);
          }
        }
        if (argsNotEmpty) {
          ad_entity.helpers.trigger(window, 'atf:BeforeLoad', false, true, [load_arguments, onPageLoad]);
        }
      }
      else {
        if (typeof ad_entity.adtechLoadingAttempts === 'undefined') {
          ad_entity.adtechLoadingAttempts = 0;
          ad_entity.adtechLoadingUnit = 'default_view';
        }
        if (ad_entity.adtechLoadingAttempts === false) {
          // Failed to load the library entirely, abort.
          return;
        }
        if (typeof ad_entity.adtechLoadingAttempts === 'number') {
          if (ad_entity.adtechLoadingAttempts < 40) {
            ad_entity.adtechLoadingAttempts++;
            delay = 10 * ad_entity.adtechLoadingAttempts;
            if (!(ad_entity.adtechLoadingUnit === 'default_view')) {
              // Another unit is already trying to load the library.
              // Add further delay to ensure this one is being fired later.
              delay += 100;
            }
            window.setTimeout(this.initialize.bind(this), delay, containers, context, settings);
          }
          else {
            ad_entity.adtechLoadingAttempts = false;
          }
        }
      }
    },
    detach: function (containers, context, settings) {},
    addEventsFor: function (container) {
      // Mark container as initialized once advertisement has been loaded.
      window.addEventListener('atf_ad_rendered', function (event) {
        var helpers = ad_entity.helpers;
        if (event.element_id === container.ad_tag.el.id) {
          helpers.removeClass(container.el, 'not-initialized');
          helpers.addClass(container.el, 'initialized');
          container.data('initialized', true);
          helpers.trigger(container.el, 'adEntity:initialized', true, true, [container]);
        }
      }, false);
    },
    numberOfAds: 0
  };

}(window.adEntity, window));
