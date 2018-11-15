/**
 * FileName: product.setting.location-search.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.11.13
 * Page ID: MP_02_02_03_09(hbs)
 * Desctiption: 상품 > 가입설정해지 > MYT > TTL캠퍼스10요금제> 할인지역 변경 > 할인지역 검색
 */
Tw.ProductSettingLocationSearch = function(rootEl, keyword) {
  this.$container = rootEl;
  this.$selectList = $('.select-list', this.$container);

  // 지역 item 템플릿
  this._tmpltLocItem = Handlebars.compile($('#loc-search-list-tmplt-item').html());

  this._bindEvent();
  this.init(keyword);
};

Tw.ProductSettingLocationSearch.prototype = {

  /**
   * search
   * @private
   */
  init: function(keyword) {

    this.changed = false;
    if( keyword ){
      $('input[type=text]', this.$container).val(keyword);
      this._search();
    }
  },

  /**
   * event binding
   * @private
   */
  _bindEvent: function() {
    this.$container.on('click', 'button.search', $.proxy(this._search, this));
    this.$container.on('click', '.bt-red1 button', $.proxy(this._addLocation, this));
    this.$container.on('click', '.select-list .radiobox', $.proxy(this._onchangeUiCondition, this));
  },


  _search: function(){
    this.$selectList.html('');
    var keyword = $('.inputbox input[type=text]', this.$container).val();

    if(!keyword || keyword.length === 0){
      return ;
    }

    skt_landing.action.loading.on({ ta: this.$container, co: 'grey', size: true });

    this._apiService.request(Tw.API_CMD.BFF_10_0044, { areaNm : keyword })
      .done($.proxy(function (resp) {

        skt_landing.action.loading.off({ ta: this.$container });
        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          Tw.Error(resp.code, resp.msg).pop();
          return ;
        }
        this._appendLocationLi(resp.result.zoneInfoList);

      }, this))
      .fail(function(err){
        skt_landing.action.loading.off({ ta: this.$container });
        Tw.Error(err.status, err.statusText).pop();
      });

  },

  /**
   * 장소 li 추가
   * @param list
   * @private
   */
  _appendLocationLi: function(list){

    if(!list || list.length === 0){
      $('#divSearchResult').hide();
      $('#divNoSearchResult').show();
      return;
    } else {
      $('#divSearchResult').show();
      $('#divNoSearchResult').hide();
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
   * radio의 상태가 변경 되었을 때 - 추가버튼 enable or disabled
   * @private
   */
  _onchangeUiCondition: function(){
    // 체크된 것이 없으면 disabled
    var disabled = (this.$selectList.find('input[type=radio]:checked').length <= 0);
    this.$container.find('.bt-red1 button').attr('disabled', disabled);
  },

  /**
   * 지역 추가 api 호출
   * @private
   */
  _addLocation: function(){
    var selectedNum = this.$selectList.find('input[type=radio]:checked').val();

    var params = {
      chgCd: '1',               // 변경코드 1:등록, 2:변경, 3:삭제
      frDcAreaNum: selectedNum, // 현재 할인지역코드
      toDcAreaNum: null,        // 변경할 할인지역코드
      toDcAreaNm: null,         // 변경할 할인지역명
      auditDtm: null            // 최종변경일시 (조회때 받은값)
    };
    skt_landing.action.loading.on({ ta: this.$container, co: 'grey', size: true });

    this._apiService.request(Tw.API_CMD.BFF_10_0045, params )
      .done($.proxy(function (resp) {

        skt_landing.action.loading.off({ ta: this.$container });
        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          Tw.Error(resp.code, resp.msg).pop();
          return ;
        }
        this.changed = true;
        Tw.Popup.close();

      }, this))
      .fail(function(err){
        skt_landing.action.loading.off({ ta: this.$container });
        Tw.Error(err.status, err.statusText).pop();
      });

  }

};
