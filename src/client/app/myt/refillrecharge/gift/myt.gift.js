Tw.MytGift = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._cachedElement();
  this._bindEvent();
  this.$init();
};

Tw.MytGift.prototype = Object.create(Tw.View.prototype);
Tw.MytGift.prototype.constructor = Tw.MytGift;

Tw.MytGift.prototype = Object.assign(Tw.MytGift.prototype, {
  $init: function () {
    this._apiService.request(Tw.API_CMD.BFF_03_0003, { svcCtg: 'M' }).done($.proxy(this._setLineList, this));
    // this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, this._onContact);
  },

  _cachedElement: function () {
    this.$btn_change = $('#btn_change_line');
  },

  _bindEvent: function () {
    this.$container.on('click', '.radiobox', $.proxy(this.selectLine, this));
    this.$container.on('click', '.select-submit', $.proxy(this.selectLine, this));
    this.$container.on('click', '.popup-closeBtn', $.proxy(this.closePopup, this));
    this.$container.on('click', '.popup-blind', $.proxy(this.closePopup, this));
    this.$container.on('click', '.btn_process', $.proxy(this.goToProcess, this));
  },

  _setLineList: function (res) {
    this.lineList = res.result;
  },

  goToProcess: function (e) {
    this.lineList = this.$btn_change.data('select').split(',');
    this.lineIndex = this.lineList.indexOf(this.$btn_change.text().trim());

    var processType = $(e.currentTarget).data('type');

    if ( processType === 'members' ) {
      location.href = '/myt/gift/process/members?lineIndex=' + this.lineIndex;
    }

    if ( processType === 'family' ) {
      location.href = '/myt/gift/process/family?lineIndex=' + this.lineIndex;
    }
  },


  selectLine: function (e) {
    var selectedLine = $(e.currentTarget);

    $('.popup .checked').removeClass('checked');
    selectedLine.toggleClass('checked');
  }
});
