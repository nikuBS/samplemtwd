/**
 * FileName: myt.bill.history.limit.common.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.08.02
 */

Tw.MyTBillHistoryLimitCommon = function (rootEl, type, data) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this.API_CODE = {
      CODE_F806: 'F806'       // 소액결제 한도변경 월 1회 이상 시도
  };

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
      this.limitValueListMonth = [];
      this.limitValueListNormal = [];

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

      if (this.data.code === Tw.API_CODE.CODE_00) {
        this._setChoiceValueList();
      } else {
        this.chkCurrentLimit._apiError(this.data, $.proxy(function () {
          this._popupService.close();
          this._historyService.goBack();
        }, this));
      }
    }

    this.chkCurrentLimit._init(this.apiName, $.proxy(this._currentCallback, this, this.dataSet || null));
    this.$movePrePayPageBtn.on('click', $.proxy(this._chkCanMovePrePayPage, this));
  },

  _setChoiceValueList: function () {
    var temp;
    this.data.result.paySpectrumMonth.map($.proxy(function (o) {
      this.limitValueListMonth.push({
        attr: 'data-value="' + o + '"',
        text: Tw.FormatHelper.addComma(o.toString())
      });
    }, this));

    for (var k = 50; k >= 1; k--) {
      temp = (k * 10000).toString();
      this.limitValueListNormal.push({
        attr: 'data-value="' + (temp) + '"',
        text: Tw.FormatHelper.addComma(temp)
      });
    }

  },

  _chkChangeLimit: function () {
    if (!this.isChanged) {
      this._popupService.openAlert(
          Tw.MSG_MYT.HISTORY_ALERT_A12,
          Tw.POPUP_TITLE.NOTIFY,
          $.proxy(this._confirmCallback, this), null);
      return false;
    }

    if (this.data.onceLimit > this.data.dayLimit) {
      this._popupService.openAlert(
          Tw.MSG_MYT.HISTORY_ALERT_B01,
          Tw.POPUP_TITLE.NOTIFY,
          $.proxy(this._confirmCallback, this, this._setLimitOpenerInitData), null);
      return false;
    }

    if (this.data.dayLimit > this.data.monLimit) {
      this._popupService.openAlert(
          Tw.MSG_MYT.HISTORY_ALERT_B02,
          Tw.POPUP_TITLE.NOTIFY,
          $.proxy(this._confirmCallback, this, this._setLimitOpenerInitData), null);
      return false;
    }

    this._popupService.openConfirm(
        Tw.POPUP_TITLE.CONFIRM,
        Tw.MSG_MYT.HISTORY_ALERT_A13,
        null,
        null,
        $.proxy(this._callUpdateAPI, this),
        null
    );
  },

  _callUpdateAPI: function () {
    this._popupService.close();
    var updateAPI_NAME = this._getLimitUpDown() ? this.updateApiNameUP : this.updateApiNameDN;

    this._apiService.request(updateAPI_NAME, {
      chgMLimit: this.data.monLimit,
      chgDLimit: this.data.dayLimit,
      chgOLimit: this.data.onceLimit
    }).done(
        $.proxy(this._handleResponse, this)
    ).fail($.proxy(this.chkCurrentLimit._apiError, this.chkCurrentLimit));
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
      this._popupService.openAlert(
          Tw.MSG_MYT.HISTORY_ALERT_A14,
          Tw.POPUP_TITLE.NOTIFY,
          $.proxy(this._confirmCallback, this), null);
    } else if (res.code === this.API_CODE.CODE_F806) {
      this._popupService.openAlert(
          Tw.MSG_MYT.HISTORY_ALERT_A17,
          Tw.POPUP_TITLE.NOTIFY,
          $.proxy(this._confirmCallback, this, this._setLimitOpenerInitData), null);
    } else {
      $.proxy(this.chkCurrentLimit._apiError, this.chkCurrentLimit, res)();
    }
  },

  _handleOpenLimitSelect: function (e) {
    var popupIndex = this.$limitSelector.index(e.target);
    var currentListLimit;
    var popupTitle;

    switch (popupIndex) {
      case 0:
        currentListLimit = this.limitValueListMonth;
        popupTitle = Tw.POPUP_TITLE.MYT_LIMIT_MONTH;
        break;
      case 1:
        currentListLimit = this.limitValueListNormal;
        popupTitle = Tw.POPUP_TITLE.MYT_LIMIT_DAY;
        break;
      case 2:
        currentListLimit = this.limitValueListNormal;
        popupTitle = Tw.POPUP_TITLE.MYT_LIMIT_ONCE;
        break;
      default:
        break;
    }

    this._popupService.openChoice(popupTitle, currentListLimit, '',
        $.proxy(this._selectPopupCallback, this, $(e.target), popupIndex));
  },

  _setLimitOpenerInitData: function () {
    this.$limitSelector.map($.proxy(function (i, o) {
      switch (i) {
        case 0:
          $(o).html(Tw.FormatHelper.addComma(this.initialData.monLimit));
          break;
        case 1:
          $(o).html(Tw.FormatHelper.addComma(this.initialData.dayLimit));
          break;
        case 2:
          $(o).html(Tw.FormatHelper.addComma(this.initialData.onceLimit));
          break;
        default:
          break;
      }
      this.data = _.clone(this.initialData);
      this.isChanged = false;
    }, this));
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
    if (!empty) {
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

  _confirmCallback: function (callback) {
    this._popupService.close();
    if (callback)
      ($.proxy(callback, this))();
  }
};
