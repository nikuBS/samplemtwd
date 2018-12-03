/**
 * FileName: main.menu.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.06

 */

Tw.MainMenu = function (rootEl) {
  this.$container = rootEl;
  this._lineComponent = new Tw.LineComponent();

  this._$btLine = null;
  this._bindEvent();
};

Tw.MainMenu.prototype = {
  _bindEvent: function () {
    this.$btLine = this.$container.find('#fe-bt-line');
    this.$btLine.on('click', $.proxy(this._onClickBtLine, this));
    // this.$container.on('click', '#fe-test', $.proxy(this._onTest, this));
  },
  _onClickBtLine: function () {
    this._lineComponent.onClickLine(this.$btLine.data('svcmgmtnum'));
  },
  _onTest: function (){
    // var cert = new Tw.CertificationSelect();
    // cert.open({
      // authClCd: Tw.AUTH_CERTIFICATION_KIND.F
    // }, null, null, function (result) {
      // console.log('complete');
      // console.log(result);
    // })
    var cert = new Tw.CertificationSkSmsRefund();
    cert.openSmsPopup();
  }

};
