/**
 * FileName: membership.benefit.franchisee.list.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.30
 */

Tw.MembershipBenefitFranchiseeList = function ($element, options, area1List, area2List) {
  this.$container = $element;
  this._options = options;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);

  //totalCnt


  this._ATTR_DATA_LOC = 'data-loc';
  this._sidoList = this._convAreaData(area1List);
  this._sigugunList = this._convAreaData(area2List);
  this._setLocBtnTxtAndAttr('#btnSido', this._options.area1);
  this._setLocBtnTxtAndAttr('#btnSigungu', this._options.area2);

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
   * 서버에서 내려온 지역 목록을 select 목록에 맞게 수정해서 넘겨준다.
   * @param areaList - 지역 목록
   * @returns {*} - actionsheet_select_a_type에 맞는 데이터
   * @private
   */
  _convAreaData: function(areaList){
    if( !areaList || areaList.length === 0){
      return [];
    }
    for(var i = 0; i < areaList.length; i++){
      areaList[i].options = 'condition';
      areaList[i].attr = 'data-loc="'+areaList[i].area+'"';
      areaList[i].value = areaList[i].area;
    }
    return [{list:areaList}];
  },

  /**
   * 지역 선택 버튼 세팅
   * @param el - btn css selector
   * @param val - 지역
   * @private
   */
  _setLocBtnTxtAndAttr: function(el, val){
    var $target = $(el);
    if($target.length === 0 || !val) return ;
    $target.attr(this._ATTR_DATA_LOC, val);
    $target.text(val);
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
      data: this._sidoList
    }, $.proxy(function($target, $layer){
      console.log('actionsheet open 광영시도');
      $layer.one('click', '.condition', $.proxy(this._onselectSido, this, $target));
      $layer.find('['+this._ATTR_DATA_LOC+'=' + $target.attr(this._ATTR_DATA_LOC) + ']').addClass('checked');
    }, this, $target));
  },


  /**
   * select 완료시 - 광역시도
   * @private
   */
  _onselectSido: function($target, event){
    console.log('광역시도 select');
    console.log($target);
    console.log(event.currentTarget);
    var $selectedValue = $(event.currentTarget);
    var val = $selectedValue.attr(this._ATTR_DATA_LOC);
    $target.attr(this._ATTR_DATA_LOC, val);
    $target.text($selectedValue.text());
    this._popupService.close();

    console.log('_onselectSido 광역시도 선택완료 >>>> 시구군 데이터 가져오기');


    skt_landing.action.loading.on({ ta: this.$container, co: 'grey', size: true });

    this._apiService.request(Tw.API_CMD.BFF_11_0022, { area: val })
      .done($.proxy(function (resp) {

        if( !resp || resp.code !== Tw.API_CODE.CODE_00 || !resp.result){
          Tw.Error(resp.code, resp.msg).pop();
          skt_landing.action.loading.off({ ta: this.$container });
          return ;
        }

        var areaList = resp.result;

        /*var areaList = [
          {area : 'area1' },
          {area : 'area2' },
          {area : 'area3' }
        ];*/

        this._resetSigugunList(areaList);

        skt_landing.action.loading.off({ ta: this.$container });
      }, this))
      .fail($.proxy(function(err){
        Tw.Error(err.status, err.statusText).pop();
        skt_landing.action.loading.off({ ta: this.$container });
      }, this));


  },

  /**
   * 시구군 목록 초기화
   * @param list
   * @private
   */
  _resetSigugunList: function(list){
    console.log('_resetSigugunList');
    this._sigugunList = this._convAreaData(list);
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
    console.log('시구군 select');
    console.log($target);
    console.log(event.currentTarget);
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
    this._options.ordCol = $(event.target).attr('data-code');
    console.log('선택 코드: ' + this._options.ordCol );
    this._findPartnerShopList();
  },

  /**
   * 가맹점 찾기
   * @private
   */
  _findPartnerShopList: function(){

    var param = {
      searchTitle: this._options.searchTitle,    // 검색 타이틀
      ordCol: this._options.ordCol,
      area1: this._options.area1,
      area2: this._options.area2,
      pageNo: this._options.pageNo,
      pageSize: this._options.pageSize
    };

    skt_landing.action.loading.on({ ta: this.$container, co: 'grey', size: true });

    this._apiService.request(Tw.API_CMD.BFF_11_0023, param)
      .done($.proxy(function (resp) {

        if( !resp || resp.code !== Tw.API_CODE.CODE_00 || !resp.result){
          Tw.Error(resp.code, resp.msg).pop();
          skt_landing.action.loading.off({ ta: this.$container });
          return ;
        }

        // TODO 데이터 출력
        console.log(resp);

        skt_landing.action.loading.off({ ta: this.$container });
      }, this))
      .fail($.proxy(function(err){
        Tw.Error(err.status, err.statusText).pop();
        skt_landing.action.loading.off({ ta: this.$container });
      }, this));

  }
};