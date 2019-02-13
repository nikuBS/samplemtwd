/**
 * FileName: myt-data.datainfo.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.09.21
 */

Tw.MyTDataHistory = function(rootEl, histories) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init(histories);
};

Tw.MyTDataHistory.prototype = {
  TYPES: {
    DATA_GIFT: 0,
    LIMIT_CHARGE: 1,
    TING_CHARGE: 2,
    TING_GIFT: 3,
    REFILL: 4,
    ALL: 5
  },

  _init: function(histories) {
    this._type = Number(this.$list.data('filter-index'));
    this._histories = {};
    this._histories[this.TYPES.ALL] = histories.all;

    this._displayCount = {};
    this._displayCount[this._type] = Tw.DEFAULT_LIST_COUNT;

    if (this._type !== this.TYPES.ALL) {
      this._histories[this._type] = histories.display;
    }

    this._itemsTmpl = Handlebars.compile($('#fe-tmpl-charge-items').html());
  },

  _cachedElement: function() {
    this.$list = this.$container.find('ul.comp-box');
    this.$moreBtn = this.$container.find('.bt-more > button');
    this.$empty = this.$container.find('.result-none');
  },

  _bindEvent: function() {
    this.$moreBtn.on('click', $.proxy(this._handleLoadMore, this));
    this.$container.on('click', '#fe-type', $.proxy(this._handleChangeType, this));
    this.$container.on('click', '.fe-cancel', $.proxy(this._openCancelableChargeAlert, this));
  },

  _handleLoadMore: function() {
    var type = this._type,
      items = this._histories[type].slice(this._displayCount[type], this._displayCount[type] + Tw.DEFAULT_LIST_COUNT);

    this.$list.append(this._itemsTmpl({ items: items }));

    this._displayCount[type] += items.length;
    var leftCount = this._histories[type].length - this._displayCount[type];

    var hasNone = this.$moreBtn.addClass('none');
    if (leftCount > 0) {
      if (hasNone) {
        this.$moreBtn.removeClass('none');
      }
    } else if (!hasNone) {
      this.$moreBtn.addClass('none');
    }
  },

  _handleChangeType: function() {
    var type = this._type;

    this._popupService.open(
      {
        hbs: 'actionsheet01',
        btnfloating: { attr: 'type="button"', class: 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        layer: true,
        data: [
          {
            list: _.map(Tw.MYT_DATA_CHARGE_TYPE_LIST, function(item) {
              if (item['radio-attr'].indexOf(type) >= 0) {
                return $.extend({}, item, { 'radio-attr': item['radio-attr'] + ' checked' });
              }
              return item;
            })
          }
        ]
      },
      $.proxy(this._handleOpenType, this)
    );
  },

  _handleOpenType: function($layer) {
    $layer.on('change', 'li input', $.proxy(this._handleSelectType, this));
  },

  _handleSelectType: function(e) {
    var $target = $(e.currentTarget),
      $li = $target.parents('label');
    var selectedIdx = Number($target.data('type'));

    this.$container.find('.bt-select').text($li.find('span.txt').text());

    this._handleLoadFilteredData(selectedIdx);
    this._popupService.close();
  },

  _handleLoadFilteredData: function(selectedIdx) {
    if (selectedIdx === this._type) {
      return;
    }

    this._type = selectedIdx;
    if (!this._histories[selectedIdx]) {
      this._histories[selectedIdx] = _.filter(this._histories[this.TYPES.ALL], function(item) {
        return item.type === selectedIdx;
      });
    }

    this._displayCount[selectedIdx] = 0;
    var nData = this._histories[selectedIdx];

    this.$list.empty();

    if (nData.length > 0) {
      if (!this.$empty.hasClass('none')) {
        this.$empty.addClass('none');
      }

      this.$container.find('.num > em').text(nData.length);
      this._handleLoadMore();
    } else {
      this.$container.find('.num > em').text(0);
      if (!this.$moreBtn.hasClass('none')) {
        this.$moreBtn.addClass('none');
      }
      this.$empty.removeClass('none');
    }
  },

  _openCancelableChargeAlert: function() {
    this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.RECHARGE_CANCEL);
  }
};
