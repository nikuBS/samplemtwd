/**
 * @file 이번 달 공유 내역 변경을 위한 로직
 * @author Jiyoung Jo
 * @date 2019-03-18
 */

Tw.MyTDataFamilyHistoryChange = function() {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
};


Tw.MyTDataFamilyHistoryChange.prototype = {
  /**
   * @param {$object} rootEl 최상위 container object
   * @param {$object} item 해당 조회 버튼을 가진 부모 object
   * @param {object} changable 변경 가능한 데이터 양
   * @returns {void}
  */
  init: function(rootEl, item, changable) {
    this.$container = rootEl;
    this.$item = item;
    this._serial = item.data('serial-number');
    this._changable = changable;
    this._all = false;
    this.isSuccess = false;

    this._cachedElement();
    this._bindEvent();
  },

  /**
   * @desc 이벤트 바인딩
   * @returns {void}
  */
  _bindEvent: function() {
    this.$container.on('click', '.btn-type01', $.proxy(this._addChangeData, this));
    this.$cancel.on('click', $.proxy(this._handleClickCancel, this));
    this.$retrieveBtn.on('click', $.proxy(this._handleRerieveChangable, this, true));
    this.$input.on('focusout', $.proxy(this._validateChangeAmount, this));
    this.$input.on('keyup', $.proxy(this._handleTypeAmount, this));
    this.$submitBtn.on('click', $.proxy(this._clickSubmit, this));
  },

  /**
   * @desc jquert element 캐싱
   * @returns {void}
  */
  _cachedElement: function() {
    this.$input = this.$container.find('#fe-changable');
    this.$submitBtn = this.$container.find('#fe-submit');
    this.$error = this.$container.find('#fe-error');
    this.$strong = this.$container.find('strong.fe-txt');
    this.$retrieveBtn = this.$container.find('.fe-retrieve');
    this.$cancel = this.$container.find('.cancel');
    this.$all = this.$container.find('.fe-all');
  },

  /**
   * @desc 데이터 추가 버튼 클릭 시
   * @param {Event} click event 객체
   * @returns {void}
  */  
  _addChangeData: function(e) {
    var value = e.currentTarget.getAttribute('data-value');

    if (value === 'all') {
      this._toggleAllButton(this._all);
    } else {
      this.$input.val(Number(this.$input.val()) + Number(value));
      this.$cancel.css('display', 'inline-block').attr('aria-hidden', false);
    }

    this._validateChangeAmount();
  },

  /**
   * @desc 전체 버튼 클릭 시
   * @param {boolean} 현재 전체 버튼 상태
   * @returns {void}
  */
 _toggleAllButton: function(all) {
    if (all) {
      this.$input.val('');
      this.$input.removeAttr('disabled');
      this.$all.siblings('.fe-enable').removeAttr('disabled');
      this.$cancel.css('display', 'none').attr('aria-hidden', true);
      this.$all.removeClass('btn-on');
      this._all = false;
    } else {
      this.$input.val(this._changable.data);
      this.$input.attr('disabled', true);
      this.$all.siblings('.fe-enable').attr('disabled', true);
      this.$all.addClass('btn-on');
      this.$cancel.css('display', 'inline');
      this._all = true;
    }
  },

  /**
   * @desc 인풋 창 내 X 버튼 클릭
   * @returns {void}
  */
  _handleClickCancel: function() {
    this._toggleAllButton(true);
    this._validateChangeAmount();
  },

  /**
   * @desc 인풋 창 입력 시
   * @returns {void}
  */
  _handleTypeAmount: function() {
    var sValue = this.$input
      .val()
      .replace(/^0*/, '')
      .replace(/[^0-9]/g, '');  // 숫자 외의 입력 값 제거

    this.$input.val(sValue);
    this._validateChangeAmount();
  },

  /**
   * @desc 인풋 창 입력 값 validation
   * @returns {void}
  */
  _validateChangeAmount: function() {
    var value = Number(this.$input.val());

    if (!value) {
      this.$error.text(Tw.VALIDATE_MSG_MYT_DATA.NON_CHANGE_DATA);
      this.$error.removeClass('none').attr('aria-hidden', false);
      this._setDisableSubmit(true);
    } else if (value > this._changable.data) {
      this.$error.text(Tw.VALIDATE_MSG_MYT_DATA.GREATER_THAN_CHANGABLE_DATA);
      this.$error.removeClass('none').attr('aria-hidden', false);
      this._setDisableSubmit(true);
    } else {
      if (!this.$error.hasClass('none')) {
        this.$error.addClass('none').attr('aria-hidden', true);
      }
      this._setDisableSubmit(false);
    }
  },

  /**
   * @desc 하단(변경하기) 버튼 활성화
   * @param {boolean} disable
   * @returns {void}
  */
  _setDisableSubmit: function(disable) {
    disable !== !!this.$submitBtn.attr('disabled') && this.$submitBtn.attr('disabled', disable);
  },

  /**
   * @desc 하단(변경하기) 버튼 클릭 시
   * @param {Event} 클릭 이벤트 객체
   * @returns {void}
  */
  _clickSubmit: function(e) {
    var $target = $(e.currentTarget);
    var ALERT = Tw.ALERT_MSG_MYT_DATA.CONFIRM_SHARE_DATA_CHANGE;
    this._popupService.openConfirmButton(
      ALERT.CONTENTS,
      ALERT.TITLE,
      $.proxy(this._submitChange, this, $target),
      $.proxy(this._handleClosePopup, this),
      Tw.BUTTON_LABEL.CANCEL,
      ALERT.BUTTON,
      $target
    );
  },

  /**
   * @desc 변경하기 확인 시
   * @param {$object} 클릭 타겟 jquery 객체 
   * @returns {void}
  */
  _submitChange: function($target) {
    var type = 'R',
      gb = this.$input.val(),
      mb = 0;

    if (this._all) {
      type = 'A';
      gb = this._changable.gb;
      mb = this._changable.mb;
    }

    this._popupService.close();

    this._apiService
      .request(Tw.API_CMD.BFF_06_0074, {
        shrpotSerNo: this._serial,
        cnlClCd: type,
        reqCnlGbGty: gb,
        reqCnlMbGty: mb
      })
      .done($.proxy(this._handleDoneSubmit, this, $target));
  },

  /**
   * @desc 변경하기 요청에 대한 응답이 서버에서 돌아온 경우
   * @param {$object} 클릭 타겟 jquery 객체 
   * @param {object} 서버 응답
   * @returns {void}
  */
  _handleDoneSubmit: function($target, resp) {
    var CODE = Tw.MYT_DATA_FAMILYDATA_CHANGE_DATA_CODE[resp.code];
    if (CODE) {
      this._popupService.openAlert(Tw.MYT_DATA_FAMILY_CHANGE_DATA_ERRORS[CODE], null, null, $.proxy(this._setRetrieveStatus, this), undefined, $target);
    } else if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
    } else {
      this.$item.find('.fe-after').remove();
      this.$item
        .find('.fe-before')
        .removeClass('none')
        .attr('aria-hidden', false);

      setTimeout(
        $.proxy(function() {
          this._popupService.close();
          this.isSuccess = true;
        }, this), 
        0
      );
    }
  },

  /**
   * @desc 조회하기 버튼 클릭 시
   * @param {boolean} 버튼 노출 여부
   * @returns {void}
  */
  _handleRerieveChangable: function(visible) {
    this._setDisableChange(true);

    if (visible) {
      this.$retrieveBtn.addClass('none').attr('aria-hidden', true);
    }

    this.$strong
      .text(Tw.MYT_DATA_FAMILY_RETRIEVING)
      .switchClass('txt-c2 none', 'txt-c4')
      .attr('aria-hidden', false);  // 조회중 텍스트 노출
    // setTimeout($.proxy(this._handleDoneRetrieve, this, { code: '00', result: { remGbGty: '1', remMbGty: '0' } }), 1000);
    this._requestRetrieve('0');
  },

  /**
   * @desc 변경 가능 데이터 조회
   * @param {string} 버튼 노출 여부
   * @returns {void}
  */
  _requestRetrieve: function(requestCount) {
    this._apiService
      .request(Tw.API_CMD.BFF_06_0072, { reqCnt: requestCount, shrpotSerNo: this._serial })
      .done($.proxy(this._handleDoneRetrieve, this));
  },

  /**
   * @desc 변경 가능 데이터 서버 응답이 내려온 경우
   * @param {object} 서버 응답
   * @returns {void}
  */
  _handleDoneRetrieve: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || !resp.result) {
      this._setRetrieveStatus();
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.ALERT_2_A218, Tw.POPUP_TITLE.NOTIFY, undefined, undefined, undefined, this.$retrieveBtn);
      return;
    }

    if (resp.result.nextReqYn === 'Y') {
      setTimeout($.proxy(this._requestRetrieve, this, resp.result.reqCnt), 3000); // 3초 후에 재요청(BFF 요청 사항)
    } else if (!resp.result.remGbGty && !resp.result.remMbGty) {
      this._setRetrieveStatus();
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.ALERT_2_A218, Tw.POPUP_TITLE.NOTIFY, undefined, undefined, undefined, this.$retrieveBtn);
    } else {
      this._handleSuccessRetrieve(resp.result);
    }
  },

  /**
   * @desc 서버에서 변경가능 데이터 조회 실패 시, '조회하기' 버튼 재 노출
   * @returns {void}
  */
  _setRetrieveStatus: function() {
    this.$retrieveBtn.removeClass('none').attr('aria-hidden', false);
    this.$strong.addClass('none').attr('aria-hidden', true);
  },

  /**
   * @desc 서버에서 변경가능 데이터 조회 성공 시
   * @param {object} 변경 가능 데이터 서버 응답 결과
   * @returns {void}
  */
  _handleSuccessRetrieve: function(share) {
    var nData = Number((Number(share.remGbGty) + Number(share.remMbGty) / 1024 || 0).toFixed(2));
    this.$strong.text(nData > 0 ? nData + 'GB' : '0MB').switchClass('txt-c4', 'txt-c2');
    this.$retrieveBtn.remove();
    if (nData > 0) {
      this._changable.gb = Number(share.remGbGty);
      this._changable.mb = Number(share.remMbGty);
      this._changable.data = nData;
      this._setDisableChange(false);
    }
  },

  /**
   * @desc 변경하기 버튼 비활성화
   * @param {boolean} 비활성화 여부
   * @returns {void}
  */
  _setDisableChange: function(disable) {
    this.$input.attr('disabled', disable);
    this.$container.find('.btn-type01').attr('disabled', disable);
  }
};
