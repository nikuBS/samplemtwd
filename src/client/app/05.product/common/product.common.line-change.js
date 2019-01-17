/**
 * FileName: product.common.line-change.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.01.17
 */

Tw.ProductCommonLineChange = function(rootEl, prodTypCd, pageMode, targetProdId, targetUrl, currentSvcMgmtNum) {

  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._prodTypCd = prodTypCd;
  this._pageMode = pageMode;
  this._targetProdId = targetProdId;
  this._targetUrl = targetUrl;
  this._currentSvcMgmtNum = currentSvcMgmtNum;
  this._svcMgmtNum = currentSvcMgmtNum;
  this._page = 1;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductCommonLineChange.prototype = {

  _init: function() {
    if (this._historyService.isBack()) {
      this._historyService.goBack();
    }

    if (this._pageMode === 'select' && this.$lineList.find('input[type=radio][value="' + this._svcMgmtNum + '"]').length > 0) {
      this.$lineList.find('input[type=radio][value="' + this._svcMgmtNum + '"]').trigger('click');
    }
  },

  _cachedElement: function() {
    this.$lineList = this.$container.find('.fe-line_list');
    this.$lineRadio = this.$lineList.find('input[type=radio]');
    this.$btnMore = this.$container.find('.fe-btn_more');
    this.$btnOk = this.$container.find('.fe-btn_ok');
  },

  _bindEvent: function() {
    this.$lineRadio.on('change', $.proxy(this._enableSetupButton, this));
    this.$btnMore.on('click', $.proxy(this._showMoreList, this));
    this.$btnOk.on('click', $.proxy(this._procApply, this));
  },

  _enableSetupButton: function() {
    this.$btnOk.removeAttr('disabled').prop('disabled', false);
  },

  _showMoreList: function() {
    var idxLimit = this._page * 20;
    $.each(this.$lineList, function(elem, idx) {
      if (idx > idxLimit) {
        return false;
      }

      $(elem).show();
    });

    this._page++;
    if (this.$lineList.find('li:not(:visible)').length < 1) {
      this.$btnMore.remove();
    }
  },

  _goBack: function() {
    this._historyService.goBack();
  },

  _procApply: function() {
    this._svcMgmtNum = this.$lineList.find('input[type=radio]:checked').val();

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    if (this._svcMgmtNum !== this._currentSvcMgmtNum) {
      return this._procLineChange();
    }

    this._procPreCheck();
  },

  _procLineChange: function() {
    var lineService = new Tw.LineComponent();
    lineService.changeLine(this._svcMgmtNum, null, $.proxy(this._procPreCheck, this));
  },

  _getPreCheckApi: function() {
    if (['AB', 'C', 'H_P', 'H_A', 'G'].indexOf(this._prodTypCd) !== -1) {
      return Tw.API_CMD.BFF_10_0007;
    }

    if (['E_I', 'E_P', 'E_T'].indexOf(this._prodTypCd) !== -1) {
      return Tw.API_CMD.BFF_10_0164;
    }

    if (this._prodTypCd === 'F') {
      return Tw.API_CMD.BFF_10_0119;
    }

    return null;
  },

  _procPreCheck: function() {
    var preCheckApi = this._getPreCheckApi();

    if (Tw.FormatHelper.isEmpty(preCheckApi)) {
      return this._procPreCheckRes({ code: '00' });
    }

    this._apiService.request(preCheckApi, {}, null, [this._targetProdId])
      .done($.proxy(this._procPreCheckRes, this));
  },

  _procPreCheckRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(null, resp.msg).pop();
    }

    if (this._prodTypCd === 'F' && resp.result.combiProdScrbYn !== 'N') {
      return Tw.Error(null, Tw.ALERT_MSG_PRODUCT.ALERT_ALREADY_PRODUCT).pop();
    }

    this._historyService.goLoad(this._targetUrl);
  }

};
