/**
 * FileName: myt-join.mgmt.numchg.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.22
 */
Tw.MyTJoinMgmtNumchg = function (rootEl, options) {
  this.$container = rootEl;
  this._options = options;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this._listItemTmpl = Handlebars.compile($('#list-cont-item-tmplt').html());
  this._registHelper();
  this._bindEvent();
};

Tw.MyTJoinMgmtNumchg.prototype = {

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '#btnNumSearch', $.proxy(this._onclickSchNums, this));
    this.$container.on('click', '#btnOk', $.proxy(this._onclickBtnOk, this));
    this.$container.on('click', '#btnMore', $.proxy(this._showMorePhoneNum, this));
    this.$container.on('click', '.select-list .radiobox', $.proxy(this._onchangeUiCondition, this));
  },

  /**
   * hbs helper 등록
   * @private
   */
  _registHelper: function(){
    Handlebars.registerHelper('phonenum', Tw.StringHelper.phoneStringToDash);
  },

  /**
   * 010번호찾기 클릭시
   * @private
   */
  _onclickSchNums: function(){
    // $('#divNumList').hide();

    skt_landing.action.loading.on({ ta: this.$container, co: 'grey', size: true });

    // 변경할 번호 search
    this._apiService.request(Tw.API_CMD.BFF_05_0184, {})
      .done($.proxy(function (resp) {

        skt_landing.action.loading.off({ ta: this.$container });
        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          Tw.Error(resp.code, resp.msg).pop();
          return ;
        }

        this._list = resp.result.numSearchInfoList;
        if( this._list && this._list.length > 0 ){
          $('#divNumList').show();
        }

        this._showMorePhoneNum();

      }, this))
      .fail(function(err){
        Tw.Error(err.status, err.statusText).pop();
        skt_landing.action.loading.off({ ta: this.$container });
      });
  },

  /**
   * 목록 더 보기
   * @private
   */
  _showMorePhoneNum: function(){

    this._lastSeq = this._lastSeq || 0;
    var listLimit = 20;
    var sttNo = this._lastSeq;
    var endNo = this._lastSeq + listLimit;
    if(endNo > this._list.length){
      endNo = this._list.length;
    }

    $('.radiobox').unbind('click');

    var html = '';
    for(var i = sttNo; i < endNo; i++){
      html += this._listItemTmpl(this._list[i]);
    }
    $('.select-list').append(html);

    skt_landing.widgets.widget_radio('.select-list');

    this._lastSeq = endNo;
    this._showOrHideMoreBtn();
  },

  /**
   * 번경버튼 클릭시
   * @private
   */
  _onclickBtnOk: function(){

    // coCd	변경전번호원사업자코드	O
    // num1	전환할 가운데 전화번호	O
    // num2	전환할 뒷 전화번호	O
    var selectedNum = $('.select-list input[type=radio]:checked').val();

    var numArr = null;
    if(selectedNum){
      numArr = selectedNum.split('-');
      if(numArr.length < 3){
        return ;
      }
    }

    var param = {
      coCd : this._options.coCd,
      num1 : numArr[1],
      num2 : numArr[2]
    };

    skt_landing.action.loading.on({ ta: this.$container, co: 'grey', size: true });

    this._apiService.request(Tw.API_CMD.BFF_05_0185, param)
      .done($.proxy(function (resp) {

        skt_landing.action.loading.off({ ta: this.$container });
        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          Tw.Error(resp.code, resp.msg).pop();
          return ;
        }

        Tw.Popup.afterRequestSuccess(
          '/myt-join/submain/phone/alarm',
          '/myt-join/submain',
          Tw.MYT_JOIN_MGMT_NUMCHG.COMPLETE_POPUP.LINK_TXT,
          Tw.MYT_JOIN_MGMT_NUMCHG.COMPLETE_POPUP.MAIN_TXT,
          Tw.MYT_JOIN_MGMT_NUMCHG.COMPLETE_POPUP.SUB_TXT + selectedNum.replace('n',''));

      }, this))
      .fail(function(err){
        skt_landing.action.loading.off({ ta: this.$container });
        Tw.Error(err.status, err.statusText).pop();
      });
  },

  /**
   * 신청 조건 변경시(기간선택, 알람유형 선택시)
   * @private
   */
  _onchangeUiCondition: function(){
    var btnDisabled = ($('.select-list .radiobox .checked').length !== 0);
    $('.bt-red1 button').attr('disabled', btnDisabled);
  },


  /**
   * 더보기 버튼 보이김/숨기기
   * @private
   */
  _showOrHideMoreBtn: function(){
    if( !this._list || this._list.length === 0 || !this._lastSeq || this._lastSeq >= this._list.length){
      $('.bt-more').hide();
    } else {
      $('.bt-more').show();
    }
  }
};
