/**
 * FileName: customer.email.category.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.26
 */

Tw.CustomerEmailCategory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailCategory.prototype = {
  service: { depth1: 'CELL', depth2: '' },
  quality: { depth1: '' },

  _init: function () {
    this.service_category = Tw.CUSTOMER_EMAIL_SERVICE_CATEGORY;
    this.quality_category = Tw.CUSTOMER_EMAIL_QUALITY_CATEGORY;

    this._apiService.request(Tw.API_CMD.BFF_08_0010, {})
      .done($.proxy(this._onLoadQuestionList, this));
  },

  _cachedElement: function () {
    this.$select_service_depth1 = $('.fe-service_depth1');
    this.$select_service_depth2 = $('.fe-service_depth2');
    this.$select_quality_depth1 = $('.fe-quality_depth1');
    this.$wrap_tpl_faq = $('.fe-btn_faq');
    this.$wrap_tpl_service = this.$container.find('.fe-wrap_tpl_service');
    this.$wrap_tpl_quality = this.$container.find('.fe-wrap_tpl_quality');
  },

  _bindEvent: function () {
    this.$select_service_depth1.on('click', $.proxy(this._onClickService1Depth, this));
    this.$select_service_depth2.on('click', $.proxy(this._onClickService2Depth, this));
    this.$select_quality_depth1.on('click', $.proxy(this._onClickQuality1Depth, this));
    this.$wrap_tpl_service.on('click', '[data-service-depth1]', $.proxy(this._onSelectService1Depth, this));
    this.$wrap_tpl_service.on('click', '[data-service-depth2]', $.proxy(this._onSelectService2Depth, this));
    this.$wrap_tpl_quality.on('click', '[data-quality-depth1]', $.proxy(this._onSelectQuality1Depth, this));
    this.$container.on('getCategory', $.proxy(this._getCurrentCategory, this));
    this.$container.on('getTabIndex', $.proxy(this._getCurrentTab, this));
  },

  _onLoadQuestionList: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.category = res.result;
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _onClickService1Depth: function (e) {
    e.stopPropagation();
    e.preventDefault();

    var fnSelectLine = function (item) {
      return {
        value: item.title,
        option: this.service.depth1 === item.category ? 'checked' : '',
        attr: 'data-service-depth1="' + item.category + '"'
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.CUSTOMER_EMAIL.SELECT_SERVICE,
        data: [{ list: this.service_category.map($.proxy(fnSelectLine, this)) }]
      },
      null,
      null
    );
  },

  _onClickService2Depth: function (e) {
    e.stopPropagation();
    e.preventDefault();

    var sDepth1Category = this.$select_service_depth1.data('service-depth1');

    if ( sDepth1Category ) {
      var service2DepthList = this.category[sDepth1Category];

      var fnSelectLine = function (item) {
        return {
          value: item.ctgNm,
          option: this.service.depth2 === item.ofrCtgSeq ? 'checked' : '',
          attr: 'data-service-depth2="' + item.ofrCtgSeq + '"'
        };
      };

      this._popupService.open({
          hbs: 'actionsheet_select_a_type',
          layer: true,
          title: Tw.CUSTOMER_EMAIL.SELECT_SERVICE,
          data: [{
            list: service2DepthList.map($.proxy(fnSelectLine, this))
          }]
        },
        null,
        null
      );
    }
  },

  _onClickQuality1Depth: function (e) {
    e.stopPropagation();
    e.preventDefault();

    var fnSelectLine = function (item) {
      return {
        value: item.title,
        option: this.quality.depth1 === item.category ? 'checked' : '',
        attr: 'data-quality-depth1="' + item.category + '"'
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.CUSTOMER_EMAIL.SELECT_SERVICE,
        data: [{ list: this.quality_category.map($.proxy(fnSelectLine, this)) }]
      },
      null,
      null
    );
  },

  _onSelectService1Depth: function (e) {
    e.stopPropagation();
    e.preventDefault();

    this._popupService.close();

    var sDepth1Value = $(e.currentTarget).data('service-depth1').toString();
    var sDepth1Text = $(e.currentTarget).text().trim();
    this.$select_service_depth1.addClass('tx-bold');
    this.$select_service_depth1.text(sDepth1Text);
    this.$select_service_depth1.data('service-depth1', sDepth1Value);
    this.service.depth1 = sDepth1Value;

    if ( sDepth1Value === 'CELL' || sDepth1Value === 'INTERNET' ) {
      this.$wrap_tpl_faq.show();
    } else {
      this.$wrap_tpl_faq.hide();
    }

    var sDepth2Category = this.$select_service_depth2.data('service-depth2');

    if ( sDepth2Category ) {
      // initialize depth2 category
      this.$select_service_depth2.removeClass('tx-bold');
      this.$select_service_depth2.text(Tw.CUSTOMER_EMAIL.SELECT_QUESTION);
      this.$select_service_depth2.data('service-depth2', null);
      this.service.depth2 = '';
    }
  },

  _onSelectService2Depth: function (e) {
    e.stopPropagation();
    e.preventDefault();

    this._popupService.close();

    var sDepth2Value = $(e.currentTarget).data('service-depth2').toString();
    var sDepth2Text = $(e.currentTarget).text().trim();
    this.$select_service_depth2.addClass('tx-bold');
    this.$select_service_depth2.text(sDepth2Text);
    this.$select_service_depth2.data('service-depth2', sDepth2Value);
    this.service.depth2 = sDepth2Value;

    // this.$container.trigger('changeServiceTemplate', this.service);
  },

  _onSelectQuality1Depth: function (e) {
    e.stopPropagation();
    e.preventDefault();

    this._popupService.close();

    var sDepth1Value = $(e.currentTarget).data('quality-depth1');
    var sDepth1Text = $(e.currentTarget).text().trim();
    this.$select_quality_depth1.addClass('tx-bold');
    this.$select_quality_depth1.text(sDepth1Text);
    this.$select_quality_depth1.data('quality-depth1', sDepth1Value);
    this.quality.depth1 = sDepth1Value;

    // this.$container.trigger('changeQualityTemplate', this.quality);
  },

  _getCurrentCategory: function () {
    var htCategory = {
      service: this.service,
      quality: this.quality
    };

    return htCategory;
  },

  _getCurrentTab: function () {
    return $('[role=tablist]').find('[aria-selected=true]').index();
  }
};