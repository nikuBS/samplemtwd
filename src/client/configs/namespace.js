var Tw = Tw || {};

var _ = _ || {};

/**
 * underscore template setting
 * avoid to EJS template conflict
 */
_.templateSettings = {
  interpolate: /\{\{=([^}]*)\}\}/g,
  evaluate: /\{\{(?!=)(.*?)\}\}/g,
  escape: /\{\{-([^}]*)\}\}/g
};
