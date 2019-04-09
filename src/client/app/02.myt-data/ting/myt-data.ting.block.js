/**
 * @file myt-data.ting.block.js
 * @desc 팅요금제 충전 선물 > 팅 선물 차단 설정 관련 처리
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.09.18
 */

Tw.MyTDataTingBlock = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataTingBlock.prototype = {
  _init: function () {
    this._hideListItem();
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-request-ting-block', $.proxy(this._onShowBlockPopup, this));
    this.$container.on('click', '.fe-history-more', $.proxy(this._onShowMoreList, this));
  },

  /**
   * @function
   * @desc 팅 선물 차단 설정 > 상세 내역 더보기 버튼 선택
   * @param e
   * @private
   */
  _onShowMoreList: function (e) {
    var elTarget = $(e.currentTarget);
    var elList = $('.fe-wrap-block-list li');

    if ( elList.not(':visible').size() !== 0 ) {
      elList.not(':visible').slice(0, 20).show();
    }

    if ( elList.not(':visible').size() === 0 ) {
      elTarget.hide();
    }
  },

  /**
   * @function
   * @desc 상세내역 데이터가 20개가 넘는 경우 데이터 숨김 및 더보기 버튼 생성
   * @private
   */
  _hideListItem: function () {
    if ( $('.fe-wrap-block-list li').size() > 20 ) {
      $('.fe-history-more').show();
      $('.fe-wrap-block-list li').slice(20).hide();
    }
  },

  /**
   * @function
   * @desc 차단하기 버튼 선택
   * @param e
   * @private
   */
  _onShowBlockPopup: function (e) {
    var $target = $(e.currentTarget);
    this._popupService.openModalTypeA(
      Tw.MYT_DATA_TING.A81_TITLE,
      Tw.MYT_DATA_TING.A81_CONTENT,
      Tw.MYT_DATA_TING.A81_BTN_CONFIRM,
      null,
      $.proxy(this._unsubscribeAutoRecharge, this),
      $.proxy(this._closeUnsubscribeAutoRecharge, this),
      null,
      null,
      $target
    );
  },

  _closeUnsubscribeAutoRecharge: function () {
    this._popupService.close();
  },

  /**
   * @function
   * @desc BFF_06_0021 팅요금 선물 차단신청 API Request
   * @private
   */
  _unsubscribeAutoRecharge: function () {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_06_0021, {})
      .done($.proxy(this._onSuccessTingBlock, this));
  },

  /**
   * @function
   * @desc BFF_06_0021 팅요금 선물 차단신청 Response
   * @param res
   * @private
   */
  _onSuccessTingBlock: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      Tw.CommonHelper.toast(Tw.MYT_DATA_TING.SUCCESS_BLOCK);
      this._goToMytMain();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  /**
   * @function
   * @desc 나의 데이터 통화 서브메인으로 이동
   * @private
   */
  _goToMytMain: function () {
    this._historyService.replaceURL('/myt-data/submain');
  },

  _openTingBlock: function () {
    this._hideListItem();
  }
};