/**
 * FileName: myt-data.recharge.history.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.09.21
 */


Tw.MyTDataRechargeHistory = function (rootEl, histories) {
  this.$container = rootEl;
  this._histories = histories;
  this._popupService = Tw.Popup;

  this._init();
  this._bindEvent();
  this._cachedElement();
};

Tw.MyTDataRechargeHistory.prototype = {
  DEFAULT_LIST_COUNT: 20,
  _init: function () {
    this._displayedYear = this.$container.find('li.year-tx').last().data('year').toString();
    this._days = Object.keys(this._histories.data).reverse();
    this._displayCount = this._histories.displayCount;
    this._dayIdx = this._histories.dayIdx;
    this._itemIdx = this._histories.itemIdx;
    this._selectedIdx = 0;
  
    this._displayData = {
      0: {
        data: this._histories.data,
        count: this._histories.count
      }
    }
      
    this._itemsTmpl = Handlebars.compile($('#fe-tmpl-charge-items').html());
    this._dayTmpl = Handlebars.compile($('#fe-tmpl-charge-day').html());
    this._yearTmpl = Handlebars.compile($('#fe-tmpl-charge-year').html());
    Handlebars.registerPartial('chargeItems', $('#fe-tmpl-charge-items').html());
  },
  
  _cachedElement: function () {
    this.$days = this.$container.find('ul.comp-box');
    this.$moreBtn = this.$container.find('.bt-more');
  },

  _bindEvent: function () {
    this.$container.on('click', '.bt-more', $.proxy(this._handleLoadMore, this));
    this.$container.on('click', '.bt-dropdown.wd-auto', $.proxy(this._handleChangeCondition, this));
    this.$container.on('click', 'button.bt-link-tx', $.proxy(this._openCanclableChargeAlert, this));
  },

  _handleLoadMore: function() {
    var contents = '', displayCount = 0, idx = this._dayIdx;
    var selectedData = this._displayData[this._selectedIdx].data;
    var key = this._days[idx], items = selectedData[key];
    var itemYear = '';

    if (this._itemIdx > 0) {
      if ((items.length - this._itemIdx) > this.DEFAULT_LIST_COUNT) {
        items = selectedData[key].slice(this._itemIdx, this.DEFAULT_LIST_COUNT);
        this._itemIdx = items.length;
      } else {
        this._itemIdx = 0;
      }

      this.$container.find('ul.list-con').last().append(this._itemsTmpl({ items: items }));
      displayCount += items.length;
      idx++;
    }

    while (idx < this._days.length && displayCount < this.DEFAULT_LIST_COUNT) {
      key = this._days[idx];
      items = selectedData[key].slice(this._itemIdx, this.DEFAULT_LIST_COUNT);
      itemYear = key.substring(0, 4);

      if (this._displayedYear !== itemYear) {
        contents += this._yearTmpl({ year: itemYear });
        this._displayedYear = itemYear;
      }

      contents += this._dayTmpl({
        items: items,
        date: items[0].date
      });

      displayCount += items.length;
      this._itemIdx = items.length < (selectedData[key].length - this._itemIdx) ? items.length : 0;
      idx++;
    }

    this.$days.append(contents);

    this._displayCount += displayCount;
    this._dayIdx = idx;

    var leftCount = this._displayData[this._selectedIdx] - this._displayCount;
    
    if (leftCount > 0) {
      this.$moreBtn.text(this.$moreBtn.text().replace(/\((.+?)\)/, '(' + leftCount + ')'));
    } else {
      this.$moreBtn.css('display', 'none');
    }
  },

  _handleChangeCondition: function () {
    var data = Tw.MYT_DATA_CHARGE_TYPE_LIST.slice();
    data[this._selectedIdx] = { value: data[this._selectedIdx].value, option: 'checked' } ;

    this._popupService.open({
      hbs: 'DC_04_case', // hbs의 파일명
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_CHARGE_TYPE,
      data: [{ list: data }]
    }, $.proxy(this._handleOpenConditionPopup, this));
  },

  _handleOpenConditionPopup: function ($layer) {
    $layer.on('click', 'ul.chk-link-list > li', $.proxy(this._handleSelectCondition, this));
  },

  _handleSelectCondition: function (e) {
    var $target = $(e.currentTarget);
    var $list = $target.parent();
    var selectedIdx = $list.find('li').index($target);

    this.$container.find('.bt-dropdown.wd-auto').text($target.find('span').text());

    this._handleLoadFilteredData(selectedIdx);
    this._popupService.close();
  },

  _handleLoadFilteredData: function (selectedIdx) {
    if (selectedIdx === this._selectedIdx) {
      return;
    }
    
    var nData = { data: {}, count: 0 }, items = [];
    this._selectedIdx = selectedIdx;
    this._displayCount = 0;
    this._dayIdx = 0;

    if (!this._displayData[selectedIdx]) {
      for (var date in this._histories.data) {
        items = this._histories.data[date].filter($.proxy(this._filterData, this));
        
        if (items.length > 0) {
          nData.data[date] = items,
          nData.count += items.length;
        }
      }

      this._displayData[selectedIdx] = nData;
    } else {
      nData = this._displayData[selectedIdx];
    }

    this.$days.empty();

    if (this._displayData[selectedIdx].count > 0) {
      this._days = Object.keys(nData.data).reverse();
      this.$container.find('.total-num-tx > strong').text(nData.count);
      this._handleLoadMore();
    }
  },

  _filterData: function (item) {
    return item.type === this._selectedIdx;
  },

  _openCanclableChargeAlert: function () {
    this._popupService.openAlert(Tw.MYT_DATA_CANCLABLE_CHARGE_ALERT);
  }
};