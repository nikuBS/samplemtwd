Tw.ValidationHelper = (function () {
  function isCellPhone(p) {
    p = p.split('-').join('');
    var regPhone = /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
    return regPhone.test(p);
  }

  return {
    isCellPhone: isCellPhone
  }
})();