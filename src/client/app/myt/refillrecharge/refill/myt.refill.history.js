Tw.MyTRefillHistory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._cachedElement();
  this._bindEvent();
  this.TYPE = {
    MY: 'my',
    SENT: 'sent',
    RECEIVED: 'received'
  }
  this.NUM_OF_ITEMS = 20;
};

Tw.MyTRefillHistory.prototype = {
  _cachedElement: function () {
    this.$tabLinker = this.$container.find('.tab-linker a');
    this.$tabContentMy = this.$container.find('.tab-contents #my .inner');
    this.$tabContentSent = this.$container.find('.tab-contents #sent .inner');
    this.$tabContentReceived = this.$container.find('.tab-contents #received .inner');
  },

  _bindEvent: function () {
    this.$tabLinker.off('click').on('click', $.proxy(this._onTabChanged, this));
    $(document).on('ready', $.proxy(this._setInitialTab, this));
  },

  _setInitialTab: function () {
    var type = window.location.hash || '#' + this.TYPE.MY;
    this.$tabLinker.filter('[href="' + type + '"]').click();
  },

  _onTabChanged: function (e) {
    var hash = e.target.hash;
    window.location.hash = hash;
    this._setActiveTab(hash);
  },

  _setActiveTab: function (type) {
    type = type.replace('#', '').toLowerCase();
    function error() {
      //TODO alert the failure result
      console.error('[ERROR] An error occurred while requesting API');
    }

    switch ( type ) {
      case this.TYPE.MY:
        if ( typeof this._myRefills === 'undefined' ) {
          this._apiService
            .request(Tw.API_CMD.BFF_06_0002, {})
            .done($.proxy(this._onResetHistoryData, this, this.TYPE.MY))
            .fail(error);
        }
        break;
      case this.TYPE.SENT:
        if ( typeof this._sentRefills === 'undefined' ) {
          this._apiService
            .request(Tw.API_CMD.BFF_06_0003, { giftType: 1 })
            .done($.proxy(this._onResetHistoryData, this, this.TYPE.SENT))
            .fail(error);
        }
        break;
      case this.TYPE.RECEIVED:
        if ( typeof this._receivedRefills === 'undefined' ) {
          this._apiService
            .request(Tw.API_CMD.BFF_06_0003, { giftType: 2 })
            .done($.proxy(this._onResetHistoryData, this, this.TYPE.RECEIVED))
            .fail(error);
        }
        break;
    }
  },

  _setTransferable: function (type, resp) {
    var transferable = (resp.result.condition.transferableCopnCnt > 0 ) && resp.result.option && (resp.result.option.length > 0);
    this._initTabContent(type, this._sentRefills, this.$tabContentSent, { transferable: transferable });
  },

  _onClickMore: function (e) {
    e.preventDefault();
    var elTarget = e.target;
    var type = elTarget.getAttribute('data-type');
    var leftItems = elTarget.getAttribute('data-left-items');
    var items = null, $targetTab = null, template = null, output = null;
    switch ( type ) {
      case this.TYPE.MY:
        items = this._myRefills;
        $targetTab = this.$tabContentMy;
        template = Handlebars.compile('{{>myItems}}');
        break;
      case this.TYPE.SENT:
        items = this._sentRefills;
        $targetTab = this.$tabContentSent;
        template = Handlebars.compile('{{>sentItems}}');
        break;
      case this.TYPE.RECEIVED:
        items = this._receivedRefills;
        $targetTab = this.$tabContentReceived;
        template = Handlebars.compile('{{>receivedItems}}');
        break;
      default:
        return null;
    }

    var idxFrom = items.length - leftItems;
    output = template({ items: items.slice(idxFrom, idxFrom + this.NUM_OF_ITEMS) });
    $targetTab.find('ul').append(output);
    leftItems = leftItems - this.NUM_OF_ITEMS;
    if ( leftItems > 0 ) {
      elTarget.setAttribute('data-left-items', leftItems);
      elTarget.innerText = elTarget.innerText.replace(/\((.+?)\)/, "(" + leftItems + ")");
    } else {
      elTarget.style.display = 'none';
    }
  },

  _onResetHistoryData: function (type, resp) {
    switch ( type ) {
      case this.TYPE.MY:
        this._myRefills = resp.result;
        this._myRefills.map(
          function (data) {
            data.copnUseDt = Tw.DateHelper.getShortDateNoDot(data.copnUseDt);
            data.copnDtlClCd = ['AAA10', 'AAA30'].indexOf(data.copnDtlClCd) > -1 ? 'tx-data': 'tx-voice'
          });
        this._initTabContent(type, this._myRefills, this.$tabContentMy);
        break;
      case this.TYPE.SENT:
        this._sentRefills = resp.result;

        if ( this._sentRefills.length < 1 ) {
          this._apiService
            .request(Tw.API_CMD.BFF_06_0009)
            .done($.proxy(this._setTransferable, this, this.TYPE.SENT))
            .fail(function(){console.log('[ERROR] An error occurred while requesting API')});
        } else {
          this._sentRefills.map(
            function (data) {
              data.usePsblStaDt = Tw.DateHelper.getShortDateNoDot(data.usePsblStaDt);
              data.usePsblEndDt = Tw.DateHelper.getShortDateNoDot(data.usePsblEndDt);
              data.copnOpDt = Tw.DateHelper.getShortDateNoDot(data.copnOpDt);
            });
          this._initTabContent(type, this._sentRefills, this.$tabContentSent);
        }
        break;
      case this.TYPE.RECEIVED:
        this._receivedRefills = resp.result;
        this._receivedRefills.map(
          function (data) {
            data.usePsblStaDt = Tw.DateHelper.getShortDateNoDot(data.usePsblStaDt);
            data.usePsblEndDt = Tw.DateHelper.getShortDateNoDot(data.usePsblEndDt);
            data.copnOpDt = Tw.DateHelper.getShortDateNoDot(data.copnOpDt);
          });
        this._initTabContent(type, this._receivedRefills, this.$tabContentReceived);
        break;
      default:
        console.error('[ERROR] Can not find type\'' + type + '\' in tabs');
        return null;
    }
  },

  _initTabContent: function (type, items, $targetTab, options) {
    var source = null;
    switch ( type ) {
      case this.TYPE.MY:
        Handlebars.registerPartial('myItems', $('#tmplMyItems').html());
        source = $('#tmplMy').html();
        break;
      case this.TYPE.SENT:
        Handlebars.registerPartial('sentItems', $('#tmplSentItems').html());
        source = $('#tmplSent').html();
        break;
      case this.TYPE.RECEIVED:
        Handlebars.registerPartial('receivedItems', $('#tmplReceivedItems').html());
        source = $('#tmplReceived').html();
        break;
      default:
        console.error('[ERROR] Can not find type\'' + type + '\' in tabs');
        return null;
    }
    var template = Handlebars.compile(source);
    var leftItems = items.length - this.NUM_OF_ITEMS;
    var data = {
      total: items.length,
      items: items.slice(0, this.NUM_OF_ITEMS),
      leftItems: leftItems > 0 ? leftItems : null
    };

    if ( options ) {
      data = $.extend(options, data);
    }
    var output = template(data);
    $targetTab.append(output);
    if ( leftItems ) {
      $targetTab.on('click', 'a.bt-more', $.proxy(this._onClickMore, this))
    }
  }
};
