/**
 * FileName: customer.email.quality.option.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.29
 */

Tw.CustomerEmailQualityOption = function (rootEl, allSvc) {
  this.allSvc = allSvc.allSvc;
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailQualityOption.prototype = {
  _init: function () {
    this.quality_options = Tw.CUSTOMER_EMAIL_QUALITY_QUESTION;
  },

  _cachedElement: function () {
    this.$wrap_tpl_quality = this.$container.find('.fe-wrap_tpl_quality');
  },

  _bindEvent: function () {
    this.$wrap_tpl_quality.on('click', '.fe-select-line', $.proxy(this._onSelectLine, this));
    this.$wrap_tpl_quality.on('click', 'button.fe-select-phone-line', $.proxy(this._onSelectQualityPhoneLine, this));
    // this.$container.on('click', '.fe-line_internet', $.proxy(this._showLineSheet, this, 'INTERNET'));
    // this.$container.on('click', '.fe-line', $.proxy(this._showLineSheet, this, 'CELL'));
    this.$container.on('click', '.fe-occurrence', $.proxy(this._showOptionSheet, this, 'Q_TYPE01'));
    this.$container.on('click', '.fe-occurrence_detail', $.proxy(this._showOptionSheet, this, 'Q_TYPE02'));
    this.$container.on('click', '.fe-place', $.proxy(this._showOptionSheet, this, 'Q_TYPE03'));
    this.$container.on('click', '.fe-place_detail', $.proxy(this._showOptionSheet, this, 'Q_TYPE04'));
    this.$container.on('click', '.fe-occurrence_date', $.proxy(this._showOptionSheet, this, 'Q_TYPE05'));
    this.$container.on('click', '.option_value', $.proxy(this._selectPopupCallback, this));
    this.$container.on('click', '.fe-search-post', $.proxy(this._onClickSearchPost, this));
  },

  _onClickSearchPost: function () {
    new Tw.CommonPostcodeMain(this.$container);
  },

  _onSelectQualityPhoneLine: function (e) {
    e.stopPropagation();
    e.preventDefault();

    var isInternetLine = $('.fe-quality-inqSvcClCd li.checked').index() === 0;
    var filteredLine = [];
    var fnSelectLine;

    if ( isInternetLine ) {
      filteredLine = this.allSvc.s.filter(function (item) {
        return item.svcGr === 'I' || item.svcGr === 'T';
      });

      fnSelectLine = function (item) {
        return {
          value: item.addr,
          option: $('.fe-select-phone-line').data('svcmgmtnum').toString() === item.svcMgmtNum ? 'checked' : '',
          attr: 'data-svcmgmtnum=' + item.svcMgmtNum
        };
      };
    } else {
      filteredLine = this.allSvc.s.filter(function (item) {
        return item.svcGr === 'U';
      });

      fnSelectLine = function (item) {
        return {
          value: Tw.FormatHelper.conTelFormatWithDash(item.svcNum),
          option: $('.fe-select-phone-line').data('svcmgmtnum').toString() === item.svcMgmtNum ? 'checked' : '',
          attr: 'data-svcmgmtnum=' + item.svcMgmtNum
        };
      };
    }

    // fnSelectLine = function (item) {
    //   return {
    //     value: Tw.FormatHelper.conTelFormatWithDash(item.svcNum),
    //     option: $('.fe-select-phone-line').data('svcmgmtnum').toString() === item.svcMgmtNum ? 'checked' : '',
    //     attr: 'data-svcmgmtnum=' + item.svcMgmtNum
    //   };
    // };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.CUSTOMER_VOICE.LINE_CHOICE,
        data: [{ list: filteredLine.map($.proxy(fnSelectLine, this)) }]
      },
      null,
      null
    );
  },

  _onSelectLine: function (e) {
    e.stopPropagation();
    e.preventDefault();
    var $target = $(e.currentTarget);

    var fnFilter = function ($target, item) {
      var isChecked = $target.data('svcmgmtnum').toString() === item.svcMgmtNum;
      var dashNumber = Tw.FormatHelper.conTelFormatWithDash(item.svcNum);

      return $.extend({}, item, {
        'label-attr': 'data-svcmgmtnum=' + item.svcMgmtNum + '',
        'txt': dashNumber,
        'radio-attr': isChecked ? 'checked' : ' '
      });
    };

    var list = _.map(this.allSvc.m, $.proxy(fnFilter, this, $target));

    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        btnfloating: { 'attr': 'type="button"', 'class': 'fe-popup-close', 'txt': Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: list }]
      },
      $.proxy(this._handleOpenSelectType, this, $target));
  },

  _handleOpenSelectType: function ($target, $layer) {
    $layer.on('click', 'li.type1', $.proxy(this._handleSelectType, this, $target));
  },

  _handleSelectType: function ($target, e) {
    this._popupService.close();

    var $currentTarget = $(e.currentTarget);
    var svcNum = $currentTarget.text().trim();
    var svcMgmtNum = $currentTarget.find('label').data('svcmgmtnum');

    $target.text(svcNum);
    $target.data('svcmgmtnum', svcMgmtNum);
    e.stopPropagation();
    e.preventDefault();
  },

  // _showLineSheet: function (sType, e) {
  //   var $elButton = $(e.currentTarget);
  //   var lineList = sType === 'CELL' ? this.allSvc.M : this.allSvc.S;
  //
  //   var fnSelectLine = function (item) {
  //     return {
  //       value: Tw.FormatHelper.conTelFormatWithDash(item.svcNum),
  //       option: false,
  //       attr: 'data-svcMgmtNum=' + item.svcMgmtNum
  //     };
  //   };
  //
  //   this._popupService.open({
  //       hbs: 'actionsheet_select_a_type',
  //       layer: true,
  //       title: Tw.CUSTOMER_EMAIL.ACTION_TYPE.SELECT_LINE,
  //       data: [{ list: lineList.map($.proxy(fnSelectLine, this)) }]
  //     },
  //     $.proxy(this._selectLinePopupCallback, this, $elButton),
  //     null
  //   );
  // },

  _showOptionSheet: function (sType, e) {
    var $elButton = $(e.currentTarget);

    var fnSelectLine = function ($elButton, item) {
      return {
        value: item.text,
        option: $elButton.text() === item.text ? 'checked' : '',
        attr: 'data-type="option_value"'
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: this.quality_options[sType].title,
        data: [{ list: this.quality_options[sType].list.map($.proxy(fnSelectLine, this, $elButton)) }]
      },
      $.proxy(this._selectPopupCallback, this, $elButton),
      null
    );
  },

  // _selectLinePopupCallback: function ($target, $layer) {
  //   $layer.on('click', '[data-svcmgmtnum]', $.proxy(this._setSelectedLineValue, this, $target));
  // },

  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '[data-type="option_value"]', $.proxy(this._setSelectedValue, this, $target));
  },

  _setSelectedValue: function ($target, el) {
    this._popupService.close();
    $target.text($(el.currentTarget).text().trim());
  }

  // _setSelectedLineValue: function ($target, el) {
  //   this._popupService.close();
  //   $target.data('svcmgmtnum', $(el.currentTarget).data('svcmgmtnum'));
  //   $target.text($(el.currentTarget).text().trim());
  // }
};