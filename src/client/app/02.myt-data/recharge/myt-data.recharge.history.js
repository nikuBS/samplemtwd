/**
 * FileName: myt-data.recharge.history.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.09.21
 */


Tw.MyTDataRechargeHistory = function (rootEl, histories) {
  this.$container = rootEl;
  this._histories = histories;
  
  this._init();
  this._bindEvent();
  this._cachedElement();
};

Tw.MyTDataRechargeHistory.prototype = {
  DEFAULT_LIST_COUNT: 20,
  _init: function () {
    this._days = Object.keys(this._histories.data).reverse();
    this._displayYear = Tw.DateHelper.getShortDateWithFormat(new Date(), 'YYYY');

    this._dayTmpl = Handlebars.compile($('#fe-tmpl-charge-day').html());
    Handlebars.registerPartial('chargeItems', $('#fe-tmpl-charge-items').html());
    this._yearTmpl = Handlebars.compile($('#fe-tmpl-charge-year').html());
  },
  
  _cachedElement: function () {
    this.$days = this.$container.find('ul.comp-box');
  },

  _bindEvent: function () {
    this.$container.on('click', '.bt-more', $.proxy(this._handleLoadMore, this));
  },

  _handleLoadMore: function(e) {
    var contents = '', displayCount = 0, idx = this._histories.nextIdx;
    var key = '', items = {};
    var itemYear = '';

    while (displayCount < this.DEFAULT_LIST_COUNT && idx < this._days.length) {
      key = this._days[idx];
      items = this._histories.data[key];
      itemYear = Tw.DateHelper.getShortDateWithFormat(key, 'YYYY');

      if (this._displayYear !== itemYear) {
        contents += this._yearTmpl({ year: itemYear });
        this._displayYear = itemYear;
      }

      contents += this._dayTmpl({
        items: items.data,
        date: items.data[0].date
      });

      displayCount += items.count;
      idx++;
    }

    this.$days.append(contents);

    this._histories.displayCount += displayCount;
    this._histories.nextIdx = idx;

    var leftCount = this._histories.count - this._histories.displayCount;
    
    if (leftCount > 0) {
      e.target.innerText = e.target.innerText.replace(/\((.+?)\)/, '(' + leftCount + ')');
    } else {
      e.target.style.display = 'none';
    }
  }
};