Tw.StringHelper = (function () {
  function replaceAt(str, index, replacement) {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
  }

  function masking(str, mark, idxFromEnd) {
    for ( var i = 1; i <= idxFromEnd; i++ ) {
      str = Tw.StringHelper.replaceAt(str, str.length - i, mark);
    }
    return str;
  }

  return {
    replaceAt: replaceAt,
    masking: masking
  }
})();