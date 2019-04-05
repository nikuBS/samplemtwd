/**
 * MenuName: 나의 가입정보 > 서브메인 > 010 전환 번호변경(MS_03_02)
 * @file myt-join.submain.numchange.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.22
 * Summary: 010 전환 번호변경
 */
Tw.MyTJoinPhoneNumChange = function (rootEl, options) {
  this.$container = rootEl;
  this._options = options;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  if(this._options === false){
    if( !Tw.Environment.init ) {
      $(window).on(Tw.INIT_COMPLETE, $.proxy(this._openDisableSvcPopup, this));
    } else {
      this._openDisableSvcPopup();
    }

    return;
  }

  this._registHelper();
  this._bindEvent();
  this._listItemTmpl = Handlebars.compile($('#list-cont-item-tmplt').html());
};

Tw.MyTJoinPhoneNumChange.prototype = {

  /**
   * 서비스 이용불가 팝업 열기
   * @private
   */
  _openDisableSvcPopup: function(){

    var option = {
      title: Tw.MYT_JOIN_MGMT_NUMCHG.ALERT_NO_TARGET.TITLE,
      contents: Tw.MYT_JOIN_MGMT_NUMCHG.ALERT_NO_TARGET.CONTENTS,
      title_type: 'sub',
      cont_align: 'tl',
      bt_b: [{
        style_class: 'bt-blue1 pos-right tw-popup-confirm',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    };

    this._popupService.open(
      option,
      null,
      $.proxy(function(){
        this._historyService.goLoad('/myt-join/submain');
      }, this),
      'disable-service'
    );
  },

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '#btnOthNumSearch', $.proxy(this._onclickOthSchNums, this));
    this.$container.on('click', '#btnGoConfirm', $.proxy(this._onclickBtnGoConfirm, this));
    this.$container.on('click', '#btnOk', $.proxy(this._onclickBtnOk, this));
  },

  /**
   * hbs helper 등록
   * @private
   */
  _registHelper: function(){
    Handlebars.registerHelper('phonenum', Tw.StringHelper.phoneStringToDash);
  },

  /**
   * 다른 번호 조회하기 클릭시
   * @private
   */
  _onclickOthSchNums: function(){
    this._popupService.open(
      { hbs: 'MS_03_02' },
      $.proxy(function ($root) {
        new Tw.MyTJoinPhoneNumChangeSearch(
          $root, this._listItemTmpl, $.proxy(this._onselectNum, this)
        );
      }, this),
      null,
      'search'
    );
  },

  /**
   * 팝업에서 번호 선택 완료시
   * @param num
   * @private
   */
  _onselectNum: function(num){
    this._popupService.close();
    this._options.objSvcNum = num;
    $('#emChgNum').text(this._options.objSvcNum);
  },

  /**
   * 번경하기 버튼 클릭시 -> 확인 화면으로 이동
   * @private
   */
  _onclickBtnGoConfirm: function(){

    this._popupService.open(
      {
        hbs: 'MS_03_04',
        layer: true,
        data: this._options
      },
      $.proxy(function ($root){
        $root.on('click', '.prev-step', function(){
          Tw.Popup.close();
        });
      }, this),
      null,
      'confirm'
    );
  },


  /**
   * 번경완료 버튼 클릭시
   * @private
   */
  _onclickBtnOk: function(){

    // coCd	변경전번호원사업자코드	O
    // num1	전환할 가운데 전화번호	O
    // num2	전환할 뒷 전화번호	O
    var chgNum = this._options.objSvcNum;

    var numArr = null;
    if(chgNum){
      numArr = chgNum.split('-');
      if(numArr.length < 3){
        return ;
      }
    }

    var param = {
      coCd : this._options.coCd,
      num1 : numArr[1],
      num2 : numArr[2]
    };

    Tw.CommonHelper.startLoading('.container', 'grey');

    this._apiService.request(Tw.API_CMD.BFF_05_0185, param)
      .done($.proxy(function (resp) {

        Tw.CommonHelper.endLoading('.container');
        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          // Tw.Error(resp.code, resp.msg).pop();
          this._popupService.openAlert(Tw.MYT_JOIN_MGMT_NUMCHG.ALERT_SVC_FAIL);
          return ;
        }

        // Tw.Popup.afterRequestSuccess(
        //   '/myt-join/submain/phone/alarm',
        //   '/myt-join/submain',
        //   Tw.MYT_JOIN_MGMT_NUMCHG.COMPLETE_POPUP.LINK_TXT,
        //   Tw.MYT_JOIN_MGMT_NUMCHG.COMPLETE_POPUP.MAIN_TXT,
        //   Tw.MYT_JOIN_MGMT_NUMCHG.COMPLETE_POPUP.SUB_TXT + chgNum);
        this._goCompletePage({
          compPage: '/myt-join/submain/numchange/complete',
          mainTxt: Tw.MYT_JOIN_MGMT_NUMCHG.COMPLETE_POPUP.MAIN_TXT,
          subTxt: Tw.MYT_JOIN_MGMT_NUMCHG.COMPLETE_POPUP.SUB_TXT + chgNum,
          linkTxt: Tw.MYT_JOIN_MGMT_NUMCHG.COMPLETE_POPUP.LINK_TXT,
          linkPage: '/myt-join/submain/phone/alarm',
          confirmMovPage: '/myt-join/submain'
        });

      }, this))
      .fail(function(err){
        Tw.CommonHelper.endLoading('.container');
        Tw.Error(err.status, err.statusText).pop();
      });
  },

  /**
   * 완료페이지로 가기
   * @param options
   * @private
   */
  _goCompletePage: function(options){
    var param = '?' +
      'confirmMovPage=' + (options.confirmMovPage||'') + '&' +
      'mainTxt=' + (options.mainTxt||'') + '&' +
      'subTxt=' + (options.subTxt||'') + '&' +
      'linkTxt=' + (options.linkTxt||'') + '&' +
      'linkPage=' + (options.linkPage||'');
    this._historyService.replaceURL(options.compPage + param);
  }

};
