Tw.MytRefillSelect = function (rootEl) {
  this.$container = rootEl;
  this.$document = $(document);
  this.window = window;
  this._apiService = new Tw.ApiService();

  this._bindEvent();
};

Tw.MytRefillSelect.prototype = Object.create(Tw.View.prototype);
Tw.MytRefillSelect.prototype.constructor = Tw.MytRefillSelect;

Tw.MytRefillSelect.prototype = Object.assign(Tw.MytRefillSelect.prototype, {
  _bindEvent: function () {
    this.$container.on('click', '.refill-select-btn', $.proxy(this._confirmRefill, this));
    this.$document.on('click', '.refill-cancel', $.proxy(this._closePopup, this));
    this.$document.on('click', '.refill-submit', $.proxy(this._refill, this));
  },
  _confirmRefill: function () {
    var couponType = this.$container.find('label.checked').data('value');
    var endDate = this._getLocalStorage('refillCouponEndDate');
    this._openPopup(couponType, endDate);
  },
  _openPopup: function (couponType, endDate) {
    skt_landing.action.popup.open({
      'title': '알림',
      'close_bt': true,
      'title2': couponType + ' 리필을 선택하셨습니다.',
      'contents': '쿠폰 사용 가능 기간은 ' + endDate + '까지이며, 리필 이후 요금제 변경 시에는 사용할 수 없습니다.<br/>자세한 사항은 쿠폰 사용 내역에서 확인 가능합니다.<br/><br/>정말로 쿠폰으로 리필하시겠습니까?<br/>신청 후 취소가 불가합니다.',
      'bt_num': 'two',
      'type': [{
        class: 'bt-white1 refill-cancel',
        txt: '취소'
      }, {
        class: 'bt-red1 refill-submit',
        txt: '확인'
      }]
    });
  },
  _closePopup: function () {
    skt_landing.action.popup.close();
  },
  _refill: function () {
    var reqData = this._makeRequestData();
    this._apiService.request(Tw.API_CMD.BFF_06_0007, reqData, { "Content-Type": "application/json" })
      .done($.proxy(this._success, this))
      .fail($.proxy(this._fail, this));
  },
  _makeRequestData: function () {
    var $target = this.$container.find('label.checked');
    var reqData = JSON.stringify({
      copnIsueNum: this._getLocalStorage('refillCouponNumber'),
      ofrRt: $target.data('ofrrt'),
      copnDtlClCd: $target.data('copndtlclcd')
    });
    return reqData;
  },
  _success: function (res) {
    this._closePopup();
    if (res.code === '00') {
      this._goLoad('/myt/refill/complete');
    }
  },
  _fail: function (err) {
    console.log('refill fail', err);
  },
  _getLocalStorage: function (key) {
    return localStorage.getItem(key);
  },
  _goLoad: function (url) {
    this.window.location.href = url;
  }
});
