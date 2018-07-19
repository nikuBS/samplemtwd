Tw.StringHelper = (function () {
  function replaceAt(str, index, replacement) {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
  }

  function masking(str, mark, idxFromEnd) {
    for ( var i = 1; i <= idxFromEnd; i++ ) {
      str = Tw.StringHelper.replaceAt(str, str.length - i, mark);
    }
    return str;
  }

  /**
   * Converts Integer to String comma separated.(123456 to 123,456)
   * @param num
   * @returns {*}
   */
  function commaSeparatedString(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Converts String comma separated number format to Integer. ( 234,000 to 234000)
   * @param strNum
   * @returns {Number|number}
   */
  function parseCommaedStringToInt(strNum) {
    return parseInt(strNum.replace(/,/g, ''), 10);
  }

  /**
   * Replaces Korean date notations(년, 월, 일) with a single period. (1980년 1월 2일 -> 1980.1.2)
   * @param strDate
   * @returns {*}
   */
  function replaceDateNotaionWithDot(strDate) {
    return strDate.replace(/[\uB144\uC6D4]/gi, '.').replace(/[\uC77C:&nbsp;:\s]/gi, '');
  }

  /**
   * Replaces cellphone number string with a dashed cellphone number (01012341234 -> 010-1234-1234)
   * @param strCellphoneNum
   * @returns {String}
   */
  function phoneStringToDash(strCellphoneNum) {
    return strCellphoneNum.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/,'$1-$2-$3');
  }

  return {
    replaceAt: replaceAt,
    masking: masking,
    commaSeparatedString: commaSeparatedString,
    replaceDateNotaionWithDot: replaceDateNotaionWithDot,
    parseCommaedStringToInt: parseCommaedStringToInt,
    phoneStringToDash: phoneStringToDash
  };
})();