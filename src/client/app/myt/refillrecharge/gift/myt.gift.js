Tw.MytGift = function () {
  this._apiService = new Tw.ApiService();

  this._cachedElement();
  this._bindEvent();
};

Tw.MytGift.prototype = Object.create(Tw.View.prototype);
Tw.MytGift.prototype.constructor = Tw.MytGift;

Tw.MytGift.prototype = Object.assign(Tw.MytGift.prototype, {
  _cachedElement: function () {
    this.$container   = $('#wrap');
    this.$select_line = this.$container.find('#sel_line');
  },

  _bindEvent: function () {
    this.$select_line.on('change', $.proxy(this.changeServiceLine, this));
  },

  changeServiceLine: function (e) {
    var svcMgmtNum = $(e.currentTarget).val();

    this._apiService.request(Tw.API_CMD.BFF_03_0004, {}, { headers: { "svcMgmtNum": svcMgmtNum } })
      .done(function () {
        window.location = window.location.href.split("?")[0];
      });
  }
});
