Tw.BpcpService = function() {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._tidLanding = new Tw.TidLandingComponent();
  this._bpcpServiceId = null;
  this._currentHistoryLength = 0;
  this._bindEvent();
};

Tw.BpcpService.prototype = {

  _bindEvent: function() {
    $(window).on('message', $.proxy(this._getWindowMessage, this));
  },

  _getWindowMessage: function(e) {
    var data = e.data || e.originalEvent.data;
    if (Tw.FormatHelper.isEmpty(data) || typeof(data) !== 'string') {
      return;
    }

    // BPCP 팝업 닫기
    if (data === 'popup_close') {
      this._popupService.closeAll();
    }

    // BPCP 팝업 닫고 링크 이동
    if (data.indexOf('goLink:') !== -1) {
      this._popupService.closeAllAndGo(data.replace('goLink:', ''));
    }

    // BPCP 팝업 닫고 로그인 호출
    if (data.indexOf('goLogin:') !== -1) {
      this._tidLanding.goLogin(location.origin + this._pathUrl + '&' + $.param(JSON.parse(data.replace('goLogin:', ''))));
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

  _responseBPCP: function(event, resp) {
    if (resp.code === 'BFF0003') {
      return this._tidLanding.goLogin(location.origin + this._pathUrl);
    }

    if (resp.code === 'BFF0504') {
      return this._onBlockBpcp(resp);
    }

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._onSuccessBpcpPop(resp, event);
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

    this._popupService.open(serviceBlock);
  },

  _onSuccessBpcpPop: function(resp, event) {
    var url = $.trim(resp.result.svcUrl);
    if (Tw.FormatHelper.isEmpty(url)) {
      return Tw.Error(null, Tw.ALERT_MSG_PRODUCT.BPCP).pop();
    }

    if (!Tw.FormatHelper.isEmpty(resp.result.tParam)) {
      url += (url.indexOf('?') !== -1 ? '&tParam=' : '?tParam=') + resp.result.tParam;
    }

    url += '&ref_poc=' + (Tw.BrowserHelper.isApp() ? 'app' : 'mweb');
    url += '&ref_origin=' + encodeURIComponent(location.origin);

    if (Tw.BrowserHelper.isIos()) {
      return this._historyService.goLoad(url);
    }

    this._popupService.open({
        hbs: 'product_bpcp',
        iframeUrl: url
      }, $.proxy(this._onOpenBpcpPop, this), $.proxy(this._onCloseBpcpPop, this),
      null, (event ? $(event.currentTarget) : null));
  },

  _onOpenBpcpPop: function() {
    if (!Tw.FormatHelper.isEmpty(this.$container)) {
      this.$container.find('#header, #contents, #gnb').hide();
    }
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

  setData: function(rootEl, pathUrl, isOnCloseBack) {
    this.$container = rootEl;
    this._isOnCloseBack = isOnCloseBack || false;
    this._pathUrl = pathUrl;
    this._currentHistoryLength = history.length - 1;
  },

  open: function(url, svcMgmtNum, eParam, event) {
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
      .done($.proxy(this._responseBPCP, this, event));
  }

};
