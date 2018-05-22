/**
 * @file
 * Creating the base for the adEntity object, including settings.
 */

(function (window, document) {

  var settingsElement = document.getElementById('ad-entity-settings');

  window.adEntity = {};

  if (settingsElement !== null) {
    window.adEntity.settings = JSON.parse(settingsElement.textContent);
  }

  window.adEntity.usePersonalization = function () {
    return false;
  };

}(window, window.document));
