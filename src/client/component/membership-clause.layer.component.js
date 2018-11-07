/**
 * FileName: membership-clause.layer.component.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.29
 *
 */
Tw.MembershipClauseLayerPopup = function ($element, agreeBtnClickHandler) {
  this.$container = $element;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');

  this._agreeBtnClickHandler = agreeBtnClickHandler;
};

Tw.MembershipClauseLayerPopup.prototype = {

  TYPE_BE_04_02_L01 : 'BE_04_02_L01',
  TYPE_BE_04_02_L02 : 'BE_04_02_L02',
  TYPE_BE_04_02_L03 : 'BE_04_02_L03',
  TYPE_BE_04_02_L04 : 'BE_04_02_L04',
  TYPE_BE_04_02_L05 : 'BE_04_02_L05',
  TYPE_BE_04_02_L06 : 'BE_04_02_L06',
  TYPE_BE_04_02_L07 : 'BE_04_02_L07',

  open: function (hbs) {
    // BE_04_02_L01 ~ BE_04_02_L07
    this._hbs = hbs;
    this._popupService.open({
        hbs: this._hbs,// hbs의 파일명
        layer: true
      }, $.proxy(this._openCallback, this),
      $.proxy(this._closeCallback, this), this._hbs);
  },

  open_BE_04_02_L01: function(){
    this.open(this.TYPE_BE_04_02_L01);
  },

  _openCallback: function($layer) {
    Tw.Logger.log('_openCallback.....');
    Tw.Logger.log($layer);
    Tw.Logger.log($layer);
    $layer.one('click', '.bt-red1', $.proxy(this._onclickBtnAgree,this));
  },

  _closeCallback: function($layer,hbs) {
    Tw.Logger.log('_closeCallback.....');
    Tw.Logger.log('$layer:' + $layer);
    Tw.Logger.log('hbs:' + hbs);
    // remove button event
    $layer.unbind('click', this._onclickBtnAgree);
    this._popupService.close();
  },

  /**
   * 동의하기 버튼 클릭
   * @private
   */
  _onclickBtnAgree: function(){
    Tw.Logger.log('_onclickBtnAgree.....');
    Tw.Logger.log('this._currentHbs: ' + this._currentHbs);
    this._agreeBtnClickHandler(this._currentHbs);
    this._popupService.close();
  }



};