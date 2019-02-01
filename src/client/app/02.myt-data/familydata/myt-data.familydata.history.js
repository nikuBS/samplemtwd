/**
 * FileName: myt-data.familydata.history.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2019.01.21
 */

Tw.MyTDataFamilyHistory = function(rootEl, histories) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._histories = histories;

  this._bindEvent();
  this._init();
};

Tw.MyTDataFamilyHistory.prototype = {
  _init: function() {
    this._ingTmpl = Handlebars.compile($('#fe-tmpl-ing').html());
    this._afterTmpl = Handlebars.compile($('#fe-tmpl-after').html());
    this._noneTmpl = Handlebars.compile($('#fe-tmpl-after-none').html());
  },

  _bindEvent: function() {
    this.$container.on('click', '.fe-before', $.proxy(this._handleRetrieveData, this));
    this.$container.on('click', '.fe-edit', $.proxy(this._handleClickEditData, this));
  },

  _handleRetrieveData: function(e) {
    var $target = $(e.currentTarget),
      serialNumber = $target.data('serial-number'),
      $parent = $target.parent('li');

    $target.addClass('none');
    $parent.append(this._ingTmpl());
    this._requestRetrieve(serialNumber, '0', $target, $parent);
  },

  _requestRetrieve: function(serialNumber, requestCount, $before, $parent) {
    this._apiService
      .request(Tw.API_CMD.BFF_06_0072, { reqCnt: requestCount, shrpotSerNo: serialNumber })
      .done($.proxy(this._handleDoneRetrieve, this, serialNumber, $before, $parent));
  },

  _handleDoneRetrieve: function(serialNumber, $before, $parent, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || !resp.result) {
      this._setRetrieveStatus($before);
      return;
    }

    if (resp.result.nextReqYn === 'Y') {
      setTimeout($.proxy(this._requestRetrieve, this, serialNumber, resp.result.reqCnt, $before, $parent), 3000);
    } else if (!resp.result.remGbGty && !resp.result.remMbGty) {
      this._setRetrieveStatus($before);
    } else {
      this._handleSuccessRetrieve(resp.result, $before, $parent);
    }
  },

  _setRetrieveStatus: function($before) {
    $before.removeClass('none');
    $before.siblings('.fe-ing').addClass('none');
    this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.ALERT_2_A218, Tw.POPUP_TITLE.NOTIFY);
  },

  _handleSuccessRetrieve: function(share, $before, $parent) {
    var serial = $before.data('serial-number');
    $before.siblings('.fe-ing').remove();

    var nData = Number(share.remGbGty) + Number(share.remMbGty) / 1000 || 0;
    if (nData > 0) {
      $parent.append(this._afterTmpl({ data: nData, serial: serial, gb: share.remGbGty, mb: share.remMbGty }));
    } else {
      $parent.append(this._noneTmpl({}));
    }
  },

  _handleClickEditData: function(e) {
    var $target = $(e.currentTarget),
      $parent = $target.closest('li'),
      idx = $parent.data('idx') || 0,
      serial = $target.data('serial-number'),
      changable = {
        gb: $target.data('gb'),
        mb: $target.data('mb')
      };

    changable.data = changable.gb + changable.mb / 1000 || 0;

    if (serial) {
      this._apiService
        .request(Tw.API_CMD.BFF_06_0073, { shrpotSerNo: serial })
        .done($.proxy(this._handleDoneGetHistories, this, $parent, serial, idx, changable));
    }
  },

  _handleDoneGetHistories: function($parent, serial, idx, changable, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var detail = this._histories[idx];
    var histories = _.map(resp.result.cancelSharePot || [], function(history) {
      history.cancelAplyDt = Tw.DateHelper.getShortDate(history.cancelAplyDt);
      return history;
    });

    this._popupService.open(
      {
        hbs: 'DC_02_04_01',
        layer: true,
        detail: detail,
        data: changable.data,
        histories: histories
      },
      $.proxy(this._handleOpenChangePopup, this, $parent, serial, changable),
      $.proxy(this._handleCloseChangePopup, this)
    );
  },

  _handleCloseChangePopup: function() {
    if (this._historyChange.isSuccess) {
      this._historyChange.isSuccess = false;
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
  },

  _handleOpenChangePopup: function($parent, serial, changable, $layer) {
    this._historyChange = new Tw.MyTDataFamilyHistoryChange($layer, $parent, serial, changable);
    $layer.on('click', '.prev-step', $.proxy(this._openCancelPopup, this));
  },

  _openCancelPopup: function() {
    this._popupService.openConfirmButton(
      Tw.ALERT_CANCEL,
      null,
      $.proxy(this._goBack, this),
      $.proxy(this._handleAfterClose, this),
      Tw.BUTTON_LABEL.NO,
      Tw.BUTTON_LABEL.YES
    );
  },

  _goBack: function() {
    this._popupService.close();
    this._isClose = true;
  },

  _handleAfterClose: function() {
    if (this._isClose) {
      history.back();
      this._isClose = false;
    }
  }
};
