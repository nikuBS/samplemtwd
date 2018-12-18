Tw.MyTDataPrepaidHistory = function(rootEl, histories) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._histories = histories;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataPrepaidHistory.prototype = {
  DEFAULT_COUNT: 20,
  _init: function() {
    this._currentType = this.$selectBtn.data('type');
    this._leftCount = {
      data: Number(this.$totalCount.data('data')) - this.DEFAULT_COUNT,
      voice: Number(this.$totalCount.data('voice')) - this.DEFAULT_COUNT
    };

    this._pageCount = {
      data: 1,
      voice: 1
    };

    this._displayedYear = {
      data:
        this.$container
          .find('.year-tx[data-type="data"]')
          .last()
          .text() || new Date().getFullYear().toString(),
      voice:
        this.$container
          .find('.year-tx[data-type="voice"]')
          .last()
          .text() || new Date().getFullYear().toString()
    };

    this._itemsTmpl = Handlebars.compile($('#fe-tmpl-charge-items').html());
    this._dayTmpl = Handlebars.compile($('#fe-tmpl-charge-day').html());
    this._yearTmpl = Handlebars.compile($('#fe-tmpl-charge-year').html());
    Handlebars.registerPartial('chargeItems', $('#fe-tmpl-charge-items').html());
  },

  _bindEvent: function() {
    this.$selectBtn.on('click', $.proxy(this._openChangeHistories, this));
    this.$moreBtn.on('click', $.proxy(this._handleLoadMore, this));
    this.$container.on('click', '.data-tx', $.proxy(this._handleShowDetail, this));
    this.$container.on('click', '.bt-link-tx.red', $.proxy(this._openCancel, this));
  },

  _cachedElement: function() {
    this.$moreBtn = this.$container.find('.bt-more > button');
    this.$selectBtn = this.$container.find('.bt-select');
    this.$totalCount = this.$container.find('.num > em');
    this.$list = this.$container.find('ul.comp-box');
  },

  _openChangeHistories: function(e) {
    var type = this._currentType;

    this._popupService.open(
      {
        hbs: 'actionsheet01',
        btnfloating: { attr: 'type="button"', class: 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        layer: true,
        data: [
          {
            list: _.map(Tw.PREPAID_HISTORIES, function(item) {
              if (item['radio-attr'].lastIndexOf(type) > 0) {
                return $.extend({}, item, { 'radio-attr': item['radio-attr'] + ' checked' });
              }
              return item;
            })
          }
        ]
      },
      $.proxy(this._handleOpenChangeHistories, this)
    );
  },

  _handleOpenChangeHistories: function($layer) {
    $layer.on('click', 'li.type1', $.proxy(this._handleSelectType, this));
  },

  _handleSelectType: function(e) {
    var type = $(e.currentTarget)
      .find('input')
      .data('type');

    if (type === this._currentType) {
      return;
    }

    this.$container.find('li[data-type="' + this._currentType + '"]').addClass('none');
    this.$container.find('li[data-type="' + type + '"]').removeClass('none');
    this.$selectBtn.text(Tw.PREPAID_TYPES[type.toUpperCase()]);
    this.$totalCount.text(this.$totalCount.data(type));

    this._currentType = type;
    this._setMoreButton();
    this._popupService.close();
  },

  _handleLoadMore: function() {
    var type = this._currentType;
    if (this._leftCount[type] <= 0) {
      return;
    }

    this._pageCount[type]++;

    this._apiService
      .request(type === 'voice' ? Tw.API_CMD.BFF_06_0062 : Tw.API_CMD.BFF_06_0063, {
        pageNum: this._pageCount[type],
        rowNum: this.DEFAULT_COUNT
      })
      .done($.proxy(this._handleSuccessLoadMore, this));
  },

  _handleSuccessLoadMore: function(resp) {
    var type = this._currentType;
    if (resp.code !== Tw.API_CODE.CODE_00) {
      this._pageCount[this._currentType]--;
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var histories = _.reduce(resp.result.history, this._sortHistory, { idx: this._histories[type].length });
    delete histories.idx;
    this._histories[type] = this._histories[type].concat(resp.result.history);
    this._leftCount[type] -= resp.result.history.length || 0;

    this._renderHistories(histories);
  },

  _renderHistories: function(histories) {
    var type = this._currentType,
      keys = Object.keys(histories),
      idx = keys.length - 1,
      key = keys[idx],
      contents = '',
      itemYear = '',
      typeName = Tw.PREPAID_TYPES[type.toUpperCase()],
      $exist = this.$container.find('.list-box[data-type="' + type + '"][data-key="' + key + '"]');

    if ($exist.length > 0) {
      $exist.find('ul.list-con').append(this._itemsTmpl({ items: histories[key], typeName: typeName, pageNum: this._pageCount[type] }));
      idx--;
    }

    for (; idx >= 0; idx--) {
      key = keys[idx];

      itemYear = keys[idx].substring(0, 4);
      if (this._displayedYear[type] !== itemYear) {
        contents += this._yearTmpl({ year: itemYear, type: type });
        this._displayedYear[type] = itemYear;
      }

      contents += this._dayTmpl({
        items: histories[key],
        date: histories[key][0].date,
        type: type,
        key: key,
        pageNum: this._pageCount[type],
        typeName: typeName
      });
    }

    if (contents.length > 0) {
      this.$list.append(contents);
    }

    this._setMoreButton();
  },

  _setMoreButton: function() {
    var hasNone = this.$moreBtn.addClass('none'),
      type = this._currentType;
    if (this._leftCount[type] > 0 && hasNone) {
      this.$moreBtn.removeClass('none');
    } else if (!hasNone) {
      this.$moreBtn.addClass('none');
    }
  },

  _sortHistory: function(histories, history, idx) {
    var key = history.chargeDt;

    if (!histories[key]) {
      histories[key] = [];
    }

    history.idx = histories.idx + idx;
    history.date = Tw.DateHelper.getShortDateNoYear(key);
    if (Tw.PREPAID_BADGES[history.chargeTp]) {
      history.badge = Tw.PREPAID_BADGES[history.chargeTp];
    }
    history.isCanceled = history.payCd === '5' || history.payCd === '9';
    history.isRefundable = history.rfndPsblYn === 'Y';
    history.amt = Tw.FormatHelper.addComma(history.amt);
    history.cardNm = history.cardNm || Tw.PREPAID_PAYMENT_TYPE[history.wayCd];

    histories[key].push(history);

    return histories;
  },

  _handleShowDetail: function(e) {
    var index = e.currentTarget.getAttribute('data-origin-idx'),
      history = this._histories[this._currentType][index];

    var detail = $.extend(history, {
      typeName: Tw.PREPAID_TYPES[this._currentType.toUpperCase()],
      chargeType: Tw.PREPAID_RECHARGE_TYPE[history.chargeTp],
      date: Tw.DateHelper.getShortDate(history.chargeDt),
      payment: history.cardNm ? Tw.PREPAID_PAYMENT_TYPE[history.wayCd] + '(' + history.cardNm + ')' : Tw.PREPAID_PAYMENT_TYPE[history.wayCd]
    });

    this._popupService.open({ hbs: 'DC_09_06_01', detail: detail });
  },

  _openCancel: function(e) {
    var code = e.currentTarget.getAttribute('data-charge-code'),
      id = e.currentTarget.getAttribute('data-cancel-id'),
      pageNum = e.currentTarget.getAttribute('data-page-number');

    this._popupService.openConfirm(Tw.ALERT_MSG_MYT_DATA.ALERT_2_A74, Tw.POPUP_TITLE.NOTIFY, $.proxy(this._handleCancel, this, id, pageNum, code));
  },

  _handleCancel: function(id, pageNum, code) {
    if (Tw.FormatHelper.isEmpty(code)) {
      this._apiService
        .request(Tw.API_CMD.BFF_06_0069, { cancelOrderId: id, pageNum: pageNum, rowNum: this.DEFAULT_COUNT })
        .done($.proxy(this._handleSuccessCancel, this));
    } else {
      this._apiService.request(Tw.API_CMD.BFF_06_0070, { cancelOrderId: id, dataChargeCd: code }).done($.proxy(this._handleSuccessCancel, this));
    }
    this._popupService.close();
  },

  _handleSuccessCancel: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
    }
  }
};
