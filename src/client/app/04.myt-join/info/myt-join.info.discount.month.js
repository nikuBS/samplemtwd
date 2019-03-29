/**
 * MenuName: 나의 가입정보 > 약정할인/기기 상환 정보 > 상세 할인 내역
 * FileName: myt-join.info.discount.month.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 10. 04.
 * Summary: 약정할인/기기 상환 정보 상세 할인 내역 조회
 */
Tw.MyTJoinInfoDiscountMonth = function (rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._options = options;
  this._moreViewSvc = new Tw.MoreViewComponent();
  this._cachedElement();
  this._bindEvent();
};
Tw.MyTJoinInfoDiscountMonth.prototype = {
  MAX_ITEM_LENGTH_PER_PAGE: 20, // 한페이지당 출력 갯수

  _cachedElement: function () {
    this._$discountMonthList = this.$container.find('.fe-discount-month-list');
    this._$discountMonthItem = this.$container.find('#fe-discount-month-item');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-btn-more', $.proxy(this._onClickBtnMore, this));
  },

  /**
   * 더보기버튼 클릭 시 약정할인 월별 상세 할인내역 조회
   * @private
   */
  _onClickBtnMore: function () {
    if (this._agrmts) {
      return;
    }
    Tw.Api.request(Tw.API_CMD.BFF_05_0076, {
      svcAgrmtCdId: this._options.svcAgrmtDcId,
      svcAgrmtDcCd: this._options.svcAgrmtDcCd
    })
      .done($.proxy(this._onReqDoneDiscountMonth, this))
      .fail($.proxy(this._onReqFailDiscountMonth, this));
    // this._onReqDoneDiscountMonth({
    //   'code': '00',
    //   'msg': 'success',
    //   'result': {
    //     'agrmt': [
    //       {
    //         'invoDt': '20170930',
    //         'invCnt': '1',
    //         'penEstDcAmt': '0',
    //         'perEstRt': '0'
    //       },
    //       {
    //         'invoDt': '20170831',
    //         'invCnt': '2',
    //         'penEstDcAmt': '0',
    //         'perEstRt': '0'
    //       },
    //       {
    //         'invoDt': '20160731',
    //         'invCnt': '3',
    //         'penEstDcAmt': '0',
    //         'perEstRt': '0'
    //       },
    //       {
    //         'invoDt': '20160630',
    //         'invCnt': '4',
    //         'penEstDcAmt': '0',
    //         'perEstRt': '100'
    //       },
    //       {
    //         'invoDt': '20150531',
    //         'invCnt': '5',
    //         'penEstDcAmt': '-4344',
    //         'perEstRt': '0'
    //       },
    //       {
    //         'invoDt': '20150531',
    //         'invCnt': '6',
    //         'penEstDcAmt': '-4344',
    //         'perEstRt': '0'
    //       },
    //       {
    //         'invoDt': '20140531',
    //         'invCnt': '7',
    //         'penEstDcAmt': '-4344',
    //         'perEstRt': '0'
    //       },
    //       {
    //         'invoDt': '20140531',
    //         'invCnt': '8',
    //         'penEstDcAmt': '-4344',
    //         'perEstRt': '0'
    //       },
    //       {
    //         'invoDt': '20140531',
    //         'invCnt': '9',
    //         'penEstDcAmt': '-4344',
    //         'perEstRt': '0'
    //       },
    //       {
    //         'invoDt': '20140531',
    //         'invCnt': '10',
    //         'penEstDcAmt': '-4344',
    //         'perEstRt': '0'
    //       },
    //       {
    //         'invoDt': '20140531',
    //         'invCnt': '11',
    //         'penEstDcAmt': '-4344',
    //         'perEstRt': '0'
    //       },
    //       {
    //         'invoDt': '20130531',
    //         'invCnt': '12',
    //         'penEstDcAmt': '-4344',
    //         'perEstRt': '0'
    //       }
    //     ]
    //   }
    // });
  },

  /**
   * 약정할인 월별 상세 할인내역 조회 성공
   * @private
   */
  _onReqDoneDiscountMonth: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._agrmts = resp.result.agrmt.slice(this.MAX_ITEM_LENGTH_PER_PAGE); // 서버 렌더링 데이터 제외
      this._moreViewSvc.init({
        cnt: this.MAX_ITEM_LENGTH_PER_PAGE,
        list: this._agrmts,
        callBack: $.proxy(this._renderList, this),
        isOnMoreView: true
      });
    } else {
      this._popupService.openAlert(resp.msg, resp.code);
    }
  },

  /**
   * 약정할인 월별 상세 할인내역 출력
   * @param res
   * @private
   */
  _renderList: function (res) {
    var list = this._getFormattedData(res.list);
    _.each(list, $.proxy(function (item) {
      var source = this._$discountMonthItem.html();
      var template = Handlebars.compile(source);
      var output = template(item);
      this._$discountMonthList.append(output);
    }, this));
  },

  /**
   * 약정할인 월별 상세 할인내역 조회 실패
   * @param err
   * @private
   */
  _onReqFailDiscountMonth: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  },

  /**
   * 약정할인 월별 상세 할인내역 데이터 파싱 후 반환
   * @param agrmts
   * @returns agrmts{Array}
   * @private
   */
  _getFormattedData: function (agrmts) {
    _.each(agrmts, $.proxy(function (agrmt) {
      agrmt.showInvoDt = Tw.DateHelper.getShortDate(agrmt.invoDt);
      agrmt.showPenEstDcAmt = Tw.FormatHelper.addComma(agrmt.penEstDcAmt);
    }, this));
    return agrmts;
  }

};