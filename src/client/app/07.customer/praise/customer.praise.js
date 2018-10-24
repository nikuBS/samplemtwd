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

  _bindEvent: function() {
    this.$container.on('keyup', 'input', $.proxy(this._setAvailableSubmit, this));
    this.$container.on('click', '.prev-step', $.proxy(this._handleClickCancel, this));
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
    var data = Tw.CUSTOMER_PRAISE_SUBJECT_TYPES.slice();
    if (this._selectedType >= 0) {
      data[this._selectedType] = { value: data[this._selectedType].value, option: 'checked' };
    }

    this._popupService.open(
      {
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.POPUP_TITLE.SELECT_SUBJECT_TYPE,
        data: [{ list: data }]
      },
      $.proxy(this._handleOpenSelectType, this)
    );
  },

  _handleOpenSelectType: function($layer) {
    $layer.on('click', 'li', $.proxy(this._handleSelectType, this));
  },

  _handleSelectType: function(e) {
    var $target = $(e.currentTarget);
    var $list = $target.parent();
    var selectedIdx = $list.find('li').index($target);
    var selectedValue = Tw.CUSTOMER_PRAISE_SUBJECT_TYPES[selectedIdx].value;

    if (this._selectedType === selectedIdx) {
      return this._popupService.close();
    }

    this._selectedType = selectedIdx;

    this.$container.find('.fe-subject').removeClass('none');

    if (!this.$pRole.hasClass('none')) {
      this.$pRole.addClass('none');
    }

    if (!this.$area.hasClass('none')) {
      this.$area.addClass('none');
    }

    switch (selectedIdx) {
      case 1: {
        this._setInputField(selectedValue);
        this.$area.removeClass('none');
        break;
      }
      case 0:
      case 2:
      case 4: {
        this._setInputField(Tw.CUSTOMER_PRAISE_SUBJECT_TYPE.OFFICE);
        break;
      }
      case 3:
      case 5: {
        this._setInputField(Tw.CUSTOMER_PRAISE_SUBJECT_TYPE.COMPANY);

        var currentContents = this.$pRole.text();
        this.$pRole.text(selectedValue.split('(')[0] + currentContents.charAt(currentContents.length - 1));

        this.$pRole.removeClass('none');
        break;
      }
    }

    this.$typeBtn.text(selectedValue);
    this._setAvailableSubmit();
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
  },

  _openSelectAreaPopup: function() {
    var data = Tw.CUSTOMER_PRAISE_AREAS.slice();

    if (this._selectedArea >= 0) {
      data[this._selectedArea] = { value: data[this._selectedArea].value, option: 'checked' };
    }

    this._popupService.open(
      {
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.POPUP_TITLE.SET_AREA,
        data: [{ list: data }]
      },
      $.proxy(this._handleOpenSelectArea, this)
    );
  },

  _handleOpenSelectArea: function($layer) {
    $layer.on('click', 'li', $.proxy(this._handleSelectArea, this));
  },

  _handleSelectArea: function(e) {
    var $target = $(e.currentTarget);
    var $list = $target.parent();
    var selectedIdx = $list.find('li').index($target);

    this._selectedArea = selectedIdx;
    this.$area.find('button').text(Tw.CUSTOMER_PRAISE_AREAS[selectedIdx].value);
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

  _setAvailableSubmit: function() {
    var $inputs = this.$container.find('div:not(.none) input');

    var emptyInputs = _.find($inputs, function(eInput) {
      return eInput.value.length === 0;
    });

    if (emptyInputs || this.$reasons.val().length === 0 || (this._selectedType === 1 && this._selectedArea === undefined)) {
      this.$submitBtn.attr('disabled');
      return;
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
      twldRcObjItmCd: Tw.CUSTOMER_PRAISE_SUBJECT_TYPES[this._selectedType].code, // 추천항목 대상 코드
      rcmndEmpDutypNm: values.office, // 추천지 근무 명
      rcmndEmpNm: values.subject // 추천 직원명
    };

    if (this._selectedType === 1) {
      values.area = Tw.CUSTOMER_PRAISE_AREAS[this._selectedArea].value;
      params.twldRcObjAreaItmCd = Tw.CUSTOMER_PRAISE_AREAS[this._selectedArea].code;
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
      this._popupService.open({
        hbs: 'complete_c_type',
        layer: true,
        title: Tw.ALERT_MSG_CUSTOMER.ALERT_PRAISE_COMPLETE
      });
    }
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
  },

  _handleClickCancel: function() {
    var ALERT = Tw.ALERT_MSG_CUSTOMER.ALERT_PRAISE_CANCEL;
    this._popupService.openConfirm(ALERT.MSG, ALERT.MSG, $.proxy(this._handleConfirmCancel, this));
  },

  _handleConfirmCancel: function() {
    this._clearForm();
    this._popupService.close();
  }
};
