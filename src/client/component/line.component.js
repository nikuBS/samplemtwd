/**
 * FileName: line.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.26
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
  this._goAuthLine = false;
  this._lineList = null;
  this._changeLine = false;
  this._customerLogin = false;
  this._openLineList = false;
  this._callback = null;

  this._svcMgmtNum = '';
  this._mdn = '';
};

Tw.LineComponent.prototype = {
  ERROR_CODE: {
    BFF0012: 'BFF0012',    //	고객비밀번호 인증이 필요합니다.
    BFF0013: 'BFF0013',    //	고객비밀번호 잠김 해제가 필요합니다.
    ICAS3216: 'ICAS3216'   // 고객비밀번호가 잠김
  },
  onClickLine: function (selectedMgmt) {
    this._init(selectedMgmt);
    this._openLineList = true;
    this._getLineList();
  },
  _init: function (selectedMgmt) {
    this._index = 0;
    this._selectedMgmt = selectedMgmt;
    this._goAuthLine = false;
    this._lineList = null;
    this._changeLine = false;
    this._customerLogin = false;
    this._openLineList = false;
    this._callback = null;

    this._svcMgmtNum = '';
    this._mdn = '';
  },
  _getLineList: function () {
    // if ( Tw.FormatHelper.isEmpty(this._lineList) ) {
    this._apiService.request(Tw.NODE_CMD.GET_ALL_SVC, {})
      .done($.proxy(this._successGetLineList, this));
    // $.ajax('/mock/auth.line.json')
    //   .done($.proxy(this._successGetLineList, this));
    // } else {
    //   this._openListPopup(this._lineList);
    // }

  },
  _successGetLineList: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._lineList = this._parseLineList(resp.result);
      if ( this._index > 1 ) {
        this._openListPopup(this._lineList);
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _openListPopup: function (lineData) {
    this._popupService.open({
      hbs: 'actionsheet_line',
      layer: true,
      data: lineData,
      btMore: this._index > Tw.DEFAULT_LIST_COUNT
    }, $.proxy(this._onOpenListPopup, this), $.proxy(this._onCloseListPopup, this), 'line');
  },
  _onOpenListPopup: function ($popupContainer) {
    this.$list = $popupContainer.find('.fe-item');
    this.$btMore = $popupContainer.find('#fe-bt-more');


    this.$btMore.on('click', $.proxy(this._onClickMore, this));
    $popupContainer.on('click', '.fe-radio-line', $.proxy(this._onSelectLine, this));
    $popupContainer.on('click', '#fe-bt-line', $.proxy(this._onClickLineButton, this));
  },
  _onCloseListPopup: function () {
    if ( this._changeLine ) {
      this._completeLogin();
    } else if ( this._customerLogin ) {
      this._customerPwd.openLayer(this._mdn, this._svcMgmtNum, $.proxy(this._completeCustomerLogin, this));
    } else if ( this._goAuthLine ) {
      this._historyService.goLoad('/common/member/line');
    }
  },
  _closePopup: function () {
    this._popupService.close();
  },
  _parseLineList: function (lineList) {
    var category = ['MOBILE', 'INTERNET_PHONE_IPTV', 'SECURITY'];
    var result = [];
    _.map(category, $.proxy(function (line) {
      var curLine = lineList[Tw.LINE_NAME[line]];
      if ( !Tw.FormatHelper.isEmpty(curLine) ) {
        var showService = this._index < Tw.DEFAULT_LIST_COUNT ? '' : 'none';
        result.push({
          title: Tw.SVC_CATEGORY[Tw.LINE_NAME[line]],
          list: this._convLineData(curLine, line),
          showService: showService
        });
      }
    }, this));
    return result;
  },
  _convLineData: function (lineData, category) {
    var result = [];
    Tw.FormatHelper.sortObjArrAsc(lineData, 'expsSeq');
    _.map(lineData, $.proxy(function (line) {
      result.push({
        index: this._index++,
        txt: Tw.FormatHelper.isEmpty(line.nickNm) ? Tw.SVC_ATTR[line.svcAttrCd] : line.nickNm,
        option: this._selectedMgmt.toString() === line.svcMgmtNum ? 'checked' : '',
        showLine: this._index <= Tw.DEFAULT_LIST_COUNT ? '' : 'none',
        add: Tw.LINE_NAME[category] === 's' ? line.svcAttrCd !== 'S3' ? line.addr : line.svcNum : line.svcNum,
        svcMgmtNum: line.svcMgmtNum,
        icon: 'ico7'
      });
    }, this));
    return result;
  },
  _onSelectLine: function ($event) {
    var $selectedLine = $($event.currentTarget);
    var svcMgmtNum = $selectedLine.data('svcmgmtnum');
    var mdn = $selectedLine.data('mdn');
    this.changeLine(svcMgmtNum, mdn);

  },
  changeLine: function (svcMgmtNum, mdn, callback) {
    this._callback = callback;
    this._svcMgmtNum = svcMgmtNum;
    this._mdn = mdn;
    this._apiService.request(Tw.NODE_CMD.CHANGE_SESSION, { svcMgmtNum: svcMgmtNum })
      .done($.proxy(this._successChangeLine, this));
  },
  _onClickLineButton: function () {
    this._closePopup();
    this._goAuthLine = true;
  },
  _successChangeLine: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._changeLine = true;
      Tw.CommonHelper.setXtvSvcInfo();

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
    } else if ( resp.code === this.ERROR_CODE.BFF0013 || resp.code === this.ERROR_CODE.ICAS3216 ) {
      // 고객보호 비밀번호 잠김
      Tw.Error(resp.code, resp.msg).pop();
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
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
  _completeLogin: function () {
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.LINE_REFRESH, 'Y');
    if ( !Tw.FormatHelper.isEmpty(this._callback) ) {
      this._callback();
    } else {
      this._historyService.reload();
    }
  },
  _completeCustomerLogin: function () {
    this._completeLogin();
  }
};
