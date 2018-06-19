Tw.MytUsageChildren = function () {
  this._apiService = new Tw.ApiService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MytUsageChildren.prototype = Object.create(Tw.View.prototype);
Tw.MytUsageChildren.prototype.constructor = Tw.MytUsageChildren;

Tw.MytUsageChildren.prototype = Object.assign(Tw.MytUsageChildren.prototype, {
  _init: function () {
    this._getData();
  },

  _cachedElement: function () {
    this.$container   = $('#wrap');
    this.$select_line = this.$container.find('#line_list');
    this.$mdl_name    = this.$container.find('#mdl_name');
    this.$descendats  = this.$container.find('.descendants');

    this.$wrap_tpl_product_detail = this.$container.find('#wrap_tpl_product_detail');
    this.$wrap_tpl_usage_voice    = this.$container.find('#wrap_tpl_usage_voice');
    this.$wrap_tpl_usage_sms      = this.$container.find('#wrap_tpl_usage_sms');
    this.$wrap_tpl_usage_etc      = this.$container.find('#wrap_tpl_usage_etc');
    this.tpl_product_detail       = _.template($('#tpl_product_detail').html());
    this.tpl_usage_voice          = _.template($('#tpl_usage_voice').html());
    this.tpl_usage_sms            = _.template($('#tpl_usage_sms').html());
    this.tpl_usage_etc            = _.template($('#tpl_usage_etc').html());
  },

  _bindEvent: function () {
    this.$select_line.on('change', $.proxy(this._changeLine, this));
  },

  _changeLine: function () {
    var $option         = this.$select_line.find(":selected");
    var mdl             = $option.data('mdl');
    var childSvcMgmtNum = this.$select_line.val();

    this.$mdl_name.text(mdl);
    this.$descendats.data('svcmgmtnum', childSvcMgmtNum);

    // TODO: get Fetch Data
    // this._getData();
  },

  _getData: function () {
    var childSvcMgmtNum = this.$descendats.data('svcmgmtnum');

    this._apiService.request(Tw.API_CMD.BFF_05_0001, {}, { "childSvcMgmtNum": childSvcMgmtNum } )
      .done($.proxy(this.onSuccessLoadData, this));
  },

  onSuccessLoadData: function (response) {
    this.data = response.result;
    this.render();
  },

  render: function () {
    var productDetail = {
      prodId: this.data.prodId,
      prodName: this.data.prodName,
      remainDate: Tw.DateHelper.getRemainDate()
    };

    var voiceDetail = _.map(this.data.voice, function (item) {
      return {
        skipName: item.skipName,
        showTotal: Tw.FormatHelper.convVoiceFormat(item.total),
        showUsed: Tw.FormatHelper.convVoiceFormat(item.used),
        showRemained: Tw.FormatHelper.convVoiceFormat(item.remained),
        userRatio: (item.remained / item.total) * 100,
        isUnlimited: isNaN(item.remained)
      }
    });

    var smsDetail = _.map(this.data.sms, function (item) {
      return {
        skipName: item.skipName,
        showTotal: Tw.FormatHelper.convVoiceFormat(item.total),
        showUsed: item.used,
        showRemained: item.remained,
        usedPrice: Tw.FormatHelper.convSmsPrice(item.used),
        remainedPrice: Tw.FormatHelper.convSmsPrice(item.remained),
        userRatio: (item.remained / item.total) * 100,
        isUnlimited: isNaN(item.remained)
      }
    });

    // template data binding
    this.$wrap_tpl_product_detail.html(this.tpl_product_detail(productDetail));
    this.$wrap_tpl_usage_voice.html(this.tpl_usage_voice({ voiceDetail: voiceDetail }));
    this.$wrap_tpl_usage_sms.html(this.tpl_usage_sms({ smsDetail: smsDetail }));
    // this.$wrap_tpl_usage_etc.html(this.tpl_usage_etc({}));
  }
});
