
/**
 * @file common.member.line.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.09.27
 */

/**
 * @class
 * @desc 공통 > 회선관리
 * @param rootEl
 * @param defaultCnt
 * @constructor
 */
Tw.CommonMemberLineVirtualNumberDenial = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this._cacheElements();
  this._bindEvent();
};

Tw.CommonMemberLineVirtualNumberDenial.prototype = {

  _cacheElements: function() {
    this.$btnMoreView = this.$container.find('.fe-more');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-bt-denial', $.proxy(this._sendDeny, this));
    this.$container.on('click', '.fe-bt-confirm', $.proxy(function() { this._historyService.goBack() }, this));
    this.$container.on('click', '.fe-bt-cancel', $.proxy(function() { this._historyService.goBack() }, this));
    this.$btnMoreView.on('click', $.proxy(this._showMore, this));
  },

  /**
   * 거부 등록/해제
   * @param {} $event 
   */
  _sendDeny: function ($event) {
    var $target = $($event.currentTarget)
    var svcMgmtNum = $target.data('svcmgmtnum');
    var api = Tw.API_CMD.BFF_08_0083;
    var willDeny = false;

    // 거부등록 실행
    if($target.find('.bt-line-gray1').length > 0) {
      api = Tw.API_CMD.BFF_08_0082;
      willDeny = true;
    }

    this._apiService.request(api, {selectedSvcMgmtNum: svcMgmtNum})
      .done($.proxy(this._successRequestDeny, this, $target, willDeny))
      .fail($.proxy(this._failRequestDeny, this));

  },

  /**
   * 거부 등록/해제 성공
   * @param {*} $target 
   * @param {*} willDeny 
   * @param {*} res 
   */
  _successRequestDeny: function ($target, willDeny, resp) {
    if (resp.code === Tw.API_CODE.CODE_00) {

      if(willDeny) {
        // 붉은색 버튼으로 변경(거부 등록 성공)
        $target.find('.bt-line-gray1').attr('class','btn-style4');
        this._popupService.openAlert(Tw.ALERT_MSG_COMMON.SUCEESS_SAFETY_NUMBER_PROVIDE_DENY);
      } else {
        $target.find('.btn-style4').attr('class','bt-line-gray1');
        this._popupService.openAlert(Tw.ALERT_MSG_COMMON.SUCEESS_SAFETY_NUMBER_PROVIDE);
      }
    } else {
      this._popupService.openAlert(Tw.ALERT_MSG_COMMON.SUCEESS_SAFETY_NUMBER_PROVIDE_FAIL);
    }
  },

  /**
   * 거부 등록/해제 실패
   * @param {} res 
   */
  _failRequestDeny: function (res) {
    this._popupService.openAlert(Tw.ALERT_MSG_COMMON.SUCEESS_SAFETY_NUMBER_PROVIDE_FAIL);
  },

  /**
   * @function
   * @desc 더보기
   */
  _showMore: function () {
    var $currrSublist = this.$container.find('.fe-sublist.none').slice(0, 20).removeClass('none');

    if (this.$container.find('.fe-sublist.none').length < 1){
      this.$btnMoreView.hide();
    }
  }
};
