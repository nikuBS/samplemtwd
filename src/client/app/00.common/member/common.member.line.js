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
 * @param totalExposedCnt,
 * @param svcInfo
 * @constructor
 */
Tw.CommonMemberLine = function (rootEl, defaultCnt, totalExposedCnt, svcInfo) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._nicknamePopup = new Tw.NicknameComponent();
  this._historyService = new Tw.HistoryService();
  this._svcInfo = svcInfo;
  this._defaultCnt = defaultCnt;
  this._totalExposedCnt = Tw.FormatHelper.isEmpty(totalExposedCnt) ? 0 : Number(totalExposedCnt);
  this.lineMarketingLayer = new Tw.LineMarketingComponent();
  new Tw.XtractorService(this.$container);
  this._marketingSvc = '';

  this._changeList = false;
  this.$showNickname = null;
  this.$showMenuBtn = null;
  // this._isCertPopupOpen = false;

  this._init();
  this._bindEvent();
};

Tw.CommonMemberLine.prototype = {

  /**
   * @function
   * @desc 최초실행
   * @private
   */
  _init: function () {
    // [OP002-12787] 접근성 이슈로 인해 popupService 사용 불가로 show/hide 처리하도록 변경
    // 팝업 노출 순서: 두가지 팝업 모두 노출 시 (브로드밴드 팝업 -> 가이드 팝업)
    this.$guidePopup = $('body').find('#fe-pop-guide');
    this.$popBroadBand = $('body').find('#fe-pop-broadband');
    // 모바일App
    if (Tw.BrowserHelper.isApp()) {
      var storedData = Tw.CommonHelper.getLocalStorage('hideSkbAgreePop_' + this._svcInfo.userId);
      // 최초 접근시 또는 다음에 보기 체크박스 클릭하지 않은 경우
      if (Tw.FormatHelper.isEmpty(storedData)) {
        this._openPopup();
      }
      // 그 외 경우 처리
      else {
        storedData = JSON.parse(storedData);
        var now = new Date();
        now = Tw.DateHelper.convDateFormat(now);
        if (Tw.DateHelper.convDateFormat(storedData.expireTime) < now) { // 만료시간이 지난 데이터 일 경우
          // console.log('만료시점이 지난 경우 (노출)');
          // SK브로드밴드 서비스 이용 동의 팝업 노출
          this._openPopup();
        } else {
          // console.log('만료시점 이전인 경우 (비노출)');
        }
      }
    }
    // 모바일웹
    else {
      if (Tw.CommonHelper.getCookie('hideSkbAgreePop_' + this._svcInfo.userId) !== null) {
        // console.log('다음에 보기 처리 이력 존재');
      } else {
        // console.log('최초 접근시 또는 다음에 보기 체크박스 클릭하지 않은 경우 (노출)');
        // SK브로드밴드 서비스 이용 동의 팝업 노출
        this._openPopup();
      }
    }
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '#contents', $.proxy(this._closeManageMenu, this));
    this.$container.on('click', '.fe-manage-line', $.proxy(this._openManagePopup, this));
    this.$container.on('click', '.fe-bt-guide', $.proxy(this._openGuidePopup, this));
    this.$container.on('click', '.fe-bt-biz-guide', $.proxy(this._openBizGuidePopup, this));
    this.$container.on('click', '.fe-bt-nickname', $.proxy(this._openNickname, this));
    this.$container.on('click', '.fe-change-first', $.proxy(this._onChangeFirst, this));
    this.$container.on('click', '.fe-bt-more', $.proxy(this._onClickMore, this));
    this.$container.on('click', '.fe-seq-edit', $.proxy(this._onClickInternal, this));
    this.$container.on('click', '.fe-bt-add', $.proxy(this._onClickEdit, this));
    this.$container.on('click', '.fe-bt-remove', $.proxy(this._onClickEdit, this));
    this.$container.on('click', '.fe-bt-internal', $.proxy(this._onClickInternal, this));
    this.$guidePopup.on('click', '.popup-closeBtn', $.proxy(this._onCloseGuidePopup, this));
    // this.$container.on('click', '.fe-pop-hide', $.proxy(this._hidePopup, this));
    // broadband popup
    this.$popBroadBand.on('click', 'button.agree', $.proxy(this._onClickInternal, this));
    this.$popBroadBand.on('click', 'button.disagree', $.proxy(this._hidePopup, this));
    this.$popBroadBand.on('click', 'button.btn-tooltip-close', $.proxy(this._hidePopup, this));
  },

  /**
   * @function
   * @desc 메뉴 팝업 닫기
   * @private
   */
  _closeManageMenu: function () {
    $('#fe-manage-menu').detach();
  },


  _checkGuidePopup: function() {
    if (Tw.BrowserHelper.isApp()) {
      this._nativeService.send(Tw.NTV_CMD.LOAD, { key: Tw.NTV_STORAGE.COMMON_MEMBER_LINE_GUIDE },
          $.proxy(this._onLoadGuideView, this));
    } else {
      // cookie check
      var commonMemberLineGuideb = Tw.CommonHelper.getCookie(Tw.NTV_STORAGE.COMMON_MEMBER_LINE_GUIDE);
      if(Tw.FormatHelper.isEmpty(commonMemberLineGuideb) || commonMemberLineGuideb === 'N') {
        this._openGuidePopup();
      } else {
        Tw.CommonHelper.setCookie(Tw.NTV_STORAGE.COMMON_MEMBER_LINE_GUIDE, 'Y', 365);
      }
    }
  },

  /**
   * @function
   * @desc 회선관리 이용안내 팝업 오픈
   * @param $event
   * @private
   */
  _openGuidePopup: function ($event) {
    // focus 처리 및 scroll 처리
    $('body').addClass('noscroll');
    this.$guidePopup.show();
    this.$guidePopup.attr('tabindex', 0);
    setTimeout($.proxy(function() {
      this.$guidePopup.focus();
    }, this), 0);
  },

  /**
   * @function
   * @desc
   * @param resp
   * @private
   */
  _onLoadGuideView: function (resp) {
    if ( resp.resultCode !== Tw.NTV_CODE.CODE_00) {
        this._openGuidePopup();
    }
  },

  _onCloseGuidePopup: function () {
    $('body').removeClass('noscroll');
    if(Tw.BrowserHelper.isApp()) {
      this._nativeService.send(Tw.NTV_CMD.SAVE, { key: Tw.NTV_STORAGE.COMMON_MEMBER_LINE_GUIDE, value: 'Y' });
    } else {
      Tw.CommonHelper.setCookie(Tw.NTV_STORAGE.COMMON_MEMBER_LINE_GUIDE, 'Y', 365);
    }
    this.$guidePopup.removeAttr('tabindex');
    this.$guidePopup.hide();
  },

  /**
   * @function
   * @desc 법인회선관리 이용안내 팝업 오픈
   * @param $event
   * @private
   */
  _openBizGuidePopup: function ($event) {
    var $target = $($event.currentTarget);
    this._popupService.open({
      hbs: 'CO_01_05_02_09',
      layer: true
    }, $.proxy(this._onOpenEditGuide, this), null, 'biz-guide', $target);
  },

  /**
   * @function
   * @desc 회선관리 이용안내 팝업 오픈 callback
   * @param $popupContainer
   * @private
   */
  _onOpenEditGuide: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-biz-register', $.proxy(this._onClickInternal, this));
    $popupContainer.on('click', '#fe-bt-biz-signup', $.proxy(this._onClickBizSignup, this));
  },

  /**
   * @function
   * @desc 내부 경로로 이동
   * @private
   */
  _onClickInternal: function ($event) {
    var url = $($event.currentTarget).data('url');
    this._historyService.goLoad(url);
  },

  /**
   * @function
   * @desc 이용안내 > 법인회선 가입방법 클릭 처리
   * @param $event
   * @private
   */
  _onClickBizSignup: function ($event) {
    var $target = $($event.currentTarget);
    this._popupService.open({
      hbs: 'CO_01_05_02_02',
      layer: true
    }, $.proxy(this._onOpenBizSignup, this), null, 'biz-password', $target);
  },

  /**
   * @function
   * @desc 회선관리 이용안내 팝업 오픈 callback
   * @param $popupContainer
   * @private
   */
  _onOpenBizSignup: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-go-url', $.proxy(this._onClickInternal, this));
  },


  /**
   * @function
   * @desc 닉네임 설정 클릭 처리
   * @param $event
   * @private
   */
  _openNickname: function ($event) {
    var $btNickname = $($event.currentTarget);
    var $currentLine = $btNickname.parents('.fe-line');
    var svcMgntNum = $currentLine.data('svcmgmtnum');
    this.$showNickname = $currentLine.find('.fe-show-name');
    this._nicknamePopup.openNickname(this.$showNickname.text(), svcMgntNum, $.proxy(this._onCloseNickname, this), $btNickname);
  },

  /**
   * @function
   * @desc 설정 팝업 open
   * @param $event
   * @private
   */
  _openManagePopup: function ($event) {

    var $menu = $('#fe-manage-menu');
    $menu.detach();

    var $btManageLine = $($event.currentTarget);
    var $currentLine = $btManageLine.parents('.fe-line');
    var category = $btManageLine.parents('.fe-item-list').data('category');
    var svcMgmtNum = $currentLine.data('svcmgmtnum');
    // var listLength = $currentLine.data('length');
    // var index = $btManageLine.data('index');

    var isMobile = Tw.LINE_NAME.MOBILE === category;
    var isRepSvcYn = $currentLine.hasClass('fe-line-standard');

    if($menu.length === 0 || $menu.data('svcmgmtnum') !== svcMgmtNum) {
      var $lineTemp = $('#fe-menu-tmpl');
      var tplLine = Handlebars.compile($lineTemp.html());
      $btManageLine.after(tplLine({ svcmgmtnum: svcMgmtNum, isMobile: isMobile, isRepSvcYn: isRepSvcYn }));
      this.$showMenuBtn = $btManageLine;
    }

    $event.preventDefault();
    $event.stopPropagation();
  },

  /**
   * @function
   * @desc 닉네임 변경 callback
   * @param nickname
   * @private
   */
  _onCloseNickname: function (nickname) {
    this.$showNickname.html(nickname);
    $('#fe-manage-menu').detach();
    this._popupService.openAlert(Tw.ALERT_MSG_AUTH.ALERT_4_51);
  },

  /**
   * @function
   * @desc 더보기 버튼 클릭 처리
   * @param $event
   * @private
   */
  _onClickMore: function ($event) {
    var $target = $($event.currentTarget);
    var $list = $target.parents('.fe-line-cover').find('.fe-item-list');
    var category = $list.data('category');
    var pageNo = $list.data('pageno');

    this._apiService.request(Tw.API_CMD.BFF_03_0004, {
      pageNo: (pageNo + 1),
      pageSize: this._defaultCnt,
      svcCtg: category
    }).done($.proxy(this._successMoreData, this, category, $target, $list))
      .fail($.proxy(this._failMoreData, this));
  },

  /**
   * @function
   * @desc 더보기 데이터 처리
   * @param category
   * @param $target
   * @param resp
   * @private
   */
  _successMoreData: function (category, $target, $list, resp) {
    Tw.CommonHelper.endLoading('.container');
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var pageNo = $list.data('pageno');
      var totalCnt = $list.data('totcount');

      if ( (pageNo + 1) * this._defaultCnt >= totalCnt ) {
        $target.parents('.tod-add-btn').removeClass('tod-add-btn');
        $target.hide();
      }

      $list.data('pageno', (pageNo + 1));
      this._addList(category, resp.result[category]);
    } else {
      Tw.Error(resp.code, resp.msg).pop(null, $target);
    }
  },

  /**
   * @function
   * @desc 더보기 실패 처리
   * @param error
   * @private
   */
  _failMoreData: function(error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 더보기 회선 데이터 렌더링
   * @param category
   * @param list
   * @private
   */
  _addList: function (category, list) {

    var selector = '[data-category='+ category +'] > .fe-line:last';
    var $listLast = this.$container.find(selector);
    var $lineTemp = $('#fe-line-tmpl');
    var tplLine = Handlebars.compile($lineTemp.html());
    $listLast.after(tplLine({ list: this._parseLineData(category, list) }));
  },

  /**
   * @function
   * @desc 회선 데이터 파싱
   * @param category
   * @param list
   * @returns {*}
   * @private
   */
  _parseLineData: function (category, list) {
    _.map(list, $.proxy(function (line) {
      line.showSvcAttrCd = Tw.SVC_ATTR[line.svcAttrCd];
      line.showSvcScrbDtm = Tw.FormatHelper.isNumber(line.svcScrbDt) ?
        Tw.DateHelper.getShortDateNoDot(line.svcScrbDt) : Tw.FormatHelper.conDateFormatWithDash(line.svcScrbDt);
      line.showName = Tw.FormatHelper.isEmpty(line.nickNm) ? Tw.SVC_ATTR[line.svcAttrCd] : line.nickNm;
      line.useNickname = line.nickNm === line.showName;
      line.isRepSvcYn = line.resSvcYn === 'Y';
      line.isExpsYn = line.expsYn === 'Y';
      line.showDetail = category === Tw.LINE_NAME.MOBILE ? Tw.FormatHelper.conTelFormatWithDash(line.svcNum) :
        line.svcAttrCd === Tw.SVC_ATTR_E.TELEPHONE ? Tw.FormatHelper.conTelFormatWithDash(line.svcNum) : line.addr;
        line.ico = Tw.FormatHelper.isEmpty(Tw.SVC_ATTR_ICO_CLASS[line.svcAttrCd]) ? '' : Tw.SVC_ATTR_ICO_CLASS[line.svcAttrCd];
    }, this));

    return list;
  },

  /**
   * @function
   * @desc 기준회선으로 변경하기 클릭 처리
   * @param $event
   * @private
   */
  _onChangeFirst: function ($event) {
    var $target = $($event.currentTarget);
    this._popupService.openConfirmButton(Tw.ALERT_MSG_AUTH.ALERT_4_A5, null, $.proxy(this._confirmNotifyPopup, this),
      $.proxy(this._closeNotifyPopup, this, $target), Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES, $target);

    $event.preventDefault();
    $event.stopPropagation();
  },

  /**
   * @function
   * @desc 기준회선 변경 확인 팝업 '확인' 클릭 처리
   * @private
   */
  _confirmNotifyPopup: function () {
    this._popupService.close();
    this._changeList = true;
  },

  /**
   * @function
   * @desc 기준회선 변경 처리
   * @param $target
   * @private
   */
  _closeNotifyPopup: function ($target) {
    if ( this._changeList ) {
      var svcMgmtNum = $target.parents('.fe-line').data('svcmgmtnum');
      var category = $target.parents('.fe-item-list').data('category');

      // 현재 사용중인 회선 정보를 가져온 후 선택된 회선을 첫번째 회선으로 변경한다.
      this._apiService.request(Tw.NODE_CMD.GET_ALL_SVC, {})
        .done($.proxy(this._getExposedSvcNumListForStandard, this, svcMgmtNum, category, $target))
        .fail($.proxy(this._failEditLineList, this));
    }
  },

  /**
   * @function
   * @desc 기준 회선 둥록 전체 회선 정보
   * @param $target
   * @param resp
   * @private
   */
  _getExposedSvcNumListForStandard: function (svcMgmtNum, category, $target, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var list = _.filter(resp.result[category], function (obj) {
        return String(obj.svcMgmtNum) !== String(svcMgmtNum);
      });

      var svcNumList = [svcMgmtNum];
      _.map(list, $.proxy(function (line) {
        svcNumList.push(line.svcMgmtNum);
      }, this));

      this._requestChangeList(svcNumList, $target);
    } else {
      this._failEditLineList();
    }
  },

  /**
   * @function
   * @desc 기준회선 변경 API 요청
   * @param svcNumList
   * @param $target
   * @private
   */
  _requestChangeList: function (svcNumList, $target) {
    var lineList = svcNumList.join('~');

    Tw.CommonHelper.startLoading('.container', 'grey');
    this._apiService.request(Tw.NODE_CMD.CHANGE_LINE, {
      params: { svcCtg: Tw.LINE_NAME.MOBILE, svcMgmtNumArr: lineList }
    }).done($.proxy(this._successRegisterLineList, this, svcNumList, $target))
      .fail($.proxy(this._failRegisterLineList, this));
  },

  /**
   * @function
   * @desc 기준회선 변경 완료 처리
   * @param $target
   * @param resp
   * @private
   */
  _successRegisterLineList: function (svcNumList, $target, resp) {
    Tw.CommonHelper.endLoading('.container');
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._marketingSvc = resp.result.offerSvcMgmtNum;
      Tw.Logger.info('[marketingSvc]', this._marketingSvc);
      this._checkRepSvc(svcNumList, Tw.ALERT_MSG_AUTH.L02, $target);
    } else {
      Tw.Error(resp.code, resp.msg).pop(null, $target);
      // this._failEditLineList();
    }
  },

  /**
   * @function
   * @desc 기준회선 변경 완료 후 페이지 리로딩 처리
   * @private
   */
  _closeRegisterLine: function () {
    this._historyService.reload();
  },

  /**
   * @function
   * @desc 회선 등록 및 해지
   * @param $event
   * @private
   */
  _onClickEdit: function($event) {

    $event.preventDefault();
    $event.stopPropagation();

    var $target = $($event.currentTarget);
    var $item = $target.parents('.fe-line');
    var $list = $target.parents('.fe-item-list');
    var svcMgmtNum = $item.data('svcmgmtnum');
    var svcGr = $item.data('svcgr');
    var category = $list.data('category');
    var successMsg, checkMsg;

    // 등록(미등록 회선은 리스트의 마지막에 출력되므로, 머지먹 페이지 까지 열어야 등록 가능함)
    if($target.hasClass('fe-bt-add')) {
      successMsg = Tw.ALERT_MSG_AUTH.ALERT_4_A9;
      $item.removeClass('fe-item-inactive').addClass('fe-item-active');

      var list = $list.find('.fe-item-active');
      var svcNumList = [];
      _.map(list, $.proxy(function (line) {
        svcNumList.push($(line).data('svcmgmtnum'));
      }, this));

      this._openEditConfirmPopup(svcNumList, category, checkMsg, successMsg, $target);

    // 해지
    } else {
      successMsg = Tw.ALERT_MSG_AUTH.ALERT_4_50;

      // 기준회선 해지
      if($item.hasClass('fe-line-standard')) {
        checkMsg = Tw.ALERT_MSG_AUTH.ALERT_4_52;
      // 마지막 회선(유무선 통합)
      } else if(this._totalExposedCnt === 1) {
        checkMsg = Tw.ALERT_MSG_AUTH.ALERT_4_53;
      // 수동등록 법인회선
      } else if ( svcGr === 'R' || svcGr === 'D' ) {
        checkMsg = Tw.ALERT_MSG_AUTH.ALERT_4_54;
      // default
      } else {
        checkMsg = Tw.ALERT_MSG_AUTH.L05;
      }

      $item.removeClass('fe-item-active').addClass('fe-item-inactive');

      // 현재 사용중인 회선 정보를 가져온 후 해지 요청된 회선을 제외하여 처리한다.
      this._apiService.request(Tw.NODE_CMD.GET_ALL_SVC, {})
        .done($.proxy(this._getExposedSvcNumListForRemove, this, svcMgmtNum, category, checkMsg, successMsg, $target))
        .fail($.proxy(this._failEditLineList, this));
    }
  },

  /**
   * @function
   * @desc 등록해지 전체 회선 정보
   * @param $target
   * @param resp
   * @private
   */
  _getExposedSvcNumListForRemove: function (svcMgmtNum, category, checkMsg, successMsg, $target, resp) {

    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var list = _.filter(resp.result[category], function (obj) {
        return String(obj.svcMgmtNum) !== String(svcMgmtNum);
      });

      var svcNumList = [];
      _.map(list, $.proxy(function (line) {
        svcNumList.push(line.svcMgmtNum);
      }, this));

      this._openEditConfirmPopup(svcNumList, category, checkMsg, successMsg, $target);
    } else {
      this._failEditLineList();
    }
  },

  /**
   * @function
   * @desc 회선편집 확인 팝업 오픈
   * @param svcNumList
   * @param $target
   * @private
   */
  _openEditConfirmPopup: function (svcNumList, category, checkMsg, successMsg, $target) {

    if(!Tw.FormatHelper.isEmpty(checkMsg)) {
      this._popupService.openConfirmButton(checkMsg, null, $.proxy(this._onConfirmEditPopup, this, svcNumList, category, successMsg, $target),
      $.proxy(this._onCancelEditPopup, this, $target), Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES, $target);
    } else {
      this._onConfirmEditPopup(svcNumList, category, successMsg, $target);
    }
  },

  /**
   * @function
   * @desc 회선편집 요청
   * @param svcNumList
   * @param $target
   * @private
   */
  _onCancelEditPopup: function ($target) {
    var $parent =  $target.parents('.fe-line');

    if($parent.hasClass('fe-item-inactive')) {
      $parent.removeClass('fe-item-inactive').addClass('fe-item-active');
    } else {
      $parent.removeClass('fe-item-active').addClass('fe-item-inactive');
    }

    $('#fe-manage-menu').detach();
  },

  /**
   * @function
   * @desc 회선편집 요청
   * @param svcNumList
   * @param $target
   * @private
   */
  _onConfirmEditPopup: function (svcNumList, category, successMsg, $target) {
    this._popupService.close();
    var lineList = svcNumList.join('~');
    Tw.Logger.info('[_onConfirmEditPopup lineList ]', lineList);

    Tw.CommonHelper.startLoading('.container', 'grey');
    this._apiService.request(Tw.NODE_CMD.CHANGE_LINE, {
      params: { svcCtg: category, svcMgmtNumArr: lineList }
    }).done($.proxy(this._successEditLineList, this, svcNumList, successMsg, $target))
      .fail($.proxy(this._failEditLineList, this));
  },

  /**
   * @function
   * @desc 회선편집 요청 resp 처리
   * @param svcNumList
   * @param $target
   * @param resp
   * @private
   */
  _successEditLineList: function (svcNumList, msg, $target, resp) {
    Tw.CommonHelper.endLoading('.container');
    if ( resp.code === Tw.API_CODE.CODE_00 ) {

      this._marketingSvc = resp.result.offerSvcMgmtNum;
      Tw.Logger.info('[marketingSvc]', this._marketingSvc);
      this._checkRepSvc(svcNumList, msg, $target);

    } else {
      Tw.Error(resp.code, resp.msg).pop(null, $target);
      // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG, null, null, $.proxy(this._editCallback, this));
    }
  },

  /**
   * @function
   * @desc 회선편집 요청 실패 처리
   * @param error
   * @private
   */
  _failEditLineList: function () {
    // Tw.Logger.error(error);
    Tw.CommonHelper.endLoading('.container');
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG, null, null, $.proxy(this._editCallback, this));
  },

  /**
   * @function
   * @desc 회선편집 요청 결과 alert callback
   * @param error
   * @private
   */
  _editCallback: function () {
    this._historyService.reload();
  },

  /**
   * @function
   * @desc 기준회선 변경 여부 확인
   * @param result
   * @param svcNumList
   * @param $target
   * @private
   */
  _checkRepSvc: function (svcNumList, msg, $target) {
    this._popupService.openAlert(msg, null, null, $.proxy(this._onCloseChangeRepSvc, this, svcNumList, $target), null, $target);

  },

  /**
   * @function
   * @desc 기준회선 변경 팝업 클로즈 callback
   * @private
   */
  _onCloseChangeRepSvc: function (svcNumList, $target) {
    this._checkMarketingOffer(svcNumList, $target);
  },

  /**
   * @function
   * @desc 마케팅 동의 여부 확인 요청
   * @private
   */
  _checkMarketingOffer: function (svcNumList, $target) {
    // OP002-7976 : 회선 해지시에는 수신동의 팝업창 비노출 처리.
    if ( !Tw.FormatHelper.isEmpty(this._marketingSvc) && this._marketingSvc !== '0' && !$target.hasClass('fe-bt-remove')) {
      var list = this.$container.find('.fe-line');
      var $item = list.filter('[data-svcmgmtnum=' + this._marketingSvc + ']');
      if ( $item.length > 0 ) {
        this._apiService.request(Tw.API_CMD.BFF_03_0014, {}, {}, [this._marketingSvc])
          .done($.proxy(this._successGetMarketingOffer, this, $item.data('showname'), $item.data('svcnum')))
          .fail($.proxy(this._failGetMarketingOffer, this));
      } else {
        this._closeMarketingOfferPopup();
      }
    } else {
      this._closeMarketingOfferPopup();
    }
  },

  /**
   * @function
   * @desc 마케팅 동의 여부 처리 및 팝업 오픈
   * @param showName
   * @param svcNum
   * @param resp
   * @private
   */
  _successGetMarketingOffer: function (showName, svcNum, resp) {
    Tw.CommonHelper.endLoading('.container');
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.agr201Yn = resp.result.agr201Yn;
      this.agr203Yn = resp.result.agr203Yn;

      if ( this.agr201Yn !== 'Y' || this.agr203Yn !== 'Y' ) {
        setTimeout($.proxy(function () {
          this.lineMarketingLayer.openMarketingOffer(this._marketingSvc,
            showName, svcNum, this.agr201Yn, this.agr203Yn, $.proxy(this._onCloseMarketingOfferPopup, this));
        }, this), 0);
      } else {
        this._closeMarketingOfferPopup();
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc 마케팅 동의 여부 요청 실패 처리
   * @private
   */
  _failGetMarketingOffer: function () {
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 마케팅 동의 팝업 닫기
   * @private
   */
  _closeMarketingOfferPopup: function () {
    this._historyService.reload();
  },

  /**
   * @function
   * @desc 마케팅 동의 팝업 클로즈 callback
   * @private
   */
  _onCloseMarketingOfferPopup: function () {
    this._closeMarketingOfferPopup();
  },

  _openPopup: function () {
    $('body').addClass('noscroll');
    this.$popBroadBand.attr('tabindex', 0);
    this.$popBroadBand.show();
    setTimeout($.proxy(function() {
      this.$popBroadBand.focus();
    }, this), 0);
  },
  /**
   * @function
   * @desc SK브로드밴드 서비스 이용 동의 팝업 닫기
   * @private
   */
  _closePopup: function () {
    $('body').removeClass('noscroll');
    this.$popBroadBand.removeAttr('tabindex');
    this.$popBroadBand.hide();
    this._checkGuidePopup();
  },

  /**
   * @function
   * @desc SK브로드밴드 서비스 이용 동의 팝업 다음에 하기 버튼 클릭
   * @private
   */
  _hidePopup: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._setLocalStorage('hideSkbAgreePop', this._svcInfo.userId, 365 * 10);
    } else {
      this._setCookie('hideSkbAgreePop', this._svcInfo.userId, 365 * 10);
    }
    this._closePopup();
  },

  /**
   * @function
   * @desc 다음에 하기 처리 (Native localstorage 영역에 저장, 반영구적으로 비노출)
   */
  _setLocalStorage: function (key, userId, expiredays) {
    var keyName = key + '_' + userId;
    var today = new Date();

    today.setDate(today.getDate() + expiredays);

    Tw.CommonHelper.setLocalStorage(keyName, JSON.stringify({
      expireTime: today
    }));
  },

  /**
   * @function
   * @desc 다음에 보기 쿠키 처리 (반영구적으로 비노출)
   */
  _setCookie: function (key, userId, expiredays) {
    var cookieName = key + '_' + userId;
    var today = new Date();

    today.setDate(today.getDate() + expiredays);

    document.cookie = cookieName + '=Y; path=/; expires=' + today.toGMTString() + ';';
  }
};
