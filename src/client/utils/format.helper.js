Tw.FormatHelper = (function () {
  var leadingZeros = function (number, length) {
    var result = number + '';
    return result.length > length ? result : new Array(length - result.length + 1).join('0') + result;
  };

  var isEmpty = function (value) {
    if (value === '' || value == null || value === undefined ||
      (value != null && typeof value === 'object' && !Object.keys(value).length)) {
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
    return typeof (value) === 'string';
  };

  var addComma = function (value) {
    var regexp = /\B(?=(\d{3})+(?!\d))/g;
    return value.replace(regexp, ',');
  };

  var removeZero = function (value) {
    if (value.indexOf('.') !== -1) {
      return value.replace(/(0+$)/, '');
    }

    return value;
  };

  var convNumFormat = function (number) {
    if ( number < 1 ) {
      return setDecimalPlace(number, 2);
    }
    if (number > 0 && number < 100 && number % 1 !== 0) {
      return removeZero(number.toFixed(2));
    }
    if (number >= 100 && number < 1000 && number % 1 !== 0) {
      return removeZero(number.toFixed(1));
    }
    if (number > 1000) {
      return addComma(number.toFixed(0));
    }

    return number.toString();
  };

  /**
   * Insert colon into middle of number string
   * @param val normally server response. MUST be 4 characters. ex) '0900', '2000'
   * @returns '09:00', '20:00'
   */
  var insertColonForTime = function (val) {
    return val.slice(0, 2) + ':' + val.slice(2);
  };

  var customDataFormat = function (data, curUnit, targetUnit) {
    var units = [Tw.DATA_UNIT.KB, Tw.DATA_UNIT.MB, Tw.DATA_UNIT.GB];
    var curUnitIdx = _.findIndex(units, function (value) {
      return value === curUnit;
    });
    var targetUnitIdx = _.findIndex(units, function (value) {
      return value === targetUnit;
    });

    var sub = targetUnitIdx - curUnitIdx;

    var i = 0;
    data = +data;
    if (sub > 0) {
      for (i = 0; i < sub; i++) {
        data = data / 1024;
      }
    } else {
      for (i = 0; i < sub * -1; i++) {
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
    var unitIdx = _.findIndex(units, function (value) {
      return value === curUnit;
    });

    data = +data;
    if (!isFinite(data)) {
      return {
        data: data,
        unit: curUnit
      };
    }

    while (data >= 1024) {
      data /= 1024;
      unitIdx++;
    }

    return {
      data: convNumFormat(data),
      unit: units[unitIdx]
    };
  };

  var convVoiceFormat = function (data) {
    data = +data;
    var hours = Math.floor(data / 3600);
    var min = Math.floor((data - (hours * 3600)) / 60);
    var sec = data - (hours * 3600) - (min * 60);

    return { hours: hours, min: min, sec: sec };
  };

  var convSmsPrice = function (smsCount) {
    return smsCount * 310;
  };

  var conTelFormatWithDash = function (v) {
    var ret = v.trim();
    return ret.substring(0, 3) + '-' + ret.substring(3, ret.length - 4) + '-' + ret.substring(ret.length - 4);
  };

  var sortObjArrDesc = function (array, key) {
    return array.sort(function (a, b) {
      return (parseInt(b[key], 10) - parseInt(a[key], 10));
    });
  };

  var sortObjArrAsc = function (array, key) {
    return array.sort(function (a, b) {
      return (parseInt(a[key], 10) - parseInt(b[key], 10));
    });
  };

  var makeCardYymm = function (cardYm) {
    return cardYm.substr(0, 4) + '/' + cardYm.substr(4, 2);
  };

  var setDecimalPlace = function(value, point) {
    return parseFloat(value.toFixed(point));
  };

  function _getDashedCellPhoneNumber(phoneNumber) {
    var str = '';
    if (phoneNumber.length <= 10) {
      str += phoneNumber.substr(0, 3);
      str += '-';
      str += phoneNumber.substr(3, 3);
      str += '-';
      str += phoneNumber.substr(6);
    } else {
      str += phoneNumber.substr(0, 3);
      str += '-';
      str += phoneNumber.substr(3, 4);
      str += '-';
      str += phoneNumber.substr(7);
    }
    return str;
  }

  function _getDashedTelephoneNumber(phoneNumber) {
    var str = '';
    var centerIdx = -1;
    if (/^02/.test(phoneNumber)) {
      str += phoneNumber.substring(0, 2);
      str += '-';

      if (phoneNumber.length === 9) {
        centerIdx = 5;
      } else {
        centerIdx = 6;
      }
      str += phoneNumber.substring(2, centerIdx);
      str += '-';
      str += phoneNumber.substring(centerIdx);
    } else {
      str += phoneNumber.substring(0, 3);
      str += '-';

      if (phoneNumber.length === 10) {
        centerIdx = 5;
      } else {
        centerIdx = 7;
      }
      str += phoneNumber.substring(3, centerIdx);
      str += '-';
      str += phoneNumber.substring(centerIdx);
    }

    return str;
  }

  function getFormattedPhoneNumber(phoneNumber) {
    var getMaskingPhoneNumber = function (mpn) {
      var tmpArr = mpn.split('-');
      var MASKING_MARK = '*';
      tmpArr[1] = Tw.StringHelper.masking(tmpArr[1], MASKING_MARK, 2);
      tmpArr[2] = Tw.StringHelper.masking(tmpArr[2], MASKING_MARK, 2);
      return tmpArr.join('-');
    };
    return getMaskingPhoneNumber(_getDashedCellPhoneNumber(phoneNumber));
  }

  function getDashedPhoneNumber(phoneNumber) {
    if (Tw.ValidationHelper.isTelephone(phoneNumber)) {
      return _getDashedTelephoneNumber(phoneNumber);
    } else if (Tw.ValidationHelper.isCellPhone(phoneNumber)) {
      return _getDashedCellPhoneNumber(phoneNumber);
    }

    return phoneNumber;
  }

  return {
    leadingZeros: leadingZeros,
    isEmpty: isEmpty,
    isObject: isObject,
    isArray: isArray,
    isString: isString,
    customDataFormat: customDataFormat,
    convDataFormat: convDataFormat,
    addComma: addComma,
    convVoiceFormat: convVoiceFormat,
    convSmsPrice: convSmsPrice,
    conTelFormatWithDash: conTelFormatWithDash,
    sortObjArrDesc: sortObjArrDesc,
    sortObjArrAsc: sortObjArrAsc,
    makeCardYymm: makeCardYymm,
    getFormattedPhoneNumber: getFormattedPhoneNumber,
    getDashedPhoneNumber: getDashedPhoneNumber,
    convNumFormat: convNumFormat,
    insertColonForTime: insertColonForTime,
    setDecimalPlace: setDecimalPlace
  };
})();