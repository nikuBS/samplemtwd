/**
 * FileName: membership.my.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.12.17
 */

Tw.MembershipMy = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._dateHelper = Tw.DateHelper;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._init();
  this._totoalList = [];
};

Tw.MembershipMy.prototype = {
  _init: function() {
    this._cachedElement();
    this._bindEvent();
    this._initPeriod();
    this._getUseHistory();
  },

  _cachedElement: function() {
    this.$btnPopupClose = this.$container.find('.popup-closeBtn');
    this.$strPeriod = this.$container.find('#fe-period');
    this.$inputSdate = this.$container.find('#fe-sdate');
    this.$inputEdate = this.$container.find('#fe-edate');
    this.$inquire = this.$container.find('#fe-inquire');
    this.$list = this.$container.find('#fe-list');
    this.$more = this.$container.find('.bt-more');
    this.$moreCnt = this.$container.find('#fe-more-cnt');
  },

  _bindEvent: function() {
    this.$btnPopupClose.on('click', $.proxy(this._goRoamingGuide, this));
    this.$inputSdate.on('click', $.proxy(this._openDateActionSheet, this));
    this.$inputEdate.on('click', $.proxy(this._openDateActionSheet, this));
    this.$inquire.on('click', $.proxy(this._getUseHistory,this));
    this.$more.on('click', $.proxy(this._onMore,this));
  },

  _initPeriod: function() {
    var getPeriod = '2018.1.~' + this._dateHelper.getCurrentDateTime('YYYY.M.');
    var initEDate = this._dateHelper.getCurrentDateTime('YYYY.M');

    this.$strPeriod.text(getPeriod);
    this.$inputSdate.text('2018.1');
    this.$inputEdate.text(initEDate);
  },

  _getUseHistory: function() {
    var startDate = this._dateHelper.getShortDateWithFormat(this.$inputSdate.text(), 'YYYYMM' , 'YYYY.M');
    var endDate = this._dateHelper.getShortDateWithFormat(this.$inputEdate.text(), 'YYYYMM' , 'YYYY.M');

    startDate = this.$inputSdate.val() === undefined ? '201801' : startDate;
    endDate = this.$inputEdate.val() === undefined ? this._dateHelper.getCurrentDateTime('YYYYMM') : endDate;

    var params = {
      startDate : startDate,
      endDate : endDate
    };

    this._apiService
      .request(Tw.API_CMD.BFF_11_0009, params)
      .done($.proxy(this._renderTemplate, this, params))
      .fail($.proxy(this._onFail, this));

  },

  _renderTemplate: function(params, res) {
    if(res.code === Tw.API_CODE.CODE_00){
      res = res.result;
      if(res.length < 1){
        this.$more.hide();
        $('#fe-empty').show();
      }else{
        $('#fe-empty').hide();
        this._renderListOne(params,res);
      }
    }
  },

  _renderListOne: function(params, res){
    var list = res;
    var sDate = this._dateHelper.getShortDateWithFormat(params.startDate, 'YYYY.M.' , 'YYYYMM');
    var eDate = this._dateHelper.getShortDateWithFormat(params.endDate, 'YYYY.M.' , 'YYYYMM');

    var strPeriod = sDate + ' - ' + eDate;
    this.$strPeriod.text(strPeriod);

    this.$list.empty();
    this.$more.hide();

    if ( list.length > 0 ){
      this._totoalList = _.chunk(list, Tw.DEFAULT_LIST_COUNT);
      this._renderList(this.$list, this._totoalList.shift());
    }
  },

  _parseList: function(res) {
    for(var idx in res){
      res[idx].hpnMm = this._dateHelper.getShortDateWithFormat(res[idx].hpnMm, 'M' , 'MM');
      res[idx].happenDate = res[idx].hpnYy + '.' + res[idx].hpnMm + '.' + res[idx].hpnDd + '.';
      res[idx].showUserDcAmt = Tw.FormatHelper.addComma(res[idx].userDcAmt.toString());
    }

    return res;
  },

  // 예약내역 템플릿 생성
  _renderList: function($container, res) {

    var source = $('#tmplList').html();
    var template = Handlebars.compile(source);
    var data = this._parseList(res);
    var output = template({ list : data });
    this.$list.append(output);

    this._moreButton();
  },

  _moreButton: function(){
    var nextList = _.first(this._totoalList);

    if ( nextList ) {
      this.$moreCnt.text( '(0)'.replace('0', nextList.length) );
      this.$more.show();
    } else {
      this.$more.hide();
    }
  },

  _onMore : function () {
    if( this._totoalList.length > 0 ){
      this._renderList(this.$list, this._totoalList.shift());
    }
  },

  _openDateActionSheet: function(e) {
    var currentSheet = e.target.id;
    var endMonth = Number(this._dateHelper.getCurrentMonth());
    var currentYear = this._dateHelper.getCurrentYear();
    var data = [{'list':[]}];

    for(var i=1; i<=endMonth; i++){
      data[0].list[i] = {
        'radio-attr': 'name="r2"',
        'label-attr': 'value="'+ currentYear + '.' +i +'"',
        txt: currentYear + Tw.DATE_UNIT.YEAR + ' ' + i + Tw.DATE_UNIT.MONTH_S
      };
    }

    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        data: data,
        btnfloating : {'attr':'type="button" id="fe-back"','txt':Tw.BUTTON_LABEL.CLOSE}
      },
      $.proxy(this._onActionSheetOpened, this, currentSheet)
    );
  },

  _onActionSheetOpened: function(currentSheet, $layer) {
    //선택된 값 체크
    $('li.type1').each(function(){
      if($(this).find('label').attr('value') === $('#'+currentSheet).text()){
        $(this).find('input[type=radio]').prop('checked', true);
      }
    });

    $layer.find('[name="r2"]').on('click', $.proxy(this._onActionSelected, this, currentSheet));

    // 닫기 버튼 클릭
    $layer.one('click', '#fe-back', this._popupService.close);
  },

  _onActionSelected: function(currentSheet, e) {
      var dateTxt = $(e.target).parents('label').attr('value');
      $('#'+currentSheet).text(dateTxt);
  },

  _goRoamingGuide: function() {
    this._historyService.replaceURL('/product/roaming/fi/guide');
  },

  _onFail: function(err) {
    Tw.Error(err.code,err.msg).pop();
  }

};
