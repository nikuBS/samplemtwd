Tw.RechargeGiftComplete = function (rootEl) {
  this.$container = rootEl;
  //-----------------------------------------------------------[서비스 설정]
  this._apiService = new Tw.ApiService();
  //-----------------------------------------------------------[초기화 설정]
  this.$init();
};

Tw.RechargeGiftComplete.prototype = {
    $init: function () {
        initHashNav(this._logHash); //해시네비 설정
        this._bindEvent();//이벤트 셋팅
    },
    _logHash: function (hash) {
        switch (hash.base) {
            case '':
                console.info('hash.base null');
                $('.popup-page').empty().remove();
                skt_landing.action.auto_scroll();
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
    _bindEvent: function () {
      this.$container.on('click', '[data-target="sendText"]', $.proxy(this._sendTextPopEvt, this));
      $('body').on('click', '[data-target="sendTextBtn"]', $.proxy(this._sendTextEvt, this));
      $('body').on('click', '[data-target="sendTextCancelBtn"]', $.proxy(this._sendTextCancelEvt, this));
    },
    _sendTextPopEvt: function () {
        location.hash = 'DA_02_01_04_L01';//해시 적용
        skt_landing.action.popup.open({
            hbs:'DA_02_01_04_L01'// hbs의 파일명
        });
    },
    _sendTextEvt: function () {
        console.info('문자 보내기');
        var befrSvcNum = '01012345678';
        var textarea_text = $('body').find('[data-target="textSendbox"]').val();

        this._apiService
        .request(Tw.API_CMD.BFF_06_0017, JSON.stringify({
            befrSvcNum: befrSvcNum,
            msg: textarea_text
        }))
        .done($.proxy(this._apiComplete, this));
    },
    _apiComplete: function (res) {
        console.info('res : ', res);
        location.hash = '';
    },
    _sendTextCancelEvt: function() {
        console.info('취소');
        location.hash = '';
    }
};