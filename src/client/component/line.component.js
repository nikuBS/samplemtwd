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

  this.$btLine = null;
  this.$list = null;
  this.$remainCnt = null;
  this.$btMore = null;
  this.selectedMgmt = '';
  this.index = 0;

  this._goAuthLine = false;
  this._bindEvent();
  Tw.Logger.info('[Line] init complete');
};

Tw.LineComponent.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '#fe-bt-line', $.proxy(this._onClickLine, this));

    this.$btLine = this.$container.find('#fe-bt-line');
    this.selectedMgmt = this.$btLine.data('svcmgmtnum');
  },
  _onClickLine: function ($event) {
    var curBtn = $($event.currentTarget);
    if ( !curBtn.hasClass('disabled') ) {
      this._getLineList();
    } else {
      this._closePopup();
    }
  },
  _openListPopup: function (lineData) {
    this._popupService.open({
      hbs: 'dropdown',
      group: lineData,
      bt_more: {
        show: this.index > Tw.DEFAULT_LIST_COUNT,
        txt: this.index - Tw.DEFAULT_LIST_COUNT
      },
      bt_txt: Tw.BUTTON_LABEL.LINE
    }, $.proxy(this._onOpenListPopup, this), $.proxy(this._onCloseListPopup, this));
  },
  _onOpenListPopup: function ($popupContainer) {
    this.$btLine.addClass('disabled');

    // $popupContainer.on('click', '.popup-blind', $.proxy(this._closePopup, this));
    $popupContainer.on('click', '.fe-radio-list', $.proxy(this._onSelectLine, this));
    $popupContainer.on('click', '.fe-btn-txt', $.proxy(this._onClickTxtButton, this));
    $popupContainer.on('click', '.bt-more', $.proxy(this._onClickMore, this));

    this.$list = $popupContainer.find('.radiobox', '.type02');
    this.$remainCnt = $popupContainer.find('.fe-remain-cnt');
    this.$btMore = $popupContainer.find('.bt-more');
  },
  _onCloseListPopup: function () {
    this.$btLine.removeClass('disabled');
    if ( this._goAuthLine ) {
      this._historyService.goLoad('/auth/line');
    } else {
      this._historyService.reload();
    }
  },
  _closePopup: function () {
    this._popupService.close();
  },

  _getLineList: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0002, {})
      .done($.proxy(this._successGetLineList, this));
    // $.ajax('/mock/auth.line.json')
    //   .done($.proxy(this._successGetLineList, this));
  },
  _successGetLineList: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._openListPopup(this._parseLineList(resp.result));
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
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
          showService = this.index < Tw.DEFAULT_LIST_COUNT ? 'block' : 'none';
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
      result.push({
        display: this.index < Tw.DEFAULT_LIST_COUNT ? 'block' : 'none',
        index: this.index++,
        txt: Tw.FormatHelper.isEmpty(line.nickNm) ? Tw.SVC_ATTR[line.svcAttrCd] : line.nickNm,
        option: this.selectedMgmt.toString() === line.svcMgmtNum ? 'checked' : '',   // TODO: Add authority
        integration: line.actRepYn === 'Y',
        representation: line.repSvcYn === 'Y',
        line: Tw.LINE_NAME[category] === 'S' ? line.addr : line.svcNum,
        svcMgmtNum: line.svcMgmtNum
      });
    }, this));
    return result;
  },
  _onSelectLine: function ($event) {
    var $selectedLine = $($event.currentTarget).parent();
    this._apiService.request(Tw.NODE_CMD.CHANGE_SESSION, { svcMgmtNum: $selectedLine.data('svcmgmtnum') })
      .done($.proxy(this._successChangeLine, this));
  },
  _onClickTxtButton: function () {
    this._closePopup();
    this._goAuthLine = true;
  },
  _successChangeLine: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      Tw.UIService.setLocalStorage('lineRefresh', 'Y');
      this._closePopup();
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  },
  _onClickMore: function () {
    var $hideList = this.$list.filter('.none');
    var $showList = $hideList.filter(function(index) {
      return index < 20;
    });
    var $service = $showList.parents('.dropdown-group');
    var remainCnt = $hideList.length - $showList.length;

    $service.removeClass('none');
    $service.addClass('block');
    $showList.removeClass('none');
    $showList.addClass('block');

    this.$remainCnt.html(remainCnt);
    if(remainCnt === 0) {
      this.$btMore.hide();
    }
  }
};
