/**
 * @file myt-fare.bill.common.js
 * @author Jayoon Kong
 * @since 2018.09.18
 * @desc 요금 즉시납부 화면에서 미납요금 조회 및 납부할 회선 선택하는 공통 모듈
 */

/**
 * @namespace
 * @desc 미납요금회선 선택 namespace
 * @param rootEl - dom 객체
 * @param cardPayment - 카드 결제여부
 */
Tw.MyTFareBillCommon = function (rootEl, cardPayment) {
  this.$container = rootEl;
  this.cardPayment = !!cardPayment;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._historyService.init();

  this._init();
};

Tw.MyTFareBillCommon.prototype = {
  /**
   * @function
   * @desc initialize
   */
  _init: function () {
    this._initVariables();
    this._setInitArray();
    this._bindEvent();
  },
  /**
   * @function
   * @desc 변수 초기화
   */
  _initVariables: function () {
    this.$unpaidList = this.$container.find('.fe-unpaid-list');
    this.$appendTarget = this.$container.find('.fe-selected-line');
    if ( this.cardPayment ) {
      // [OP002-9099] 카드 부분납부 기능 (선택된 요금 정보가 한개인 경우에만 처리)
      this.$flexibleBill = this.$container.find('.fe-flexible-bill');
      this.$flexibleBillLine = this.$container.find('.fe-flexible-bill-line');
      this.$partialErrors = this.$flexibleBill.find('.error-txt');
      this.$partialInputClear = this.$flexibleBill.find('button.cancel');
      this._partialPayment = false;
      this._partialPaymentId = '';
    }

    this._selectedLine = [];
    this._billList = [];
    this._billDetailList = [];
    this._moreCnt = 0;
    this._standardCnt = 5; // 더보기 기준 갯수
    this._amount = this.$container.find('.fe-amount').data('value');
    this._isClicked = false;
    this._isfirstPop = false; // 서브메인 등 외부에서 [납부요금 선택]팝업 호출 했는지 유무
  },
  /**
   * @function
   * @desc set initial array
   */
  _setInitArray: function () {
    _.each(this.$unpaidList.find('.fe-line.checked'), $.proxy(function (obj) {
      this._selectedLine.push($(obj).attr('id'));
    }, this));
    if ( this.cardPayment ) {
      // [OP002-9099] 카드 부분납부
      this.$flexibleBill.on('change', 'input[type=radio]', $.proxy(this._onPartialPayment, this));
      this.$flexibleBill.on('keyup', 'input[type=tel]', $.proxy(this._onKeyUpPartialInput, this));
      this.$flexibleBill.on('focusout', 'input[type=tel]', $.proxy(this._onFocusoutPartialInput, this));
      this.$flexibleBill.on('click', 'button.cancel', $.proxy(this._onPartialInputClear, this));
    }
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-select-line', $.proxy(this._selectLine, this));
  },
  /**
   * @function
   * @desc 함께 납부 가능한 회선 팝업 load
   * @param e
   */
  _selectLine: function (e) {
    this._isfirstPop = false;
    this._popupService.open({
        'hbs': 'MF_01_01_02',
        cardPayment: this.cardPayment
      },
      $.proxy(this._openSelectLine, this), // open callback
      $.proxy(this._afterClose, this), // close callback
      'select-line',
      e !== undefined ? $(e.currentTarget) : null
    );
  },

  /**
   * @function
   * @desc OP002-376 페이지 진입 전 팝업 띄우기
   */
  selectLine: function () {
    // 납부가능 건수가 2건 이상일때만 팝업 띄우기
    if ( this.$unpaidList.find('.fe-select-line').length ) {
      this._selectLine();
      // 순서에 유의!! _selectLine() 함수에서 this._isfirstPop = false 를 설정해주기 때문에 해당 함수 다음에 세팅!
      this._isfirstPop = true;
    }
  },

  /**
   * @function
   * @desc open layer
   * @param $layer - 팝업 객체
   */
  _openSelectLine: function ($layer) {
    this.$layer = $layer;
    this.$selectBtn = $layer.find('.fe-select');

    if ( this._selectedLine.length === 0 ) {
      this.$selectBtn.attr('disabled', 'disabled');
    } else {
      this.$selectBtn.removeAttr('disabled');
    }

    this._bindLayerEvent();
  },
  /**
   * @function
   * @desc popup event binding
   */
  _bindLayerEvent: function () {
    this.$unpaidList.find('.fe-line').each($.proxy(this._setEachData, this)); // 각 line별 이벤트
    this.$layer.on('click', '.fe-select', $.proxy(this._onClickDoneBtn, this)); // 선택 버튼 클릭 시 이벤트
    // 외부에서 호출(납부방법 페이지 진입하자마자 팝업 띄우는 경우) 할 때만 닫기 버튼 클릭시 처음 호출했던곳으로 이동시킨다.
    if ( this._isfirstPop ) {
      this.$layer.on('click', '.fe-close-pop', $.proxy(function () {
        this._historyService.go(-2);
      }, this));
    }
  },
  /**
   * @function
   * @desc set each data
   * @param idx
   * @param target
   */
  _setEachData: function (idx, target) {
    var $target = $(target).clone();
    $target.removeClass('none');

    var $id = $target.attr('id');
    var isChecked = false;

    for ( var i in this._selectedLine ) {
      if ( this._selectedLine[i] === $id ) { // 기존에 선택된 회선이면 default check
        isChecked = true;
      }
    }

    if ( isChecked ) {
      $target.addClass('checked');
      $target.attr('aria-checked', 'true');
      $target.find('input').attr('checked', 'checked');
    } else {
      $target.removeClass('checked');
      $target.attr('aria-checked', 'false');
      $target.find('input').removeAttr('checked');
    }
    $target.on('change', $.proxy(this._onCheck, this));
    this._setAmount(); // '납부하실 총 청구금액'
    $target.appendTo(this.$layer.find('.fe-line-list'));
  },
  /**
   * @function
   * @desc 선택 버튼 클릭 시 처리
   * @param e
   */
  _onClickDoneBtn: function (e) {
    if ( this._amount === 0 ) { // 선택된 회선이 없을 경우 얼럿 노출
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_FARE.SELECT_LINE, null, null, null, null, $(e.currentTarget));
    } else {
      this._isClicked = true;
      // 카드결제인 이면서 선택된 회선이 한 개인 경우 부분납부 화면 노출
      if ( this.cardPayment ) {
        if ( this._selectedLine.length === 1 ) {
          this.$flexibleBill.removeClass('none');
          this.$flexibleBillLine.removeClass('none');
          var selectedLineId = this._selectedLine[0];
          if ( this._partialPaymentId !== selectedLineId ) {
            if ( this._partialPayment ) {
              this.$flexibleBill.find('input[type=radio]').eq(0)
                .trigger('click').trigger('change');
            }
          }
          this._partialPaymentId = this._selectedLine[0];
        } else {
          // 초기화
          this.$flexibleBill.find('input[type=radio]').eq(0)
            .trigger('click').trigger('change');
          this.$flexibleBill.find('button.cancel').trigger('click');
          this.$flexibleBill.addClass('none');
          this.$flexibleBillLine.addClass('none');
        }
      }
      this._popupService.close();
    }

    if ( this._isfirstPop ) {
      this._setCoachMark();
    }
  },
  /**
   * @function
   * @desc layer close 이후 합계 구하기
   */
  _afterClose: function () {
    if ( this._isClicked ) {
      this._setAmount(); // 합계 셋팅
    }
  },
  /**
   * @function
   * @desc set amount
   */
  _setAmount: function () {
    var _amount = Tw.FormatHelper.addComma(this._amount.toString());
    this.$container.find('.fe-amount').text(_amount);
    this.$layer.find('.fe-amount').text(_amount);  // 청구금액 합계
  },
  /**
   * @function
   * @desc check된 데이터 처리
   * @param event
   */
  _onCheck: function (event) {
    var $parentTarget = $(event.currentTarget);
    var $target = $(event.target);
    var $id = $parentTarget.attr('id');

    if ( $target.is(':checked') ) {
      this._selectedLine.push($id); // 체크된 회선을 변수에 저장
      this._amount += $parentTarget.find('.fe-money').data('value'); // 체크된 금액의 합계 구하기
    } else {
      for ( var i in this._selectedLine ) {
        if ( this._selectedLine[i] === $id ) {
          this._selectedLine.splice(i, 1); // 체크 해제 시 변수에서 제거
        }
      }
      this._amount -= $parentTarget.find('.fe-money').data('value'); // 합계에서 빼기
    }

    // '납부하실 총 청구금액'
    this._setAmount();
    if ( this._selectedLine.length === 0 ) {
      this.$selectBtn.attr('disabled', 'disabled');
    } else {
      this.$selectBtn.removeAttr('disabled');
    }
  },
  /**
   * @function
   * @desc 더보기 버튼 event binding
   * @param $layer
   * @param selectedCnt
   */
  _setMoreBtnEvent: function ($layer, selectedCnt) {
    var $moreBtn = $layer.find('.fe-more');
    this._moreCnt = selectedCnt - this._standardCnt;

    $moreBtn.removeClass('none');
    $moreBtn.on('click', $.proxy(this._onClickMore, this, $layer, selectedCnt));
  },
  /**
   * @function
   * @desc 더보기 처리
   * @param $layer
   * @param selectedCnt
   * @param event
   */
  _onClickMore: function ($layer, selectedCnt, event) { // 더보기 클릭
    var firstInvisibleCnt = selectedCnt - this._moreCnt;
    for ( var i = firstInvisibleCnt; i < firstInvisibleCnt + this._standardCnt; i++ ) {
      $layer.find('#fe-' + i).removeClass('none');
    }

    var $target = $(event.currentTarget);
    if ( this._moreCnt <= this._standardCnt ) {
      $target.addClass('none');
    } else {
      this._moreCnt = this._moreCnt - this._standardCnt;
    }
  },
  /**
   * @function
   * @desc 납부내역 확인 시 사용할 리스트
   * @param $target
   * @param $layer
   * @param index
   * @param partialPayment
   */
  _setList: function ($target, $layer, index, partialPayment) {
    var originNode = $layer.find('.fe-origin');
    var cloneNode = originNode.clone();

    if ( index < this._standardCnt ) {
      cloneNode.removeClass('none');
    }
    cloneNode.removeClass('fe-origin');
    cloneNode.attr('id', 'fe-' + index);

    cloneNode.find('.fe-svc-info').text($target.find('.fe-svc-info').text());
    cloneNode.find('.fe-money').text(Tw.FormatHelper.addComma(partialPayment || $target.find('.fe-money').data('value')));
    var _invDt = $target.find('.fe-inv-dt').data('value');
    cloneNode.find('.fe-inv-dt').text(
      Tw.DateHelper.getShortDateWithFormatAddByUnit(_invDt, 1, 'month', 'YYYY.M.', 'YYYYMMDD'));

    $layer.find('.fe-selected-line').append(cloneNode);
  },
  /**
   * @function
   * @desc 요청 파라미터에 들어갈 bill list 셋팅
   * @param $target
   * @param partialPayment 부분납부금액
   */
  _setBillList: function ($target, partialPayment) {
    var billObj = {
      invDt: $target.find('.fe-inv-dt').attr('data-value'),
      billSvcMgmtNum: $target.attr('data-svc-mgmt-num'),
      billAcntNum: $target.attr('data-bill-acnt-num'),
      payAmt: partialPayment ? partialPayment : $target.find('.fe-money').attr('data-value')
    };
    this._billList.push(billObj);
  },
  /**
   * @function
   * @desc 외부에서 회선 상세 리스트 호출
   * @returns {Array}
   */
  getBillDetailList: function () {
    return this._billDetailList;
  },
  /**
   * @function
   * @desc 요청 파라미터에 들어갈 billDetail list 셋팅
   * @param $target
   * @param partialPayment
   */
  _setBillDetailList: function ($target, partialPayment) {
    var billObj = {
      invDt: $target.find('.fe-inv-dt').attr('data-value'),
      billSvcMgmtNum: $target.attr('data-svc-mgmt-num'),
      billAcntNum: $target.attr('data-bill-acnt-num'),
      payAmt: partialPayment || $target.find('.fe-money').attr('data-value'),
      svcNumber: $target.find('.fe-svcNumber').text()
    };
    this._billDetailList.push(billObj);
  },
  /**
   * @function
   * @desc 외부에서 회선리스트 호출
   * @returns {Array}
   */
  getBillList: function () {
    return this._billList;
  },
  /**
   * @function
   * @desc 외부에서 합계 호출
   * @returns {*}
   */
  getAmount: function () {
    // 부분 납부인 경우에 입력된 값으로 변경이 필요
    if ( this.cardPayment && this._selectedLine.length === 1 && this._partialPayment ) {
      return this.$flexibleBill.find('input[type=tel]').data('value');
    }
    return this._amount;
  },
  /**
   * @function
   * @desc 외부에서 list data 호출
   * @param $layer
   */
  getListData: function ($layer) {
    var selectedCnt = this._selectedLine.length;
    // 부분 납부인 경우 입력된 값으로 변경 필요
    var partialPayment = this.cardPayment && this._selectedLine.length === 1 && this._partialPayment ?
      this.$flexibleBill.find('input[type=tel]').data('value') : '';
    if ( selectedCnt > this._standardCnt ) {
      this._setMoreBtnEvent($layer, selectedCnt);
    }

    this._billList = [];
    this._billDetailList = [];
    for ( var index in this._selectedLine ) {
      var $target = this.$unpaidList.find('#' + this._selectedLine[index]);

      this._setList($target, $layer, index, partialPayment);
      this._setBillList($target, partialPayment);
      this._setBillDetailList($target, partialPayment);
    }
  },

  /**
   * @function
   * @desc 코치마크 처리
   * @private
   */
  _setCoachMark: function () {
    new Tw.CoachMark(this.$container, '.fe-coach-select', '.fe-coach-select-target', Tw.NTV_STORAGE.COACH_MYTFARE_BILL_SELECT);
  },
  /**
   * @function
   * @desc 부분 납부금액 선택
   * @param event
   * @private
   */
  _onPartialPayment: function (event) {
    var selectId = event.currentTarget.id;
    var $partialArea = this.$flexibleBill.find('.form-wrap');
    // 부분납부영역 활성화
    this._partialPayment = selectId === 'rad1-2';
    if ( selectId === 'rad1-1' ) {
      $partialArea.addClass('none');
      this.$flexibleBill.find('button.cancel').trigger('click');
    } else {
      $partialArea.removeClass('none');
    }
  },
  /**
   * @function
   * @desc 부분납부 금액 입력
   * @param event
   * @private
   */
  _onKeyUpPartialInput: function (event) {
    Tw.InputHelper.inputNumberOnly(event.target);
    var $target = $(event.target);
    $target.data('value', $target.val());
    this._isPartialVaild();
  },
  /**
   * @function
   * @desc 입력된 금액 포맷 변경
   * @param event
   * @private
   */
  _onFocusoutPartialInput: function (event) {
    // 기획요청 (천 단위 ',' , 단위 '원' 표시)
    var $currentTarget = $(event.currentTarget);
    var value = parseInt($currentTarget.val() || 0, 10);
    $currentTarget.val(Tw.FormatHelper.convNumFormat(value) + Tw.CURRENCY_UNIT.WON);
  },
  /**
   * @function
   * @desc 부분납부 입력 부분 금액 및 메세지 초기화
   * @private
   */
  _onPartialInputClear: function () {
    for ( var msgIndex = 0; msgIndex < this.$partialErrors.length; msgIndex++ ) {
      this.$partialErrors.eq(msgIndex).addClass('none');
    }
  },
  /**
   * @function
   * @desc 부분납부 인 경우에 값 체크
   * @returns {boolean}
   * @private
   */
  _isPartialVaild: function () {
    if ( this.cardPayment && this._selectedLine.length > 1 ) {
      // 카드결제인데 결제금액이 여러개인 경우
      return true;
    }
    // 에러메시지 노출되어있다면 숨김 처리
    for ( var msgIndex = 0; msgIndex < this.$partialErrors.length; msgIndex++ ) {
      this.$partialErrors.eq(msgIndex).addClass('none');
    }
    if ( !this._partialPayment ) {
      // 부분납부가 아닌 경우
      return true;
    }
    var partialAmount = parseInt(this.$flexibleBill.find('input[type=tel]').data('value') || 0, 10);
    var paymentAmount = parseInt(this._amount, 10);
    if ( !partialAmount || partialAmount < 10 ) {
      // 납부하실 금액 최소 금액 (10원이상)
      this.$partialErrors.eq(1).removeClass('none');
      this.$flexibleBill.find('input[type=tel]').focus();
      return false;
    } else if ( (partialAmount <= paymentAmount) && partialAmount % 10 > 0 ) {
      // 10원 단위로 표시 노출
      this.$partialErrors.eq(2).removeClass('none');
      this.$flexibleBill.find('input[type=tel]').focus();
      return false;
    } else if ( partialAmount > paymentAmount ) {
      // 납부 가능한 금액보다 입력된 금액이 큰 경우
      this.$partialErrors.eq(0).removeClass('none');
      this.$flexibleBill.find('input[type=tel]').focus();
      return false;
    } else {
      // 정상
      return true;
    }
  }
};
