/**
 * @file myt-fare.history.micro-contents.common.js
 * @author Lee Sanghyoung (silion@sk.com)
 * @since 2018. 9. 17
 */
Tw.MyTFareHistoryMicroContents = function (rootEl, data) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(rootEl);
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;
  this._urlHelper = Tw.UrlHelper;

  this._params = this._urlHelper.getQueryParams();

  this._init(data);
};

Tw.MyTFareHistoryMicroContents.prototype = {
  _init: function (data) {
    this.current = this._getLastPathname();

    this._cachedElement();
    this._bindEvent();

    switch (this.current) {
      case 'history':
        this._initMicroPaymentContentsHistory(data);
        break;
      case 'detail':
        this._initDetailView();
        break;
      case 'block':
        this._initAutopaymentBlockHistory();
        break;
      default:
        break;
    }
  },

  _cachedElement: function () {
    this.$autopaymentSwitcher = this.$container.find('.switch-wrap .btn-switch input');
    this.$microPayMonthSelector = this.$container.find('#fe-month-selector');
    this.$microPayTotalCounter = this.$container.find('#fe-micro-payment-counter');
  },

  _bindEvent: function () {
    if (this.$autopaymentSwitcher) {
      this.$autopaymentSwitcher.on('change', $.proxy(this._autoPaymentBlockToggle, this));
    }
  },

  _initMicroPaymentContentsHistory: function (data) {
    var date = new Date();
    this.monthTermValue = JSON.parse(data).termSelectValue;

    this.boardListWithTemplate = new Tw.MyTFareHistoryCommonBoard(this.$container);

    this.dateInfo = {
      year: this._dateHelper.getShortDateWithFormat(date, 'YYYY'),
      month: this._dateHelper.getCurrentMonth(date)
    };

    this.monthActionSheetListData = $.proxy(this._setMonthActionSheetData, this)();

    this.$microPayMonthSelector.on('click', $.proxy(this._typeActionSheetOpen, this, Tw.POPUP_TITLE.SELECT, this.monthActionSheetListData,
        $.proxy(this._openMonthSelectHandler, this), $.proxy(this._closeMonthSelect, this)));

    this.$container.on('click', '.list-inner li a', $.proxy(this._moveDetailPage, this));

    this.$template = {
      $domListWrapper: this.$container.find('#fe-list-wrapper'),
      $list: this.$container.find('#list-default'),
      $listWrapper: this.$container.find('#list-wrapper'),
      $emptyList: this.$container.find('#list-empty')
    };
  },

  _moveDetailPage: function (e) {
    Tw.CommonHelper.setLocalStorage('myTFareHistoryDetailData', JSON.stringify(this.currentMonthData[$(e.currentTarget).data('listId')]));
  },

  _setMicroPaymentContentsData: function (res) {
    this.historyData = JSON.parse(res);

    this.currentMonthData = (this.historyData[this.dateInfo.year] && this.historyData[this.dateInfo.year][this.dateInfo.month]) ?
        this.historyData[this.dateInfo.year][this.dateInfo.month] : [];

    this._setCurrentMonthDataIndex();
    this._renderMicroPayContentsList();
  },

  _openMonthSelectHandler: function (root) {
    this.$monthSelectActionsheetButtons = root.find('.chk-link-list button');
    $(this.$monthSelectActionsheetButtons[this.dateInfo.currentIndex || 0]).addClass('checked');
    this.monthActionSheetListData[0].list[this.dateInfo.currentIndex || 0].option = 'checked';
    this.$monthSelectActionsheetButtons.on('click', $.proxy(this._updateMicroPayContentsList, this));
  },

  _closeMonthSelect: function () {
  },

  _updateMicroPayContentsList: function (e) {
    this.monthActionSheetListData[0].list[this.dateInfo.currentIndex || 0].option = '';
    this.dateInfo.currentIndex = $(e.currentTarget).data('index');
    this.dateInfo.currentYear = $(e.currentTarget).data('year');
    this.dateInfo.currentMonth = $(e.currentTarget).data('month');
    this.$monthSelectActionsheetButtons.removeClass('checked');
    this._popupService.close();
    this.$microPayMonthSelector.text($(e.target).text());

    this.currentMonthData = (this.historyData[this.dateInfo.currentYear] && this.historyData[this.dateInfo.currentYear][this.dateInfo.currentMonth]) ?
        this.historyData[this.dateInfo.currentYear][this.dateInfo.currentMonth] : [];

    this._setCurrentMonthDataIndex();

    this._renderMicroPayContentsList();
  },

  _setCurrentMonthDataIndex: function () {
    this.currentMonthData.map($.proxy(function (o, i) {
      o.listId = i;
    }, this));
  },

  _renderMicroPayContentsList: function () {

    this.$template.$domListWrapper.html('');

    this.$microPayTotalCounter.text(this.currentMonthData ? this.currentMonthData.length : 0);

    this.boardListWithTemplate._init({result: this.currentMonthData}, this.$template.$domListWrapper, {
      list: this.$template.$list,
      wrapper: this.$template.$listWrapper,
      empty: this.$template.$emptyList
    }, {
      setIndex: function (option) {
        return option.fn(this);
      }
    }, {
      list: 'listElement',
      restButton: 'restCount'
    }, 20, '.bt-more button', '.list-inner', $.proxy(this._appendListCallBack, this));
  },

  _appendListCallBack: function () {
  },

  _initDetailView: function () {
    var parentPath = this._historyService.pathname.split('/').slice(-2)[0];
    this.$detailInfo = {
      name: this.$container.find('#fe-detail-cp-name') || null,
      serviceName: this.$container.find('#fe-detail-service-name') || null,
      pgName: this.$container.find('#fe-detail-pg-name') || null,
      usageType: this.$container.find('#fe-detail-usage-type') || null,
      charge: this.$container.find('#fe-detail-charge') || null,
      deductionCharge: this.$container.find('#fe-detail-deduction-charge') || null,
      date: this.$container.find('#fe-detail-date') || null,
      paymentType: this.$container.find('#fe-detail-micro-payment-type') || null,
      paymentBlockState: this.$container.find('#fe-detail-micro-payment-block-state') || null,
      btnAutoPaymentBlock: this.$container.find('#fe-detail-btn-block-auto-payment') || null,
      linkMoveBlockList: this.$container.find('#fe-detail-link-move-block-list') || null
    };

    this.detailData = JSON.parse(Tw.CommonHelper.getLocalStorage('myTFareHistoryDetailData'));

    if (this.detailData.useServiceCompany) {
      var tempArr = this.detailData.useServiceCompany.split(' ');
      tempArr.pop();
      this.detailData.useServiceCompany = tempArr.join(' ');
    }

    this.$detailInfo.name.text(this.detailData.useServiceCompany || this.detailData.cpNm);
    this.$detailInfo.serviceName.text(this.detailData.useServiceNm || this.detailData.serviceNm);
    this.$detailInfo.usageType.text(this.detailData.payFlag || this._getDetailUsageType(this.detailData.wapYn));
    this.$detailInfo.charge.text(this.detailData.sumPriceFormed);
    this.$detailInfo.date.text(this.detailData.useDtFormed);

    if (parentPath === 'micro') {
      this.$detailInfo.btnAutoPaymentBlock.hide();
      this.$detailInfo.linkMoveBlockList.hide();
      this.$detailInfo.paymentBlockState.hide();
      this.$detailInfo.pgName.text(this.detailData.pgNm);
      this.$detailInfo.paymentType.text(this.detailData.paymentType);
      if (this.detailData.payMethod === '03') {
        this.$detailInfo.paymentBlockState.show();
        this.$detailInfo.paymentBlockState.text(this._getDetailBlockState(this.detailData.cpState));
        if (this.detailData.cpState === 'C0') {
          this.$detailInfo.btnAutoPaymentBlock.show();
          this.$detailInfo.btnAutoPaymentBlock.on('click', $.proxy(this._appendAutoPaymentBlockHandler, this, this._detailBlockCallback));
        } else {
          this.$detailInfo.linkMoveBlockList.show();
        }
      }
    } else {
      this.$detailInfo.deductionCharge.text(Tw.FormatHelper.addComma(this.detailData.deductionCharge));
    }
  },

  _appendAutoPaymentBlockHandler: function (callback) {
    this._apiService.request(Tw.API_CMD.BFF_05_0082, {
      idPg: this.detailData.idpg,
      tySvc: this.detailData.tySvc,
      cpCode: this.detailData.cpCode,
      state: 'C'
    })
        .done($.proxy(callback, this))
        .fail(function (e) {
          Tw.Logger.info(e);
        });
  },

  _detailBlockCallback: function () {
    Tw.CommonHelper.toast(Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TOAST.BLOCK);
    this.$detailInfo.btnAutoPaymentBlock.hide();
    this.$detailInfo.linkMoveBlockList.show();
    this.$detailInfo.paymentBlockState.text(this._getDetailBlockState('A1'));
    this.detailData.cpState = 'A1';
    Tw.CommonHelper.setLocalStorage('myTFareHistoryDetailData', JSON.stringify(this.detailData));
  },

  _getDetailUsageType: function (wapInfo) {
    return Tw.MYT_FARE_HISTORY_MICRO_TYPE[wapInfo];
  },

  _getDetailBlockState: function (cpState) {
    if (cpState === 'C0')
      return;
    else
      return Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TYPE[cpState];
  },

  _historyBack: function () {
    this._historyService.goBack();
  },

  _setMonthActionSheetData: function () {
    var tempArr = [];
    var yearText = '';
    for (var i = this.monthTermValue, month = this.dateInfo.month; i > 0; i--) {
      if (month === 0) {
        month = 12;
        yearText = (this.dateInfo.year - 1) + Tw.PERIOD_UNIT.YEAR + ' ';
      }
      if (month-- <= 0) {
        tempArr.push({
          value: yearText + Math.abs(month) + Tw.PERIOD_UNIT.MONTH,
          attr: 'data-index=\'' + Math.abs(i - this.monthTermValue) + '\' data-year=\'' +
            (this.dateInfo.year - 1) + '\'' + ' data-month=\'' + Math.abs(month) + '\''
        });
      } else {
        tempArr.push({
          value: yearText + (month + 1) + Tw.PERIOD_UNIT.MONTH,
          attr: 'data-index=\'' + Math.abs(i - this.monthTermValue) + '\' data-year=\'' +
            this.dateInfo.year + '\'' + ' data-month=\'' + (month + 1) + '\''
        });
      }
    }
    return [{
      list: tempArr
    }];
  },

  _typeActionSheetOpen: function (title, data, openCallback, closeCallback) {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',// hbs의 파일명
      layer: true,
      title: title,
      data: data
    }, openCallback, closeCallback);
  },

  _initAutopaymentBlockHistory: function () {

  },

  _autoPaymentBlockToggle: function (e) {
    var wrapper = $(e.target).parents('li');

    this.detailData = {
      idpg: wrapper.data('feIdpg'),
      tySvc: wrapper.data('feTysvc'),
      cpCode: wrapper.data('feCpcode'),
      state: 'C'
    };
    this._appendAutoPaymentBlockHandler(this._blockHistoryBlockToggleHandler);
  },

  _blockHistoryBlockToggleHandler: function (res) {
    if (res.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(res.code, res.msg).page();
    }

    Tw.CommonHelper.toast(Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TOAST.REVOCATION);
    window.setTimeout($.proxy(function () {
      this._historyService.reload();
    }, this), 2000);
  },

  _getLastPathname: function () {
    return _.last(this._historyService.pathname.split('/')) || this._historyService.pathname.split('/').splice(-2)[0];
  },

  _getMicroPayHistoryData: function () {

  }
};
