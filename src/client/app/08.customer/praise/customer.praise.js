/**
 * @file 칭찬합니다 < 고객의견 < 이용안내
 * @author Jiyoung Jo
 * @since 2018.10.22
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
  REPLACE_CONTENTS: '|' + Tw.CUSTOMER_PRAISE_SUBJECT_TYPE.COMPANY + '|' + Tw.CUSTOMER_PRAISE_SUBJECT_TYPE.OFFICE, // 대상 변경 시 label 변경을 위한 const
  MAX_REASON_BYTES: 12000,  // textarea 최대 입력 값(bytes)
  TYPES: {  // BFF 타입
    OFFICE: 'T40',
    STORE: 'T10',
    CUSTOMER_CENTER: 'T30',
    QUALITY_MANAGER: 'T50',
    AS_CENTER: 'T20',
    HAPPY_MANAGER: 'T60'
  },

  /**
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function() {
    this.$container.on('keyup', '.input > input', $.proxy(this._setAvailableSubmit, this, false));
    this.$container.on('keydown', '.input > input', $.proxy(this._handleKeydownInput, this));
    this.$reasons.on('keydown', $.proxy(this._handleKeydownInput, this));
    this.$container.on('click', '.cancel', $.proxy(this._setAvailableSubmit, this, true));
    this.$container.on('click', '.textarea-type .cancel', $.proxy(this._resetCount, this));
    // this.$container.on('click', '.prev-step', $.proxy(this._handleClickCancel, this));
    this.$typeBtn.on('click', $.proxy(this._openSelectTypePopup, this));
    this.$reasons.on('keyup input', $.proxy(this._handleTypeReasons, this));
    this.$area.on('click', $.proxy(this._openSelectAreaPopup, this));
    this.$submitBtn.on('click', $.proxy(this._handleSubmit, this));

    new Tw.InputFocusService(this.$container, this.$submitBtn);
  },

  /**
   * @desc jquery 객체 캐싱
   * @private
   */
  _cachedElement: function() {
    this.$reasons = this.$container.find('textarea.inner-tx');
    this.$reasonBytes = this.$container.find('span.byte-current');
    this.$submitBtn = this.$container.find('.bt-red1 button');
    this.$typeBtn = this.$container.find('#fe-type-btn');
    this.$area = this.$container.find('.fe-area');
    this.$subject = this.$container.find('.fe-subject');
    this.$pRole = this.$container.find('p.fe-role');
    this.$divRole = this.$container.find('div.fe-role');
    this.$statement = this.$container.find('#fe-statement');
  },

  /**
   * @desc [DV001-16183] 칭찬합니다 저사양 단말에서 전의 인풋 입력 값 복사되는 현상 수정
   * @param {Event} e 클릭 이벤트 객체
   * @desc
   */
  _handleKeydownInput: function(e) {
    e.stopPropagation();
  },

  /**
   * @desc 대상 변경 클릭 시
   * @private
   */
  _openSelectTypePopup: function() {
    var selectedType = this._selectedType,
      list = selectedType ?
        _.map(Tw.CUSTOMER_PRAISE_SUBJECT_TYPES, function(item) {
            if (item['radio-attr'].indexOf(selectedType) !== -1) {
              return $.extend({}, item, { 'radio-attr': item['radio-attr'] + ' checked' });
            }
            return item;
          }) : 
          Tw.CUSTOMER_PRAISE_SUBJECT_TYPES;

    this._popupService.open(
      {
        hbs: 'actionsheet01',
        layer: true,
        btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: list }]
      },
      $.proxy(this._handleOpenSelectType, this),
      undefined,
      undefined,
      this.$typeBtn
    );
  },

  /**
   * @desc 대상 선택 팝업 이벤트 바인딩
   * @private
   */
  _handleOpenSelectType: function($layer) {
    $layer.on('change', 'li input', $.proxy(this._handleSelectType, this));
  },

  /**
   * @desc 대상 선택 시 입력 값 설정
   * @private
   */
  _handleSelectType: function(e) {
    if (this.$statement.hasClass('none')) {
      this.$statement.removeClass('none').prop('aria-hidden', false);
    }

    var $target = $(e.currentTarget),
      $li = $target.parents('li'),
      selectedValue = $li.find('.txt').text(),
      code = $target.data('code');

    if (this._selectedType === code) {
      return this._popupService.close();
    }

    this._clearForm();

    this._selectedType = code;

    this.$container.find('.fe-subject').removeClass('none').attr('aria-hidden', false);

    if (!this.$pRole.hasClass('none')) {
      this.$pRole.addClass('none').attr('aria-hidden', true);
    }

    if (!this.$area.hasClass('none')) {
      this.$area.addClass('none').attr('aria-hidden', true);
    }

    switch (code) {
      case this.TYPES.STORE: {
        this._setInputField(selectedValue);
        this._setInputMaxLength(10, 10);
        this.$area.removeClass('none').attr('aria-hidden', false);
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

        this.$pRole.removeClass('none').attr('aria-hidden', false);
        break;
      }
    }

    this.$typeBtn.text(selectedValue);
    this._popupService.close();
  },

  /**
   * @desc 대상에 따른 인풋 라벨 설정
   * @private
   */
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
    this.$divRole.removeClass('none').attr('aria-hidden', false);
  },

  /**
   * @desc 대상에 따른 인풋 최대 입력값 세팅
   * @private
   */
  _setInputMaxLength: function(role, subject) {
    this.$divRole.find('input').attr('maxLength', role);
    this.$subject.find('input').attr('maxLength', subject);
  },

  /**
   * @desc 지역 변경 선택 시
   * @private
   */
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
      $.proxy(this._handleOpenSelectArea, this),
      undefined,
      undefined,
      this.$area
    );
  },

  /**
   * @desc 지역 변경 팝업 이벤트 바인딩
   * @private
   */
  _handleOpenSelectArea: function($layer) {
    $layer.on('change', 'li input', $.proxy(this._handleSelectArea, this));
  },

  /**
   * @desc 지역 선택 시 라벨 설정
   * @private
   */
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

  /**
   * @desc 칭찬하는 이유 타이핑 시
   * @private
   */
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

  /**
   * @desc 칭찬하는 이유 byte 값 초기화
   * @private
   */
  _resetCount: function() {
    this.$reasonBytes.text('0');
  },

  /**
   * @desc 칭찬하기 버튼 활성화
   * @param {boolean} disable 버튼 활성화 여부
   * @private
   */
  _setAvailableSubmit: function(disable) {
    if (disable) {
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

  /**
   * @desc 칭찬하기 버튼 클릭 시 서버에 요청
   * @private
   */
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

  /**
   * @desc 칭찬합니다 서버 요청 응답 시
   * @param {object} resp 서비 응답 데이터
   * @private
   */
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

  /**
   * @desc 완료 팝업 오픈 시
   * @param {$object} $layer 팝업 레이어 jquery 객체
   * @private
   */
  _openCompletePopup: function($layer) {
    $layer.find('.fe-btn_close').on('click', this._popupService.close);
  },

  /**
   * @desc 입력 데이터 초기화
   * @private
   */
  _clearForm: function() {
    this.$divRole.addClass('none').attr('aria-hidden', true);
    this.$pRole.addClass('none').attr('aria-hidden', true);
    this.$area.addClass('none').attr('aria-hidden', true);
    this.$subject.addClass('none').attr('aria-hidden', true);
    this.$divRole.find('input').val('');
    this.$subject.find('input').val('');
    this.$reasons.val('');
    this.$container.find('.cancel').css('display', 'none').attr('aria-hidden', true);
    delete this._selectedType;
    delete this._selectedArea;
    this.$typeBtn.text(Tw.CUSTOMER_PRAISE_DEFAULT.TYPE);
    this.$area.find('button').text(Tw.CUSTOMER_PRAISE_DEFAULT.AREA);
    this._resetCount();
    this._setAvailableSubmit(true);
  }
};
