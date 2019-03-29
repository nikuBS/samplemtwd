/**
 * MenuName: 할인/혜택 > 나의 할인 혜택 > 레인보우 포인트 > 포인트 합산
 * FileName: benefit.my-benefit.rainbow-point.adjustment.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 10. 29.
 * Summary: 레인보우 포인트 포인트 합산
 */

/**
 * 레인보우 포인트 공통(합산과 양도 페이지에서 확장해서 사용)
 * @param rootEl
 *
 */
Tw.BenefitMyBenefitRainbowPointCommon = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
};

Tw.BenefitMyBenefitRainbowPointCommon.prototype = {
  _LINE_SELECT_ACTIONSHEET_HBS: 'actionsheet_select_a_type',

  _cachedElement: function () {
    this._$btnLineToGive = this.$container.find('.fe-btn-line-to-give');
    this._$btnLineToReceive = this.$container.find('.fe-btn-line-to-receive');
    this._$inputPoint = this.$container.find('.fe-input-point');
    this._$btnPreview = this.$container.find('.fe-btn-preview');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-btn-line-to-receive', $.proxy(this._onClickBtnLineToReceive, this));
    this.$container.on('click', '.fe-btn-preview', $.proxy(this._onClickBtnPreview, this));
  },

  /**
   * 회선중 svcMgmtNum와 같은 회선을 선택해서 반환
   * @param lines
   * @param svcMgmtNum
   * @return list{Array}
   * @private
   */
  _getLinesAttrToSelect: function (lines, svcMgmtNum) {
    return [{
      list: _.map(lines, function (line) {
        return {
          value: line.showSvcNum,
          attr: 'id="' + line.svcMgmtNum + '"',
          option: line.svcMgmtNum === svcMgmtNum ? 'checked' : ''
        };
      })
    }];
  },

  /**
   * 회선 변경 후 화면 반영시 호출
   * @param line
   * @param $target
   * @private
   */
  _changeLine: function (line, $target) {
    var dashedSvcNum = Tw.FormatHelper.conTelFormatWithDash(line.svcNum);
    $target.find('.fe-svc-num').text(dashedSvcNum);
    $target.data('svc-mgmt-num', line.svcMgmtNum);
  },

  /**
   * 합산하기 버튼 클릭시 유효성 체크
   * @private
   */
  _validate: function () {
    var inputPoint = parseInt(this._$inputPoint.val(), 10) || 0;
    var svcMgmtNumToGive = this._$btnLineToGive.data('svc-mgmt-num').toString();
    var svcMgmtNumToReceive = this._$btnLineToReceive.data('svc-mgmt-num').toString();
    var pointToGive = parseInt(this._lineToGive.point, 10);

    if ( Tw.FormatHelper.isEmpty(inputPoint) || inputPoint <= 0 ) {
      this._popupService.openAlert(Tw.BENEFIT_MY_BENEFIT_RAINBOW_POINT.A1, null, null, null, null, this._$btnPreview);
      return;
    }
    if ( inputPoint > pointToGive ) {
      this._popupService.openAlert(Tw.BENEFIT_MY_BENEFIT_RAINBOW_POINT.A8, null, null, null, null, this._$btnPreview);
      return;
    }
    if ( svcMgmtNumToGive === svcMgmtNumToReceive ) {
      this._popupService.openAlert(Tw.BENEFIT_MY_BENEFIT_RAINBOW_POINT.A13, null, null, null, null, this._$btnPreview);
      return;
    }
    return true;
  },

  /**
   * 합산/양도 완료 성공시 호출
   * @private
   */
  _submitDone: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replacePathName(this._URL.ROOT);
      this._historyService.goLoad(this._URL.COMPLETE);
    } else {
      this._popupService.openAlert(resp.msg, resp.code, null, null, null, this.$btnSubmit);
    }
  },

  /**
   * 합산/양도 완료 실패시 호출
   * @private
   */
  _reqFail: function (err) {
    this._popupService.openAlert(err.msg, err.code, null, null, null, this.$btnSubmit);
  },

  /**
   * 미리보기 팝업 오픈
   * @private
   */
  _openPreviewPopup: function () {
    var previewData = this._getPreviewData();
    var option = {
      hbs: this._PREVIEW_POPUP_HBS,
      layer: true,
      giver: previewData
    };

    Tw.Popup.open(_.extend({}, option, previewData), $.proxy(function ($layer) {
      this.$btnSubmit = $layer.find('.fe-btn-submit');
      this.$btnSubmit.click($.proxy(this._submit, this));
    }, this), null, 'confirm', this._$btnPreview);
  },

  /**
   * 포인트 받는 회선 버튼 선택시 호출
   * @private
   */
  _onClickBtnLineToReceive: function (evt) {
    this._linesToReceiveActionsheet = this._getReceiveLine();
    this._openLineActionsheet(this._linesToReceiveActionsheet, this._lineToReceiveActionsheetOpenCallback, $(evt.target));
  },

  /**
   * 미리보기 팝업 버튼 클릭 시 호출
   * @private
   */
  _onClickBtnPreview: function () {
    var isValid = this._validate();
    if ( isValid ) {
      this._openPreviewPopup();
    }
  },

  /**
   * 회선 변경 액션시트 팝업 오픈
   * @param data
   * @param callback
   * @param $target
   * @private
   */
  _openLineActionsheet: function (data, callback, $target) {
    this._popupService.open({
      hbs: this._LINE_SELECT_ACTIONSHEET_HBS,
      layer: true,
      title: Tw.BENEFIT_MY_BENEFIT_RAINBOW_POINT.SELECT_TITLE,
      data: data
    }, $.proxy(callback, this), null, null, $target);
  },


  /**
   * 포인트 받는 회선 선택 시 callback
   * @param data
   * @param callback
   * @param $target
   * @private
   */
  _lineToReceiveActionsheetOpenCallback: function ($container) {
    $container.find('li button').click($.proxy(function (event) {
      this._changeLineToReceive($(event.currentTarget).attr('id'));
      this._popupService.close();
    }, this));
  }

};

