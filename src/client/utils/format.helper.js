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
    return typeof (value) === 'string';
  };

  var addComma = function (value) {
    var regexp = /\B(?=(\d{3})+(?!\d))/g;
    return value.replace(regexp, ',');
  };

  var removeZero = function (value) {
    if ( value.indexOf('.') !== -1 ) {
      return value.replace(/(0+$)/, '');
    }

    return value;
  };

  var normalizeNumber = function (num) {
    return num.replace(/(^0+)/, '');
  };

  var setDecimalPlace = function (value, point) {
    return parseFloat(value.toFixed(point));
  };

  var convNumFormat = function (number) {
    if ( number < 1 ) {
      return setDecimalPlace(number, 2);
    }
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
    if ( sub > 0 ) {
      for ( i = 0; i < sub; i++ ) {
        data = data / 1024;
      }
    } else {
      for ( i = 0; i < sub * -1; i++ ) {
        data = data * 1024;
      }
    }

    return {
      data: convNumFormat(data),
      unit: targetUnit
    };
  };

  var convProductSpecifications = function(basFeeInfo, basOfrDataQtyCtt, basOfrVcallTmsCtt, basOfrCharCntCtt) {
    var isValid = function(value) {
      return !(Tw.FormatHelper.isEmpty(value) || ['0', '-'].indexOf(value) !== -1);
    };

    return {
      basFeeInfo: isValid(basFeeInfo) ? Tw.FormatHelper.convProductBasfeeInfo(basFeeInfo) : null,
      basOfrDataQtyCtt: isValid(basOfrDataQtyCtt) ? Tw.FormatHelper.convProductBasOfrDataQtyCtt(basOfrDataQtyCtt) : null,
      basOfrVcallTmsCtt: isValid(basOfrVcallTmsCtt) ? Tw.FormatHelper.convProductBasOfrVcallTmsCtt(basOfrVcallTmsCtt) : null,
      basOfrCharCntCtt: isValid(basOfrCharCntCtt) ? Tw.FormatHelper.convProductBasOfrCharCntCtt(basOfrCharCntCtt) : null
    };
  };

  var convProductBasfeeInfo = function(basFeeInfo) {
    var isNaNbasFeeInfo = isNaN(parseInt(basFeeInfo, 10));

    return {
      isNaN: isNaNbasFeeInfo,
      value: isNaNbasFeeInfo ? basFeeInfo : Tw.FormatHelper.addComma(basFeeInfo)
    };
  };

  var convProductBasOfrDataQtyCtt = function(basOfrDataQtyCtt) {
    var isNaNbasOfrDataQtyCtt = isNaN(parseInt(basOfrDataQtyCtt, 10));

    return {
      isNaN: isNaNbasOfrDataQtyCtt,
      value: isNaNbasOfrDataQtyCtt ? basOfrDataQtyCtt : Tw.FormatHelper.convDataFormat(basOfrDataQtyCtt, Tw.DATA_UNIT.MB)
    };
  };

  var convProductBasOfrVcallTmsCtt = function(basOfrVcallTmsCtt) {
    var isNaNbasOfrVcallTmsCtt = isNaN(parseInt(basOfrVcallTmsCtt, 10));

    return {
      isNaN: isNaNbasOfrVcallTmsCtt,
      value: isNaNbasOfrVcallTmsCtt ? basOfrVcallTmsCtt : Tw.FormatHelper.convVoiceFormatWithUnit(isNaNbasOfrVcallTmsCtt)
    };
  };

  var convProductBasOfrCharCntCtt = function(basOfrCharCntCtt) {
    var isNaNbasOfrCharCntCtt = isNaN(parseInt(basOfrCharCntCtt, 10));

    return {
      isNaN: isNaNbasOfrCharCntCtt,
      value: basOfrCharCntCtt,
      unit: Tw.SMS_UNIT
    };
  };

  var convDataFormat = function (data, curUnit) {
    var units = [Tw.DATA_UNIT.KB, Tw.DATA_UNIT.MB, Tw.DATA_UNIT.GB];
    var unitIdx = _.findIndex(units, function (value) {
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

  var getDashedCellPhoneNumber = function (phoneNumber) {
    var str = '';
    var remainLen = phoneNumber.length;
    var startIdx = 0;
    var DEFAULT_COUNT = remainLen <= 10 && !/^010/.test(phoneNumber) ? 3 : 4;
    var digit = DEFAULT_COUNT;

    while ( remainLen !== 0 ) {
      digit = str ? remainLen >= DEFAULT_COUNT ? DEFAULT_COUNT : remainLen : 3;
      str += phoneNumber.substr(startIdx, digit);

      if ( remainLen > DEFAULT_COUNT ) {
        str += '-';
      }
      remainLen -= digit;
      startIdx += digit;
    }

    return str;
  };

  var _getDashedTelephoneNumber = function (phoneNumber) {
    var str = '';
    var centerIdx = -1;
    if ( /^02/.test(phoneNumber) ) {
      str += phoneNumber.substring(0, 2);
      str += '-';

      if ( phoneNumber.length === 9 ) {
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

      if ( phoneNumber.length === 10 ) {
        centerIdx = 5;
      } else {
        centerIdx = 7;
      }
      str += phoneNumber.substring(3, centerIdx);
      str += '-';
      str += phoneNumber.substring(centerIdx);
    }

    return str;
  };

  var _getDashedRepresentPhoneNumber = function (phoneNumber) {
    var str = '';
    str += phoneNumber.substring(0, 3);
    str += '-';
    str += phoneNumber.substring(4);
    return str;
  };

  var getFormattedPhoneNumber = function (phoneNumber) {
    var getMaskingPhoneNumber = function (mpn) {
      var tmpArr = mpn.split('-');
      var MASKING_MARK = '*';
      tmpArr[1] = Tw.StringHelper.masking(tmpArr[1], MASKING_MARK, 2);
      tmpArr[2] = Tw.StringHelper.masking(tmpArr[2], MASKING_MARK, 2);
      return tmpArr.join('-');
    };
    return getMaskingPhoneNumber(getDashedCellPhoneNumber(phoneNumber));
  };

  var getDashedPhoneNumber = function (phoneNumber) {
    if ( Tw.ValidationHelper.isTelephone(phoneNumber) ) {
      return _getDashedTelephoneNumber(phoneNumber);
    } else if ( Tw.ValidationHelper.isCellPhone(phoneNumber) ) {
      return getDashedCellPhoneNumber(phoneNumber);
    } else if ( Tw.ValidationHelper.isRepresentNumber(phoneNumber) ) {
      return _getDashedRepresentPhoneNumber(phoneNumber);
    }

    return phoneNumber;
  };

  var removeComma = function (str) {
    return str.replace(/,/g, '');
  };

  var is6digitPassSameNumber = function (str) {
    var regex = /(\d)\1\1\1\1\1/;
    return regex.test(str);
  };

  var is6digitPassSolidNumber = function (str) {
    var regex = /(012345)|(123456)|(234567)|(345678)|(456789)|(567890)|(678901)|(789012)|(890123)|(901234)|(098765)|(987654)|(876543)|(765432)|(654321)|(543210)|(432109)|(321098)|(210987)|(109876)/;
    return regex.test(str);
  };

  var removeElement = function (arrayList, element) {
    var index = arrayList.findIndex(function (item) {
      return item === element;
    });
    if ( index !== -1 ) {
      arrayList.splice(index, 1);
    }
  };

  var lpad = function (str, length, padStr) {
    while(str.length < length)
      str = padStr + str;
    return str;
  };

  return {
    leadingZeros: leadingZeros,
    isEmpty: isEmpty,
    isObject: isObject,
    isArray: isArray,
    isString: isString,
    customDataFormat: customDataFormat,
    convProductSpecifications: convProductSpecifications,
    convProductBasfeeInfo: convProductBasfeeInfo,
    convProductBasOfrDataQtyCtt: convProductBasOfrDataQtyCtt,
    convProductBasOfrVcallTmsCtt: convProductBasOfrVcallTmsCtt,
    convProductBasOfrCharCntCtt: convProductBasOfrCharCntCtt,
    convDataFormat: convDataFormat,
    addComma: addComma,
    removeComma: removeComma,
    convVoiceFormat: convVoiceFormat,
    convSmsPrice: convSmsPrice,
    conTelFormatWithDash: conTelFormatWithDash,
    sortObjArrDesc: sortObjArrDesc,
    sortObjArrAsc: sortObjArrAsc,
    makeCardYymm: makeCardYymm,
    getFormattedPhoneNumber: getFormattedPhoneNumber,
    getDashedPhoneNumber: getDashedPhoneNumber,
    getDashedCellPhoneNumber: getDashedCellPhoneNumber,
    convNumFormat: convNumFormat,
    insertColonForTime: insertColonForTime,
    setDecimalPlace: setDecimalPlace,
    is6digitPassSameNumber: is6digitPassSameNumber,
    is6digitPassSolidNumber: is6digitPassSolidNumber,
    normalizeNumber: normalizeNumber,
    removeElement: removeElement,
    lpad: lpad
  };
})();