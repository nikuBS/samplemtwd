/**
 * FileName: myt-join.mgmt.numchg.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.22
 */
Tw.MyTJoinMgmtNumchg = function (rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();

  this._bindEvent();
};

Tw.MyTJoinMgmtNumchg.prototype = {

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '.bt-blue1', $.proxy(this._onclickSchNums, this));
    this.$container.on('click', '.bt-red1', $.proxy(this._onclickBtnOk, this));
    this.$container.on('click', '.prev-step', $.proxy(this._onclickBtnCancel, this));
    this.$container.on('click', '.select-list .radiobox', $.proxy(this._onchangeUiCondition, this));
  },

  /**
   * 010번호찾기 클릭시
   * @private
   */
  _onclickSchNums: function(){
    $('#divNumList').hide();

    skt_landing.action.loading.on({ ta: this.$container, co: 'grey', size: true });

    // TODO 변경할 번호 search
    //this._apiService.request(Tw.API_CMD.BFF_05_XXXX, {})
    this._apiService.request(Tw.API_CMD.BFF_05_0150, {})
      .done($.proxy(function (resp) {

        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          Tw.Error(resp.code, resp.msg).pop();
          skt_landing.action.loading.off({ ta: this.$container });
          return ;
        }

        $('#divNumList').show();


        skt_landing.action.loading.off({ ta: this.$container });
        // TODO
        // ok alert
        // popup close??

        this._showOrHideMoreBtn();
      }, this))
      .fail(function(err){
        Tw.Error(err.status, err.statusText).pop();
        skt_landing.action.loading.off({ ta: '#container' });
      });
  },

  /**
   * 번경버튼 클릭시
   * @private
   */
  _onclickBtnOk: function(){
    var param = {
      chgnum : '010-1234-5678'
    };

    // TODO validation



    skt_landing.action.loading.on({ ta: this.$container, co: 'grey', size: true });

    // TODO 변경
    this._apiService.request(Tw.API_CMD.BFF_05_0185, param)
      .done($.proxy(function (resp) {

        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          Tw.Error(resp.code, resp.msg).pop();
          skt_landing.action.loading.off({ ta: this.$container });
          return ;
        }



        skt_landing.action.loading.off({ ta: this.$container });

        // TODO 완료화면으로 이동
        // ok alert
        // popup close??

      }, this))
      .fail(function(err){
        Tw.Error(err.status, err.statusText).pop();
        skt_landing.action.loading.off({ ta: '#container' });
      });
  },

  /**
   * 취소버튼 클릭시
   * @private
   */
  _onclickBtnCancel: function(){
    // this popup close
  },


  /**
   * 신청 조건 변경시(기간선택, 알람유형 선택시)
   * @private
   */
  _onchangeUiCondition: function(){
    var btnDisabled = ($('.select-list .radiobox .checked').length <= 0);
    $('.bt-red1 button').attr('disabled', btnDisabled);
  },


  /**
   * 더보기 버튼 보이김/숨기기
   * @private
   */
  _showOrHideMoreBtn: function(){
    $('.bt-more').show();
    // TODO 보이기/숨기기 기능

  }
};
