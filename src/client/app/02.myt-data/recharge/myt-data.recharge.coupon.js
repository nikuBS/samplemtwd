/**
 * @file 사용가능한 쿠폰 화면관련 처리
 * @author Hakjoon Sim
 * @since 2018-09-18
 */

/**
 * @constructor
 * @param  {Object} rootEl - 최상위 elem
 * @param  {String} coupons - 사용 가능한 쿠폰 정보
 */
Tw.MyTDataRechargeCoupon = function (rootEl, coupons) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  if (window.location.search.indexOf('submain') !== -1) {
    this._historyService.init(null, 1);
  }

  this._couponList = JSON.parse(coupons);
  this._couponShowed = 20;  // default showing list count is 20
  this._couponItemTeplate = Handlebars.compile($('#tpl_coupon_item').html());

  this._cacheElements();
  this._bindEvent();
};

Tw.MyTDataRechargeCoupon.prototype = {
  _cacheElements: function () {
    this.$couponContainer = this.$container.find('.coupon-list');
    this.$btnDiv = this.$container.find('.bt-more');
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-btn-more', $.proxy(this._onMore, this));
    this.$container.on('click', '.fe-btn-refill, .fe-btn-gift', $.proxy(this._onSubmit, this));
    this.$container.on('click', '#fe-btn-plans', $.proxy(this._onPlans, this));
  },

  /**
   * @function
   * @desc - more 버튼 클릭시 추가 쿠폰 화면 출력
   */
  _onMore: function () {
    var data = this._couponList.slice(this._couponShowed, this._couponShowed + 20);
    this.$couponContainer.append(this._couponItemTeplate({
      list: data
    }));
    this._couponShowed = this._couponShowed + data.length;

    if (this._couponShowed === this._couponList.length) {
      this.$btnDiv.addClass('none');
    }
  },

  /**
   * @function
   * @desc 특정 쿠폰 선택시 필요한 정보를 query params 에 담아 쿠폰 사용화면 호출
   * @param  {Object} evt - click event
   */
  _onSubmit: function (evt) {
    var no = evt.currentTarget.id;
    var name = evt.currentTarget.value.split('::')[0];
    var period = evt.currentTarget.value.split('::')[1];
    var gift = evt.currentTarget.value.split('::')[2];
    var tab = evt.currentTarget.className.indexOf('refill') !== -1 ? 'refill' : 'gift';
    this._historyService.goLoad(
      '/myt-data/recharge/coupon/use?tab=' + tab +'&no=' + no + '&name=' +
        name + '&period=' + period + '&gift=' + gift
    );
  },

  /**
   * @function
   * @desc 선물하기/리필하기 각각 이용가능한 요금제를 BFF에서 조회하고 이를 layer pop-up으로 출력
   */
  _onPlans: function () {
    $.when(
      this._apiService.request(Tw.API_CMD.BFF_06_0066, {
        type: 'R', dataRfilPsblYn: 'Y', voiceRfilPsblYn: 'Y'
      }),
      this._apiService.request(Tw.API_CMD.BFF_06_0066, {
        type: 'R', dataRfilPsblYn: 'Y', voiceRfilPsblYn: 'N'
      }),
      this._apiService.request(Tw.API_CMD.BFF_06_0066, {
        type: 'R', dataRfilPsblYn: 'N', voiceRfilPsblYn: 'Y'
      })
    ).then($.proxy(function (all, data, voice) {
      if (all.code === Tw.API_CODE.CODE_00) {
        if (data.code === Tw.API_CODE.CODE_00) {
          if (voice.code === Tw.API_CODE.CODE_00) {
            this._popupService.open({
              hbs: 'DC_05_02',
              listAll: this._purifyPlansData(all.result),
              listData: this._purifyPlansData(data.result),
              listVoice: this._purifyPlansData(voice.result)
            });
          } else {
            Tw.Error(voice.code, voice.msg).pop();
          }
        } else {
          Tw.Error(data.code, data.msg).pop();
        }
      } else {
        Tw.Error(all.code, all.msg).pop();
      }

    }, this));
  },

  /**
   * @function
   * @desc SB 정의된 순서대로 요금제 정렬
   * @param  {Array} rawData - BFF로 부터 받은 요금제 리스트
   */
  _purifyPlansData: function (rawData) {
    var data = rawData.sort(function (a, b) {
      var ia = a.initial;
      var ib = b.initial;

      var patternHangul = /[ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ]/;

      var order = function (a, b) {
        if (a < b) {
          return -1;
        } else if (a > b) {
          return 1;
        }
        return 0;
      };

      if (ia.match(patternHangul) && ib.match(patternHangul)) {
        return order(ia, ib);
      }

      if (ia.match(/[a-zA-Z]/) && ib.match(/[a-zA-Z]/)) {
        return order(ia, ib);
      }

      if (ia.match(/[0-9]/) && ib.match(/[0-9]i/)) {
        return order(ia, ib);
      }

      if (ia < ib) {
        return 1;
      } else if (ia > ib) {
        return -1;
      }
      return 0;
    });

    return data;
  }
};
