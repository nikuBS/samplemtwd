Tw.MytGiftRequestProcess = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._nativeService = new Tw.NativeService();

  this._cachedElement();
  this._bindEvent();
  this.$init();
}

Tw.MytGiftRequestProcess.prototype = {
  step: ['step1', 'step2', 'step3'],

  $init: function () {
    initHashNav(this._logHash);
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
    this.$input_phone = this.$container.find('#inp_phone');
  },

  _bindEvent: function () {
    this.$input_phone.on('keyup', $.proxy(this.validateNumber, this));
    this.$btn_go_home.on('click', $.proxy(this.goHome, this));
    this.$btn_send_gift.on('click', $.proxy(this.sendGift, this));
    this.$btn_next_process.on('click', $.proxy(this.nextProcess, this));
    this.$btn_one_more.on('click', $.proxy(this.goBasicStep, this));
    this.$container.on('updateLineInfo', $.proxy(this.updateLineInfo, this));
    this.$container.on('click', '.recent_item', $.proxy(this.insertPhoneNumber, this));
    this.$btn_go_history.on('click', $.proxy(this.goHistory, this));
  },


  updateLineInfo: function (e, params) {
    this.currentLine = params.lineInfo;
    this.requestRemainData();
  },

  requestRemainData: function () {
    // this._apiService.request(Tw.API_CMD.BFF_06_0014, sample_params)
    //   .done(function () {
    //     alert('successs');
    //     // TODO : send Data
    //     // location.replace('/myt/gift/complete');
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

  validateNumber: function (e) {
    Tw.InputHelper.inputNumberOnly(e.currentTarget);
  },

  insertPhoneNumber: function (e) {
    var phoneNumber = $(e.currentTarget).data('phone');

    this.$input_phone.val(phoneNumber);
  },

  nextProcess: function () {
    var sCurrentStep = location.hash;
    var nCurrentIndex = this.step.indexOf(sCurrentStep.replace('#', ''));
    var sNextStep = this.step[nCurrentIndex + 1];
    var sNextUrl = location.href.replace(sCurrentStep, '#' + sNextStep);

    location.replace(sNextUrl);
  },

  sendGift: function () {
    // var sample_params = {
    //   befrSvcNum: '01029482912',
    //   dataQty: String(this.$wrap_data_select.find('.checked').data('value')),
    //   svcMgmtNum: this.currentLine.svcMgmtNum
    // }

    // if success,
    this.nextProcess();

    // this._apiService.request(Tw.API_CMD.BFF_06_0016, sample_params)
    //   .done(function () {
    //     alert('successs');
    //     // TODO : send Data
    //     // location.replace('/myt/gift/complete');
    //   });
  },

  goHistory: function () {
    location.replace('/myt/gift/history');
  },

  goBasicStep: function () {
    var sBasicStepUrl = location.href.replace('step3', 'step1');

    location.replace(sBasicStepUrl);
  },

  goHome: function () {
    location.replace('/home');
  }
}