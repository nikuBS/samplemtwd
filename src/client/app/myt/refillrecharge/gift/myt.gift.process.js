Tw.MytGiftProcess = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._cachedElement();
  this._bindEvent();
  this.$init();
}

Tw.MytGiftProcess.prototype = {
  $init: function () {
    var queryParams = Tw.UrlHelper.getQueryParams();
    this.processType = queryParams.processType;
  },

  _cachedElement: function () {
    this.$btn_next_process = this.$container.find('#next_process');
    this.$btn_send_gift = this.$container.find('#btn_send_gift');
    this.$input_phone = this.$container.find('#inp_phone');
    this.$wrap_data_select = this.$container.find('.tube-list');
  },

  _bindEvent: function () {
    this.$btn_send_gift.on('click', $.proxy(this.sendGift, this));
    this.$btn_next_process.on('click', $.proxy(this.nextProcess, this));
    this.$container.on('click', '.recent_item', $.proxy(this.insertPhoneNumber, this));
    $(document).on('updateLineInfo', $.proxy(this.updateLineInfo, this));
  },

  updateLineInfo: function (e, lineInfo) {
    this.currentLine = lineInfo;

    this.requestRemainData();
  },

  requestRemainData: function () {
    this.remainData = {
      code: '00',
      msg: 'success',
      result: {
        'reqCnt': '1',
        'giftRequestAgainYn': 'Y',
        'dataRemQty': '700'
      }
    }

    this.$wrap_data_select.find('label').each(function (idx, item) {
      var $item = $(item);
      var itemValue = Number($item.data('value'));
      var remainValue = this.remainData.result.dataRemQty;
      if ( remainValue < itemValue ) {
        $item.addClass('disabled');
        $item.find('input').prop('disabled', true);
      }
    }.bind(this));

    // this._apiService.request(Tw.API_CMD.BFF_06_0014, sample_params)
    //   .done(function () {
    //     alert('successs');
    //     // TODO : send Data
    //     // location.replace('/myt/gift/complete');
    //   });
  },

  insertPhoneNumber: function (e) {
    var phoneNumber = $(e.currentTarget).data('phone');

    this.$input_phone.val(phoneNumber);
  },

  nextProcess: function () {
    $('.step_1').hide();
    $('.step_2').show();
  },

  sendGift: function () {
    var sample_params = {
      befrSvcNum: '01029482912',
      dataQty: String(this.$wrap_data_select.find('.checked').data('value')),
      svcMgmtNum: this.currentLine.svcMgmtNum
    }

    location.replace('/myt/gift/complete');

    // this._apiService.request(Tw.API_CMD.BFF_06_0016, sample_params)
    //   .done(function () {
    //     alert('successs');
    //     // TODO : send Data
    //     // location.replace('/myt/gift/complete');
    //   });
  }
}