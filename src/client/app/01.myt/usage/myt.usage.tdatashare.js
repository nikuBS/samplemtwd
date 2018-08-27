/**
 * FileName: myt.usage.tdatashare.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.27
 */

Tw.MyTUsageTdatashare = function (rootEl) {
  this.$container = rootEl;
  this.$window = window;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._LENGTH_PER_PAGE = 5;
  this._loadedItemLength = 0;

  this._assign();
  this._bindEvent();
  this._init();
};

Tw.MyTUsageTdatashare.prototype = {
  _assign: function () {
    this._$childItemTmpl = $('#fe-child-item');
    this._$childListWrap = this.$container.find('.fe-child-list');
    this._$btMoreWrap = this.$container.find('.bt-more-wrap');
  },

  _bindEvent: function () {
    this.$container.on('click', '.bt-more-wrap', $.proxy(this._onClickMoreBtn, this));
    this.$container.on('click', '.fe-btn-opmd-basic', $.proxy(this._onClickBtnInfoAlert, this,
      Tw.MSG_MYT.TDATA_SHARE.M01_TITLE, Tw.MSG_MYT.TDATA_SHARE.M01_CONTENTS));
    this.$container.on('click', '.fe-btn-tot-shar', $.proxy(this._onClickBtnInfoAlert, this,
      Tw.MSG_MYT.TDATA_SHARE.M02_TITLE, Tw.MSG_MYT.TDATA_SHARE.M02_CONTENTS));
  },

  _init: function () {
    this._request();
  },

  _request: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0005)
      .done($.proxy(this._requestDone, this))
      .fail($.proxy(this._requestFail, this));
  },

  _requestDone: function (resp) {
    if ( resp.code === '00' ) {
      this._setData(resp);
    } else {
      this._showErrorAlert(resp.code + ' ' + resp.msg);
    }
  },

  _requestFail: function (resp) {
    this._showErrorAlert(resp.code + ' ' + resp.msg);
  },

  _onClickMoreBtn: function () {
    this._setChildListData();
  },

  _onClickBtnInfoAlert: function (title2, contents) {
    this._popupService.open({
      title: Tw.POPUP_TITLE.GUIDE,
      close_bt: true,
      title2: title2,
      bt_num: 'one',
      contents: contents,
      type: [{
        style_class: 'bt-red1 tw-popup-confirm',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    });
  },

  _setData: function (resp) {
    var result = this._getResult(resp);
    if ( !result ) {
      return;
    }
    this.childList = result.childList;
    this._setChildListData();
  },

  _setChildListData: function () {
    var source = this._$childItemTmpl.html();
    for ( var i = 0; i < this._LENGTH_PER_PAGE; i++ ) {
      var child = this.childList[this._loadedItemLength];
      if ( !child ) {
        break;
      }
      var template = Handlebars.compile(source);
      var html = template(child);
      this._$childListWrap.append(html);
      ++this._loadedItemLength;
    }
    if ( _.size(this.childList) > this._loadedItemLength ) {
      this._$btMoreWrap.show();
    } else {
      this._$btMoreWrap.hide();
    }

  },

  _getResult: function (resp) {
    if (!Tw.FormatHelper.isEmpty(resp.result) ) {
      return this._parseData(resp.result);
    }
  },

  _parseData: function (result) {
    if ( !Tw.FormatHelper.isEmpty(result.childList) ) {
      // var tmpArr = [];
      // for (var i = 0; i < 18; i++) {
      //   tmpArr.push(_.clone(result.childList[0]));
      // }
      // result.childList = tmpArr;
      _.map(result.childList, function (child, idx) {
        child.idx = idx;
        child.useAmt = Tw.FormatHelper.convDataFormat(child.useAmt, Tw.DATA_UNIT.KB);
        child.svcScrbDt = Tw.DateHelper.getShortDateNoDot(child.svcScrbDt);

        // 사용중인 경우
        child.using = result.isAdultInd === 'T' && child.svcStCd === Tw.TDATA_SHARE_SVC_ST_CD.AC;
        // 분실신고된 경우
        child.doLostReport = result.isAdultInd === 'T' && child.eqpMgmtStCd === Tw.TDATA_SHARE_EQPMGMT_ST_CD['09'];
        return child;
      });
    }
    return result;
  }

};