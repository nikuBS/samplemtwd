/**
 * FileName: main.menu.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.06

 */

Tw.MainMenu = function (rootEl, gnbBtn) {
  this.$container = rootEl;
  this.$gnbBtn = gnbBtn;
  this._lineComponent = new Tw.LineComponent();

  this._$btLine = null;
  this._bindEvent();
};

Tw.MainMenu.prototype = {
  _bindEvent: function () {
    this.$btLine = this.$container.find('#fe-bt-line');
    this.$btLine.on('click', $.proxy(this._onClickBtLine, this));
    this.$container.on('click', '#fe-test', $.proxy(this._onTest, this));
    this.$gnbBtn.on('click', $.proxy(this._onGnbBtnClicked, this));
  },
  _onClickBtLine: function () {
    this._lineComponent.onClickLine(this.$btLine.data('svcmgmtnum'));
  },
  _onTest: function (){
    var cert = new Tw.CertificationSelect();
    cert.open({
      authClCd: Tw.AUTH_CERTIFICATION_KIND.F
    }, '', null, null, function (result) {
      if (result.code === '00') {
        (new Tw.HistoryService()).goLoad('/main/menu/refund');
      }
    });
    // var cert = new Tw.CertificationSkSmsRefund();
    // cert.openSmsPopup();
  }
};
