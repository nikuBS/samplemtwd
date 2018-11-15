/**
 * FileName: product.setting.target-discount.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.11.13
 * Page ID: MP_02_02_03_08
 * Desctiption: 상품 > 가입설정해지 > MYT > TTL캠퍼스10요금제> 할인지역,지정번호입력변경
 */
Tw.ProductSettingTargetDiscount = function(rootEl, options) {
  this.$container = rootEl;
  this._options = options;
  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;

  this._init();
  this._bindEvent();
  this._registHelder();
  this._appendLocationLi(this._options.zoneSetInfoList);
};

Tw.ProductSettingTargetDiscount.prototype = {

  /**
   * event binding
   * @private
   */
  _bindEvent: function() {
    // 지역할인 tab
    $('.discount-location').on('click', '.bt-line-gray1', this._removeLocationLi);
    $('#btnSearchPop').click($.proxy(this._openLocSearchPopup, this));

    // 지정번호 tab
    $('#btnAddr').click($.proxy(this._onClickBtnAddr, this));
    $('#btnNumAdd').click($.proxy(this._addNumber, this));
    $('.comp-box').on('click', '.bt-line-gray1', this._removeNumber);

  },

  /**
   * hbs 헬퍼 등록
   * @private
   */
  _registHelder: function(){
    Handlebars.registerHelper('shortNm', function(val){
      val = val || ' ';
      return val.substr(0, 1);
    });
  },

  /**
   * initialize js app
   * @private
   */
  _init: function() {
    // 지역 item 템플릿
    this._tmpltLocItem = Handlebars.compile($('#loc-list-tmplt-item').html());
    this._tmpltNumItem = Handlebars.compile($('#num-list-tmplt-item').html());
  },

  /**
   * 장소 li 추가
   * @param list
   * @private
   */
  _appendLocationLi: function(list){

    if(!list || list.length === 0){
      return;
    }
    var html = '';
    for(var i = 0; i < list.length; i++){
      html += this._tmpltLocItem(list[i]);
    }
    $('.discount-location').append(html);
  },


  /**
   * 장소 li 삭제
   * @param list
   * @private
   */
  _removeLocationLi: function(event){
    // alert 3_A6
    var dcAreaNum = $(event.target).closest('li').data('dcareanum');

    $('.discount-location li').filter('[data-dcareanum='+dcAreaNum+']').remove();
  },


  /**
   * 지역찾기 팝업
   */
  _openLocSearchPopup: function(){
    var keyword = $('#loc-search-input').val();
    this._popupService.open(
      { hbs: 'MP_02_02_03_09' },
      $.proxy(function ($root) {
        if(!this._locSearchService){
          this._locSearchService = new Tw.ProductSettingLocationSearch($root, keyword);
        } else {
          this._locSearchService.init(keyword);
        }
      }, this),
      $.proxy(this._locSearchPopupClosed, this),
      'options'
    );
  },

  /**
   * 지역 검색 팝업 close handler
   * @private
   */
  _locSearchPopupClosed: function(){

    if( this._locSearchService.changed ) {

      $('.discount-location').html('');

      skt_landing.action.loading.on({ ta: this.$container, co: 'grey', size: true });

      this._apiService.request(Tw.API_CMD.BFF_10_0043, {})
        .done($.proxy(function (resp) {

          skt_landing.action.loading.off({ ta: this.$container });
          if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
            Tw.Error(resp.code, resp.msg).pop();
            return ;
          }

          this._appendLocationLi(resp.result.zoneSetInfoList);

        }, this))
        .fail(function(err){
          skt_landing.action.loading.off({ ta: this.$container });
          Tw.Error(err.status, err.statusText).pop();
        });
    }
  },


  /**
   * 지정번호 li 추가
   * @param list
   * @private
   */
  _appendNumLi: function(list){

    if(!list || list.length === 0){
      return;
    }
    var html = '';
    for(var i = 0; i < list.length; i++){
      html += this._tmpltLocItem(list[i]);
    }
    $('.comp-box').append(html);
  },

  /**
   * 지정번호 추가하기 버튼 클릭시
   * @private
   */
  _addNumber: function(){
    var num = $('#num-input').val();
    this._settingTargetNumber('1', num, $.proxy(this._reloadNumList,this));
  },

  /**
   * 지정번호 해지하기 버튼 클릭시
   * @private
   */
  _removeNumber: function(event){
    var svcNum = $(event.target).closest('li').data('svcnum');
    this._settingTargetNumber('1', svcNum, function(){
      $('.comp-box li').filter('[data-svcnum='+svcNum+']').remove();
    });
  },


  /**
   * 추가하기 버튼 클릭시
   * @private
   */
  _settingTargetNumber: function(opClCd, asgnNum, callback){
    if( !opClCd || !asgnNum ){
      return;
    }

    var params = {
      opClCd: opClCd,               // 변경코드 1:등록, 2:삭제, 3:변경
      frAsgnNum: null,          // 변경전 지정번호 3인 경우만
      asgnNum: asgnNum,             // 지정번호
      auditDtm: null            // 변경일자 3인경우 조회시 내려준 값
    };

    skt_landing.action.loading.on({ ta: this.$container, co: 'grey', size: true });

    this._apiService.request(Tw.API_CMD.BFF_10_0074, params )
      .done($.proxy(function (resp) {

        skt_landing.action.loading.off({ ta: this.$container });
        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          Tw.Error(resp.code, resp.msg).pop();
          return ;
        }
        callback();

      }, this))
      .fail(function(err){
        skt_landing.action.loading.off({ ta: this.$container });
        Tw.Error(err.status, err.statusText).pop();
      });
  },


  /**
   * 주소록 호출
   * @param e
   * @private
   */
  _onClickBtnAddr: function (e) {
    Tw.Native.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this, e));
  },

  /**
   * 주소록 호출 결과
   * @param e
   * @param resp
   * @private
   */
  _onContact: function (e, resp) {
    if(resp.resultCode === Tw.NTV_CODE.CODE_00) {
      var params = resp.params;
      var phoneNum = Tw.StringHelper.phoneStringToDash(params.phoneNumber);
      $('#num-input').val(phoneNum);
    }
  },

  /**
   * 지정번호 목록 조회
   * @private
   */
  _reloadNumList: function(){

    skt_landing.action.loading.on({ ta: this.$container, co: 'grey', size: true });

    this._apiService.request(Tw.API_CMD.BFF_10_0073, params )
      .done($.proxy(function (resp) {

        skt_landing.action.loading.off({ ta: this.$container });
        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          Tw.Error(resp.code, resp.msg).pop();
          return ;
        }

        $('.comp-box').html('');
        this._appendNumLi(resp.result);

      }, this))
      .fail(function(err){
        skt_landing.action.loading.off({ ta: this.$container });
        Tw.Error(err.status, err.statusText).pop();
      });


  }
};
