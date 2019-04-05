/**
 * @file membership.my.update.js
 * @author SeungKyu Kim (ksk4788@pineone.com)
 * @since 2018.12.21
 */

Tw.MembershipMyUpdate = function(rootEl, myInfoData) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._myInfoData = JSON.parse(myInfoData);
  this._okCashbagShown = false;
  this._okCashbagYn = this._myInfoData.ctzNumAgreeYn; // OK캐시백 약관 동의여부 저장
  this._cachedElement();
  this._bindEvent();
  this._deleteKeys();
};

Tw.MembershipMyUpdate.prototype = {

  _cachedElement: function() {
    this.$container.on('click', '.fe-agree-check', $.proxy(this._agreeCheck, this));
    this.$container.on('click', '#fe-update', $.proxy(this._requestUpdate, this));
    this.$btnPrevStep = this.$container.find('.prev-step');
    this.$checkAll = this.$container.find('#fe-chk1');
    this.$checkFirst = this.$container.find('#fe-chk2');
    this.$checkSecond = this.$container.find('#fe-chk3');
    this.$checkThird = this.$container.find('#fe-chk4');
    this.$checkFourth = this.$container.find('#fe-chk5');
    this.$checkCashbag = this.$container.find('#fe-chk8');
    this.$actionCheckAll = this.$container.find('.fe-all');
    this.$actionCheckPart = this.$container.find('.fe-part');
    this.$smsAgree = this.$container.find('#fe-oka1');
    this.$tmAgree = this.$container.find('#fe-oka2');
    this.$newsAgree = this.$container.find('#fe-oka3');
    this.$toggleOkCashbag = this.$container.find('#fe-ok-toggle');
    this.$agreeViewBtn = this.$container.find('.fe-more-view');
    this.$checkSelectFirst = this.$container.find('#fe-okb1');
    this.$checkSelectSecond = this.$container.find('#fe-okb2');
  },

  _bindEvent: function() {
    this.$btnPrevStep.on('click', $.proxy(this._goPrevStep, this));
    this.$agreeViewBtn.on('click', $.proxy(this._onClickAgreeView, this));
  },

  _deleteKeys: function() { // 가공된 데이터는 정보수정 완료 API에 보낼 parameter에서 삭제
    delete this._myInfoData.smsAgreeChecked;
    delete this._myInfoData.sktNewsChecked;
    delete this._myInfoData.sktTmChecked;
    delete this._myInfoData.mktgAgreeChecked;
    delete this._myInfoData.ocbAccumAgreeChecked;
    delete this._myInfoData.cardIsueTypCd;
  },

  _okCashbagUncheck: function() {
    this.$checkCashbag.prop('checked', false);
    this.$actionCheckAll.prop('checked', false);

    this.$checkCashbag.removeAttr('checked');
    this.$actionCheckAll.removeAttr('checked');

    this.$toggleOkCashbag.hide();
    this._okCashbagShown = false;

    var self = this;
    setTimeout(function(){
      self._popupService.close();
    },50);
  },

  _agreeCheck: function(e) {
    var selected = e.target;

    if($(selected).attr('checked') === 'checked'){ // 체크 해제

      if(selected.id === 'fe-chk8'){
        // OK캐시백 기능 추가하기는 알럿 띄운후 체크해제
        var ALERT = Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A63;
        this._popupService.openConfirmButton(ALERT.MSG, ALERT.TITLE,
          $.proxy(this._okCashbagUncheck, this), null, Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES, $(e.currentTarget));
      }else{
        $(selected).removeAttr('checked');
      }

      if(selected.id === 'fe-chk1'){ // OK 캐시백 모두 동의 해제
        this.$actionCheckAll.prop('checked', false);
        this.$actionCheckAll.removeAttr('checked');
      }

      if($(selected).hasClass('fe-part')){ // OK 캐시백 개별 해제시 모두 동의 해제
        this.$checkAll.prop('checked', false);
        this.$checkAll.removeAttr('checked');
      }
    }else{ // 체크 설정
      $(selected).attr('checked','checked');

      if(selected.id === 'fe-chk8'){ // OK 캐시백 기능 추가하기
        var self = this;
        setTimeout(function(){
          self.$checkCashbag.prop('checked', true);
          $('#fe-ok-toggle').show();
          self._okCashbagShown = true;
        },50);
      }

      if(selected.id === 'fe-chk1'){ // OK 캐시백 모두 동의 설정
        this.$actionCheckAll.prop('checked', true);
        this.$actionCheckAll.attr('checked','checked');
      }

      this._allAgreeCheck(selected);
    }
  },

  // OK 캐시백 모든 약관 동의여부 체크
  _allAgreeCheck: function(selected){
    var sumCheckAll = 0;
    if($(selected).hasClass('fe-part')){ // OK 캐시백 개별 설정
      for(var i = 0; i<this.$actionCheckPart.length; i++){
        if($(this.$actionCheckPart[i]).attr('checked') === 'checked'){
          sumCheckAll += 1;
        }
      }
      if(sumCheckAll === 4){ // 4일 경우 모두 체크
        this.$checkAll.prop('checked', true);
        this.$checkAll.attr('checked','checked');
      }
    }
  },

  _requestUpdate: function(e) {

    // OK 캐쉬백 조건 체크, 필수항목 미 동의시 알럿 띄우기
    if((this._okCashbagShown && this.$checkFirst.attr('checked') !== 'checked') ||
      (this._okCashbagShown && this.$checkSecond.attr('checked') !== 'checked')){
      var ALERT = Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A62;
      this._popupService.openAlert(ALERT.MSG, ALERT.TITLE, null, null, null, $(e.currentTarget));
      return;
    }

    this._myInfoData.smsAgreeYn = this.$smsAgree.attr('checked') === 'checked' ? 'Y' : 'N';
    this._myInfoData.sktNewsYn = this.$tmAgree.attr('checked') === 'checked' ? 'Y' : 'N';
    this._myInfoData.sktTmYn = this.$newsAgree.attr('checked') === 'checked' ? 'Y' : 'N';

    if(this._okCashbagYn === 'N'){ // OK 캐시백 미동의 Case
      this._myInfoData.ctzNumAgreeYn = this.$checkSecond.attr('checked') === 'checked' ? 'Y' : 'N';
      this._myInfoData.mktgAgreeYn = this.$checkThird.attr('checked') === 'checked' ? 'Y' : 'N';
      this._myInfoData.ocbAccumAgreeYn = this.$checkFourth.attr('checked') === 'checked' ? 'Y' : 'N';
    }else{ // OK 캐시백 동의 Case
      this._myInfoData.ocbAccumAgreeYn = this.$checkSelectSecond.attr('checked') === 'checked' ? 'Y' : 'N';
    }


    this._popupService.openConfirmButton(Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A53.MSG, Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A53.TITLE,
      $.proxy(this._handleUpdateAlert, this), null, Tw.BUTTON_LABEL.CLOSE, Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A53.BUTTON, $(e.currentTarget));
  },

  _handleUpdateAlert: function() {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_11_0012, this._myInfoData).done($.proxy(this._handleSuccessInfoUpdate, this));
  },

  _handleSuccessInfoUpdate: function(res) {
    if(res.code === Tw.API_CODE.CODE_00) {
      // 완료 페이지 이동
      this._popupService.afterRequestSuccess(null, '/membership/my', null, Tw.ALERT_MSG_MEMBERSHIP.COMPLETE_TITLE.UPDATE);
    }else{
      this._onFail(res);
    }
  },

  _goPrevStep: function(){
    this._historyService.goBack();
  },

  _onClickAgreeView: function(e){ // 마케팅 약관 팝업
    new Tw.MembershipClauseLayerPopup({
      $element: this.$container,
      callback: $.proxy(this._agreeViewCallback, this)
    }).open('BE_04_02_L07', e);
  },

  _agreeViewCallback: function(){ // 마케팅 활용 동의 약관보기 팝업에서 확인 선택시
    if(this._myInfoData.ctzNumAgreeYn === 'N') { // 기존에 동의한 경우
      this.$checkThird.prop('checked', true);
      this.$checkThird.attr('checked', 'checked');
      var selected = this.$checkThird;
      this._allAgreeCheck(selected);
    }else{ // 기존에 동의하지 않은 경우
      this.$checkSelectFirst.prop('checked', true);
      this.$checkSelectFirst.attr('checked','checked');
    }
  },

  _onFail: function(err) {
    Tw.Error(err.code,err.msg).pop();
  }

};
