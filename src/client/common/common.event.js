Tw.Common = function () {
  this.initService();
  this.setBack();
};

Tw.Common.prototype = {
  initService: function() {
    var native = new Tw.NativeService();
  },

  setBack: function () {
    /* 뒤로가기 추가 */
    $('.common-back').on('click', function () {
      Tw.Logger.info('[Common Back]');
      history.back();
    });
  }
};

$(document).ready(function () {
  var commonEvent = new Tw.Common();
});