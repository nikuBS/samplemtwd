/**
 * @file main.menu.settings.term-type-cde.js
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * @since 2018.11.27
 */

Tw.MainMenuSettingsTermTypeCDE = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._termGroup = {
    46: 46,
    49: 46,
    50: 46,
    102: 102,
    103: 102,
    104: 102
  };

  this._bindEvents();
};

Tw.MainMenuSettingsTermTypeCDE.prototype = {
  _bindEvents: function () {
    this.$container.on('click', '#fe-btn-view', $.proxy(this._onViewClicked, this));
    this.$container.on('click', '#fe-btn-action', $.proxy(this._onAction, this));
    this.$container.on('click', '.fe-link-external', $.proxy(this._onExternalLink, this));
  },
  _onViewClicked: function (e) {
    var viewId = e.currentTarget.value;
    this._apiService.request(Tw.API_CMD.BFF_08_0059, {
      svcType: 'MM',
      serNum: viewId
    }).done($.proxy(function (res) {
      if (res.code === Tw.API_CODE.CODE_00) {
        this._popupService.open({
          hbs: 'HO_04_05_01_02_01',
          title: res.result.title,
          content: res.result.content
        });
      } else {
        Tw.Error(res.code, res.msg).pop();
      }
    }, this)).fail(function (err) {
      Tw.Error(err.code, err.msg).pop();
    });
  },
  _onAction: function (e) {
    var id = e.currentTarget.value;
    var searchId = this._termGroup[id];
    var data  = Tw.TERMS_ACTION[searchId].data;
    data[0].list = _.map(data[0].list, function (item) {
      if (item['radio-attr'].indexOf(id) !== -1) {
        item['radio-attr'] += ' checked';
      }
      return item;
    });

    this._popupService.open({
      hbs: 'actionsheet01',
      layer: true,
      data: data,
      btnfloating: { attr: 'type="button"', txt: Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._onActionSheetOpened, this));
  },
  _onActionSheetOpened: function (root) {
    root.on('click', 'input[type=radio]', $.proxy(function (e) {
      this._popupService.close();
      if ($(e.currentTarget).hasClass('checked')) {
        return;
      }
      var values = e.currentTarget.value.split(':');
      var id = values[0];
      var type = values[1];
      var viewId = values.length === 3 ? values[2] : undefined;
      var url = '/main/menu/settings/terms?id=' + id + '&type=' + type;
      if (viewId) {
        url += '&viewId=' + viewId;
      }
      this._historyService.goLoad(url);
    }, this));
    root.on('click', '.btn-floating', $.proxy(function () {
      this._popupService.close();
    }, this));
  },
  _onExternalLink: function (e) {
    var url = $(e.currentTarget).attr('href');
    Tw.CommonHelper.openUrlExternal(url);

    return false;
  }
};
