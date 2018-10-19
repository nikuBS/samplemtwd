/**
 * FileName: product.terminate.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.10.13
 */

Tw.ProductTerminate = function(rootEl, prodId, terminateApiCode, displayId, displayGroup) {
  this.$container = rootEl;
  this._prodId = prodId;
  this._terminateApiCode = terminateApiCode;
  this._displayId = displayId;
  this._displayGroup = displayGroup;

  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._apiService = Tw.Api;
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductTerminate.prototype = {

  _successData: {},

  _init: function() {
    if (this.$agreeWrap.length < 1) {
      this._enableBtnTerminate();
    }

    if (Tw.FormatHelper.isEmpty(this._terminateApiCode) && Tw.FormatHelper.isEmpty(this._displayId)) {
      this._terminateApiCode = 'BFF_10_0036';
    }

    if (Tw.FormatHelper.isEmpty(this._terminateApiCode) && !Tw.FormatHelper.isEmpty(this._displayId)) {
      this._terminateApiCode = 'BFF_10_0022';
    }
  },

  _cachedElement: function() {
    this.$btnTerminate = this.$container.find('.fe-btn_terminate');
    this.$agreeWrap = this.$container.find('.fe-agree_wrap');
    this.$btnAgreeShow = this.$container.find('.fe-btn_agree_view');

    this.$checkboxAgreeAll = this.$container.find('.fe-checkbox_agree_all');
    this.$checkboxAgreeItem = this.$container.find('.fe-checkbox_agree_item');

    this.$prodMoney = this.$container.find('.fe-prod_money');
  },

  _bindEvent: function() {
    this.$btnTerminate.on('click', $.proxy(this._openConfirmPopup, this));
    this.$btnAgreeShow.on('click', $.proxy(this._openAgreePop, this));

    this.$checkboxAgreeAll.on('change', $.proxy(this._agreeAllToggle, this));
    this.$checkboxAgreeItem.on('change', $.proxy(this._agreeItemToggle, this));
  },

  _agreeAllToggle: function() {
    var isAllCheckboxChecked = this.$checkboxAgreeAll.is(':checked');

    this.$checkboxAgreeItem.prop('checked', isAllCheckboxChecked);
    this.$checkboxAgreeItem.parents('.fe-checkbox_style').toggleClass('checked', isAllCheckboxChecked)
      .attr('aria-checked', isAllCheckboxChecked);

    this._enableBtnTerminate();
  },

  _agreeItemToggle: function() {
    var isCheckboxItemChecked = this.$container.find('.fe-checkbox_agree_item:not(:checked)').length < 1;

    this.$checkboxAgreeAll.prop('checked', isCheckboxItemChecked);
    this.$checkboxAgreeAll.parents('.fe-checkbox_style').toggleClass('checked', isCheckboxItemChecked)
      .attr('aria-checked', isCheckboxItemChecked);

    this._enableBtnTerminate();
  },

  _enableBtnTerminate: function() {
    if (this.$container.find('.fe-checkbox_agree_need:not(:checked)').length > 0) {
      this.$btnTerminate.attr('disabled', 'disabled').prop('disabled', true);
    } else {
      this.$btnTerminate.removeAttr('disabled').prop('disabled', false);
    }
  },

  _openAgreePop: function(e) {
    var $parent = $(e.currentTarget).parent();
    this._popupService.open({
      hbs: 'PFT_01_03_L01',
      data: {
        title: $parent.find('.mtext').text(),
        html: $parent.find('.fe-agree_full_html').text()
      }
    }, null, null, 'agree_pop');
  },

  _openConfirmPopup: function() {
    this._popupService.openModalTypeA(null, Tw.ALERT_MSG_PRODUCT.ALERT_3_A4.TITLE,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A4.BUTTON, null, $.proxy(this._authCheck, this));
  },

  _authCheck: function() {  // @todo 인증 API 되면 그때 사용
    this._apiService.request(Tw.API_CMD.BFF_10_9001, {}, {}, this._prodId, 'TM')
      .done($.proxy(this._procTerminate, this));
  },

  _authCheckResult: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    if (Tw.FormatHelper.isEmpty(resp.result.prodAuthMethods)) {
      this._procTerminate();
    } else {
      this._openAuthLayer();
    }
  },

  _openAuthLayer: function() {
    // @todo 인증 창을 열자.
  },

  _procTerminate: function() {
    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });

    this._apiService.request(Tw.API_CMD[this._terminateApiCode], {}, {}, this._prodId)
      .done($.proxy(this._procTerminateRes, this));
  },

  _procTerminateRes: function(resp) {
    skt_landing.action.loading.off({ ta: '.container' });

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0038, {}, {}, this._prodId)
      .done($.proxy(this._isVasTerm, this));
  },

  _isVasTerm: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      this._isResultPop = true;
      return this._openTerminateResultPop();
    }

    this._openVasTermPopup(resp);
  },

  _openTerminateResultPop: function() {
    if ( this._isGoalKeeperProduct ) {
      return this._historyService.goLoad('/product/detail/NA00004343');
    }

    if ( !this._isResultPop ) {
      return;
    }

    var isProdMoney = this.$prodMoney && (this.$prodMoney.length > 0);

    this._popupService.open({
      hbs: 'DC_05_01_end_01_product',
      data: $.extend(this._successData, {
        mytPage: this._displayGroup,
        prodId: this._prodId,
        prodNm: this.$container.data('prod_nm'),
        typeNm: Tw.PRODUCT_TYPE_NM.TERMINATE,
        isBasFeeInfo: isProdMoney,
        basFeeInfo: isProdMoney ? this.$prodMoney.text() : ''
      })
    }, $.proxy(this._openResPopupEvent, this), null, 'join_success');
  },

  _openResPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._goProductDetail, this));
  },

  _openVasTermPopup: function(resp) {
    // @todo 가입유도팝업 어드민 resp 내용 삽입; 정책 미확정이므로 일단 하드코딩 팝업 노출;
    this._popupService.open({
      hbs:'MV_01_02_02_01',
      'msgheader': true,
      'msgheaderbg':'bg1',
      'msgtit':'고객님께<br /><span>추천드려요!</span>',
      'msgtxt':'안 받는 전화는 있어도 못 받는 전화는 없다!<br />중요한 전화를 놓치지 않도록 도와주는 콜키퍼!<br />든든한 콜키퍼에 가입해 보세요.',
      'title': '콜키퍼란?',
      'contents': '내가 놓친 통화의 발신번호, 시간, 스팸정보 등을 문자로 알려드리는 서비스<br />(부가세포함 월 550원)',
      'link_list': [{
        style_class:'fe-btn_goalkeeper',
        txt:'콜키퍼 가입하기'
      }],
      'bt': [{
        style_class: 'bt-blue1 fe-btn_back',
        txt: '닫기'
      }]
    }, $.proxy(this._bindVasTermPopupEvent, this), $.proxy(this._openTerminateResultPop, this));
  },

  _bindVasTermPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_back>button', $.proxy(this._closeAndOpenResultPopup, this));
    $popupContainer.on('click', '.fe-btn_goalkeeper', $.proxy(this._goGoalKeeperProduct, this));
  },

  _goGoalKeeperProduct: function() {
    this._popupService.close();
    this._isGoalKeeperProduct = true;
  },

  _closeAndOpenResultPopup: function() {
    this._popupService.close();
    this._isResultPop = true;
  },

  _goProductDetail: function() {
    this._historyService.goLoad('/product/detail/' + this._prodId);
  }

};
