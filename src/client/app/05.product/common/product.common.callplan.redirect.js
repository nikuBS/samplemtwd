/**
 * FileName: product.common.callplan.redirect.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.12.04
 */

Tw.ProductCommonCallplanRedirect = function(prodId, svcMgmtNum, redirectUrl) {
  this._redirectUrl = redirectUrl;

  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;

  this._prodId = prodId;
  this._svcMgmtNum = svcMgmtNum;

  $(window).on(Tw.INIT_COMPLETE, $.proxy(this._openConfirm, this));
  $(window).on('message', $.proxy(this._getWindowMessage, this));
};

Tw.ProductCommonCallplanRedirect.prototype = {

  _openConfirm: function() {
    if (this._prodId === 'TW20000019') {
      return this._openDataCharge();
    }

    if (!Tw.BrowserHelper.isApp()) {
      this._isConfirm = true;
      return this._procRedirect();
    }

    Tw.CommonHelper.showDataCharge($.proxy(this._setConfirm, this), $.proxy(this._procRedirect, this));
  },

  _setConfirm: function() {
    this._isConfirm = true;
    this._popupService.close();
  },

  _procRedirect: function() {
    if (!this._isConfirm) {
      return this._historyService.goBack();
    }

    Tw.CommonHelper.openUrlExternal(this._redirectUrl);
    this._back();
  },

  _openDataCharge: function() {
    this._getBpcp(Tw.OUTLINK.DATA_COUPON.DATA_FACTORY);
  },

  _getBpcp: function(url) {
    var reqParams = {
      svcMgmtNum: this._svcMgmtNum,
      bpcpServiceId: url.replace('BPCP:', '')
    };

    this._apiService.request(Tw.API_CMD.BFF_01_0039, reqParams)
      .done($.proxy(this._resBpcp, this));
  },

  _resBpcp: function(resp) {
    if (resp.code === 'BFF0003') {
      return this._tidLanding.goLogin(location.origin + '/product/callplan?prod_id=' + this._prodId);
    }

    if (resp.code === 'BFF0504') {
      var msg = resp.msg.match(/\(.*\)/);
      msg = msg && msg.length > 0 ? msg.pop().match(/(\d+)/) : '';

      var fromDtm = Tw.FormatHelper.isEmpty(msg[0]) ? null : Tw.DateHelper.getShortDateWithFormat(msg[0].substr(0, 8), 'YYYY.M.D.'),
        toDtm = Tw.FormatHelper.isEmpty(msg[1]) ? null : Tw.DateHelper.getShortDateWithFormat(msg[1].substr(0, 8), 'YYYY.M.D.'),
        serviceBlock = { hbs: 'service-block' };

      if (!Tw.FormatHelper.isEmpty(fromDtm) && !Tw.FormatHelper.isEmpty(toDtm)) {
        serviceBlock = $.extend(serviceBlock, { fromDtm: fromDtm, toDtm: toDtm });
      }

      return this._popupService.open(serviceBlock, null, $.proxy(this._back, this));
    }

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop($.proxy(this._back, this));
    }

    var url = $.trim(resp.result.svcUrl);
    if (Tw.FormatHelper.isEmpty(url)) {
      return Tw.Error(null, Tw.ALERT_MSG_PRODUCT.BPCP).pop($.proxy(this._back, this));
    }

    if (!Tw.FormatHelper.isEmpty(resp.result.tParam)) {
      url += (url.indexOf('?') !== -1 ? '&tParam=' : '?tParam=') + resp.result.tParam;
    }

    url += '&ref_poc=' + (Tw.BrowserHelper.isApp() ? 'app' : 'mweb');
    url += '&ref_origin=' + encodeURIComponent(location.origin);

    this._popupService.open({
      hbs: 'product_bpcp',
      iframeUrl: url
    }, null, $.proxy(this._back, this), 'bpcp_pop');
  },

  _getWindowMessage: function(e) {
    var data = e.data || e.originalEvent.data;

    if (Tw.FormatHelper.isEmpty(data)) {
      return;
    }

    // BPCP 팝업 닫기
    if (data === 'popup_close') {
      this._popupService.closeAll();
      this._back();
    }

    // BPCP 팝업 닫고 링크 이동
    if (data.indexOf('goLink:') !== -1) {
      this._popupService.closeAllAndGo(data.replace('goLink:', ''));
    }

    // BPCP 팝업 닫고 로그인 호출
    if (data.indexOf('goLogin:') !== -1) {
      this._tidLanding.goLogin('/product/callplan?prod_id=' + this._prodId + '&' + $.param(JSON.parse(data.replace('goLogin:', ''))));
    }

    // BPCP 에서 외부 팝업창 호출하고자 할떄
    if (data.indexOf('outlink:') !== -1) {
      var url = data.replace('outlink:', '');
      if (!Tw.BrowserHelper.isApp()) {
        return Tw.CommonHelper.openUrlExternal(url);
      }

      Tw.CommonHelper.showDataCharge($.proxy(Tw.CommonHelper.openUrlExternal(url), this));
    }
  },

  _back: function() {
    setTimeout(function() {
      this._historyService.goBack();
    }.bind(this), 100);
  }

};
