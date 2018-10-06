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
  },
  _onClickBtLine: function () {
    this._lineComponent.onClickLine(this.$btLine.data('svcmgmtnum'));
  }

};
