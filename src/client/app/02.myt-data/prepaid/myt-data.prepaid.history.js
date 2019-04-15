/**
 * @file 선불폰 충전 내역 < 선불폰 충전 < 나의 데이터/통화 < MyT
 * @author Jiyoung Jo
 * @since 2019.03.15
 */


Tw.MyTDataPrepaidHistory = function(rootEl, histories) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._histories = histories;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataPrepaidHistory.prototype = {
  /**
   * @desc 선불폰 충전/선물 내역 초기 작업
   */
  _init: function() {
    this._currentType = this.$selectBtn.data('type');
    this._leftCount = {
      data: Number(this.$totalCount.data('data')) - Tw.DEFAULT_LIST_COUNT,
      voice: Number(this.$totalCount.data('voice')) - Tw.DEFAULT_LIST_COUNT
    };

    this._pageCount = {
      data: 1,
      voice: 1
    };  // BFF api 요청 파라미터

    // 더보기 버튼 클릭 시, 새로운 데이터 추가를 위한 template 저장 
    var $items = $('#fe-tmpl-charge-items').html();
    this._itemsTmpl = Handlebars.compile($items);
    this._dayTmpl = Handlebars.compile($('#fe-tmpl-charge-day').html());
    Handlebars.registerPartial('chargeItems', $items);
  },

  /**
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$selectBtn.on('click', $.proxy(this._openChangeTypes, this));
    this.$moreBtn.on('click', $.proxy(this._handleLoadMore, this));
    this.$container.on('click', '.data-tx', $.proxy(this._handleShowDetail, this));
    this.$container.on('click', '.fe-cancel', $.proxy(this._openCancel, this));
  },

  /**
   * @desc jquery object 캐싱
   */
  _cachedElement: function() {
    this.$moreBtn = this.$container.find('.bt-more');
    this.$selectBtn = this.$container.find('.bt-select');
    this.$totalCount = this.$container.find('.num > em');
    this.$list = this.$container.find('ul.comp-box');
    this.$empty = this.$container.find('.contents-empty');
  },

  /**
   * @desc 음성 or 데이터 타입 변경을 위한 팝업 오픈
   * @param {Event} e 클릭 이벤트
   */
  _openChangeTypes: function(e) {
    var type = this._currentType;

    this._popupService.open(
      {
        hbs: 'actionsheet01',
        btnfloating: { attr: 'type="button"', class: 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        layer: true,
        data: [
          {
            list: _.map(Tw.PREPAID_HISTORIES, function(item) {
              if (item['radio-attr'].lastIndexOf(type) > 0) {
                return $.extend({}, item, { 'radio-attr': item['radio-attr'] + ' checked' });
              }
              return item;
            })
          }
        ]
      },
      $.proxy(this._handleOpenChangeTypes, this),
      undefined,
      undefined,
      $(e.currentTarget)
    );
  },

  /**
   * @desc 음성 or 데이터 타입 변경을 위한 팝업 이벤트 바인딩
   * @param {$object} $layer 
   */
  _handleOpenChangeTypes: function($layer) {
    $layer.on('change', 'li input', $.proxy(this._handleSelectType, this));
  },

  /**
   * @desc 음성 or 데이터 충전 타입 선택 시
   * @param {Event} e 클릭 이벤트
   */
  _handleSelectType: function(e) {
    var type = $(e.currentTarget).data('type'),
      count = this.$totalCount.data(type);

    if (type === this._currentType) { // 현재 타입이랑 선택된 타입이랑 동일 할 때 return
      return;
    }

    var isEmpty = !this.$empty.hasClass('none');
    if (!isEmpty) {
      this.$list.find('li.fe-prepaid-' + this._currentType)
        .addClass('none')
        .attr('aria-hidden', true); // 현재 노출되고 있는 타입에 대해서 none 처리
    }

    if (count === 0) {  // 내역이 없을 경우 처리
      if (!isEmpty) {
        this.$empty.removeClass('none').attr('aria-hidden', false);
      }
    } else {
      if (isEmpty) {
        this.$empty.addClass('none').attr('aria-hidden', true);
      }

      this.$list
        .find('li.fe-prepaid-' + type)
        .removeClass('none')
        .attr('aria-hidden', false);  // 선택된 타입에 대한 노출 처리
    }

    this.$selectBtn.text(Tw.PREPAID_TYPES[type.toUpperCase()]); // 선택된 타입으로 변경
    this.$totalCount.text(count);

    this._currentType = type;
    this._setMoreButton();
    this._popupService.close();
  },

  /**
   * @desc 더보기 버튼 클릭 시
   */
  _handleLoadMore: function() {
    var type = this._currentType;
    if (this._leftCount[type] <= 0) { // 남은 내역 갯수가 0일 때 리턴
      return;
    }

    this._pageCount[type]++;  // 서버에 보낼 input param

    this._apiService
      .request(type === 'voice' ? Tw.API_CMD.BFF_06_0062 : Tw.API_CMD.BFF_06_0063, {
        pageNum: this._pageCount[type],
        rowNum: Tw.DEFAULT_LIST_COUNT
      })
      .done($.proxy(this._handleSuccessLoadMore, this));
  },

  /**
   * @desc 내역 요청에 대한 응답이 돌아온 경우
   * @param {object} resp 서버 응답
   */
  _handleSuccessLoadMore: function(resp) {
    var type = this._currentType;
    if (resp.code !== Tw.API_CODE.CODE_00) {
      this._pageCount[this._currentType]--; // 요청 전 값으로 input param 변경
      return Tw.Error(resp.code, resp.msg).pop();
    }

    // 최근 내역이 제일 먼저 노출되도록 소팅
    var histories = _.reduce(resp.result.history, this._sortHistory, { idx: this._histories[type].length });
    delete histories.idx;
    this._histories[type] = this._histories[type].concat(resp.result.history);
    this._leftCount[type] -= resp.result.history.length || 0;

    this._renderHistories(histories);
  },

  /**
   * @desc 추가 충전 내역 render
   * @param {object} histories 내역
   */
  _renderHistories: function(histories) {
    var type = this._currentType,
      keys = Object.keys(histories),
      idx = keys.length - 1,
      key = keys[idx],
      contents = '',
      typeName = Tw.PREPAID_TYPES[type.toUpperCase()],
      $exist = this.$list.find('.list-box.fe-prepaid-' + type).filter('[data-key="' + key + '"]');

    if ($exist.length > 0) {
      $exist.find('ul.list-con').append(this._itemsTmpl({ items: histories[key], typeName: typeName, pageNum: this._pageCount[type] }));
      idx--;
    }

    for (; idx >= 0; idx--) {
      key = keys[idx];

      contents += this._dayTmpl({
        items: histories[key],
        date: histories[key][0].date,
        type: type,
        key: key,
        pageNum: this._pageCount[type],
        typeName: typeName
      });
    }

    if (contents.length > 0) {
      this.$list.append(contents);
    }

    this._setMoreButton();
  },

  /**
   * @desc 더보기 버튼 보이기 설정
   */
  _setMoreButton: function() {
    var hasNone = this.$moreBtn.hasClass('none'),
      type = this._currentType;
    if (this._leftCount[type] > 0) {
      if (hasNone) {
        this.$moreBtn.removeClass('none').attr('aria-hidden', false);
      }
    } else if (!hasNone) {
      this.$moreBtn.addClass('none').attr('aria-hidden', true);
    }
  },

  /**
   * @desc 최근 충전 내역에 먼저 노출되도록 소팅
   * @param {object} histories accumulator
   * @param {object} history 내역
   * @param {number} idx 어레이 인덱스
   */
  _sortHistory: function(histories, history, idx) {
    var key = (history.chargeDtm || history.chargeDt).substring(0, 8);

    if (!histories[key]) {
      histories[key] = [];
    }

    history.idx = histories.idx + idx;
    history.date = Tw.DateHelper.getShortDate(key);
    if (Tw.PREPAID_BADGES[history.chargeTp]) {
      history.badge = Tw.PREPAID_BADGES[history.chargeTp];
    }
    history.isCanceled = history.payCd === '5' || history.payCd === '9';
    history.isRefundable = history.rfndPsblYn === 'Y';
    history.amt = Tw.FormatHelper.addComma(history.amt);
    history.cardNm = history.wayCd === '02' ? history.cardNm : Tw.PREPAID_PAYMENT_TYPE[history.wayCd];

    histories[key].push(history);

    return histories;
  },

  /**
   * @desc 선불폰 충전 내역 자세히 보기 팝업 오픈
   * @param {Event} e 클릭 이벤트 객체
   */
  _handleShowDetail: function(e) {
    var index = e.currentTarget.getAttribute('data-origin-idx'),
      history = this._histories[this._currentType][index];

    var detail = $.extend(history, {
      typeName: Tw.PREPAID_TYPES[this._currentType.toUpperCase()],
      chargeType: Tw.PREPAID_RECHARGE_TYPE[history.chargeTp],
      date: Tw.DateHelper.getShortDate(history.chargeDtm),
      amt: Tw.FormatHelper.addComma(history.amt),
      payment:
        history.cardNm && history.wayCd === '02' ? 
          Tw.PREPAID_PAYMENT_TYPE[history.wayCd] + '(' + history.cardNm + ')' : 
          Tw.PREPAID_PAYMENT_TYPE[history.wayCd]
    });

    this._popupService.open({ hbs: 'DC_09_06_01', detail: detail }, undefined, undefined, undefined, $(e.currentTarget));
  },

  /**
   * @desc '취소' 버튼 클릭 시 confirm 오픈
   * @param {Event} e 클릭 이벤트 객체
   */
  _openCancel: function(e) {
    var $target = $(e.currentTarget);
    this._popupService.openConfirm(Tw.ALERT_MSG_MYT_DATA.ALERT_2_A74, Tw.POPUP_TITLE.NOTIFY, $.proxy(this._handleCancel, this, $target), undefined, $target);
  },
  
  /**
   * @desc 취소 확인 팝업에서 '확인' 버튼 클릭시, 취소 로직
   * @param {$object} $target 취소 버튼
   */
  _handleCancel: function($target) {
    var code = $target.data('charge-code'),
      id = $target.data('cancel-id'),
      pageNum = $target.data('page-number');

    skt_landing.action.loading.on({ ta: this.$container });
    if (Tw.FormatHelper.isEmpty(code)) {
      this._apiService
        .request(Tw.API_CMD.BFF_06_0069, { cancelOrderId: id, pageNum: pageNum, rowNum: Tw.DEFAULT_LIST_COUNT })
        .done($.proxy(this._handleSuccessCancel, this))
        .fail($.proxy(this._fail, this));
    } else {
      this._apiService
        .request(Tw.API_CMD.BFF_06_0070, { cancelOrderId: id, dataChargeCd: code })
        .done($.proxy(this._handleSuccessCancel, this))
        .fail($.proxy(this._fail, this));
    }
    this._popupService.close();
  },

  /**
   * @desc 취소 api 요청에 대한 서버 응답 시
   * @param {object} resp 서버 응답
   */
  _handleSuccessCancel: function(resp) {
    skt_landing.action.loading.off({ ta: this.$container });
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
    } else {
      window.location.replace('/myt-data/recharge/prepaid/history');
      Tw.CommonHelper.toast(Tw.ALERT_MSG_MYT_DATA.COMPLETE_CANCEL);
    }
  },

  /**
   * @desc api 요청에 대한 timeout 발생 시
   */
  _fail: function() {
    skt_landing.action.loading.off({ ta: this.$container });
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  }
};
