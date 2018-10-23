/**
 * FileName: customer.praise.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.22
 */

Tw.CustomerPraise = function(rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerPraise.prototype = {
  REPLACE_CONTENTS: '|' + Tw.CUSTOMER_PRAISE_COMPANY + '|' + Tw.CUSTOMER_PRAISE_OFFICE,

  _bindEvent: function() {
    this.$container.on('click', '#fe-type-btn', $.proxy(this._openSelectSubjectPopup, this));
  },

  _cachedElement: function() {
    this.$area = this.$container.find('.fe-area');
    this.$subject = this.$container.find('.fe-subject');
    this.$pRole = this.$container.find('p.fe-role');
    this.$divRole = this.$container.find('div.fe-role');
  },

  _openSelectSubjectPopup: function() {
    var data = Tw.PRAISE_SUBJECTS.slice();
    if (this._selectedSubject >= 0) {
      data[this._selectedSubject] = { value: data[this._selectedSubject].value, option: 'checked' };
    }

    this._popupService.open(
      {
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.POPUP_TITLE.SELECT_SUBJECTS,
        data: [{ list: data }]
      },
      $.proxy(this._handleOpenSubject, this)
    );
  },

  _handleOpenSubject: function($layer) {
    $layer.on('click', 'li', $.proxy(this._handleSelectSubject, this));
  },

  _handleSelectSubject: function(e) {
    var $target = $(e.currentTarget);
    var $list = $target.parent();
    var selectedIdx = $list.find('li').index($target);

    if (this._selectedSubject === selectedIdx) {
      return this._popupService.close();
    }

    this._selectedSubject = selectedIdx;

    this.$container.find('.fe-subject').removeClass('none');

    if (!this.$pRole.hasClass('none')) {
      this.$pRole.addClass('none');
    }

    if (!this.$area.hasClass('none')) {
      this.$area.addClass('none');
    }

    switch (selectedIdx) {
      case 1: {
        this._setInputField(Tw.PRAISE_SUBJECTS[selectedIdx].value);
        this.$area.removeClass('none');
        break;
      }
      case 0:
      case 2:
      case 4: {
        this._setInputField(Tw.CUSTOMER_PRAISE_OFFICE);
        break;
      }
      case 3:
      case 5: {
        this._setInputField(Tw.CUSTOMER_PRAISE_COMPANY);

        var currentContents = this.$pRole.text();
        this.$pRole.text(Tw.PRAISE_SUBJECTS[selectedIdx].value.split('(')[0] + currentContents.charAt(currentContents.length - 1));

        this.$pRole.removeClass('none');
        break;
      }
    }
    this._popupService.close();
  },

  _setInputField: function(replace) {
    var $input = this.$divRole.find('input');
    var currentTitle = $input.attr('title');
    var originalContent = new RegExp(currentTitle.slice(0, currentTitle.length - 4).trim() + this.REPLACE_CONTENTS);
    var replaceAttribute = function(_idx, str) {
      return str.replace(originalContent, replace);
    };
    $input.attr({ placeholder: replaceAttribute, title: replaceAttribute });
    var $span = this.$divRole.contents().filter(function() {
      return this.nodeType == 3;
    })[1];
    $span.nodeValue = $span.nodeValue.replace(originalContent, replace);
    this.$divRole.removeClass('none');
  }
};
