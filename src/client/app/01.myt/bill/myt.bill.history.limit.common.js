/**
 * FileName: myt.bill.history.limit.common.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.08.02
 */

Tw.MyTBillHistoryLimitCommon = function (rootEl, type, data) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this.chkCurrentLimit = new Tw.MyTBillHistoryCommon.GetLimit();

  this.type = type;
  if (data) {
    this.data = JSON ? JSON.parse(data) : $.parseJSON(data);
  }

  this._cachedElement();

  this._init();
};

Tw.MyTBillHistoryLimitCommon.prototype = {
  _cachedElement: function () {
    if (!this.data) {
      this.rest = this.$container.find('#fe-limit-rest');
      this.usedLimit = this.$container.find('#fe-limit-usedLimit');
      this.use = this.$container.find('#fe-limit-use');
      this.prepay = this.$container.find('#fe-limit-prepay');
      this.max = this.$container.find('#fe-prepay-max');
    } else {
      this.$limitSelector = this.$container.find('.tx-cont.vm button');

      this.$limitChangeTrigger = this.$container.find('.contents-btn .bt-blue1 button');
    }

    this.$movePrePayPageBtnWrapper = this.$container.find('.contents-btn');
    this.$movePrePayPageBtn = this.data ?
        this.$movePrePayPageBtnWrapper.find('.bt-slice .bt-white1 a') : this.$movePrePayPageBtnWrapper.find('.bt-slice .bt-blue1 a');
  },

  _init: function () {
    if (!this.data) {
      this._currentCallback = this._updateLimitUI;

      switch (this.type) {
        case 'micro':
          this.apiName = Tw.API_CMD.BFF_07_0073;
          this.dataSet = {
            remainUseLimit: this.rest,
            microPayLimitAmt: this.usedLimit,
            tmthUseAmt: this.use,
            tmthChrgAmt: this.prepay,
            tmthChrgPsblAmt: this.max
          };
          break;
        case 'contents':
          this.apiName = Tw.API_CMD.BFF_07_0081;
          this.dataSet = {
            remainUseLimit: this.rest,
            useContentsLimitAmt: this.usedLimit,
            tmthUseAmt: this.use,
            tmthChrgAmt: this.prepay,
            tmthChrgPsblAmt: this.max
          };
          break;
        default:
          break;
      }
    } else {
      this._currentCallback = this._setPrePayEnvironment;
      this.limitValueList = [];
      this.initialData = _.clone(this.data);
      this.limitDown = [];
      this.isChanged = false;
      switch (this.type) {
        case 'micro':
          this.apiName = Tw.API_CMD.BFF_07_0073;
          this.updateApiNameUP = Tw.API_CMD.BFF_05_0081U;
          this.updateApiNameDN = Tw.API_CMD.BFF_05_0081D;
          break;
        case 'contents':
          this.apiName = Tw.API_CMD.BFF_07_0081;
          this.updateApiNameUP = Tw.API_CMD.BFF_05_0067U;
          this.updateApiNameDN = Tw.API_CMD.BFF_05_0067D;
          break;
        default:
          break;
      }
      this.$limitChangeTrigger.on('click', $.proxy(this._chkChangeLimit, this));
      this.$limitSelector.on('click', $.proxy(this._handleOpenLimitSelect, this));
      this._setChoiceValueList();
    }

    this.chkCurrentLimit._init(this.apiName, $.proxy(this._currentCallback, this, this.dataSet || null));
    this.$movePrePayPageBtn.on('click', $.proxy(this._chkCanMovePrePayPage, this));
  },

  _setChoiceValueList: function () {
    this.data.paySpectrum.map($.proxy(function (o) {
      this.limitValueList.push({
        attr: 'data-value="' + o + '"',
        text: Tw.FormatHelper.addComma(o.toString())
      });
    }, this));
  },

  _chkChangeLimit: function () {
    if(!this.isChanged) {
      this._popupService.openAlert(
          Tw.MSG_MYT.HISTORY_ALERT_A12,
          Tw.POPUP_TITLE.NOTIFY,
          $.proxy(this._confirmCallback, this), null);
      return false;
    }

    var updateAPI_NAME = this._getLimitUpDown() ? this.updateApiNameUP : this.updateApiNameDN;

    // console.log('[/myt/bill/history/limit/change', updateAPI_NAME, this.data);

    this._apiService.request(updateAPI_NAME, {
      chgMLimit: this.data.monLimit,
      chgDLimit: this.data.dayLimit,
      chgOLimit: this.data.onceLimit
    }).done(
        $.proxy(this._handleResponse, this)
    ).error($.proxy(this.chkCurrentLimit._apiError, this.chkCurrentLimit));
  },

  _getLimitUpDown: function () {
    this.limitDown.push(parseInt(this.data.monLimit, 10) > parseInt(this.initialData.monLimit, 10));
    this.limitDown.push(parseInt(this.data.dayLimit, 10) > parseInt(this.initialData.dayLimit, 10));
    this.limitDown.push(parseInt(this.data.onceLimit, 10) > parseInt(this.initialData.onceLimit, 10));

    return this.limitDown[0] || this.limitDown[1] || this.limitDown[2];
  },

  _handleResponse: function (res) {
    this.limitDown = [];
    if (res.code === Tw.API_CODE.CODE_00) {

    } else {
      $.proxy(this.chkCurrentLimit._apiError, this.chkCurrentLimit, res)();
    }
    // console.log(res);
  },

  _handleOpenLimitSelect: function (e) {
    var popupIndex = this.$limitSelector.index(e.target);
    var popupTitle;

    switch (popupIndex) {
      case 0:
        popupTitle = Tw.POPUP_TITLE.MYT_LIMIT_MONTH;
        break;
      case 1:
        popupTitle = Tw.POPUP_TITLE.MYT_LIMIT_DAY;
        break;
      case 2:
        popupTitle = Tw.POPUP_TITLE.MYT_LIMIT_ONCE;
        break;
      default:
        break;
    }

    this._popupService.openChoice(popupTitle, this.limitValueList, '',
        $.proxy(this._selectPopupCallback, this, $(e.target), popupIndex));
  },

  _selectPopupCallback: function (target, index) {
    this.$container.find('.popup .popup-contents button').on('click', $.proxy(function (e) {
      var selectedValue = $(e.target).data('value');
      this._updateSelectedValue(index, selectedValue);
      target.html(Tw.FormatHelper.addComma(selectedValue.toString()));
      this._popupService.close();
    }, this));
  },

  _updateSelectedValue: function (index, value) {
    switch (index) {
      case 0:
        this.data.monLimit = value;
        this.isChanged = (value !== parseInt(this.initialData.monLimit, 10));
        break;
      case 1:
        this.data.dayLimit = value;
        this.isChanged = (value !== parseInt(this.initialData.dayLimit, 10));
        break;
      case 2:
        this.data.onceLimit = value;
        this.isChanged = (value !== parseInt(this.initialData.onceLimit, 10));
        break;
      default:
        break;
    }
  },

  _setPrePayEnvironment: function (empty, res) {
    if(!empty) {
      this.$movePrePayPageBtn.parent().removeClass('none');
    } else {
      this.$movePrePayPageBtnWrapper.removeClass('none');
    }
    this.totalPrePayAmt = parseInt(res.result.tmthChrgPsblAmt, 10);
    this.totalPrePayCountOnMonth = parseInt(res.result.tmthChrgCnt, 10);
  },

  _updateLimitUI: function (dataSet, res) {
    this._setPrePayEnvironment(dataSet, res);
    _.map(dataSet, function (val, key) {
      val.html(Tw.FormatHelper.addComma(res.result[key]));
    });
  },

  _chkCanMovePrePayPage: function (e) {
    if (this.totalPrePayAmt === 0) {
      e.preventDefault();
      this._popupService.openAlert(
          Tw.MSG_MYT.HISTORY_ALERT_A15,
          Tw.POPUP_TITLE.NOTIFY,
          $.proxy(this._confirmCallback, this), null);
    } else if (this.totalPrePayCountOnMonth > 99) {
      e.preventDefault();
      this._popupService.openAlert(
          Tw.MSG_MYT.HISTORY_ALERT_A16,
          Tw.POPUP_TITLE.NOTIFY,
          $.proxy(this._confirmCallback, this), null);
    }
  },

  _confirmCallback: function () {
    this._popupService.close();
  }
};
