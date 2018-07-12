/**
 * FileName: myt.bill.guidechange.change.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.05
 */

Tw.MyTBillGuideChange = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._billGuideUpdateInstance = null;
  this._billGuideTypesData = null;

  this.BILL_GUIDE_TYPE_COMPONENT = {};
  this.BILL_GUIDE_TYPE_COMPONENT[Tw.BILL_GUIDE_TYPE.TWORLD] = 'tworld';
  this.BILL_GUIDE_TYPE_COMPONENT[Tw.BILL_GUIDE_TYPE.BILL_LETTER] = 'bill-letter';
  this.BILL_GUIDE_TYPE_COMPONENT[Tw.BILL_GUIDE_TYPE.SMS] = 'sms';
  this.BILL_GUIDE_TYPE_COMPONENT[Tw.BILL_GUIDE_TYPE.EMAIL] = 'email';
  this.BILL_GUIDE_TYPE_COMPONENT[Tw.BILL_GUIDE_TYPE.BILL_LETTER_EMAIL] = 'bill-letter-email';
  this.BILL_GUIDE_TYPE_COMPONENT[Tw.BILL_GUIDE_TYPE.SMS_EMAIL] = 'sms-email';
  this.BILL_GUIDE_TYPE_COMPONENT[Tw.BILL_GUIDE_TYPE.BILL_LETTER_SMS] = 'bill-letter-sms';
  this.BILL_GUIDE_TYPE_COMPONENT[Tw.BILL_GUIDE_TYPE.ETC] = 'etc';

  this.BILL_GUIDE_TYPE_NAME = {};
  this.BILL_GUIDE_TYPE_NAME[Tw.BILL_GUIDE_TYPE.TWORLD] = 'T world 확인';
  this.BILL_GUIDE_TYPE_NAME[Tw.BILL_GUIDE_TYPE.BILL_LETTER] = 'Bill Letter';
  this.BILL_GUIDE_TYPE_NAME[Tw.BILL_GUIDE_TYPE.SMS] = '문자';
  this.BILL_GUIDE_TYPE_NAME[Tw.BILL_GUIDE_TYPE.EMAIL] = '이메일';
  this.BILL_GUIDE_TYPE_NAME[Tw.BILL_GUIDE_TYPE.BILL_LETTER_EMAIL] = 'Bill letter + 이메일';
  this.BILL_GUIDE_TYPE_NAME[Tw.BILL_GUIDE_TYPE.SMS_EMAIL] = '문자 + 이메일';
  this.BILL_GUIDE_TYPE_NAME[Tw.BILL_GUIDE_TYPE.BILL_LETTER_SMS] = 'Bill letter + 문자';
  this.BILL_GUIDE_TYPE_NAME[Tw.BILL_GUIDE_TYPE.ETC] = '기타(우편)';

  this._setBillGuideTypes();
  this._assign();
  this._bindEvent();
  this._init();
};

Tw.MyTBillGuideChange.prototype = {
  _assign: function () {
    this._$btnDropdown = this.$container.find('.bt-dropdown');
    this._$componentWrap = this.$container.find('.component-wrap');
    this._$selectedBillGuideTypeName = this.$container.find('.selected-bill-guide-type-name');
  },

  _bindEvent: function () {
    this._$btnDropdown.on('click', $.proxy(this._openTypeSelectPopup, this));
  },

  _openTypeSelectPopup: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.openChoice(Tw.POPUP_TITLE.CHANGE_BILL_GUIDE_TYPE, this._billGuideTypesData, 'type3', $.proxy(this._onOpenChoicePopup, this, $target));
  },

  _onOpenChoicePopup: function ($target, $layer) {
    $layer.on('click', '.popup-choice-list', $.proxy(this._onSelectBillGuideType, this, $target));
  },

  _onSelectBillGuideType: function ($target, event) {
    this._popupService.close();
    var selectedBillGuideType = $(event.currentTarget).find('button').attr('id');
    this._setBillGuideComponent(selectedBillGuideType);
  },

  _setBillGuideTypes: function () {
    this._billGuideTypesData = _.map(this.$container.data('bill-guide-types-data'), function (billGuideType) {
      return {
        attr: 'id="' + billGuideType.curBillType + '"',
        text: billGuideType.selectorLabel
      };
    });
  },

  _setComponentHtml: function (selectedBillGuideType) {
    var source = $('#tmpl-' + selectedBillGuideType).html();
    var template = Handlebars.compile(source);
    var html = template();
    this._$componentWrap.html(html);
  },

  _setBillGuideComponent: function (selectedBillGuideType) {
    this._setComponentHtml(selectedBillGuideType);
    var $component = this._$componentWrap.find('.bill-guide-component');
    var componentName = this.BILL_GUIDE_TYPE_COMPONENT[selectedBillGuideType];
    var componentClassName = componentName.replace(/-([a-z])/g, function (g) {
      return g[1].toUpperCase();
    });
    if ( this._billGuideUpdateInstance ) {
      this._billGuideUpdateInstance.destroy();
    }
    this._billGuideUpdateInstance = new Tw.MyTBillGuideUpdateClasses[componentClassName]($component, true);
    this._$selectedBillGuideTypeName.text(this.BILL_GUIDE_TYPE_NAME[selectedBillGuideType]);
  },

  _init: function () {
    var queryParams = Tw.UrlHelper.getQueryParams();
    var selectedBillGuideType = (queryParams.selectedBillGuideType) ? queryParams.selectedBillGuideType : Tw.BILL_GUIDE_TYPE.TWORLD;
    this._setBillGuideComponent(selectedBillGuideType);
  }
};