/**
 * @file product.roaming-mode.js
 * @author Jang-Ho Hwang
 * @since 2020-09-22
 */

/**
 * @class Tw.ProductNextRoaming
 * @desc 로밍모드 전환
 */
Tw.ProductRoamingMode = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._locationInfo = new Tw.LocationInfoComponent();
};

Tw.ProductRoamingMode.prototype = {
  checkLocationAgreement: function(mcc, agreedCallback) {
    if (Tw.CommonHelper.getCookie('TWM_LOGIN') !== 'Y') {
      return;
    }

    var t = this;
    this._locationInfo.checkLocationAgreement(function(r) {
      var agreed = moment(r.result.twdLocUseAgreeDtm, 'YYYYMMDDHHmmss');
      var baseDate = moment('202009240200', 'YYYYMMDDHHmm');

      // 이미 동의했어도 개정된 약관을 보지 않았으면 재표시
      if (agreed.isBefore(baseDate)) {
        t.showLocationAgreement(mcc);
      } else {
        if (agreedCallback) {
          agreedCallback();
        } else {
          t.showRoamingModeHome(mcc);
        }
      }
    }, function(r) {
      if (r.code === '00') {
        t.showLocationAgreement(mcc);
      }
    });
  },
  showLocationAgreement: function(mcc) {
    var t = this;
    this._popupService.open({
      title: Tw.BRANCH.PERMISSION_TITLE,
      title_type: 'sub',
      cont_align: 'tl',
      contents: Tw.BRANCH.PERMISSION_DETAIL,
      infocopy: [{
        info_contents: Tw.BRANCH.DO_YOU_AGREE,
        bt_class: 'fe-view-term bt-blue1'
      }],
      bt_b: [{
        style_class: 'pos-left fe-close',
        txt: Tw.BRANCH.DISAGREE
      }, {
        style_class: 'bt-red1 pos-right fe-agree',
        txt: Tw.BRANCH.AGREE
      }]
    }, $.proxy(function (root) {
      root.find('.fe-view-term').find('button').text(Tw.BRANCH.VIEW_LOCATION_TERM);
      root.on('click', '.fe-view-term', $.proxy(function () {
        Tw.CommonHelper.openTermLayer2(15);
      }, this));

      // 위치정보 미동의
      root.on('click', '.fe-close', $.proxy(function () { // fe-close를 fe-disAgree로 변경해야 될듯
        Tw.Popup.close();
      }, this));
      // 위치정보 동의. 다음 스텝 진행한다.
      root.on('click', '.fe-agree', $.proxy(function () {
        Tw.Popup.close();
        Tw.Api.request(Tw.API_CMD.BFF_03_0022, {twdLocUseAgreeYn: 'Y'})
          .done(function() {
            t.showRoamingModeHome(mcc);
          });
      }, this));
    }, this), null, 'roamingMcc');
  },
  showRoamingModeHome: function(mcc) {
    Tw.CommonHelper.setSessionStorage('ROAMING_MCC', mcc);
    document.location.href = '/product/roaming/on?mcc=' + mcc;
  },
  checkMcc: function(agreedCallback) {
    var t = this;
    Tw.Native.send('getMcc', {}, function(result) {
      if (result && result.params) {
        var mcc = result.params.mcc;
        if (mcc && mcc !== '450') {
          if (Tw.CommonHelper.getSessionStorage('ROAMING_OFF') !== 'Y') {
            t.checkLocationAgreement(mcc, agreedCallback);
          }
        }
      }
    });
  }
};
