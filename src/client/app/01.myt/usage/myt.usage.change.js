Tw.MytUsageChange = function () {
  this._apiService = new Tw.ApiService();

  this._cachedElement();
  this._bindEvent();
};

Tw.MytUsageChange.prototype = {
  _cachedElement: function () {
    this.$popupContainer = $('.pop-container');
    this.$container      = $('#usage_change');
  },

  _bindEvent: function () {
    this.$popupContainer.on('openSubView', $.proxy(this.openSubView, this));
    this.$popupContainer.on('hideSubView', $.proxy(this.hideSubView, this));
    this.$container.on('click', '.btn_show_all', $.proxy(this.onClickUsageShowAll, this));
    this.$container.on('click', '.row', $.proxy(this.choiceLine, this));
  },

  choiceLine: function (e) {
    var $elLine    = $(e.currentTarget);
    var svcMgmtNum = $elLine.data('svcmgmtnum');

    this._apiService.request(Tw.API_CMD.BFF_03_0004, {}, { "svcMgmtNum": svcMgmtNum })
      .done(function () {
        location.href = '/myt';
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
  }
};
