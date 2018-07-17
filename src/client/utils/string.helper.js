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
  function replaceDateNotaionWithoDot(strDate) {
    return strDate.replace(/[\uB144\uC6D4]/gi, '.').replace(/[\uC77C:&nbsp;:\s]/gi, '');
  }

  return {
    replaceAt: replaceAt,
    masking: masking,
    commaSeparatedString: commaSeparatedString,
    replaceDateNotaionWithoDot: replaceDateNotaionWithoDot,
    parseCommaedStringToInt: parseCommaedStringToInt
  };
})();