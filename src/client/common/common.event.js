Tw.Common = function () {
  this.setBack();
};

Tw.Common.prototype = {
  setBack: function () {
    /* 뒤로가기 추가 */
    $('.common-back').on('click', function () {
      window.history.back();
    });
  }
};

$(document).ready(function () {
  var commonEvent = new Tw.Common();
});