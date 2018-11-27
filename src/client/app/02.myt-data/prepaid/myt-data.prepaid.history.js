Tw.MyTDataPrepaidHistory = function(rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataPrepaidHistory.prototype = {
  _init: function() {
    this._currentType = this.$selectBtn.data('type');
    this._leftCount = {
      data: Number(this.$totalCount.data('data')) - 20,
      voice: Number(this.$totalCount.data('voice')) - 20
    };
  },

  _bindEvent: function() {
    this.$selectBtn.on('click', $.proxy(this._openChangeHistories, this));
  },

  _cachedElement: function() {
    this.$moreBtn = this.$container.find('.bt-more > button');
    this.$selectBtn = this.$container.find('.bt-select');
    this.$totalCount = this.$container.find('.num > em');
  },

  _openChangeHistories: function(e) {
    var type = this._currentType;

    this._popupService.open(
      {
        hbs: 'actionsheet_select_a_type',
        layer: true,
        data: [
          {
            list: _.map(Tw.PREPAID_HISTORIES, function(item) {
              if (item.attr.lastIndexOf(type) > 0) {
                return Object.assign({ option: 'checked' }, item);
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
    $layer.on('click', 'li > button', $.proxy(this._handleSelectType, this));
  },

  _handleSelectType: function(e) {
    var type = e.currentTarget.getAttribute('data-type');

    if (type === this._currentType) {
      return;
    }

    this.$container.find('li[data-type="' + this._currentType + '"]').addClass('none');
    this.$container.find('li[data-type="' + type + '"]').removeClass('none');
    this.$selectBtn.text(Tw.PREPAID_TYPES[type.toUpperCase()]);
    this.$totalCount.text(this.$totalCount.data(type));

    if (this._leftCount[type] > 0) {
      this.$moreBtn.text(this.$moreBtn.text().replace(/\((.+?)\)/, '(' + this._leftCount[type] + ')'));
      if (this.$moreBtn.hasClass('none')) {
        this.$moreBtn.removeClass('none');
      }
    } else if (!this.$moreBtn.hasClass('none')) {
      this.$moreBtn.addClass('none');
    }

    this._currentType = type;
    this._popupService.close();
  }
};
