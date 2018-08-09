Tw.MytUsageChildren = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MytUsageChildren.prototype = {
  _cachedElement: function () {
    // this.$btDropdown = this.$container.find('.bt-dropdown');
  },

  _bindEvent: function () {
    this.$container.on('click', '.bt-dropdown', $.proxy(this._onClickBtDropdown, this));
    this.$container.on('change', '.fe-unit-switch', $.proxy(this._setDataByUnit, this));
  },

  _init: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0010, {})
      .done($.proxy(this._childrenReqDone, this))
      .fail($.proxy(this._childrenReqFail, this));
  },

  _childrenReqDone: function (resp) {
    if ( resp.code === '00' ) {
      if ( resp.result && resp.result.length > 0 ) {
        this.children = _.map(resp.result, $.proxy(function (_child) {
          return {
            attr: 'id="' + _child.svcMgmtNum + '"',
            text: _child.svcNum
          };
        }, this));
      }
    } else {
      this._showErrorAlert(resp.code + ' ' + resp.msg);
    }
  },

  _childrenReqFail: function (resp) {
    this._showErrorAlert(resp.code + ' ' + resp.msg);
  },

  _onClickBtDropdown: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.openChoice(Tw.MSG_MYT.CHILDREN.SELECT_TITLE, this.children,
      'type3', $.proxy(this._onOpenChoicePopup, this, $target));
  },

  _onOpenChoicePopup: function ($target, $layer) {
    $layer.on('click', '.popup-choice-list', $.proxy(this._onSelectChild, this, $target));
  },

  _onSelectChild: function ($target, event) {
    this._popupService.close();
    var selectedChild = $(event.currentTarget).find('button').attr('id');
    this._historyService.replaceURL('/myt/usage/children?childSvcMgmtNum=' + selectedChild);
  },

  _setDataByUnit: function (event) {
    var defaultUnit = 'KB';
    var unit = event.currentTarget.querySelector('input[name="gbmb"]:checked').value;
    this.$container.find('[data-value]').each(function () {
      var $this = $(this);
      var dataValue = $this.attr('data-value');
      var data = Tw.FormatHelper.customDataFormat(dataValue, defaultUnit, unit);

      $this.text(data.data);
      $this.parent()[0].childNodes[2].nodeValue = data.unit;
    });
  },

  _showErrorAlert: function (msg) {
    this._popupService.openAlert(msg);
  }

};
