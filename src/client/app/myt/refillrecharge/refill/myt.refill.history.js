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
            .done($.proxy(this._initTabContent, this, this.TYPE.MY))
            .fail(error);
        }
        break;
      case this.TYPE.SENT:
        if ( typeof this._sentRefills === 'undefined' ) {
          this._apiService
            .request(Tw.API_CMD.BFF_06_0003, { giftType: 1 })
            .done($.proxy(this._initTabContent, this, this.TYPE.SENT))
            .fail(error);
        }
        break;
      case this.TYPE.RECEIVED:
        if ( typeof this._receivedRefills === 'undefined' ) {
          this._apiService
            .request(Tw.API_CMD.BFF_06_0003, { giftType: 2 })
            .done($.proxy(this._initTabContent, this, this.TYPE.RECEIVED))
            .fail(error)
        }
        break;
    }
  },

  _onClickMore: function (e){
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
        items = this._myRefills;
        $targetTab = this.$tabContentSent;
        template = Handlebars.compile('{{>myItems}}');
        break;
      case this.TYPE.RECEIVED:
        Handlebars.registerPartial('receivedItems', $('#tmplReceivedItems').html());
        items = this._receivedRefills;
        $targetTab = this.$tabContentReceived;
        break;
      default:
        return null;
    }

    var idxFrom = items.length-leftItems;
    output = template({items: items.slice(idxFrom, idxFrom + this.NUM_OF_ITEMS)});
    $targetTab.find('ul').append(output);
    leftItems = leftItems - this.NUM_OF_ITEMS;
    if(leftItems > 0){
      elTarget.setAttribute('data-left-items', leftItems );
      elTarget.innerText = elTarget.innerText.replace(/\((.+?)\)/, "("+leftItems+")");
    }else{
      elTarget.style.display='none';
    }
  },

  _initTabContent: function (type, resp) {
    var source = null, items = null, $targetTab = null;
    //TODO parsing data
    switch ( type ) {
      case this.TYPE.MY:
        Handlebars.registerPartial('myItems', $('#tmplMyItems').html());
        this._myRefills = resp.result;
        items = this._myRefills;
        source = $('#tmplMy').html();
        $targetTab = this.$tabContentMy;
        break;
      case this.TYPE.SENT:
        Handlebars.registerPartial('sentItems', $('#tmplSentItems').html());
        this._sentRefills = resp.result;
        items = this._sentRefills;
        source = $('#tmplSent').html();
        $targetTab = this.$tabContentSent;
        break;
      case this.TYPE.RECEIVED:
        Handlebars.registerPartial('receivedItems', $('#tmplReceivedItems').html());
        this._receivedRefills = resp.result;
        items = this._receivedRefills;
        source = $('#tmplReceived').html();
        $targetTab = this.$tabContentReceived;
        break;
      default:
        console.error('[ERROR] Can not find type\'' + type +'\' in tabs');
        return null;
    }

    var template = Handlebars.compile(source);
    var leftItems =  items.length - this.NUM_OF_ITEMS;
    var output = template({
      items: items.slice(0, this.NUM_OF_ITEMS),
      leftItems: leftItems > 0 ? leftItems : null
    });
    $targetTab.append(output);
    if(leftItems){
      $targetTab.on('click', 'a.bt-more', $.proxy(this._onClickMore, this))
    }
  }
};
