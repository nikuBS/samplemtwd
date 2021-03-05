/**
 * @file line.component.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.26
 */

/**
 * @class
 * @desc 공통 > 회선변경
 * @constructor
 */
Tw.LineComponent = function ($container, selector, isToast, $closeFocusEle) {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._customerPwd = new Tw.CustomerPwdComponent();

  this.$btLine = null;
  this.$remainCnt = null;

  this._selectedMgmt = '';
  this._index = 0;
  this._lineList = null;
  this._changeLine = false;
  this._customerLogin = false;
  this._openLineList = false;
  this._callback = null;

  this._svcMgmtNum = '';
  this._mdn = '';
  this._isToast = isToast || false;
  // OP002-5925 : [FE] (W-1911-065-02) 2019 App./모바일웹접근성 샘플링 결과 반영(수정)
  this._$closeFocusEle = $closeFocusEle;

  // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
  if ( !Tw.FormatHelper.isEmpty($container)) {
    selector = selector || '.fe-bt-line';
    $container.on('click', selector, _.debounce($.proxy(this._onClickLine, this), 500));
  }
};

Tw.LineComponent.prototype = {
  /**
   * @member {object}
   * @desc 에러코드
   * @readonly
   * @prop {string} BFF0012 고객비밀번호 인증이 필요합니다.
   * @prop {string} BFF0013 고객비밀번호 잠김 해제가 필요합니다.
   * @prop {string} BFF0014 고객비밀번호 설정이 필요합니다.
   * @prop {string} ICAS3216 고객비밀번호 잠김
   */
  ERROR_CODE: {
    BFF0012: 'BFF0012',    //	고객비밀번호 인증이 필요합니다.
    BFF0013: 'BFF0013',    //	고객비밀번호 잠김 해제가 필요합니다.
    BFF0014: 'BFF0014',    // 고객비밀번호 설정이 필요합니다.
    ICAS3216: 'ICAS3216'   // 고객비밀번호가 잠김
  },

  /**
   * @function
   * @desc 회선 변경 레이어 팝업 오픈 요청
   * @param selectedMgmt
   * @param $target
   */
  onClickLine: function (selectedMgmt, $target) {
    this._init(selectedMgmt);
    this._openLineList = true;
    this._getLineList($target);
  },

  /**
   * @function
   * @desc 회선번호 클릭시 처리
   * @param $event 이벤트 객체
   * @return {void}
   * @private
   */
  _onClickLine: function ($event) {
    var $target = $($event.currentTarget);
    var svcMgmtNum = $($event.currentTarget).data('svcmgmtnum');
    this.onClickLine(svcMgmtNum, $target);
  },

  /**
   * @function
   * @param e
   * @desc url 이동
   */
  _goUrl: function (e) {
    this._historyService.goLoad($(e.currentTarget).data('url'));
  },

  /**
   * @function
   * @desc 초기화
   * @param selectedMgmt
   * @private
   */
  _init: function (selectedMgmt) {
    this._index = 0;
    this._selectedMgmt = selectedMgmt;
    this._lineList = null;
    this._changeLine = false;
    this._customerLogin = false;
    this._openLineList = false;
    this._callback = null;

    this._svcMgmtNum = '';
    this._mdn = '';
  },

  /**
   * @function
   * @desc 전체 회선 정보 요청
   * @param $target
   * @private
   */
  _getLineList: function ($target) {
    this._apiService.requestArray([
      { command: Tw.NODE_CMD.GET_ALL_SVC, params: {}},
      // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
      { command: Tw.NODE_CMD.GET_CHILD_INFO, params: {}},
      { command: Tw.API_CMD.BFF_03_0029, params: {}}
    ]).done($.proxy(this._successGetLineList, this, $target))
      .fail($.proxy(this._failTosStoreBanner, this));
  },

  /**
   * @function
   * @desc 전체 회선 정보 응답 처리
   * @param $target
   * @param allSvcResp
   * @param childSvcResp
   * @param exposableResp
   * @private
   */
  _successGetLineList: function ($target, allSvcResp, childSvcResp, exposableResp) {

    // childSvcResp = childSvcResp || {};
    var  totNonCnt = 0;
    if ( exposableResp.code === Tw.API_CODE.CODE_00 ) {
      totNonCnt = exposableResp.result.totalCnt;
    }

    if ( allSvcResp.code === Tw.API_CODE.CODE_00 ) {
      this._lineList = this._parseLineList(allSvcResp.result, childSvcResp.result);
      if ( this._index > 1 ) {
        this._openListPopup(this._lineList, totNonCnt, $target);
      } else if ( this._index === 1 ){
        this._historyService.goLoad('/common/member/line');
      }
    } else {
      Tw.Error(allSvcResp.code, allSvcResp.msg).pop();
    }
  },

  /**
   * @function
   * @desc 전체 회선 정보 요청 실패 처리
   * @param error
   * @private
   */
  _failGetLineList: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 회선 변경 팝업 오픈
   * @param lineData
   * @param $target
   * @private
   */
  _openListPopup: function (lineData, totNonCnt, $target) {

    // OP002-5925 : [FE] (W-1911-065-02) 2019 App./모바일웹접근성 샘플링 결과 반영(수정)
    if(!Tw.FormatHelper.isEmpty(this._$closeFocusEle)) {
      $target = this._$closeFocusEle;
    }
    var onlyMobile = lineData.length === 1 && lineData[0].isMobile
    this._popupService.open({
      hbs: 'actionsheet_line',
      layer: true,
      hasNonExpsLine: totNonCnt > 0,
      totNonCnt: totNonCnt,
      data: lineData,
      btMore: this._index > Tw.DEFAULT_LIST_COUNT,
      onlyMobile: onlyMobile,
      cdn: Tw.Environment.cdn
    }, $.proxy(this._onOpenListPopup, this), $.proxy(this._onCloseListPopup, this), 'line', $target);
  },

  /**
   * @function
   * @desc 회선 변경 팝업 오픈 콜백 (이벤트 바인딩)
   * @param $popupContainer
   * @private
   */
  _onOpenListPopup: function ($popupContainer) {

    // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
    new Tw.XtractorService($popupContainer);

    Tw.CommonHelper.focusOnActionSheet($popupContainer);

    this.$list = $popupContainer.find('.fe-item');
    this.$btMore = $popupContainer.find('#fe-bt-more');

    this.$btMore.on('click', $.proxy(this._onClickMore, this));
    $popupContainer.on('click', '.fe-radio-line', _.debounce($.proxy(this._onSelectLine, this), 500));
    $popupContainer.on('click', '#fe-bt-line', $.proxy(this._onClickLineButton, this));
    $popupContainer.on('click', '.fe-bt-internal', $.proxy(this._onClickInternal, this));
  },

  /**
   * @function
   * @desc 회선 변경 팝업 클로즈 콜백
   * @private
   */
  _onCloseListPopup: function () {
    if ( this._changeLine ) {
      this._completeLogin({ code: Tw.CALLBACK_CODE.SUCCESS });
    } else if ( this._customerLogin ) {
      this._customerPwd.openLayer(this._mdn, this._svcMgmtNum, $.proxy(this._completeCustomerLogin, this));
    }
  },

  /**
   * @function
   * @desc 팝업 클로즈 요청
   * @private
   */
  _closePopup: function () {
    this._popupService.close();
  },

  /**
   * @function
   * @desc 회선 정보 파싱
   * @param lineList
   * @returns {Array}
   * @private
   */
  _parseLineList: function (lineList, childLineList) {
    var category = ['MOBILE', 'INTERNET_PHONE_IPTV', 'SECURITY'];
    var result = [];
    _.map(category, $.proxy(function (line) {
      var curLine = lineList[Tw.LINE_NAME[line]];
      if ( !Tw.FormatHelper.isEmpty(curLine) ) {
        var showService = this._index < Tw.DEFAULT_LIST_COUNT ? '' : 'none';
        var isWire = Tw.LINE_NAME[line] === 's';
        var isMobile = Tw.LINE_NAME[line] === 'm';
        var list = this._convLineData(curLine, line);

        // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
        if(line === 'MOBILE' && !Tw.FormatHelper.isEmpty(childLineList)) {

          var childInfos = [];
          _.map(childLineList, $.proxy(function (childLine) {
            childInfos.push({
              index: this._index++,
              txt: childLine.eqpMdlNm,
              option: this._selectedMgmt.toString() === childLine.svcMgmtNum ? 'checked' : '',
              badge: false,
              showLine: this._index <= Tw.DEFAULT_LIST_COUNT ? '' : 'none',
              add: Tw.FormatHelper.conTelFormatWithDash(childLine.svcNum),
              svcMgmtNum: childLine.svcMgmtNum,
              icon: 'ico7',
              child: true
            });
          }, this));
          list = list.concat(childInfos);
        }

        result.push({
          title: Tw.SVC_CATEGORY[Tw.LINE_NAME[line]],
          cnt: list.length,
          list: list,
          showService: showService,
          isWire: isWire,
          isMobile: isMobile,
          cdn: Tw.Environment.cdn
        });
      }
    }, this));
    return result;
  },

  /**
   * @desc 회선 데이터 화면에 나타내는 데이터로 변경
   * @param lineData
   * @param category
   * @returns {Array}
   * @private
   */
  _convLineData: function (lineData, category) {
    var result = [];
    Tw.FormatHelper.sortObjArrAsc(lineData, 'expsSeq');
    _.map(lineData, $.proxy(function (line) {
      result.push({
        index: this._index++,
        txt: Tw.FormatHelper.isEmpty(line.nickNm) ? Tw.SVC_ATTR[line.svcAttrCd] : line.nickNm,
        option: this._selectedMgmt.toString() === line.svcMgmtNum ? 'checked' : '',
        badge: line.repSvcYn === 'Y',
        showLine: this._index <= Tw.DEFAULT_LIST_COUNT ? '' : 'none',
        add: Tw.LINE_NAME[category] === 's' ? line.svcAttrCd !== 'S3' ? line.addr :
          Tw.FormatHelper.conTelFormatWithDash(line.svcNum) : Tw.FormatHelper.conTelFormatWithDash(line.svcNum),
        svcMgmtNum: line.svcMgmtNum,
        icon: Tw.LINE_NAME[category] === 'm' ? 'ico7' : line.svcAttrCd === 'S1' ? 'ico10' : line.svcAttrCd === 'S2' ? 'ico11' : 'ico12',
        child: false
      });
    }, this));
    return result;
  },

  /**
   * @function
   * @desc 회선 선택 click event 처리
   * @param $event
   * @private
   */
  _onSelectLine: function ($event) {
    var $selectedLine = $($event.currentTarget);
    var svcMgmtNum = $selectedLine.data('svcmgmtnum');
    var mdn = $selectedLine.data('mdn');

    // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
    if($selectedLine.hasClass('fe-child')) {
      this._historyService.goBack();
      setTimeout($.proxy(function () {
          this._onOpenChildNavi(svcMgmtNum, $selectedLine);
      },this),100);
    } else {
      this.changeLine(svcMgmtNum, mdn);
    }
  },

  /**
   * @function
   * @desc 회선 선택 click event 처리
   * @param $event
   * @private
   */
  _onOpenChildNavi: function (svcMgmtNum, $target) {
    this._popupService.open({
      hbs: 'CU_UT_04_05',
      layer: true,
      svcMgmtNum : svcMgmtNum
    }, $.proxy(this._onOpenChildPopup, this), $.proxy(null, this), 'child_navi', $target);
  },

    /**
   * @function
   * @desc 자녀 회선 기눙 선택 (이벤트 바인딩)
   * @param $popupContainer
   * @private
   */
  _onOpenChildPopup: function ($popupContainer) {
    Tw.CommonHelper.focusOnActionSheet($popupContainer);
    new Tw.XtractorService($popupContainer);
    $popupContainer.on('click', '.fe-go-child', $.proxy(this._goUrl, this));
  },

  /**
   * @function
   * @desc 자녀회선 popup close
   * @private
   */
  _onCloseChildPopup: function () {
  //   this._closePopup();
  },

  /**
   * @function
   * @desc 회선 변경 요청
   * @param svcMgmtNum
   * @param mdn
   * @param callback
   */
  changeLine: function (svcMgmtNum, mdn, callback) {
    this._callback = callback;
    this._svcMgmtNum = svcMgmtNum;
    this._mdn = mdn;
    Tw.CommonHelper.startLoading('.container', 'grey');
    this._apiService.request(Tw.NODE_CMD.CHANGE_SESSION, { svcMgmtNum: svcMgmtNum })
      .done($.proxy(this._successChangeLine, this))
      .fail($.proxy(this._failChangeLine, this));
  },

  /**
   * @function
   * @desc 회선 관리 버튼 click event 처리
   * @private
   */
  _onClickLineButton: function () {
    this._historyService.replaceURL('/common/member/line');
  },

  /**
   * @function
   * @desc 회선 변경 응답 처리
   * @param resp
   * @private
   */
  _successChangeLine: function (resp) {
    Tw.CommonHelper.endLoading('.container');
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._changeLine = true;
      if ( this._openLineList ) {
        this._popupService.close();
      } else {
        this._onCloseListPopup();
      }
    } else if ( resp.code === this.ERROR_CODE.BFF0012 ) {
      this._customerLogin = true;
      if ( this._openLineList ) {
        this._popupService.close();
      } else {
        this._onCloseListPopup();
      }
    } else if ( resp.code === this.ERROR_CODE.BFF0013 ) {
      // 고객보호 비밀번호 잠김
      Tw.Error(resp.code, resp.msg).pop();
    } else if ( resp.code === this.ERROR_CODE.BFF0014 ) {
      // 고객보호 비밀번호 설정페이지
      if ( this._openLineList ) {
        this._historyService.replaceURL('/myt-join/custpassword');
      } else {
        this._historyService.goLoad('/myt-join/custpassword');
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc 회선 변경 요청 실패 처리
   * @param error
   * @private
   */
  _failChangeLine: function (error) {
    Tw.Logger.error(error);
    Tw.CommonHelper.endLoading('.container');
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 회선 정보 더보기 버튼 click event 처리
   * @private
   */
  _onClickMore: function () {
    var $hideList = this.$list.filter('.none');
    var $showList = $hideList.filter(function (index) {
      return index < Tw.DEFAULT_LIST_COUNT;
    });
    var $service = $showList.parents('.fe-service');
    var $title = $service.siblings('.fe-title');

    $service.removeClass('none');
    $showList.removeClass('none');
    $title.removeClass('none');

    if ( $hideList.length - $showList.length === 0 ) {
      this.$btMore.hide();
    }
  },

  /**
   * @function
   * @desc 회선 변경 완료
   * @param resp
   * @private
   */
  _completeLogin: function (resp) {
    if ( !Tw.FormatHelper.isEmpty(this._callback) ) {
      this._callback(resp);
    } else {
      if ( resp.code === Tw.CALLBACK_CODE.SUCCESS ) {

        // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
        if(Tw.BrowserHelper.isApp() && this._isToast) {
          Tw.CommonHelper.toast(Tw.REMNANT_OTHER_LINE.TOAST);

          setTimeout($.proxy(function () {
            this._historyService.reload();
          }, this), 500);
        } else {
          this._historyService.reload();
        }
      }
    }
  },

  /**
   * @function
   * @desc 고객보호비밀번호 완료 콜백
   * @param resp
   * @private
   */
  _completeCustomerLogin: function (resp) {
    this._completeLogin(resp);
  },

  /**
   * @function
   * @desc 내부 경로로 이동
   * @private
   */
  _onClickInternal: function ($event) {
    var url = $($event.currentTarget).data('url');
    this._historyService.goLoad(url);
  }
};
/**
 * @file line.componentv2
 * @author Tonyspark (tonyspark@sk.partner.com)
 * @editor 양정규, 김인환
 * @since 2021.01.18
 */
Tw.LineComponentV2 = function () {
  Tw.LineComponent.apply(this, arguments);
  this.$container = arguments[0];
  this._initialize();
}
Tw.LineComponentV2.prototype = Object.create(Tw.LineComponent.prototype);
Tw.LineComponentV2.prototype.constructor = Tw.LineComponentV2;
Tw.LineComponentV2.prototype = $.extend(Tw.LineComponentV2.prototype, {
  // 최초실행 후 처리 로직
  _initialize: function() {
    // 최초실행 후 처리 로직
    this._cachedElement();
    this._bindEvents();
    new Tw.XtractorService(this.$container);
  },
  _cachedElement: function () {
    this.$lineTxt = this.$container.find('.fe-line-txt'); // "다른 회선" 텍스트 버튼
    this.$atherLineArea = this.$container.find('#different-line'); // "다른 회선" 영역
    this.$selWrap = this.$container.find('.tod-line-sel-wrap'); // 전체 영역
    this.$lineDim = this.$container.find('[data-id=line-dim]'); // dim 영역
  },
  _bindEvents: function() {
    this.$container.on('click', '.line-tab-cont input.fe-radio-line', _.debounce($.proxy(this._onSelectLine, this), 500));
    this.$container.on('click', '.fe-bt-internal', $.proxy(this._onClickInternal, this));
    this.$container.on('click', '.fe-tab-wrap2 .linker-item', $.proxy(this._onTabClicked, this));
    this.$container.on('click', '.fe-none-event', function (event) {
      event.preventDefault();
    });
    this.$lineDim.on('click', $.proxy(function(event) {
      var $target = $(event.currentTarget);
      if ($target.is(':visible')) {
        // dim 된 상태
        this.$selWrap.toggleClass('show')
        this.$lineTxt.text(this.$lineTxt.data('line-txt'));
        this.$atherLineArea.hide().removeClass('open');
        $target.hide();
      }
      return false;
    }, this));
  },

  _onTabClicked: function (event) {
    // 마우스로 LI를 클릭했을 때만, 발생시키기 위해
    var $target = $(event.currentTarget);
    var $otherTarget = $target.siblings();
    $target.attr('aria-selected', true);
    $target.find('a').attr('aria-selected', true);

    $otherTarget.attr('aria-selected', false);
    $otherTarget.find('a').attr('aria-selected', false);

    var id = $target.find('a').attr('id');
    if (id === 'tab1') {
      $('#tab1-tab').attr('aria-selected', true);
      $('#tab2-tab').attr('aria-selected', false);
    } else {
      $('#tab1-tab').attr('aria-selected', false);
      $('#tab2-tab').attr('aria-selected', true);
    }
    return false;
  },
  /**
   * @function
   * @desc 회선 선택 click event 처리
   * @param $event
   * @private
   */
  _onSelectLine: function ($event) {
    var $selectedLine = $($event.currentTarget);
    var svcMgmtNum = $selectedLine.data('svcmgmtnum');
    var mdn = $selectedLine.data('mdn');

    // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
    if($selectedLine.hasClass('fe-child')) {
      this._historyService.goBack();

      // setTimeout($.proxy(function () {
      //     this._onOpenChildNavi(svcMgmtNum, $selectedLine);
      // },this),100);
    } else {
      this.changeLine(svcMgmtNum, mdn);
    }
  },
  /**
   * @function
   * @desc 내부 경로로 이동
   * @private
   */
  _onClickInternal: function ($event) {
    var url = $($event.currentTarget).data('url');
    this._historyService.goLoad(url);
    return false;
  },

  _openListPopup: function (lineData, totNonCnt, $target) {
    var source = $('#common-select-list-template').html();
    var template = Handlebars.compile(source);
    var selectedMobileItem = lineData[0].list.find(function(item){
      return !!item.option;
    });
    var selectedIptvItem = lineData[1].list.find(function(item){
      return !!item.option;
    });
    var line_data = {
      mobile: lineData[0],
      iptv: lineData[1],
      mobileLen: (lineData[0].list).length,
      iptvLen: (lineData[1].list).length,
      hasNonExpsLine: totNonCnt > 0,
      totNonCnt: totNonCnt,
      selectedMobile: !!selectedMobileItem,
      selectedIptv: !!selectedIptvItem,
      cdn: Tw.Environment.cdn
    };
    var html = template(line_data);
    this.$atherLineArea.html(html).addClass('open have').show();
  },
  /**
   * @function
   * @desc 회선번호 클릭시 처리
   * @param $event 이벤트 객체
   * @return {void}
   * @private
   */
  _onClickLine: function ($event) {
    var $target = $($event.currentTarget);
    var svcMgmtNum = $($event.currentTarget).data('svcmgmtnum');
    var svcCount = $target.data('svcCnt');
    if (parseInt(svcCount, 10) === 1) {
      this._historyService.goLoad('/common/member/line');
      return;
    }
    this.$selWrap.toggleClass('show');
    this.$lineTxt.text(this.$lineTxt.data('close-txt'));
    this.$lineDim.show();
    // 회선 영역이 열려있으면 닫기
    if (this.$atherLineArea.hasClass('open')) {
      this.$lineTxt.text(this.$lineTxt.data('line-txt'));
      this.$atherLineArea.hide().removeClass('open');
      this.$lineDim.hide();
      return;
    }
    this.onClickLine(svcMgmtNum, $target);
  },
  /**
   * @function
   * @desc 회선 정보 파싱
   * @param lineList
   * @returns {Array}
   * @private
   */
  _parseLineList: function (lineList, childLineList) {
    var category = ['MOBILE', 'INTERNET_PHONE_IPTV', 'SECURITY'];
    var result = [];
    _.map(category, $.proxy(function (line) {
      var curLine = lineList[Tw.LINE_NAME[line]];
      // if ( !Tw.FormatHelper.isEmptyArray(curLine) ) {
      var showService = this._index < Tw.DEFAULT_LIST_COUNT ? '' : 'none';
      var isWire = /*true;*/ Tw.LINE_NAME[line] === 's';
      var isMobile = Tw.LINE_NAME[line] === 'm';
      var list = this._convLineData(curLine, line);

      // OP002-5303 : [개선][FE](W-1910-078-01) 회선선택 영역 확대
      if(line === 'MOBILE' && !Tw.FormatHelper.isEmpty(childLineList)) {

        var childInfos = [];
        _.map(childLineList, $.proxy(function (childLine) {
          childInfos.push({
            index: this._index++,
            txt: childLine.eqpMdlNm || '휴대폰',
            option: this._selectedMgmt.toString() === childLine.svcMgmtNum ? 'checked' : '',
            badge: false,
            showLine: this._index <= Tw.DEFAULT_LIST_COUNT ? '' : 'none',
            add: Tw.FormatHelper.conTelFormatWithDash(childLine.svcNum),
            svcMgmtNum: childLine.svcMgmtNum,
            icon: 'ico7',
            child: true
          });
        }, this));
        list = list.concat(childInfos);
      }
      result.push({
        title: Tw.SVC_CATEGORY[Tw.LINE_NAME[line]],
        cnt: list.length,
        list: list,
        showService: showService,
        isWire: isWire,
        isMobile: isMobile,
        cdn: Tw.Environment.cdn
      });
      // }
    }, this));
    return result;
  },
  /**
   * @function
   * @desc 회선 변경 요청
   * @param svcMgmtNum
   * @param mdn
   * @param callback
   */
  changeLine: function (svcMgmtNum, mdn, callback) {
    this._callback = callback;
    this._svcMgmtNum = svcMgmtNum;
    this._mdn = mdn;
    this.$selWrap.toggleClass('show')
    this.$lineTxt.text(this.$lineTxt.data('line-txt'));
    this.$atherLineArea.hide().removeClass('open');
    Tw.CommonHelper.startLoading('[data-id=line-dim]', 'grey');
    this._apiService.request(Tw.NODE_CMD.CHANGE_SESSION, { svcMgmtNum: svcMgmtNum })
      .done($.proxy(this._successChangeLine, this))
      .fail($.proxy(this._failChangeLine, this));
  },
  /**
   * @desc 회선 데이터 화면에 나타내는 데이터로 변경
   * @param lineData
   * @param category
   * @returns {Array}
   * @private
   */
  _convLineData: function (lineData, category) {
    var result = [];
    if (!Tw.FormatHelper.isEmptyArray(lineData)) {
      if (category === 'MOBILE') {
        lineData = Tw.FormatHelper.sortObjArrAsc(lineData, 'svcAttrCd');
      } else {
        lineData = Tw.FormatHelper.sortObjArrDesc(lineData, 'svcAttrCd');
      }

      _.map(lineData, $.proxy(function (line) {
        result.push({
          index: this._index++,
          txt: Tw.FormatHelper.isEmpty(line.nickNm) ? Tw.SVC_ATTR[line.svcAttrCd] : line.nickNm,
          option: this._selectedMgmt.toString() === line.svcMgmtNum ? 'checked' : '',
          badge: line.repSvcYn === 'Y',
          showLine: this._index <= Tw.DEFAULT_LIST_COUNT ? '' : 'none',
          add: Tw.LINE_NAME[category] === 's' ? line.svcAttrCd !== 'S3' ? line.addr :
            Tw.FormatHelper.conTelFormatWithDash(line.svcNum) : Tw.FormatHelper.conTelFormatWithDash(line.svcNum),
          svcMgmtNum: line.svcMgmtNum,
          icon: Tw.LINE_NAME[category] === 'm' ? 'ico7' : line.svcAttrCd === 'S1' ? 'ico10' : line.svcAttrCd === 'S2' ? 'ico11' : 'ico12',
          child: false
        });
      }, this));
    }
    return result;
  },
  /**
   * @function
   * @desc 회선 변경 응답 처리
   * @param resp
   * @private
   */
  _successChangeLine: function (resp) {
    Tw.CommonHelper.endLoading('[data-id=line-dim]');
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._changeLine = true;
      if ( this._openLineList ) {
        this._onCloseListPopup();
      }
    } else if ( resp.code === this.ERROR_CODE.BFF0012 ) {
      this._customerLogin = true;
      if ( this._openLineList ) {
        this._onCloseListPopup();
      }
    } else if ( resp.code === this.ERROR_CODE.BFF0013 ) {
      // 고객보호 비밀번호 잠김
      Tw.Error(resp.code, resp.msg).pop();
    } else if ( resp.code === this.ERROR_CODE.BFF0014 ) {
      // 고객보호 비밀번호 설정페이지
      if ( this._openLineList ) {
        this._historyService.replaceURL('/myt-join/custpassword');
      } else {
        this._historyService.goLoad('/myt-join/custpassword');
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
    this.$lineDim.hide();
  },

  /**
   * @function
   * @desc 회선 변경 요청 실패 처리
   * @param error
   * @private
   */
  _failChangeLine: function (error) {
    Tw.Logger.error(error);
    Tw.CommonHelper.endLoading('[data-id=line-dim]');
    this.$lineDim.hide();
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },
});
