Tw.MytGiftProcess = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._nativeService = new Tw.NativeService();

  this._cachedElement();
  this._bindEvent();
  this.$init();
}

Tw.MytGiftProcess.prototype = {
  step: ['step1', 'step2', 'step3'],
  provider: {
    name: '',
    phone: '',
    dataQty: ''
  },

  $init: function () {
    initHashNav(this._logHash);
    this.processType = location.href.substr(location.href.lastIndexOf('/') + 1).split('#')[0];
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
        break;
      default:
        console.info('default hash.base : ', hash.base);
    }
  },

  _cachedElement: function () {
    this.$input_phone = this.$container.find('#inp_phone');
    this.$btn_go_home = this.$container.find('#btn_go_home');
    this.$wrap_data_select = this.$container.find('.tube-list');
    this.$btn_send_gift = this.$container.find('#btn_send_gift');
    this.$btn_next_process = this.$container.find('#next_process');
    this.$btn_one_more = this.$container.find('#btn_one_more');
    this.$btn_go_history = this.$container.find('#btn_go_history');
    this.$btn_addr = this.$container.find('#btn-addr');
    this.$wrap_data_select = this.$container.find('#wrap_data_select');
  },

  _bindEvent: function () {
    this.$input_phone.on('keyup', $.proxy(this.validateNumber, this));
    this.$btn_go_home.on('click', $.proxy(this.goHome, this));
    this.$btn_send_gift.on('click', $.proxy(this.nextProcess, this));
    this.$btn_next_process.on('click', $.proxy(this.nextProcess, this));
    this.$btn_one_more.on('click', $.proxy(this.goBasicStep, this));
    this.$container.on('updateLineInfo', $.proxy(this.updateLineInfo, this));
    this.$container.on('click', '.recent_item', $.proxy(this.insertPhoneNumber, this));
    this.$btn_go_history.on('click', $.proxy(this.goHistory, this));
    this.$btn_addr.on('click', $.proxy(this._onClickBtnAddr, this));
  },


  updateLineInfo: function (e, params) {
    this.lineInfo = params.lineInfo;
    this.requestRemainData();
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
    var params = JSON.parse(resp.params);
    var phoneNumber = params.phoneNumber.replace(/-/gi, "");
    this.$input_phone.val(phoneNumber);
  },

  validateNumber: function (e) {
    Tw.InputHelper.inputNumberOnly(e.currentTarget);
  },

  insertPhoneNumber: function (e) {
    var phoneNumber = $(e.currentTarget).data('phone');

    this.$input_phone.val(phoneNumber);
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
      this._apiService.request(Tw.API_CMD.BFF_06_0012, { charSvcNum: this.$input_phone.val() })
        .done($.proxy(this.renderProvider, this));

    } else if ( this.processType == 'member' || this.processType == 'family' ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0008, { befrSvcNum: this.$input_phone.val() })
        .done($.proxy(this.renderProvider, this));

    }
  },

  validateStep2: function () {
    var nCurrentIndex = this.step.indexOf(location.hash.replace('#', ''));
    var sNextStep = this.step[nCurrentIndex + 1];
    var sNextUrl = location.href.replace(location.hash, '#' + sNextStep);

    var dataQty = $('#wrap_data_select').find('label.checked').data('value');

    if ( this.processType == 'request' ) {
      if ( dataQty ) {
        this._apiService.request(Tw.API_CMD.BFF_06_0013, { dataQty: dataQty, svcNum: this.provider.phone })
          .done(function (res) {
            this.provider.dataQty = dataQty;
            $('.wrap_data .num').text(dataQty);
            location.replace(sNextUrl);
          }.bind(this));
      }
    } else {
      location.replace(sNextUrl);
    }
  },

  renderProvider: function (res) {
    this.provider.name = res.result.custName;
    this.provider.phone = this.$input_phone.val();

    var tpl = Handlebars.compile($('#tpl_targetInfo').text());
    $('.wrap_provider').html(tpl(this.provider));

    var nCurrentIndex = this.step.indexOf(location.hash.replace('#', ''));
    var sNextStep = this.step[nCurrentIndex + 1];
    var sNextUrl = location.href.replace(location.hash, '#' + sNextStep);

    location.replace(sNextUrl);
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