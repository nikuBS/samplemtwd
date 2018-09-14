Tw.MytUsageChange = function (loginCustomerPwd) {
  this._apiService = new Tw.ApiService();
  this.loginCustomerPwd = loginCustomerPwd;

  this._cachedElement();
  this._bindEvent();
};

Tw.MytUsageChange.prototype = {
  _cachedElement: function () {
    this.$popupContainer = $('.pop-container');
    this.$container = $('#usage_change');
  },

  _bindEvent: function () {
    this.$popupContainer.on('openSubView', $.proxy(this.openSubView, this));
    this.$popupContainer.on('hideSubView', $.proxy(this.hideSubView, this));
    this.$container.on('click', '.btn_show_all', $.proxy(this.onClickUsageShowAll, this));
    this.$container.on('click', '.row', $.proxy(this.choiceLine, this));
  },

  choiceLine: function (e) {
    var $elLine = $(e.currentTarget);
    var svcMgmtNum = $elLine.data('svcmgmtnum');

    this._apiService.request(Tw.NODE_CMD.CHANGE_SESSION, { svcMgmtNum: svcMgmtNum })
      .done(function (resp) {
        if ( resp.code === Tw.API_CODE.CODE_00 ) {
          this._goMyt();
        } else if ( resp.code === Tw.API_CODE.ATH3000 || resp.code === Tw.API_CODE.BFF9000 ) {
          // TODO: add mdn(svcNum)
          this._openSvcPwdPopup('mdn', svcMgmtNum);
        }
      });
  },

  onClickUsageShowAll: function (e) {
    var sCategoryType = $(e.currentTarget).data('type');
    var sCategoryName = $(e.currentTarget).data('type-name');

    if ( sCategoryType === 'M' ) {
      // Mobile
      this.$popupContainer.trigger('openSubView', { type: 'M', name: sCategoryName });
    }

    if ( sCategoryType === 'W' ) {
      // Internet / Phone / WIBRO
      this.$popupContainer.trigger('openSubView', { type: 'W', name: sCategoryName });
    }

    if ( sCategoryType === 'S' ) {
      // Solution
      this.$popupContainer.trigger('openSubView', { type: 'S', name: sCategoryName });
    }
  },

  openSubView: function () {
    this.$container.hide();
  },

  hideSubView: function () {
    this.$container.show();
  },

  _openSvcPwdPopup: function (svcNum, svcMgmtNum) {
    // 고객보호 비밀번호 레이어 팝업
    this.loginCustomerPwd.openLayer(svcNum, svcMgmtNum, $.proxy(this._closeSvcPwdPopup, this));
  },

  _closeSvcPwdPopup: function () {
    this._goMyt();
  },

  _goMyt: function () {
    // TODO: change location.back
    location.href = '/myt';
  }
};
