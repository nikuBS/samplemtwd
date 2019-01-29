/**
 * FileName: membership.my.update.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.12.21
 */

Tw.MembershipMyUpdate = function(rootEl, myInfoData) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._myInfoData = JSON.parse(myInfoData);
  this._okCashbagShown = false;
  this._cachedElement();
  this._bindEvent();
};

Tw.MembershipMyUpdate.prototype = {

  _cachedElement: function() {
    this.$container.on('click', 'input[type=checkbox]', $.proxy(this._agreeCheck, this));
    this.$container.on('click', '#fe-update', $.proxy(this._requestUpdate, this));
    this.$btnPrevStep = this.$container.find('.prev-step');
    this.$checkAll = this.$container.find('#chk1');
    this.$checkFirst = this.$container.find('#chk2');
    this.$checkSecond = this.$container.find('#chk3');
    this.$smsAgree = this.$container.find('#oka1');
    this.$tmAgree = this.$container.find('#oka2');
    this.$newsAgree = this.$container.find('#oka3');

  },

  _bindEvent: function() {
    this.$btnPrevStep.on('click', $.proxy(this._goPrevStep, this));
  },

  _agreeCheck: function(e) {
    var selected = e.target;

    if($(selected).attr('checked') === 'checked'){ //체크 해제
      $(selected).removeAttr('checked');

      if(selected.name === 'checkbox2'){
        $('.toggle-aggrement').hide();
        this._okCashbagShown = false;
      }

      if(selected.id === 'chk1'){ //OK 캐시백 모두 동의 해제
        this.$checkFirst.prop('checked', false);
        this.$checkSecond.prop('checked', false);
        $(selected).removeAttr('checked');
        this.$checkFirst.removeAttr('checked');
        this.$checkSecond.removeAttr('checked');
      }

      if(selected.id === 'chk2' || selected.id === 'chk3'){
        this.$checkAll.prop('checked', false);
        this.$checkAll.removeAttr('checked');
      }
    }else{ // 체크 설정
      $(selected).attr('checked','checked');

      if(selected.name === 'checkbox2'){
        $('.toggle-aggrement').show();
        this._okCashbagShown = true;
      }

      if(selected.id === 'chk1'){ //OK 캐시백 모두 동의 설정
        this.$checkFirst.prop('checked', true);
        this.$checkSecond.prop('checked', true);
        this.$checkFirst.attr('checked','checked');
        this.$checkSecond.attr('checked','checked');
      }

      if(selected.id === 'chk2' || selected.id === 'chk3'){
        if(this.$checkFirst.attr('checked') === 'checked' && this.$checkSecond.attr('checked') === 'checked'){
          this.$checkAll.prop('checked', true);
          this.$checkAll.attr('checked','checked');
        }
      }
    }
  },

  _requestUpdate: function() {

    //OK 캐쉬백 조건 체크
    if(this._okCashbagShown && this.$checkAll.attr('checked') !== 'checked'){
      var ALERT = Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A62;
      this._popupService.openAlert(ALERT.MSG, ALERT.TITLE);
      return;
    }

    this._myInfoData.smsAgreeYn = this.$smsAgree.attr('checked') === 'checked' ? 'Y' : 'N';
    this._myInfoData.sktNewsYn = this.$tmAgree.attr('checked') === 'checked' ? 'Y' : 'N';
    this._myInfoData.sktTmYn = this.$newsAgree.attr('checked') === 'checked' ? 'Y' : 'N';

    if(this._myInfoData.ctzNumAgreeYn === 'N' && this._myInfoData.ocbAccumAgreeYn === 'N'){
      this._myInfoData.ctzNumAgreeYn = this.$checkAll.attr('checked') === 'checked' ? 'Y' : 'N';
      this._myInfoData.ocbAccumAgreeYn = this.$checkFirst.attr('checked') === 'checked' ? 'Y' : 'N';
    }

    var ALERT = Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A53;
    this._popupService.openConfirmButton(ALERT.MSG, ALERT.TITLE, $.proxy(this._handleUpdateAlert, this), null, Tw.BUTTON_LABEL.CLOSE, Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A53.BUTTON);
  },

  _handleUpdateAlert: function() {
    this._apiService.request(Tw.API_CMD.BFF_11_0012, this._myInfoData).done($.proxy(this._handleSuccessInfoUpdate, this));
  },

  _handleSuccessInfoUpdate: function(res) {
    if(res.code === Tw.API_CODE.CODE_00) {
      //완료 페이지 이동
      this._popupService.afterRequestSuccess('/membership/my/history', '/membership/my',
        Tw.ALERT_MSG_MEMBERSHIP.JOIN_COMPLETE.LINK_TITLE, Tw.ALERT_MSG_MEMBERSHIP.COMPLETE_TITLE.UPDATE);
    }else{
      this._onFail(res);
    }
  },

  _goPrevStep: function(){
    this._historyService.goLoad('/membership/my');
  }

};
