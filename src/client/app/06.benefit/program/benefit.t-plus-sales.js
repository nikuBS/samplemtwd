/**
 * @file product.join.t-plus
 * @author Kim InHwan
 * @since 2018-10-22
 *
 */

/**
 * @class
 * @desc 혜택할인 > 상품상세 > T끼리 plus할인 설정
 * @param params
 * @constructor
 */
Tw.BenefitTPlusSales = function (params) {
  this.$container = params.$element;
  this.data = params.data;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._render();
  this._bindEvent();
};

Tw.BenefitTPlusSales.prototype = {

  _initialize: function() {
  },
  /**
   * @function
   * @desc 멤버변수 설정
   */
  _render: function () {
    this.$plusExample = this.$container.find('[data-id=plus-example]');
    this.$longDiscount = this.$container.find('[data-id=long-discount]');
    this.$okBtn = this.$container.find('[data-id=btn-ok]');
  },
  /**
   * @function
   * @desc 바인드 이벤트
   */
  _bindEvent: function () {
    this.$longDiscount.on('click', $.proxy(this._onLongDiscountClicked, this));
    this.$plusExample.on('click', $.proxy(this._onPlusExampleClicked, this));
    this.$okBtn.on('click', _.debounce($.proxy(this._onOkBtnClicked, this), 500));
  },
  /**
   * @function
   * @desc 장기가입 할인 확인하기 팝업
   */
  _onLongDiscountClicked: function () {
    this._popupService.open({
      hbs: 'BS_03_02_01_03',
      layer: true,
      info: this.data.svcInfo
    }, null, null, 'long_discount');
  },
  /**
   * @function
   * @desc T끼리 Plus 할인 적용 예시 > 상세보기
   */
  _onPlusExampleClicked: function () {
    this._popupService.open({
      hbs: 'BS_03_02_01_02',
      layer: true
    }, null, null, 'tplus-example');
  },
  /**
   * @function
   * @desc 가입버튼 클릭
   */
  _onOkBtnClicked: function () {
    if ( this.data.isJoin ) {
      this._historyService.goBack();
    }
    else {
      // page 이동
      this._historyService.goLoad('/benefit/submain/detail/dis-pgm/input?prod_id=' + this.data.prodId);
    }
  }
};