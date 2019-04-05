/**
 * @file main.menu.settings.notifications.js
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * @since 2018.10.08
 */

Tw.MainMenuSettingsNotifications = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

  this._termsAgreed = {
    twdAdRcvAgreeYn: false,
    twdInfoRcvAgreeYn: false,
    twdLocUseAgreeYn: false
  };

  this._init();
  this._bindEvents();
};

Tw.MainMenuSettingsNotifications.prototype = {
  _init: function () {
    // check which terms is agreed
    var $agreedTerms = this.$container.find('.fe-term.checked');
    for (var i = 0; i < $agreedTerms.length; i++) {
      this._termsAgreed[$agreedTerms[i].dataset.key] = true;
    }

    // check if it is from device and notification settings is on
    if (Tw.BrowserHelper.isApp()) {
      this._nativeService.send(Tw.NTV_CMD.GET_PERMISSION, {
        type: 'notification'
      }, $.proxy(function (res) {
        if (res.resultCode === Tw.NTV_CODE.CODE_00 && res.params.permission !== 1) {
          // Show notification guide when device notification settings is off
          this.$container.find('.fe-device-noti').removeClass('none');
        }
      }, this));
    }
  },
  _bindEvents: function () {
    this.$container.on(
      'change', '#fe-chk-service, #fe-chk-recommend', $.proxy(this._onNotiChanged, this));
    this.$container.on(
      'click', '#fe-service-terms, #fe-recommend-terms', $.proxy(this._onTermsClicked, this));
    this.$container.on('click', '#fe-go-device-noti', $.proxy(this._onDeviceNotiClicked, this));
  },
  _onNotiChanged: function (e) {
    var id = e.currentTarget.id;
    var checked = !!$(e.currentTarget).attr('checked');
    var data = {};
    if (id.indexOf('service') !== -1) {
      data.tNotiInfoRcvAgreeYn = checked ? 'Y' : 'N';
    } else if (id.indexOf('recommend') !== -1) {
      data.tNotiMrktRcvAgreeYn = checked ? 'Y' : 'N';
    }

    this._apiService.request(Tw.API_CMD.BFF_03_0024, data)
      .done($.proxy(function (res) {
        if (res.code !== Tw.API_CODE.CODE_00) {
          this._onFailChangingNoti(id, res);
        }
      }, this))
      .fail($.proxy(this._onFailChangingNoti, this, id)
    );

    // check and show layer popup for terms
    if (checked) { // When switch changes to on from off
      if (id.indexOf('service') !== -1) {
        if (!this._termsAgreed.twdAdRcvAgreeYn || !this._termsAgreed.twdInfoRcvAgreeYn) {
          this.$container.find('#fe-service-terms').trigger('click'); // show terms layer popup
        }
      } else if (id.indexOf('recommend') !== -1) {
        if (!this._termsAgreed.twdAdRcvAgreeYn || !this._termsAgreed.twdInfoRcvAgreeYn ||
            !this._termsAgreed.twdLocUseAgreeYn) {
          this.$container.find('#fe-recommend-terms').trigger('click');
        }
      }
    }
  },
  _onFailChangingNoti: function (id, err) {
    var $switch = $('#' + id).closest('.btn-switch');
    if ($switch.hasClass('on')) {
      $switch.removeClass('on');
    } else {
      $switch.addClass('on');
    }

    Tw.Error(err.code, err.msg).pop();
  },
  _onTermsClicked: function (e) {
    var id = e.target.id;
    this._popupService.open({
      hbs: 'HO_04_01_02_01',
      layer: true
    }, $.proxy(this._onTermsOpened, this, id));
  },
  _onTermsOpened: function (id, $root) {
    //init
    $root.find('input[type=checkbox]').map($.proxy(function (i, elem) {
      if (this._termsAgreed[elem.value]) {
        $(elem).attr('checked', 'checked');
      }
    }, this));

    if (id.indexOf('service') !== -1) {
      $root.find('.fe-location').addClass('none');
    }

    //event
    var changedTerms = {};
    $root.on('change', 'input[type=checkbox]', $.proxy(function (e) {
      if (this._termsAgreed[e.target.value] !== e.target.checked) {
        changedTerms[e.target.value] = e.target.checked;
      } else {
        delete changedTerms[e.target.value];
      }
    }, this));
    $root.on('click', '#fe-confirm', $.proxy(this._onTermsConfirmed, this, changedTerms));
    $root.on('click', '.fe-view', $.proxy(function (e) {
      var code = e.currentTarget.value;
      Tw.CommonHelper.openTermLayer2(code);
    }, this));
  },
  _onTermsConfirmed: function (terms) {
    this._popupService.close();

    var data = _.mapObject(terms, function (val) {
      return val ? 'Y' : 'N';
    });

    this._apiService.request(Tw.API_CMD.BFF_03_0022, data)
      .done($.proxy(this._onSuccessTerms, this, terms))
      .fail($.proxy(function (err) {
        Tw.Error(err.code, err.msg).pop();
      }, this));
  },
  _onSuccessTerms: function (terms) {
    this.$container.find('.fe-term').each(function (i, elem) {
      if (terms.hasOwnProperty(elem.dataset.key)) {
        if (terms[elem.dataset.key]) {
          $(elem).addClass('checked');
          $(elem).find('.agree').text(Tw.COMMON_STRING.AGREE);
        } else {
          $(elem).removeClass('checked');
          $(elem).find('.agree').text(Tw.COMMON_STRING.DISAGREE);
        }
      }
    });
    for (var key in terms) {
      this._termsAgreed[key] = terms[key];
    }
  },
  _onDeviceNotiClicked: function () {
    this._nativeService.send(Tw.NTV_CMD.OPEN_SETTINGS, {
      type: 'notification'
    });
  }
};
