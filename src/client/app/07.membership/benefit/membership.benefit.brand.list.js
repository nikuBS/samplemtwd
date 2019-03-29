/**
 * MenuName: T멤버십 > 제휴브랜드 > 전체보기
 * FileName: membership.benefit.brand.list.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.06
 * Summary: 가맹점 지역별 조회
 * Description:
 * 화면 진입 파라메터로 지역이 들어오는 경우 지역을 먼저 세팅한 후 조회함
 * 지역이 파라메터로 들어오는 경우 반드시 encode되서 들어와야함
 */

Tw.MembershipBenefitBrandList = function (rootEl, options) {
  this.$container = rootEl;
  this._options = options;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._area1List = [];         // 시도 actionsheet list
  this._area2List = [];         // 시군구 actionsheet list
  this._selectedArea1 = null;   // 선택 시도
  this._selectedArea2 = null;   // 선택 시군구
  this._currentPage = 1;        // 조회 페이지no
  this._lastSchParam = null;    // 마지막 조회 parameter

  this.DEFAULT_SIGUNGU_TXT = $('#fe-btn-gu').text();

  this._initParamHasArea = false;    // 페이지 진입시 파라메터에 지역이 있는 경우

  // 초기 파라메터로 area가 들어온 경우 지역을 먼저 검색하고 지역을 기반으로 가맹점 검색함
  if(decodeURI(options.area) ){
    var tmpArr = decodeURI(options.area).split(' ');
    if(tmpArr.length < 2){
      return;
    }
    this._initParamHasArea = true;
    this._options.area1 = tmpArr[0];
    this._options.area2_1 = tmpArr[1];
    if(tmpArr.length >= 3){
      this._options.area2_2 = tmpArr[1] + ' ' + tmpArr[2];
    }
  }


  this._registHbsHelper();
  this._cacheElements();
  this._bindEvent();

  this._requestArea1();

  // 초기데이터에 지역이 들어오지 않은 경우만 전체 조회
  if(!this._initParamHasArea){
    this._onSearchRequested();
  }
};

