/**
 * FileName: customer.praise.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.22
 */

Tw.CustomerPraise = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._historyService.init('hash');

  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerPraise.prototype = {
  REPLACE_CONTENTS: '|' + Tw.CUSTOMER_PRAISE_SUBJECT_TYPE.COMPANY + '|' + Tw.CUSTOMER_PRAISE_SUBJECT_TYPE.OFFICE,
  MAX_REASON_BYTES: 12000,
  TYPES: {
    OFFICE: 'T40',
    STORE: 'T10',
    CUSTOMER_CENTER: 'T30',
    QUALITY_MANAGER: 'T50',
    AS_CENTER: 'T20',
    HAPPY_MANAGER: 'T60'
  },

  _bindEvent: function() {
    this.$container.on('keyup', '.input > input', $.proxy(this._setAvailableSubmit, this, false));
    this.$container.on('click', '.cancel', $.proxy(this._setAvailableSubmit, this, true));
    // this.$container.on('click', '.prev-step', $.proxy(this._handleClickCancel, this));
    this.$typeBtn.on('click', $.proxy(this._openSelectTypePopup, this));
    this.$reasons.on('keyup', $.proxy(this._handleTypeReasons, this));
    this.$area.on('click', $.proxy(this._openSelectAreaPopup, this));
    this.$submitBtn.on('click', $.proxy(this._handleSubmit, this));
  },

  _cachedElement: function() {
    this.$reasons = this.$container.find('textarea.inner-tx');
    this.$reasonBytes = this.$container.find('span.byte-current');
    this.$submitBtn = this.$container.find('.bt-red1 button');
    this.$typeBtn = this.$container.find('#fe-type-btn');
    this.$area = this.$container.find('.fe-area');
    this.$subject = this.$container.find('.fe-subject');
    this.$pRole = this.$container.find('p.fe-role');
    this.$divRole = this.$container.find('div.fe-role');
  },

  _openSelectTypePopup: function() {
    var selectedType = this._selectedType,
      list = selectedType ?
        _.map(Tw.CUSTOMER_PRAISE_SUBJECT_TYPES, function(item) {
            if (item['radio-attr'].indexOf(selectedType) !== -1) {
              return $.extend({}, item, { 'radio-attr': item['radio-attr'] + ' checked' });
            }
            return item;
          })
        : Tw.CUSTOMER_PRAISE_SUBJECT_TYPES;

    this._popupService.open(
      {
        hbs: 'actionsheet01',
        layer: true,
        btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: list }]
      },
      $.proxy(this._handleOpenSelectType, this)
    );
  },

  _handleOpenSelectType: function($layer) {
    $layer.on('change', 'li input', $.proxy(this._handleSelectType, this));
  },

  _handleSelectType: function(e) {
    var $target = $(e.currentTarget),
      $li = $target.parents('li'),
      selectedValue = $li.find('.txt').text(),
      code = $target.data('code');

    if (this._selectedType === code) {
      return this._popupService.close();
    }

    this._clearForm();

    this._selectedType = code;

    this.$container.find('.fe-subject').removeClass('none');

    if (!this.$pRole.hasClass('none')) {
      this.$pRole.addClass('none');
    }

    if (!this.$area.hasClass('none')) {
      this.$area.addClass('none');
    }

    switch (code) {
      case this.TYPES.STORE: {
        this._setInputField(selectedValue);
        this._setInputMaxLength(10, 10);
        this.$area.removeClass('none');
        break;
      }
      case this.TYPES.OFFICE:
      case this.TYPES.CUSTOMER_CENTER:
      case this.TYPES.AS_CENTER: {
        this._setInputMaxLength(50, 25);
        this._setInputField(Tw.CUSTOMER_PRAISE_SUBJECT_TYPE.OFFICE);
        break;
      }
      case this.TYPES.QUALITY_MANAGER:
      case this.TYPES.HAPPY_MANAGER: {
        this._setInputMaxLength(50, 25);
        this._setInputField(Tw.CUSTOMER_PRAISE_SUBJECT_TYPE.COMPANY);

        var currentContents = this.$pRole.text();
        this.$pRole.text(selectedValue.split('(')[0] + currentContents.charAt(currentContents.length - 1));

        this.$pRole.removeClass('none');
        break;
      }
    }

    this.$typeBtn.text(selectedValue);
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
      return this.nodeType === 3;
    })[1];
    $span.nodeValue = $span.nodeValue.replace(originalContent, replace);
    this.$divRole.removeClass('none');
  },

  _setInputMaxLength: function(role, subject) {
    this.$divRole.find('input').attr('maxLength', role);
    this.$subject.find('input').attr('maxLength', subject);
  },

  _openSelectAreaPopup: function() {
    var selected = this._selectedArea,
      list = selected ?
        _.map(Tw.CUSTOMER_PRAISE_AREAS, function(item) {
            if (item['radio-attr'].indexOf(selected) >= 0) {
              return $.extend({}, item, { 'radio-attr': item['radio-attr'] + ' checked' });
            }

            return item;
          })
        : Tw.CUSTOMER_PRAISE_AREAS;

    this._popupService.open(
      {
        hbs: 'actionsheet01',
        btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        layer: true,
        data: [{ list: list }]
      },
      $.proxy(this._handleOpenSelectArea, this)
    );
  },

  _handleOpenSelectArea: function($layer) {
    $layer.on('change', 'li input', $.proxy(this._handleSelectArea, this));
  },

  _handleSelectArea: function(e) {
    var $target = $(e.currentTarget),
      $li = $target.parents('li');
    var code = $target.data('code');

    if (this._selectedArea === code) {
      this._popupService.close();
      return;
    }

    this._selectedArea = code;
    this.$area.find('button').text($li.find('.txt').text());
    this._setAvailableSubmit();
    this._popupService.close();
  },

  _handleTypeReasons: function(e) {
    var target = e.currentTarget;
    var byteCount = Tw.InputHelper.getByteCount(target.value);

    while (byteCount > this.MAX_REASON_BYTES) {
      target.value = target.value.slice(0, -1);
      byteCount = Tw.InputHelper.getByteCount(target.value);
    }

    this.$reasonBytes.text(Tw.FormatHelper.addComma(String(byteCount)));
    this._setAvailableSubmit();
  },

  _setAvailableSubmit: function(disabled) {
    if (disabled) {
      this.$submitBtn.attr('disabled', true);
      return;
    }

    var $inputs = this.$container.find('div:not(.none) input');

    var emptyInputs = _.find($inputs, function(eInput) {
      return eInput.value.length === 0;
    });

    if (emptyInputs || this.$reasons.val().length === 0 || (this._selectedType === this.TYPES.STORE && this._selectedArea === undefined)) {
      this.$submitBtn.attr('disabled', true);
    } else {
      this.$submitBtn.removeAttr('disabled');
    }
  },

  _handleSubmit: function() {
    var values = {
      office: this.$divRole.find('input').val(),
      subject: this.$subject.find('input').val()
    };

    var params = {
      inputGubun: '01',
      tWldChnlClCd: 'M',
      custRgstCtt: this.$reasons.val(), // 고객 등록 내용
      twldRcObjItmCd: this._selectedType, // 추천항목 대상 코드
      rcmndEmpDutypNm: values.office, // 추천지 근무 명
      rcmndEmpNm: values.subject // 추천 직원명
    };

    if (this._selectedType === this.TYPES.STORE) {
      values.area = this.$area.find('button').text();
      params.twldRcObjAreaItmCd = this._selectedArea;
      params.titleNm = Tw.FormatHelper.getTemplateString(Tw.CUSTOMER_PRAISE_TITLE.T01, values);
    } else {
      params.titleNm = Tw.FormatHelper.getTemplateString(Tw.CUSTOMER_PRAISE_TITLE.T02, values);
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0058, params).done($.proxy(this._successSubmit, this));
  },

  _successSubmit: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
    } else {
      this._clearForm();
      this._popupService.open(
        {
          hbs: 'complete_c_type',
          layer: true,
          title: Tw.ALERT_MSG_CUSTOMER.ALERT_PRAISE_COMPLETE,
          btnText: Tw.BUTTON_LABEL.CONFIRM,
          buttons: [
            {
              text: Tw.BUTTON_LABEL.HOME,
              url: '/main/home'
            }
          ],
          buttonClass: 'one'
        },
        $.proxy(this._openCompletePopup, this),
        this._historyService.goBack
      );
    }
  },

  _openCompletePopup: function($layer) {
    $layer.find('.fe-btn_close').on('click', this._popupService.close);
  },

  _clearForm: function() {
    this.$divRole.addClass('none');
    this.$pRole.addClass('none');
    this.$area.addClass('none');
    this.$subject.addClass('none');
    this.$divRole.find('input').val('');
    this.$subject.find('input').val('');
    this.$reasons.val('');
    delete this._selectedType;
    delete this._selectedArea;
    this.$typeBtn.text(Tw.CUSTOMER_PRAISE_DEFAULT.TYPE);
    this.$area.find('button').text(Tw.CUSTOMER_PRAISE_DEFAULT.AREA);
    this._setAvailableSubmit(true);
  }

};
