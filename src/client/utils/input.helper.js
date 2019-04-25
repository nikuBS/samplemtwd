/**
 * @class
 * @desc input helper
 */
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
  /**
   * @desc keydown event handler to type only number
   * @param  {Event} event
   * @public
   */
  function inputNumKeyDown(event) {
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

  /**
   * @desc whether key is delete or not
   * @param  {Event} event
   * @public
   */
  function isDeleteKey(event) {
    var key = event.which;
    if ( key === 8 || key === 46 ) {
      return true;
    }
    return false;
  }

  /**
   * @desc check that a value contains only number
   * @param  {string} number
   * @public
   */
  function validateNumber(number) {
    var reg = /[^0-9]/g;
    return reg.test(number);
  }

  /**
   * @desc get byte count for str
   * @param  {string} str
   * @public
   */
  function getByteCount(str) {
    var b = str.match(/[^\x00-\xff]/g);
    return (str.length + (!b ? 0 : b.length));
  }

  /**
   * @desc add dash to input for phone number
   * @param {Element} input 
   * @public
   */
  function insertDashCellPhone(input) {
    var $input = $(input);
    var tel = $input.val().replace(/[^0-9]/g, '');
    $input.val(Tw.StringHelper.phoneStringToDash(tel));
    $input.trigger('change');
  }

  /**
   * @desc whether key is enter or not
   * @param  {Event} event
   * @public
   */
  function isEnter(event) {
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
    validateNumber: validateNumber,
    inputNumKeyDown: inputNumKeyDown,
    isDeleteKey: isDeleteKey,
    getByteCount: getByteCount,
    insertDashCellPhone: insertDashCellPhone,
    inputNumberMaxLength: inputNumberMaxLength,
    isEnter: isEnter,
    iosBlurCheck: iosBlurCheck
  };
})();
