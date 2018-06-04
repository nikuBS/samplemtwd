Tw.MytUsageView = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._uiFunction(); // html source
  this._showAndHide();
  this._bindEvent();
};

Tw.MytUsageView.prototype = {
  _uiFunction: function () {
    this._guideBtnClickEvent();
  },
  _showAndHide: function () {
    this._getUsageBtn();
  },
  _bindEvent: function () {
  },
  _guideBtnClickEvent: function () {
    $('.guide .btn-toggle').bind('click', function(){
      if(!$(this).parent().hasClass('on')){
        $(this).parent().addClass('on').siblings().removeClass('on');
      }else{
        $(this).parent().removeClass('on');
      }
      return false;
    });
  },
  _getUsageBtn: function () {
    this._apiService.request(Tw.API_CMD.TEST_GET_USAGE_BTN, {})
      .done($.proxy(this._success, this))
      .fail($.proxy(this._fail, this));
  },
  _success: function (resp) {
    console.log('api success', resp.result);
    //var $box = this.$container.find('.notice');
    //$box.append(JSON.stringify(resp));
  },
  _fail: function (err) {
    console.log('api fail', err);
  }
};