/**
 * FileName: myt-fare.bill.set.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018. 9. 13
 */
Tw.MyTFareBillSet = function (rootEl) {
  this.$container = rootEl;
  this._init();
};

Tw.MyTFareBillSet.prototype = {
  _init : function() {
    this._initVariables();
    this._bindEvent();

  },
  _initVariables: function () {

  },
  _bindEvent: function () {
    this.$container.on('click', '#fe-app-down', $.proxy(this._onDownload, this));
  },

  _onDownload : function () {
    var url =  Tw.BrowserHelper.isAndroid() ? Tw.URL_PATH.BILL_LETTER_DOWNLOAD_PLAY_STORE:Tw.URL_PATH.BILL_LETTER_DOWNLOAD_APP_STORE;
    Tw.CommonHelper.openUrlExternal(url,'');
  },

  // API Fail
  _onFail: function (err) {
    Tw.Error(err.code,err.msg).pop();
  }
};
