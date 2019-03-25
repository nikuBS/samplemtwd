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
    return value.toString().replace(regexp, ',');
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
      return parseFloat(number.toFixed(2)).toString();
    }
    if ( number >= 100 && number < 1000 && number % 1 !== 0 ) {
      return parseFloat(number.toFixed(1)).toString();
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

  var convSpDataFormat = function (fee, curUnit) {
    // 데이터 단위가 '원' 인 경우가 있음
    fee = +fee;
    if ( !isFinite(fee) ) {
      return {
        data: fee,
        unit: curUnit
      };
    }

    while ( fee >= 1024 ) {
      fee /= 1024;
    }

    return {
      data: convNumFormat(fee),
      unit: curUnit
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

  var convVoiceMinFormatWithUnit = function (data) {
    var hours = Math.floor(data / 60),
        min   = data - (hours * 60);

    return (hours > 0 ? hours + Tw.VOICE_UNIT.HOURS : '') + min + Tw.VOICE_UNIT.MIN;
  };

  var convSmsPrice = function (smsCount) {
    return smsCount * 310;
  };

  var conTelFormatWithDash = function (v) {
    if ( Tw.FormatHelper.isEmpty(v) ) {
      return v;
    }

    var str            = $.trim(v).replace(/-/gi, ''),
        maskCharIndexs = [],
        j              = 0;

    for ( var a = 0; a < str.length; a++ ) {
      if ( str[a] === '*' ) {
        maskCharIndexs.push(a);
      }
    }

    var regExr = /(^02.{0}|^013[0-2]{1}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/;

    str = str.replace(/\*/gi, '0');
    str = str.replace(regExr, '$1-$2-$3');

    for ( var b = 0; b < str.length; b++ ) {
      if ( str[b] === '-' ) {
        continue;
      }

      if ( maskCharIndexs.indexOf(j) !== -1 ) {
        str = Tw.StringHelper.replaceAt(str, b, '*');
      }

      j++;
    }

    return str;
  };

  var conDateFormatWithDash = function (date) {
    return date.slice(0, 4) + '.' + date.slice(4, 6) + '.' + date.slice(6, 8);
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
    phoneNumber = phoneNumber.replace(/\-/gi, '');

    if ( phoneNumber.length < 4 ) {
      return phoneNumber;
    } else if ( phoneNumber.length < 7 ) {
      str += phoneNumber.substr(0, 3);
      str += '-';
      str += phoneNumber.substr(3);
      return str;
    } else if ( phoneNumber.length < 11 ) {
      str += phoneNumber.substr(0, 3);
      str += '-';
      str += phoneNumber.substr(3, 3);
      str += '-';
      str += phoneNumber.substr(6);
      return str;
    } else {
      str += phoneNumber.substr(0, 3);
      str += '-';
      str += phoneNumber.substr(3, 4);
      str += '-';
      str += phoneNumber.substr(7);
      return str.substr(0, 13);
    }
    return phoneNumber;
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
        centerIdx = 6;
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
    str += phoneNumber.substring(0, 4);
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

  var removeElement = function (arrayList, element) {
    var index = arrayList.findIndex(function (item) {
      return item === element;
    });
    if ( index !== -1 ) {
      arrayList.splice(index, 1);
    }
  };

  var lpad = function (str, length, padStr) {
    while ( str.length < length )
      str = padStr + str;
    return str;
  };

  var appendDataUnit = function (data) {
    if ( /^\d{1,3}\.?\d*$/.test(data) ) {
      return data + Tw.DATA_UNIT.MB;
    } else if ( /^\d{4,}\.?\d*$/.test(data) ) {
      return data + Tw.DATA_UNIT.GB;
    }
    return data;
  };

  var appendVoiceUnit = function (amount) {
    if ( /^[0-9\.]+$/.test(amount) ) {
      return amount + Tw.PERIOD_UNIT.MINUTES;
    }
    return amount;
  };

  var appendSMSUnit = function (amount) {
    if ( /^[0-9\.]+$/.test(amount) ) {
      return amount + Tw.SMS_UNIT;
    }
    return amount;
  };

  var getTemplateString = function (template, values) {
    return template.replace(/{\w+}/g, function (x) {
      return values[x.slice(1, x.length - 1)];
    });
  };

  var isCellPhone = function (sNumber) {

    // It's not working with mask number
    sNumber = sNumber.split('-').join('');
    var regPhone = /^((01[1|6|7|8|9])[1-9]+[0-9]{6,7})|(010[1-9][0-9]{7})$/;

    return regPhone.test(sNumber);
  };

  var purifyPlansData = function (rawData) {
    var data = rawData.sort(function (a, b) {
      var ia = a.initial;
      var ib = b.initial;

      var patternHangul = /[ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ]/;

      var order = function (a, b) {
        if ( a < b ) {
          return -1;
        } else if ( a > b ) {
          return 1;
        }
        return 0;
      };

      if ( ia.match(patternHangul) && ib.match(patternHangul) ) {
        return order(ia, ib);
      }

      if ( ia.match(/[a-zA-Z]/) && ib.match(/[a-zA-Z]/) ) {
        return order(ia, ib);
      }

      if ( ia.match(/[0-9]/) && ib.match(/[0-9]i/) ) {
        return order(ia, ib);
      }

      if ( ia < ib ) {
        return 1;
      } else if ( ia > ib ) {
        return -1;
      }
      return 0;
    });

    return data;
  };

  var stripTags = function (context) {
    return context.replace(/(<([^>]+)>)|&nbsp;/ig, '');
  };

  var addCardDash = function (value) {
    var regexp = /\B(?=([\d|\*]{4})+(?![\d|\*]))/g;

    return value.replace(regexp, '-');
  };

  var addLineCommonPhoneNumberFormat = function (str) {
    var targetStr = str.replace(/\-/g,'');
    var returnStr;
    if(targetStr.length>=8){
      returnStr = targetStr.substring(0,3)+'-'+targetStr.substring(3,targetStr.length-4)+'-'+targetStr.substring(targetStr.length-4,targetStr.length);
    }else{
      returnStr = targetStr;
    }
    return returnStr;
  };

  var isPhoneNum = function (str) {
    var phoneRegExp = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})([0-9]{3,4})([0-9]{4})$/;
    return phoneRegExp.test(str);
  };

  function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(',');
    var mime                                        = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while ( n-- ) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  function isNumber(number) {
    var regNumber = /^[0-9]*$/;
    return regNumber.test(number);
  }

  function removeDuplicateElement(targetArr) {
    var returnArr = [];
    targetArr.forEach(function(itm) {
      var unique = true;
      returnArr.forEach(function(itm2) {
        if(_.isEqual(itm, itm2)){
          unique = false;
        }
      });
      if(unique){
        returnArr.push(itm);
      }
    });
    return returnArr;
  }

  return {
    leadingZeros: leadingZeros,
    isEmpty: isEmpty,
    isObject: isObject,
    isArray: isArray,
    isString: isString,
    customDataFormat: customDataFormat,
    convDataFormat: convDataFormat,
    convSpDataFormat: convSpDataFormat,
    addComma: addComma,
    removeComma: removeComma,
    convVoiceMinFormatWithUnit: convVoiceMinFormatWithUnit,
    convVoiceFormat: convVoiceFormat,
    convSmsPrice: convSmsPrice,
    conTelFormatWithDash: conTelFormatWithDash,
    conDateFormatWithDash: conDateFormatWithDash,
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
    normalizeNumber: normalizeNumber,
    removeElement: removeElement,
    lpad: lpad,
    appendDataUnit: appendDataUnit,
    appendVoiceUnit: appendVoiceUnit,
    appendSMSUnit: appendSMSUnit,
    getTemplateString: getTemplateString,
    isCellPhone: isCellPhone,
    purifyPlansData: purifyPlansData,
    stripTags: stripTags,
    addCardDash: addCardDash,
    dataURLtoFile: dataURLtoFile,
    isNumber: isNumber,
    addLineCommonPhoneNumberFormat : addLineCommonPhoneNumberFormat,
    isPhoneNum : isPhoneNum,
    removeDuplicateElement : removeDuplicateElement
  };
})();
