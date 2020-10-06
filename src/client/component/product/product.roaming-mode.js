/**
 * @file product.roaming-mode.js
 * @author Jang-Ho Hwang
 * @since 2020-09-22
 * @desc 메인 홈과 스토어에서 사용하는 클래스로,
 *       UI 없이 로밍모드 여부를 확인하여 redirect 하는 목적을 수행.
 */

/**
 * @class Tw.ProductRoamingMode
 * @desc 로밍모드 전환
 * @param rootEl 최상위 Element
 */
Tw.ProductRoamingMode = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._locationInfo = new Tw.LocationInfoComponent();
};

Tw.ProductRoamingMode.prototype = {
  /**
   * @desc 현재 로그인된 사용자의 위치정보동의 내역을 확인한다.
   *
   * @param mcc 사용자의 mobileCountryCode
   * @param agreedDebugCallback 위치정보동의 직후 사용될 콜백. 없어도 된다.
   */
  checkLocationAgreement: function(mcc, agreedDebugCallback) {
    // 로그인 여부를 확인. 쿠키 체크 대신 svcInfo 나 controller 값을 참조하는 것도 검토.
    if (Tw.CommonHelper.getCookie(Tw.COOKIE_KEY.TWM_LOGIN) !== 'Y') {
      // 만약 비로그인인 경우 약관동의 여부확인이 불가하므로 동작하지 않는다.
      return;
    }

    var t = this;
    this._locationInfo.checkLocationAgreement(function(r) {
      // 위치정보 약관을 이미 동의한 케이스

      // 개정된 약관을 보지 못한 유저들에게 위치정보사용동의 약관창을 다시 띄우기 위한 코드.
      // 새 약관을 보지 못한 유저들도 로밍모드를 이용할 수 있게 협의되어 아래 코드들은 주석으로 처리됐다.
      // baseDate 의 2020년 9월 24일은 T로밍 개선의 1차 오픈일이다.

      // var agreed = moment(r.result.twdLocUseAgreeDtm, 'YYYYMMDDHHmmss');
      // var baseDate = moment('202009240200', 'YYYYMMDDHHmm');
      // if (agreed.isBefore(baseDate)) {
      //   t.showLocationAgreement(mcc);
      // } else {
        if (agreedDebugCallback) {
          agreedDebugCallback();
        } else {
          t.showRoamingModeHome(mcc);
        }
      // }
    }, function(r) { // 위치정보 약관을 아직 동의하지 않은 케이스
      if (r.code === '00') {
        t.showLocationAgreement(mcc);
      }
    });
  },
  /**
   * @desc 기 준비된 위치정보사용동의 약관창을 표시.
   *
   * @param mcc 이용자의 mobileCountryCode
   */
  showLocationAgreement: function(mcc) {
    var t = this;
    // 위치정보 약관동의를 띄우는 다른 코드에서 복사하였다.
    // customer.agentsearch.map.js 파일 301 라인 참조.
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
        style_class: 'pos-left fe-close', // fe-close를 fe-disAgree로 변경해야 될듯
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
        // 미동의 시에는 아무일도 일어나지 않는다.
      }, this));

      // 위치정보 동의
      root.on('click', '.fe-agree', $.proxy(function () {
        Tw.Popup.close();
        Tw.Api.request(Tw.API_CMD.BFF_03_0022, {twdLocUseAgreeYn: 'Y'})
          .done(function() {
            t.showRoamingModeHome(mcc);
          });
      }, this));
    }, this), null, 'roamingMcc');
  },
  /**
   * @desc 로밍모드 홈으로 redirect 한다.
   *
   * @param mcc 이용자의 mobileCountryCode
   */
  showRoamingModeHome: function(mcc) {
    Tw.CommonHelper.setSessionStorage('ROAMING_MCC', mcc);
    document.location.href = '/product/roaming/on?mcc=' + mcc;
  },
  /**
   * @desc T월드 대문에서 로밍모드 진입여부를 확인하기 위해 불리는 entry point.
   *
   * @param agreedDebugCallback 해외이고 약관동의를 다 했을 때
   *        로밍모드 홈으로 redirect 하는 대신, 다른 동작을 수행(override)하고
   *        싶을 때 넘기는 callback. 넘기지 않으면 기본 동작으로 로밍모드 홈으로 진입한다. 
   */
  checkMcc: function(agreedDebugCallback) {
    var t = this;
    Tw.Native.send('getMcc', {}, function(result) {
      if (result && result.params) {
        var mcc = result.params.mcc;
        // MCC 450은 대한민국
        if (mcc && mcc !== '450') {
          // 사용자가 로밍모드를 강제로 껐을 때 ROAMING_OFF=Y 가 들어간다.
          if (Tw.CommonHelper.getSessionStorage('ROAMING_OFF') !== 'Y') {
            t.checkLocationAgreement(mcc, agreedDebugCallback);
          }
        }
      }
    });
  }
};
