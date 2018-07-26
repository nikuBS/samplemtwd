/**
 * FileName: line.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.26
 */

Tw.LineComponent = function () {
  this.$container = $('#header');
  console.log(this.$container);

  this._popupService = Tw.Popup;
  this._bindEvent();
};

Tw.LineComponent.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '#fe-bt-line', $.proxy(this._onClickLine, this));
  },
  _onClickLine: function () {
    console.log('click');
    // TODO: replace api data
    this._popupService.open({
      hbs: 'dropdown',
      list: [
        { txt: '가나다라마바사', option: 'checked', representation: 'representation', line: '010-46**-12**' },
        { txt: '선불폰', option: 'disabled checked', 'representation': '', line: '010-11**-12**' },
        { txt: 'T WiBro', option: 'disabled', 'representation': '', line: 'P******' },
        { txt: '인터넷', option: '', 'representation': '', line: '인천 연********' },
        { txt: '포인트캠', option: '', 'representation': '', line: '010-46**-**' }],
      bt_txt: '회선관리'
    });
  }
};
