Tw.MytUsageTdatashareClose = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._bindEvent();
};

Tw.MytUsageTdatashareClose.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.termChild', $.proxy(this._termChild, this));
    console.log(this.$container.find('#tdatashare-fail'));
  },
  _termChild: function () {
    var cSvcMgmtNum = this.$container.find('[data-cSvcMgmtNum]').attr('data-cSvcMgmtNum');
    // this._apiService.request(Tw.API_CMD.BFF_05_0011, {}, {}, cSvcMgmtNum)
    //   .done($.proxy(this._termSuccess, this))
    //   .fail($.proxy(this._termFail, this));
  },
  _termSuccess: function (resp) {
    if ( resp.code === '00' ) {
      this._showSuccess();
    } else {
      this._showFail();
    }
  },
  _termFail: function (err) {
    this._showFail();
  },
  _showSuccess: function() {
    this.$container.find('#tdatashare-close').hide();
    this.$container.find('#tdatashare-success').show();
  },
  _showFail: function() {
    this.$container.find('#tdatashare-fail').css('display', 'block');
  }
};

