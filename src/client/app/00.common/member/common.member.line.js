/**
 * @file common.member.line.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.09.27
 */

Tw.CommonMemberLine = function (rootEl, defaultCnt) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._nicknamePopup = new Tw.NicknameComponent();
  this._historyService = new Tw.HistoryService();
  this._defaultCnt = defaultCnt;
  this._pageNo = 2;

  this._changeList = false;

  this.$inputNickname = null;
  this.$showNickname = null;

  this._bindEvent();
};

Tw.CommonMemberLine.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.fe-bt-nickname', $.proxy(this._openNickname, this));
    this.$container.on('click', '.fe-bt-detail', $.proxy(this._openDetail, this));
    this.$container.on('click', '.fe-bt-more', $.proxy(this._onClickMore, this));
    this.$container.find('.fe-change-first').click(_.debounce($.proxy(this._onChangeFirst, this), 500));
    this.$container.on('click', '.fe-input-nickname', $.proxy(this._openNickname, this));
  },

  _openNickname: function ($event) {
    var $btNickname = $($event.currentTarget);
    var $currentLine = $btNickname.parents('.fe-line');
    var svcMgntNum = $currentLine.data('svcmgmtnum');

    this.$inputNickname = $currentLine.find('.fe-input-nickname');
    this.$showNickname = $currentLine.find('.fe-show-name');
    this._nicknamePopup.openNickname(this.$inputNickname.val(), svcMgntNum, $.proxy(this._onCloseNickname, this));
  },
  _onCloseNickname: function (nickname) {
    this.$inputNickname.val(nickname);
    this.$showNickname.html(nickname);
  },
  _openDetail: function ($event) {
    var $target = $($event.currentTarget).parents('.fe-line');
    if ( $target.hasClass('on') ) {
      $target.removeClass('on');
    } else {
      $target.addClass('on');
    }
  },
  _onClickMore: function ($event) {
    var $target = $($event.currentTarget);
    var category = $target.data('category');

    this._apiService.request(Tw.API_CMD.BFF_03_0004, {
      pageNo: this._pageNo,
      pageSize: this._defaultCnt,
      svcCtg: category
    }).done($.proxy(this._successMoreData, this, category, $target));
  },
  _successMoreData: function (category, $target, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( this._pageNo * this._defaultCnt >= resp.result.totalCnt ) {
        $target.hide();
      }
      this._pageNo = this._pageNo + 1;
      this._addList(category, resp.result[category]);
    } else {
      Tw.Error(resp.code, resp.msg).pop(null, $target);
    }
  },
  _addList: function (category, list) {
    var $list = this.$container.find('#fe-list-' + category);
    var $lineTemp = $('#fe-line-tmpl');
    var tplLine = Handlebars.compile($lineTemp.html());
    $list.append(tplLine({ list: this._parseLineData(category, list) }));
  },
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
    }, this));

    return list;
  },
  _onChangeFirst: function ($event) {
    var $target = $($event.currentTarget);
    this._popupService.openConfirmButton(Tw.ALERT_MSG_AUTH.ALERT_4_A5, null, $.proxy(this._confirmNotifyPopup, this),
      $.proxy(this._closeNotifyPopup, this, $target), Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES, $target);
  },
  _confirmNotifyPopup: function () {
    this._popupService.close();
    this._changeList = true;
  },
  _closeNotifyPopup: function ($target) {
    if ( this._changeList ) {
      var currentSvcMgmtNum = $target.parents('.fe-line').data('svcmgmtnum');
      var $remainList = $target.parents('.fe-line-list').find('.fe-line')
        .not('.none-event').filter('[data-svcmgmtnum!=' + currentSvcMgmtNum + ']');
      var changeList = [currentSvcMgmtNum];
      _.map($remainList, $.proxy(function (remainLine) {
        changeList.push($(remainLine).data('svcmgmtnum'));
      }, this));
      this._requestChangeList(changeList, $target);
    }
  },
  _requestChangeList: function (svcNumList, $target) {
    var lineList = svcNumList.join('~');
    this._apiService.request(Tw.NODE_CMD.CHANGE_LINE, {
      params: { svcCtg: Tw.LINE_NAME.MOBILE, svcMgmtNumArr: lineList }
    }).done($.proxy(this._successRegisterLineList, this, $target))
      .fail($.proxy(this._failRegisterLineList, this));
  },
  _successRegisterLineList: function ($target, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._popupService.openAlert(Tw.ALERT_MSG_AUTH.ALERT_4_A6, null, null, $.proxy(this._closeRegisterLine, this), null, $target);
    }
  },
  _closeRegisterLine: function () {
    this._historyService.reload();
  },
  _failRegisterLineList: function (error) {
    Tw.Logger.error(error);
  }
};
