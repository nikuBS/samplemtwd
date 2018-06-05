Tw.MytUsageChange = function () {
  this._cachedElement();
  this._bindEvent();
}

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
    var $elLine = $(e.currentTarget);
    // TODO: change-svc

    history.back();
  },

  onClickUsageShowAll: function (e) {
    var sCategoryType = $(e.currentTarget).data('type');

    if ( sCategoryType === 'C' ) {
      // Mobile
      this.$popupContainer.trigger('openSubView', { type: 'C' });
    }

    if ( sCategoryType === 'W' ) {
      // Internet / Phone / WIBRO
      this.$popupContainer.trigger('openSubView', { type: 'W' });
    }

    if ( sCategoryType === 'S' ) {
      // Solution
      this.$popupContainer.trigger('openSubView', { type: 'S' });
    }
  },

  openSubView: function () {
    this.$container.hide();
  },

  hideSubView: function () {
    this.$container.show();
  }
}