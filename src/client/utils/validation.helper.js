Tw.ValidationHelper = (function () {
  function regExpTest(exp, str) {
    return exp.test(str);
  }

  /**
   * @param {String} : 010-0000-0000 or 0100000000 or 013000000000
   * @returns {Boolean}
   */
  function isCellPhone(str) {
    var phone = str.split('-').join('');
    return Tw.ValidationHelper.regExpTest(/(^01[1|6|7|8|9]-?[0-9]{3,4}|^010-?[0-9]{4}|^013[0-2]{1}-?[0-9]{3,4})-?([0-9]{4})$/, phone);
  }

  /**
   * @param {String} : 02-0000-0000 or 0200000000
   * @returns {Boolean}
   */
  function isTelephone(str) {
    return regExpTest(/^0(2|([3-9]\d))-?(\d{3,4})-?(\d{4})$/, str);
  }

  /**
   * @param {String} : 0000-0000 or 00000000
   * @returns {Boolean}
   */
  function isRepresentNumber(str) {
    if (str.length > 7 && str.length < 10)
      return regExpTest(/(\d{4})-?(\d{4})/, str);
    else
      return false;
  }

  /**
   * @param {String} : hong-gil.dong@gmail.com
   * @returns {Boolean}
   */
  function isEmail(str) {
    return Tw.ValidationHelper.regExpTest(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i, str);
  }

  /**
   * @param {String} : 000000
   * @returns {Boolean}
   */
  function isStraightPassword(str, max) {
    if(!max) max = 6;
    var i, j, x, y;
    var buff = ['0123456789'];
    var src, src2, ptn = '';

    for(i = 0; i < buff.length; i++){
      src = buff[i]; // 0123456789
      src2 = buff[i] + buff[i]; // 01234567890123456789
      for(j = 0; j < src.length; j++){
        x = src.substr(j, 1); // 0
        y = src2.substr(j, max); // 0123
        ptn += '[' + x + ']{' + max + ',}|'; // [0]{4,}|0123|[1]{4,}|1234|...
        ptn += y + '|';
      }
    }
    ptn = new RegExp(ptn.replace(/.$/, '')); // 맨마지막의 글자를 하나 없애고 정규식으로 만든다.

    if (ptn.test(str)) {
      return true;
    }
    return false;
  }

  function isSeriesNum(string, maxSeries) {
    var checkSeriesNum = '0123456789';
    for (var i = 0; i <= checkSeriesNum.length - maxSeries; i++) {
      if (string.indexOf(checkSeriesNum.substr(i, maxSeries)) !== -1) {
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

  function isBirthday(value) {
    var month = value.substr(2,2);
    var day = value.substr(4,2);

    var isMonth = parseInt(month, 10) > 0 && parseInt(month, 10) <= 12;
    var isDay = parseInt(day, 10) > 0 && parseInt(day, 10) <= 31;

    return isMonth && isDay;
  }

  /** 아래 validation check function은 client 한정이므로 따로 .ts에 구현하지 않겠습니다.
   *  by Jayoon Kong
   */
  /* input 값을 입력하지 않았을 경우 */
  function checkEmpty(value) {
    if (Tw.FormatHelper.isEmpty(value)) {
      return false;
    }
    return true;
  }

  /* input 값의 길이가 맞지 않는 경우 */
  function checkLength(value, length) {
    if ($.trim(value).length !== length) {
      return false;
    }
    return true;
  }

  /* input 값의 길이가 맞지 않는 경우 */
  function checkIsLength(value, length) {
    return $.trim(value).length === length;
  }

  /* input 값의 길이가 기준값보다 적은 경우 */
  function checkMoreLength($target, length) {
    if ($.trim($target.val()).length < length) {
      return false;
    }
    return true;
  }

  /* input 값이 param보다 적은 경우 */
  function checkIsMore(value, minVal) {
    if (parseInt($.trim(value), 10) < minVal) {
      return false;
    }
    return true;
  }

  /* input 값이 param보다 적은 경우 alert 띄우고 값 변경해주는 function */
  function checkIsMoreAndSet($standardSelector, $selector) {
    if (parseInt($.trim($standardSelector.attr('id')), 10) < $selector.attr('id')) {
      $selector.attr('id', $standardSelector.attr('id'));
      $selector.text($standardSelector.text());
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
  function checkIsAvailablePoint(value, point) {
    if (parseInt($.trim(value), 10) > parseInt(point, 10)) {
      return false;
    }
    return true;
  }

  /* 포인트 10점 단위 체크 function */
  function checkIsTenUnit(value) {
    value = $.trim(value);
    if (value[value.length - 1] !== '0') {
      return false;
    }
    return true;
  }

  /* 필수값 선택 여부 체크하는 function */
  function checkIsSelected($target) {
    if ($target.attr('id') === undefined) {
      return false;
    }
    return true;
  }

  /* 카드 유효기간 체크하는 function */
  function checkYear($targetY) {
    var value = $targetY.val();
    if (value.length < 4 || value < new Date().getFullYear()) {
      return false;
    }
    return true;
  }

  function checkMonth($targetM, $targetY) {
    var value = $targetM.val();
    var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

    if (months.indexOf(value) === -1 || value.length < 2 ||
      (parseInt($targetY.val(), 10) === new Date().getFullYear() && value < new Date().getMonth() + 1)) {
      return false;
    }
    return true;
  }

  function isYearInvalid($target) {
    var value = $target.val();
    if (value.length < 4 || value < new Date().getFullYear()) {
      return true;
    }
    return false;
  }

  function isMonthInvalid($target) {
    var value = $target.val();
    var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

    if (months.indexOf(value) === -1 || value.length < 2) {
      return true;
    }
    return false;
  }

  function checkExpiration($targetY, $targetM) {
    if (parseInt($.trim($targetY.val()), 10) === new Date().getFullYear() &&
      parseInt($.trim($targetM.val()), 10) < new Date().getMonth() + 1) {
      return false;
    }
    return true;
  }

  /* 배수 체크하는 function */
  function checkMultiple(value, standard) {
    if (parseInt($.trim(value), 10) % standard !== 0) {
      return false;
    }
    return true;
  }

  /* 연속숫자 체크하는 function */
  function checkIsStraight(value, max) {
    if (isStraightPassword($.trim(value.toString()), max)) {
      return false;
    }
    return true;
  }

  /* 동일 숫자 반복 체크하는 function */
  function checkIsSameLetters(value, message) {
    var isSame = true;
    for (var i = 1; i < value.length; i++) {
      if (value.substring(i - 1, i) !== value.substring(i, i + 1)) {
        isSame = false;
      }
    }

    if (!Tw.FormatHelper.isEmpty(message)) {
      Tw.Popup.openAlert(message);
    }

    if (isSame) {
      return false;
    }
    return true;
  }

  /* 동일 값 체크하는 function */
  function checkIsSame(value, standard) {
    if ($.trim(value.toString()) !== standard) {
      return false;
    }
    return true;
  }

  /* 다른 값 체크하는 function */
  function checkIsDifferent(value, standard) {
    if ($.trim(value.toString()) === standard) {
      return false;
    }
    return true;
  }

  function showAndHideErrorMsg($target, isValid, message) {
    var $message = $target.siblings('.fe-error-msg');
    if (!$message.hasClass('fe-error-msg')) {
      $message = $target.parent().siblings('.fe-error-msg');
    }
    if (isValid) {
      $message.hide();
      $message.attr('aria-hidden', 'true');
      return true;
    } else {
      $message.show();
      $message.attr('aria-hidden', 'false');

      if (message) {
        $message.text(message);
      }
    }
    return false;
  }

  return {
    regExpTest: regExpTest,
    isCellPhone: isCellPhone,
    isTelephone: isTelephone,
    isRepresentNumber: isRepresentNumber,
    isSeriesNum: isSeriesNum,
    isEmail: isEmail,
    isStraightPassword: isStraightPassword,
    containSpecial: containSpecial,
    containNumber: containNumber,
    isBirthday: isBirthday,
    checkEmpty: checkEmpty,
    checkLength: checkLength,
    checkIsLength: checkIsLength,
    checkMoreLength: checkMoreLength,
    checkIsMore: checkIsMore,
    checkIsMoreAndSet: checkIsMoreAndSet,
    checkIsAgree: checkIsAgree,
    checkIsAvailablePoint: checkIsAvailablePoint,
    checkIsTenUnit: checkIsTenUnit,
    checkIsSelected: checkIsSelected,
    checkYear: checkYear,
    checkMonth: checkMonth,
    isYearInvalid: isYearInvalid,
    isMonthInvalid: isMonthInvalid,
    checkMultiple: checkMultiple,
    checkIsStraight: checkIsStraight,
    checkIsSameLetters: checkIsSameLetters,
    checkIsSame: checkIsSame,
    checkIsDifferent: checkIsDifferent,
    checkExpiration: checkExpiration,
    showAndHideErrorMsg: showAndHideErrorMsg
  };
})();
