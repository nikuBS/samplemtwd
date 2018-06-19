Tw.MytGift = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._cachedElement();
  this._bindEvent();
};

Tw.MytGift.prototype = Object.create(Tw.View.prototype);
Tw.MytGift.prototype.constructor = Tw.MytGift;

Tw.MytGift.prototype = Object.assign(Tw.MytGift.prototype, {
  $init: function () {
    initHashNav(this._logHash);
  },

  _logHash: function (hash) {
    switch ( hash.base ) {
      case 'tab1':
        // TODO: tab1
        break;
      case 'tab2' :
        // TODO: tab2
        break;
      default:
        console.info('default hash.base : ', hash.base);
    }
  },

  _cachedElement: function () {
    this.$btn_change = this.$container.find('#line-set');
    this.$wrap_gift_count = this.$container.find('#wrap_gift_count');
    this.tpl_gift_count = Handlebars.compile(this.$container.find('#tpl_gift_count').text());
    this.tpl_remain_data = Handlebars.compile(this.$container.find('#tpl_remain_data').text());
  },

  _bindEvent: function () {
    // this.$container.on('click', '#line-set', $.proxy(this.openLineSelectPopup, this));
    this.$container.on('click', '.btn_process', $.proxy(this.goToProcess, this));
    this.$container.on('click', '.bt-link-tx', $.proxy(this.openPriceList, this));
    this.$container.on('click', '.my-data', $.proxy(this.showRemainData, this));
    this.$container.on('click', '.popup-blind', $.proxy(this.closeLineSelectPopup, this));
    this.$container.on('click', '.popup-closeBtn', $.proxy(this.closePriceList, this));
    this.$container.on('updateLineInfo', $.proxy(this.updateLineInfo, this));
  },

  changeTabMenu: function () {
    // TODO: Change tab menu
  },

  updateLineInfo: function (e, { lineInfo, lineList }) {
    // TODO: fetch data && data binding
    this.lineList = lineList;
    this.lineInfo = lineInfo;

    this._apiService.request(Tw.API_CMD.BFF_06_0015, {})
      .done(function (res) {
        var result = res.result;
        result.familyMemberYn = result.familyMemberYn == 'Y' ? true : false;
        result.goodFamilyMemberYn = result.goodFamilyMemberYn == 'Y' ? true : false;

        this.$wrap_gift_count.html(this.tpl_gift_count(result));
      }.bind(this));

    // $.when()
    //   .then(function () {
    //
    // })

    // this._apiService
    //   .request(Tw.API_CMD.BFF_03_0003, { svcCtg: 'M' })
    //   .done($.proxy(this._setLineList, this));
  },

  goToProcess: function (e) {
    this.lineIndex = _.findIndex(this.lineList, function (line) {
      return line.svcNum == this.$btn_change.text().trim()
    }.bind(this));

    var processType = $(e.currentTarget).data('type');
    var params = {
      lineIndex: this.lineIndex,
      processType: processType
    }

    if ( processType === 'members' ) {
      location.href = '/myt/gift/process/members?' + $.param(params) + '#step1';
    }

    if ( processType === 'family' ) {
      location.href = '/myt/gift/process/family?' + $.param(params) + '#step1';
    }

    if ( processType === 'request' ) {
      location.href = '/myt/gift/process/request?' + $.param(params) + '#step1';
    }
  },

  showRemainData: function (e) {
    var $wrap_remain_data = $(e.currentTarget).closest('.gift-box-info-list');
    // TODO : fetch data && binding

    // this._apiService.request(Tw.API_CMD.BFF_06_0014, { reqCnt: '5' })
    //   .done(function (res) {
    //     // var result = res.result;
    //     // result.familyMemberYn = result.familyMemberYn == 'Y' ? true : false;
    //     // result.goodFamilyMemberYn = result.goodFamilyMemberYn == 'Y' ? true : false;
    //     //
    //     // this.$wrap_gift_count.html(this.tpl_gift_count(result));
    //   }.bind(this));

    var response = {
      "code": "00",
      "msg": "success",
      "result": {
        "reqCnt": "1",
        "giftRequestAgainYn": "Y",
        "dataRemQty": "500"
      }
    }

    $wrap_remain_data.html(this.tpl_remain_data(response.result));
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

  // openLineSelectPopup: function () {
  //   location.hash = 'open_pop';
  // },

  closeLineSelectPopup: function () {
    location.hash = 'close_pop';
    $('.popup-closeBtn').click();
  }
});