Tw.BenefitMyBenefitRainbowPointAdjustment = function () {
  Tw.BenefitMyBenefitRainbowPointCommon.apply(this, arguments);
  this._cachedElement();
  this._bindEvent();
  this._init();
};
Tw.BenefitMyBenefitRainbowPointAdjustment.prototype = $.extend({}, Tw.BenefitMyBenefitRainbowPointCommon.prototype, {
  _URL: {
    ROOT: '/benefit/my',
    COMPLETE: '/benefit/my/rainbowpoint/adjustment/complete'
  },
  _PREVIEW_POPUP_HBS: 'BS_01_01_03_01',
  _linesToGiveActionsheet: null,
  _linesToReceiveActionsheet: null,

  _cachedElement: function () {
    Tw.BenefitMyBenefitRainbowPointCommon.prototype._cachedElement.apply(this, arguments);
    this._$pointToGive = this.$container.find('.fe-point-to-give');
  },

  _bindEvent: function () {
    Tw.BenefitMyBenefitRainbowPointCommon.prototype._bindEvent.apply(this, arguments);
    this.$container.on('click', '.fe-btn-line-to-give', $.proxy(this._onClickBtnLineToGive, this));
  },

  _init: function () {
    this._lineToGive = this.$container.data('line-to-give');
    this._lines = this.$container.data('lines');
  },

  /**
   * 포인트 주는 회선 버튼 선택시 호출
   * @param evt
   * @private
   */
  _onClickBtnLineToGive: function (evt) {
    var svcMgmtNumToGive = this._$btnLineToGive.data('svc-mgmt-num').toString();
    this._linesToGiveActionsheet = this._getLinesAttrToSelect(this._lines, svcMgmtNumToGive);
    this._openLineActionsheet(this._linesToGiveActionsheet, this._lineToGiveActionsheetOpenCallback, $(evt.target));
  },

  /**
   * 포인트 주는 회선 팝업 > 회선 선택시 호출
   * @param evt
   * @private
   */
  _lineToGiveActionsheetOpenCallback: function ($container) {
    $container.find('li button').click($.proxy(function (event) {
      // 포인트 주는 회선 변경
      this._changeLineToGive($(event.currentTarget).attr('id'));
      this._popupService.close();
    }, this));
  },

  /**
   * 포인트 주는 회선 변경
   * @param svcMgmtNum
   * @private
   */
  _changeLineToGive: function (svcMgmtNum) {
    var selectedLine = _.find(this._lines, {
      svcMgmtNum: svcMgmtNum
    });
    this._$pointToGive.text(selectedLine.showPoint);
    this._$pointToGive.data('point', selectedLine.point);
    this._lineToGive = selectedLine;
    this._changeLine(selectedLine, this._$btnLineToGive);

    //합산 받는 회선은 합산 하는 회선 제외하고 보여짐.
    this._linesToReceiveActionsheet = this._getLinesAttrToSelect(_.reject(this._lines, { svcMgmtNum: svcMgmtNum }));
  },

  /**
   * 미리보기 > 합산완료 버튼 클릭 시 호출
   * @private
   */
  _submit: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0102, {
      'sndrSvcMgmtNum': this._$btnLineToGive.data('svc-mgmt-num').toString(),
      'befrSvcMgmtNum': this._$btnLineToReceive.data('svc-mgmt-num').toString(),
      'point': this._$inputPoint.val()
    }).done($.proxy(this._submitDone, this))
      .fail($.proxy(this._reqFail, this));
  },

  /**
   * 포인트 받는 회선 변경
   * @param svcMgmtNum
   * @private
   */
  _changeLineToReceive: function (svcMgmtNum) {
    var selectedLine = _.find(this._lines, {
      svcMgmtNum: svcMgmtNum
    });
    this._changeLine(selectedLine, this._$btnLineToReceive);
  },

  /**
   * 미리보기 데이터 가공 후 반환
   * @param svcMgmtNum
   * return {Object}
   * @private
   */
  _getPreviewData: function () {
    var inputPoint = parseInt(this._$inputPoint.val(), 10) || 0;
    var svcMgmtNumToGive = this._$btnLineToGive.data('svc-mgmt-num').toString();
    var svcMgmtNumToReceive = this._$btnLineToReceive.data('svc-mgmt-num').toString();
    var selectedLineToGive = _.find(this._lines, {
      svcMgmtNum: svcMgmtNumToGive
    });
    var selectedLineToReceive = _.find(this._lines, {
      svcMgmtNum: svcMgmtNumToReceive
    });
    var pointToGive = parseInt(selectedLineToGive.point, 10);
    var pointToReceive = parseInt(selectedLineToReceive.point, 10);
    return {
      giver: {
        svcNum: selectedLineToGive.showSvcNum,
        point: Tw.FormatHelper.addComma(pointToGive.toString()),
        remain: Tw.FormatHelper.addComma((pointToGive - inputPoint).toString()),
        inputPoint: Tw.FormatHelper.addComma(inputPoint.toString())
      },
      receiver: {
        svcNum: selectedLineToReceive.showSvcNum,
        point: Tw.FormatHelper.addComma(pointToReceive.toString()),
        remain: Tw.FormatHelper.addComma((pointToReceive + inputPoint).toString())
      }
    };
  },

  /**
   * 포인트 받는 회선 정보 반환
   * return {Object}
   * @private
   */
  _getReceiveLine: function () {
    var svcMgmtNumToGive = this._$btnLineToGive.data('svc-mgmt-num').toString();
    var svcMgmtNumToReceive = this._$btnLineToReceive.data('svc-mgmt-num').toString();
    return this._getLinesAttrToSelect(_.reject(this._lines, {
      svcMgmtNum: svcMgmtNumToGive
    }), svcMgmtNumToReceive);
  }
});
Tw.BenefitMyBenefitRainbowPointAdjustment.prototype.constructor = Tw.BenefitMyBenefitRainbowPointAdjustment;

