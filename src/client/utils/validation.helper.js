Tw.ValidationHelper = (function () {
  /**
   * @param {String} : 010-0000-0000 or 0100000000
   * @returns {Boolean}
   */
  function isCellPhone (phone) {
    var _phone = phone.split('-').join('');
    var regPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
    return regPhone.test(_phone);
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
    isCellPhone: isCellPhone,
    isSeriesNum: isSeriesNum,
    containSpecial: containSpecial,
    containNumber: containNumber
  };
})();

