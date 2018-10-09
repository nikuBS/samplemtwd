/**
 * FileName: myt-data.gift.js
 * Author: Hakjoon Sim (hakjoon.simk@sk.com)
 * Date: 2018.10.08
 */

Tw.MyTDataGift = function (rootEl) {
  this.$container = rootEl;
  this._init();
};

Tw.MyTDataGift.prototype = {
  _init: function () {
    // If there is hash #auto, show second tab(auto gift)
    if (window.location.hash === '#auto') {
      this._goAutoGiftTab();
    }
  },
  _goAutoGiftTab: function () {
    var $tab1 = this.$container.find('#tab1');
    var $tab2 = this.$container.find('#tab2');
    $tab1.attr('aria-selected', false);
    $tab2.attr('aria-selected', true);
  }
};
