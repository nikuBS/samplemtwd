Tw.FormatHelper = (function () {
  /**
   * @desc add leading zeros
   * @param  {number} number
   * @param  {number} length
   * @returns {string} 
   * @public
   */
  var leadingZeros = function (number, length) {
    var result = number + '';
    return result.length > length ? result : new Array(length - result.length + 1).join('0') + result;
  };

  
  /**
   * @desc whether value is empty or not
   * @param  {any} values
   * @returns {boolean}
   * @public
   */
  var isEmpty = function (value) {
    if ( value === '' || value == null || value === undefined ||
      (value != null && typeof value === 'object' && Object.keys(value).length < 1) ) {
      return true;
    }
    return false;
  };

  /**
   * @desc 배열이 비어있는지 확인
   * @param array
   */
  var isEmptyArray = function (array) {
    return !Array.isArray(array) || !array.length;
  };

  
  /**
   * @desc whether value is object or not 
   * @param  {any} value
   * @returns {boolean}
   * @public
   */
  var isObject = function (value) {
    return (!!value) && (value.constructor === Object);
  };

  /**
   * @desc whether value is array
   * @param  {any} value
   * @returns {boolean}
   * @public
   */
  var isArray = function (value) {
    return (!!value) && (value.constructor === Array);
  };

  /**
   * @desc whether value is string
   * @param {any} value 
   * @returns {boolean}
   * @public
   */
  var isString = function (value) {
    return typeof (value) === 'string';
  };

  /**
   * @desc add comma to numbers every three digits
   * @param {String} value
   * @returns {string}
   * @public
   */
  var addComma = function (value) {
    var regexp = /\B(?=(\d{3})+(?!\d))/g;
    return value.toString().replace(regexp, ',');
  };

  /**
   * @desc return fixed point number
   * @returns {number}
   * @public
   */
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

  /**
   * @desc Convert data unit to target unit
   * @param  {number | string} data
   * @param  {Tw.DATA_UNIT} curUnit
   * @param  {Tw.DATA_UNIT} targetUnit
   * @returns {object} { data, unit }
   * @public
   */
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

  /**
   * @desc convert data unit
   * @param  {number | string} data data
   * @param  {Tw.DATA_UNIT} curUnit current unit
   * @return {object} { data, unit }
   * @public
   */
  var convDataFormat = function (data, curUnit) {
    var units = [Tw.DATA_UNIT.KB, Tw.DATA_UNIT.MB, Tw.DATA_UNIT.GB, Tw.DATA_UNIT.TB], maxIdx = units.length - 1;
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

    while ( data >= 1024 && unitIdx < maxIdx ) {
      data /= 1024;
      unitIdx++;
    }

    return {
      data: convNumFormat(data),
      unit: units[unitIdx]
    };
  };

  /**
   * @desc convert milliseconds to hours
   * @param  {number | string} data milliseconds
   * @return {object} { hours, min, sec }
   * @public
   */
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
  /**
   * @desc get price of sms
   * @param  {number} smsCount
   * @returns {number}
   * @public
   */
  var convSmsPrice = function (smsCount) {
    return smsCount * 310;
  };

  /**
   * @desc add dash to phone number
   * @param {string} v phone number
   * @returns {string}
   * @public
   */
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

  /**
   * @desc add dot to date
   * @param {string} date 
   * @returns {string}
   * @public
   */
  var conDateFormatWithDash = function (date) {
    return date.slice(0, 4) + '.' + date.slice(4, 6) + '.' + date.slice(6, 8);
  };

  /**
   * @desc sort descending
   * @param  {object[]} array
   * @param  {string} key
   * @returns {object[]}
   * @public
   */
  var sortObjArrDesc = function (array, key) {
    return array.sort(function (a, b) {
      return (parseInt(b[key], 10) - parseInt(a[key], 10));
    });
  };
  
  /**
   * @desc sort ascending
   * @param  {object[]} array
   * @param  {string} key
   * @returns {object[]}
   * @public
   */
  var sortObjArrAsc = function (array, key) {
    return array.sort(function (a, b) {
      return (parseInt(a[key], 10) - parseInt(b[key], 10));
    });
  };

  /**
   * @desc get formatted date
   * @param  {string} cardYm
   * @returns {string}
   * @public
   */
  var makeCardYymm = function (cardYm) {
    return cardYm.substr(0, 4) + '/' + cardYm.substr(4, 2);
  };

  /**
   * @desc add dash to cell phone number
   * @param {string} phoneNumber phone number
   * @returns {string}
   * @public
   */
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

  /**
   * @desc add dash to phone number
   * @param {string} phoneNumber phone number
   * @returns {string}
   * @private
   */
  var _getDashedRepresentPhoneNumber = function (phoneNumber) {
    var str = '';
    str += phoneNumber.substring(0, 4);
    str += '-';
    str += phoneNumber.substring(4);
    return str;
  };

  /**
   * @desc add dash to phone number
   * @param {string} phoneNumber phone number
   * @returns {string}
   * @public
   */
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

  /**
   * @desc add dash to phone number
   * @param {string} phoneNumber phone number
   * @returns {string}
   * @public
   */
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

  /**
   * @desc remove comma
   * @param {string} str 
   * @returns {string}
   * @public
   */
  var removeComma = function (str) {
    return str.replace(/,/g, '');
  };

  var lpad = function (str, length, padStr) {
    while ( str.length < length )
      str = padStr + str;
    return str;
  };

  /**
   * @desc append voice unit
   * @param  {string} amount
   * @public
   */
  var appendVoiceUnit = function (amount) {
    if ( /^[0-9\.]+$/.test(amount) ) {
      return amount + Tw.PERIOD_UNIT.MINUTES;
    }
    return amount;
  };

  /**
   * @desc append sms unit
   * @param  {string} amount
   * @public
   */
  var appendSMSUnit = function (amount) {
    if ( /^[0-9\.]+$/.test(amount) ) {
      return amount + Tw.SMS_UNIT;
    }
    return amount;
  };

  /**
   * @desc replace template string
   * @param  {string} template
   * @param  { key: string } 
   * @public
   */
  var getTemplateString = function (template, values) {
    return template.replace(/{\w+}/g, function (x) {
      return values[x.slice(1, x.length - 1)];
    });
  };

  /**
   * @desc whether is cellphone number or not
   * @param {string} sNumber 
   * @returns {boolean}
   * @public
   */
  var isCellPhone = function (sNumber) {

    // It's not working with mask number
    sNumber = sNumber.split('-').join('');
    var regPhone = /^((01[1|6|7|8|9])[1-9]+[0-9]{6,7})|(010[1-9][0-9]{7})$/;

    return regPhone.test(sNumber);
  };

  
  /**
   * @param  {object[]} rawData
   * @public
   */
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

  /**
   * @desc remove all tags
   * @param {string} context 
   * @returns {string}
   * @public
   */
  var stripTags = function (context) {
    return context.replace(/(<([^>]+)>)|&nbsp;/ig, '');
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

  /**
   * @desc whether is phone number or not
   * @param  {string} str
   * @returns {boolean}
   * @public
   */
  var isPhoneNum = function (str) {
    var phoneRegExp = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})([0-9]{3,4})([0-9]{4})$/;
    return phoneRegExp.test(str);
  };

  /**
   * @desc whether value is number or not
   * @param  {string} number
   * @returns {boolean}
   * @public
   */
  function isNumber(number) {
    var regNumber = /^[0-9]*$/;
    return regNumber.test(number);
  }

  /**
   * @desc filter same object
   * @param  {object[]} targetArr
   */
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
    isEmptyArray: isEmptyArray,
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
    lpad: lpad,
    appendVoiceUnit: appendVoiceUnit,
    appendSMSUnit: appendSMSUnit,
    getTemplateString: getTemplateString,
    isCellPhone: isCellPhone,
    purifyPlansData: purifyPlansData,
    stripTags: stripTags,
    isNumber: isNumber,
    addLineCommonPhoneNumberFormat : addLineCommonPhoneNumberFormat,
    isPhoneNum : isPhoneNum,
    removeDuplicateElement : removeDuplicateElement
  };
})();
