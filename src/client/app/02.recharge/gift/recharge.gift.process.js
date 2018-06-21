/**
 * FileName: recharge.gift.process.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.06.22
 */

Tw.MytGiftProcess = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._nativeService = new Tw.NativeService();

  this._cachedElement();
  this._bindEvent();
  this.$init();
};

Tw.MytGiftProcess.prototype = {
  step: ['step1', 'step2', 'step3'],
  provider: {
    name: '',
    phone: '',
    dataQty: 0
  },
  receiver: {
    dataRemQty: 0
  },

  $init: function () {
    this.processType = location.href.substr(location.href.lastIndexOf('/') + 1).split('#')[0];
    initHashNav(this._logHash);

    //레이어팝업 오픈 함수 재정의
    frontend_fn.popup_open = $.proxy(this._popupOpen, this);

  },

  _logHash: function (hash) {
    switch ( hash.base ) {
      case 'step1':
        $('.step1').show();
        $('.step2').hide();
        $('.step3').hide();
        break;
      case 'step2' :
        $('.step1').hide();
        $('.step2').show();
        $('.step3').hide();
        break;
      case 'step3' :
        $('.step1').hide();
        $('.step2').hide();
        $('.step3').show();

        $('.popup-page').empty().remove();
        skt_landing.action.auto_scroll();

        break;
      default:
        console.info('default hash.base : ', hash.base);
    }
  },

  _cachedElement: function () {
    this.$btn_addr = this.$container.find('#btn-addr');
    this.$input_phone = this.$container.find('#inp_phone');
    this.$btn_go_home = this.$container.find('#btn_go_home');
    this.$btn_one_more = this.$container.find('#btn_one_more');
    this.$wrap_data_select = this.$container.find('.tube-list');
    this.$btn_send_gift = this.$container.find('#btn_send_gift');
    this.$btn_next_process = this.$container.find('#next_process');
    this.$btn_go_history = this.$container.find('#btn_go_history');
    this.$wrap_data_select = this.$container.find('#wrap_data_select');
  },

  _bindEvent: function () {
    this.$container.on('updateLineInfo', $.proxy(this.updateLineInfo, this));
    this.$input_phone.on('keyup', $.proxy(this.validateNumber, this));
    this.$btn_go_home.on('click', $.proxy(this.goHome, this));
    this.$btn_send_gift.on('click', $.proxy(this.nextProcess, this));
    this.$btn_next_process.on('click', $.proxy(this.nextProcess, this));
    this.$btn_one_more.on('click', $.proxy(this.goBasicStep, this));
    this.$btn_go_history.on('click', $.proxy(this.goHistory, this));
    this.$btn_addr.on('click', $.proxy(this._onClickBtnAddr, this));
    this.$container.on('click', '#wrap_request_history .history_item', $.proxy(this._onClickRequestHistoryItem, this));
    this.$container.on('click', '#wrap_family_history .history_item', $.proxy(this._onClickFamilyHistoryItem, this));
    this.$container.on('click', '.family-history-cancel', $.proxy(this._closePopup, this));
    this.$container.on('click', '.family-history-remove', $.proxy(this._removeFamilyHistoryItem, this));

    this.$container.on('click', '[data-target="sendText"]', $.proxy(this._sendTextPopEvt, this));
    $('body').on('click', '[data-target="sendTextBtn"]', $.proxy(this._sendTextEvt, this));
    $('body').on('click', '[data-target="sendTextCancelBtn"]', $.proxy(this._sendTextCancelEvt, this));

  },

  //-----------------------------------------------------[문자로 알리기]
  _popupOpen: function(str) {
    // console.info('frontend_fn.popup_open 재정의 22: ', str);
    // console.info('Tw.MytGiftProcess.prototype.provider 객체 : ', Tw.MytGiftProcess.prototype.provider);
    $('body').find('[data-target="msgName"]').prepend( Tw.MytGiftProcess.prototype.provider.name );
    $('body').find('[data-target="txTel"]').html( Tw.MytGiftProcess.prototype.provider.phone );
  },

  _sendTextPopEvt: function () {
    location.hash = 'DA_02_01_04_L01';
    skt_landing.action.popup.open({
      hbs: 'DA_02_01_04_L01',
      front: 'test'
    });
  },
  _sendTextEvt: function () {
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
    location.hash = 'step3';
  },
  _sendTextCancelEvt: function () {
    console.info('취소');
    location.hash = 'step3';
  },
  //-----------------------------------------------------[문자로 알리기 end]

  updateLineInfo: function (e, params) {
    this.lineInfo = params.lineInfo;
    this.requestRemainData();

    if ( this.processType == 'request' ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0010, {})
        .done($.proxy(this.onSuccessRequestHistory, this));
    }

    if ( this.processType == 'members' ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0018, {
        fromDt: Tw.DateHelper.getPastYearShortDate,
        toDt: Tw.DateHelper.getCurrentShortDate,
        giftType: 1
      }).done($.proxy(this.onSuccessMembersHistory, this));
    }

    if ( this.processType == 'family' ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0006, {})
        .done($.proxy(this.onSuccessFamilyHistory, this));
    }
  },

  onSuccessRequestHistory: function (res) {
    var result = res.result.slice(0, 3);

    if ( result.length != 0 ) {
      var tpl_request_history = Handlebars.compile($('#tpl_request_history').text());
      $('#wrap_request_history').html(tpl_request_history({ list: result }));
    }
  },

  onSuccessMembersHistory: function (res) {
    var result = res.result.slice(0, 3);

    if ( result.length != 0 ) {
      var tpl_members_history = Handlebars.compile($('#tpl_members_history').text());
      $('#wrap_members_history').html(tpl_members_history({ list: result }));
    }
  },

  onSuccessFamilyHistory: function (res) {
    var result = res.result.slice(0, 3);

    if ( result.length != 0 ) {
      var tpl_family_history = Handlebars.compile($('#tpl_family_history').text());
      $('#wrap_family_history').html(tpl_family_history({ list: result }));
    }
  },

  requestRemainData: function () {
    // this._apiService.request(Tw.API_CMD.BFF_06_0014, sample_params)
    //   .done(function () {
    //     alert('successs');
    //     // TODO : send Data
    //     // location.replace('/recharge/gift/complete');
    //   });

    // fetch data
    this.remainData = {
      code: '00',
      msg: 'success',
      result: {
        'reqCnt': '1',
        'giftRequestAgainYn': 'Y',
        'dataRemQty': '700'
      }
    }

    this.receiver.dataRemQty = this.remainData.result.dataRemQty;
    var tpl = Handlebars.compile($('#tpl_remain_data').text());
    $('.wrap_remain_data').html(tpl({ dataRemQty: this.receiver.dataRemQty }));

    this.setAvailableData();
  },

  setAvailableData: function () {
    this.$wrap_data_select.find('label').each(function (idx, item) {
      var $item = $(item);
      var itemValue = Number($item.data('value'));
      var remainValue = this.remainData.result.dataRemQty;
      if ( remainValue < itemValue ) {
        $item.addClass('disabled');
        $item.find('input').prop('disabled', true);
      }
    }.bind(this));
  },

  _onClickBtnAddr: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  _onContact: function (resp) {
    var params = resp.params;
    var phoneNumber = params.phoneNumber.replace(/-/gi, "");
    this.$input_phone.val(phoneNumber);
  },

  _onClickRequestHistoryItem: function (e) {
    var $target = $(e.currentTarget);
    this._isRequestByOpdtm = true;
    this._opDtm = $target.data('opdtm');

    this.$input_phone.val($target.data('phone'));
  },

  _onClickFamilyHistoryItem: function (e) {
    this.removeHistoryItemEvent = $(e.currentTarget);
    skt_landing.action.popup.open({
      'title': '데이터 자동 선물 안내',
      'close_bt': true,
      'title2': '선택하신 자동 선물 내역을 삭제하시겠습니까?',
      'bt_num': 'two',
      'type': [{
        class: 'bt-white1 family-history-cancel',
        txt: '취소'
      }, {
        class: 'bt-red1 family-history-remove',
        txt: '확인'
      }]
    });
  },

  _removeFamilyHistoryItem: function (e) {
    this._apiService.request(Tw.API_CMD.BFF_06_0005, JSON.stringify({ serNum: this.removeHistoryItemEvent.data('sernum') }))
      .done(function (res) {
        location.reload(true);
      }.bind(this));
  },

  _closePopup: function (e) {
    skt_landing.action.popup.close();
  },

  validateNumber: function (e) {
    Tw.InputHelper.inputNumberOnly(e.currentTarget);
  },

  insertPhoneNumber: function (e) {
    var phoneNumber = $(e.currentTarget).data('phone');
    this.$input_phone.val(phoneNumber);
  },

  resetInputPhone: function(){
    this.$input_phone.val('');
  },

  nextProcess: function () {
    if ( location.hash == '#step1' ) {
      this.validateStep1();
    }

    if ( location.hash == '#step2' ) {
      this.validateStep2()
    }
  },

  validateStep1: function () {
    if ( this.processType == 'request' ) {
      if ( this._isRequestByOpdtm ) {
        this._apiService.request(Tw.API_CMD.BFF_06_0012, { opDtm: this._opDtm })
          .done($.proxy(this.renderProvider, this));
      } else {
        this._apiService.request(Tw.API_CMD.BFF_06_0012, { charSvcNum: this.$input_phone.val() })
          .done($.proxy(this.renderProvider, this));
      }

    } else if ( this.processType == 'members' || this.processType == 'family' ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0008, { befrSvcNum: this.$input_phone.val() })
        .done($.proxy(this.renderProvider, this));
    }
  },

  validateStep2: function () {
    var nCurrentIndex = this.step.indexOf(location.hash.replace('#', ''));
    var sNextStep = this.step[nCurrentIndex + 1];
    var sNextUrl = location.href.replace(location.hash, '#' + sNextStep);
    var dataQty = $('#wrap_data_select').find('label.checked').data('value');

    if(!dataQty){
      // TODO : data select alert
      return;
    }

    if ( this.processType == 'request' ) {
      if ( this._isRequestByOpdtm ) {
        this._apiService.request(Tw.API_CMD.BFF_06_0013, { dataQty: dataQty, opDtm: this._opDtm })
          .done(function (res) {
            debugger;
            this._isRequestByOpdtm = false;
            this.resetInputPhone();
            this.provider.dataQty = dataQty;
            $('.wrap_data .num').text(dataQty);
            location.replace(sNextUrl);
          }.bind(this));
      } else {
        this._apiService.request(Tw.API_CMD.BFF_06_0013, { dataQty: dataQty, svcNum: this.provider.phone })
          .done(function (res) {
            this.provider.dataQty = dataQty;
            $('.wrap_data .num').text(dataQty);
            location.replace(sNextUrl);
          }.bind(this));
      }
    } else if ( this.processType == 'family' ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0004, JSON.stringify({ dataQty: dataQty, befrSvcNum: this.provider.phone }))
        .done(function (res) {
          if ( res.code == '00' ) {
            this.provider.dataQty = dataQty;
            $('.wrap_data .num').text(this.receiver.dataRemQty - dataQty);
            location.replace(sNextUrl);
          } else {
            skt_landing.action.popup.open({
              'title': '알림',
              'close_bt': true,
              'title2': res.orgDebugMessage,
              'bt_num': 'one',
              'type': [{
                class: 'bt-red1 family-history-cancel',
                txt: '확인'
              }]
            });
          }
        }.bind(this));
    } else if ( this.processType == 'members' ) {
      this.provider.dataQty = dataQty;

      $('.wrap_remain_data .num').text(Number(this.receiver.dataRemQty) - Number(this.provider.dataQty));
      $('.wrap_gift_data .num').text(this.provider.dataQty);
      location.replace(sNextUrl);
    }
  },

  renderProvider: function (res) {
    if ( res.code == "00" ) {
      this.provider.name = res.result.custName;
      this.provider.phone = this.$input_phone.val();

      var tpl = Handlebars.compile($('#tpl_targetInfo').text());
      $('.wrap_provider').html(tpl(this.provider));
      $('.tx-data em').text(this.receiver.dataRemQty + 'MB');

      var nCurrentIndex = this.step.indexOf(location.hash.replace('#', ''));
      var sNextStep = this.step[nCurrentIndex + 1];
      var sNextUrl = location.href.replace(location.hash, '#' + sNextStep);

      location.replace(sNextUrl);
    }
  },

  goHistory: function () {
    location.replace('/recharge/gift/history');
  },

  goBasicStep: function () {
    var sBasicStepUrl = location.href.replace('step3', 'step1');
    location.replace(sBasicStepUrl);
  },

  goHome: function () {
    location.replace('/home');
  }
}