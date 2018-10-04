/**
 * FileName: line.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.26
 */

Tw.LineComponent = function () {
  this.$container = $('#header');

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
  this._urlAuth = null;
  this._changeLine = false;
  this._bindEvent();
  Tw.Logger.info('[Line] init complete', this._urlAuth);
};

Tw.LineComponent.prototype = {
  ERROR_CODE: {
    RDT0006: 'RDT0006',    //	service-password required	고객비밀번호 인증필요
    RDT0007: 'RDT0007',    //	service-password locked	고객비밀번호 인증필요
    RDT0008: 'RDT0008'     //	service-password initialized	고객비밀번호 재설정 필요 ( 신청, 초기화 상태 )
  },
  _bindEvent: function () {
    this.$btLine = this.$container.find('#fe-bt-line');
    this._selectedMgmt = this.$btLine.data('svcmgmtnum');
    this._urlAuth = this.$btLine.data('urlauth');

    this.$btLine.on('click', $.proxy(this._onClickLine, this));
  },
  _onClickLine: function ($event) {
    // var curBtn = $($event.currentTarget);
    // if ( !curBtn.hasClass('no-arrow') ) {
    //   if ( !curBtn.hasClass('disabled') ) {
    //     this._getLineList();
    //   } else {
    //     this._closePopup();
    //   }
    // }
    this._getLineList();
  },
  _getLineList: function () {
    if ( Tw.FormatHelper.isEmpty(this._lineList) ) {
      this._apiService.request(Tw.NODE_CMD.GET_ALL_SVC, {})
        .done($.proxy(this._successGetLineList, this));
      // $.ajax('/mock/auth.line.json')
      //   .done($.proxy(this._successGetLineList, this));
    } else {
      this._openListPopup(this._lineList);
    }

  },
  _successGetLineList: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._lineList = this._parseLineList(resp.result);
      this._openListPopup(this._lineList);
    } else {
      Tw.Error(resp.code, resp.msg).page();
    }
  },
  _openListPopup: function (lineData) {
    this._popupService.open({
      hbs: 'CO_line_ActionSheet',
      layer: true,
      group: lineData,
      bt_txt: Tw.BUTTON_LABEL.LINE
    }, $.proxy(this._onOpenListPopup, this), $.proxy(this._onCloseListPopup, this), 'line');
  },
  _onOpenListPopup: function ($popupContainer) {
    // this.$btLine.addClass('disabled');

    // $popupContainer.on('click', '.popup-blind', $.proxy(this._closePopup, this));
    $popupContainer.on('click', '.fe-item', $.proxy(this._onSelectLine, this));
    $popupContainer.on('click', '#fe-bt-line', $.proxy(this._onClickLineButton, this));

    this.$remainCnt = $popupContainer.find('.fe-remain-cnt');
  },
  _onCloseListPopup: function () {
    // this.$btLine.removeClass('disabled');
    if ( this._goAuthLine ) {
      this._historyService.goLoad('/auth/line');
    } else if ( this._changeLine ) {
      this._historyService.reload();
    }
  },
  _closePopup: function () {
    this._popupService.close();
  },
  _parseLineList: function (lineList) {
    var category = ['MOBILE', 'INTERNET_PHONE_IPTV', 'SECURITY'];
    var result = [];
    _.map(category, $.proxy(function (line, index) {
      var curLine = lineList[Tw.LINE_NAME[line]];
      if ( !Tw.FormatHelper.isEmpty(curLine) ) {
        var showService = 'none';
        if ( index === 0 ) {
          showService = 'block';
        } else {
          showService = this._index < Tw.DEFAULT_LIST_COUNT ? 'block' : 'none';
        }
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
      var selected = this._selectedMgmt.toString() === line.svcMgmtNum ? 'checked ' : '';
      result.push({
        index: this._index++,
        txt: Tw.FormatHelper.isEmpty(line.nickNm) ? Tw.SVC_ATTR[line.svcAttrCd] : line.nickNm,
        option: selected, // + (this._urlAuth.indexOf(line.svcGr) === -1 ? 'disabled' : ''),   // TODO: Add authority
        integration: line.actRepYn === 'Y',
        representation: line.repSvcYn === 'Y',
        line: Tw.LINE_NAME[category] === 'S' ? line.addr : line.svcNum,
        svcMgmtNum: line.svcMgmtNum
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
  changeLine: function (svcMgmtNum, mdn) {
    this._apiService.request(Tw.NODE_CMD.CHANGE_SESSION, { svcMgmtNum: svcMgmtNum })
      .done($.proxy(this._successChangeLine, this, svcMgmtNum, mdn));
  },
  _onClickLineButton: function () {
    this._closePopup();
    this._goAuthLine = true;
  },
  _successChangeLine: function (svcMgmtNum, mdn, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._completeLogin();
    } else if ( resp.code === this.ERROR_CODE.RDT0006 || resp.code === this.ERROR_CODE.RDT0007 ) {
      this._customerPwd.openLayer(mdn, svcMgmtNum, $.proxy(this._completeCustomerLogin, this));
    } else if ( resp.code === this.ERROR_CODE.RDT0008 ) {
      // 고객보호 비밀번호 설정 페이지
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    } else {
      // this._historyService.goLoad('/auth/login/fail?errorCode=' + resp.code);
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  },
  // _onClickMore: function () {
  //   var $hideList = this.$list.filter('.none');
  //   var $showList = $hideList.filter(function (index) {
  //     return index < Tw.DEFAULT_LIST_COUNT;
  //   });
  //   var $service = $showList.parents('.dropdown-group');
  //   var remainCnt = $hideList.length - $showList.length;
  //
  //   $service.removeClass('none');
  //   $service.addClass('block');
  //   $showList.removeClass('none');
  //   $showList.addClass('block');
  //
  //   this.$remainCnt.html(remainCnt);
  //   if ( remainCnt === 0 ) {
  //     this.$btMore.hide();
  //   }
  // },
  _completeLogin: function () {
    this._changeLine = true;
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.LINE_REFRESH, 'Y');
    this._closePopup();
  },
  _completeCustomerLogin: function () {
    this._completeLogin();
  }
};
