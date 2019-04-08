/**
 * @file membership.my.reissue.js
 * @desc 나의 T멤버십 > 재발급 신청
 * @author SeungKyu Kim (ksk4788@pineone.com)
 * @since 2018.01.29
 */

Tw.MembershipMyReissue = function(rootEl, mbrTypCd) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._mbrTypCd = mbrTypCd;
  this._cachedElement();
  this._bindEvent();
};

Tw.MembershipMyReissue.prototype = {
  _cachedElement: function() {
    this.$btnReissue = this.$container.find('#fe-reissue');
    this.$btnPrevStep = this.$container.find('.prev-step');
    this.$chkReason = this.$container.find('.fe-reason-check');
  },

  _bindEvent: function() {
    this.$btnReissue.on('click', $.proxy(this._openReissueAlert, this));
    this.$btnPrevStep.on('click', $.proxy(this._goPrevStep, this));
  },

  /**
   * @function
   * @desc 재발급 Alert(1_A51) Open
   * @param e
   * @private
   */
  _openReissueAlert: function(e) {
    var ALERT = Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A51;
    this._popupService.openConfirmButton(ALERT.MSG, ALERT.TITLE,
      $.proxy(this._handleReissueAlert, this), null, Tw.BUTTON_LABEL.CLOSE, Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A51.BUTTON, $(e.currentTarget));
  },

  /**
   * @function
   * @desc 재발급 Alert(1_A51)에서 재발급 버튼 선택
   * @private
   */
  _handleReissueAlert: function() {
    var mbrChgRsnCd = '';
    
    // 체크된 재발급 사유를 찾아 항목의 코드 값 저장
    this.$chkReason.each(function(){
      if($(this).prop('checked')){
        mbrChgRsnCd = $(this).attr('data-code');
      }
    });
    this._popupService.close();
    this._apiService
      .request(Tw.API_CMD.BFF_11_0004, { mbrChgRsnCd : mbrChgRsnCd })
      .done($.proxy(this._successReissueRequest, this))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc BFF_11_0004 나의 멤버십 - 멤버십 재발급 신청 API Response
   * @param res
   * @private
   */
  _successReissueRequest: function(res) {
    if(res.code === Tw.API_CODE.CODE_00){
      // '발급 카드 정보 : </br> T멤버십(' 과 ') 모바일 카드' 사이에 카드 종류 넣기
      var reissueComplete = Tw.ALERT_MSG_MEMBERSHIP.REISSUE_COMPLETE.PRE +
        Tw.MEMBERSHIP_TYPE[this._mbrTypCd] + Tw.ALERT_MSG_MEMBERSHIP.REISSUE_COMPLETE.POST;

      this._popupService.afterRequestSuccess(null, '/membership/my', null,
        Tw.ALERT_MSG_MEMBERSHIP.COMPLETE_TITLE.REISSUE, reissueComplete ); // 완료 팝업 Open
    }else{
      this._onFail(res);
    }
  },

  _goPrevStep: function(){
    this._historyService.goBack();
  },

  _onFail: function(err) {
    Tw.Error(err.code,err.msg).pop();
  }

};
