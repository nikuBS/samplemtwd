/**
 * FileName: myt.benefit.rainbow-point-history.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 8. 14.
 */
Tw.MyTBenefitRainbowPointHistory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._dateHelper = Tw.DateHelper;
  this._popupService = Tw.Popup;

  this.PER_PAGE = 20; //리스트 아이템 노출 최대수
  this.NUM_OF_PAGES = 5;//페이지 번호 노출 최대수

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTBenefitRainbowPointHistory.prototype = {
  _init: function () {
    this.today = this._dateHelper.getShortDateWithFormat(new Date(), 'YYYY-MM-DD');
    var selectedPeriod = $(':input:radio[name=selectdate1]:checked').attr('data-month');
    this._setPeriod(selectedPeriod);
    Handlebars.registerHelper('for', function (from, to, incr, block) {
      var accum = '';
      for ( var i = from; i <= to; i += incr )
        accum += block.fn(i);
      return accum;
    });
    this._requestHistoryData();
  },

  _cachedElement: function () {
    this.$fromDate = this.$container.find('input[data-type="from"]');
    this.$toDate = this.$container.find('input[data-type="to"]');
    this.$listWrapper = this.$container.find('#fe-points-list-wrapper');
    this.$sectionNoItem = this.$container.find('.fe-no-point');
    this.$btPeriod = this.$container.find('#fe-bt-period');
    this.$earnPoint = this.$container.find('#fe-earn-point');
    this.$usedPoint = this.$container.find('#fe-used-point');
    this.$detailSearch = this.$container.find('#fe-detail-search');
  },

  _bindEvent: function () {
    this.$container.on('change', '.fe-period input', $.proxy(this._onChangePeriod, this));
    this.$container.on('click', 'button[data-id="search"]', $.proxy(this._requestHistoryData, this));
  },

  _onChangePeriod: function (e) {
    var month = e.target.getAttribute('data-month');
    this._setPeriod(month);
  },

  _setPeriod: function (months) {
    this.$toDate.val(this.today);
    var strFrom = this._dateHelper.getPastShortDate(months + Tw.DATE_UNIT.MONTH);
    strFrom = this._dateHelper.getShortDateWithFormat(strFrom, 'YYYY-MM-DD');
    this.$fromDate.val(strFrom);
  },

  _requestHistoryData: function () {
    var requestPage = 1;
    var params = {
      fromDt: this.$fromDate.val().replace(/-/g, ''),
      toDt: this.$toDate.val().replace(/-/g, ''),
      page: requestPage,
      size: 20
    };
    this._apiService.request(Tw.API_CMD.BFF_05_0100, params)
      .done($.proxy(this._onHistoryDataReceived, this, requestPage))
      .fail(function () {
      });
  },

  _onHistoryDataReceived: function (page, resp) {
    if ( this.$detailSearch.css('display') !== 'none' ) {
      this.$btPeriod.click();
    }

    this.$btPeriod.text((this.$fromDate.val() + '~' + this.$toDate.val()).replace(/-/g, '.'));
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.$usedPoint.text(Tw.FormatHelper.addComma(resp.result.usdPoint));
      this.$earnPoint.text(Tw.FormatHelper.addComma(resp.result.erndPoint));

      if ( resp.result.history.length < 1 ) {
        this.$listWrapper.empty();
        this.$sectionNoItem.show();
      } else {
        this._currentPage = page;
        this._totalPage = Math.ceil(resp.result.totRecCnt / this.PER_PAGE);
        this._renderList(page, resp.result.history);
      }
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  },

  _renderList: function (page, items) {
    var options = { items: items };

    //페이지 설정
    if ( this._totalPage > 1 ) {
      var startPage, endPage;
      this._currentPage = parseInt(page, 10);
      if ( this._currentPage - (this.NUM_OF_PAGES >> 1) <= 1 ) {//less than 5
        startPage = 1;
        endPage = Math.min(this.NUM_OF_PAGES, this._totalPage);
      } else if ( this._currentPage + (this.NUM_OF_PAGES >> 1) >= this._totalPage ) {//more than total-5
        endPage = this._totalPage;
        startPage = Math.max(this._totalPage - this.NUM_OF_PAGES + 1, 1);
      } else {
        startPage = Math.max(1, this._currentPage - (this.NUM_OF_PAGES >> 1));
        endPage = Math.min(this._totalPage, this._currentPage + (this.NUM_OF_PAGES >> 1));
      }

      options.page = {
        from: startPage,
        to: endPage,
        current: this._currentPage,
        prev: startPage <= 1,
        next: endPage >= this._totalPage
      };
    }

    //rendering
    var source = $('#fe-points-list').html();
    var template = Handlebars.compile(source);
    var output = template(options);

    this.$sectionNoItem.hide();
    this.$listWrapper.empty();
    this.$listWrapper.append(output);

    //binding event
    this.$listWrapper.find('a.prev').on('click', $.proxy(this._onClickPrev, this));
    this.$listWrapper.find('a.next').on('click', $.proxy(this._onClickNext, this));
    this.$listWrapper.find('a[href="#' + this._currentPage + '"]').addClass('active');
  },

  _onClickPrev: function () {

  },
  _onClickNext: function () {

  }
};