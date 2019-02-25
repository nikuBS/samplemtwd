/**
 * FileName: membership-info.layer.component.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Editor: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.10.29
 *
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
  open: function (hbs) {
    // BE_04_01_L01, BE_04_01_L02, BE_04_01_L03
    this._hbs = hbs;
    var option = {
      hbs: this._hbs,// hbs의 파일명
      layer: true
    };
    if ( this._hbs === 'BE_04_01_L01' ) {
      option.data = {
        tpleUrl: Tw.OUTLINK.TPLECARD_BENEFIT,
        coupleUrl: Tw.OUTLINK.COUPLECARD_BENEFIT
      };
    }
    this._popupService.open(option, $.proxy(this._openCallback, this), $.proxy(this._closeCallback, this), this._hbs);
  },

  _openCallback: function ($element) {
    if ( this._hbs === 'BE_04_01_L02' ) {
      $element.find('button[data-id=join]').off().on('click', $.proxy(this.onClickJoinBtn, this));
    }
    else if ( this._hbs === 'BE_04_01_L01' ) {
      $element.find('.fe-outlink').off().on('click', $.proxy(this._openExternalUrl,this));
    }
  },

  _openExternalUrl : function (e) {
    e.preventDefault();
    var _url = $(e.currentTarget).attr('href');
    this._popupService.close();
    Tw.CommonHelper.openUrlExternal(_url);
  },

  // 가입 가능여부 조회 요청
  reqPossibleJoin : function(){
    if ( !Tw.FormatHelper.isEmpty(this._isJoinOk) ) {
      return;
    }

    this._apiService
      .request(Tw.API_CMD.BFF_11_0015, {})
      .done($.proxy(this._onSuccess, this))
      .fail($.proxy(this._onFail, this));
  },

  _onSuccess : function (resp) {
    if ( resp.code !== Tw.API_CODE.CODE_00 ) {
      this._onFail(resp);
      return false;
    }
    var svcInfo = this._svcInfo;
    this._isJoinOk = 'Y';

    /*
      가입 가능여부 확인 ( 아래 case 인경우는 가입불가 )
      1. (회선등급이 P(PPS), S(유선서비스), N(준회원)
      2. 미성년자인 경우
      3. 기 발급 카드 보유 상태인 경우
     */
    if (resp.result) {
      if (['S1', 'S2', 'S3'].indexOf(svcInfo.svcAttrCd) > -1 || svcInfo.svcGr === 'P') {
        this._isJoinOk = 'N';
      } else if (resp.result.adultYn === 'N') {
        this._isJoinOk = 'N';
      } else if (resp.result.hasNotCardYn === 'N') {
        this._isJoinOk = 'N';
      }
    } else {
      this._isJoinOk = 'N';
    }

    this.onClickJoinBtn();
  },

  _closeCallback: function () {
    this._popupService.close();
  },

  // T멤버십 가입불가 팝업
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

  // 가입하기 버튼 클릭
  onClickJoinBtn: function () {
    // 로그인 유형이 간편 로그인이 아닌경우
    if(this._svcInfo && this._svcInfo.loginType !== Tw.AUTH_LOGIN_TYPE.EASY ) {
      // 준회원 일때는 BFF_11_0015 호출하면 안됨. 준회원 여부 : TID에 회선이 없는 고객이 준회원입니다.
      if (this._svcInfo.svcAttrCd === '') {
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
          this._tidLanding.goLogin();
        }, this),
        $.proxy(function () {
          this._popupService.close();
        }, this),
        Tw.BUTTON_LABEL.CLOSE,
        Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A68.BUTTON
      );
    }
  },

  // API Fail
  _onFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};