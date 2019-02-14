Tw.HandlebarHelper = (function () {
  Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch ( operator ) {
      case '===':
        return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '!==':
        return (v1 !== v2) ? options.fn(this) : options.inverse(this);
      case '<':
        return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=':
        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>':
        return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=':
        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      case '&&':
        return (v1 && v2) ? options.fn(this) : options.inverse(this);
      case '||':
        return (v1 || v2) ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  });

  Handlebars.registerHelper('breaklines', function(text) {
    if (Tw.FormatHelper.isEmpty(text)) {
      return null;
    }

    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Handlebars.SafeString(text);
  });

  Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
  });

  Handlebars.registerHelper('isNaN', function(target, options) {
      return isNaN(target)? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('currencyComma', function(str) {
      return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  });

  Handlebars.registerHelper('removeTag', function(str) {
    return str.replace(/<([^>]+)>/ig,'');
  });

  Handlebars.registerHelper('removeNaN', function(str) {
    return str.replace(/[^0-9.]/g, '');
  });
})();