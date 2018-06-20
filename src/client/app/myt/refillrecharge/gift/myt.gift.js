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
    initHashNav(this._logHash);
  },

  _logHash: function (hash) {
    setTimeout(function () {
      var elWrapper = $('.tab-linker li');

      switch ( hash.base ) {
        case 'gift':
          elWrapper.eq(0).find('a').click();
          break;
        case 'request' :
          elWrapper.eq(1).find('a').click();
          break;
        default:
          elWrapper.eq(0).find('a').click();
      }
    }.bind(this), 0);
  },

  _cachedElement: function () {
    this.$btn_change = this.$container.find('#line-set');
    this.$wrap_gift_count = this.$container.find('#wrap_gift_count');
    this.tpl_gift_count = Handlebars.compile(this.$container.find('#tpl_gift_count').text());
    this.tpl_remain_data = Handlebars.compile(this.$container.find('#tpl_remain_data').text());
  },

  _bindEvent: function () {
    this.$container.on('click', '#line-set', $.proxy(this.openLineSelectPopup, this));
    this.$container.on('click', '.btn_process', $.proxy(this.goToProcess, this));
    this.$container.on('click', '.bt-link-tx', $.proxy(this.openPriceList, this));
    this.$container.on('click', '.my-data', $.proxy(this.showRemainData, this));
    this.$container.on('click', '.popup-blind', $.proxy(this.closeLineSelectPopup, this));
    this.$container.on('click', '.popup-closeBtn', $.proxy(this.closePriceList, this));
    this.$container.on('updateLineInfo', $.proxy(this.updateLineInfo, this));
    this.$container.on('click', '.tab-linker a', $.proxy(this.changeTabMenu, this));
  },

  changeTabMenu: function (e) {
    var elTab = $(e.currentTarget);
    var elWrapperTab = $('.tab-linker a');

    if ( elWrapperTab.index(elTab) == 0 ) {
      location.hash = 'gift';
    }

    if ( elWrapperTab.index(elTab) == 1 ) {
      location.hash = 'request';
    }
  },

  updateLineInfo: function (e, params) {
    // TODO: fetch data && data binding
    this.lineList = params.lineList;
    this.lineInfo = params.lineInfo;

    this._apiService.request(Tw.API_CMD.BFF_06_0015, { svcMgmtNum: this.lineInfo.svcMgmtNum })
      .done($.proxy(this.onSuccessProvider, this));

    // $.when()
    //   .then(function () {
    // })
  },

  onSuccessProvider: function (res) {
    if ( res.code == '00' ) {
      var result = res.result;
      result.familyMemberYn = result.familyMemberYn == 'Y' ? true : false;
      result.goodFamilyMemberYn = result.goodFamilyMemberYn == 'Y' ? true : false;

      this.$wrap_gift_count.html(this.tpl_gift_count(result));
    }
  },

  goToProcess: function (e) {
    var processType = $(e.currentTarget).data('type');

    if ( processType === 'members' ) {
      location.href = '/myt/gift/process/members#step1';
    }

    if ( processType === 'family' ) {
      location.href = '/myt/gift/process/family#step1';
    }

    if ( processType === 'request' ) {
      location.href = '/myt/gift/process/request#step1';
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

  openLineSelectPopup: function () {
  },

  closeLineSelectPopup: function () {
  }
});
