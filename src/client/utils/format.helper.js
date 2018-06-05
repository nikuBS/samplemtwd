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
    return (!!value) && (value.varructor === Object);
  };

  var isArray = function (value) {
    return (!!value) && (value.varructor === Array);
  };

  var isString = function (value) {
    return typeof(value) === 'string';
  };


  var customDataFormat = function (data, curUnit, targetUnit) {
    var units = [Tw.DATA_UNIT.KB, Tw.DATA_UNIT.MB, Tw.DATA_UNIT.GB];
    var curUnitIdx = _.findIndex(units, function(value) {
      return value === curUnit;
    });
    var targetUnitIdx = _.findIndex(units, function(value) {
      return value === targetUnit;
    });

    var sub = targetUnitIdx - curUnitIdx;

    data = +data;
    if ( sub > 0 ) {
      for ( var i = 0; i < sub; i++ ) {
        data = data / 1024;
      }
    } else {
      for ( var i = 0; i < sub * -1; i++ ) {
        data = data * 1024;
      }
    }

    return {
      data: convNumFormat(data),
      unit: targetUnit
    };
  };

  var convDataFormat = function (data, curUnit) {
    var units = [Tw.DATA_UNIT.KB, Tw.DATA_UNIT.MB, Tw.DATA_UNIT.GB];
    var unitIdx = _.findIndex(units, function(value) {
      return value === curUnit;
    });

    data = +data;
    if ( !isFinite(data) ) {
      return {
        data: data,
        unit: curUnit
      };
    }

    while ( data >= 1024 ) {
      data /= 1024;
      unitIdx++;
    }

    return {
      data: convNumFormat(data),
      unit: units[unitIdx]
    };
  };

  var convNumFormat = function (number) {
    if ( number > 0 && number < 100 && number % 1 !== 0 ) {
      return removeZero(number.toFixed(2));
    }
    if ( number >= 100 && number < 1000 && number % 1 !== 0 ) {
      return removeZero(number.toFixed(1));
    }
    if ( number > 1000 ) {
      return addComma(number.toFixed(0));
    }

    return number.toString();
  };

  var removeZero = function (value) {
    if ( value.indexOf('.') !== -1 ) {
      return value.replace(/(0+$)/, '');
    }

    return value;
  };

  var addComma = function (value) {
    var regexp = /\B(?=(\d{3})+(?!\d))/g;
    return value.replace(regexp, ',');
  };

  var convVoiceFormat = function (data) {
    data = +data;
    var hours = Math.floor(data / 3600);
    var min = Math.floor((data - (hours * 3600)) / 60);
    var sec = data - (hours * 3600) - (min * 60);

    return { hours: hours, min: min, sec: sec };
  };

  return {
    leadingZeros: leadingZeros,
    customDataFormat: customDataFormat,
    convDataFormat: convDataFormat,
    convVoiceFormat: convVoiceFormat
  }
})();