Tw.InputHelper = (function () {
  function inputNumberOnly(input) {
    var $input = $(input);
    $input.val($input.val().replace(/[^0-9]/g, ''));
  }

  function inputKeyDown(event) {
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

  function inputKeyUp(event) {
    // input keyup event (only input number)
    var key = event.which;
    if ( key === 8 || key === 46 || key === 37 || key === 39 ) {
      return;
    }
    else {
      event.target.value = event.target.value.replace(/[^0-9]/g, '');
    }
  }

  function inputFocusOut($elem) {
    // input focusout event (only input number)
    $elem.val($elem.val().replace(/[^0-9]/g, ''));
  }

  function validateEmail(email) {
    var re = /[a-z0-9_+.-]+@([a-z0-9-]+\.)+[a-z0-9]{2,4}/gi;
    return re.test(email);
  }

  return {
    inputNumberOnly: inputNumberOnly,
    validateEmail: validateEmail,
    focusout: inputFocusOut,
    keyup: inputKeyUp,
    keydown: inputKeyDown
  };
})();