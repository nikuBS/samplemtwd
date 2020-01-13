/**
 * MenuName: 나의 가입정보 > 서브메인 > 인터넷/집전화/IPTV 할인 반환금 조회(MS_04_01_05)
 * @file myt-join.wire.discount-refund.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.08
 * Summary: 인터넷/집전화/IPTV 할인 반환금 조회
 */

Tw.MyTJoinWireDiscountRefund = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._listTmpl = Handlebars.compile($('#list-tmplt').html());
  this._totTmpl = Handlebars.compile($('#tot-tmplt').html());

  this._cachedElement();
  this._bindEvent();
  this._registerHelper();
};

Tw.MyTJoinWireDiscountRefund.prototype = {

  _cachedElement: function () {
    this._$btnSearch = $('[data-id=btn-search]');
    this._$data = $('.info-list-type1');
    this._$noData = $('#divEmpty');
    this._$loader = $('#divLoading');
  },

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    this._$btnSearch.click($.proxy(this._requestData, this));
  },

  /**
   * hbs register helper 등록
   * @private
   */
  _registerHelper: function () {
    Handlebars.registerHelper('shortDateNoDot', Tw.DateHelper.getShortDate);
    Handlebars.registerHelper('curreny', Tw.FormatHelper.addComma);
  },

  /**
   * 할인 반환금 조회
   * @private
   */
  _requestData: function () {
    this._$btnSearch.attr('disabled', true);
    this._$noData.hide().attr('aria-hidden', true);
    this._$data.hide().attr('aria-hidden', true);
    this._$loader.show().attr('aria-hidden', false);
    Tw.CommonHelper.startLoading('#divLoading', 'grey');

    this._apiService.request(Tw.API_CMD.BFF_05_0158, {})
      .done($.proxy(function (resp) {
        this._$btnSearch.attr('disabled', false);
        Tw.CommonHelper.endLoading('#divLoading');
        this._$loader.hide().attr('aria-hidden', true);

        if (!resp || (resp.code !== Tw.API_CODE.CODE_00 && resp.code !== 'ZINVE8888')) {
          // this._$data.hide().attr('aria-hidden', true);
          // this._$noData.show();
          Tw.Error(resp.code, resp.msg).pop();
          return;
        }

        if (resp.code === 'ZINVE8888') {
          this._$data.hide().attr('aria-hidden', true);
          this._$noData.show().attr('aria-hidden', false);
          return;
        }

        var data = resp.result;

        if (data.penaltyInfo && data.penaltyInfo.length > 0) {
          var list = data.penaltyInfo;
          var html = '';
          for (var i = 0, length = list.length; i < length; i += 1) {
            html += this._listTmpl(list[i]);
          }
          this._$noData.hide().attr('aria-hidden', true);
          $('#refund-list').html(html);
          this._$data.show().attr('aria-hidden', false);
        } else {
          this._$data.hide().attr('aria-hidden', true);
          this._$noData.show().attr('aria-hidden', false);
          return;
        }
        if (data.chargeInfo) {
          $('#tot-div').html(this._totTmpl(data.chargeInfo));
        }
      }, this))
      .fail($.proxy(function (err) {
        this._$btnSearch.attr('disabled', false);
        Tw.CommonHelper.endLoading('#divLoading');
        this._$loader.hide().attr('aria-hidden', true);
        Tw.Error(err.status, err.statusText);
      }, this));
  }
};
