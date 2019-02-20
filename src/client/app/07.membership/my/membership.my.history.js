/**
 * FileName: membership.my.history.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.12.27
 */

Tw.MembershipMyHistory = function(rootEl, myHistoryData) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._dateHelper = Tw.DateHelper;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._myHistoryData = JSON.parse(myHistoryData);
  this._totoalList = [];
  this._init();
};

Tw.MembershipMyHistory.prototype = {
  _init: function() {
    this._cachedElement();
    this._bindEvent();
    this._renderTemplate();
  },

  _cachedElement: function() {
    this.$btnPopupClose = this.$container.find('.popup-closeBtn');
    this.$list = this.$container.find('#fe-list');
    this.$more = this.$container.find('.btn-more');
    this.$empty = this.$container.find('#fe-empty');
    this.$btnPrevStep = this.$container.find('.prev-step');
  },

  _bindEvent: function() {
    this.$btnPopupClose.on('click', $.proxy(this._goRoamingGuide, this));
    this.$more.on('click', $.proxy(this._onMore,this));
    this.$btnPrevStep.on('click', $.proxy(this._goPrevStep, this));
  },

  _renderTemplate: function() {
    if(this._myHistoryData < 1){
      this.$more.hide();
      this.$empty.show();
    }else{
      this._renderListOne();
    }
  },

  _renderListOne: function() {
    var list = this._myHistoryData;

    this.$list.empty();
    this.$more.hide();
    this.$empty.hide();

    if ( list.length > 0 ){
      this._totoalList = _.chunk(list, Tw.DEFAULT_LIST_COUNT);
      this._renderList(this.$list, this._totoalList.shift());
    }
  },

  _parseList: function(history) {
    for(var idx in history){
      history[idx].show_chg_dt_cnt2 = this._dateHelper.getShortDateWithFormat(history[idx].chg_dt_cnt2,'YYYY.M.D.','YYYYMMDDhhmmss');
    }
    return history;
  },

  // 예약내역 템플릿 생성
  _renderList: function($container, history) {

    var source = $('#tmplList').html();
    var template = Handlebars.compile(source);
    var data = this._parseList(history);
    var output = template({ list : data });
    this.$list.append(output);

    this._moreButton();
  },

  _moreButton: function() {
    var nextList = _.first(this._totoalList);

    if ( nextList ) {
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

  _goRoamingGuide: function() {
    this._historyService.replaceURL('/product/roaming/fi/guide');
  },

  _goPrevStep: function() {
    this._historyService.goBack();
  },

  _onFail: function(err) {
    Tw.Error(err.code,err.msg).pop();
  }

};
