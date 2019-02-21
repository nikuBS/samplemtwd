Tw.StringHelper = (function () {
  var replaceAt = function (str, index, replacement) {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
  };

  var masking = function (str, mark, idxFromEnd) {
    for ( var i = 1; i <= idxFromEnd; i++ ) {
      str = Tw.StringHelper.replaceAt(str, str.length - i, mark);
    }
    return str;
  };

  /**
   * Converts Integer to String comma separated.(123456 to 123,456)
   * @param num
   * @returns {*}
   */
  var commaSeparatedString = function (num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  /**
   * Converts String comma separated number format to Integer. ( 234,000 to 234000)
   * @param strNum
   * @returns {Number|number}
   */
  var parseCommaedStringToInt = function (strNum) {
    return parseInt(strNum.replace(/,/g, ''), 10);
  };

  /**
   * Replaces Korean date notations(년, 월, 일) with a single period. (1980년 1월 2일 -> 1980.1.2)
   * @param strDate
   * @returns {*}
   */
  var replaceDateNotaionWithDot = function (strDate) {
    return strDate.replace(/[\uB144\uC6D4]/gi, '.').replace(/[\uC77C:&nbsp;:\s]/gi, '');
  };

  /**
   * Replaces cellphone number string with a dashed cellphone number (01012341234 -> 010-1234-1234)
   * @param strCellphoneNum
   * @returns {String}
   */
  var phoneStringToDash = function (strCellphoneNum) {
    var regexp = /\d+/g;
    var sNumber = strCellphoneNum.match(regexp);

    if ( sNumber ) {
      var sDashTelNumber = sNumber.join('').toString();

      if ( sDashTelNumber.length < 3 ) {
        sDashTelNumber = sDashTelNumber.replace(/(\d{3})/, '$1');
      } else if ( sDashTelNumber.length > 3 && sDashTelNumber.length < 7 ) {
        sDashTelNumber = sDashTelNumber.replace(/(\d{1,3})\-?(\d{1,3})/, '$1-$2');
      } else {
        if (sDashTelNumber.substring(0, 4) === '0504') {
          sDashTelNumber = sDashTelNumber.replace(/(^02.{0}|^01.{1}|[0-9*]{4})([0-9*]+)([0-9*]{4})/, '$1-$2-$3');
        }
        sDashTelNumber = sDashTelNumber.replace(/(^02.{0}|^01.{1}|[0-9*]{3})([0-9*]+)([0-9*]{4})/, '$1-$2-$3');
      }

      return sDashTelNumber;
    } else {
      return strCellphoneNum;
    }
  };

  var stringf = function() {
    var src = arguments[0];

    for (var i = 1; i < arguments.length; i++) {
      var regEx = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
      src = src.replace(regEx, arguments[i]);
    }

    return src;
  };

  var getKorInitialChar = function (targetStr) {
    var initialArr = Tw.KOR_INITIAL_CHAR_ARR;
    var result = '';
    var code;
    for(var i=0;i<targetStr.length;i++) {
      code = targetStr.charCodeAt(i)-44032;
      if(code>-1 && code<11172){
        result += initialArr[Math.floor(code/588)];
      }else{
        result += targetStr.charAt(i);
      }
    }
    return result;
  };

  return {
    replaceAt: replaceAt,
    masking: masking,
    commaSeparatedString: commaSeparatedString,
    replaceDateNotaionWithDot: replaceDateNotaionWithDot,
    parseCommaedStringToInt: parseCommaedStringToInt,
    phoneStringToDash: phoneStringToDash,
    stringf : stringf,
    getKorInitialChar : getKorInitialChar
  };
})();