/**
 * @file myt-data.familydata.share.immediately.js
 * @author Jiyoung Jo
 * @since 2018.10.04
 */

Tw.MyTDataFamilyShareImmediately = function($wrap, tabId) {
  this.$wrap = $wrap;
  this.$container = $wrap.find('#' + tabId);
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataFamilyShareImmediately.prototype = {
  _init: function() {
    this.MAIN_URL = '/myt-data/familydata';
    this._getShareData(0);
    new Tw.MyTDataFamilyShare(this.$container, this.$submit);
  },

  _cachedElement: function() {
    this.$submit = this.$wrap.find('#fe-submit-immediatly button');
    this.$amountInput = this.$container.find('.fe-amount');
    this.$amount = this.$container.find('.pt10 > .txt-c1');
    this.$retrieveBtn = this.$container.find('#fe-retrieve');
  },

  _bindEvent: function() {
    // $('.wrap').on('click', '.prev-step', $.proxy(this._openCancelPopup, this));
    this.$submit.on('click', $.proxy(this._confirmSubmit, this));
    this.$retrieveBtn.on('click', $.proxy(this._handleClickRetrive, this));
  },

  _handleClickRetrive: function() {
    this.$container.find('#fe-ing').removeClass('none');
    this.$retrieveBtn.addClass('none');
    this._getShareData(0);
  },

  _getShareData: function(requestCount) {
    this._apiService.request(Tw.API_CMD.BFF_06_0045, { reqCnt: String(requestCount) }).done($.proxy(this._handleDoneShareData, this));
  },

  _handleDoneShareData: function(resp) {
    if (resp.code === 'ZORDC1020') {
      this._setRetrieveStatus();
    } else if (resp.code === 'RCG0042') {
      this._successGetShareData({ tFmlyShrblQty: '0' });
    } else if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
    } else if (resp.result) {
      if (resp.result.nextReqYn !== 'Y') {
        this._successGetShareData(resp.result);
      } else {
        setTimeout($.proxy(this._getShareData, this, resp.result.reqCnt), 3000);
      }
    }
  },

  _setRetrieveStatus: function() {
    this.$container.find('#fe-ing').addClass('none');
    this.$retrieveBtn.removeClass('none');
    this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.ALERT_2_A216, Tw.POPUP_TITLE.NOTIFY, undefined, undefined, undefined, this.$retrieveBtn);
  },

  _successGetShareData: function(share) {
    var amount = Number(share.tFmlyShrblQty) || 0;
    if (share.tFmlyShrblQty) {
      if (amount >= 1) {
        this.$container.find('#fe-ing').addClass('none');
        this.$amountInput.attr('data-share-amount', amount);
        this.$amount.text(amount + Tw.DATA_UNIT.GB);
        this.$container.find('.txt-c2').text(amount + Tw.DATA_UNIT.GB);
        this.$amount.removeClass('none');
        this.$container.find('.btn-type01').removeAttr('disabled');
        this.$amountInput.removeAttr('disabled');
      } else {
        this.$container
          .find('#fe-share')
          .addClass('none')
          .attr('aria-hidden', true);
        this.$container.find('.fe-submit').remove();
        this.$container
          .find('#fe-share-none')
          .removeClass('none')
          .attr('aria-hidden', false);
      }
    } else {
      setTimeout($.proxy(this._setRetrieveStatus, this), 3000);
    }
  },

  _confirmSubmit: function(e) {
    var POPUP = Tw.MYT_DATA_FAMILY_CONFIRM_SHARE;
    this._popupService.openModalTypeA(
      POPUP.TITLE,
      POPUP.CONTENTS.replace('{data}', this.$amountInput.val()),
      POPUP.BTN_NAME,
      null,
      $.proxy(this._handleSubmit, this),
      undefined,
      undefined,
      undefined,
      $(e.currentTarget)
    );
  },

  _handleSubmit: function() {
    this._popupService.close();
    Tw.CommonHelper.startLoading('.container', 'grey');
    this._apiService
      .request(Tw.API_CMD.BFF_06_0046, { dataQty: this.$amountInput.val() })
      .done($.proxy(this._handleSuccessSubmit, this))
      .fail($.proxy(this._fail, this));
  },

  _handleSuccessSubmit: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.CommonHelper.endLoading('.container');
      Tw.Error(resp.code, resp.msg).pop();
    } else {
      var ALERT = Tw.MYT_DATA_FAMILY_SUCCESS_SHARE;
      setTimeout(
        $.proxy(function() {
          Tw.CommonHelper.endLoading('.container');
          this._popupService.afterRequestSuccess(this.MAIN_URL, this.MAIN_URL, undefined, ALERT.TITLE, undefined);
        }, this),
        3000
      );
    }
  },

  _fail: function() {
    Tw.CommonHelper.endLoading('.container');
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  }

  // _openCancelPopup: function() {
  //   this._popupService.openConfirmButton(
  //     Tw.ALERT_CANCEL,
  //     null,
  //     $.proxy(this._goBack, this),
  //     $.proxy(this._handleAfterClose, this),
  //     Tw.BUTTON_LABEL.NO,
  //     Tw.BUTTON_LABEL.YES
  //   );
  // },

  // _goBack: function() {
  //   this._popupService.close();
  //   this._isClose = true;
  // },

  // _handleAfterClose: function() {
  //   if (this._isClose) {
  //     history.back();
  //     this._isClose = false;
  //   }
  // }
};
