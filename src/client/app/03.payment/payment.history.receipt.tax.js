/**
 * FileName: payment.history.receipt.tax.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.05
 */
Tw.PaymentHistoryReceiptTax = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._hash = Tw.Hash;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;
  this._inputHelper = Tw.InputHelper;

  this.common = new Tw.PaymentHistoryCommon(rootEl);

  this._cachedElement();
  this._bindDOM();
  this._init();
};

Tw.PaymentHistoryReceiptTax.prototype = {
  _cachedElement: function () {
    this.$listWrapper = this.$container.find('#fe-list-wrapper');

    this.listWrapperTemplate = $('#list-wrapper');
    this.defaultListTemplate = $('#list-default');
    this.emptyListTemplate = $('#list-empty');
  },

  _bindDOM: function () {
    this.common.setMenuChanger(this.$menuChanger);
  },

  _init: function () {
    this._setPageInfo();
    this._getData();
  },

  _setPageInfo: function () {
    this.useTemplate = this.defaultListTemplate;

    this.STRING = {
      HBS_FAX: 'PA_06_09_L01',
      HBS_EMAIL: 'PA_06_09_L02'
    };

    this.apiName = Tw.API_CMD.BFF_07_0017;
  },

  _getData: function () {
    if (this.apiName) {
      this._apiService.request(this.apiName, this.apiOption).done($.proxy(this._setData, this)).error($.proxy(this._apiError, this));
    } else {
      // TODO : history replace
    }
  },

  _setData: function (res) {
    if (res.code !== Tw.API_CODE.CODE_00) return this._apiError(res);

    this.result = res.result.taxReprintList;

    if (this.result.length) {

      this.result.reverse();

      this.result.map($.proxy(function (o, i) {
        o.listId = i;
        o.receiptDate = this._dateHelper.getShortDateWithFormat(o.taxBillIsueDt, 'YYYY.MM.DD', 'YYYYMMDD');
        o.customerName = o.ctzBizNum;
        o.companyNumber = o.ctzBizNum;

        o.receiptedAmount = Tw.FormatHelper.addComma(o.totAmt.toString());

        o.priceAmount = Tw.FormatHelper.addComma(o.splyPrc.toString());
        o.taxAmount = Tw.FormatHelper.addComma(o.vatAmt.toString());
        o.totalAmount = Tw.FormatHelper.addComma(o.totAmt.toString());

      }, this));
    }

    var list = new this.common.listWithTemplate();
    list._init({result: this.result}, this.$listWrapper, {
      list: this.useTemplate,
      wrapper: this.listWrapperTemplate,
      empty: this.emptyListTemplate
    }, {
      setIndex: function (option) {
        return option.fn(this);
      }
    }, {
      list: 'listElement',
      restButton: 'restCount'
    }, 10, '.contents-info-list .bt-more', '', $.proxy(this.appendListCallBack, this));
  },

  appendListCallBack: function () {
    if (this.result.length) {
      this.$listWrapper.parent().addClass('nogaps-btm');
    }
    this.addListButtonHandler();
  },

  addListButtonHandler: function () {
    this.$container.find('.detail-btn').off().on('click', '.fe-btn', $.proxy(this.listButtonHandler, this));
  },

  listButtonHandler: function (e) {
    this._popupService.open({
          hbs: $(e.target).hasClass('fax') ? this.STRING.HBS_FAX : this.STRING.HBS_EMAIL,
          data: this.result[$(e.target).data('list-id')]
        },
        $.proxy(this.detailOpenCallback, this, $(e.target)));
  },

  detailOpenCallback: function ($trigger, $layer) {
    $layer.on('click', '.bt-white2 button', $.proxy(function () {
      this._popupService.close();
    }, this));
    $layer.on('click', '.bt-red1 button', $.proxy(this.inputFormValidate, this, $layer, $trigger));
  },

  inputFormValidate: function ($layer, $trigger) {
    var validateValue;

    if ($trigger.hasClass('fax')) {
      validateValue = $layer.find('.input input').eq(0).val();
      if (this.checkFormatEmpty(validateValue) || validateValue.trim().length < 9) {
        this._popupService.openAlert(
            Tw.MSG_PAYMENT.HISTORY_A11,
            Tw.POPUP_TITLE.NOTIFY,
            '', $.proxy(function () {
              $layer.find('.input input').focus();
            }, this));
      } else {
        // (this._dateHelper.getShortDateWithFormat(new Date(), 'YYYYMM'));
      }
    } else {
      validateValue = $layer.find('.input-context input').eq(0).val();
      if (!this.checkStringFormatEmail(validateValue)) {
        this._popupService.openAlert(
            Tw.MSG_PAYMENT.HISTORY_A08,
            Tw.POPUP_TITLE.NOTIFY,
            '', $.proxy(function () {
              $layer.find('.input-context input').focus();
            }, this));
      } else {

      }
    }
  },

  checkFormatEmpty: function (v) {
    if (v === null || v === undefined) return true;
    return !v.replace(/^\s+/g, '').length;
  },

  checkStringFormatEmail: function (v) {
    return this._inputHelper.validateEmail(v);
  },

  _apiError: function (err) {
    this.common._apiError(err);
  }
};
