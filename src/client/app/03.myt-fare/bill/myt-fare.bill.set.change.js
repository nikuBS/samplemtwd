/**
 * FileName: myt-fare.bill.set.change.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018. 9. 21
 */
Tw.MyTFareBillSetChange = function (rootEl, data) {
  this.$container = rootEl;
  this.popupService = Tw.Popup;
  this.$window = window;
  this._history = new Tw.HistoryService();
  this._history.init();
  this._data = data !== undefined ? JSON.parse( data ) : {};
  this._init();

};

Tw.MyTFareBillSetChange.prototype = {
  _init : function() {
    this._initVariables();
    this._bindEvent();
    this._initDefaultOptions();
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
  },

  _bindEvent: function () {
    this.$container.on('change', 'input[name="together"]', $.proxy(this._onChangeTogetherBill, this));
    this._btnAddr.on('click', $.proxy(this._onClickBtnAddr, this));
    this._inputHpNum.on('keyup', $.proxy(this._onFormatHpNum, this));
    this._submit.on('click', $.proxy(this._onSubmit, this));
    this.$container.on('change', 'input[name="ccurNotiYn"]', $.proxy(this._onChangeCcurNotiYn, this)); // 옵션 설정 > 법정대리인
    this.$container.on('keyup focus change', '[data-inactive-target]', $.proxy(this._onDisableSubmitButton, this));
    this.$container.on('change', '[name="scurMailYn"]', $.proxy(this._onChangeScurMailYn, this)); // 이메일 보안 설정
  },

  // 기타(우편) 데이터 설정
  _setAddrData : function (data) {
    if ( Tw.FormatHelper.isEmpty(data.zip) ) {
      this.$container.find('#fe-search-zip').removeClass('none');
    } else {
      this._addrArea.removeClass('none').find('input[name="zip"]').val(data.zip).prop('disabled',true).next().addClass('none');
      this._addrArea.find('input[name="basAddr"]').val(data.basAddr).prop('disabled',true).next().addClass('none');
      this._addrArea.find('input[name="dtlAddr"]').val(data.dtlAddr).next();
    }
  },

  // 이메일 보안설정 이벤트
  _onChangeScurMailYn : function (e) {
    var _$target = $(e.currentTarget);
    // "infoInvDtlDispChkYn": 콘텐츠이용료 청구 사용가능 여부 확인 이 N 이면 disable
    // scurMailYn : 이메일 요금안내서 보안여부 N 이면 disable
    if ( this._data.infoInvDtlDispChkYn === 'N' || !_$target.is(':checked') ) {
      this._toggleDisabledCheckbox(this._options.eq(2), true);
    } else {
      this._toggleDisabledCheckbox(this._options.eq(2), false);
    }
  },

  // 스위치 체크박스 disabled / enabled
  _toggleDisabledCheckbox : function (context, disabled) {
    if (disabled) {
      context.find('.btn-switch').removeClass('on').addClass('disabled')
        .find('.switch-style').attr('aria-disabled',true)
        .find('input').prop('checked',false).prop('disabled',true);
    } else {
      context.find('.btn-switch').removeClass('disabled')
        .find('.switch-style').removeAttr('aria-disabled')
        .find('input').prop('disabled',false);
    }
  },

  // 함께 받을 요금 안내서 값
  _getTogetherVal : function () {
    return this.$container.find('input[name="together"]:checked').val();
  },

  _prop : function (_$el, checked) {
    var _parent =_$el.prop('checked', checked)
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
  _checkedElement : function (name, value) {
    var _$this = this;
    this.$container.find('[name=' + name + ']')
      .each(function(){
        _$this._prop($(this), $(this).val() === value ? true:false);
      });
  },

  // 슬라이더형식 체크 박스 체크표시
  _checkedSlideCheckbox : function (name, value) {
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
  _initDefaultOptions : function () {
    // 정보변경 일때
    if ( this._isChangeInfo ) {
      var _data = this._data;

      // 안내서가 "이메일" 을 포함한 경우
      if ( this._billType === '2' || '2' === this._subBillType ) {
        this._checkedElement('scurMailYn', _data.scurMailYn);
        this._checkedElement('emailRcvAgreeYn', _data.emailRcvAgreeYn);
      }
      this._checkedElement('billSndCyclCd', this._data.billSndCyclCd);
      // 옵션 설정
      this._setOptions(2);
    }

    // App 이 아니면 주소록 버튼 숨김
    if (!Tw.BrowserHelper.isApp()) {
      this._btnAddr.parent().hide();
    }

    // 복합 안내서 일 경우
    if ( this._data.togetherList ) {
      this._checkedElement('together', this._subBillType);
    } else {
      // 단일 안내서일 경우
      // 안내서가 이메일 인경우 이메일 area 보이기
      this._toggleElement('fe-email-area', this._billType === '2');
    }

    this._setAddrData(this._data);
    this._setOptions(1);
  },

  // gubun 1: 노출여부 , 2: 옵션 체크
  _setOptions : function (gubun) {
    var billType = this._billType;
    var isDisplay = gubun === 1 ? true:false;
    var subBillType = isDisplay ? this._getTogetherVal(): this._subBillType;
    var mergeType = billType+subBillType;
    var lineType = this._data.lineType;

    this._options.addClass('none').find('input').data('state',false);
    var _data = this._data;

    // 안내서 유형이 Bill Letter 포함일때 : Bill Letter  보안강화
    if ( 'H' === billType ) {
      if (isDisplay) {
        this._toggleElement(this._options.eq(0), true);
      } else {
        this._checkedSlideCheckbox('scurBillYn', _data.scurBillYn); // Bell Letter 보안강화
      }
    }

    // 휴대폰 번호 전체 표시 여부
    if ( !(mergeType === 'HX' || mergeType === 'HB') || (billType === 'B' && lineType === 'S') ) {
      if (isDisplay) {
        this._toggleElement(this._options.eq(1), true);
      } else {
        this._checkedSlideCheckbox('phonNumPrtClCd', _data.phonNumPrtClCd); // 휴대폰번호 전체 표시
      }
    }

    if ( lineType === 'M' || lineType === 'W') {
      // 콘텐츠 이용 상세내역 표시
      if ( billType === '2' ) {
        if (isDisplay) {
          this._toggleElement(this._options.eq(2), true);
        } else {
          this._checkedSlideCheckbox('infoInvDtlDispYn', _data.infoInvDtlDispYn); // 콘텐츠 이용 상세내역 표시
        }
      }

      if ( lineType === 'M' ) {
        // 콘텐츠 이용 상세내역 표시
        if ( this._options.eq(2).hasClass('none') && _.some('H2,B2'.split(','), function(e) { return e === mergeType; } ) ) {
          if (isDisplay) {
            this._toggleElement(this._options.eq(2), true);
          } else {
            this._checkedSlideCheckbox('infoInvDtlDispYn', _data.infoInvDtlDispYn); // 콘텐츠 이용 상세내역 표시
          }
        }

        // 법정 대리인 함께 수령
        if ( _.some('HX,H2,BX,B2'.split(','), function(e){ return e === mergeType; }) ) {
          if (this._data.kidsYn === 'Y') {
            if (isDisplay) {
              this._toggleElement(this._options.eq(3), true);
            } else {
              this._checkedSlideCheckbox('ccurNotiYn', _data.ccurNotiYn); // 법정대리인 함께 수령
            }
          }
        }
      }
    }
  },

  // 함께 받을 요금 안내서 변경 시
  _onChangeTogetherBill : function (e) {
    // 이메일 인경우 이메일 입력 부분 보이기
    this._toggleElement('fe-email-area', $(e.currentTarget).val() === '2');
    this._setOptions(1);
  },

  // 엘리먼트 토글
  _toggleElement : function (context, state) {
    context = (typeof context  === 'string') ? this.$container.find('#'+context) : context;
    context.toggleClass('none', !state).find('input').data('state', state);
    this._onDisableSubmitButton();
  },

  // 휴대폰 번호 입력 시 자동 하이픈 넣기
  _onFormatHpNum : function (e) {
    var _$this = $(e.currentTarget);
    var data = _$this.val();
    data = data.replace(/[^0-9]/g,'');

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
      tmp += data.substr(3+size);
      data = tmp;
    }
    
    _$this.val(data);
  },

  // Native 주소록 호출
  _onClickBtnAddr: function (e) {
    Tw.Native.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this, e));
  },

  _onContact: function (e, resp) {
    if(resp.resultCode === Tw.NTV_CODE.CODE_00) {
      var params = resp.params;
      var _inputName = $(e.currentTarget).data('el');
      $(Tw.StringHelper.stringf('input[name="{0}"]',_inputName)).val(Tw.StringHelper.phoneStringToDash(params.phoneNumber));
    }
  },

  // 법정대리인 함께 수령 스위칭
  _onChangeCcurNotiYn : function (e) {
    var _$this = $(e.currentTarget);
    var _isChecked = _$this.is(':checked');
    this._toggleElement(_$this.data('toggleId'), _isChecked);
  },

  // 안내서 변경 및 정보변경 모달창
  _openModal : function (data) {
    var _modal = {};

    // 안내서가 "이메일" 일 때만 문구가 다름
    if ( this._billType === '2' ) {
      _modal = Tw.MYT_FARE_BILL_SET.A43;
    } else {
      _modal = this._isChangeInfo ? Tw.MYT_FARE_BILL_SET.A42 : Tw.MYT_FARE_BILL_SET.A41;
    }

    this.popupService.openModalTypeA(_modal.TITLE,
      _modal.CONTENTS,
      Tw.BUTTON_LABEL.CHANGE, null, $.proxy(this._reqBFF_05_0027, this, data), null);
  },

  // 변경 할 안내서 유형 만듬
  _convertBillType : function () {
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
    if ( this._data.lineType === 'S' ) {
      _toBillType = _toBillType.replace('H','J').replace('I','K');
    }

    return _toBillType;
  },

  // 유효성(밸리데이션) 체크
  _checkValidation : function () {
    var $this = this;
    var _valid = Tw.ValidationHelper;
    var _result = true;
    var _reqData = {};
    var t = this.$container.find('input');

    if ( this._data.svcGr === 'R' && this._data.oneAcntSvcYn === 'N' ) {
      Tw.Popup.openAlert(Tw.ALERT_MSG_MYT_FARE.NOT_USED);
      return {data : _reqData, result : false};
    }

    t.each(function () {
      var _this = $(this);
      if (_this.data('state')) {
        if (_this.data('validType')) {
          var _validType = _this.data('validType');
          var _value = _this.val();

          switch (_validType) {
            case 'addr' :
              if ( !(_result = _valid.checkEmpty(_value, Tw.ALERT_MSG_MYT_FARE.V43)) ) {
                return false;
              }
              break;
            case 'email' :
              if ( !(_result = _valid.isEmail(_value)) ) {
                Tw.Popup.openAlert(Tw.ALERT_MSG_MYT_FARE.V21);
                return false;
              }
              break;
            case 'hp' :
              var _hpValue = _value.replace(/[^0-9]/g, '');
              if ( 'ccurNotiSvcNum' === _this.attr('name') ) {
                _result = _valid.checkEmpty(_hpValue, Tw.ALERT_MSG_MYT_FARE.V41);
              }
              // 입력값 전체 자릿수가 10자리 미만일 경우
              if ( !(_result = _valid.checkMoreLength(_hpValue, 10, Tw.ALERT_MSG_MYT_FARE.V18)) ) {
                return false;
              }
              else if ( !(_result = _valid.isCellPhone(_hpValue)) ) {
                Tw.Popup.openAlert(Tw.ALERT_MSG_MYT_FARE.V44);
                return false;
              }

              // 기타(우편) > 연락처 일경우 12자리로 맞춘다.
              if ( 'cntcNum1' === _this.attr('name') ) {
                _hpValue = $this._getHpNum(_hpValue);
              }

              _this.val(_hpValue);
              break;

          }
        }

        // 요청 데이터 만들기
        var _name = _this.attr('name');
        if ( _this.is(':checkbox') ) {
          _reqData[_name] = _this.is(':checked') ? 'Y':'N';
        } else {
          _reqData[_name] = _this.val();
        }
      }// if end..
    });

    _reqData.toBillTypeCd = this._convertBillType();
    if ( this._billType === 'P' && this._data.isusimchk === 'Y' ) {
      _reqData.nreqGuidSmsSndYn = this._getTogetherVal() === 'X' ? 'N':'Y';
    }

    return {data : _reqData, result : _result};
  },

  // 변경하기 버튼 disable / enable
  _onDisableSubmitButton : function () {
    var _$target = this.$container.find('[data-inactive-target]');
    var _isDisable = false;
    _$target.each(function () {
      var _$this = $(this);
      if ( _$this.data('state') ) {
        _isDisable = _$this.val() === '';
        if (_isDisable) return false;
      }
    });

    this._submit.prop('disabled', _isDisable);
  },

  // 우편안내서 > 연락처 값 변환 (12자리로 맞춰서 보내야 함)
  // 예) 011-728-4508 -> 001107284508
  _getHpNum : function (hpNum) {
    var lpad = Tw.FormatHelper.lpad;
    var _hpNums = Tw.FormatHelper.conTelFormatWithDash(hpNum).split('-');
    return lpad(_hpNums[0], 4, '0') + lpad(_hpNums[1], 4, '0') + _hpNums[2];
  },

  // 변경하기 클릭 이벤트
  _onSubmit : function () {
    var _result = this._checkValidation();
    if (_result.result) {
      this._openModal(_result.data);
    }
  },

  // 안내서 변경(정보변경) 요청
  _reqBFF_05_0027 : function (data) {
    this.popupService.close();
    Tw.Api
      .request(Tw.API_CMD.BFF_05_0027, data)
      .done( $.proxy(this._onSucessBFF_05_0027,this) )
      .fail($.proxy(this._onFail,this));
  },


  _onSucessBFF_05_0027 : function (resp) {
    if ( resp.code !== Tw.API_CODE.CODE_00 ) {
      this._onFail(resp);
      return;
    }

    this._history.pushUrl('/myt/fare/bill/set');
    this.$window.location.href = '/myt/fare/bill/set/complete?type=1';
  },

  // API Fail
  _onFail: function (err) {
    Tw.Error(err.code,err.msg).pop();
  }
};