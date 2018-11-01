/**
 * FileName: membership.benefit.franchisee.list.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.30
 */

Tw.MembershipBenefitFranchiseeList = function ($element, options) {
  this.$container = $element;
  this._options = options;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);

  this._ATTR_DATA_LOC = 'data-loc';
  this._sigugunList = null;

  this._bindEvent();
  console.log('MembershipBenefitFranchiseeList created');
};

Tw.MembershipBenefitFranchiseeList.prototype = {

  /**
   * event 바인딩
   * @private
   */
  _bindEvent: function () {
    $('#btnSido').click($.proxy(this._onclickBtnSido, this));
    $('#btnSigungu').click($.proxy(this._onclickBtnSigugun, this));
    $('#btnsSort button').click($.proxy(this._onchangeSortCondition, this));
    $('#btnSearch').click($.proxy(this._findPartnerShopList, this));
  },

  /**
   * button 클릭시 - 광역시도
   * @private
   */
  _onclickBtnSido: function(event){
    var $target = $(event.target);

    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: '광역시도 선택',
      data: [
        {
          'list': [
            {'option': 'condition', 'attr': 'data-loc="1"', value: '서울'},
            {'option': 'condition', 'attr': 'data-loc="2"', value: '대전'},
            {'option': 'condition', 'attr': 'data-loc="3"', value: '대구'},
            {'option': 'condition', 'attr': 'data-loc="4"', value: '부산'}
          ]
        }
      ]
    }, $.proxy(function($target, $layer){
      $layer.one('click', '.condition', $.proxy(this._onselectSido, this, $target));
      $layer.find('['+this._ATTR_DATA_LOC+'=' + $target.attr(this._ATTR_DATA_LOC) + ']').addClass('checked');
    }, this, $target));
  },

  /**
   * select 완료시 - 광역시도
   * @private
   */
  _onselectSido: function($target, event){
    var $selectedValue = $(event.currentTarget);
    var val = $selectedValue.attr(this._ATTR_DATA_LOC);
    $target.attr(this._ATTR_DATA_LOC, val);
    $target.text($selectedValue.text());
    this._popupService.close();

    console.log('_onselectSido 광역시도 선택완료 >>>> 시구군 데이터 가져오기');
    var sigugunList = [
      {
        'list': [
          {'option': 'condition', 'attr': 'data-loc="1"', value: '도봉구'},
          {'option': 'condition', 'attr': 'data-loc="2"', value: '강북구'},
          {'option': 'condition', 'attr': 'data-loc="3"', value: '노원구'},
          {'option': 'condition', 'attr': 'data-loc="4"', value: '성북구'},
          {'option': 'condition', 'attr': 'data-loc="5"', value: '종로구'},
          {'option': 'condition', 'attr': 'data-loc="6"', value: '은평구'},
          {'option': 'condition', 'attr': 'data-loc="7"', value: '마포구'},
          {'option': 'condition', 'attr': 'data-loc="8"', value: '구로구'}
        ]
      }
    ];

    this._resetSigugunList(sigugunList);
  },

  /**
   * 시구군 목록 초기화
   * @param list
   * @private
   */
  _resetSigugunList: function(list){
    console.log('_resetSigugunList');
    this._sigugunList = list;
    $('#btnSigungu').text('시/군/구');
    $('#btnSigungu').attr('disabled', !$('#btnSido').attr(this._ATTR_DATA_LOC));
    this._onchangeUiCondition();
  },

  /**
   * button 클릭시 - 시구군
   * @private
   */
  _onclickBtnSigugun: function(){
    var $target = $(event.target);

    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: '시구군 선택',
      data: this._sigugunList
    }, $.proxy(function($target, $layer){
      $layer.one('click', '.condition', $.proxy(this._onselectSigungu, this, $target));
      $layer.find('['+this._ATTR_DATA_LOC+'=' + $target.attr(this._ATTR_DATA_LOC) + ']').addClass('checked');
    }, this, $target));
  },

  /**
   * select 완료시 - 시구군
   * @private
   */
  _onselectSigungu: function($target, event){
    var $selectedValue = $(event.currentTarget);
    var val = $selectedValue.attr(this._ATTR_DATA_LOC);
    $target.attr(this._ATTR_DATA_LOC, val);
    $target.text($selectedValue.text());
    this._popupService.close();

    console.log('_onselectSigungu 시구군 선택완료 ');
    this._onchangeUiCondition();
  },

  /**
   * 광역시도,시구군 등 조회조건 변경시
   * @private
   */
  _onchangeUiCondition: function(){

    var sido = $('#btnSido').attr(this._ATTR_DATA_LOC);
    var sigugun = $('#btnSigungu').attr(this._ATTR_DATA_LOC);

    var btnDisabled = (!sido || !sigugun);
    console.log('_onchangeUiCondition sido:' + sido + ', sigugun:' + sigugun);
    console.log('btnDisabled : ' + btnDisabled);

    $('#btnSearch').attr('disabled', btnDisabled);
  },

  /**
   * 절렬기준 클릭시
   * @private
   */
  _onchangeSortCondition: function(event){
    if(event.target.id === 'btnSortGanada'){
      this._findPartnerShopList('가나다');
    }else if(event.target.id === 'btnSortRegDesc'){
      this._findPartnerShopList('최근 등록');
    }
  },

  /**
   * 가맹점 찾기
   * @private
   */
  _findPartnerShopList: function(sort){
    sort = sort | '가나다';
    var param = {
      searchTitle: this._options.searchTitle,    // 검색 타이틀
      sido: '',           // 광역시도
      sigungu: '',        // 시군구
      sort: sort          // 정렬조건
    };
    // TODO call api
    console.log('call api ' , param);
  },

  /**
   * 가맹점 찾기 완료시
   * @param res
   * @private
   */
  _onfindSucess: function(res){
    if(res.code === Tw.API_CODE.CODE_00){
      //ulPartner
    } else {

    }
  }

};