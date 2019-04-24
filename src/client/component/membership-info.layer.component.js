/**
 * @file membership-info.layer.component.js
 * @author Kim InHwan (skt.P132150@partner.sk.com)
 * Editor: 양정규 (skt.P130715@partner.sk.com)
 * @since 2018-10-29
 *
 */

/**
 * @class
 * @desc T멤버십 > T멤버십 안내 > T멤버십 카드/등급 안내
 * @param {Obejct} $element - dom 객체
 * @param {JSON} svcInfo
 */
Tw.MembershipInfoLayerPopup = function ($element, svcInfo) {
  this.$container = $element;
  this._svcInfo = svcInfo;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');
  this._apiService = Tw.Api;
  this._tidLanding = new Tw.TidLandingComponent();
};

Tw.MembershipInfoLayerPopup.prototype = {
  /**
   * @function
   * @desc 팝업 생성
   * @param hbs
   */
  open: function (hbs, e) {
    // BE_04_01_L01, BE_04_01_L02, BE_04_01_L03
    this._popupService.open({
      hbs: hbs,// hbs의 파일명
      layer: true
    }, null, $.proxy(this._closeCallback, this), hbs, e);
  },

  /**
   * @function
   * @desc 가입 가능여부 조회 요청
   */
  reqPossibleJoin : function(){
    if ( !Tw.FormatHelper.isEmpty(this._isJoinOk) ) {
      return;
    }

    this._apiService
      .request(Tw.API_CMD.BFF_11_0015, {})
      .done($.proxy(this._onSuccess, this))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc reqPossibleJoin() 성공 콜백
   * @param {JSON} resp
   */
  _onSuccess : function (resp) {
    if ( resp.code !== Tw.API_CODE.CODE_00  || !resp.result) {
      this._onFail(resp);
      return false;
    }

    // DV001-17710 법인의 동의를 얻은 실사용자(ownNameYn만 'N' 일 때 svcGr이 'E')는 가능
    if(resp.result.ownNameYn && this._svcInfo.svcGr === 'E'){
      resp.result.ownNameYn = 'Y';
    }
    this._isJoinOk = (Object.values(resp.result).indexOf('N') < 0)  ? 'Y' : 'N';
    this.onClickJoinBtn();
  },
  /**
   * @function
   * @desc 팝업 닫기
   */
  _closeCallback: function () {
    this._popupService.close();
  },
  /**
   * @function
   * @desc T멤버십 가입불가 팝업
   */
  _onPopupNoJoin : function () {
    var param = Tw.ALERT_MSG_MEMBERSHIP.NO_JOIN;
    this._popupService.open({
        title: param.TITLE,
        title_type: 'sub',
        cont_align: 'tl',
        contents: param.CONTENTS,
        infocopy: [{
          info_contents: param.TXT,
          bt_class: 'fe-more bt-blue1'
        }],
        bt_b: [{
          style_class: 'pos-left fe-close',
          txt: Tw.BUTTON_LABEL.CLOSE
        }, {
          style_class: 'bt-red1 pos-right fe-line',
          txt: Tw.BUTTON_LABEL.LINE
        }]
      },
      $.proxy(function($layer){
        // 더 알아보기 클릭
        $layer.on('click', '.fe-more', $.proxy(function(){
          this.open('BE_04_01_L02');
        },this));
        // 닫기 클릭
        $layer.on('click', '.fe-close', $.proxy(function(){
          this._popupService.close();
        },this));
        // 회선관리 클릭
        $layer.on('click', '.fe-line', $.proxy(function(){
          this._popupService.close();
          this._historyService.goLoad('/common/member/line');
        },this));
      }, this)
    );
  },
  /**
   * @function
   * @desc 가입하기 버튼 클릭
   */
  onClickJoinBtn: function () {
    // 로그인 유형이 간편 로그인이 아닌경우
    if(this._svcInfo && this._svcInfo.loginType !== Tw.AUTH_LOGIN_TYPE.EASY ) {
      var svcInfo = this._svcInfo;
      // (회선등급이 P(PPS), S(유선서비스), N(준회원) 일때 가입불가
      if ((!svcInfo.svcAttrCd || svcInfo.svcAttrCd === '') || ['S1', 'S2', 'S3'].indexOf(svcInfo.svcAttrCd) > -1 || svcInfo.svcGr === 'P') {
        this._onPopupNoJoin();
      }
      // 가입 가능여부 API 기 호출시 호출하지 않음.
      else if ( Tw.FormatHelper.isEmpty(this._isJoinOk) ) {
        this.reqPossibleJoin();
      } else {
        // 가입 가능일 때 가입하기 화면 이동
        if (this._isJoinOk === 'Y') {
          this._historyService.goLoad('/membership/join');
        } else { // 가입불가일 때, 안내 팝업 띄움
          this._onPopupNoJoin();
        }
      }
    } else { // 비 로그인시 팝업띄움
      this._popupService.openConfirmButton(
        Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A68.MSG,
        Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A68.TITLE,
        $.proxy(function () {
          this._popupService.close();
          setTimeout($.proxy(function(){
            this._tidLanding.goLogin();
          }, this), 300);
        }, this),
        null,
        Tw.BUTTON_LABEL.CLOSE,
        Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A68.BUTTON
      );
    }
  },
  /**
   * @function
   * @desc API Fail
   * @param {JSON} err
   */
  _onFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};