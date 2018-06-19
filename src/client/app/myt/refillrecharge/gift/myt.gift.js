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
  },

  _bindEvent: function () {
    // this.$container.on('click', '.radiobox', $.proxy(this.selectLine, this));
    this.$container.on('click', '.btn_process', $.proxy(this.goToProcess, this));
    this.$container.on('click', '.bt-link-tx', $.proxy(this.openPriceList, this));
    this.$container.on('click', '#showRemainData', $.proxy(this.showRemainData, this));
    this.$container.on('click', '.popup-blind', $.proxy(this.closePopup, this));
    this.$container.on('click', $.proxy(this.closePriceList, this));
    $(document).on('updateLineInfo', $.proxy(this.updateLineInfo, this));
  },

  updateLineInfo: function (e, lineInfo) {
    // TODO: fetch data && data binding

    // this._apiService
    //   .request(Tw.API_CMD.BFF_03_0003, { svcCtg: 'M' })
    //   .done($.proxy(this._setLineList, this));
  },

  goToProcess: function (e) {
    this.lineList = this.$btn_change.data('select').split(',');
    this.lineIndex = this.lineList.indexOf(this.$btn_change.text().trim());

    var processType = $(e.currentTarget).data('type');
    var params = {
      lineIndex: this.lineIndex,
      processType: processType
    }

    if ( processType === 'members' ) {
      location.href = '/myt/gift/process/members?' + $.param(params);
    }

    if ( processType === 'family' ) {
      location.href = '/myt/gift/process/family?' + $.param(params);
    }

    if ( processType === 'request' ) {
      location.href = '/myt/gift/process/request?' + $.param(params);
    }
  },

  showRemainData: function (e) {
    $(e.currentTarget).hide();
    var $wrap = $('#wrap_remainData');

    // TODO : fetch data && binding
    $wrap.append('<span class="gift-box-tx"><strong>990MB</strong></span>');
  },

  openPriceList: function () {
    $('#popup_price_list').show();
    $(document.body).css('height', 'auto');
    $(document.body).css('overflow-y', 'hidden');
    $(window).scrollTop(0);
  },

  closePriceList: function () {
    $('#popup_price_list').hide();
    $(document.body).css('height', 'auto');
    $(document.body).css('overflow-y', 'auto');
  },

  closePopup: function () {
    $('.popup-closeBtn').click();
  }
});
