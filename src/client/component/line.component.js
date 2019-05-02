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
Tw.LineComponent = function () {
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
    this._apiService.request(Tw.NODE_CMD.GET_ALL_SVC, {})
      .done($.proxy(this._successGetLineList, this, $target))
      .fail($.proxy(this._failGetLineList, this));
  },

  /**
   * @function
   * @desc 전체 회선 정보 응답 처리
   * @param $target
   * @param resp
   * @private
   */
  _successGetLineList: function ($target, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._lineList = this._parseLineList(resp.result);
      if ( this._index > 1 ) {
        this._openListPopup(this._lineList, $target);
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
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
  _openListPopup: function (lineData, $target) {
    this._popupService.open({
      hbs: 'actionsheet_line',
      layer: true,
      data: lineData,
      btMore: this._index > Tw.DEFAULT_LIST_COUNT
    }, $.proxy(this._onOpenListPopup, this), $.proxy(this._onCloseListPopup, this), 'line', $target);
  },

  /**
   * @function
   * @desc 회선 변경 팝업 오픈 콜백 (이벤트 바인딩)
   * @param $popupContainer
   * @private
   */
  _onOpenListPopup: function ($popupContainer) {
    Tw.CommonHelper.focusOnActionSheet($popupContainer);

    this.$list = $popupContainer.find('.fe-item');
    this.$btMore = $popupContainer.find('#fe-bt-more');

    this.$btMore.on('click', $.proxy(this._onClickMore, this));
    $popupContainer.on('click', '.fe-radio-line', _.debounce($.proxy(this._onSelectLine, this), 500));
    $popupContainer.on('click', '#fe-bt-line', $.proxy(this._onClickLineButton, this));
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
  _parseLineList: function (lineList) {
    var category = ['MOBILE', 'INTERNET_PHONE_IPTV', 'SECURITY'];
    var result = [];
    _.map(category, $.proxy(function (line) {
      var curLine = lineList[Tw.LINE_NAME[line]];
      if ( !Tw.FormatHelper.isEmpty(curLine) ) {
        var showService = this._index < Tw.DEFAULT_LIST_COUNT ? '' : 'none';
        var list = this._convLineData(curLine, line);
        result.push({
          title: Tw.SVC_CATEGORY[Tw.LINE_NAME[line]],
          cnt: list.length,
          list: list,
          showService: showService
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
        icon: Tw.LINE_NAME[category] === 'm' ? 'ico7' : line.svcAttrCd === 'S1' ? 'ico10' : line.svcAttrCd === 'S2' ? 'ico11' : 'ico12'
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
    this.changeLine(svcMgmtNum, mdn);

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
        this._historyService.reload();
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
  }
};
