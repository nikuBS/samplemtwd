Tw.MytGiftComplete = function (rootEl) {
  this.$container = rootEl;
  //-----------------------------------------------------------[서비스 설정]
  this._apiService = new Tw.ApiService();
  //-----------------------------------------------------------[초기화 설정]
  this.$init();
};

Tw.MytGiftComplete.prototype = {

  $init: function () {
    var queryParams = Tw.UrlHelper.getQueryParams();
    this.processType = queryParams.processType;

    initHashNav(this._logHash); //해시네비 설정
    this._cachedElement();//타겟설정
    this._bindEvent();//이벤트 셋팅

    this._apiService
      .request(Tw.API_CMD.BFF_03_0003, { svcCtg: 'M' })
      .done($.proxy(this._apiComplete, this));

  },
  _logHash: function (hash) {
    switch ( hash.base ) {
      case '':
        console.info('hash.base null');
        $('.popup-page').empty().remove();
        break;
      case 'closepage' :
        location.hash = '';
        break;
      case 'DA_02_01_04_L01' :
        console.info('해시 : ', location.hash);
        break;
      default:
        console.info('default hash.base : ', hash.base);
    }
  },
  _cachedElement: function () {
    this.$btn_sendText = this.$container.find('[data-target="sendText"]');
  },
  _bindEvent: function () {
    this.$btn_sendText.off('click').on('click', $.proxy(this._sendTextPopEvt, this))
  },
  _apiComplete: function () {

  },
  _sendTextPopEvt: function () {
    console.info('팝업오픈 버튼클릭');
    location.hash = 'DA_02_01_04_L01';//해시 적용
    skt_landing.action.popup.open({
      hbs: 'DA_02_01_04_L01'// hbs의 파일명
    });
  }


};