/**
 * FileName: myt-fare.bill.set.change.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018. 9. 21
 */
Tw.MyTFareBillSetChange = function (rootEl, data) {
  this.$container = rootEl;
  this.popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this.$window = window;
  this._data = data !== undefined ? JSON.parse(data) : {};
  this._init();
};

Tw.MyTFareBillSetChange.prototype = {
  _init: function () {
    this._initVariables();
    this._bindEvent();
    this._initDefaultOptions();
    // input 변경이 감지되면 취소확인 컨펌 띄움. 초기값 설정이후 체크해야 하기 때문에 this._initDefaultOptions() 펑션 다음에 선언해준다.
    this.$container.on('change', 'input', $.proxy(this._checkInputType, this)); // input tag 변경 확인
  },

  _initVariables: function () {
    this._billType = Tw.UrlHelper.getQueryParams().billType; // 메인 안내서 유형
    this._subBillType = Tw.UrlHelper.getQueryParams().subBillType || 'X';  // 함께 받는 안내서 유형
    this._isChangeInfo = Tw.UrlHelper.getQueryParams().isChangeInfo === 'Y' ? true : false; // 정보변경 유무

    this._options = this.$container.find('.on-off-list > li'); // 옵션 설정 엘리먼트들
    this._inputHpNum = this.$container.find('.fe-hp-num'); // 핸드폰번호 input
    this._submit = this.$container.find('#fe-submit'); // 변경하기 버튼
    this._btnAddr = this.$container.find('.fe-btn-addr'); // 주소록 버튼
    this._addrArea = this.$container.find('#fe-addr-area'); // 우편 주소 area
    this._scurMailYn = this.$container.find('#fe-scurMailYn'); // 이메일 보안 설정
    this._isInputChanged = false;

  },

  _bindEvent: function () {
    this.$container.on('change', 'input[name="together"]', $.proxy(this._onChangeTogetherBill, this));
    this._btnAddr.on('click', $.proxy(this._onClickBtnAddr, this));
    this._inputHpNum.on('keyup input', _.debounce( $.proxy(this._onFormatHpNum, this), 150));
    this._submit.on('click', $.proxy(this._onSubmit, this));
    this.$container.on('change', 'input[name="ccurNotiYn"]', $.proxy(this._onChangeCcurNotiYn, this)); // 옵션 설정 > 법정대리인
    this.$container.on('keyup focus change', '[data-inactive-target]', $.proxy(this._onDisableSubmitButton, this));
    this._scurMailYn.on('change', $.proxy(this._onChangeScurMailYn, this)); // 이메일 보안 설정
    this.$container.on('click', '.fe-search-zip', $.proxy(this._searchZip, this)); // 우편번호 검색
    this.$container.on('click', '#fe-back', $.proxy(this._onCloseConfirm, this)); // 취소 확인 창
  },

  _checkInputType : function () {
    this._isInputChanged = true;
  },

  // 닫기 버튼 클릭 시 [확인]
  _onCloseConfirm: function() {
    if (!this._isInputChanged) {
      this._historyService.goBack();
      return;
    }
    this.popupService.openConfirmButton(
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
      $.proxy($.proxy(function () {
        this.popupService.close();
        this._historyService.goBack();
      }, this), this), null, Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
  },

  _searchZip: function () {
    new Tw.CommonPostcodeMain(this.$container, $.proxy(this._callBackSearchZip, this));
  },

  _callBackSearchZip: function (resp) {
    this._setAddrData({
      zip: resp.zip,
      basAddr: resp.main,
      dtlAddr: resp.detail
    });

    this._addrArea.find('input[name="zip"]').data('state', true);
    this._addrArea.find('input[name="basAddr"]').data('state', true);
    this._addrArea.find('input[name="dtlAddr"]').data('state', true);
  },

  // 기타(우편) 데이터 설정
  _setAddrData: function (data) {
    this.$container.find('#fe-no-addr-area').addClass('none');
    this._addrArea.addClass('none');

    if (Tw.FormatHelper.isEmpty(data.zip)) {
      this.$container.find('#fe-no-addr-area').removeClass('none');
    } else {
      this._addrArea.removeClass('none').find('input[name="zip"]').val(data.zip);
      this._addrArea.find('input[name="basAddr"]').val(data.basAddr);
      this._addrArea.find('input[name="dtlAddr"]').val(data.dtlAddr);
    }
    this._onDisableSubmitButton();
  },

  // 이메일 보안설정 이벤트
  _onChangeScurMailYn: function () {
    this._setOptionsContents(true);
  },

  _disabledOptions: function (context, disabled) {
    if (disabled) {
      context.find('.btn-switch')
        .find('.switch-style').attr('aria-disabled', true)
        .find('input').prop('disabled', true);
    } else {
      context.find('.btn-switch')
        .find('.switch-style').removeAttr('aria-disabled')
        .find('input').prop('disabled', false);
    }
  },

  // 스위치 체크박스 disabled / enabled
  _toggleDisabledCheckbox: function (context, disabled) {
    if (disabled) {
      context.find('.btn-switch').removeClass('on').addClass('disabled')
        .find('.switch-style').attr('aria-disabled', true)
        .find('input').prop('checked', false).prop('disabled', true);
    } else {
      context.find('.btn-switch').removeClass('disabled')
        .find('.switch-style').removeAttr('aria-disabled')
        .find('input').prop('disabled', false);
    }
  },

  // 함께 받을 요금 안내서 값
  _getTogetherVal: function () {
    return this.$container.find('input[name="together"]:checked').val() || '';
  },

  _prop: function (_$el, checked) {
    var _parent = _$el.prop('checked', checked)
      .parent()
      .attr('aria-checked', checked);

    if (checked) {
      _$el.trigger('change');
      _parent.addClass('checked');
    } else {
      _parent.removeClass('checked');
    }
  },

  // 체크박스/ 라디오 버튼 체크표시
  _checkedElement: function (name, value) {
    var _$this = this;
    this.$container.find('[name=' + name + ']')
      .each(function () {
        _$this._prop($(this), $(this).val() === value ? true : false);
      });
  },

  // 슬라이더형식 체크 박스 체크표시
  _checkedSlideCheckbox: function (name, value) {
    var _$curCheckbox = this.$container.find('[name="{0}"]'.replace('{0}', name));
    var isCheck = _$curCheckbox.val() === value ? true : false;

    var _parent = _$curCheckbox.prop('checked', isCheck).trigger('change')
      .parent()
      .attr('aria-checked', isCheck)
      .parent();

    if (isCheck) {
      _parent.addClass('on');
    } else {
      _parent.removeClass('on');
    }
  },

  // 옵션 설정 Default 설정
  _initDefaultOptions: function () {
    var _data = this._data;

    // 안내서가 "이메일" 을 포함한 경우
    if (this._billType === '2' || '2' === this._subBillType) {
      this._checkedElement('scurMailYn', _data.scurMailYn);
      this._checkedElement('emailRcvAgreeYn', _data.emailRcvAgreeYn);
    }
    // 우편문 발송주기
    this._checkedElement('billSndCyclCd', this._data.billSndCyclCd);
    // App 이 아니면 주소록 버튼 숨김
    if (!Tw.BrowserHelper.isApp()) {
      this._btnAddr.parent().hide();
    }

    // 복합 안내서 일 경우
    if (this._data.togetherList) {
      this._checkedElement('together', this._subBillType);
    } else {
      // 단일 안내서일 경우
      // 안내서가 이메일 인경우 이메일 area 보이기
      this._toggleElement('fe-email-area', this._billType === '2');
    }

    this._setAddrData(this._isChangeInfo ? this._data:'');
    this._setOptions(2); // 옵션 설정
    this._setOptions(1); // 옵션 보이기
  },

  // 콘텐츠 이용 상세내역 표시
  // "infoInvDtlDispChkYn": 콘텐츠이용료 청구 사용가능 여부 확인 이 N 이면 disable
  // scurMailYn : 이메일 요금안내서 보안여부 N 이면 disable
  _setOptionsContents: function(isShow) {
    var _data = this._data;
    var _infoInvDtlDispYnName = 'infoInvDtlDispYn';
    var isDisabled = _data.infoInvDtlDispChkYn !== 'Y';
    if (isShow) {
      this._toggleDisabledCheckbox(this._options.siblings('.fe-'+_infoInvDtlDispYnName), isDisabled || !this._scurMailYn.is(':checked'));
      this._toggleElement(this._options.siblings('.fe-'+_infoInvDtlDispYnName), isShow);
    } else {
      this._checkedSlideCheckbox(_infoInvDtlDispYnName, _data.infoInvDtlDispYn);
      this._toggleDisabledCheckbox(this._options.siblings('.fe-'+_infoInvDtlDispYnName), isDisabled || _data.scurMailYn !== 'Y');
    }
  },

  // gubun 1: 노출여부 , 2: 옵션 체크
  _setOptions: function (gubun) {
    var billType = this._billType;
    var isDisplay = gubun === 1 ? true : false;
    var subBillType = isDisplay ? this._getTogetherVal() : this._subBillType;
    var mergeType = billType + subBillType;
    var lineType = this._data.lineType;

    this._options.addClass('none').find('input').data('state', false);
    var _data = this._data;

    var _selectOptions = function (name, isShow) {
      if (isShow) {
        this._toggleElement(this._options.siblings('.fe-'+name), true);
      } else {
        this._checkedSlideCheckbox(name, _data[name]);
      }
    };

    // T월드 확인
    if('P' === billType) {
      // 무선이면서 SMS수신가능 단말기일때 보임
      _selectOptions.call(this, 'nreqGuidSmsSndYn', isDisplay && 'M' === lineType && 'Y' === this._data.isusimchk);
    }

    // 안내서 유형이 Bill Letter 포함일때 : Bill Letter  보안강화
    if ('H' === billType) {
      _selectOptions.call(this, 'scurBillYn', isDisplay);
    }

    // 휴대폰 번호 전체 표시 여부
    if (['P', 'HX', 'HB'].indexOf(mergeType) === -1) {
      if (mergeType === 'BX') {
        if(lineType === 'S'){
          _selectOptions.call(this, 'phonNumPrtClCd', isDisplay);
        }
      } else {
        _selectOptions.call(this, 'phonNumPrtClCd', isDisplay);
      }
    }

    // 무선 회선일때
    if (lineType === 'M') {
      // 이메일 안내서 표함인경우, 콘텐츠 이용 상세내역 표시
      if (mergeType.indexOf('2') !== -1) {
        this._setOptionsContents.call(this, isDisplay);
      }

      // 법정 대리인 함께 수령
      if (['HX', 'H2', 'BX', 'B2'].indexOf(mergeType) !== -1 && this._data.kidsYn === 'Y') {
        var name = 'ccurNotiYn';
        var _$currContext = this._options.siblings('.fe-'+name);
        if (isDisplay) {
          this._toggleElement(_$currContext, true);
          this._changeCcurNotiYn(_$currContext.find('[name="{0}"]'.replace('{0}', name)));
        } else {
          // Y,N 여부와 상관없이 무조건 Y 로 세팅한다.
          this._checkedSlideCheckbox(name, 'Y'); // 법정대리인 함께 수령
          // 법정대리인 함께 수령 켜짐 으로 무조건 disabled
          this._disabledOptions(_$currContext,true);
        }
      }
    }
  },

  // 함께 받을 요금 안내서 변경 시
  _onChangeTogetherBill: function (e) {
    // 이메일 인경우 이메일 입력 부분 보이기
    this._toggleElement('fe-email-area', $(e.currentTarget).val() === '2');
    this._setOptions(1);
  },

  // 엘리먼트 토글
  _toggleElement: function (context, state) {
    context = (typeof context === 'string') ? this.$container.find('#' + context) : context;
    context.toggleClass('none', !state).find('input').data('state', state);
    this._onDisableSubmitButton();
  },

  // 휴대폰 번호 입력 시 자동 하이픈 넣기
  _onFormatHpNum: function (e) {
    var _$this = $(e.currentTarget);
    var data = _$this.val();
    data = data.replace(/[^0-9]/g, '');

    // 길이가 11자 이상이면 앞에 11자리만 가져옴
    data = data.length > 11 ? data.substr(0, 11) : data;

    var tmp = '';

    if (data.length > 3 && data.length <= 6) {
      tmp += data.substr(0, 3);
      tmp += '-';
      tmp += data.substr(3);
      data = tmp;
    } else if (data.length > 6) {
      tmp += data.substr(0, 3);
      tmp += '-';
      var size = data.length < 11 ? 3 : 4;
      tmp += data.substr(3, size);
      tmp += '-';
      tmp += data.substr(3 + size);
      data = tmp;
    }
    _$this.val(data);
  },

  // Native 주소록 호출
  _onClickBtnAddr: function (e) {
    Tw.Native.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this, e));
  },

  _onContact: function (e, resp) {
    if (resp.resultCode === Tw.NTV_CODE.CODE_00) {
      var params = resp.params;
      var _inputName = $(e.currentTarget).data('el');
      $(Tw.StringHelper.stringf('input[name="{0}"]', _inputName)).val(Tw.StringHelper.phoneStringToDash(params.phoneNumber));
    }
    this._onDisableSubmitButton();
  },

  _changeCcurNotiYn: function(context) {
    var _isChecked = context.is(':checked');
    this._toggleElement(context.data('toggleId'), _isChecked);
  },

  // 법정대리인 함께 수령 스위칭
  _onChangeCcurNotiYn: function (e) {
    this._changeCcurNotiYn($(e.currentTarget));
  },

  // 안내서 변경 및 정보변경 모달창
  _openModal: function (data) {
    var _modal = {};

    // 안내서가 "이메일" 일 때만 문구가 다름
    if (this._billType === '2') {
      _modal = Tw.MYT_FARE_BILL_SET.A43;
    } else {
      _modal = this._isChangeInfo ? Tw.MYT_FARE_BILL_SET.A42 : Tw.MYT_FARE_BILL_SET.A41;
    }

    this.popupService.openModalTypeA(_modal.TITLE,
      _modal.CONTENTS,
      Tw.BUTTON_LABEL.CHANGE, null, $.proxy(this._reqBFF_05_0027, this, data), null);
  },

  // 변경 할 안내서 유형 만듬
  _convertBillType: function () {
    var _billType = this._billType;
    var _together = this._getTogetherVal();
    var _toBillType = '';
    switch (_billType) {
      case 'H' :
        switch (_together) {
          case 'B':
            _toBillType = 'Q';
            break;
          case '2':
            _toBillType = 'I';
            break;
          default :
            _toBillType = 'H';
            break;
        }
        break;
      case 'B' :
        switch (_together) {
          case '2' :
            _toBillType = 'A';
            break;
          default :
            _toBillType = 'B';
            break;
        }
        break;
      default :
        _toBillType = _billType;
        break;
    }

    // 회선이 유선일 경우 유선 타입으로 변경
    if (this._data.lineType === 'S') {
      _toBillType = _toBillType.replace('H', 'J').replace('I', 'K');
    }

    return _toBillType;
  },

  // 유효성(밸리데이션) 체크
  _checkValidation: function () {
    var $this = this;
    var _valid = Tw.ValidationHelper;
    var _result = true;
    var _reqData = {};
    var t = this.$container.find('input');

    if (this._data.svcGr === 'R' && this._data.oneAcntSvcYn === 'N') {
      Tw.Popup.openAlert(Tw.ALERT_MSG_MYT_FARE.NOT_USED);
      return {data: _reqData, result: false};
    }

    t.each(function () {
      var _this = $(this);
      if (_this.data('state')) {
        if (_this.data('validType')) {
          var _validType = _this.data('validType');
          var _value = _this.val();

          switch (_validType) {
            case 'addr' :
              if (!(_result = _valid.checkEmpty(_value))) {
                Tw.Popup.openAlert(Tw.ALERT_MSG_MYT_FARE.V43);
                return false;
              }
              break;
            case 'email' :
              if (!(_result = _valid.isEmail(_value))) {
                Tw.Popup.openAlert(Tw.ALERT_MSG_MYT_FARE.V21);
                return false;
              }
              break;
            case 'hp' :
              var _hpValue = _value.replace(/[^0-9]/g, '');
              // 입력값 전체 자릿수가 10자리 미만일 경우
              if (_hpValue.length < 10) {
                Tw.Popup.openAlert(Tw.ALERT_MSG_MYT_FARE.V18);
                _result = false;
                return false;
              }
              else if (!(_result = _valid.isCellPhone(_hpValue))) {
                Tw.Popup.openAlert(Tw.ALERT_MSG_MYT_FARE.V44);
                return false;
              }
              break;

          }
        }

        // 요청 데이터 만들기
        var _name = _this.attr('name');
        if (_this.is(':checkbox')) {
          _reqData[_name] = _this.is(':checked') ? 'Y' : 'N';
        } else {
          var _value2 = _this.val();
          if (_this.data('validType') === 'hp') {
            _value2 = _value2.replace(/[^0-9]/g, '');
            // 기타(우편) > 연락처 일경우 12자리로 맞춘다.
            if ('cntcNum1' === _name) {
              _value2 = $this._getHpNum(_value2);
            }
          }
          _reqData[_name] = _value2;
        }
      }// if end..
    });


    _reqData.toBillTypeCd = this._convertBillType();

    return {data: _reqData, result: _result};
  },

  // 변경하기 버튼 disable / enable
  _onDisableSubmitButton: function () {
    var _$target = this.$container.find('[data-inactive-target]');
    var _isDisable = false;
    _$target.each(function () {
      var _$this = $(this);
      if (_$this.data('state')) {
        // input type이 체크박스 인 경우
        if(_$this.is(':checkbox')){
          _isDisable = !_$this.is(':checked');
        }else {
          _isDisable = _$this.val() === '';
        }

        if (_isDisable) return false;
      }
    });

    this._submit.prop('disabled', _isDisable);
  },

  // 우편안내서 > 연락처 값 변환 (12자리로 맞춰서 보내야 함)
  // 예) 011-728-4508 -> 001107284508
  _getHpNum: function (hpNum) {
    var lpad = Tw.FormatHelper.lpad;
    var _hpNums = Tw.FormatHelper.conTelFormatWithDash(hpNum).split('-');
    return lpad(_hpNums[0], 4, '0') + lpad(_hpNums[1], 4, '0') + _hpNums[2];
  },

  // 변경하기 클릭 이벤트
  _onSubmit: function () {
    var _result = this._checkValidation();
    if (_result.result) {
      this._reqBFF_05_0027(_result.data);
    }
  },

  // 안내서 변경(정보변경) 요청
  _reqBFF_05_0027: function (data) {
    this.popupService.close();
    Tw.Api
      .request(Tw.API_CMD.BFF_05_0027, data)
      .done($.proxy(this._onSucessBFF_05_0027, this))
      .fail($.proxy(this._onFail, this));
  },


  _onSucessBFF_05_0027: function (resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      this._onFail(resp);
      return;
    }

    this.popupService.afterRequestSuccess(
      '/myt-fare/billguide/guide',
      '/myt-fare/billsetup',
      Tw.MYT_FARE_BILL_SET.GUIDE_CONFIRM_TEXT,
      Tw.MYT_FARE_BILL_SET.COMPLETE_TEXT_CHANGE);
  },

  // API Fail
  _onFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};