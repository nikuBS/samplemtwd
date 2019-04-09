/**
 * @file myt-data.gift.available.js
 * @desc T끼리 데이터 선물 > 선물 가능한 대상자 요금제
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.09.17
 */

Tw.MyTDataGiftAvailable = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataGiftAvailable.prototype = {
  /**
   * @function
   * @desc 선물 받을 수 있는 요금제 확인 API Request
   * @private
   */
  _init: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0066, { type: 'G', giftBefPsblYn: 'Y' })
      .done($.proxy(this._onSuccessAvailableProduct, this));
  },

  _cachedElement: function () {
    this.wrap_available_product = this.$container.find('.fe-layer_available_product');
    this.tpl_available_product = Handlebars.compile($('#tpl-available-product').html());
  },

  _bindEvent: function () {
  },

  /**
   * @function
   * @desc 선물 받을 수 있는 요금제 확인 API Response
   * @param res - API response 값
   * @private
   */
  _onSuccessAvailableProduct: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var sortedList = Tw.FormatHelper.purifyPlansData(res.result); // 서버에서 받은 데이터를 정렬(한글 자음, 영어 알파벳, 숫자 순)

      this.wrap_available_product.html(
        this.tpl_available_product({ sortedList: sortedList }) // 핸들바 템플릿 컴파일 후 데이터 바인딩
      );
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  }
};