/**
 * FileName: myt-data.familydata.history.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2019.01.21
 */

Tw.MyTDataFamilyHistory = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

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
    this._requestRetrieve(serialNumber, 0, $target, $parent);
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
    if (!share.remGbGty || share.remGbGty.length === 0) {
      this._setRetrieveStatus($before);
      return;
    }

    var serial = $before.data('serial-number');
    $before.siblings('.fe-ing').remove();

    var nData = Number(share.remGbGty) || 1;
    if (nData > 0) {
      $parent.append(this._afterTmpl({ data: nData, serial: serial }));
    } else {
      $parent.append(this._noneTmpl({}));
    }
  },

  _handleClickEditData: function(e) {
    // e.currentTarget.getAttribute('data-serial-number');
  }
};
