/**
 * @file myt-join.submain.js
 * @author Kim InHwan (skt.P132150@partner.sk.com)
 * @since 2018-10-10
 *
 */

/**
 * @class
 * @desc MyT > 나의 가입정보 > submain
 * @param {Object} params
 * @param {jQuery} params.$element
 * @param {Object} params.data
 */
Tw.MyTJoinSubMain = function (params) {
  this.$container = params.$element;
  this._data = params.data;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._nicknamePopup = new Tw.NicknameComponent();
  // [OP002-4773] 장기일시정지 재신청 과정 간소화
  // this._dateHelper = Tw.DateHelper;
  this._rendered();
  this._bindEvent();
  this._initialize();
  // 배너 관련 통계 이벤트(xtractor)
  this._xtractorService = new Tw.XtractorService(this.$container);
};

Tw.MyTJoinSubMain.prototype = {
  _rendered: function () {
    this.$myPlan = this.$container.find('[data-id=my-plan]');
    this.$ptPwd = this.$container.find('[data-id=change-pwd]');

    if ( this._data.isAddProduct ) {
      // 부가상품 버튼
      this.$addProd = this.$container.find('[data-id=add-prod]');
      // 결합상품 버튼
      this.$comProd = this.$container.find('[data-id=com-prod]');
    }
    // 유선
    if ( this._data.type === 2 ) {
      this.$wireInq = this.$container.find('[data-id=wire-inq]');
      if ( this._data.isWireFree ) {
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
    } else {
      if ( this._data.isInstallement ) {
        this.$installement = this.$container.find('[data-id=installement]');
      }
      if ( this._data.isContractPlan ) {
        this.$contractPlan = this.$container.find('[data-id=contract-plan]');
      }
      // 무선
      // 포켓파이 회선 추가 OP002-1517
      if ( this._data.type === 0 || this._data.svcInfo.svcAttrCd === 'M3' ) {
        if ( this._data.myPausedState && this._data.myPausedState.svcStCd ) {
          this.$pauseC = this.$container.find('[data-id=pause_c]');
        }
        // 무선
        if ( this._data.type === 0 ) {
          if ( this._data.isOldNumber ) {
            this.$oldNum = this.$container.find('[data-id=old_number]');
          }
          if ( this._data.isNotChangeNumber ) {
            this.$chgNumSvc = this.$container.find('[data-id=change_number]');
          }
        }
      }
    }

    if ( this._data.type !== 1 ) {
      if ( this._data.otherLines.length > 0 ) {
        this.$otherLines = this.$container.find('[data-id=other-lines]');
        if ( this._data.otherLines.length > 20 ) {
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

    if ( this._data.isAddProduct ) {
      // 부가상품 버튼
      this.$addProd.on('click', $.proxy(this._onMovedAddProduct, this));
      // 결합상품 버튼
      this.$comProd.on('click', $.proxy(this._onMovedComProduct, this));
    }
    // 유선
    if ( this._data.type === 2 ) {
      this.$wireInq.on('click', $.proxy(this._onMovedWireInquire, this));
      if ( this._data.isWireFree ) {
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
      this.$container.on('click', '#fe-wire-num-change', $.proxy(this._onChangeWireNumber, this));
    } else {
      if ( this._data.isInstallement ) {
        this.$installement.on('click', $.proxy(this._onMovedInstallement, this));
      }
      if ( this._data.isContractPlan ) {
        this.$contractPlan.on('click', $.proxy(this._onMovedContractPlan, this));
      }
      // 무선
      // 포켓파이 회선추가 OP002-1517
      if ( this._data.type === 0 || this._data.svcInfo.svcAttrCd === 'M3' ) {
        if ( this._data.myPausedState && this._data.myPausedState.svcStCd ) {
          this.$pauseC.on('click', $.proxy(this._onMovedMobilePause, this));
        }
        if ( this._data.type === 0 ) {
          if ( this._data.isOldNumber ) {
            this.$oldNum.on('click', $.proxy(this._onMoveOldNum, this));
          }
          if ( this._data.isNotChangeNumber ) {
            this.$chgNumSvc.on('click', $.proxy(this._onMoveChgNumSvc, this));
          }
        }
      }
    }

    if ( this._data.type !== 1 ) {
      if ( this._data.otherLines.length > 0 ) {
        this.$otherLines.on('click', $.proxy(this._onClickedOtherLine, this));
        if ( this._data.otherLines.length > 20 ) {
          this.$otherLinesMoreBtn.on('click', $.proxy(this._onOtherLinesMore, this));
        }
      }
    }
    this.$joinService.on('click', $.proxy(this._onMovedJoinService, this));
    this.$nickNmBtn.on('click', $.proxy(this._onChangeNickName, this));
    this.$certifyBtn.on('click', $.proxy(this._onOpenCertifyPopup, this));
    this.$container.find('[data-id=br-opening-detail]').on('click', $.proxy(this._onOpeningDetailClicked, this));
  },

  _initialize: function () {
    //this._initBanners();
    this._getTosAdminMytJoinBanner();

    // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
    this._lineComponent = new Tw.LineComponent(this.$container, '.fe-bt-line', true, null);
  },

  /**
   * @function
   * @desc 토스 배너 정보 요청
   * @private
   */
  _getTosAdminMytJoinBanner: function () {
    this._apiService
      .requestArray([
        { command: Tw.NODE_CMD.GET_NEW_BANNER_TOS, params: { code: '0010' } },
        { command: Tw.NODE_CMD.GET_BANNER_ADMIN, params: { menuId: this._data.pageInfo.menuId } }
      ])
      .done($.proxy(this._successTosAdminMytJoinBanner, this))
      .fail($.proxy(this._errorRequest, this));
  },

  /**
   * @function
   * @desc 토스 배너 처리
   * @param banner1
   * @param admBanner
   * @private
   */
  _successTosAdminMytJoinBanner: function (banner1, admBanner) {
    var result = [{ target: 'M', banner: banner1 }];

    result.forEach(function (row) {
      if ( row.banner && row.banner.code === Tw.API_CODE.CODE_00 ) {
        if ( !row.banner.result.summary ) {
          row.banner.result.summary = { target: row.target };
        }
        row.banner.result.summary.kind = Tw.REDIS_BANNER_TYPE.TOS;
        row.banner.result.imgList = Tw.CommonHelper.setBannerForStatistics(row.banner.result.imgList, row.banner.result.summary);
      } else {
        row.banner = { result: { summary: { target: row.target }, imgList: [] } };
      }

      if ( admBanner.code === Tw.API_CODE.CODE_00 ) {
        row.banner.result.imgList = row.banner.result.imgList.concat(
          admBanner.result.banners.map(function (admbnr) {
            admbnr.kind = Tw.REDIS_BANNER_TYPE.ADMIN;
            admbnr.bnnrImgAltCtt = admbnr.bnnrImgAltCtt.replace(/<br>/gi, ' ');
            return admbnr;
          })
        );
      }
    });
    this._drawTosAdminMytJoinBanner(result);
  },

  /**
   * @function
   * @desc 토스 배너 렌더링
   * @param banners
   * @private
   */
  _drawTosAdminMytJoinBanner: function (banners) {
    _.map(banners, $.proxy(function (bnr) {
      if ( bnr.banner.result.bltnYn === 'N' ) {
        this.$container.find('ul.slider[data-location=' + bnr.target + ']').parents('div.nogaps').addClass('none');
      }

      if ( !Tw.FormatHelper.isEmpty(bnr.banner.result.summary) && bnr.banner.result.imgList.length > 0 ) {
        new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.TOS_ADMIN, bnr.banner.result.imgList,
          bnr.target, bnr.banner.result.prtyTp, $.proxy(this._successDrawBanner, this),
          $.proxy(this._errorDrawBanner, this));
      } else {
        this._errorDrawBanner();
      }
    }, this));

    new Tw.XtractorService(this.$container);

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
   * banner가 없는 경우
   * @param bannerList
   * @private
   */
  _errorDrawBanner: function(bannerList) {
    if (!bannerList || (bannerList && bannerList.length === 0)) {
      this.$container.find('[data-id=banners-empty]').hide();
      this.$container.find('[data-id=banners]').hide();
    }
  },

  /**
   * @function
   * @desc 닉네임 변경
   */
  _onChangeNickName: function (event) {
    var $target = $(event.currentTarget);
    var svcInfo = this._data.svcInfo;
    this._nicknamePopup.openNickname(svcInfo.nickNm, svcInfo.svcMgmtNum, $.proxy(this._onNicknamePopupClosed, this), $target);
  },
  /**
   * @function
   * @desc _onChangeNickName() close 콜백
   */
  _onNicknamePopupClosed: function () {
    this._historyService.reload();
  },
  /**
   * @function
   * @desc 가입상담예약 신청 및 조회 이동
   */
  _onMovedJoinService: function () {
    var type = 'cellphone';
    switch ( this._data.svcInfo.svcAttrCd ) {
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
    return false;
  },

  /**
   * @function
   * @desc 010 번호 전환 서비스
   */
  _onMoveOldNum: function () {
    this._historyService.goLoad('/myt-join/submain/numchange');
    return false;
  },

  /**
   * @function
   * @desc 번호안내서비스
   */
  _onMoveChgNumSvc: function () {
    if ( this._data.numberChanged ) {
      // 연장 & 해지
      this._historyService.goLoad('/myt-join/submain/phone/extalarm');
    } else {
      // 신청
      this._historyService.goLoad('/myt-join/submain/phone/alarm');
    }
    return false;
  },

  /**
   * @function
   * @desc  나의요금제
   */
  _onMovedMyPlan: function () {
    this._historyService.goLoad('/myt-join/myplan');
    return false;
  },
  /**
   * @function
   * @desc 고객보호비밀번호 변경
   */
  _onMovedChangePwd: function () {
    this._historyService.goLoad('/myt-join/custpassword');
    return false;
  },
  /**
   * @function
   * @desc 부가 상품
   */
  _onMovedAddProduct: function () {
    this._historyService.goLoad('/myt-join/additions');
    return false;
  },
  /**
   * @function
   * @desc 결합 상품
   */
  _onMovedComProduct: function () {
    if (parseInt(this._data.myAddProduct.comProdCnt, 10)) {
      this._historyService.goLoad('/myt-join/combinations');
    } else {
      this._historyService.goLoad('/product/combinations');
    }
    return false;
  },
  /**
   * @function
   * @desc 약정 할인
   */
  _onMovedInstallement: function () {
    this._historyService.goLoad('/myt-join/myplancombine/infodiscount');
    return false;
  },
  /**
   * @function
   * @desc 무약정플랜
   */
  _onMovedContractPlan: function () {
    var url = '/myt-join/myplancombine/noagreement';
    if ( !this._data.myContractPlan.muPointYn || this._data.myContractPlan.muPointYn === 'N' ) {
      url = '/product/callplan?prod_id=NA00005923';
    }
    this._historyService.goLoad(url);
    return false;
  },
  /**
   * @function
   * @desc 모바일 일시정지/해제
   */
  _onMovedMobilePause: function () {
    var stateMyPaused = this._data.myPausedState;
    var stateMyLongPaused = this._data.myLongPausedState;
    /*
    if ( stateMyPaused && (stateMyPaused.svcStCd === 'AC') && (stateMyPaused.armyDt || stateMyPaused.armyExtDt) ) {
      // [OP002-4773] 장기일시정지 재신청 과정 간소화
      // 장기일시정지 재신청: 군 장기일시정지 중 임시 해제 상태인 경우, 바로 재신청 가능하도록
      this._openResumeSuspendPopup(this.$pauseC);
    }
    else
    */
    if ( stateMyPaused ) {
      if ( stateMyPaused.reservedYn === 'Y' ) {
        // [OP002-1526]
        if ( stateMyPaused.fromDt === '99991231' ) {
          // 2G 장기 미사용 이용정지 화면 진입 불가
          this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.ERROR.UNUSED_2G_USER);
        } else {
          // 신청현황: 일시정지 예약중
          this._historyService.goLoad('submain/suspend/status');
        }
        return false;
      }
      if ( stateMyPaused.state ) {
        // 신청현황: 일시정지 중, 장기일시 중
        this._historyService.goLoad('submain/suspend/status');
        return false;
      }
    }
    if ( stateMyLongPaused && stateMyLongPaused.state ) {
      // 장기일시정지 처리완료 상태에서 멈추는 문제 해결 (장기일시정지, 처리완료, 신청일이 오늘 포함 이전이면, 새로 신청가능한 것으로
      if ( stateMyLongPaused.opStateCd !== 'C' || !stateMyLongPaused.stateReleased ) {
        // 신청현황: 일시정지 중, 장기일시 중
        this._historyService.goLoad('submain/suspend/status');
        return false;
      }
    }
    // 신청하기: "일시정지/해제"로 이동
    this._historyService.goLoad('/myt-join/submain/suspend#temporary');
    return false;
  },
  /*
  // [OP002-4773] 장기일시정지 재신청 과정 간소화
  _reformatDate: function (date) {
    return this._dateHelper.getShortDateWithFormat(date, 'YYYY.M.D.');
  },
  /!**
   * @function
   * @desc (군) 장기일시정지 중 일지 해제 후 재 신청(일시정지 다시 시작): 'Reduced Rate Suspend'
   * @param $target
   * @private
   *!/
  _openResumeSuspendPopup: function ($target) {
    var myPausedState = this._data.myPausedState;
    var period = {
      from: this._reformatDate(myPausedState.fromDt),
    };
    if (myPausedState.toDt) {
      period.to = this._reformatDate(this._data.myPausedState.toDt);
    }
    var data = {
      svcInfo: this._data.svcInfo,
      period: period,
      reason: myPausedState.svcChgRsnNm.replace(Tw.MYT_JOIN_SUSPEND.STATE_EXCLUDE, '')
    };
    this._popupService.open({
        hbs: 'MS_03_05_04',
        data: data
      }, $.proxy(this._onResumeSuspendPopupOpen, this, data), $.proxy(this._onResumeSuspendPopupClose, this), 'resume-suspend',
      $target);
  },
  */
  /**
   * @function
   * @desc Resume Suspend(장기일시정지 재신청) 요청 - open callback
   * @param $popup Resume Suspend(장기일시정지 재신청) popup element
   */
  _onResumeSuspendPopupOpen: function (data, $popup) {
    this._popupResumeSuspend = {
      $date: $popup.find('.date-selcet').find('input[type="date"]'),
      $start: $popup.find('button#fe-resuspend')
    };
    // 아래와 같이 하는 것이 더 빠르지만, utility 함수를 사용하는 것으로 표준화한다.
    // this._popupResumeSuspend.$date.val(new Date().toISOString().substring(0, 10));
    this._popupResumeSuspend.$date.val(Tw.DateHelper.getDateCustomFormat('YYYY-MM-DD'));
    this._popupResumeSuspend.$date.on('change', $.proxy(this._onResumeSuspendPopupDateChanged, this));
    this._popupResumeSuspend.$start.on('click', _.debounce($.proxy(this._requestResumeSuspend, this, data, $popup), 500));
  },
  /**
   * @function
   * @desc Resume Suspend(장기일시정지 재신청) 팝업 close Callback
   */
  _onResumeSuspendPopupClose: function () {
    // 초기화
    this._popupResumeSuspend.$date.off();
    this._popupResumeSuspend.$start.off();
    delete this._popupResumeSuspend;
  },
  /**
   * @function
   * @desc 일시정지 기한 변경 시 체크 [OP002-4422]
   * @param event
   */
  _onResumeSuspendPopupDateChanged: function (event) {
    var value = event.target.value;
    // 작업하는 중에도 시간은 변경될 수 있어서, 값을 돌릴때는 지금의 시간으로 넣음 (2019-10-30 23:59:59 -> 2019-10-31 00:00:00)
    var today = Tw.DateHelper.getDateCustomFormat('YYYY-MM-DD');
    if ( !value ) {
      event.target.value = this._popupResumeSuspend.dateValid || today;
      this._popupResumeSuspend.dateValid = event.target.value;
      return false;
    }
    /*
    var changed = Number(event.target.value.replace(/-/g, '') || 0); // this._$popupResumeSuspendDate.val().replace(/-/g, '');
    if (Number(today.replace(/-/g, '')) > changed) {
      event.target.value = today;
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_FROM_DATE,
        null, null, null, null, $(event.currentTarget));
      return false;
    }
    */
    var diff = Tw.DateHelper.getDiffByUnit(value, today.replace(/-/g, ''), 'days');
    // 오늘보다 이전이거나
    if ( diff < 0 ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_FROM_DATE);
      return false;
    }
    // 오늘보다 30일 이후거나
    if ( diff > 30 ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_FROM_DATE_01);
      return false;
    }
    // 마지막 성공한 값을 저장해 놓는다.
    this._popupResumeSuspend.dateValid = value;
  },
  /**
   * @function
   * @desc Resuspend(장기일시정지 재신청) 요청
   * @param data
   * @param $popup Resuspend(장기일시정지 재신청) popup element
   */
  _requestResumeSuspend: function (data /*$popup*/) {
    var fromDate = this._popupResumeSuspend.$date.val();
    // var fromDate = $popup.find('input[type="date"]').val();
    // TODO: 아래 구문은 필요없어 보이는데, 확인 후 삭제하자
    /*
    var diff = Tw.DateHelper.getDiffByUnit(fromDate, Tw.DateHelper.getCurrentShortDate(), 'days');
    if ( diff < 0 ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_FROM_DATE);
      return;
    }
    if ( diff > 30 ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_FROM_DATE_01);
      return;
    }
    */
    fromDate = fromDate.replace(/-/g, '');
    // var params = { fromDt: fromDate.replace(/-/g, '') };
    this._apiService.request(Tw.API_CMD.BFF_05_0151, { fromDt: fromDate })
      .done($.proxy(this._onResumeSuspendRequestSuccess, this, {
        fromDt: fromDate,
        toDt: data.period.to.replace(/\./g, '')
      }))
      .fail($.proxy(this._onResumeSuspendRequestError, this));
  },
  /**
   * @function
   * @desc Success callback for _requestResumeSuspend
   * @param params parameters for request API
   * @param res response
   * @private
   */
  _onResumeSuspendRequestSuccess: function (params, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      params.command = 'resuspend';
      params.svcNum = this._data.svcInfo.svcNum;
      // params.toDt = this._params.status.period.to;
      this._popupService.closeAllAndGo('/myt-join/submain/suspend/complete?' + $.param(params));
    } else if ( res.code in Tw.MYT_JOIN_SUSPEND.ERROR ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.ERROR[res.code] || res.msg);
    } else {
      this._onResumeSuspendRequestError(res);
    }
  },
  /**
   * @function
   * @desc Error call back
   * @param res
   */
  _onResumeSuspendRequestError: function (res) {
    Tw.Error(res.code, res.msg).pop();
  },
  /**
   * @function
   * @desc 인터넷/IPTV/집전화 신청 내역 및 조회
   */
  _onMovedWireInquire: function () {
    this._historyService.goLoad('/myt-join/submain/wire');
    return false;
  },
  /**
   * @function
   * @desc B끼리 무료통화 대상자 조회
   */
  _onMovedBInquire: function () {
    this._historyService.goLoad('/myt-join/submain/wire/freecallcheck');
    return false;
  },
  /**
   * @function
   * @desc 유선기타서비스
   * @param {Object} event
   */
  _onMovedWireOtherSvc: function (event) {
    switch ( $(event.currentTarget).attr('data-id') ) {
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
    event.preventDefault();
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

      var target = _.find(this._data.otherLines, { svcMgmtNum: mgmtNum });
      this._popupService.openSwitchLine(this._data.svcInfo, target, Tw.REMNANT_OTHER_LINE.BTNAME, null,
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
    if ( resp.code !== Tw.CALLBACK_CODE.SUCCESS ) {
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
    var totalCount = this._data.otherLines.length - index;
    if ( totalCount === 0 ) {
      this.$otherLinesMoreBtn.hide();
      return;
    }
    var length = totalCount > 20 ? 20 : totalCount;
    for ( var i = 0; i < length; i++ ) {
      var item = this._data.otherLines[index + i];
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
    if (Tw.BrowserHelper.isApp()) {
      Tw.Native.send(Tw.NTV_CMD.GO_CERT, {});
    } else {
      this._popupService.openAlert('앱 에서만 사용가능');
    }
  },
  /**
   * @function
   * @desc 유선회선 전화번호 변경 신청시 브로드랜드 가입회선 체크
   * @private
   */
  _onChangeWireNumber: function (e) {
    // coClCd: 회사구분코드, actCoClCd: 청구회사코드
    if ( this._data.svcInfo.coClCd === Tw.MYT_JOIN_CO_TYPE.BROADBAND ) { // 브로드밴드 가입자
      this._popupService.openConfirmButton(Tw.WIRE_NUMBER_CHANGE.ALERT_BROADBAND.CONTENTS,
        Tw.WIRE_NUMBER_CHANGE.ALERT_BROADBAND.TITLE,
        $.proxy(Tw.CommonHelper.openUrlExternal, this, Tw.OUTLINK.BROADBAND), null,
        Tw.BUTTON_LABEL.CLOSE, Tw.WIRE_NUMBER_CHANGE.ALERT_BROADBAND.BUTTON, $(e.currentTarget));
    } else {
      this._historyService.goLoad('/myt-join/submain/wire/numchange');
    }
    e.preventDefault();
  },
  /**
   *
   * @private
   */
  _onOpeningDetailClicked: function () {
    this._historyService.goLoad('/myt-join/submain/opening-detail');
    return false;
  }
  /*
  // Popup으로 구현했을 때,
  /!*
   *
   * @param {Object} event
   * @private
   *!/
  _onOpeningDetailClicked: function (event) {
    this._popupService.open({
      hbs: 'MS_01',
      data: {
      }
    }, $.proxy(this._onOpenDetailOpened, this), $.proxy(this._onOpenDetailClosed, this), 'detail',
      $(event.target));
  },
  /!**
   *
   * @param {jQuery} $popup
   * @private
   *!/
  _onOpenDetailOpened: function ($popup) {
    this._dlgOpenDetail = new Tw.MyTJoinMoreInfoDetail($popup, {
      onClosed: $.proxy(function () {}, this)
    });
  },
  /!**
   *
   * @private
   *!/
  _onOpenDetailClosed: function () {
    delete this._dlgOpenDetail;
  }
  */
};

Tw.MytJoinAdvSubMain = function () {
  Tw.MyTJoinSubMain.apply(this, arguments);
};

// overriding
Tw.MytJoinAdvSubMain.prototype = Object.create(Tw.MyTJoinSubMain.prototype);
Tw.MytJoinAdvSubMain.prototype.constructor = Tw.MytJoinAdvSubMain;
Tw.MytJoinAdvSubMain.prototype._rendered = function () {
  Tw.MyTJoinSubMain.prototype._rendered.call(this);
  this.$serviceArea = this.$container.find('[data-id=service-area]');
};
Tw.MytJoinAdvSubMain.prototype._bindEvent = function () {
  Tw.MyTJoinSubMain.prototype._bindEvent.call(this);
  if (this._data.type !== 1 && this._data.type !== 2) {
    this.$container.find('[data-id=mybenefit]').on('click', $.proxy(function() {
      this._historyService.goLoad('/benefit/submain');
      return false;
    }, this));
    this.$container.find('[data-id=membership]').on('click', $.proxy(function() {
      switch (this._data.membership.used) {
        case 1:
          // 가입하기
          this._historyService.goLoad('/membership/submain');
          break;
        default:
          // used => 0 or 2 간편로그인, 가입된 상태
          this._historyService.goLoad('/membership/my');
          break;
      }
      return false;
    }, this));
    this.$container.find('[data-id=benefitsub]').on('click', $.proxy(function() {
      if (this._data.benefitCount && parseInt(this._data.benefitCount, 10) > 0) {
        this._historyService.goLoad('/benefit/my');
      } else {
        this._historyService.goLoad('/benefit/submain');
      }
      return false;
    }, this));
  }
  if (this._data.paidBillInfo) {
    this.$container.find('[data-id=paidinfo]').on('click', $.proxy(function() {
      this._historyService.goLoad('/myt-fare/submain');
      return false;
    }, this));
    this.$container.find('[data-id=billtype]').on('click', $.proxy(function() {
      this._historyService.goLoad('/myt-fare/billsetup');
      return false;
    }, this));
    this.$container.find('[data-id=paymthd]').on('click', $.proxy(function() {
      this._historyService.goLoad('/myt-fare/bill/option');
      return false;
    }, this));
  }
};
Tw.MytJoinAdvSubMain.prototype._initialize = function() {
  Tw.MyTJoinSubMain.prototype._initialize.call(this);
  if (!(this._data.type === 0 || this._data.type === 2) && !this._data.isPwdSt) {
    // PPS, T-login, T-PocketFi 인 경우에는 고객비밀번호 사용하지 않는 다면 조회 신청 영역 숨김
    this.$serviceArea.hide();
  }

  // 약정할인금액 그래프 깨지는 문제 수정 건
  var disHorizonBar = $('.horizon-bar-wrap [data-id=my-discount-info]');
  if (disHorizonBar.length) {
    $(window).on('resize load', function(){
      var barBubble = disHorizonBar.children('.bar-bubble');
      disHorizonBar.children('.bar').width() < barBubble.outerWidth() ?
        barBubble.addClass('left') : barBubble.removeClass('left');
    });
  }
};
Tw.MytJoinAdvSubMain.prototype._successDrawBanner = function () {
  // 동적 생성 배너 오퍼통계코드 적용을 위해 추가
  Tw.MyTJoinSubMain.prototype._successDrawBanner.call(this)
  this.$bannerList.on('click', $.proxy(function() {
    this._xtractorService.logClick(this._data.xtCode.banner, 'NO');
    return false;
  }, this));
}
