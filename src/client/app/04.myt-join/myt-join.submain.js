/**
 * FileName: myt-join.submain.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.10
 *
 */

Tw.MyTJoinSubMain = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._nicknamePopup = new Tw.NicknameComponent();
  this.data = params.data;
  this._rendered();
  this._bindEvent();
  this._initialize();
};

Tw.MyTJoinSubMain.prototype = {
  _rendered: function () {
    this.$myPlan = this.$container.find('[data-id=my-plan]');
    this.$ptPwd = this.$container.find('[data-id=change-pwd]');

    if ( this.data.isAddProduct ) {
      // 부가상품 버튼
      this.$addProd = this.$container.find('[data-id=add-prod]');
      // 결합상품 버튼
      this.$comProd = this.$container.find('[data-id=com-prod]');
    }
    // 무선
    if ( this.data.type === 0 ) {
      if ( this.data.isInstallement ) {
        this.$installement = this.$container.find('[data-id=installement]');
      }
      if ( this.data.isContractPlan ) {
        this.$contractPlan = this.$container.find('[data-id=contract-plan]');
      }
      if ( this.data.myPausedState && this.data.myPausedState.svcStCd ) {
        this.$pauseC = this.$container.find('[data-id=pause_c]');
      }
      if ( this.data.isOldNumber ) {
        this.$oldNum = this.$container.find('[data-id=old_number]');
      }

      if ( this.data.isNotChangeNumber ) {
        this.$chgNumSvc = this.$container.find('[data-id=change_number]');
      }
    }
    // 유선
    else if ( this.data.type === 2 ) {
      this.$wireInq = this.$container.find('[data-id=wire-inq]');
      if ( this.data.isWireFree ) {
        this.$bTargetInq = this.$container.find('[data-id=B-target-inq]');
      }
      this.$addrChg = this.$container.find('[data-id=addr-chg]');
      this.$prodChg = this.$container.find('[data-id=prod-chg]');
      this.$instChg = this.$container.find('[data-id=inst-chg]');
      this.$transferFee = this.$container.find('[data-id=transfer-fee]');
      this.$svcCancel = this.$container.find('[data-id=svc-cancel]');
      this.$wirePause = this.$container.find('[data-id=wire-pause]');
      this.$untillInfo = this.$container.find('[data-id=until-info]');
      this.$workNotify = this.$container.find('[data-id=work-notify]');
    }

    if ( this.data.type !== 1 ) {
      if ( this.data.otherLines.length > 0 ) {
        this.$otherLines = this.$container.find('[data-id=other-lines]');
        if ( this.data.otherLines.length > 20 ) {
          this.$otherLinesMoreBtn = this.$otherLines.find('.bt-more button');
          this.$moreTempleate = Handlebars.compile(Tw.MYT_TPL.JOIN_SUBMAIN.MORE_LINE_TEMP);
        }
      }
    }
    this.$joinService = this.$container.find('[data-id=join-svc]');
    this.$nickNmBtn = this.$container.find('[data-id=change-nick]');
  },

  _bindEvent: function () {
    this.$myPlan.on('click', $.proxy(this._onMovedMyPlan, this));
    this.$ptPwd.on('click', $.proxy(this._onMovedChangePwd, this));

    if ( this.data.isAddProduct ) {
      // 부가상품 버튼
      this.$addProd.on('click', $.proxy(this._onMovedAddProduct, this));
      // 결합상품 버튼
      this.$comProd.on('click', $.proxy(this._onMovedComProduct, this));
    }
    // 무선
    if ( this.data.type === 0 ) {
      if ( this.data.isInstallement ) {
        this.$installement.on('click', $.proxy(this._onMovedInstallement, this));
      }
      if ( this.data.isContractPlan ) {
        this.$contractPlan.on('click', $.proxy(this._onMovedContractPlan, this));
      }
      if ( this.data.myPausedState && this.data.myPausedState.svcStCd ) {
        this.$pauseC.on('click', $.proxy(this._onMovedMobilePause, this));
      }
      if ( this.data.isOldNumber ) {
        this.$oldNum.on('click', $.proxy(this._onMoveOldNum, this));
      }
      if ( this.data.isNotChangeNumber ) {
        this.$chgNumSvc.on('click', $.proxy(this._onMoveChgNumSvc, this));
      }
    }
    // 유선
    else if ( this.data.type === 2 ) {
      this.$wireInq.on('click', $.proxy(this._onMovedWireInquire, this));
      if ( this.data.isWireFree ) {
        this.$bTargetInq.on('click', $.proxy(this._onMovedBInquire, this));
      }
      this.$addrChg.on('click', $.proxy(this._onMovedWireOtherSvc, this));
      this.$prodChg.on('click', $.proxy(this._onMovedWireOtherSvc, this));
      this.$instChg.on('click', $.proxy(this._onMovedWireOtherSvc, this));
      this.$transferFee.on('click', $.proxy(this._onMovedWireOtherSvc, this));
      this.$svcCancel.on('click', $.proxy(this._onMovedWireOtherSvc, this));
      this.$wirePause.on('click', $.proxy(this._onMovedWireOtherSvc, this));
      this.$untillInfo.on('click', $.proxy(this._onMovedWireOtherSvc, this));
      this.$workNotify.on('click', $.proxy(this._onMovedWireOtherSvc, this));
    }

    if ( this.data.type !== 1 ) {
      if ( this.data.otherLines.length > 0 ) {
        this.$otherLines.on('click', $.proxy(this._onClickedOtherLine, this));
        if ( this.data.otherLines.length > 20 ) {
          this.$otherLinesMoreBtn.on('click', $.proxy(this._onOtherLinesMore, this));
        }
      }
    }
    this.$joinService.on('click', $.proxy(this._onMovedJoinService, this));
    this.$nickNmBtn.on('click', $.proxy(this._onChangeNickName, this));
  },

  _initialize: function () {
    setTimeout(function() {
      window.scrollTo(0, 0);
    }, 500);
  },

  _onChangeNickName: function () {
    var nickNm = this.data.svcInfo.nickNm;
    var svcMgmtNum = this.data.svcInfo.svcMgmtNum;
    this._nicknamePopup.openNickname(nickNm, svcMgmtNum, $.proxy(this._onCloseNickNAmePopup, this));
  },

  _onCloseNickNAmePopup: function () {
    this._historyService.reload();
  },

  _onMovedJoinService: function () {
    var type = 'cellphone';
    switch ( this.data.svcInfo.svcAttrCd ) {
      case 'S1':
        type = 'internet';
        break;
      case 'S2':
        type = 'tv';
        break;
      case 'S3':
        type = 'phone';
        break;
    }
    this._historyService.goLoad('/product/wireplan/join/reservation?type_cd=' + type);
  },

  // 010 번호 전환 서비스
  _onMoveOldNum: function () {
    this._historyService.goLoad('/myt-join/submain/numchange');
  },

  // 번호안내서비스
  _onMoveChgNumSvc: function () {
    if ( this.data.numberChanged ) {
      // 연장 & 해지
      this._historyService.goLoad('/myt-join/submain/phone/extalarm');
    }
    else {
      // 신청
      this._historyService.goLoad('/myt-join/submain/phone/alarm');
    }
  },

  // 나의요금제
  _onMovedMyPlan: function () {
    this._historyService.goLoad('/myt-join/myplan');
  },
  // 고객보호비밀번호 변경
  _onMovedChangePwd: function () {
    this._historyService.goLoad('/myt-join/custpassword');
  },
  // 부가 상품
  _onMovedAddProduct: function () {
    this._historyService.goLoad('/myt-join/additions');
  },
  // 결합 상품
  _onMovedComProduct: function () {
    this._historyService.goLoad('/myt-join/myplancombine');
  },
  // 약정 할인
  _onMovedInstallement: function () {
    this._historyService.goLoad('/myt-join/myplancombine/infodiscount');
  },
  // 무약정플랜
  _onMovedContractPlan: function () {
    this._historyService.goLoad('/myt-join/myplancombine/noagreement');
  },
  // 모바일 일시정지/해제
  _onMovedMobilePause: function () {
    if( this.data.myPausedState.state || this.data.myLongPausedState.state ) {
      // 일시정지 중이거나 장기일시 중이거나 하는 경우 신청현황
      this._historyService.goLoad('submain/suspend/status');
    }
    else {
      // 신청해
      this._historyService.goLoad('/myt-join/submain/suspend#temporary');
    }
  },
  // 인터넷/IPTV/집전화 신청 내역 및 조회
  _onMovedWireInquire: function () {
    this._historyService.goLoad('/myt-join/submain/wire');
  },
  // B끼리 무료통화 대상자 조회
  _onMovedBInquire: function () {
    this._historyService.goLoad('/myt-join/submain/wire/freecallcheck');
  },
  // 유선기타서비스
  _onMovedWireOtherSvc: function (event) {
    var $target = $(event.target);
    switch ( $target.attr('data-id') ) {
      case 'addr-chg':
        this._historyService.goLoad('/myt-join/submain/wire/modifyaddress');
        break;
      case 'prod-chg':
        this._historyService.goLoad('/myt-join/submain/wire/modifyproduct');
        break;
      case 'transfer-fee':
        this._historyService.goLoad('/myt-join/submain/wire/changeowner');
        break;
      case 'inst-chg':
        this._historyService.goLoad('/myt-join/submain/wire/modifyperiod');
        break;
      case 'svc-cancel':
        this._historyService.goLoad('/myt-join/submain/wire/cancelsvc');
        break;
      case 'wire-pause':
        this._historyService.goLoad('/myt-join/submain/wire/wirestopgo');
        break;
      case 'until-info':
        this._historyService.goLoad('/myt-join/myinfo/contract');
        break;
      case 'work-notify':
        this._historyService.goLoad('/myt-join/wire/wiredo/sms');
        break;
    }
  },

  // 다른회선조회
  _onClickedOtherLine: function (event) {
    // 통합, 개별이면서 대표인 경우만 동작
    var $target = $(event.target).parents('[data-svc-mgmt-num]'),
        mgmtNum = $target.attr('data-svc-mgmt-num'),
        number  = $target.attr('data-num'),
        name    = $target.attr('data-name');
    if ( mgmtNum ) {
      // 기준회선변경
      var defaultLineInfo = this.data.svcInfo.svcNum + ' ' + this.data.svcInfo.nickNm;
      var selectLineInfo = number + ' ' + name;
      this.changeLineMgmtNum = mgmtNum;
      this._popupService.openModalTypeA(Tw.REMNANT_OTHER_LINE.TITLE,
        defaultLineInfo + Tw.MYT_TPL.DATA_SUBMAIN.SP_TEMP + selectLineInfo,
        Tw.REMNANT_OTHER_LINE.BTNAME, null, $.proxy(this._onChangeLineConfirmed, this), null);
    }
  },

  // 다른 회선 팝업에서 변경하기 눌렀을 경우
  _onChangeLineConfirmed: function () {
    var lineService = new Tw.LineComponent();
    lineService.changeLine(this.changeLineMgmtNum, null, $.proxy(this._onChangeSessionSuccess, this));
  },

  // 회선 변경 후 처리
  _onChangeSessionSuccess: function () {
    this._historyService.reload();
    if ( Tw.BrowserHelper.isApp() ) {
      setTimeout($.proxy(function () {
        this._popupService.toast(Tw.REMNANT_OTHER_LINE.TOAST);
      }, this), 500);
    }
  },

  // 다른 회선 더보기
  _onOtherLinesMore: function () {
    var totalCount = this.data.otherLines.length - this.$otherLines.length;
    if ( totalCount > 0 ) {
      this.data.otherLines.splice(0, totalCount);
      var length = this.data.otherLines.length > 20 ? 20 : this.data.otherLines.length;
      for ( var i = 0; i < length; i++ ) {
        var result = this.$moreTempleate(this.data.otherLines[i]);
        this.$container.parents('ul.my-line-info').append(result);
      }
    }
  }
};
