/**
 * FileName: myt-fare.bill.common.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.18
 * Annotation: 요금 즉시납부 화면에서 미납요금 조회 및 납부할 회선 선택하는 공통 모듈
 */

Tw.MyTFareBillCommon = function (rootEl) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._historyService.init();

  this._init();
};

Tw.MyTFareBillCommon.prototype = {
  _init: function () {
    this._initVariables();
    this._setInitArray();
    this._bindEvent();
  },
  _initVariables: function () {
    this.$unpaidList = this.$container.find('.fe-unpaid-list');
    this.$appendTarget = this.$container.find('.fe-selected-line');

    this._selectedLine = [];
    this._billList = [];
    this._moreCnt = 0;
    this._standardCnt = 5; // 더보기 기준 갯수
    this._amount = this.$container.find('.fe-amount').data('value');
    this._isClicked = false;
  },
  _setInitArray: function () {
    var $targetId = this.$unpaidList.find('.fe-line.checked').attr('id');
    this._selectedLine.push($targetId);
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-select-line', $.proxy(this._selectLine, this));
  },
  _selectLine: function (e) {
    // 함께 납부 가능한 회선 팝업 load
    this._popupService.open({
        'hbs': 'MF_01_01_02'
      },
      $.proxy(this._openSelectLine, this), // open callback
      $.proxy(this._afterClose, this), // close callback
      'select-line',
      $(e.currentTarget)
    );
  },
  _openSelectLine: function ($layer) {
    this.$layer = $layer;
    this.$selectBtn = $layer.find('.fe-select');

    this._bindLayerEvent();
  },
  _bindLayerEvent: function () {
    this.$unpaidList.find('.fe-line').each($.proxy(this._setEachData, this)); // 각 line별 이벤트
    this.$layer.on('click', '.fe-select', $.proxy(this._onClickDoneBtn, this)); // 선택 버튼 클릭 시 이벤트
  },
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
    $target.appendTo(this.$layer.find('.fe-line-list'));
  },
  _onClickDoneBtn: function (e) {
    if (this._amount === 0) { // 선택된 회선이 없을 경우 얼럿 노출
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_FARE.SELECT_LINE, null, null, null, null, $(e.currentTarget));
    } else {
      this._isClicked = true;
      this._popupService.close();
    }
  },
  _afterClose: function () {
    if (this._isClicked) {
      this._setAmount(); // 합계 셋팅
    }
  },
  _setAmount: function () {
    this.$container.find('.fe-amount').text(Tw.FormatHelper.addComma(this._amount.toString()));
  },
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

    if (this._selectedLine.length === 0) {
      this.$selectBtn.attr('disabled', 'disabled');
    } else {
      this.$selectBtn.removeAttr('disabled');
    }
  },
  _setMoreBtnEvent: function ($layer, selectedCnt) {
    var $moreBtn = $layer.find('.fe-more');
    this._moreCnt = selectedCnt - this._standardCnt;

    $moreBtn.removeClass('none');
    $moreBtn.on('click', $.proxy(this._onClickMore, this, $layer, selectedCnt));
  },
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
  _setList: function ($target, $layer, index) { // 납부내역 확인 시 사용할 리스트
    var originNode = $layer.find('.fe-origin');
    var cloneNode = originNode.clone();

    if (index < this._standardCnt) {
      cloneNode.removeClass('none');
    }
    cloneNode.removeClass('fe-origin');
    cloneNode.attr('id', 'fe-' + index);

    cloneNode.find('.fe-svc-info').text($target.find('.fe-svc-info').text());
    cloneNode.find('.fe-money').text($target.find('.fe-money').text().replace(Tw.CURRENCY_UNIT.WON, ''));
    cloneNode.find('.fe-inv-dt').text($target.find('.fe-inv-dt').text());

    $layer.find('.fe-selected-line').append(cloneNode);
  },
  _setBillList: function ($target) {
    var billObj = {
      invDt: $target.find('.fe-inv-dt').attr('data-value'),
      billSvcMgmtNum: $target.attr('data-svc-mgmt-num'),
      billAcntNum: $target.attr('data-bill-acnt-num'),
      payAmt: $target.find('.fe-money').attr('data-value')
    };
    this._billList.push(billObj);
  },
  getBillList: function () {
    return this._billList; // 외부에서 회선리스트 호출
  },
  getAmount: function () {
    return this._amount; // 외부에서 합계 호출
  },
  getListData: function ($layer) {
    var selectedCnt = this._selectedLine.length;
    if (selectedCnt > this._standardCnt) {
      this._setMoreBtnEvent($layer, selectedCnt);
    }

    this._billList = [];
    for (var i in this._selectedLine) {
      var $target = this.$unpaidList.find('#' + this._selectedLine[i]);

      this._setList($target, $layer, i);
      this._setBillList($target);
    }
  }
};