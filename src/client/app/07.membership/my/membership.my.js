/**
 * @file membership.my.js
 * @desc 나의 T멤버십
 * @author SeungKyu Kim (ksk4788@pineone.com)
 * @since 2018.12.17
 */

Tw.MembershipMy = function(rootEl, cardReqDt) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._dateHelper = Tw.DateHelper;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._init();
  this._totoalList = [];
  this._cardReqDt = cardReqDt;
};

Tw.MembershipMy.prototype = {
  _init: function() {
    this._cachedElement();
    this._bindEvent();
    this._initPeriod();
    this._getUseHistory();
  },

  _cachedElement: function() {
    this.$btnReissue = this.$container.find('#fe-reissue');
    this.$btnCardChange = this.$container.find('#fe-card-change');
    this.$strPeriod = this.$container.find('#fe-period');
    this.$inputSdate = this.$container.find('#fe-sdate');
    this.$inputEdate = this.$container.find('#fe-edate');
    this.$inquire = this.$container.find('#fe-inquire');
    this.$list = this.$container.find('#fe-list');
    this.$more = this.$container.find('.btn-more');
    this.$empty = this.$container.find('#fe-empty');
    this.$goUpdate = this.$container.find('#fe-go-update');
  },

  _bindEvent: function() {
    this.$btnReissue.on('click', $.proxy(this._requestReissueInfo, this));
    this.$btnCardChange.on('click', $.proxy(this._cardChangeAlert, this));
    this.$container.on('click', '.prev-step',$.proxy(this._popupClose, this));
    this.$inputSdate.on('click', $.proxy(this._openDateActionSheet, this));
    this.$inputEdate.on('click', $.proxy(this._openDateActionSheet, this));
    this.$inquire.on('click', $.proxy(this._getUseHistory,this));
    this.$more.on('click', $.proxy(this._onMore,this));
    this.$goUpdate.on('click', $.proxy(this._goUpdate,this));
  },

  /**
   * @function
   * @desc 화면 진입 후 이용기간 조회 초기값 설정
   * @private
   */
  _initPeriod: function() {
    var currentYear = this._dateHelper.getCurrentYear();
    var getPeriod = currentYear +'.1.~' + this._dateHelper.getCurrentDateTime('YYYY.M.');
    var initEDate = this._dateHelper.getCurrentDateTime('YYYY.M');

    this.$strPeriod.text(getPeriod);
    this.$inputSdate.text(currentYear + '.1');
    this.$inputEdate.text(initEDate);
  },

  /**
   * 이용내역 조회하기 버튼 선택
   * @param e
   * @returns {*|void}
   * @private
   */
  _getUseHistory: function(e) {
    var currentYear = this._dateHelper.getCurrentYear();
    var startDate = this._dateHelper.getShortDateWithFormat(this.$inputSdate.text(), 'YYYYMM' , 'YYYY.M');
    var endDate = this._dateHelper.getShortDateWithFormat(this.$inputEdate.text(), 'YYYYMM' , 'YYYY.M');

    startDate = this.$inputSdate.val() === undefined ? currentYear +'01' : startDate;
    endDate = this.$inputEdate.val() === undefined ? this._dateHelper.getCurrentDateTime('YYYYMM') : endDate;

    // 시작조회일이 더 클 경우 Alert 호출
    if(Number(startDate) - Number(endDate) > 0){
      return this._popupService.openAlert(Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A50.MSG,
        Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A50.TITLE, null, null, null, $(e.currentTarget));
    }

    var params = {
      startDate : startDate,
      endDate : endDate
    };

    // 이용내역 조회 API
    this._apiService
      .request(Tw.API_CMD.BFF_11_0009, params)
      .done($.proxy(this._renderTemplate, this, params))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc BFF_11_0009 나의 멤버십 - 이용내역조회 API Response
   * @param params
   * @param res
   * @private
   */
  _renderTemplate: function(params, res) {
    if(res.code === Tw.API_CODE.CODE_00){
      res = res.result;

      // 이용 내역 유무에 따라 화면 처리 분기
      if(res.length < 1){
        this.$list.hide();
        this.$more.hide();
        this.$empty.show();
      }else{
        this._renderListOne(params,res);
      }
    }else{
      this._onFail(res);
    }
  },

  /**
   * @function
   * @desc 이용 내역 화면 초기화
   * @param params
   * @param res
   * @private
   */
  _renderListOne: function(params, res) {
    var list = res;
    var sDate = this._dateHelper.getShortDateWithFormat(params.startDate, 'YYYY.M.' , 'YYYYMM');
    var eDate = this._dateHelper.getShortDateWithFormat(params.endDate, 'YYYY.M.' , 'YYYYMM');

    var strPeriod = sDate + ' - ' + eDate;
    this.$strPeriod.text(strPeriod);

    this.$list.show();
    this.$list.empty();
    this.$more.hide();
    this.$empty.hide();

    if ( list.length > 0 ){
      this._totoalList = _.chunk(list, Tw.DEFAULT_LIST_COUNT); // 배열을 정해진 갯수의 배열로 나눔
      this._renderList(this.$list, this._totoalList.shift()); // .shift() 배열의 첫번째 요소를 제거하고 제거된 요소 반환
    }
  },

  /**
   * @function
   * @desc 서버에서 받은 이용내역 데이터 가공
   * @param res
   * @returns {*}
   * @private
   */
  _parseList: function(res) {
    for(var idx in res){
      res[idx].hpnMm = this._dateHelper.getShortDateWithFormat(res[idx].hpnMm, 'M' , 'MM');
      res[idx].hpnDd = this._dateHelper.getShortDateWithFormat(res[idx].hpnDd, 'D' , 'DD');
      res[idx].happenDate = res[idx].hpnYy + '.' + res[idx].hpnMm + '.' + res[idx].hpnDd + '.';
      res[idx].showUserDcAmt = Tw.FormatHelper.addComma(res[idx].userDcAmt.toString());
      res[idx].storeName = res[idx].coName + ' ('+ res[idx].joinName + ')';
    }

    return res;
  },

  /**
   * @function
   * @desc 이용 내역 템플릿 생성
   * @param $container
   * @param res
   * @private
   */
  _renderList: function($container, res) {

    var source = $('#tmplList').html();
    var template = Handlebars.compile(source);
    var data = this._parseList(res);
    var output = template({ list : data });
    this.$list.append(output);

    this._moreButton();
  },

  /**
   * @function
   * @desc 데이터 갯수에 따라 더보기 버튼 Show/Hide 처리
   * @private
   */
  _moreButton: function() {
    var nextList = _.first(this._totoalList); // 배열의 첫번째 요소 반환

    if ( nextList ) {
      this.$more.show();
    } else {
      this.$more.hide();
    }
  },

  /**
   * @function
   * @desc 더보기 버튼 선택
   * @private
   */
  _onMore : function () {
    if( this._totoalList.length > 0 ){
      this._renderList(this.$list, this._totoalList.shift());
    }
  },

  /**
   * @function
   * @desc 기간 조회 Action Sheet Open
   * @param e
   * @private
   */
  _openDateActionSheet: function(e) {
    var currentSheet = e.target.id; // 선택한 기간 조회 id('fe-sdate' or 'fe-edate')
    var endMonth = Number(this._dateHelper.getCurrentMonth());
    var currentYear = this._dateHelper.getCurrentYear();
    var data = [{'list':[]}];

    // 액션시트 데이터 가공 (현재 월부터 상단에 출력)
    for(var i=0; i<endMonth; i++){
      data[0].list[i] = {
        'radio-attr': 'name="r2"',
        'label-attr': 'value="'+ currentYear + '.' + (endMonth - i) +'"',
        txt: currentYear + Tw.DATE_UNIT.YEAR + ' ' + (endMonth - i) + Tw.DATE_UNIT.MONTH_S
      };
    }

    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        data: data,
        btnfloating : {'attr':'type="button" id="fe-back"','txt':Tw.BUTTON_LABEL.CLOSE}
      },
      $.proxy(this._onActionSheetOpened, this, currentSheet), null, null, $(e.currentTarget)
    );
  },

  /**
   * @function
   * @desc 기간 조회 Action Sheet Open Callback
   * @param currentSheet - 선택한 기간 조회 id
   * @param $layer
   * @private
   */
  _onActionSheetOpened: function(currentSheet, $layer) {
    Tw.CommonHelper.focusOnActionSheet($layer);
    // 선택된 값 체크
    $('li.type1').each(function(){
      if($(this).find('label').attr('value') === $('#'+currentSheet).text()){
        $(this).find('input[type=radio]').prop('checked', true);
      }
    });

    $layer.find('[name="r2"]').on('click', $.proxy(this._onActionSelected, this, currentSheet));

    // 닫기 버튼 클릭
    $layer.one('click', '#fe-back', this._popupService.close);
  },

  /**
   * @function
   * @desc 기간 조회 ActionSheet 값 선택
   * @param currentSheet- 선택한 기간 조회 id
   * @param e
   * @private
   */
  _onActionSelected: function(currentSheet, e) {
      var dateTxt = $(e.target).parents('label').attr('value');
      $('#'+currentSheet).text(dateTxt);

      this._popupService.close();
  },

  /**
   * @function
   * @desc 재발급 신청 버튼 선택하여 재발급 화면 이동
   * @param e
   * @private
   */
  _requestReissueInfo: function(e) {
    // 카드 발급 후 2주이내 알럿
    if(this._cardReqDt !== ''){
      var reissueLimitDate = Tw.DateHelper.getShortDateWithFormatAddByUnit(this._cardReqDt, 15, 'day', 'YYYYMMDD', 'YYYYMMDD');
      var getDiffDate = Tw.DateHelper.getDifference(reissueLimitDate);
      
      if(getDiffDate > 0 ){ // getDiffDate 값이 0보다크면 카드 발급 후 2주 이내
        var ALERT = Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A61;
        this._popupService.openAlert(ALERT.MSG, ALERT.TITLE, null, null, null, $(e.currentTarget));
        return;
      }
    }

    this._historyService.goLoad('my/reissue');
  },

  /**
   * @desc 카드 종류 변경 확인 Alert Open
   * @param e
   * @private
   */
  _cardChangeAlert: function(e) {
    var ALERT = Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A58;
    this._popupService.openConfirmButton(ALERT.MSG, ALERT.TITLE,
      $.proxy(this._handleChangeAlert, this), null, Tw.BUTTON_LABEL.CLOSE, Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A58.BUTTON, $(e.currentTarget));
  },

  /**
   * @function
   * @desc BFF_11_0006 나의 멤버십 - 카드종류 변경 API Request
   * @private
   */
  _handleChangeAlert: function() {
    this._popupService.close();
    this._apiService
      .request(Tw.API_CMD.BFF_11_0006, {})
      .done($.proxy(this._successCardChange, this))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc 카드 종류 변경 API Response
   * @param res
   * @private
   */
  _successCardChange: function(res) {
    // 카드 종류 변경 완료 페이지 이동
    if(res.code === Tw.API_CODE.CODE_00){
      this._popupService.afterRequestSuccess(null, '/membership/my', null,
        Tw.ALERT_MSG_MEMBERSHIP.COMPLETE_TITLE.CHANGE, Tw.ALERT_MSG_MEMBERSHIP.JOIN_COMPLETE.CONTENT);
    }else{
      this._onFail(res);
    }
  },

  _popupClose: function() {
    this._popupService.close();
  },

  /**
   * @function
   * @desc 정보수정 화면으로 이동
   * @param e
   * @private
   */
  _goUpdate: function(e) {
    if($(e.currentTarget).attr('data-type') === 'SP'){ // 이용정지 회원에 대한 Alert 호출
      var ALERT = Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A59;
      this._popupService.openAlert(ALERT.MSG, ALERT.TITLE, null, null, null, $(e.currentTarget));
      return;
    }
    this._historyService.goLoad('/membership/my/update');
  },

  /**
   * @function
   * @desc 해지하기 화면으로 이동
   * @private
   */
  _goMyCancel: function() {
    this._historyService.goLoad('/membership/my/cancel');
  },

  _onFail: function(err) {
    Tw.Error(err.code,err.msg).pop();
  }

};
