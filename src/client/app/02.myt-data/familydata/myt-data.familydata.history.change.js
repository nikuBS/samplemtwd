Tw.MyTDataFamilyHistoryChange = function(rootEl, item, serial, changable) {
  this.$container = rootEl;
  this.$item = item;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._serialNumber = serial;
  this._changable = changable;

  this._cachedElement();
  this._bindEvent();
};

Tw.MyTDataFamilyHistoryChange.prototype = {
  _bindEvent: function() {
    this.$container.on('click', '.btn-type01', $.proxy(this._addChangeeData, this));
    this.$container.on('click', '.cancel', $.proxy(this._validateChangeAmount, this));
    this.$container.on('click', '.fe-retrieve', $.proxy(this._handleRerieveChangable, this, true));
    this.$input.on('focusout', $.proxy(this._validateChangeAmount, this));
    this.$input.on('keyup', $.proxy(this._validateChangeAmount, this));
    this.$submitBtn.on('click', $.proxy(this._clickSubmit, this));
  },

  _cachedElement: function() {
    this.$input = this.$container.find('#fe-changable');
    this.$submitBtn = this.$container.find('#fe-submit');
    this.$error = this.$container.find('#fe-error');
    this.$strong = this.$container.find('strong.txt-c2');
  },

  _addChangeeData: function(e) {
    var value = e.currentTarget.getAttribute('data-value');

    if (value === 'all') {
      if (this._all) {
        this.$input.val('');
        this.$input.removeAttr('disabled');
        this._all = false;
      } else {
        this.$input.val(this._changable.data);
        this.$input.attr('disabled', true);
        this._all = true;
      }
    } else {
      this.$input.val(Number(this.$input.val()) + Number(value));
    }

    this._validateChangeAmount();
  },

  _validateChangeAmount: function() {
    var value = Number(this.$input.val());

    if (!value) {
      this.$error.text(Tw.VALIDATE_MSG_MYT_DATA.V17);
      this.$error.removeClass('none');
      this._setDisableSubmit(true);
    } else if (value > this._changable.data) {
      this.$error.text(Tw.VALIDATE_MSG_MYT_DATA.V16);
      this.$error.removeClass('none');
      this._setDisableSubmit(true);
    } else {
      if (!this.$error.hasClass('none')) {
        this.$error.addClass('none');
      }
      this._setDisableSubmit(false);
    }
  },

  _setDisableSubmit: function(disable) {
    disable !== !!this.$submitBtn.attr('disabled') && this.$submitBtn.attr('disabled', disable);
  },

  _clickSubmit: function() {
    var ALERT = Tw.ALERT_MSG_MYT_DATA.CONFIRM_SHARE_DATA_CHANGE;
    this._popupService.openConfirmButton(
      ALERT.CONTENTS,
      ALERT.TITLE,
      $.proxy(this._submitChange, this),
      $.proxy(this._handleClosePopup, this),
      Tw.BUTTON_LABEL.CANCEL,
      ALERT.BUTTON
    );
  },

  _submitChange: function() {
    var type = 'R',
      gb = this.$input.val(),
      mb = 0,
      remain = this._changable.data - Number(gb);
    if (this._all) {
      type = 'A';
      gb = this._changable.gb;
      mb = this._changable.mb;
      remain = 0;
    }

    this._popupService.close();

    this._apiService
      .request(Tw.API_CMD.BFF_06_0074, {
        shrpotSerNo: this._serialNumber,
        cnlClCd: type,
        reqCnlGbGty: gb,
        reqCnlMbGty: mb
      })
      .done($.proxy(this._handleDoneSubmit, this, remain));
  },

  _handleDoneSubmit: function(remain, resp) {
    var ALERT_MSG = '';
    switch (resp.code) {
      case Tw.API_CODE.CODE_00: {
        this._popupService.close();
        this.$item.find('.modify strong').text(remain + 'GB');
        if (remain > 0) {
          this.$item.find('.fe-edit').data('gb', remain);
        } else {
          this.$item.find('.fe-edit').remove();
          this.$item.find('.modify span').text(Tw.MYT_DATA_FAMILY_NOT_POSSIBLE_CHANGE);
        }

        this.isSuccess = true;
        return;
      }
      case 'RCG0066': {
        ALERT_MSG = Tw.MYT_DATA_FAMILY_CHANGE_DATA_ERRORS.NOT_CMPLETE;
        break;
      }
      case 'RCG0067': {
        ALERT_MSG = Tw.MYT_DATA_FAMILY_CHANGE_DATA_ERRORS.NOT_THIS_MONTH;
        break;
      }
      case 'RCG0068': {
        ALERT_MSG = Tw.MYT_DATA_FAMILY_CHANGE_DATA_ERRORS.NOT_MINE;
        break;
      }
      case 'RCG0069': {
        ALERT_MSG = Tw.MYT_DATA_FAMILY_CHANGE_DATA_ERRORS.NOT_SAME_PLAN;
        break;
      }
      case 'RCG0070': {
        ALERT_MSG = Tw.MYT_DATA_FAMILY_CHANGE_DATA_ERRORS.GREATER_THAN_CHANGABLE;
        break;
      }
      default: {
        return Tw.Error(resp.code, resp.msg).pop();
      }
    }

    if (ALERT_MSG) {
      this._popupService.openAlert(ALERT_MSG, null, null, $.proxy(this._handleRerieveChangable, this));
    }
  },

  _handleRerieveChangable: function(hasClass) {
    this._setDisableChange(true);

    if (hasClass) {
      this.$strong.removeClass('fe-retrieve');
    }

    this.$strong.text(Tw.MYT_DATA_FAMILY_RETRIEVING);
    this._requestRetrieve('0');
  },

  _requestRetrieve: function(requestCount) {
    this._apiService
      .request(Tw.API_CMD.BFF_06_0072, { reqCnt: requestCount, shrpotSerNo: this._serialNumber })
      .done($.proxy(this._handleDoneRetrieve, this));
  },

  _handleDoneRetrieve: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || !resp.result) {
      this._setRetrieveStatus();
      return;
    }

    if (resp.result.nextReqYn === 'Y') {
      setTimeout($.proxy(this._requestRetrieve, this, resp.result.reqCnt), 3000);
    } else if (!resp.result.remGbGty && !resp.result.remMbGty) {
      this._setRetrieveStatus($before);
    } else {
      this._handleSuccessRetrieve(resp.result);
    }
  },

  _setRetrieveStatus: function() {
    this.$strong.text(Tw.MYT_DATA_FAMILY_RETRIEVE);
    this.$strong.addClass('fe-retrieve');
    this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.ALERT_2_A218, Tw.POPUP_TITLE.NOTIFY);
  },

  _setDisableChange: function(disabled) {
    this.$input.attr('disabled', disabled);
    this.$container.find('.btn-type01').attr('disabled', disabled);
  },

  _handleSuccessRetrieve: function(share) {
    var nData = Number(share.remGbGty) + Number(share.remMbGty) / 1000 || 0;
    this.$strong.text(nData + 'GB');
    if (nData > 0) {
      this._changable.gb = Number(share.remGbGty);
      this._changable.mb = Number(share.remMbGty);
      this._changable.data = nData;
      this._setDisableChange(false);
    }
  }
};
