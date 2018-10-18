/**
 * FileName: myt-join.product.additions.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.11
 */


Tw.MyTJoinProductAdditions = function(rootEl) {
  this.$container = rootEl;

  this.cachedElement();
  this.bindEvent();
  this.init();
};

Tw.MyTJoinProductAdditions.prototype = {
  init: function() {
    this._totalCount = Number(this.$container.find('span.counts > em').text());
  },

  bindEvent: function() {
    this.$container.on('click', '.fe-all-btn', $.proxy(this._handleShowAllAdditions, this));
    this.$container.on('click', '.fe-pay-btn', $.proxy(this._handleShowPayAdditions, this));
  },

  cachedElement: function() {
    this.$list = this.$container.find('ul.list-comp-lineinfo');
    this.$empty = this.$container.find('.contents-empty');
  },

  _handleShowAllAdditions: function(e) {
    var $target = $(e.target);
    if (this._totalCount === 0 || $target.hasClass('on')) {
      return;
    }

    if (!this.$container.hasClass('none')) {
      this.$container.find('.contents-empty').addClass('none');
    }

    $target.siblings().removeClass('on');
    $target.addClass('on');
    this.$list.find('[data-isFree="true"]').removeClass('none');
    this.$container.find('span.counts > em').text(this._totalCount);
  },

  _handleShowPayAdditions: function(e) {
    var $target = $(e.target);
    if (this._totalCount === 0 || $target.hasClass('on')) {
      return;
    }

    $target.siblings().removeClass('on');
    $target.addClass('on');

    var additions = this.$list.find('[data-isFree="true"]');
    additions.addClass('none');

    if (this._totalCount === additions.length) {
      this.$empty.removeClass('none');
    }

    this.$container.find('span.counts > em').text(this._totalCount - additions.length);
  }
}
