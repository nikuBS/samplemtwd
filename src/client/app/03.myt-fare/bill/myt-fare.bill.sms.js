/**
 * @file myt-fare.bill.sms.js
 * @author Jayoon Kong
 * @since 2018.09.17
 * @desc 요금납부 시 입금전용계좌 SMS 신청
 */

/**
 * @namespace
 * @desc 입금전용계좌 요금납부 namespace
 * @param rootEl - dom 객체
 */
Tw.MyTFareBillSms = function (rootEl) {
  this.$container = rootEl;
  this.$accountSelector = this.$container.find('.fe-account-selector');
  this.$hpSelector = this.$container.find('.fe-hp-selector');
  this.$accountList = this.$container.find('.fe-account-list');
  this.$hpList = this.$container.find('.fe-hp-list');
  this.$payBtn = this.$container.find('.fe-pay');

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;

  this._paymentCommon = new Tw.MyTFareBillCommon(rootEl); // 납부할 회선 선택하는 공통 컴포넌트
  this._historyService = new Tw.HistoryService(rootEl);
  this._backAlert = new Tw.BackAlert(rootEl, true); // x 버튼 클릭 시 alert 띄우는 컴포넌트

  this._paymentCommon.selectLine();
  this._bindEvent();
};

Tw.MyTFareBillSms.prototype = {
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-account-selector', $.proxy(this._selectAccountList, this));
    this.$container.on('click', 'button.fe-hp-selector', $.proxy(this._selectHpList, this));
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));
    this.$payBtn.click(_.debounce($.proxy(this._pay, this), 500));
  },
  /**
   * @function
   * @desc 입금전용계좌 list 조회
   * @param event
   */
  _selectAccountList: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: this._getAccountList(),
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectPopupCallback, this, $target), null, null, $target);
  },
  /**
   * @function
   * @desc 문자받는번호 list 조회
   * @param event
   */
  _selectHpList: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: this._getHpList(),
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectPopupCallback, this, $target), null, null, $target);
  },
  /**
   * @function
   * @desc actionsheet event binding
   * @param $target
   * @param $layer
   */
  _selectPopupCallback: function ($target, $layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); // 접근성

    var $id = $target.attr('id');
    if (!Tw.FormatHelper.isEmpty($id)) {
      $layer.find('input#' + $id).attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._setSelectedValue, this, $target));
  },
  /**
   * @function
   * @desc 선택된 값 셋팅
   * @param $target
   * @param event
   */
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.target);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($selectedValue.parents('label').text());

    this._popupService.close();
  },
  /**
   * @function
   * @desc 입금전용계좌 리스트 만들기
   * @returns {Array}
   */
  _getAccountList: function () {
    var accountList = [];
    var listObj = {
      'list': []
    };
    this.$accountList.find('li').each(function () {
      var $this = $(this);
      var obj = {
        'label-attr': 'id="' + $this.attr('id') + '"',
        'radio-attr': 'id="' + $this.attr('id') + '" name="r2"',
        'txt': $this.text()
      };
      listObj.list.push(obj);
    });
    accountList.push(listObj);

    return accountList;
  },
  /**
   * @function
   * @desc 문자받는번호 리스트 만들기
   * @returns {Array}
   */
  _getHpList: function () {
    var hpList = [];
    var listObj = {
      'list': []
    };
    this.$hpList.find('li').each(function () {
      var $this = $(this);
      var obj = {
        'label-attr': 'id="' + $this.attr('id') + '"',
        'radio-attr': 'id="' + $this.attr('id') + '" name="r2"',
        'txt': $this.text()
      };
      listObj.list.push(obj);
    });
    hpList.push(listObj);

    return hpList;
  },
  /**
   * @function
   * @desc x 버튼 클릭 시 공통 confirm 노출
   */
  _onClose: function () {
    this._backAlert.onClose();
  },
  /**
   * @function
   * @desc 납부할 금액 변경 여부 체크
   * @returns {boolean}
   */
  _isChanged: function () {
    var $amount = this.$container.find('.fe-amount');
    if ($amount.is(':visible')) {
      if (Tw.FormatHelper.addComma($amount.attr('data-value')) !== $amount.text()) {
        return true;
      }
    }
    return this.$accountSelector.attr('id') !== this.$accountSelector.attr('data-origin-id');
  },
  /**
   * @function
   * @desc close popup
   */
  _closePop: function () {
    this._isClose = true;
    this._popupService.closeAll();
  },
  /**
   * @function
   * @desc popup close 이후 원래 페이지로 이동
   */
  _afterClose: function () {
    if (this._isClose) {
      this._historyService.goBack();
    }
  },
  /**
   * @function
   * @desc pay API 호출
   * @param e
   */
  _pay: function (e) {
    var $target = $(e.currentTarget);
    this._apiService.request(Tw.API_CMD.BFF_07_0027, {
      msg: $.trim(this.$accountSelector.text()),
      svcMgmtNum: $.trim(this.$hpSelector.data('svcMgmtNum') || this.$hpSelector.attr('id'))
    }).done($.proxy(this._paySuccess, this, $target))
      .fail($.proxy(this._payFail, this, $target));
  },
  /**
   * @function
   * @desc pay API 응답 처리 (성공)
   * @param $target
   * @param res
   */
  _paySuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var svcNum = '';
      if (!Tw.FormatHelper.isEmpty(res.result.svcNum)) {
        svcNum = Tw.FormatHelper.conTelFormatWithDash(res.result.svcNum);
      }
      this._historyService.replaceURL('/myt-fare/bill/pay-complete?type=sms&svcNum=' + svcNum);
    } else {
      this._payFail($target, res);
    }
  },
  /**
   * @function
   * @desc pay API 응답 처리 (실패)
   * @param $target
   * @param err
   */
  _payFail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  }
};
