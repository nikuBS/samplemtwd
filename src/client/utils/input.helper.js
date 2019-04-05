Tw.InputHelper = (function () {
  function inputNumberOnly(input) {
    var $input = $(input);
    $input.val($input.val().replace(/[^0-9]/g, ''));
  }

  function inputNumberAndAsteriskOnly(input) {
    var $input = $(input);
    $input.val($input.val().replace(/[^0-9*]/g, ''));
  }

  function inputNumberAndDashOnly(input) {
    var $input = $(input);
    $input.val($input.val().replace(/[^0-9-]/g, ''));
  }

  function inputNumberAndAlphabet(input) {
    var $input = $(input);
    $input.val($input.val().replace(/[^A-Za-z0-9]/g, ''));
  }

  function inputNumberMaxLength(input) {
    var $input = $(input);
    var nLength = Number($input.attr('maxlength'));
    var sValue = $input.val().replace(/[^0-9]/g, '');

    if ( nLength ) {
      sValue = sValue.slice(0, nLength);
    }

    $input.val(sValue);
  }

  function inputNumKeyDown(event) {
    // input keydown event (only input number)
    var key = event.which;
    if ( key === 0 || key === 8 || key === 46 || key === 9 ) {
      if ( typeof event.stopPropagation !== 'undefined' ) {
        event.stopPropagation();
      }
      else {
        event.cancelBubble = true;
      }
      return;
    }
    if ( key < 48 || (key > 57 && key < 96) || key > 105 || event.shiftKey ) {
      if ( event.preventDefault ) {
        event.preventDefault();
      }
      else {
        event.returnValue = false;
      }
    }
  }

  function inputNumKeyUp(event) {
    // input keyup event (only input number)
    var key = event.which;
    if ( key === 8 || key === 46 || key === 37 || key === 39 ) {
      return;
    }
    else {
      event.target.value = event.target.value.replace(/[^0-9]/g, '');
    }
  }

  function isDeleteKey(event) {
    // input keyup event (only input number)
    var key = event.which;
    if ( key === 8 || key === 46 ) {
      return true;
    }
    return false;
  }

  function validateNumber(number) {
    var reg = /[^0-9]/g;
    return reg.test(number);
  }

  function validateEmail(email) {
    var re = /[a-z0-9_+.-]+@([a-z0-9-]+\.)+[a-z0-9]{2,4}/gi;
    return re.test(email);
  }

  function getByteCount(str) {
    var b = str.match(/[^\x00-\xff]/g);
    return (str.length + (!b ? 0 : b.length));
  }

  function insertDashCellPhone(input) {
    var $input = $(input);
    var tel = $input.val().replace(/[^0-9]/g, '');
    $input.val(Tw.StringHelper.phoneStringToDash(tel));
    $input.trigger('change');
  }

  function isEnter(event) {
    // input keyup event (only input number)
    var key = event.which;
    if ( key === 13 ) {
      return true;
    }
    return false;
  }

  function iosBlurCheck(e) {
    var isTextInput = function(node) {
      return ['INPUT'].indexOf(node.nodeName) !== -1;
    };

    if (!isTextInput(e.target) && isTextInput(document.activeElement)) {
      setTimeout(function() {
        document.activeElement.blur();
      }, 100);
    }
  }

  return {
    inputNumberOnly: inputNumberOnly,
    inputNumberAndAsteriskOnly: inputNumberAndAsteriskOnly,
    inputNumberAndDashOnly: inputNumberAndDashOnly,
    inputNumberAndAlphabet: inputNumberAndAlphabet,
    validateEmail: validateEmail,
    validateNumber: validateNumber,
    inputNumKeyUp: inputNumKeyUp,
    inputNumKeyDown: inputNumKeyDown,
    isDeleteKey: isDeleteKey,
    getByteCount: getByteCount,
    insertDashCellPhone: insertDashCellPhone,
    inputNumberMaxLength: inputNumberMaxLength,
    isEnter: isEnter,
    iosBlurCheck: iosBlurCheck
  };
})();