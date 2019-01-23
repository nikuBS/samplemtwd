/**
 * FileName: product.common.callplan.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

Tw.ProductCommonCallplan = function(rootEl, prodId, prodTypCd, settingBtnList, lineProcessCase, isPreview) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._popupService = Tw.Popup;
  this._tidLanding = new Tw.TidLandingComponent();
  this._comparePlans = new Tw.ProductMobilePlanComparePlans();
  this._apiService = Tw.Api;

  this._prodId = prodId;
  this._prodTypCd = prodTypCd;
  this._settingBtnList = settingBtnList;
  this._lineProcessCase = lineProcessCase;
  this._isPreview = isPreview === 'Y';

  this._convertSettingBtnList();
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductCommonCallplan.prototype = {

  _settingBtnList: [],

  _init: function() {
    this._contentsDetailList = [];
    this._setContentsDetailList();
    this._showReadyOn();

    if (this._historyService.isBack()) {
      // ICAS, Swing 간 Sync time delay
      Tw.CommonHelper.startLoading('.container', 'grey', true);

      setTimeout($.proxy(function() {
        Tw.CommonHelper.endLoading('.container');
        this._historyService.reload();
      }, this), 2000);
    }
  },

  _cachedElement: function() {
    this.$btnJoin = this.$container.find('.fe-btn_join');
    this.$btnSetting = this.$container.find('.fe-btn_setting');
    this.$btnTerminate = this.$container.find('.fe-btn_terminate');
    this.$btnContentsDetail = this.$container.find('.fe-btn_contents_detail');
    this.$btnReadyOn = this.$container.find('.fe-btn_ready_on');
    this.$comparePlans = this.$container.find('.fe-compare_plans');
    this.$goProd = this.$container.find('.fe-go_prod');

    this.$contentsDetailItem = this.$container.find('.fe-contents_detail_item');
    this.$contents = this.$container.find('.fe-contents');
  },

  _bindEvent: function() {
    this.$btnJoin.on('click', $.proxy(this._goJoinTerminate, this, '01'));
    this.$btnTerminate.on('click', $.proxy(this._goJoinTerminate, this, '03'));
    this.$btnSetting.on('click', $.proxy(this._procSetting, this));
    this.$btnContentsDetail.on('click', $.proxy(this._openContentsDetailPop, this, 'contents_idx'));
    this.$comparePlans.on('click', $.proxy(this._openComparePlans, this));
    this.$goProd.on('click', $.proxy(this._goProd, this));

    this.$container.on('click', '.fe-bpcp', $.proxy(this._detectBpcp, this));
    this.$container.on('click', '.fe-banner_link', $.proxy(this._onBannerLink, this));

    this.$contents.on('click', '[data-contents]', $.proxy(this._openContentsDetailPop, this, 'contents'));
    this.$contents.on('click', '.fe-link-external', $.proxy(this._confirmExternalUrl, this));
    this.$contents.on('click', '.fe-link-internal', $.proxy(this._openInternalUrl, this));

    this.$contents.on('click', '.dmg-contract', $.proxy(this._openCustomPopup, this, 'BS_02_01_02_01'));
    this.$contents.on('click', '.possible-product', $.proxy(this._openCustomPopup, this, 'BS_03_01_01_02'));
    this.$contents.on('click', '.save_pay', $.proxy(this._openCustomPopup, this, 'BS_04_01_01_01'));
  },

  _showReadyOn: function() {
    this.$btnReadyOn.show();
  },

  _goProd: function(e) {
    this._historyService.goLoad($(e.currentTarget).data('prod_id'));
  },

  _convertSettingBtnList: function() {
    if (Tw.FormatHelper.isEmpty(this._settingBtnList)) {
      return;
    }

    this._settingBtnList = JSON.parse(this._settingBtnList).map(function(item) {
      return {
        'url': item.linkUrl,
        'button-attr': 'data-url="' + item.linkUrl + '"',
        'txt': item.linkNm
      };
    });
  },

  _openComparePlans: function() {
    this._comparePlans.openCompare(this._prodId);
  },

  _onBannerLink: function(e) {
    if (Tw.FormatHelper.isEmpty($(e.currentTarget).attr('href').match(/http:\/\/|https:\/\//gi))) {
      return true;
    }

    this._confirmExternalUrl(e);
  },

  _confirmExternalUrl: function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!Tw.BrowserHelper.isApp()) {
      return this._openExternalUrl($(e.currentTarget).attr('href'));
    }

    Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, $(e.currentTarget).attr('href')));
  },

  _openExternalUrl: function(href) {
    this._popupService.close();
    Tw.CommonHelper.openUrlExternal(href);
  },

  _openInternalUrl: function(e) {
    Tw.CommonHelper.openUrlInApp(location.origin + $(e.currentTarget).attr('href'));

    e.preventDefault();
    e.stopPropagation();
  },

  _openCustomPopup: function(hbsCode) {
    this._popupService.open({
      hbs: hbsCode,
      layer: true
    });
  },

  _procSetting: function() {
    if (this._isPreview) {
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.PREVIEW);
      return;
    }

    if (this._settingBtnList.length > 1) {
      this._openSettingPop();
    } else {
      this._historyService.goLoad(this._settingBtnList[0].url + '?prod_id=' + this._prodId);
    }
  },

  _setContentsDetailList: function() {
    _.each(this.$contentsDetailItem, $.proxy(this._pushContentsDetail, this));
  },

  _pushContentsDetail: function(item) {
    var $item = $(item);
    if (Tw.FormatHelper.isEmpty($item.data('title'))) {
      return;
    }

    this._contentsDetailList.push({
      title: $item.data('title'),
      contentsClass: $item.data('class'),
      contents: $item.html()
    });
  },

  _getPreCheckApiReqInfo: function(joinTermCd) {
    var api = null;

    if (['AB', 'C', 'H_P', 'H_A', 'G'].indexOf(this._prodTypCd) !== -1) {
      api = {
        '01': Tw.API_CMD.BFF_10_0007,
        '03': Tw.API_CMD.BFF_10_0151
      };

      return {
        API_CMD: api[joinTermCd],
        PARAMS: {}
      };
    }

    if (['E_I', 'E_P', 'E_T'].indexOf(this._prodTypCd) !== -1) {
      api = {
        '01': Tw.API_CMD.BFF_10_0164,
        '03': Tw.API_CMD.BFF_10_0168
      };

      return {
        API_CMD: api[joinTermCd],
        PARAMS: {}
      };
    }

    if (this._prodTypCd === 'F') {
      return {
        API_CMD: Tw.API_CMD.BFF_10_0119,
        PARAMS: {}
      };
    }

    return null;
  },

  _goJoinTerminate: function(joinTermCd, e) {
    if (this._isPreview) {
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.PREVIEW);
      return;
    }

    var url = $(e.currentTarget).data('url');
    if (url.indexOf('BPCP:') !== -1) {
      return this._getBpcp(url);
    }

    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(this._getSvcInfoRes, this, joinTermCd, url));
  },

  _detectBpcp: function(e) {
    var url = $(e.currentTarget).attr('href');
    if (url.indexOf('BPCP:') === -1) {
      return true;
    }

    this._getBpcp(url);
    e.preventDefault();
    e.stopPropagation();
  },

  _getBpcp: function(url) {
    this._apiService.request(Tw.API_CMD.BFF_01_0039, { bpcpServiceId: url.replace('BPCP:', '') })
      .done($.proxy(this._resBpcp, this));
  },

  _resBpcp: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var url = resp.result.svcUrl;
    if (!Tw.FormatHelper.isEmpty(resp.result.tParam)) {
      url += (url.indexOf('?') !== -1 ? '&tParam=' : '?tParam=') + resp.result.tParam;
    }

    Tw.CommonHelper.openUrlInApp(url);
  },

  _getSvcInfoRes: function(joinTermCd, url, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      return this._tidLanding.goLogin(location.origin + url + '?prod_id=' + this._prodId);
    }

    if (Tw.FormatHelper.isEmpty(resp.result.svcMgmtNum)) {
      this._isGoMemberLine = false;
      return this._popupService.openConfirm(null, Tw.ALERT_MSG_PRODUCT.NEED_LINE,
        $.proxy(this._setGoMemberLine, this), $.proxy(this._onCloseMemberLine, this));
    }

    if (this._lineProcessCase === 'B' || this._lineProcessCase === 'D') {
      return this._procPreCheck(joinTermCd, url);
    }

    this._historyService.goLoad('/product/line-change?p_mod=' + (this._lineProcessCase === 'A' ? 'select' : 'change') +
      '&t_prod_id=' + this._prodId + '&t_url=' + encodeURIComponent(url + '?prod_id=' + this._prodId));
  },

  _procPreCheck: function(joinTermCd, url) {
    var preCheckApi = this._getPreCheckApiReqInfo(joinTermCd);

    if (Tw.FormatHelper.isEmpty(preCheckApi)) {
      return this._procAdvanceCheck(url, null, { code: '00' });
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(preCheckApi.API_CMD, preCheckApi.PARAMS, null, [this._prodId])
      .done($.proxy(this._procAdvanceCheck, this, url, joinTermCd));
  },

  _setGoMemberLine: function() {
    this._isGoMemberLine = true;
    this._popupService.close();
  },

  _onCloseMemberLine: function() {
    if (this._isGoMemberLine) {
      this._historyService.goLoad('/common/member/line');
    }
  },

  _openContentsDetailPop: function(key, e) {
    var $item = $(e.currentTarget),
      contentsIndex = $item.data(key);

    if (Tw.FormatHelper.isEmpty(this._contentsDetailList[contentsIndex])) {
      return;
    }

    this._popupService.open({
      hbs: 'MP_02_02_06',
      layer: true,
      list: this._contentsDetailList
    }, $.proxy(this._focusContentsDetail, this, contentsIndex), null, 'contents_detail');
  },

  _focusContentsDetail: function(contentsIndex, $popupContainer) {
    $popupContainer.scrollTop($popupContainer.find('[data-anchor="contents_' + contentsIndex + '"]').offset().top - 60);
  },

  _openSettingPop: function() {
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data:[
        { 'list': this._settingBtnList }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._bindSettingBtnListEvent, this), $.proxy(this._goSetting, this), 'setting_pop');
  },

  _bindSettingBtnListEvent: function($layer) {
    $layer.find('[data-url]').on('click', $.proxy(this._setSettingGoUrl, this));
  },

  _setSettingGoUrl: function(e) {
    this._settingGoUrl = $(e.currentTarget).data('url');
    this._popupService.close();
  },

  _goSetting: function() {
    if (Tw.FormatHelper.isEmpty(this._settingGoUrl)) {
      return;
    }

    this._historyService.goLoad(this._settingGoUrl + '?prod_id=' + this._prodId);
  },

  _procAdvanceCheck: function(url, joinTermCd, resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(null, resp.msg).pop();
    }

    if (this._prodTypCd === 'F' && resp.result.combiProdScrbYn !== 'N' && joinTermCd === '01') {
      return Tw.Error(null, Tw.ALERT_MSG_PRODUCT.ALERT_ALREADY_PRODUCT).pop();
    }

    if (this._prodTypCd === 'F' && resp.result.combiProdScrbYn !== 'Y' && joinTermCd === '03') {
      return Tw.Error(null, Tw.ALERT_MSG_PRODUCT.ALERT_ALREADY_TERM_PRODUCT).pop();
    }

    this._historyService.goLoad(url + '?prod_id=' + this._prodId);
  }

};
