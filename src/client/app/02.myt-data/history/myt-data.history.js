/**
 * @file myt-data.datainfo.js
 * @author Jiyoung Jo
 * @since 2018.09.21
 */

Tw.MyTDataHistory = function(rootEl, histories) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init(histories);
};

Tw.MyTDataHistory.prototype = {
  TYPES: {
    DATA_GIFT: 0,
    LIMIT_CHARGE: 1,
    TING_CHARGE: 2,
    TING_GIFT: 3,
    REFILL: 4,
    ALL: 5
  },

  /**
   * @desc 초기화 함수
   * @param {object} histories BFF 에서 전체 내역 소팅 및 페이징이 안된다고 하여, node에서 소팅 후 더보기 로직을 위해 js로 토스
   */
  _init: function(histories) {
    this._type = Number(this.$list.data('filter-index'));
    this._histories = {};
    this._histories[this.TYPES.ALL] = histories.all;

    this._displayCount = {};
    this._displayCount[this._type] = Tw.DEFAULT_LIST_COUNT;

    if (this._type !== this.TYPES.ALL) {
      this._histories[this._type] = histories.display;
    }

    this._itemsTmpl = Handlebars.compile($('#fe-tmpl-charge-items').html());
  },

  /**
   * @desc jquery 객체 캐싱
   */
  _cachedElement: function() {
    this.$list = this.$container.find('ul.comp-box');
    this.$moreBtn = this.$container.find('.bt-more');
    this.$empty = this.$container.find('.result-none');
  },

  /**
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$moreBtn.on('click', $.proxy(this._handleLoadMore, this));
    this.$container.on('click', '#fe-type', $.proxy(this._handleChangeType, this));
    this.$container.on('click', '.fe-cancel', $.proxy(this._openCancelableChargeAlert, this));
  },

  /**
   * @desc 더보기 버튼 클릭 시
   */
  _handleLoadMore: function() {
    var type = this._type,
      items = this._histories[type].slice(this._displayCount[type], this._displayCount[type] + Tw.DEFAULT_LIST_COUNT);

    this.$list.append(this._itemsTmpl({ items: items }));

    this._displayCount[type] += items.length;
    var leftCount = this._histories[type].length - this._displayCount[type];

    var hasNone = this.$moreBtn.addClass('none').attr('aria-hidden', true);
    if (leftCount > 0) {
      if (hasNone) {
        this.$moreBtn.removeClass('none').attr('aria-hidden', false);
      }
    } else if (!hasNone) {
      this.$moreBtn.addClass('none').attr('aria-hidden', true);
    }
  },

  /**
   * 충전/선물 유형 변경 시
   * @param {Event} e 클릭 이벤트 객체
   */
  _handleChangeType: function(e) {
    var type = this._type;

    this._popupService.open(
      {
        hbs: 'actionsheet01',
        btnfloating: { attr: 'type="button"', class: 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        layer: true,
        data: [
          {
            list: _.map(Tw.MYT_DATA_CHARGE_TYPE_LIST, function(item) {  // actionsheet에 현재 선택된 유형 체크
              if (item['radio-attr'].indexOf(type) >= 0) {
                return $.extend({}, item, { 'radio-attr': item['radio-attr'] + ' checked' });
              }
              return item;
            })
          }
        ]
      },
      $.proxy(this._handleOpenType, this),
      undefined,
      undefined,
      $(e.currentTarget)  // 웹 접근성을 위한 타깃 jquery 객체 추가
    );
  },

  /**
   * @desc 충전/선물 유형 변경 팝업 오픈 시
   * @param {$object} $layer 
   */
  _handleOpenType: function($layer) {
    $layer.on('change', 'li input', $.proxy(this._handleSelectType, this));
  },

  /**
   * @desc 충전/선물 유형 변경 선택 시
   * @param {Event} e 클릭 이벤트 객체
   */
  _handleSelectType: function(e) {
    var $target = $(e.currentTarget),
      $li = $target.parents('label');
    var selectedIdx = Number($target.data('type'));

    this.$container.find('.bt-select').text($li.find('span.txt').text());

    this._handleLoadFilteredData(selectedIdx);
    this._popupService.close();
  },

  /**
   * @desc 충전/선물 표시 데이터 변경
   * @param {number} selectedIdx 선택된 충전/선물 유형 인덱스
   */
  _handleLoadFilteredData: function(selectedIdx) {
    if (selectedIdx === this._type) { // 기존과 같은 경우 변경 없음
      return;
    }

    this._type = selectedIdx;
    if (!this._histories[selectedIdx]) {
      this._histories[selectedIdx] = _.filter(this._histories[this.TYPES.ALL], function(item) {
        return item.type === selectedIdx;
      });
    }

    this._displayCount[selectedIdx] = 0;
    var nData = this._histories[selectedIdx];

    this.$list.empty();

    if (nData.length > 0) {
      if (!this.$empty.hasClass('none')) {
        this.$empty.addClass('none').attr('aria-hidden', true);
      }

      this.$container.find('.num > em').text(nData.length);
      this._handleLoadMore();
    } else {
      this.$container.find('.num > em').text(0);
      if (!this.$moreBtn.hasClass('none')) {
        this.$moreBtn.addClass('none').attr('aria-hidden', true);
      }
      this.$empty.removeClass('none').attr('aria-hidden', false);
    }
  },

  /**
   * @desc 충전 취소 버튼 클릭 시 안내 팝업
   * @param {Event} e 클릭 이벤트 객체
   */
  _openCancelableChargeAlert: function(e) {
    this._popupService.openAlert(
      Tw.ALERT_MSG_MYT_DATA.RECHARGE_CANCEL, 
      undefined, 
      undefined, 
      undefined, 
      undefined, 
      $(e.currentTarget)  // 웹 접근성 포커스 처리를 위한 jquery 객체
    );
  }
};
