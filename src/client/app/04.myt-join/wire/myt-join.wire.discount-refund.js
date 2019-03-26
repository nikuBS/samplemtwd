/**
 * MenuName: 나의 가입정보 > 서브메인 > 인터넷/집전화/IPTV 할인 반환금 조회(MS_04_01_05)
 * FileName: myt-join.wire.discount-refund.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 * Summary: 인터넷/집전화/IPTV 할인 반환금 조회
 */

Tw.MyTJoinWireDiscountRefund = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._listTmpl = Handlebars.compile($('#list-tmplt').html());
  this._totTmpl = Handlebars.compile($('#tot-tmplt').html());

  this._bindEvent();
  this._registerHelper();
};

Tw.MyTJoinWireDiscountRefund.prototype = {


  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    $('#btn-search').click($.proxy(this._requestData, this));
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
  _requestData: function() {

    $('#btn-search').attr('disabled', true);
    $('#divEmpty').hide().attr('aria-hidden', true);
    $('.info-list-type1').hide().attr('aria-hidden', true);
    $('#divLoading').show().attr('aria-hidden', false);
    Tw.CommonHelper.startLoading('#divLoading', 'grey');

    this._apiService.request(Tw.API_CMD.BFF_05_0158, {})
      .done($.proxy(function (resp) {

        $('#btn-search').attr('disabled', false);
        Tw.CommonHelper.endLoading('#divLoading');
        $('#divLoading').hide().attr('aria-hidden', true);

        if( !resp || (resp.code !== Tw.API_CODE.CODE_00 && resp.code !== 'ZINVE8888')){
          // $('.info-list-type1').hide().attr('aria-hidden', true);
          // $('#divEmpty').show();
          Tw.Error(resp.code, resp.msg).pop();
          return;
        }

        if( resp.code === 'ZINVE8888'){
          $('.info-list-type1').hide().attr('aria-hidden', true);
          $('#divEmpty').show().attr('aria-hidden', false);
          return;
        }

        var data = resp.result;

        if( data.penaltyInfo && data.penaltyInfo.length > 0 ) {
          var list = data.penaltyInfo;
          var html = '';
          for ( var i = 0; i < list.length ; i++ ) {
            html += this._listTmpl( list[i] );
          }
          $('#divEmpty').hide().attr('aria-hidden', true);
          $('#refund-list').html(html);
          $('.info-list-type1').show().attr('aria-hidden', false);
        }else{
          $('.info-list-type1').hide().attr('aria-hidden', true);
          $('#divEmpty').show().attr('aria-hidden', false);
          return;
        }
        if( data.chargeInfo ) {
          $('#tot-div').html(this._totTmpl(data.chargeInfo));
        }
      }, this))
      .fail(function (err) {

        $('#btn-search').attr('disabled', false);
        Tw.CommonHelper.endLoading('#divLoading');
        $('#divLoading').hide().attr('aria-hidden', true);
        Tw.Error(err.status, err.statusText);
      });

  }
};
