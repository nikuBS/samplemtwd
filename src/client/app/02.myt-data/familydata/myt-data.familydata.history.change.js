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
    this.$input.on('focusout', $.proxy(this._validateChangeAmount, this));
    this.$input.on('keyup', $.proxy(this._validateChangeAmount, this));
    this.$submitBtn.on('click', $.proxy(this._clickSubmit, this));
  },

  _cachedElement: function() {
    this.$input = this.$container.find('#fe-changable');
    this.$submitBtn = this.$container.find('#fe-submit');
    this.$error = this.$container.find('#fe-error');
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

    this._popupService.closeAll();

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
    // TODO: error 코드 처리 필요
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    } else {
      this.$item.find('.modify strong').text(remain + 'GB');
      if (remain > 0) {
        this.$item.find('.fe-edit').data('gb', remain);
      } else {
        this.$item.find('.fe-edit').remove();
        this.$item.find('.modify span').text(Tw.MYT_DATA_FAMILY_NOT_POSSIBLE_CHANGE);
      }

      this._popupService.open(
        {
          hbs: 'complete',
          text: Tw.MYT_DATA_FAMILY_SUCCESS_CHANGE_DATA,
          layer: true
        },
        $.proxy(this._handleOpenComplete, this)
      );
    }
  },

  _handleOpenComplete: function($layer) {
    $layer.on('click', '.fe-submain', this._popupService.close);
  }
};
