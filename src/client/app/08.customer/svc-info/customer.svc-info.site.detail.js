/**
 * FileName: customer.useguide.common.js
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018. 10. 18
 */
Tw.CustomerSvcInfoSiteDetail = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._hash = Tw.Hash;

  this._init();

  this._cachedElement();
  this._bindEvent();

};

Tw.CustomerSvcInfoSiteDetail.prototype = {
  _init : function() {

  },
  _cachedElement: function () {
    this.$InfoBtn = this.$container.find('#ti-select-btn');

  },
  _bindEvent: function () {
    this.$InfoBtn.on('click', $.proxy(this._typeActionSheetOpen, this));
    this.$InfoBtn.text(Tw.CUSTOMER_SITE_INFO_TYPEA_CHOICE.options[0].list[0].value).attr('value', 'A'); 
  },

  // 타입 A 일 경우에만 실행되게 됨 : 셀렉트박스 실행 start
  _typeActionSheetOpen: function () {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type', // hbs의 파일명
      layer: true,
      title: Tw.CUSTOMER_SITE_INFO_TYPEA_CHOICE.title,
      data: Tw.CUSTOMER_SITE_INFO_TYPEA_CHOICE.options
    }, $.proxy(this._callBackAction, this), $.proxy(function(){
      this._popupService.close();
    }, this));
  },

  _callBackAction: function (root) {
    this.$selectList = root.find('.chk-link-list');
    this.$selectList.on('click', 'button', $.proxy(this._moveToTab, this));
    // 선택
    this._checkValue(this.$InfoBtn.attr('value'));
  },
  
  _moveToTab: function (e) {
    var selectedValue = $(e.currentTarget).val();

    this._checkValue(selectedValue, $(e.currentTarget).find('.info-value').text());
    this._popupService.close();

    this.$container.find('#siteFaqCont' + (selectedValue === 'A' ? '1' : '2')).show();
    this.$container.find('#siteFaqCont' + (selectedValue === 'A' ? '2' : '1')).hide();
  },

  _checkValue: function (value, text) {
    this.$selectList.find('button').removeClass('checked');
    this.$selectList.find('button').filter(function(){
      return $(this).val() === value;
    }).addClass('checked');

    // 선택된 텍스트
    this.$InfoBtn.attr('value', value);
    if(text) this.$InfoBtn.text(text); 
  }

  // 타입 A 일 경우에만 실행되게 됨 : 셀렉트박스 실행 end

};