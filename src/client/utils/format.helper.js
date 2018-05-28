Tw.FormatHelper = (function() {
  var leadingZeros = function(number, length) {
    var result = number + '';
    return result.length > length ? result : new Array(length - result.length + 1).join('0') + result;
  };

  return {
    leadingZeros: leadingZeros
  }
})();