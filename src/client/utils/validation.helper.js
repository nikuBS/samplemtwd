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

  return {
    isCellPhone: isCellPhone
  };
})();
