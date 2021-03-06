<?php

/**
 * @file
 * Advertising Entity: DFP implementations for Accelerated Mobile Pages (AMP).
 */

use Drupal\Core\Template\Attribute;
use Drupal\Component\Serialization\Json;

/**
 * Preprocess implementation for a DFP tag for AMP.
 *
 * @param array &$variables
 *   An array of available variables.
 */
function template_preprocess_dfp_amp(array &$variables) {
  /** @var \Drupal\ad_entity\Entity\AdEntityInterface $ad_entity */
  $ad_entity = $variables['ad_entity'];
  $settings = $ad_entity->getThirdPartySettings('ad_entity_dfp');

  $slot_id = '/' . $settings['network_id'] . '/' . $settings['unit_id'];

  // Generate attributes.
  $attributes = new Attribute(['type' => 'doubleclick']);
  $attributes->setAttribute('data-slot', $slot_id);
  $attributes->setAttribute('width', $settings['amp']['width']);
  $attributes->setAttribute('height', $settings['amp']['height']);
  if (!empty($settings['sizes'])) {
    $sizes = [];
    $decoded = Json::decode($settings['sizes']);
    foreach ($decoded as $size) {
      // Currently, fluid is not a valid size here.
      // Validation would say: Invalid multi-size data format 'fluid'.
      // @todo Find a proper way to support native ads on AMP pages.
      if (is_array($size)) {
        $sizes[] = $size[0] . 'x' . $size[1];
      }
    }
    $sizes = implode(',', $sizes);
    $attributes->setAttribute('data-multi-size', $sizes);
  }
  if (isset($settings['amp']['multi_size_validation'])) {
    if ($settings['amp']['multi_size_validation']) {
      $attributes->setAttribute('data-multi-size-validation', 'true');
    }
    else {
      $attributes->setAttribute('data-multi-size-validation', 'false');
    }
  }
  $variables['attributes'] = $attributes;

  // Generate the json attribute.
  $json = [];
  if (!empty($settings['amp']['same_domain_rendering'])) {
    $json['useSameDomainRenderingUntilDeprecated'] = 1;
  }
  // Insert targeting from backend context data.
  $targeting_collection = $ad_entity->getTargetingFromContextData();
  if (!$targeting_collection->isEmpty()) {
    // Filter the targeting information before being displayed.
    $targeting_collection->filter();
    $json['targeting'] = $targeting_collection->toArray();
  }
  $variables['json'] = $json;
}
