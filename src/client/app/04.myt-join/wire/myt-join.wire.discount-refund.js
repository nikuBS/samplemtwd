/**
 * FileName: myt-join.wire.discount-refund.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
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
    Handlebars.registerHelper('shortDateNoDot', Tw.DateHelper.getShortDateNoDot);
    Handlebars.registerHelper('curreny', Tw.FormatHelper.addComma);
  },

  /**
   * 할인 반환금 조회
   * @private
   */
  _requestData: function() {
    // Tw.CommonHelper.startLoading('.container', 'grey', true);
    $('#btn-search').attr('disabled', true);
    $('#divEmpty').hide();
    $('.info-list-type1').hide();
    $('#divLoading').show();

    this._apiService.request(Tw.API_CMD.BFF_05_0158, {})
      .done($.proxy(function (resp) {
        // Tw.CommonHelper.endLoading('.container');
        $('#btn-search').attr('disabled', false);
        $('#divLoading').hide();

        if( !resp || (resp.code !== Tw.API_CODE.CODE_00 && resp.code !== 'ZINVE8888')){
          // $('.info-list-type1').hide();
          // $('#divEmpty').show();
          Tw.Error(resp.code, resp.msg).pop();
          return;
        }

        if( resp.code === 'ZINVE8888'){
          $('.info-list-type1').hide();
          $('#divEmpty').show();
          return;
        }

        var data = resp.result;

        if( data.penaltyInfo && data.penaltyInfo.length > 0 ) {
          var list = data.penaltyInfo;
          var html = '';
          for ( var i = 0; i < list.length ; i++ ) {
            html += this._listTmpl( list[i] );
          }
          $('#divEmpty').hide();
          $('#refund-list').html(html);
          $('.info-list-type1').show();
        }else{
          $('.info-list-type1').hide();
          $('#divEmpty').show();
          return;
        }
        if( data.chargeInfo ) {
          $('#tot-div').html(this._totTmpl(data.chargeInfo));
        }
      }, this))
      .fail(function (err) {
        // Tw.CommonHelper.endLoading('.container');
        $('#btn-search').attr('disabled', false);
        $('#divLoading').hide();
        Tw.Error(err.status, err.statusText);
      });

  }
};
