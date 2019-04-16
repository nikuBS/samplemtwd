/**
 * @file 상품 > 모바일요금제 > 설정 > 010캠퍼스요금제,TTL지역할인요금제,TTL캠퍼스10요금제 (MP_02_02_03_09)(hbs) 할인지역 검색
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018-11-13
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param keyword - 검색어
 * @param applyCallback - 콜백 처리
 * @param tmplt - 템플릿
 */
Tw.ProductMobileplanSettingLocationSearch = function(rootEl, keyword, applyCallback, tmplt) {
  this.$container = rootEl;
  this.$selectList = $('.select-list', this.$container);
  this._applyCallback = applyCallback;

  // 지역 item 템플릿
  this._tmpltLocItem = tmplt;

  this._listAll = [];
  this._bindEvent();
  this.init(keyword);
};

Tw.ProductMobileplanSettingLocationSearch.prototype = {

  /**
   * @function
   * @desc search
   */
  init: function() {
    // if( keyword ){
    //   $('input[type=text]', this.$container).val(keyword);
    //   this._search();
    // }
    this._search();
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function() {
    this.$container.on('click', 'button.search', $.proxy(this._listFilter, this));
    this.$container.on('click', '.bt-red1 button', $.proxy(this._addLocation, this));
    this.$container.on('click', '.select-list .radiobox', $.proxy(this._onchangeUiCondition, this));
    // this.$container.on('click', '.inputbox .cancel', $.proxy(this._listFilter, this));
  },

  /**
   * @function
   * @desc 지역 목록 필터 후 출력
   */
  _listFilter: function(){
    // Tw.CommonHelper.startLoading('.container', 'grey', true);
    var list = [];
    var keyword = $('.inputbox input[type=text]', this.$container).val();
    if(!keyword || keyword === ''){
      this._appendLocationLi(this._listAll);
      return;
    }
    for(var i = 0; i < this._listAll.length; i++){
      if(this._listAll[i].areaNm.indexOf(keyword) !== -1){
        list.push(this._listAll[i]);
      }
    }
    this._appendLocationLi(list);
    // Tw.CommonHelper.endLoading('.container');
  },

  /**
   * @function
   * @desc 지역 찾기(처음부터 모두 가져옴 그렇게 해달라고 함..)
   */
  _search: function(){
    // this.$selectList.html('');
    var keyword = $('.inputbox input[type=text]', this.$container).val();

    // if(!keyword || keyword.length === 0){
    //   return ;
    // }

    Tw.CommonHelper.startLoading('.container', 'grey');

    Tw.Api.request(Tw.API_CMD.BFF_10_0044, { areaNm : encodeURIComponent(keyword) })
      .done($.proxy(function (resp) {

        Tw.CommonHelper.endLoading('.container');
        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          Tw.Error(resp.code, resp.msg).pop();
          return ;
        }

        this._listAll = resp.result.zoneInfoList;
        this._appendLocationLi(resp.result.zoneInfoList);

      }, this))
      .fail(function(err){
        Tw.CommonHelper.endLoading('.container');
        Tw.Error(err.status, err.statusText).pop();
      });

  },

  /**
   * @function
   * @desc 장소 li 추가 (장소li템플릿은 html파일에 있음)
   * @param list - 장소 목록
   */
  _appendLocationLi: function(list){

    if(!list || list.length === 0){
      $('#divSearchResult').hide().attr('aria-hidden', true);
      $('#divNoSearchResult').show().attr('aria-hidden', false);
      $('.ti-caption-gray em', this.$container).text('0');
      return;
    } else {
      $('#divSearchResult').show().attr('aria-hidden', false);
      $('#divNoSearchResult').hide().attr('aria-hidden', true);
    }

    var html = '';
    for(var i = 0; i < list.length; i++){
      html += this._tmpltLocItem(list[i]);
    }

    this.$selectList.html(html);
    $('.ti-caption-gray em', this.$container).text(list.length);

    // rebind radiobox event
    this.$selectList.find('.radiobox').unbind('click');
    skt_landing.widgets.widget_radio(this.$selectList);
    this._onchangeUiCondition();
  },

  /**
   * @function
   * @desc radio의 상태가 변경 되었을 때 - 추가버튼 enable or disabled
   */
  _onchangeUiCondition: function(){
    // 체크된 것이 없으면 disabled
    var disabled = (this.$selectList.find('input[type=radio]:checked').length <= 0);
    this.$container.find('.bt-red1 button').attr('disabled', disabled);
  },

  /**
   * @function
   * @desc 지역 추가 버튼 클릭시
   */
  _addLocation: function(){
    Tw.Popup.close();
    var selectedNum = this.$selectList.find('input[type=radio]:checked').val();
    var selectedName = this.$selectList.find('input[type=radio]:checked').attr('title');

    this._applyCallback({num:selectedNum, name:selectedName});
  }

};
