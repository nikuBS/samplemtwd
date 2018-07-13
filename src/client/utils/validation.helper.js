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

  /** 아래 check 및 alert 띄우는 validation은 client 한정이므로 따로 .ts에 구현하지 않겠습니다.
   *  by Jayoon KONG (jayoon.kong@sk.com)
   */
  /* input 값을 입력하지 않았을 경우 alert 띄우는 function */
  function checkEmpty(value, message) {
    if (Tw.FormatHelper.isEmpty(value)) {
      Tw.Popup.openAlert(message);
      return false;
    }
    return true;
  }

  /* input 값의 길이가 맞지 않는 경우 alert 띄우는 function */
  function checkLength(value, length, message) {
    if ($.trim(value).length !== length) {
      Tw.Popup.openAlert(message);
      return false;
    }
    return true;
  }

  /* input 값이 param보다 적은 경우 alert 띄우는 function */
  function checkIsMore(value, minVal, message) {
    if (parseInt($.trim(value), 10) < minVal) {
      Tw.Popup.openAlert(message);
      return false;
    }
    return true;
  }

  /* 개인정보 제공 동의 체크를 하지 않았을 경우 alert 띄우는 function */
  function checkIsAgree($target, message) {
    if (!$target.is(':checked')) {
      Tw.Popup.openAlert(message);
      return false;
    }
    return true;
  }

  /* 포인트 정합성 체크 funtion */
  function checkIsAvailablePoint(value, point, message) {
    if (parseInt($.trim(value), 10) > parseInt(point, 10)) {
      Tw.Popup.openAlert(message);
      return false;
    }
    return true;
  }

  /* 포인트 10점 단위 체크 function */
  function checkIsTenUnit(value, message) {
    value = $.trim(value);
    if (value[value.length - 1] !== '0') {
      Tw.Popup.openAlert(message);
      return false;
    }
    return true;
  }

  /* 은행명 선택하지 않았을 때 alert 띄우는 function */
  function checkIsSelected($target, message, type) {
    if (type === undefined || type === null) {
      if ($target.attr('id') === undefined) {
        Tw.Popup.openAlert(message);
        return false;
      }
    }
    return true;
  }

  /* 카드 유효기간 체크하는 function */
  function checkYear(value, message) {
    if (parseInt($.trim(value), 10) < new Date().getFullYear()) {
      Tw.Popup.openAlert(message);
      return false;
    }
    return true;
  }

  function checkMonth(value, message) {
    var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    if (!months.includes($.trim(value))) {
      Tw.Popup.openAlert(message);
      return false;
    }
    return true;
  }

  return {
    regExpTest: regExpTest,
    isCellPhone: isCellPhone,
    isSeriesNum: isSeriesNum,
    isEmail: isEmail,
    containSpecial: containSpecial,
    containNumber: containNumber,
    checkEmpty: checkEmpty,
    checkLength: checkLength,
    checkIsMore: checkIsMore,
    checkIsAgree: checkIsAgree,
    checkIsAvailablePoint: checkIsAvailablePoint,
    checkIsTenUnit: checkIsTenUnit,
    checkIsSelected: checkIsSelected,
    checkYear: checkYear,
    checkMonth: checkMonth
  };
})();
