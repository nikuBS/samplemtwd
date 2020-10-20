/**
 * @file 미환급금 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-11-15
 */

/**
 * @class
 * @param (Object) rootEl - 최상위 element
 * @param (String) data - 미환급금 관련 data
 */
Tw.MainMenuRefund = function (rootEl, data) {
  this.$container = rootEl;
  this._data = JSON.parse(data);

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this._bankList = undefined;

  this._cacheElements();
  this._bindEvents();
};

Tw.MainMenuRefund.prototype = {
  _cacheElements: function () {
    this.$bankInput = this.$container.find('.fe-bank-input');
    this.$accountInput = this.$container.find('.fe-account-input');
    this.$btnSubmitRefund = this.$container.find('#fe-submit-refund');
    this.$divRefund = this.$container.find('#fe-div-refund');
    this.$divDonation = this.$container.find('#fe-div-donation');
    this.$accountError = this.$container.find('.fe-account-error');
  },
  _bindEvents: function () {
    this.$container.on('click', '#fe-btn-detail', $.proxy(this._onDetail, this));
    this.$container.on('click', '#fe-outlink-smartchoice', $.proxy(this._onOutToSmartChoice, this));
    this.$container.on('click', '#fe-select-bank', $.proxy(this._onBankNeeded, this));
    this.$container.on('change', 'input[type="radio"]', $.proxy(this._onMethodChanged, this));
    this.$container.on('click', '#fe-submit-donation', $.proxy(this._onSubmitDonation, this));
    this.$container.on('click', '#fe-change-account', $.proxy(this._onChangeAccount, this));
    this.$accountInput.on('keyup', $.proxy(this._toggleSubmit, this));
    this.$btnSubmitRefund.on('click', $.proxy(this._onSubmitRefund, this));
  },

  /**
   * @function
   * @desc 각 미환급금 항목 상세보기 화면 처리
   */
  _onDetail: function () {
    this._popupService.open({
      hbs: 'actionsheet_link_b_type',
      layer: true,
      title: '해지환급금액 상세보기',
      data: [{
        list: _.map(this._data.refundArr, function (item) {
          return {
            value: item.svcCdNm,
            explain: item.svcText,
            text1: item.svcBamt + Tw.CURRENCY_UNIT.WON
          };
        })
      }]
    }, function (root) {
      root.find('.ico').hide();
    });
  },

  /**
   * @function
   * @desc 환급/기부 변경 시 화면 처리
   * @param  {Object} e change event
   */
  _onMethodChanged: function (e) {
    if (!!$(e.currentTarget).attr('dsiabled')) {
      return;
    }
    var value = e.currentTarget.value;
    if (value.indexOf('refund') !== -1) {
      this.$divDonation.addClass('none');
      this.$divRefund.removeClass('none');
    } else if (value.indexOf('donation') !== -1) {
      this.$divRefund.addClass('none');
      this.$divDonation.removeClass('none');
    }
  },

  /**
   * @function
   * @desc 외부 url로 이동. app 인 경우 과금 팝업 발생
   */
  _onOutToSmartChoice: function () {
    var move = function () { Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.SMART_CHOICE); };

    if (Tw.BrowserHelper.isApp()) {
      Tw.CommonHelper.showDataCharge(function () {
        move();
      });
      return;
    }

    move();
  },

  /**
   * @function
   * @desc 은행 리스트 보여줌
   */
  _onBankNeeded: function () {
    var selectedBankCode = this.$bankInput.attr('data-code');
    if (!Tw.FormatHelper.isEmpty(this._bankList)) {
      this._showBankList(selectedBankCode);
      return;
    }

    this._apiService.request(Tw.API_CMD.BFF_01_0045, {}) // 최초 시도인 경우 BFF에 은행 리스트 조회하고 저장
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
   * @desc 은행 리스트 actionsheet 로 보여줌
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
        root.find('button[value="' + selectedBankCode + '"]').addClass('checked');
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
   * @desc submit 버튼 활성/비활성 처리
   */
  _toggleSubmit: function () {
    var account = this.$accountInput.val();
    var bank = this.$bankInput.val();

    if (!Tw.FormatHelper.isEmpty(account) && !Tw.FormatHelper.isEmpty(bank)) {
      this.$btnSubmitRefund.removeAttr('disabled');
    } else {
      this.$btnSubmitRefund.attr('disabled', 'disabled');
    }
  },


  /**
   * @function
   * @desc 환급 선택시 BFF 로 요청
   */
  _onSubmitRefund: function () {
    this.$accountError.addClass('none');
    var param = {
      opTyp: '1',
      rfndBankCd: this.$bankInput.data('code'),
      rfndBankNum: this.$accountInput.val(),
      recCnt: this._data.refundArr.length + '',
      refundAccount: _.map(this._data.refundArr, function (item) {
        return {
          svcMgmtNum: item.svcMgmtNum,
          acntNum: item.acntNum,
          custNum: item.custNum,
          bamtClCd: item.bamtClCd
        };
      })
    };

    this._apiService.request(Tw.API_CMD.BFF_01_0043, param)
      .done($.proxy(function (res) {
        if (res.code === Tw.API_CODE.CODE_00) {
          if (res.result === '0') {
            this._historyService.reload();
          } else if (res.result.indexOf('ZNGME') !== -1) {
            this.$accountError.removeClass('none');
          }
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
   * @desc 기부 선택시 팝업 발생
   */
  _onSubmitDonation: function () {
    this._popupService.openConfirm(
      Tw.POPUP_CONTENTS.DONATION,
      Tw.POPUP_TITLE.NOTIFY,
      $.proxy(this._requestDonation, this)
    );
  },

  /**
   * @function
   * @desc BFF 로 기부 신청 요청
   */
  _requestDonation: function () {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_01_0044, {
      opTypCd: '1',
      custNum: this._data.refundArr[0].custNum,
      recCnt: this._data.refundArr.length + '',
      donation: _.map(this._data.refundArr, function (item) {
        return {
          svcMgmtNum: item.svcMgmtNum,
          acntNum: item.acntNum
        };
      })
    }).done($.proxy(function (res) {
      if (res.code === Tw.API_CODE.CODE_00) {
        this._historyService.reload();
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
   * @desc 환급 계좌 변경 시도 시 처리
   * @param  {Object} e click 이벤트
   */
  _onChangeAccount: function (e) {
    var svcMgmtNum = e.currentTarget.value;
    var target = _.filter(this._data.submittedArr, function (item) {
      return item.svcMgmtNum === svcMgmtNum;
    })[0];

    var needRefresh = false;
    this._popupService.open({
      hbs: 'MN_01_04_01_01_01',
      data: {
        name: this._data.name,
        socialId: this._data.socialId
      }
    }, $.proxy(function (root) {
      new Tw.MainMenuRefundChangeAccount(root, this._bankList, target, $.proxy(function () {
        needRefresh = true;
      }, this));
    }, this),
    $.proxy(function () {
      if (needRefresh) {
        this._historyService.reload();
      }
    }, this), 'change');
  }
};
