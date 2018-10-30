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
  _init: function () {
    this.service_category = Tw.CUSTOMER_EMAIL_SERVICE_CATEGORY;
    this.quality_category = Tw.CUSTOMER_EMAIL_QUALITY_CATEGORY;
  },

  _cachedElement: function () {
    this.$select_service_depth1 = $('.fe-service_depth1');
    this.$select_service_depth2 = $('.fe-service_depth2');
    this.$select_quality_depth1 = $('.fe-quality_depth1');
  },

  _bindEvent: function () {
    this.$select_service_depth1.on('click', $.proxy(this._onClickService1Depth, this));
    this.$select_service_depth2.on('click', $.proxy(this._onClickService2Depth, this));
    this.$select_quality_depth1.on('click', $.proxy(this._onClickQuality1Depth, this));
    this.$container.on('click', '[data-service-depth1]', $.proxy(this._onSelectService1Depth, this));
    this.$container.on('click', '[data-service-depth2]', $.proxy(this._onSelectService2Depth, this));
    this.$container.on('click', '[data-quality-depth1]', $.proxy(this._onSelectQuality1Depth, this));
  },

  _onClickService1Depth: function () {
    var fnSelectLine = function (item) {
      return {
        value: item.title,
        option: this.$select_service_depth1.data('service-depth1') === item.title ? true : false,
        attr: 'data-service-depth1="' + item.title + '"'
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

  _onClickService2Depth: function () {
    var sDepth1Category = this.$select_service_depth1.data('service-depth1');

    if ( sDepth1Category ) {
      var fnSelectItem = function (item) {
        if ( item.title === sDepth1Category ) {
          return true;
        }
        return false;
      };

      var service2DepthList = $(this.service_category.filter($.proxy(fnSelectItem, this))).get(0).list;

      var fnSelectLine = function (item) {
        return {
          value: item.title,
          option: false,
          attr: 'data-service-depth2="' + item.title + '"'
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

  _onClickQuality1Depth: function () {
    var fnSelectLine = function (item) {
      return {
        value: item.title,
        option: true,
        attr: 'data-quality-depth1="' + item.title + '"'
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
    this._popupService.close();

    var sDepth1Value = $(e.currentTarget).data('service-depth1');
    this.$select_service_depth1.addClass('tx-bold');
    this.$select_service_depth1.text(sDepth1Value);
    this.$select_service_depth1.data('service-depth1', sDepth1Value);

    var sDepth2Category = this.$select_service_depth2.data('service-depth2');

    if ( sDepth2Category ) {
      // initialize depth2 category
      this.$select_service_depth2.removeClass('tx-bold');
      this.$select_service_depth2.text(Tw.CUSTOMER_EMAIL.SELECT_QUESTION);
      this.$select_service_depth2.data('service-depth2', null);
    }
  },

  _onSelectService2Depth: function (e) {
    this._popupService.close();
    var sDepth2Value = $(e.currentTarget).data('service-depth2');
    this.$select_service_depth2.addClass('tx-bold');
    this.$select_service_depth2.text(sDepth2Value);
    this.$select_service_depth2.data('service-depth2', sDepth2Value);

    this.$container.trigger('changeServiceTemplate', 'test');
  },

  _onSelectQuality1Depth: function (e) {
    this._popupService.close();
    var sDepth1Value = $(e.currentTarget).data('quality-depth1');
    this.$select_quality_depth1.addClass('tx-bold');
    this.$select_quality_depth1.text(sDepth1Value);
    this.$select_quality_depth1.data('quality-depth1', sDepth1Value);

    this.$container.trigger('changeQualityTemplate', 'test');
  }
};