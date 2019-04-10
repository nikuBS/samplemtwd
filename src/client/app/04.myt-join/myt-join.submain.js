/**
 * @file myt-join.submain.js
 * @author Kim InHwan (skt.P132150@partner.sk.com)
 * @since 2018-10-10
 *
 */

/**
 * @class
 * @desc MyT > 나의 가입정보 > submain
 * @param {JSON} params
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
  // 배너 관련 통계 이벤트(xtractor)
  new Tw.XtractorService(this.$container);
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
    // 유선
    if ( this.data.type === 2 ) {
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
    else {
      if ( this.data.isInstallement ) {
        this.$installement = this.$container.find('[data-id=installement]');
      }
      if ( this.data.isContractPlan ) {
        this.$contractPlan = this.$container.find('[data-id=contract-plan]');
      }
      // 무선
      if ( this.data.type === 0 ) {
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
    }

    if ( this.data.type !== 1 ) {
      if ( this.data.otherLines.length > 0 ) {
        this.$otherLines = this.$container.find('[data-id=other-lines]');
        if ( this.data.otherLines.length > 20 ) {
          this.$otherLinesMoreBtn = this.$otherLines.find('.btn-more button');
          this.$moreTempleate = Handlebars.compile(Tw.MYT_TPL.JOIN_SUBMAIN.MORE_LINE_TEMP);
        }
      }
    }
    this.$joinService = this.$container.find('[data-id=join-svc]');
    this.$nickNmBtn = this.$container.find('[data-id=change-nick]');
    this.$certifyBtn = this.$container.find('[data-id=certify-popup]');
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
    // 유선
    if ( this.data.type === 2 ) {
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
    else {
      if ( this.data.isInstallement ) {
        this.$installement.on('click', $.proxy(this._onMovedInstallement, this));
      }
      if ( this.data.isContractPlan ) {
        this.$contractPlan.on('click', $.proxy(this._onMovedContractPlan, this));
      }
      // 무선
      if ( this.data.type === 0 ) {
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
    this.$certifyBtn.on('click', $.proxy(this._onOpenCertifyPopup, this));
  },

  _initialize: function () {
    this._initBanners();
  },

  /**
   * @function
   * @desc Redis 배너 TOS 조회
   */
  _initBanners: function () {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_TOS, { code: '0008' })
      .done($.proxy(this._successBanner, this, Tw.REDIS_BANNER_TYPE.TOS))
      .fail($.proxy(this._errorRequest, this));
  },

  /**
   * @function
   * @desc _initBanners() > 성공 콜백
   * @param {String} type
   * @param {JSON} resp
   */
  _successBanner: function (type, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var result = resp.result;
      var isCheckBanner = type === Tw.REDIS_BANNER_TYPE.ADMIN || this._checkBanner(result);
      if ( isCheckBanner ) {
        var list = (type === Tw.REDIS_BANNER_TYPE.ADMIN) ? result.banners : result.imgList;
        new Tw.BannerService(this.$container, type, list, 'M', $.proxy(this._successDrawBanner, this));
      }
      else {
        this._apiService.request(Tw.NODE_CMD.GET_BANNER_ADMIN, { menuId: this.data.pageInfo.menuId })
          .done($.proxy(this._successBanner, this, Tw.REDIS_BANNER_TYPE.ADMIN))
          .fail($.proxy(this._errorRequest, this));
      }
    }
    else {
      this.$container.find('[data-id=banners-empty]').hide();
      this.$container.find('[data-id=banners]').hide();
    }
  },

  /**
   * @function
   * @desc TOS 연동 및 게시여부 확인
   * @param {JSON} result
   * @returns {boolean}
   */
  _checkBanner: function (result) {
    return (result.bltnYn === 'N' || result.tosLnkgYn === 'Y');
  },

  /**
   * @function
   * @desc Tw.BannerService 콜백
   */
  _successDrawBanner: function () {
    this.$bannerList = this.$container.find('[data-id=banner-list]');
    if ( Tw.BrowserHelper.isApp() ) {
      Tw.CommonHelper.resetHeight(this.$bannerList[0]);
    }
  },

  /**
   * @function
   * @desc 닉네임 변경
   */
  _onChangeNickName: function () {
    var nickNm = this.data.svcInfo.nickNm;
    var svcMgmtNum = this.data.svcInfo.svcMgmtNum;
    this._nicknamePopup.openNickname(nickNm, svcMgmtNum, $.proxy(this._onCloseNickNAmePopup, this));
  },
  /**
   * @function
   * @desc _onChangeNickName() close 콜백
   */
  _onCloseNickNAmePopup: function () {
    this._historyService.reload();
  },
  /**
   * @function
   * @desc 가입상담예약 신청 및 조회 이동
   */
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

  /**
   * @function
   * @desc 010 번호 전환 서비스
   */
  _onMoveOldNum: function () {
    this._historyService.goLoad('/myt-join/submain/numchange');
  },

  /**
   * @function
   * @desc 번호안내서비스
   */
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

  /**
   * @function
   * @desc  나의요금제
   */
  _onMovedMyPlan: function () {
    this._historyService.goLoad('/myt-join/myplan');
  },
  /**
   * @function
   * @desc 고객보호비밀번호 변경
   */
  _onMovedChangePwd: function () {
    this._historyService.goLoad('/myt-join/custpassword');
  },
  /**
   * @function
   * @desc 부가 상품
   */
  _onMovedAddProduct: function () {
    this._historyService.goLoad('/myt-join/additions');
  },
  /**
   * @function
   * @desc 결합 상품
   */
  _onMovedComProduct: function () {
    this._historyService.goLoad('/myt-join/combinations');
  },
  /**
   * @function
   * @desc 약정 할인
   */
  _onMovedInstallement: function () {
    this._historyService.goLoad('/myt-join/myplancombine/infodiscount');
  },
  /**
   * @function
   * @desc 무약정플랜
   */
  _onMovedContractPlan: function () {
    var url = '/myt-join/myplancombine/noagreement';
    if ( this.data.myContractPlan.muPointYn === 'N' ) {
      url = '/product/callplan?prod_id=NA00005923';
    }
    this._historyService.goLoad(url);
  },
  /**
   * @function
   * @desc 모바일 일시정지/해제
   */
  _onMovedMobilePause: function () {
    if ( (this.data.myPausedState && this.data.myPausedState.state) ||
      (this.data.myLongPausedState && this.data.myLongPausedState.state) ) {
      // 일시정지 중이거나 장기일시 중이거나 하는 경우 신청현황
      this._historyService.goLoad('submain/suspend/status');
    }
    else {
      // 신청해
      this._historyService.goLoad('/myt-join/submain/suspend#temporary');
    }
  },
  /**
   * @function
   * @desc 인터넷/IPTV/집전화 신청 내역 및 조회
   */
  _onMovedWireInquire: function () {
    this._historyService.goLoad('/myt-join/submain/wire');
  },
  /**
   * @function
   * @desc B끼리 무료통화 대상자 조회
   */
  _onMovedBInquire: function () {
    this._historyService.goLoad('/myt-join/submain/wire/freecallcheck');
  },
  /**
   * @function
   * @desc 유선기타서비스
   * @param {Object} event
   */
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
  /**
   * @function
   * @desc 다른회선조회
   * @param {Object} event
   */
  _onClickedOtherLine: function (event) {
    // 통합, 개별이면서 대표인 경우만 동작
    var $target = $(event.target).parents('[data-svc-mgmt-num]'),
      type    = $target.find('span.blind').text(),
      mgmtNum = $target.attr('data-svc-mgmt-num'),
      number  = $target.attr('data-num');
    if ( mgmtNum ) {
      // 기준회선변경
      // 닉네임이 없는 경우 팻네임이 아닌  서비스 그룹명으로 노출 [DV001-14845]
      this.changeLineType = type;
      this.changeLineMgmtNum = mgmtNum;
      this.changeLineMdn = number;

      var target  = _.find(this.data.otherLines,  {svcMgmtNum: mgmtNum});
      this._popupService.openSwitchLine(this.data.svcInfo, target, Tw.REMNANT_OTHER_LINE.BTNAME, null,
        $.proxy(this._onChangeLineConfirmed, this), null, 'change_line');
    }
  },
  /**
   * @function
   * @desc 다른 회선 팝업에서 변경하기 눌렀을 경우
   */
  _onChangeLineConfirmed: function () {
    this._popupService.close();
    var lineService = new Tw.LineComponent();
    lineService.changeLine(this.changeLineMgmtNum, this.changeLineMdn, $.proxy(this._onChangeSessionSuccess, this));
  },
  /**
   * @function
   * @desc 회선 변경 후 처리
   * @param {JSON} resp
   */
  _onChangeSessionSuccess: function (resp) {
    if (resp.code !== Tw.CALLBACK_CODE.SUCCESS) {
      return;
    }
    if ( Tw.BrowserHelper.isApp() ) {
      Tw.CommonHelper.toast(Tw.REMNANT_OTHER_LINE.TOAST);
    }
    setTimeout($.proxy(function () {
      this._historyService.replaceURL('/myt-join/submain');
    }, this), 500);
  },
  /**
   * @function
   * @desc 다른 회선 더보기
   */
  _onOtherLinesMore: function () {
    var index = this.$otherLines.find('li').length;
    var totalCount = this.data.otherLines.length - index;
    if (totalCount === 0) {
      this.$otherLinesMoreBtn.hide();
      return;
    }
    var length = totalCount > 20 ? 20 : totalCount;
    for ( var i = 0; i < length; i++ ) {
      var item = this.data.otherLines[index + i];
      var data = _.extend({
        number: (['S1', 'S2'].indexOf(item.svcAttrCd) > -1) ? item.addr : item.svcNum
      }, item);
      var result = this.$moreTempleate(data);
      this.$container.find('ul.my-line-info').append(result);
    }

  },
  /**
   * @function
   * @desc 공인인증센터
   */
  _onOpenCertifyPopup: function () {
    Tw.Native.send(Tw.NTV_CMD.GO_CERT, {});
  }
};
