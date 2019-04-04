/**
 * @file bpcp.service.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.05
 */

Tw.BpcpService = function() {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._tidLanding = new Tw.TidLandingComponent();
  this._bpcpServiceId = null;
  this._currentHistoryLength = 0;
};

Tw.BpcpService.prototype = {

  _responseBPCP: function(resp) {
    if (resp.code === 'BFF0003') {
      return this._tidLanding.goLogin(this._pathUrl + (this._pathUrl.indexOf('?') === -1 ? '?' : '&') + 'bpcpServiceId=' + this._bpcpServiceId);
    }

    if (resp.code === 'BFF0504') {
      return this._onBlockBpcp(resp);
    }

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._onSuccessBpcpPop(resp);
  },

  _onBlockBpcp: function(resp) {
    var msg = resp.msg.match(/\(.*\)/);
    msg = msg && msg.length > 0 ? msg.pop().match(/(\d+)/) : '';

    var fromDtm = Tw.FormatHelper.isEmpty(msg[0]) ? null : Tw.DateHelper.getShortDateWithFormat(msg[0].substr(0, 8), 'YYYY.M.D.'),
      toDtm = Tw.FormatHelper.isEmpty(msg[1]) ? null : Tw.DateHelper.getShortDateWithFormat(msg[1].substr(0, 8), 'YYYY.M.D.'),
      serviceBlock = { hbs: 'service-block' };

    if (!Tw.FormatHelper.isEmpty(fromDtm) && !Tw.FormatHelper.isEmpty(toDtm)) {
      serviceBlock = $.extend(serviceBlock, { fromDtm: fromDtm, toDtm: toDtm });
    }

    this._popupService.open(serviceBlock, null, $.proxy(this._onCloseBpcpPop, this));
  },

  _onSuccessBpcpPop: function(resp) {
    var url = $.trim(resp.result.svcUrl);
    if (Tw.FormatHelper.isEmpty(url)) {
      return Tw.Error(null, Tw.ALERT_MSG_PRODUCT.BPCP).pop();
    }

    if (!Tw.FormatHelper.isEmpty(resp.result.tParam)) {
      url += (url.indexOf('?') !== -1 ? '&tParam=' : '?tParam=') + resp.result.tParam;
    }

    url += '&ref_poc=' + (Tw.BrowserHelper.isApp() ? 'app' : 'mweb');
    url += '&ref_origin=' + encodeURIComponent(location.origin);

    if (this._isReplace) {
      return this._historyService.replaceURL(url);
    }

    this._historyService.goLoad(url);
  },

  _onCloseBpcpPop: function() {
    if (this._isOnCloseBack) {
      return this._historyService.goBack();
    }

    this._historyService.replaceURL(this._pathUrl);
  },

  isBpcp: function(url) {
    return url && url.indexOf('BPCP:') !== -1;
  },

  setData: function(rootEl, pathUrl, isOnCloseBack, isReplace) {
    this.$container = rootEl;
    this._isOnCloseBack = isOnCloseBack || false;
    this._isReplace = isReplace || false;
    this._pathUrl = pathUrl;
    this._currentHistoryLength = history.length - 1;
  },

  open: function(url, svcMgmtNum, eParam) {
    var bpcpServiceId = url.replace('BPCP:', ''),
      reqParams = {
      bpcpServiceId: bpcpServiceId
    };

    this._bpcpServiceId = bpcpServiceId;

    if (!Tw.FormatHelper.isEmpty(svcMgmtNum)) {
      reqParams.svcMgmtNum = svcMgmtNum;
    }

    if (!Tw.FormatHelper.isEmpty(eParam)) {
      reqParams.eParam = eParam;
    }

    this._apiService.request(Tw.API_CMD.BFF_01_0039, reqParams)
      .done($.proxy(this._responseBPCP, this));
  }

};
