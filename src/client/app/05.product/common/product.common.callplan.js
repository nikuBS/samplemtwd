/**
 * FileName: product.common.callplan.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

Tw.ProductCommonCallplan = function(rootEl, prodId, prodTypCd, settingBtnList, lineProcessCase,
  isPreview, isAllowJoinCombine, svcMgmtNum, bpcpServiceId, eParam) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._popupService = Tw.Popup;
  this._bpcpService = Tw.Bpcp;
  this._bpcpService.setData(this.$container, '/product/callplan?prod_id=' + prodId);
  this._tidLanding = new Tw.TidLandingComponent();
  this._comparePlans = new Tw.ProductMobilePlanComparePlans();
  this._apiService = Tw.Api;

  this._prodId = prodId;
  this._prodTypCd = prodTypCd;
  this._settingBtnList = settingBtnList;
  this._lineProcessCase = lineProcessCase;
  this._isPreview = isPreview === 'Y';
  this._isAllowJoinCombine = isAllowJoinCombine === 'Y';
  this._svcMgmtNum = svcMgmtNum;
  this._bpcpServiceId = bpcpServiceId;
  this._eParam = eParam;
  this._templateBtn = Handlebars.compile($('#fe-templ-btn').html());
  this._templateSetting = Handlebars.compile($('#fe-templ-setting').html());

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
      this._procJoinedCheck();
    }

    if (this.$contents.find('.fe-btn_roaming_auto').length > 0) {
      this._bindRoamingAuto();
    }

    if (!Tw.FormatHelper.isEmpty(this._bpcpServiceId)) {
      this._initBpcp();
    }

    if (this.$contents.find('.idpt-pc').length > 0) {
      this.$contents.find('.idpt-pc').remove();
    }

    Tw.CommonHelper.replaceExternalLinkTarget(this.$contents);
  },

  _initBpcp: function() {
    this._bpcpService.open(this._bpcpServiceId);
    history.replaceState(null, document.title, location.origin + '/product/callplan?prod_id=' + this._prodId);
  },

  _cachedElement: function() {
    this.$btnJoin = this.$container.find('.fe-btn_join');
    this.$btnSetting = this.$container.find('.fe-btn_setting');
    this.$btnTerminate = this.$container.find('.fe-btn_terminate');
    this.$btnContentsDetail = this.$container.find('.fe-btn_contents_detail');
    this.$btnWrap = this.$container.find('.fe-btn_wrap');
    this.$settingWrap = this.$container.find('.fe-setting_wrap');
    this.$reservationWrap = this.$container.find('.fe-reservation_wrap');
    this.$btnReadyOn = this.$container.find('.fe-btn_ready_on');
    this.$comparePlans = this.$container.find('.fe-compare_plans');
    this.$goProd = this.$container.find('.fe-go_prod');

    this.$contentsDetailItem = this.$container.find('.fe-contents_detail_item');
    this.$contentsBtnRoamingAuto = this.$container.find('.fe-btn_roaming_auto');
    this.$contents = this.$container.find('.fe-contents');
  },

  _bindEvent: function() {
    this.$btnContentsDetail.on('click', $.proxy(this._openContentsDetailPop, this, 'contents_idx'));
    this.$comparePlans.on('click', $.proxy(this._openComparePlans, this));
    this.$goProd.on('click', $.proxy(this._goProd, this));

    this.$container.on('click', '.fe-btn_join', $.proxy(this._goJoinTerminate, this, '01'));
    this.$container.on('click', '.fe-btn_terminate', $.proxy(this._goJoinTerminate, this, '03'));
    this.$container.on('click', '.fe-btn_setting', $.proxy(this._procSetting, this));

    this.$container.on('click', '.fe-bpcp', $.proxy(this._detectBpcp, this));
    this.$container.on('click', '.fe-banner_link', $.proxy(this._onBannerLink, this));
    this.$container.on('click', '.fe-link-external', $.proxy(this._confirmExternalUrl, this));

    this.$contents.on('click', '[data-contents]', $.proxy(this._openContentsDetailPop, this, 'contents'));

    this.$contents.on('click', '.dmg-contract', $.proxy(this._openCustomPopup, this, 'BS_02_01_02_01'));
    this.$contents.on('click', '.possible-product', $.proxy(this._openCustomPopup, this, 'BS_03_01_01_02'));
    this.$contents.on('click', '.save_pay', $.proxy(this._openCustomPopup, this, 'BS_04_01_01_01'));
    this.$contents.on('click', '.fe-clubt', $.proxy(this._openCustomPopup, this, 'MP_02_02_04_01'));
    this.$contents.on('click', '.fe-campuszone', $.proxy(this._openCustomPopup, this, 'MP_02_02_04_02'));

    this.$contents.on('click', 'a', $.proxy(this._detectClubT, this));

    if (this.$contentsBtnRoamingAuto.length > 0) {
      this.$contentsBtnRoamingAuto.on('click', $.proxy(this._procRoamingAuto, this));
    }
  },

  _showReadyOn: function() {
    this.$btnReadyOn.show().attr('aria-hidden', 'false');
  },

  _goProd: function(e) {
    this._historyService.goLoad('/product/callplan?prod_id=' + $(e.currentTarget).data('prod_id'));
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

  _openComparePlans: function(e) {
    this._comparePlans.openCompare(this._prodId, true, e);
  },

  _onBannerLink: function(e) {
    var href = Tw.FormatHelper.isEmpty($(e.currentTarget).attr('href')) ? '' : $(e.currentTarget).attr('href');
    if (href.indexOf('custom:') !== -1) {
      return this._onBannerCustomPop(e, href);
    }

    if (Tw.FormatHelper.isEmpty(href.match(/http:\/\/|https:\/\//gi))) {
      return true;
    }

    this._confirmExternalUrl(e);
  },

  _onBannerCustomPop: function(e, href) {
    e.preventDefault();
    e.stopPropagation();

    this._openCustomPopup(href.replace('custom:', ''));
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
    Tw.CommonHelper.openUrlExternal(href);
  },

  _openCustomPopup: function(hbsCode) {
    this._popupService.open({
      hbs: hbsCode,
      layer: true
    }, $.proxy(this._bindCustomPop, this, hbsCode));
  },

  _detectClubT: function(e) {
    var clubT = 'http://m2.tworld.co.kr/normal.do?serviceId=S_PROD2001&viewId=V_PROD2001&menuId=5,1&prod_id=TW00000103&cate=3',
      clubT2 = 'http://m2.tworld.co.kr/normal.do?serviceId=S_PROD2001&viewId=V_PROD2001&menuId=5,1&prod_id=TW00000104';

    if (['NA00004428', 'NA00004429'].indexOf(this._prodId) === -1 ||
      $(e.currentTarget).attr('href') !== clubT && $(e.currentTarget).attr('href') !== clubT2) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    this._openCustomPopup('MP_02_02_04_01');
  },

  _bindCustomPop: function(hbsCode, $popupContainer) {
    if (hbsCode !== 'MP_02_02_04_02') {
      return;
    }

    this.$campusLists = $popupContainer.find('.data-type01-wrap');
    $popupContainer.on('change', 'input', $.proxy(this._handleSelectList, this));
  },

  _handleSelectList: function(e) {
    var selected = Number(e.currentTarget.getAttribute('data-idx') || 0),
      i = 0,
      list;
    for (; i < this.$campusLists.length; i++) {
      list = this.$campusLists[i];
      if (i === selected) {
        list.className = list.className.replace('none', '');
      } else if (list.className.indexOf('none') < 0) {
        list.className += ' none';
      }
    }
  },

  _procSetting: function() {
    if (this._isPreview) {
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.PREVIEW);
      return;
    }

    if (this._settingBtnList.length > 1) {
      this._openSettingPop();
    } else {
      if (this._bpcpService.isBpcp(this._settingBtnList[0].url)) {
        return this._bpcpService.open(this._settingBtnList[0].url);
      } else if (this._settingBtnList[0].url.indexOf('BEU:') !== -1) {
        return Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, this._settingBtnList[0].url.replace('BEU:', '')));
      } else if (this._settingBtnList[0].url.indexOf('NEU:') !== -1) {
        return this._openExternalUrl(this._settingBtnList[0].url.replace('NEU:', ''));
      }

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

    if (url.indexOf('BEU:') !== -1) {
      return Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, url.replace('BEU:', '')));
    } else if (url.indexOf('NEU:') !== -1) {
      return this._openExternalUrl(url.replace('NEU:', ''));
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(this._getSvcInfoRes, this, joinTermCd, url))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _detectBpcp: function(e) {
    var url = $(e.currentTarget).attr('href');
    if (!this._bpcpService.isBpcp(url)) {
      return true;
    }

    this._bpcpService.open(url, null, null);

    e.preventDefault();
    e.stopPropagation();
  },

  _getSvcInfoRes: function(joinTermCd, url, resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      var targetUrl = location.origin + url + '?prod_id=' + this._prodId;

      if (this._bpcpService.isBpcp(url)) {
        targetUrl = '/product/callplan?prod_id=' + this._prodId + '&bpcpServiceId=' + url.replace('BPCP:', '');
      }

      return this._tidLanding.goLogin(targetUrl);
    }

    // 미등록 회선일 경우
    if (Tw.FormatHelper.isEmpty(resp.result.svcMgmtNum)) {
      this._isGoMemberLine = false;
      return this._popupService.openConfirm(null, Tw.ALERT_MSG_PRODUCT.NEED_LINE,
        $.proxy(this._setGoMemberLine, this), $.proxy(this._onCloseMemberLine, this));
    }

    if (this._bpcpService.isBpcp(url)) {
      return this._bpcpService.open(url, resp.result.svcMgmtNum);
    }

    // 인터넷/집전화/TV 이용고객이 아닌 회선이 결합상품 가입 시도시
    if (joinTermCd === '01' && this._prodTypCd === 'F' && !this._isAllowJoinCombine) {
      return this._openCombineNeedWireError();
    }

    // 해지 및 회선변경 프로세스 case 2, 4 에 해당되면 즉시 사전체크 호출
    if (joinTermCd === '01' && (this._lineProcessCase === 'B' || this._lineProcessCase === 'D') || joinTermCd !== '01') {
      return this._procPreCheck(joinTermCd, url);
    }

    // 회선변경 프로세스 진입
    this._historyService.goLoad('/product/line-change?p_mod=' + (this._lineProcessCase === 'A' ? 'select' : 'change') +
      '&t_prod_id=' + this._prodId + '&t_url=' + encodeURIComponent(url + '?prod_id=' + this._prodId));
  },

  _procPreCheck: function(joinTermCd, url) {
    var preCheckApi = this._getPreCheckApiReqInfo(joinTermCd);

    this._url = url;
    this._joinTermCd = joinTermCd;

    if (Tw.FormatHelper.isEmpty(preCheckApi)) {
      this._joinTermCd = null;
      return this._procAdvanceCheck({ code: '00' });
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(preCheckApi.API_CMD, preCheckApi.PARAMS, null, [this._prodId])
      .done($.proxy(this._procAdvanceCheck, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
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
    }, $.proxy(this._focusContentsDetail, this, contentsIndex), function() {
      $item.focus();
    }, 'contents_detail');
  },

  _focusContentsDetail: function(contentsIndex, $popupContainer) {
    var $target = $popupContainer.find('[data-anchor="contents_' + contentsIndex + '"]'),
      $scrollContainer = $popupContainer.find('.container');

    if (contentsIndex === 0) {
      $scrollContainer.scrollTop(0);
    } else {
      $scrollContainer.scrollTop($target.offset().top - $('.page-header').height());
    }

    $target.focus();
    Tw.CommonHelper.replaceExternalLinkTarget($popupContainer);
  },

  _openCombineNeedWireError: function() {
    this._popupService.open({
      url: Tw.Environment.cdn + '/hbs/',
      'title': Tw.BENEFIT_TBCOMBINATION_ERROR.TITLE,
      'title_type': 'sub',
      'cont_align': 'tl',
      'contents': Tw.BENEFIT_TBCOMBINATION_ERROR.CONTENT,
      'bt': [{
        style_class: 'fe-btn_go_reservation',
        txt: Tw.BENEFIT_TBCOMBINATION_ERROR.BTN_TEXT
      }],
      'bt_b': [{
        style_class: 'pos-right tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.BACK
      }]
    }, $.proxy(this._bindCombineNeedWireError, this));
  },

  _bindCombineNeedWireError: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_go_reservation', $.proxy(this._goReservation, this));
  },

  _goReservation: function() {
    this._popupService.closeAll();
    setTimeout(function() {
      this._historyService.goLoad('/product/wireplan/join/reservation?type_cd=combine');
    }.bind(this));
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

  _getWireAdditionsPreCheck: function() { // @TODO 예약취소 GrandOpen 이후 범위
    // if (['D_I', 'D_P', 'D_T'].indexOf(this._prodTypCd) === -1 || this._joinTermCd !== '03') {
    //   return;
    // }
    //
    // this._apiService.request(Tw.API_CMD.BFF_10_0098, { joinTermCd: '04' }, {}, [this._prodId])
    //   .done($.proxy(this._resWireAdditionsPreCheck, this));
  },

  _resWireAdditionsPreCheck: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return;
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0166, { joinTermCd: '04' }, {}, [this._prodId])
      .done($.proxy(this._resWireAdditionsPreCheckInfo, this));
  },

  _resWireAdditionsPreCheckInfo: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return;
    }

    var title = resp.result.scrbTermClCd === '01' ? Tw.ALERT_MSG_PRODUCT.ALERT_3_A68 : Tw.ALERT_MSG_PRODUCT.ALERT_3_A69;
    this._popupService.openConfirmButton(null, title, $.proxy(this._onConfirmWireAdditionsReservationCancel, this),
      $.proxy(this._onCloseWireAdditionsReservationCancel, this));
  },

  _onConfirmWireAdditionsReservationCancel: function() {
    this._isWireAdditionsReservationCancel = true;
    this._popupService.close();
  },

  _onCloseWireAdditionsReservationCancel: function() {
    if (!this._isWireAdditionsReservationCancel) {
      return;
    }

    this._historyService.goLoad('/product/wireplan/reservation-cancel?prod_id=' + this._prodId);
  },

  _procAdvanceCheck: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop($.proxy(this._getWireAdditionsPreCheck, this));
    }

    if (this._prodTypCd === 'F' && resp.result.combiProdScrbYn !== 'N' && this._joinTermCd === '01') {
      return Tw.Error(null, Tw.ALERT_MSG_PRODUCT.ALERT_ALREADY_PRODUCT).pop();
    }

    if (this._prodTypCd === 'F' && resp.result.combiProdScrbYn !== 'Y' && this._joinTermCd === '03') {
      return Tw.Error(null, Tw.ALERT_MSG_PRODUCT.ALERT_ALREADY_TERM_PRODUCT).pop();
    }

    this._historyService.goLoad(this._url + '?prod_id=' + this._prodId);
  },

  _bindRoamingAuto: function() {
    var $container = this.$contents.find('.fe-btn_roaming_auto').parents('.idpt-form-wrap');
    $container.on('keyup input', '#phoneNum02', $.proxy(this._detectRoamingAutoInput, this));
  },

  _detectRoamingAutoInput: function(e) {
    var $input = $(e.currentTarget);
    $input.val($input.val().replace(/[^0-9]/g, ''));

    if ($input.val().length > 0 && Tw.ValidationHelper.isCellPhone('010' + $input.val())) {
      this.$contentsBtnRoamingAuto.removeAttr('disabled').prop('disabled', true);
    } else {
      this.$contentsBtnRoamingAuto.attr('disabled', 'disabled').prop('disabled', false);
    }
  },

  _procRoamingAuto: function(e) {
    var $form = $(e.currentTarget).parents('.idpt-form-wrap'),
      $phoneNum01 = $form.find('#phoneNum01'),
      $phoneNum02 = $form.find('#phoneNum02');

    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(function(resp) {
        if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
          return this._tidLanding.goLogin('/product/callplan?prod_id=' + this._prodId);
        }

        if (Tw.FormatHelper.isEmpty($phoneNum01.val()) || Tw.FormatHelper.isEmpty($phoneNum02.val())) {
          return;
        }

        this._apiService.request(Tw.API_CMD.BFF_10_0174, {
          roamCp1: $phoneNum01.val(),
          roamCp2: $phoneNum02.val()
        }).done($.proxy(this._procRoamingAutoRes, this));
      }, this));
  },

  _procRoamingAutoRes: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    if (resp.result.mySvcNum !== 'Y' || resp.result.sktChk !== 'SKT') {
      return this._popupService.openAlert(null, Tw.ALERT_MSG_PRODUCT.ALERT_3_A81.TITLE);
    }

    if (resp.result.autoDialPhone === '1' || resp.result.autoDialPhone === '3') {
      return this._popupService.openAlert(null, Tw.ALERT_MSG_PRODUCT.ALERT_3_A79.TITLE);
    }

    this._popupService.openAlert(null, Tw.ALERT_MSG_PRODUCT.ALERT_3_A80.TITLE);
  },

  // 페이지 Back 으로 진입시 가입 여부를 체크한다.
  _procJoinedCheck: function() {
    var apiList = [
      {
        command: Tw.NODE_CMD.UPDATE_SVC,  // 세션 리로드
        params: {}
      },
      {
        command: Tw.NODE_CMD.GET_SVC_INFO,  // 리로드된 세션정보 가져오기
        params: {}
      }
    ];

    this._apiService.requestArray(apiList)
      .done($.proxy(function(updateSvcResp, svcInfoResp) {
        if (svcInfoResp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(svcInfoResp.result)) {
          return;
        }

        // 가입여부 체크, 그 여부에 따른 버튼 생성을 위해 10_0001 에서 plmProdList, linkBtnList 값을 사용해야 한다.
        this._apiService.request(Tw.API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, [this._prodId])
          .done($.proxy(this._procJoinCheckReq, this, svcInfoResp.result));
      }, this));
  },

  // 그외 케이스 가입여부 체크
  _procJoinCheckReq: function(svcInfoResp, basicInfoResp) {
    if (basicInfoResp.code !== Tw.API_CODE.CODE_00) {
      return;
    }

    if (['AB', 'D_I', 'D_P', 'D_T'].indexOf(this._prodTypCd) !== -1) {
      return this._procJoinCheckRes(svcInfoResp, basicInfoResp.result, { code: '00', result: null });
    }

    var reqParams = Tw.FormatHelper.isEmpty(basicInfoResp.result.plmProdList) ? {} : {
      mappProdIds: (_.map(basicInfoResp.result.plmProdList, function(item) {
        return item.plmProdId;
      })).join(',')
    };

    // 모바일 부가서비스, 로밍 요금제/부가서비스 가입여부 체크
    if (['C', 'H_P', 'H_A'].indexOf(this._prodTypCd) !== -1) {
      return this._apiService.request(Tw.API_CMD.BFF_05_0040, reqParams, {}, [this._prodId])
        .done($.proxy(this._procJoinCheckRes, this, svcInfoResp, basicInfoResp.result));
    }

    // 유선 부가서비스 가입여부 체크
    if (['E_I', 'E_P', 'E_T'].indexOf(this._prodTypCd) !== -1) {
      return this._apiService.request(Tw.API_CMD.BFF_10_0109, reqParams, {}, [this._prodId])
        .done($.proxy(this._procJoinCheckRes, this, svcInfoResp, basicInfoResp.result));
    }

    // 결합상품/할인프로그램 가입여부 체크
    this._apiService.request(Tw.API_CMD.BFF_10_0119, {}, {}, [this._prodId])
      .done($.proxy(this._procJoinCheckRes, this, svcInfoResp, basicInfoResp.result));
  },

  // 가입 여부 체크 API 응답 처리
  _procJoinCheckRes: function(svcInfoResp, basicInfoResp, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return;
    }

    var isJoinCheck = this._isJoinCheck(svcInfoResp, basicInfoResp, resp.result),
      linkBtnList = this._convertLinkBtnList(basicInfoResp.linkBtnList, basicInfoResp.prodSetYn),
      isProdScrb = basicInfoResp.prodScrbYn === 'Y',
      isProdTerm = basicInfoResp.prodTermYn === 'Y',
      isProdSet = basicInfoResp.prodSetYn === 'Y';

    this.$btnWrap.empty();
    this.$settingWrap.empty();

    // 가입 되어 있으며, 해지 가능 할 경우
    if (isJoinCheck && isProdTerm && linkBtnList.terminate.length > 0) {
      this._appendButton(linkBtnList.terminate[0], false);
    }

    // 가입 되어 있으며, 설정 버튼 있고, 설정 가능할 경우
    if (isJoinCheck && isProdSet && linkBtnList.setting.length > 0) {
      this._appendSettingWrap(linkBtnList.setting);
    }

    // 가입 되어 있으며, 설정 불가능하거나 설정 버튼이 없을 경우
    if (isJoinCheck && (!isProdSet || linkBtnList.setting.length < 1)) {
      this._appendSettingWrap(null);
    }

    // 가입 되어 있으며, 예약 영역이 노출되어 있을 경우 삭제
    if (isJoinCheck && this.$reservationWrap.length > 0) {
      this.$reservationWrap.remove();
    }

    // 가입 안되어 있으며, 가입 가능 할 경우
    if (!isJoinCheck && isProdScrb && basicInfoResp.prodStCd === 'E1000' && linkBtnList.join.length > 0) {
      this._appendButton(linkBtnList.join[0], true);
    }
  },

  _appendButton: function(btnData, isJoinBtn) {
    this.$btnWrap.html(this._templateBtn({
      btClass: isJoinBtn ? 'fe-btn_join' : 'fe-btn_terminate',
      url: btnData.linkUrl,
      btName: btnData.linkNm
    }));
  },

  _appendSettingWrap: function(btnData) {
    if (!Tw.FormatHelper.isEmpty(btnData)) {
      this._settingBtnList = btnData.map(function (item) {
        return {
          'url': item.linkUrl,
          'button-attr': 'data-url="' + item.linkUrl + '"',
          'txt': item.linkNm
        };
      });
    }

    this.$settingWrap.html(this._templateSetting({
      settingBtn: Tw.FormatHelper.isEmpty(btnData) ? '' : btnData[0].linkNm,
      isSettingBtnList: btnData && btnData.length > 1
    }));
  },

  _convertLinkBtnList: function(linkBtnList, prodSetYn) {
    var joinBtnList = [],
      settingBtnList = [],
      termBtnList = [],
      isJoinReservation = false;

    _.each(linkBtnList, function(item) {
      if (item.linkTypCd === 'SE' && prodSetYn !== 'Y') {
        return true;
      }

      if (item.linkTypCd === 'SC') {
        joinBtnList.push(item);
        return true;
      }

      if (item.linkTypCd === 'SE' && prodSetYn === 'Y') {
        settingBtnList.push(item);
        return true;
      }

      if (item.linkTypCd === 'CT') {
        isJoinReservation = true;
        return true;
      }

      termBtnList.push(item);
    });

    return {
      join: joinBtnList,
      setting: settingBtnList,
      terminate: termBtnList,
      isJoinReservation: isJoinReservation
    };
  },

  _isJoinCheck: function(svcInfoResp, basicInfoResp, joinedInfoResp) {
    var plmProdList = $.extend([this._prodId], _.map(basicInfoResp.plmProdList, function(item) {
      return item.plmProdId;
    }));

    if (['AB', 'D_I', 'D_P', 'D_T'].indexOf(this._prodTypCd) !== -1) {
      return plmProdList.indexOf(svcInfoResp.prodId) !== -1;
    }

    if (['C', 'H_P', 'H_A'].indexOf(this._prodTypCd) !== -1) {
      return joinedInfoResp.isAdditionUse === 'Y';
    }

    if (['E_I', 'E_P', 'E_T'].indexOf(this._prodTypCd) !== -1) {
      return joinedInfoResp.wiredSuplSvcScrbYn === 'Y';
    }

    return joinedInfoResp.combiProdScrbYn === 'Y';
  }

};
