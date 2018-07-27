Tw.InputHelper = (function () {
  function inputNumberOnly(input) {
    var $input = $(input);
    $input.val($input.val().replace(/[^0-9]/g, ''));
  }

  function validateEmail(email) {
    var re = /[a-z0-9_+.-]+@([a-z0-9-]+\.)+[a-z0-9]{2,4}/gi;
    return re.test(email);
  }

  return {
    inputNumberOnly: inputNumberOnly,
    validateEmail: validateEmail
  };
})();