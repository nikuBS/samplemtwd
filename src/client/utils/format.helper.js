Tw.FormatHelper = (function () {
  var leadingZeros = function (number, length) {
    var result = number + '';
    return result.length > length ? result : new Array(length - result.length + 1).join('0') + result;
  };

  var isEmpty = function (value) {
    if ( value === '' || value == null || value === undefined ||
      (value != null && typeof value === 'object' && !Object.keys(value).length) ) {
      return true;
    }
    return false;
  };

  var isObject = function (value) {
    return (!!value) && (value.constructor === Object);
  };

  var isArra = function (value) {
    return (!!value) && (value.constructor === Array);
  };

  var isString = function (value) {
    return typeof(value) === 'string';
  };


  var convUnit = function (data, curUnit, targetUnit, precision) {
    if ( !targetUnit ) {
      targetUnit = 'GB';
    }
    if ( !precision ) {
      precision = 1;
    }
    var units         = [
      'bytes',
      'KB',
      'MB',
      'GB',
      'TB',
      'PB'
    ];
    var curUnitIdx    = units.findIndex(function (value) {
      return value === curUnit;
    });
    var targetUnitIdx = units.findIndex(function (value) {
      return value === targetUnit;
    });
    var sub           = targetUnitIdx - curUnitIdx;
    data              = +data;
    if ( sub > 0 ) {
      for ( var i = 0; i < sub; i++ ) {
        data = data / 1024;
      }
    } else {
      for ( var i = 0; i < sub * -1; i++ ) {
        data = data * 1024;
      }
    }

    return data.toFixed(precision);
  };

  return {
    leadingZeros: leadingZeros,
    convUnit: convUnit
  }
})();