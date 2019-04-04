/**
 * @file 미환급금 신청내역에서 계좌 변경 시 처리
 * @author Hakjoon Sim
 * @since 2018-11-21
 */

/**
 * @class
 * @param (Object) rootEl - 최상위 element
 * @param (Array) bankList - 선택 가능한 은행 리스트
 * @param (String) target - 휴면해제 후 이동할 url
 * @param (Function) callback - 계좌 변경 후 실행할 callback
 */
Tw.MainMenuRefundChangeAccount = function (rootEl, bankList, target, callback) {
  this.$container = rootEl;
  this._bankList = bankList;
  this._target = target;
  this._callback = callback;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cacheElements();
  this._bindEvents();
};

Tw.MainMenuRefundChangeAccount.prototype = {
  /**
   * @function
   * @desc DOM caching
   */
  _cacheElements: function () {
    this.$bankInput = this.$container.find('#formInput01');
    this.$accountInput = this.$container.find('#formInput02');
    this.$accountError = this.$container.find('.fe-account-error');
    this.$submitBtn = this.$container.find('#fe-submit');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvents: function () {
    this.$container.on('click', '#fe-bank-select', $.proxy(this._onBankSelect, this));
    this.$accountInput.on('keyup', $.proxy(this._toggleSubmit, this));
    this.$submitBtn.on('click', $.proxy(this._onSubmit, this));
  },

  /**
   * @function
   * @desc 은행선택 버튼 클릭 시 은행 리스트 보여줌
   */
  _onBankSelect: function () {
    var selectedBankCode = this.$bankInput.attr('data-code');
    if (!Tw.FormatHelper.isEmpty(this._bankList)) { // 최초 조회가 아닌 경우 가지고 있는 은행 리스트 보여줌
      this._showBankList(selectedBankCode);
      return;
    }

    this._apiService.request(Tw.API_CMD.BFF_01_0045, {}) // 은행리스트가 없을 경우 BFF 조회
      .then($.proxy(function (res) {
        if (res.code === Tw.API_CODE.CODE_00) {
          this._bankList = _.map(res.result, function (bankInfo) {
            return {
              option: 'bank',
              attr: 'value="' + bankInfo.commCdVal + '"',
              value: bankInfo.commCdValNm
            };
          });
          this._showBankList(selectedBankCode);
        } else {
          Tw.Error(res.code, res.msg).pop();
        }
      }, this))
      .fail(function (err) {
        Tw.Error(err.code, err.msg).pop();
      });
  },

  /**
   * @function
   * @desc 은행 리스트를 actionsheet 형태로 보여줌
   * @param  {String} selectedBankCode 현재 선택된 은행 코드
   */
  _showBankList: function (selectedBankCode) {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.REFUND_BANK_SELECT,
      data: [{
        list: this._bankList
      }]
    }, $.proxy(function (root) {
      if (!Tw.FormatHelper.isEmpty(selectedBankCode)) {
        root.find('button[value="' + selectedBankCode + '"] input').prop('checked', true);
      }

      root.on('click', '.bank', $.proxy(function (e) {
        this.$bankInput.attr('data-code', e.currentTarget.value);
        this.$bankInput.attr('value', $(e.currentTarget).find('.info-value').text());
        this._popupService.close();
        this._toggleSubmit();
      }, this));
    }, this));
  },

  /**
   * @function
   * @desc submit 버튼 활성화 여부 선택
   */
  _toggleSubmit: function () {
    var account = this.$accountInput.val();
    var bank = this.$bankInput.val();

    if (!Tw.FormatHelper.isEmpty(account) && !Tw.FormatHelper.isEmpty(bank)) {
      this.$submitBtn.removeAttr('disabled');
    } else {
      this.$submitBtn.attr('disabled', 'disabled');
    }
  },

  /**
   * @function
   * @desc 선택한 은행으로 변경하기 위해 BFF로 데이터 전송
   */
  _onSubmit: function () {
    var param = {
      opTyp: '1',
      rfndBankCd: this.$bankInput.data('code'),
      rfndBankNum: this.$accountInput.val(),
      recCnt: '1',
      refundAccount: [{
        svcMgmtNum: this._target.svcMgmtNum,
        acntNum: this._target.acntNum,
        custNum: this._target.custNum,
        bamtClCd: this._target.bamtClCd
      }]
    };

    this._apiService.request(Tw.API_CMD.BFF_01_0043, param)
      .done($.proxy(function (res) {
        if (res.code === Tw.API_CODE.CODE_00) {
          if (res.result === '0') {
            this._popupService.close();
            this._callback();
          } else if (res.result.indexOf('ZNGME') !== -1) {
            this.$accountError.removeClass('none');
          }
          return;
        }

        Tw.Error(res.code, res.msg).pop();
      }, this))
      .fail(function (err) {
        Tw.Error(err.code, err.msg).pop();
      });
  }
};