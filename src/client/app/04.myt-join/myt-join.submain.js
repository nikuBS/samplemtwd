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
  this._lineService = new Tw.LineComponent();
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');
  this.data = params.data;
  this.loadingView(true);
  this._rendered();
  this._bindEvent();
  this._initialize();
};

Tw.MyTJoinSubMain.prototype = {

  loadingView: function (value) {
    if ( value ) {
      skt_landing.action.loading.on({
        ta: '.wrap', co: 'grey', size: true
      });
    }
    else {
      skt_landing.action.loading.off({
        ta: '.wrap'
      });
    }
  },

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
      if (this.data.myPausedState && this.data.myPausedState.svcStSd) {
        this.$pauseC = this.$container.find('[data-id=pause_c]');
      }
    }
    // 유선
    else if ( this.data.type === 2 ) {
      this.$wireInq = this.$container.find('[data-id=wire-inq]');
      this.$bTargetInq = this.$container.find('[data-id=B-target-inq]');
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
        this.$otherLines = this.$container.find('[data-id=other-lines] li');
        if ( this.data.otherLines.length > 20 ) {
          this.$otherLinesMoreBtn = this.$otherLines.find('.bt-more button');
          this.$moreTempleate = Handlebars.compile(Tw.MYT_TPL.JOIN_SUBMAIN.MORE_LINE_TEMP);
        }
      }
    }
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
      if (this.data.myPausedState && this.data.myPausedState.svcStSd) {
        this.$pauseC.on('click', $.proxy(this._onMovedMobilePause, this));
      }
    }
    // 유선
    else if ( this.data.type === 2 ) {
      this.$wireInq.on('click', $.proxy(this._onMovedWireInquire, this));
      this.$bTargetInq.on('click', $.proxy(this._onMovedBInquire, this));
      this.$addrChg.on('click', $.proxy(this._onMovedWireOtherSvc, this));
      this.$prodChg.on('click', $.proxy(this._onMovedWireOtherSvc, this));
      this.$instChg.on('click', $.proxy(this._onMovedWireOtherSvc, this));
      this.$transferFee .on('click', $.proxy(this._onMovedWireOtherSvc, this));
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
  },

  _initialize: function () {
    this.loadingView(false);
  },
  // 나의요금제
  _onMovedMyPlan: function() {
    this._historyService.goLoad('/myt/join/product/fee-plan');
  },
  // 고객보호비밀번호 변경
  _onMovedChangePwd: function() {
    this._historyService.goLoad('/myt/join/protect/change');
  },
  // 부가 상품
  _onMovedAddProduct: function() {
    this._historyService.goLoad('/myt/join/product/additions');
  },
  // 결합 상품
  _onMovedComProduct: function() {
    this._historyService.goLoad('/myt/join/product/combinations');
  },
  // 약정 할인
  _onMovedInstallement: function() {
    this._historyService.goLoad('/myt/join/info/discount');
  },
  // 무약정플랜
  _onMovedContractPlan: function() {
    this._historyService.goLoad('/myt/join/info/no-agreement');
  },
  // 모바일 일시정지/해제
  _onMovedMobilePause: function() {
    // TODO: 우선 TBD로 alert 처리, SP9 진행 예정
    // this._historyService.goLoad('/myt/join/suspend');
    this._popupService.openAlert('TBD');
  },
  // 인터넷/IPTV/집전화 신청 내역 및 조회
  _onMovedWireInquire: function() {
    // TODO: 우선 TBD로 alert 처리, SP9 진행 예정
    this._popupService.openAlert('TBD');
  },
  // B끼리 무료통화 대상자 조회
  _onMovedBInquire: function() {
    // TODO: 우선 TBD로 alert 처리, SP9 진행 예정
    this._popupService.openAlert('TBD');
  },
  // 유선기타서비스
  _onMovedWireOtherSvc: function() {
    // TODO: 우선 TBD로 alert 처리, SP9 진행 예정
    this._popupService.openAlert('TBD');
  },

  // 다른회선조회
  _onClickedOtherLine: function (event) {
    // 통합, 개별이면서 대표인 경우만 동작
    var $target = $(event.target).parents('[data-svc-mgmt-num]'),
        mgmtNum = $target.attr('data-svc-mgmt-num'),
        number  = $target.attr('data-num'),
        name    = $target.attr('data-name');
    // 기준회선변경
    var defaultLineInfo = this.data.svcInfo.svcNum + ' ' + this.data.svcInfo.nickNm;
    var selectLineInfo = number + ' ' + name;
    this.changeLineMgmtNum = mgmtNum;
    this._popupService.openModalTypeA(Tw.REMNANT_OTHER_LINE.TITLE,
      defaultLineInfo + Tw.MYT_TPL.DATA_SUBMAIN.SP_TEMP + selectLineInfo,
      Tw.REMNANT_OTHER_LINE.BTNAME, null, $.proxy(this._onChangeLineConfirmed, this), null);
  },

  // 다른 회선 팝업에서 변경하기 눌렀을 경우
  _onChangeLineConfirmed: function () {
    this._lineService.changeLine(this.changeLineMgmtNum, null, $.proxy(this._onChangeSessionSuccess, this));
  },

  // 회선 변경 후 처리
  _onChangeSessionSuccess: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._popupService.close();
      if ( Tw.BrowserHelper.isApp() ) {
        this._popupService.toast(Tw.REMNANT_OTHER_LINE.TOAST);
      }
      setTimeout($.proxy(function () {
        this._historyService.reload();
      }, this), 300);
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
        this.$otherLines.parents('ul.list-comp-lineinfo').append(result);
      }
    }
  }
};
