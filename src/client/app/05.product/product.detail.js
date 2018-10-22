/**
 * FileName: product.detail.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

Tw.ProductDetail = function(rootEl) {
  this.$container = rootEl;
  this._template = Handlebars.compile($('#tpl_recommended_rate_item').html());
  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._apiService = Tw.Api;
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductDetail.prototype = {

  _settingAuthList: ['NA00000291', 'NA00000273', 'NA00002121'],  // @todo 인증API 완료 후 삭제
  _settingBtnList: [],

  _init: function() {
    this._prodId = this.$container.data('prod_id');
    this._ctgCd = this.$container.data('ctg_cd');
    this._ctgKey = this.$container.data('ctg_key');
    this._filterIds = this.$container.data('filter_ids');

    this._loadRecommendedrateList();
    this._setSettingBtnList();
  },

  _cachedElement: function() {
    this.$btnList = this.$container.find('.fe-btn_list');
    this.$btnJoin = this.$container.find('.fe-btn_join');
    this.$btnSetting = this.$container.find('.fe-btn_setting');
    this.$btnTerminate = this.$container.find('.fe-btn_terminate');
    this.$btnRecommendRateListMore = this.$container.find('.fe-btn_recommended_rate_list_more');
    this.$btnRecommendProd = this.$container.find('.fe-btn_recommend_prod');

    this.$recommendRateList = this.$container.find('.fe-recommended_rate_list');
    this.$settingBtnList = this.$container.find('.fe-setting_btn_list');
  },

  _bindEvent: function() {
    this.$btnList.on('click', 'button', $.proxy(this._goBtnLink, this));
    this.$btnJoin.on('click', $.proxy(this._goJoinTerminate, this, '01'));
    this.$btnTerminate.on('click', $.proxy(this._goJoinTerminate, this, '03'));
    this.$btnSetting.on('click', $.proxy(this._procSetting, this));
    this.$btnRecommendRateListMore.on('click', $.proxy(this._goRecommendRateMoreList, this));
    this.$btnRecommendProd.on('click', $.proxy(this._goRecommendProd, this));
  },

  _getJoinTermCd: function(typcd) {
    if (typcd === 'SC') {
      return '01';
    }

    if (typcd === 'TE') {
      return '03';
    }

    return null;
  },

  _procSetting: function() {
    // @todo CBT 범위 제외
    // if (this._settingAuthList.indexOf(this._prodId) !== -1) {
    //   return this._procSettingAuth();
    // }

    if (this._settingBtnList.length > 1) {
      this._openSettingPop();
    } else {
      this._historyService.goLoad(this._settingBtnList[0].url);
    }
  },

  _procSettingAuth: function() {
    this._apiService.request(Tw.NODE_CMD.GET_ALL_SVC)
      .done($.proxy(this._openAuthPopup, this));
  },

  _openAuthPopup: function(resp) {
    this._popupService.open({
      hbs: 'MV_01_02_02_07',
      layer: true,
      data: [{
        svcNumMask: resp.result.svcNum
      }]
    }, $.proxy(this._settingAuthPopupBindEvent, this), null, 'setting_auth_pop');
  },

  _setSettingBtnList: function() {
    _.each(this.$settingBtnList.find('li'), $.proxy(this._pushSettingBtn, this));
  },

  _pushSettingBtn: function(btn) {
    var $btn = $(btn);
    this._settingBtnList.push({
      value: $btn.text(),
      url: $btn.data('url'),
      attr: 'data-url="' + $btn.data('url') + '"'
    });
  },

  _settingAuthPopupBindEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_get_auth_code', $.proxy(this._sendAuthSms, this, $popupContainer));
    $popupContainer.on('click', '.fe-btn_confirm_auth_code', $.proxy(this._confirmAuthCode, this, $popupContainer));
  },

  _sendAuthSms: function($popupContainer) {
    this._apiService.request(Tw.API_CMD.BFF_01_0014, {
      jobCode: 'NFM_TWD_MBIMASK_AUTH'
    }).done($.proxy(this._sendAuthSmsResult, this, $popupContainer));
  },

  _sendAuthSmsResult: function($popupContainer, resp) {
    $popupContainer.find('.fe-err_msg,.fe-send_success_msg').hide();

    if (resp.code !== Tw.API_CODE.CODE_00) {
      $popupContainer.find('.fe-auth_send_box').addClass('error').removeClass('validation');
      $popupContainer.find('.fe-err_msg').text(resp.msg).show();
      return;
    }

    $popupContainer.find('.fe-auth_send_box').addClass('validation').removeClass('error');
    $popupContainer.find('.fe-send_success_msg').show();
  },

  _confirmAuthCode: function($popupContainer) {
    this._apiService.request(Tw.API_CMD.BFF_01_0015, {
      jobCode: 'NFM_TWD_MBIMASK_AUTH',
      authNum: $popupContainer.find('.fe-input_auth_code').val(),
      authUrl: '/product/setting',
      authKind: 'R'
    }).done($.proxy(this._confirmAuthCodeResult, this, $popupContainer));
  },

  _confirmAuthCodeResult: function($popupContainer, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      $popupContainer.find('.fe-auth_result_box').addClass('error');
      $popupContainer.find('.fe-result_error_msg').text(resp.msg).show();
      return;
    }

    this._historyService.goLoad('/product/setting/' + this._prodId);
  },

  _goBtnLink: function(e) {
    var $btn = $(e.currentTarget),
      typcd = $btn.data('typcd'),
      btnLink = $btn.data('url'),
      joinTermCd = this._getJoinTermCd(typcd);

    if (typcd === 'setting') {
      return this._openSettingPop();
    }

    if (typcd === 'SE') {
      return this._historyService.goLoad(btnLink);
    }

    if (Tw.FormatHelper.isEmpty(joinTermCd)) {
      return Tw.Error().page();
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0007, {
      joinTermCd: joinTermCd
    }, null, this._prodId)
      .done($.proxy(this._procAdvanceCheck, this, btnLink));
  },

  _goJoinTerminate: function(joinTermCd) {
    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });
    this._apiService.request(Tw.API_CMD.BFF_10_0007, {
      joinTermCd: joinTermCd
    }, null, this._prodId)
      .done($.proxy(this._goJoinTerminateResult, this, joinTermCd));
  },

  _goJoinTerminateResult: function(joinTermCd, resp) {
    skt_landing.action.loading.off({ ta: '.container' });
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._historyService.replaceURL('/product/' + (joinTermCd === '01' ? 'join' : 'terminate') + '/' + this._prodId);
  },

  _openSettingPop: function() {
    this._popupService.open({
      hbs: 'actionsheet_link_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT,
      data: [{
        'list': this._settingBtnList
      }]
    }, $.proxy(this._bindSettingBtnListEvent, this), $.proxy(this._goSetting, this), 'setting_pop');
  },

  _bindSettingBtnListEvent: function($layer) {
    console.log($layer.find('[data-url]'));
    $layer.find('[data-url]').on('click', $.proxy(this._setSettingGoUrl, this));
  },

  _setSettingGoUrl: function(e) {
    console.log('click');
    this._settingGoUrl = $(e.currentTarget).data('url');
    this._popupService.close();
  },

  _goSetting: function() {
    if (Tw.FormatHelper.isEmpty(this._settingGoUrl)) {
      return;
    }

    this._historyService.goLoad(this._settingGoUrl);
  },

  _procAdvanceCheck: function(btnLink, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(null, resp.msg).pop();
    }

    this._historyService.goLoad(btnLink);
  },

  _goRecommendProd: function(e) {
    var prodId = $(e.currentTarget).data('prod_id');
    if (Tw.FormatHelper.isEmpty(prodId)) {
      return;
    }

    this._historyService.goLoad('/product/detail/' + prodId);
  },

  _loadRecommendedrateList: function() {
    if (Tw.FormatHelper.isEmpty(this._filterIds) || Tw.FormatHelper.isEmpty(this._ctgCd)) {
      return;
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0031, {
      idxCtgCd: this._ctgCd,
      searchFltIds: this._filterIds,
      searchCount: 3,
      ignoreProdId: this._prodId
    }).done($.proxy(this._appendRecommendList, this));
  },

  _appendRecommendList: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || resp.result.productCount < 1) {
      return;
    }

    if (resp.result.productCount > 3) {
      this.$btnRecommendRateListMore.show();
    }

    this.$recommendRateList.find('.recommendedrate-list')
      .html(this._template({
        list: resp.result.products.map(function(item) {
          return $.extend(item, Tw.FormatHelper.convProductSpecifications(item.basFeeAmt,
            item.basOfrDataQtyCtt, item.basOfrVcallTmsCtt, item.basOfrCharCntCtt));
        })
      }));

    this.$recommendRateList.show();
  },

  _goRecommendRateMoreList: function() {
    this._historyService.goLoad('/product/' + this._ctgKey + '?filters=' + this._filterIds);
  }

};
