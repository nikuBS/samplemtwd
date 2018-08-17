/**
 * FileName: myt.benefit.discount.main.js
 * Author: Kim Inhwan (skt.P132150@partner.sk.com)
 * Date: 2018.08.14
 */

Tw.MyTBenefitDisCntMain = function (params) {
  this._apiService = Tw.Api;
  this.$container = params.$element;
  this._history = new Tw.HistoryService(this.$container);

  this._rendered();
  this._bindEvent();
};

Tw.MyTBenefitDisCntMain.prototype = {

  _rendered: function () {
    this.$benefitList = this.$container.find('.benefits-list');
    this.$reBenefitList = this.$container.find('.recomm-benefits');
  },

  _bindEvent: function () {
    this.$benefitList.on('click', 'button', $.proxy(this.onListItemClick, this));
    this.$reBenefitList.on('click', 'li', $.proxy(this.onListItemClick, this));
  },

  onListItemClick: function (event) {
    var $target;
    var tagName = event.target.tagName.toLowerCase();
    switch ( tagName ) {
      case 'button':
      case 'li':
        $target = $(event.target);
        break;
      default:
        $target = $(event.target).parent('[data-id]');
        break;
    }
    this._pageMove($target.attr('data-id'));
  },

  _pageMove: function (dataId) {
    var url = 'discount/detail?';
    switch ( dataId ) {
      case 'fe-bundlePrdc':
        url += 'type=prdc';
        break;
      case 'fe-feeCotc':
        url += 'type=fee';
        break;
      case 'fe-selDisCnt-20':
      case 'fe-selDisCnt-25':
        url += 'type=dis';
        break;
      case 'fe-fundCotc':
        url += 'type=fund';
        break;
      case 'fe-longterm':
        url += 'type=long';
        break;
      case 'fe-welfareCutm':
        url += 'type=welf';
        break;
    }
    if ( url.indexOf('type') !== -1 ) {
      this._history.goLoad(url);
    }
  }
};