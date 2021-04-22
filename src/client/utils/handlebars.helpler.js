/**
 * @class
 * @desc for using helper in handlebars
 */
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
      return Tw.FormatHelper.addComma(str);
  });

  Handlebars.registerHelper('removeTag', function(str) {
    return Tw.FormatHelper.stripTags(str);
  });

  Handlebars.registerHelper('replace', function(targetStr,regEx,replaceStr) {
    regEx = regEx.split(',');
    replaceStr = replaceStr.split(',');
    var tempRegEx;
    if(regEx.length===replaceStr.length){
      for(var i=0;i<regEx.length;i++){
        tempRegEx = new RegExp(regEx[i],'g');
        targetStr = targetStr.replace(tempRegEx,replaceStr[i]);
      }
    }
    return targetStr;
  });

  Handlebars.registerHelper('sum', function(num) {
    return (num*1) + 1;
  });

  Handlebars.registerHelper('int', function(num) {
    return parseInt(num, 10);
  });

  Handlebars.registerHelper('ifNumber', function(v1, operator, v2, options) {
    v1 = parseInt(v1, 10);
    v2 = parseInt(v2, 10);
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

})();
