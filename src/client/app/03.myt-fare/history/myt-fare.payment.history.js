/**
 * FileName: myt-fare.payment.history.js
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018. 9. 17
 */
Tw.MyTFarePaymentHistory = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._bankList = new Tw.MyTFarePaymentBankList(this.$container);

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTFarePaymentHistory.prototype = {
  _init: function () {

    this.rootPathName = this.data.current === 'all' ? this._historyService.pathname : this._historyService.pathname.split('/').slice(0, -1).join('/');

    if (this.data && this.data.current !== 'detail') {
      this.currentActionsheetIndex = Tw.MYT_PAYMENT_HISTORY_TYPE.reduce($.proxy(function (prev, cur, index) {
        if (this.data.current === cur) {
          prev = index;
        }
        return prev;
      }, this), 0);

      this._initPaymentList();
    } else {
      this.detailData = JSON.parse(Tw.UIService.getLocalStorage('detailData'));
      this.queryParams = Tw.UrlHelper.getQueryParams();

      // console.log(this.detailData, this.detailData.dataLastInvDt);

      this.$templateWrapper = this.$container.find('#fe-detail-wrapper');

      this.$template = {
        $directBase : Handlebars.compile($('#fe-payment-detail-dt').html()),
        $directOCBandCard : Handlebars.compile($('#fe-payment-detail-ocb-card').html()),
        $directBank : Handlebars.compile($('#fe-payment-detail-bank').html()),
        $auto : Handlebars.compile($('#fe-payment-detail-auto').html()),
        $microContents : Handlebars.compile($('#fe-payment-detail-micro-contents').html())
      };

      switch (this.queryParams.type) {
        case 'DI':
          this.detailData.dataUseTermStart = this.detailData.dataDt.substr(0, 8) + '01';
          this.detailData.cardNum = this.data.cardNum;
          this.detailData.aprvNum = this.data.aprvNum;
          switch (this.queryParams.settleWayCd) {
            case '02':
            case '10':
            case '11':
              this.$templateWrapper.append(this.$template.$directOCBandCard(this.detailData));
              break;
            case '41':
              this.$templateWrapper.append(this.$template.$directBank(this.detailData));
              break;
            default:
              this.$templateWrapper.append(this.$template.$directBase(this.detailData));
              break;
          }
          break;
        case 'AT':
        case 'AU':
          this.detailData.dataUseTermStart = this.detailData.dataLastInvDt.substr(0, 8) + '01';
          this.$templateWrapper.append(this.$template.$auto(this.detailData));
          break;
        default:
          this.$templateWrapper.append(this.$template.$microContents(this.detailData));
          break;

      }

      // this._historyService.
    }
  },

  _initPaymentList: function() {
    // console.log(this.data);

    var initedListTemplate;
    var totalDataCounter = this.data.listData.mergedListData.length;
    this.renderListData = {};

    if (!totalDataCounter) {
      initedListTemplate = this.$template.$emptyList();
    } else {
      this.listRenderPerPage = 20;

      this.listLastIndex = this.listRenderPerPage;
      this.listViewMoreHide = (this.listLastIndex < totalDataCounter);

      this.renderableListData = this.data.listData.mergedListData.slice(0, this.listRenderPerPage);

      this.renderListData.initialMoreData = this.listViewMoreHide;
      this.renderListData.restCount = totalDataCounter - this.listRenderPerPage;
      this.renderListData.records = this.renderableListData.reduce($.proxy(function(prev, cur) {
        if (prev.length) {
          if (prev.slice(-1)[0].date === cur.listDt) {
            prev.slice(-1)[0].items.push(cur);
          } else {
            prev.push({items: [cur], date:cur.listDt});
          }
        } else {
          prev.push({items: [cur], date:cur.listDt});
        }

        return prev;
      }, this), []);

      initedListTemplate = this.$template.$listWrapper(this.renderListData);
    }

    this.$template.$domListWrapper.append(initedListTemplate);
    this.$listWrapper = this.$container.find('#fe-list-wrapper');
    this.$btnListViewMorewrapper = this.$container.find('#fe-list-wrapper .bt-more');
    this.$btnListViewMorewrapper.on('click', 'button', $.proxy(this._updatePaymentList, this));
    this.$appendListTarget = this.$listWrapper.find('.fe-list-inner');
    this.$appendListTarget.on('click', 'button', $.proxy(this._listViewDetailHandler, this));
  },

  _listViewDetailHandler: function(e) {
    var detailData = this.data.listData.mergedListData[$(e.currentTarget).data('listId')];

    detailData.isPersonalBiz = this.data.isPersonalBiz;

    Tw.UIService.setLocalStorage('detailData', JSON.stringify(detailData));
    this._historyService.goLoad(this._historyService.pathname + '/detail?type=' + detailData.dataPayMethodCode +
        '&isBank=' + detailData.dataIsBank + '&settleWayCd=' + (detailData.settleWayCd || ''));
  },

  _updatePaymentList: function(e) {
    this._updatePaymentListData();

    this.$btnListViewMorewrapper.css({display: this.listLastIndex >= this.data.listData.mergedListData.length ? 'none':''});
    this._updateViewMoreBtnRestCounter($(e.currentTarget));

    var insertCompareData = this.data.listData.mergedListData[this.listLastIndex - this.listRenderPerPage - 1],
        $domAppendTarget = this.$appendListTarget;

    this.renderableListData.map($.proxy(function(o) {
      var renderedHTML;
      if (insertCompareData.listDt === o.listDt) {
        $domAppendTarget = $('.fe-list-inner li:last-child');
        renderedHTML = this.$template.$templateItem({items:[o], date: o.listDt});
      } else {
        insertCompareData = o;
        $domAppendTarget = this.$appendListTarget;
        renderedHTML = this.$template.$templateItemDay({records:[{items:[o], date:o.listDt, yearHeader:o.yearHeader}]});
      }

      $domAppendTarget.append(renderedHTML);

    }, this));
  },

  _updatePaymentListData: function() {
    this.listNextIndex = this.listLastIndex + this.listRenderPerPage;
    this.renderableListData = this.data.listData.mergedListData.slice(this.listLastIndex, this.listNextIndex);
    this.renderListData.restCount = this.data.listData.mergedListData.length - this.listNextIndex;

    this.listLastIndex = this.listNextIndex >= this.data.listData.mergedListData.length ?
        this.data.listData.mergedListData.length : this.listNextIndex;
  },

  _updateViewMoreBtnRestCounter: function(e) {
    e.text(e.text().replace(/\((.+?)\)/, '(' + this.renderListData.restCount + ')'));
  },

  _cachedElement: function () {

    if (this.data && this.data.current !== 'detail') {
      this.$actionSheetTrigger = this.$container.find('#fe-type-trigger');

      this.$addRefundAccountTrigger = this.$container.find('#fe-refund-add-account');

      this.$openAutoPaymentLayerTrigger = this.$container.find('#fe-go-refund-quit');
      this.$moveRefundListTrigger = this.$container.find('#fe-go-refund-list');

      this.$template = {
        $domListWrapper: this.$container.find('#fe-list-wrapper'),
        // $list: this.$container.find('#list-default'),

        $templateItem: Handlebars.compile($('#fe-template-items').html()),
        $templateItemDay: Handlebars.compile($('#fe-template-day').html()),
        $templateYear: Handlebars.compile($('#fe-template-year').html()),

        $listWrapper: Handlebars.compile($('#list-template-wrapper').html()),
        $emptyList: Handlebars.compile($('#list-empty').html())
      };
      Handlebars.registerPartial('chargeItems', $('#fe-template-items').html());
      Handlebars.registerPartial('list', $('#fe-template-day').html());
      Handlebars.registerPartial('year', $('#fe-template-year').html());
    }
  },

  _bindEvent: function () {
    if (this.data && this.data.current !== 'detail') {
      this.$actionSheetTrigger.on('click', $.proxy(this._typeActionSheetOpen, this));
      this.$addRefundAccountTrigger.on('click', $.proxy(this._openAddRefundAccount, this));

      this.$openAutoPaymentLayerTrigger.on('click', $.proxy(this._openAutoPaymentLayer, this));
      this.$moveRefundListTrigger.on('click', $.proxy(this._moveRefundList, this));
    }
  },

  _openAddRefundAccount: function () {
    this._popupService.open(
        {
          hbs: 'MF_08_02'
        },
        $.proxy(this._openAddRefundAccountCallback, this), $.proxy(this._closeAddRefundAccountCallback, this),
        Tw.MYT_PAYMENT_HISTORY_HASH.OVERPAY_REFUND
    );
  },

  _openAddRefundAccountCallback: function ($container) {
    this.refundAPI_option = {
      // recCnt: this.paramData.recCnt,
      // sendSvcMgmtNum: this.paramData.svcMgmtNum,
      // bamtClCd: this.paramData.bamtClCd
    };

    this.$refundRequestBtn = $($container).find('.bt-fixed-area button');
    this.$bankList = $($container).find('.bt-dropdown.big');

    this.$bankList.on('click', $.proxy(this._selectBank, this));
    $container.on('click', '.bt-fixed-area button', $.proxy(this._refundRequestSend, this));
    $container.on('keyup', '#fe-bank-account', $.proxy(this._accountInputHandler, this));
    $($container).find('#fe-bank-account').siblings('button.cancel').eq(0).on('click', $.proxy(this._accountInputHandler, this));
  },

  _closeAddRefundAccountCallback: function() {
    this._historyService.reload();
  },

  _selectBank: function (event) {
    this._bankList.init(event, $.proxy(this._checkIsAbled, this));
  },

  _checkIsAbled: function () {
    this.isBankNameSeted = true;
    this.refundAPI_option.rfndBankCd = this.$bankList.attr('id');
    this._refundAccountInfoUpdateCheck();
  },

  _refundRequestSend: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0032, this.refundAPI_option)
        .done($.proxy(this._successRegisterAccount, this)).fail($.proxy(this._apiError, this));
  },

  _successRegisterAccount: function(res) {
    if(res.code === '00') {
      this._popupService.openAlert(Tw.POPUP_CONTENTS.REFUND_ACCOUNT_SUCCESS, Tw.POPUP_TITLE.NOTIFY, Tw.BUTTON_LABEL.CONFIRM, $.proxy(function() {
        this._popupService.close();
      }, this));
    } else {
      this._popupService.openAlert(res.msg, Tw.POPUP_TITLE.NOTIFY, Tw.BUTTON_LABEL.CONFIRM, null);
    }
  },

  _accountInputHandler: function (e) {
    this.isBankAccountNumberSeted = ($(e.currentTarget).val().length > 0);
    this.refundAPI_option.rfndBankNum = $(e.currentTarget).val();
    this._refundAccountInfoUpdateCheck();
  },

  _refundAccountInfoUpdateCheck: function () {
    if (this.isBankNameSeted && this.isBankAccountNumberSeted) {
      this.$refundRequestBtn.attr('disabled', false);
    } else {
      this.$refundRequestBtn.attr('disabled', true);
    }
  },

  _openAutoPaymentLayer: function () {
    this._popupService.open(
        {
          hbs: 'MF_08_03',
          bankName: this.data.withdrawalBankName,
          bankAccount: this.data.withdrawalBankAccount
        },
        $.proxy(this._autoWithdrawalOpenCallback, this), null, Tw.MYT_PAYMENT_HISTORY_HASH.AUTO_WITHDRAWAL
    );
  },

  _autoWithdrawalOpenCallback: function ($container) {
    $container.on('click', '.bt-red1 button', $.proxy(this._processAutoWithdrawalCancel, this));
  },

  _processAutoWithdrawalCancel: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0069, {
      bankCd: this.data.withdrawalBankCode,
      bankSerNum: this.data.withdrawalBankSerNum
    }).done($.proxy(this._successCancelAccount, this)).fail($.proxy(this._apiError, this));
  },

  _successCancelAccount: function (res) {
    if (res.code === '00') {
      Tw.CommonHelper.toast(Tw.MYT_FARE_HISTORY_PAYMENT.CANCEL_AUTO_WITHDRAWAL);
      this._popupService.close();
      this.$openAutoPaymentLayerTrigger.hide();
    }
  },

  _moveRefundList: function () {
    this._historyService.goLoad('/myt/fare/history/overpay-refund');
  },

  _getAllData: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0030, {}).done($.proxy(this._setData, this)).fail($.proxy(this._apiError, this));
  },

  _setData: function (data) {
    // console.log(data);
  },

  _typeActionSheetOpen: function () {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',// hbs의 파일명
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_PAYMENT_TYPE,
      data: Tw.POPUP_TPL.PAYMENT_HISTORY_TYPE
    }, $.proxy(this._openTypeSelectHandler, this), $.proxy(this._closeTypeSelect, this));
  },

  _openTypeSelectHandler: function ($container) {
    this.$typeSelectActionsheetButtons = $container.find('.chk-link-list button');
    $(this.$typeSelectActionsheetButtons[0]).removeClass('checked');
    $(this.$typeSelectActionsheetButtons[this.currentActionsheetIndex]).addClass('checked');
    this.$typeSelectActionsheetButtons.on('click', $.proxy(this._moveByPaymentType, this));
  },

  _closeTypeSelect: function () {
  },

  _moveByPaymentType: function (e) {
    var target    = $(e.currentTarget),
        targetURL = this.rootPathName.slice(-1) === '/' ? this.rootPathName.split('/').slice(0, -1).join('/') : this.rootPathName;

    this._popupService.close();
    if (!target.hasClass('checked')) {
      targetURL = !Tw.MYT_PAYMENT_HISTORY_TYPE[this.$typeSelectActionsheetButtons.index(target)] ?
          targetURL : targetURL + '/' + Tw.MYT_PAYMENT_HISTORY_TYPE[this.$typeSelectActionsheetButtons.index(target)];
      this._historyService.goLoad(targetURL);
    }
  },

  _apiError: function (err) {
    Tw.Logger.error(err.code, err.msg);
    this._popupService.openAlert(Tw.MSG_COMMON.SERVER_ERROR + '<br />' + err.code + ' : ' + err.msg);
    return false;
  }
};
