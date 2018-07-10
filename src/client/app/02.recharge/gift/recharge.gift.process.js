/**
 * FileName: recharge.gift.process.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.06.22
 */

Tw.RechargeGiftProcess = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this.history = new Tw.HistoryService(rootEl);
  this.history.init('hash');

  this._cachedElement();
  this._bindEvent();
  this.$init();
};

Tw.RechargeGiftProcess.prototype = {
  step: ['#step1', '#step2', '#step3'],
  provider: {},
  receiver: {},
  $init: function () {
    this.processType = window.location.pathname.split('/').reverse()[0];
  },

  _cachedElement: function () {
    this.$btn_addr = this.$container.find('#btn-addr');
    this.$input_phone = this.$container.find('#inp_phone');
    this.$btn_go_home = this.$container.find('#btn_go_home');
    this.$btn_one_more = this.$container.find('#btn_one_more');
    this.$btn_send_gift = this.$container.find('#btn_send_gift');
    this.$btn_go_history = this.$container.find('#btn_go_history');
    this.$btn_next_process = this.$container.find('#next_process');
    this.$wrap_data_select = this.$container.find('#wrap_data_select');
  },

  _bindEvent: function () {
    this.$btn_go_home.on('click', $.proxy(this.goHome, this));
    this.$btn_addr.on('click', $.proxy(this._onClickBtnAddr, this));
    this.$btn_one_more.on('click', $.proxy(this.goBasicStep, this));
    this.$btn_go_history.on('click', $.proxy(this.goHistory, this));
    this.$btn_send_gift.on('click', $.proxy(this.nextProcess, this));
    this.$input_phone.on('keyup', $.proxy(this.validateNumber, this));
    this.$btn_next_process.on('click', $.proxy(this.nextProcess, this));
    this.$container.on('updateLineInfo', $.proxy(this.updateLineInfo, this));
    this.$container.on('click', '[data-target="sendText"]', $.proxy(this._sendTextPopEvt, this));
    this.$container.on('click', '[data-target="sendTextBtn"]', $.proxy(this._sendTextEvt, this));
    this.$container.on('click', '#wrap_request_history .history_item', $.proxy(this._onClickRequestHistoryItem, this));
    this.$container.on('click', '#wrap_family_history .history_item', $.proxy(this._onClickFamilyHistoryItem, this));
    this.$container.on('click', '#wrap_members_history .history_item', $.proxy(this._onClickMembersHistoryItem, this));
  },

  _onClickBtnAddr: function () {
    Tw.Native.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  _onContact: function (resp) {
    var params = resp.params;
    var phoneNumber = params.phoneNumber.replace(/-/gi, '');
    this.$input_phone.val(phoneNumber);
  },

  _sendTextPopEvt: function () {
    this._popupService.open({
      hbs: 'DA_02_01_04_L01'// hbs의 파일명
    });

    setTimeout(function () {
      var $txTel = $('em.tx-tel').text(Tw.FormatHelper.conTelFormatWithDash(this.provider.phone));
      this.$container.find('.popup-page .msg-name').html(this.provider.name);
      this.$container.find('.popup-page .msg-name').append($txTel);
    }.bind(this), 50);
  },

  _sendTextEvt: function () {
    var befrSvcNum = this.provider.phone;
    var textarea_text = $('body').find('[data-target="textSendbox"]').val();

    this._apiService
      .request(Tw.API_CMD.BFF_06_0017, JSON.stringify({
        befrSvcNum: befrSvcNum,
        msg: textarea_text
      }))
      .done(function () {
        // location.hash = 'step3';
      });
  },

  updateLineInfo: function (e, params) {
    this.lineInfo = params.lineInfo;
    this.requestRemainData();

    if ( this.processType === 'request' ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0010, {})
        .done($.proxy(this.onSuccessRequestHistory, this));
    }

    if ( this.processType === 'members' ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0018, {
        fromDt: Tw.DateHelper.getPastYearShortDate,
        toDt: Tw.DateHelper.getCurrentShortDate,
        giftType: 1
      }).done($.proxy(this.onSuccessMembersHistory, this));
    }

    if ( this.processType === 'family' ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0006, {})
        .done($.proxy(this.onSuccessFamilyHistory, this));
    }
  },

  onSuccessRequestHistory: function (res) {
    var result = res.result.slice(0, 3);
    if ( result.length !== 0 ) {
      var tpl_request_history = Handlebars.compile($('#tpl_request_history').text());
      $('#wrap_request_history').html(tpl_request_history({ list: result }));
    }
  },

  onSuccessMembersHistory: function (res) {
    var result = res.result.slice(0, 3);
    if ( result.length !== 0 ) {
      var tpl_members_history = Handlebars.compile($('#tpl_members_history').text());
      $('#wrap_members_history').html(tpl_members_history({ list: result }));
    }
  },

  onSuccessFamilyHistory: function (res) {
    var result = res.result.slice(0, 3);
    if ( result.length !== 0 ) {
      var tpl_family_history = Handlebars.compile($('#tpl_family_history').text());
      $('#wrap_family_history').html(tpl_family_history({ list: result }));
    }
  },

  requestRemainData: function () {
    // TODO: get remain data
    var response = {
      code: '00',
      msg: 'success',
      result: {
        reqCnt: '1',
        giftRequestAgainYn: 'Y',
        dataRemQty: '700'
      }
    };

    this.receiver.dataRemQty = response.result.dataRemQty;
    var tpl = Handlebars.compile($('#tpl_remain_data').text());
    $('.wrap_remain_data').html(tpl({ dataRemQty: this.receiver.dataRemQty }));

    this.setAvailableData();
  },

  setAvailableData: function () {
    this.$wrap_data_select.find('label').each(function (idx, item) {
      var $item = $(item);
      var itemValue = Number($item.data('value'));
      var remainValue = this.receiver.dataRemQty;
      if ( remainValue < itemValue ) {
        $item.addClass('disabled');
        $item.find('input').prop('disabled', true);
      }
    }.bind(this));
  },

  _onClickRequestHistoryItem: function (e) {
    var $target = $(e.currentTarget);
    this._isRequestByOpdtm = true;
    this._opDtm = $target.data('opdtm');

    this.$input_phone.val($target.data('phone'));
  },

  _onClickFamilyHistoryItem: function (e) {
    this.removeHistoryItemEvent = $(e.currentTarget);
    this._popupService.openConfirm(Tw.POPUP_TITLE.GIFT_FAMILY_INFO, Tw.MSG_RECHARGE.GIFT_FAMILY_L07, '', null, $.proxy(this._removeFamilyHistoryItem, this));
  },

  _onClickMembersHistoryItem: function (e) {
    var $target = $(e.currentTarget);
    this._isRequestByOpdtm = true;
    this._opDtm = $target.data('opdtm');
    this.provider.name = $target.data('name');
    this.provider.phone = $target.data('phone');

    var tpl = Handlebars.compile($('#tpl_targetInfo').text());
    $('.wrap_provider').html(tpl(this.provider));
    $('.tx-data em').text(this.receiver.dataRemQty + 'MB');

    this.$input_phone.val($target.data('phone'));
  },

  _removeFamilyHistoryItem: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0005, JSON.stringify({ serNum: this.removeHistoryItemEvent.data('sernum') }))
      .done(function () {
        location.reload(true);
      }.bind(this));
  },

  validateNumber: function (e) {
    Tw.InputHelper.inputNumberOnly(e.currentTarget);
  },

  insertPhoneNumber: function (e) {
    var phoneNumber = $(e.currentTarget).data('phone');
    this.$input_phone.val(phoneNumber);
  },

  resetInputPhone: function () {
    this.$input_phone.val('');
  },

  nextProcess: function () {
    if ( location.hash === '#step1' ) {
      this.validateStep1();
    } else if ( location.hash === '#step2' ) {
      this.validateStep2();
    }
  },

  validateStep1: function () {
    switch ( this.processType ) {
      case 'members':
        if ( this._isRequestByOpdtm ) {
          location.replace(this.getNextStepUrl());
        } else {
          this._apiService.request(Tw.API_CMD.BFF_06_0008, { befrSvcNum: this.$input_phone.val() })
            .done($.proxy(this.renderProvider, this));
        }
        break;
      case 'family':
        if ( this._isRequestByOpdtm ) {
          location.replace(this.getNextStepUrl());
        } else {
          this._apiService.request(Tw.API_CMD.BFF_06_0008, { befrSvcNum: this.$input_phone.val() })
            .done($.proxy(this.renderProvider, this));
        }
        break;
      case 'request':
        if ( this._isRequestByOpdtm ) {
          this._apiService.request(Tw.API_CMD.BFF_06_0012, { opDtm: this._opDtm })
            .done($.proxy(this.renderProvider, this));
        } else {
          this._apiService.request(Tw.API_CMD.BFF_06_0012, { charSvcNum: this.$input_phone.val() })
            .done($.proxy(this.renderProvider, this));
        }
        break;
    }
  },

  validateStep2: function () {
    var dataQty = $('#wrap_data_select').find('label.checked').data('value');
    this.provider.dataQty = dataQty;

    if ( !dataQty ) {
      this.onFailStep({ orgDebugMessage: '데이터를 선택해주세요.' });
      return;
    }

    switch ( this.processType ) {
      case 'members':
        // TODO : not implemented server process
        var $remainData = $('.wrap_remain_data .num');
        var $giftData = $('.wrap_gift_data .num');
        var $selectData = $('.wrap_data .num');

        $remainData.text(Number(this.receiver.dataRemQty) - Number(this.provider.dataQty));
        $giftData.text(this.provider.dataQty);
        $selectData.text(dataQty);

        location.replace(this.getNextStepUrl());
        break;
      case 'family':
        this._apiService.request(Tw.API_CMD.BFF_06_0004, JSON.stringify({ dataQty: dataQty, befrSvcNum: this.provider.phone }))
          .done(function (res) {
            if ( res.code === Tw.API_CODE.CODE_00 ) {
              this.resetData();
              location.replace(this.getNextStepUrl());
            } else {
              this.onFailStep(res);
            }
          }.bind(this));
        break;
      case 'request':
        if ( this._isRequestByOpdtm ) {
          this._apiService.request(Tw.API_CMD.BFF_06_0013, { dataQty: dataQty, opDtm: this._opDtm })
            .done(function (res) {
              if ( res.code === Tw.API_CODE.CODE_00 ) {
                this.resetData();
                location.replace(this.getNextStepUrl());
              } else {
                this.onFailStep(res);
              }
            }.bind(this));
        } else {
          this._apiService.request(Tw.API_CMD.BFF_06_0013, { dataQty: dataQty, svcNum: this.provider.phone })
            .done(function (res) {
              if ( res.code === Tw.API_CODE.CODE_00 ) {
                this.resetData();
                location.replace(this.getNextStepUrl());
              } else {
                this.onFailStep(res);
              }
            }.bind(this));
        }
        break;
    }
  },

  renderProvider: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.provider.name = res.result.custName;
      this.provider.phone = this.$input_phone.val();

      var tpl = Handlebars.compile($('#tpl_targetInfo').text());
      $('.wrap_provider').html(tpl(this.provider));
      $('.tx-data em').text(this.receiver.dataRemQty + 'MB');

      location.replace(this.getNextStepUrl());
    } else {
      this.onFailStep(res);
    }
  },

  resetData: function () {
    this.provider = {};
    this.receiver = {};
    this._opDtm = '';
    this._isRequestByOpdtm = false;
    this.resetInputPhone();
  },

  getNextStepUrl: function () {
    var nCurrentIndex = this.step.indexOf(location.hash);
    var sNextStep = this.step[nCurrentIndex + 1];
    var sNextUrl = location.href.replace(location.hash, sNextStep);

    return sNextUrl;
  },

  onFailStep: function (res) {
    this._popupService.openAlert(res.orgDebugMessage);
  },

  goHistory: function () {
    if ( this.processType === 'request' ) {
      location.replace('/recharge/gift/history#request');
    } else {
      location.replace('/recharge/gift/history#present');
    }
  },

  goBasicStep: function () {
    location.replace(location.href.replace('step3', 'step1'));
    location.reload(true);
  },

  goHome: function () {
    location.replace('/home');
  }
};
