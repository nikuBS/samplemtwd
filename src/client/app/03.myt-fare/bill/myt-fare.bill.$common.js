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
 */
Tw.MyTFareBillCommon = function (rootEl) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._historyService.init();

  this._init();
  this._setCoachMark();
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
        'hbs': 'MF_01_01_02'
      },
      $.proxy(this._openSelectLine, this), // open callback
      $.proxy(this._afterClose, this), // close callback
      'select-line',
      e !== undefined ? $(e.currentTarget):null
    );
  },

  /**
   * @function
   * @desc OP002-376 페이지 진입 전 팝업 띄우기
   */
  selectLine: function () {
    // 납부가능 건수가 2건 이상일때만 팝업 띄우기
    if (this.$unpaidList.find('.fe-select-line').length) {
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

    if (this._selectedLine.length === 0) {
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
    if (this._isfirstPop){
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

    for (var i in this._selectedLine) {
      if (this._selectedLine[i] === $id) { // 기존에 선택된 회선이면 default check
        isChecked = true;
      }
    }

    if (isChecked) {
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
    if (this._amount === 0) { // 선택된 회선이 없을 경우 얼럿 노출
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_FARE.SELECT_LINE, null, null, null, null, $(e.currentTarget));
    } else {
      this._isClicked = true;
      this._popupService.close();
    }
  },
  /**
   * @function
   * @desc layer close 이후 합계 구하기
   */
  _afterClose: function () {
    if (this._isClicked) {
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

    if ($target.is(':checked')) {
      this._selectedLine.push($id); // 체크된 회선을 변수에 저장
      this._amount += $parentTarget.find('.fe-money').data('value'); // 체크된 금액의 합계 구하기
    } else {
      for (var i in this._selectedLine) {
        if (this._selectedLine[i] === $id) {
          this._selectedLine.splice(i, 1); // 체크 해제 시 변수에서 제거
        }
      }
      this._amount -= $parentTarget.find('.fe-money').data('value'); // 합계에서 빼기
    }

    // '납부하실 총 청구금액'
    this._setAmount();
    if (this._selectedLine.length === 0) {
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
    for (var i = firstInvisibleCnt; i < firstInvisibleCnt + this._standardCnt; i++) {
      $layer.find('#fe-' + i).removeClass('none');
    }

    var $target = $(event.currentTarget);
    if (this._moreCnt <= this._standardCnt) {
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
   */
  _setList: function ($target, $layer, index) {
    var originNode = $layer.find('.fe-origin');
    var cloneNode = originNode.clone();

    if (index < this._standardCnt) {
      cloneNode.removeClass('none');
    }
    cloneNode.removeClass('fe-origin');
    cloneNode.attr('id', 'fe-' + index);

    cloneNode.find('.fe-svc-info').text($target.find('.fe-svc-info').text());
    cloneNode.find('.fe-money').text(Tw.FormatHelper.addComma($target.find('.fe-money').data('value')));
    var _invDt = $target.find('.fe-inv-dt').data('value');
    cloneNode.find('.fe-inv-dt').text(
      Tw.DateHelper.getShortDateWithFormatAddByUnit(_invDt, 1, 'month', 'YYYY.M.', 'YYYYMMDD'));

    $layer.find('.fe-selected-line').append(cloneNode);
  },
  /**
   * @function
   * @desc 요청 파라미터에 들어갈 bill list 셋팅
   * @param $target
   */
  _setBillList: function ($target) {
    var billObj = {
      invDt: $target.find('.fe-inv-dt').attr('data-value'),
      billSvcMgmtNum: $target.attr('data-svc-mgmt-num'),
      billAcntNum: $target.attr('data-bill-acnt-num'),
      payAmt: $target.find('.fe-money').attr('data-value')
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
   */
  _setBillDetailList: function ($target) {
    var billObj = {
      invDt: $target.find('.fe-inv-dt').attr('data-value'),
      billSvcMgmtNum: $target.attr('data-svc-mgmt-num'),
      billAcntNum: $target.attr('data-bill-acnt-num'),
      payAmt: $target.find('.fe-money').attr('data-value'),
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
    return this._amount;
  },
  /**
   * @function
   * @desc 외부에서 list data 호출
   * @param $layer
   */
  getListData: function ($layer) {
    var selectedCnt = this._selectedLine.length;
    if (selectedCnt > this._standardCnt) {
      this._setMoreBtnEvent($layer, selectedCnt);
    }

    this._billList = [];
    this._billDetailList = [];
    for (var i in this._selectedLine) {
      var $target = this.$unpaidList.find('#' + this._selectedLine[i]);

      this._setList($target, $layer, i);
      this._setBillList($target);
      this._setBillDetailList($target);
    }
  },

  /**
   * @function
   * @desc 코치마크 처리
   * @private
   */
  _setCoachMark: function () {
    new Tw.CoachMark(this.$container, '.fe-coach-select', '.fe-coach-select-target', Tw.NTV_STORAGE.COACH_MYTFARE_BILL_SELECT);
  }
};
