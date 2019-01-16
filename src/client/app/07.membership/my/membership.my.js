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
    this.$btnReissue = this.$container.find('#fe-reissue');
    this.$btnCardChange = this.$container.find('#fe-card-change');
    this.$strPeriod = this.$container.find('#fe-period');
    this.$inputSdate = this.$container.find('#fe-sdate');
    this.$inputEdate = this.$container.find('#fe-edate');
    this.$inquire = this.$container.find('#fe-inquire');
    this.$list = this.$container.find('#fe-list');
    this.$more = this.$container.find('.btn-more');
    this.$moreCnt = this.$container.find('#fe-more-cnt');
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

  _initPeriod: function() {
    var currentYear = this._dateHelper.getCurrentYear();
    var getPeriod = currentYear +'.1.~' + this._dateHelper.getCurrentDateTime('YYYY.M.');
    var initEDate = this._dateHelper.getCurrentDateTime('YYYY.M');

    this.$strPeriod.text(getPeriod);
    this.$inputSdate.text(currentYear + '.1');
    this.$inputEdate.text(initEDate);
  },

  _getUseHistory: function() {
    var currentYear = this._dateHelper.getCurrentYear();
    var startDate = this._dateHelper.getShortDateWithFormat(this.$inputSdate.text(), 'YYYYMM' , 'YYYY.M');
    var endDate = this._dateHelper.getShortDateWithFormat(this.$inputEdate.text(), 'YYYYMM' , 'YYYY.M');

    startDate = this.$inputSdate.val() === undefined ? currentYear +'01' : startDate;
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
        this.$empty.show();
      }else{
        this._renderListOne(params,res);
      }
    }else{
      this._onFail(res);
    }
  },

  _renderListOne: function(params, res) {
    var list = res;
    var sDate = this._dateHelper.getShortDateWithFormat(params.startDate, 'YYYY.M.' , 'YYYYMM');
    var eDate = this._dateHelper.getShortDateWithFormat(params.endDate, 'YYYY.M.' , 'YYYYMM');

    var strPeriod = sDate + ' - ' + eDate;
    this.$strPeriod.text(strPeriod);

    this.$list.empty();
    this.$more.hide();
    this.$empty.hide();

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

  _moreButton: function() {
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

  _requestReissueInfo: function(state) {
    this._apiService
      .request(Tw.API_CMD.BFF_11_0003, {})
      .done($.proxy(this._successReissueInfo, this, state))
      .fail($.proxy(this._onFail, this));
  },

  _parseReissueData: function(res) {
    res.showGrade = Tw.MEMBERSHIP_GRADE[res.mbrGrCd];
    res.showType = Tw.MEMBERSHIP_TYPE[res.mbrTypCd];
    res.showSvcNum = Tw.FormatHelper.conTelFormatWithDash(res.svcNum);
    res.showMbrCardNum = Tw.FormatHelper.addCardDash(res.mbrCardNum);

    return res;
  },

  _successReissueInfo: function(state, res) {
    if(res.code === Tw.API_CODE.CODE_00) {
      var data = this._parseReissueData(res.result);

      this._popupService.open({
          hbs: 'BE_02_01',
          layer: true,
          data: data
        },
        $.proxy(this._onReissueOpened, this)
      );
    }else{
      this._onFail(res);
    }
  },

  _onReissueOpened: function($root) {
    $root.on('click', '#fe-reissue-req', $.proxy(this._openReissueAlert, this));
  },

  _openReissueAlert: function() {
    var ALERT = Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A51;
    this._popupService.openConfirmButton(ALERT.MSG, ALERT.TITLE, $.proxy(this._handleReissueAlert, this), null, Tw.BUTTON_LABEL.CLOSE, Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A51.BUTTON);
  },

  _handleReissueAlert: function() {
    var mbrChgRsnCd = '';
    $('input[type=radio]').each(function(){
      if($(this).attr('checked') === 'checked'){
        mbrChgRsnCd = $(this).attr('data-code');
      }
    });

    this._apiService
      .request(Tw.API_CMD.BFF_11_0004, { mbrChgRsnCd : mbrChgRsnCd })
      .done($.proxy(this._successReissueRequest, this))
      .fail($.proxy(this._onFail, this));
  },

  _successReissueRequest: function(res) {
    if(res.code === Tw.API_CODE.CODE_00){
      this._popupService.afterRequestSuccess('/membership/my/history', '/membership/my',
        Tw.ALERT_MSG_MEMBERSHIP.JOIN_COMPLETE.LINK_TITLE, Tw.ALERT_MSG_MEMBERSHIP.COMPLETE_TITLE.REISSUE,
        Tw.ALERT_MSG_MEMBERSHIP.JOIN_COMPLETE.CONTENT);
    }else{
      this._onFail(res);
    }
  },

  _cardChangeAlert: function() {
    var ALERT = Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A58;
    this._popupService.openConfirmButton(ALERT.MSG, ALERT.TITLE, $.proxy(this._handleChangeAlert, this), null, Tw.BUTTON_LABEL.CLOSE, Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A58.BUTTON);
  },

  _handleChangeAlert: function() {
    this._apiService
      .request(Tw.API_CMD.BFF_11_0006, {})
      .done($.proxy(this._successCardChange, this))
      .fail($.proxy(this._onFail, this));
  },

  _successCardChange: function(res) {
    //카드 종류 변경 완료 페이지 이동
    if(res.code === Tw.API_CODE.CODE_00){
      this._popupService.afterRequestSuccess('/membership/my/history', '/membership/my',
        Tw.ALERT_MSG_MEMBERSHIP.JOIN_COMPLETE.LINK_TITLE, Tw.ALERT_MSG_MEMBERSHIP.COMPLETE_TITLE.CHANGE,
        Tw.ALERT_MSG_MEMBERSHIP.JOIN_COMPLETE.CONTENT);
    }else{
      this._onFail(res);
    }
  },

  _popupClose: function() {
    this._popupService.close();
  },

  _goUpdate: function(e) {
    if($(e.currentTarget).attr('data-type') === 'SP'){
      var ALERT = Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A59;
      this._popupService.openAlert(ALERT.MSG, ALERT.TITLE);
      return;
    }
    this._historyService.replaceURL('/membership/my/update');
  },

  _goMyCancel: function() {
    this._historyService.goLoad('/membership/my/cancel');
  },

  _onFail: function(err) {
    Tw.Error(err.code,err.msg).pop();
  }

};
