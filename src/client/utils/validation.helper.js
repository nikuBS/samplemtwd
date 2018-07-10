Tw.ValidationHelper = (function () {
  function regExpTest(exp, str) {
    return exp.test(str);
  }

  /**
   * @param {String} : 010-0000-0000 or 0100000000
   * @returns {Boolean}
   */
  function isCellPhone(str) {
    var phone = str.split('-').join('');
    return Tw.ValidationHelper.regExpTest(/^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/, phone);
  }

  /**
   * @param {String} : hong-gil.dong@gmail.com
   * @returns {Boolean}
   */
  function isEmail(str) {
    return Tw.ValidationHelper.regExpTest(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i, str);
  }

  function isSeriesNum(string, maxSeries) {
    var checkSeriesNum = '0123456789';
    for ( var i = 0; i <= checkSeriesNum.length - maxSeries; i++ ) {
      if ( string.indexOf(checkSeriesNum.substr(i, maxSeries)) !== -1 ) {
        return true;
      }
    }
    return false;
  }

  function containSpecial(string, length) {
    var reqSpecial = /["'~`!@#$%^&*()\-_+={}\[\]:;<>./?\\|]/g;
    var findSpecial = string.match(reqSpecial) || [];
    return findSpecial.length >= length;
  }

  function containNumber(string, length) {
    var reqNumber = /[0-9]/g;
    var findNumber = string.match(reqNumber) || [];
    return findNumber.length >= length;

  }

  return {
    regExpTest: regExpTest,
    isCellPhone: isCellPhone,
    isSeriesNum: isSeriesNum,
    isEmail: isEmail,
    containSpecial: containSpecial,
    containNumber: containNumber
  };
})();
