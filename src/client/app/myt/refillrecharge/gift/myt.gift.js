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
  },

  _cachedElement: function () {
    this.$btn_change = $('#btn_change_line');
    this.$popupPage = $('.popup-page');
  },

  _bindEvent: function () {
    // this.$container.on('click', '.radiobox', $.proxy(this.selectLine, this));
    // this.$container.on('click', '.popup-blind', $.proxy(this.closePopup, this));
    this.$container.on('click', '.btn_process', $.proxy(this.goToProcess, this));
    this.$container.on('click', '.bt-link-tx', $.proxy(this.openPriceList, this));
    this.$container.on('click', '#showRemainData', $.proxy(this.showRemainData, this));
    this.$popupPage.on('click', $.proxy(this.closePriceList, this));
    // $(document).on('updateLineInfo', $.proxy(this.updateLineInfo, this));
  },

  // updateLineInfo: function (e, lineInfo) {
  //   this._apiService
  //     .request(Tw.API_CMD.BFF_03_0003, { svcCtg: 'M' })
  //     .done($.proxy(this._setLineList, this));
  // },

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

  showRemainData: function(e){
    $(e.currentTarget).hide();
    var $wrap = $('#wrap_remainData');

    // TODO : data binding
    $wrap.append('<span class="gift-box-tx"><strong>990MB</strong></span>');
  },

  openPriceList: function () {
    $('#popup_price_list').show();
  },

  closePriceList: function () {
    $('#popup_price_list').hide();
  },
});