Tw.MembershipBenefitBrandList.prototype = {
  _cacheElements: function () {
    this.$btnSearch = this.$container.find('#fe-frch-search');
    this._feFrchListItem = Handlebars.compile($('#fe-franchisee-list-item').html());
  },
  _bindEvent: function () {
    this.$container.on('click', '#fe-btn-city', $.proxy(this._onClickCity, this));
    this.$container.on('click', '#fe-btn-gu', $.proxy(this._onClickGu, this));
    this.$container.on('click', '#fe-btn-odr-n', $.proxy(this._onSearchRequested, this));
    this.$container.on('click', '#fe-btn-odr-r', $.proxy(this._onSearchRequested, this));
    this.$btnSearch.on('click', $.proxy(this._onSearchRequested, this));
    this.$container.on('click', '#frchs-bt-more', $.proxy(this._onClickMoreBtn, this));
    this.$container.on('click', '.franchisee-list .bt-map', $.proxy(this._goMap, this));
  },

  _registHbsHelper: function(){
    Handlebars.registerHelper('tel', Tw.FormatHelper.getDashedPhoneNumber);
  },

  /**
   * 시도 조회
   * @private
   */
  _requestArea1: function(){
    this._apiService.request(Tw.API_CMD.BFF_11_0021, {})
      .done($.proxy(function(resp){
        this._area1List = this._getActionSheet01List('rbt_area1', resp.result);

        // 초기 param에 지역이 들어온 경우
        if(this._initParamHasArea) {

          for ( var i = 0; i < resp.result.length; i++ ) {
            var area1 = resp.result[i].area;
            if(area1 === this._options.area1){
              this._selectedArea1 = area1;
              $('#fe-btn-city').text(this._selectedArea1);
              break;
            }
          }
          if(this._selectedArea1){    // 지역1이 유효한 경우만 지역2검색->가맹점검색
            this._requestArea2();
          } else {
            this._onSearchRequested();
          }
        }

      }, this))
      .fail(function (err) {
        Tw.Error(err.status, err.statusText).pop();
      });
  },

  /**
   * 시군구 조회
   * @private
   */
  _requestArea2: function(){
    this._apiService.request(Tw.API_CMD.BFF_11_0022, {area1: encodeURI(this._selectedArea1) })
      .done($.proxy(function(resp){
        this._area2List = this._getActionSheet01List('rbt_area2', resp.result);


        // 초기 param에 지역이 들어온 경우
        if(this._initParamHasArea){

          for(var i = 0; i < resp.result.length; i++){
            var area2 = resp.result[i].area;
            if(area2 === this._options.area2_1 || area2 === this._options.area2_2 ){
              this._selectedArea2 = area2;
              $('#fe-btn-gu').text(this._selectedArea2);
              $('#fe-btn-gu').attr('disabled', false);
              this.$btnSearch.attr('disabled', false);
              break;
            }
          }

          this._onSearchRequested();
        }

      }, this))
      .fail(function (err) {
        Tw.Error(err.status, err.statusText).pop();
      });
  },

  /**
   * 시도, 시군구 조회 결과를 actionsheet에 맞는 list로 변환
   * @param radioName
   * @param list
   * @returns {Array}
   * @private
   */
  _getActionSheet01List: function(radioName, list){
    list.splice(0, 0, {area : Tw.COMMON_STRING.ALL});
    var arr = [];
    for(var i = 0; i < list.length; i++){
      arr.push({
        txt : list[i].area,
        'label-attr': 'id="ra'+i+'"',
        'radio-attr': 'id="ra'+i+'" name="'+radioName+'" value="' + list[i].area + '"'
      });
    }
    return arr;
  },

  _onClickCity: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        data: [{list: this._area1List }],
        btnfloating : { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE }
      },
      $.proxy(this._onOpenArea1Actsht, this, $target)
      );
  },

  /**
   * 시도 actionsheet open
   * @param $target
   * @param $layer
   * @private
   */
  _onOpenArea1Actsht: function($target, $layer){
    if(this._selectedArea1){
      $layer.find('[value="' + this._selectedArea1 + '"]').prop('checked', true);
    }

    $layer.one('click', 'li.type1', $.proxy(function($target, event){
      var rbt = $(event.currentTarget).find('input[type=radio]');
      if(this._selectedArea1 !== rbt.val()){
        this._selectedArea1 = rbt.val();
        $target.text(this._selectedArea1);
        this._requestArea2();
        this._selectedArea2 = '';
        $('#fe-btn-gu').text(this.DEFAULT_SIGUNGU_TXT);
        $('#fe-btn-gu').attr('disabled', false);
        this.$btnSearch.attr('disabled', false);

        if(this._selectedArea1 === Tw.COMMON_STRING.ALL){
          $('#fe-btn-gu').attr('disabled', true);
        }
      }
      this._popupService.close();
    }, this, $target));
  },


  _onClickGu: function () {
    var $target = $(event.currentTarget);

    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        data: [{list: this._area2List }],
        btnfloating : { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE }
      },
      $.proxy(this._onOpenArea2Actsht, this, $target)
    );
  },


  /**
   * 시구군 actionsheet open
   * @private
   */
  _onOpenArea2Actsht: function($target, $layer){

    if(this._selectedArea2){
      $layer.find('[value="' + this._selectedArea2 + '"]').prop('checked', true);
    }

    $layer.one('click', 'li.type1', $.proxy(function($target, event){

      var rbt = $(event.currentTarget).find('input[type=radio]');
      if(this._selectedArea2 !== rbt.val()){
        this._selectedArea2 = rbt.val();
        $('#fe-btn-gu').text(this._selectedArea2);
        this.$btnSearch.attr('disabled', false);
      }
      this._popupService.close();
    }, this, $target));
  },

  /**
   * 더보기 버튼 클릭시
   * @private
   */
  _onClickMoreBtn: function(){
    this._currentPage = this._currentPage + 1;
    this._onSearchRequested();
  },

  /**
   * 가맹점 조회
   * @param event
   * @private
   */
  _onSearchRequested: function (event) {
    this._initParamHasArea = false;     // 한번만 타야하므로 무조건 false

    if(event){
      var $btn = $(event.currentTarget);
      if($btn.attr('id') === 'fe-btn-odr-n' || $btn.attr('id') === 'fe-btn-odr-r' ){
        // 웹접근성, aria-selected 속성 추가
        $('#fe-odr-btn-box button').removeClass('on').attr('aria-selected', false);
        $btn.addClass('on').attr('aria-selected', true);
      }
    }
    var ord = $('#fe-odr-btn-box .on').attr('id') === 'fe-btn-odr-n' ? 'N' : 'R';

    if( this._selectedArea1 === Tw.COMMON_STRING.ALL ){
      this._selectedArea1 = '';
    }
    if( this._selectedArea2 === Tw.COMMON_STRING.ALL ){
      this._selectedArea2 = '';
    }

    var param = {
      ordCol: ord,
      area1: encodeURI(this._selectedArea1 || ''),
      area2: encodeURI(this._selectedArea2 || ''),
      brandCd: this._options.brandCd,
      pageNo: String(this._currentPage),
      pageSize: '20'
    };
    if(this._lastSchParam && (
      this._lastSchParam.ordCol !== param.ordCol ||
      this._lastSchParam.area1 !== param.area1 ||
      this._lastSchParam.area2 !== param.area2 ) ){

      this._currentPage = 1;
      param.pageNo = String(this._currentPage);
    }

    this._apiService.request(Tw.API_CMD.BFF_11_0023, param)
      .done($.proxy(function(resp){
        this._lastSchParam = param;

        if(resp.result){
          var list = resp.result.list;
          var tmp = '';
          var $frchsBox = $('.franchisee-list');
          for(var i = 0; i < list.length; i++){
            tmp += this._feFrchListItem(list[i]);
          }
          $('.t-point').text(Tw.FormatHelper.addComma(resp.result.totalCnt));

          if(this._lastSchParam.pageNo === '1'){
            $frchsBox.html(tmp);
          }else {
            $frchsBox.append(tmp);
          }

          if(parseInt(this._lastSchParam.pageNo,10) * 20 < parseInt(resp.result.totalCnt, 10)){
            $('#frchs-bt-more').show().attr('aria-hidden', false);
          }else {
            $('#frchs-bt-more').hide().attr('aria-hidden', true);
          }
        }
      }, this))
      .fail(function (err) {
        Tw.Error(err.status, err.statusText).pop();
      });
  },


  /**
   * 지도보기로 이동
   * @param event
   * @private
   */
  _goMap: function(event){
    var $bt = $(event.currentTarget);
    var param = {
      coCd: $bt.data('cocd'),
      joinCd: $bt.data('joincd'),
      mapX: $bt.data('mapx'),
      mapY: $bt.data('mapy'),
      brandCd: this._options.brandCd,
      cateCd: this._options.cateCd
    };
    this._historyService.goLoad('/membership/benefit/map?' + $.param(param));
  }



};