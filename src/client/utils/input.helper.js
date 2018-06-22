Tw.InputHelper = (function () {
  function inputNumberOnly(input) {
    var $input = $(input);
    $input.val($input.val().replace(/[^0-9]/g, ''));
  }

  return {
    inputNumberOnly: inputNumberOnly
  }
})();