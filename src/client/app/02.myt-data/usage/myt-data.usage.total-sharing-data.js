/**
 * FileName: myt-data.usage.total-sharing-data.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 10. 08.
 */

Tw.MyTDataUsageTotalSharingData = function (rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._hashService = Tw.Hash;
  this._historyService = new Tw.HistoryService();
  this._options = options;

  this._init();
  this._cachedElement();
  this._bindEvent();
  this._rendered();
};

Tw.MyTDataUsageTotalSharingData.prototype = {

  _init: function() {
    this._myTDataUsageDataShare = new Tw.MyTDataUsageDataShare($('#fe-data-share'));
    this._hashService.initHashNav($.proxy(this._onHashChange, this));
  },

  _onHashChange: function (hash) {
    if ( hash.raw && hash.raw === 'data-share-popup') {
      this._myTDataUsageDataShare.open();
    } else {
      this._myTDataUsageDataShare.close();
    }
  },

  _cachedElement: function () {
    this._$dataSharing = this.$container.find('.fe-data-sharing');
  },

  _bindEvent: function () {

  },

  _rendered: function() {
    if (this._options.dataSharingJoined === 'Y') {
      // 데이터 함께쓰기 가입되어 있는 경우 호출
      this._apiService.request(Tw.API_CMD.BFF_05_0004)
        .done($.proxy(this._onDoneDataSharing, this))
        .fail($.proxy(this._onFailDataSharing, this));

      // this._onDoneDataSharing({
      //   'code': '00',
      //   'msg': 'success',
      //   'result': {
      //     'data': {
      //       'used': '0'
      //     },
      //     'childList': [
      //       {
      //         'svcNum': '****',
      //         'svcMgmtNum': '7265407272',
      //         'feeProdId': 'NA00004046',
      //         'feeProdNm': 'LTE함께쓰기Basic(스마트폰)',
      //         'auditDtm': '20160303'
      //       }
      //     ]
      //   }
      // });
    }
  },

  _onDoneDataSharing: function(resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if (resp.result.data) {
        var usedData = Tw.FormatHelper.convDataFormat(resp.result.data.used, '140');
        this._$dataSharing.find('.data-txt').text('총 '+ usedData.data + (usedData.unit || '') + ' 사용');
      }
    } else {
      this._popupService.openAlert(resp.msg, resp.code);
    }
  },

  _onFailDataSharing: function (resp) {
    this._popupService.openAlert(resp.msg, resp.code);
  }
};
