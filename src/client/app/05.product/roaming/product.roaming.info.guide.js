/**
 * @file product.roaming.info.guide.js
 * @desc T로밍 > 로밍 안내 > submain (RM_16_01)
 * @author Eunjung Jung
 * @since 2018.11.12
 */

Tw.ProductRoamingGuide = function (rootEl) {
  this.$container = rootEl;

  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');

  this._roamingGuideInit();
  this._bindBtnEvents();
};

Tw.ProductRoamingGuide.prototype = {
    _roamingGuideInit : function () {
        var qs = this._getQueryStringObject();
        var reqItem = qs.reqItem;

        if(reqItem === 'lost'){
            this._roamingGuideAnchor();
        }
    },
    /**
     * @function
     * @desc 분실 안내 화면으로 스크롤 이동
     * @private
     */
    _roamingGuideAnchor: function () {
        this.$container.find('.fe-lost-guide').addClass('on');
        this.$container.find('.fe-rm-lost').attr('aria-pressed', 'true');
        var _top = $('.widget-box.accordion').eq(1).offset().top;
        $('html, body').stop().animate({
            scrollTop:_top + 200},
            1, function(){});
    },
    /**
     * @function
     * @desc query string을 Object로 변환
     * @returns {{}}
     * @private
     */
    _getQueryStringObject: function () {
        var a = window.location.search.substr(1).split('&');
        if (a === '') return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=', 2);
            if (p.length === 1)
                b[p[0]] = '';
            else
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' ' ));
        }
        return b;
    },
    _bindBtnEvents: function () {
      //this.$container.on('click', '#fe-rm-info-slide2', $.proxy(this._goSecureTroaming, this));     // 자동안심 T로밍
      this.$container.on('click', '#fe-rm-info-slide1', $.proxy(this._goBaroCall, this));      // baro 통화
      this.$container.on('click', '#fe-rm-info-slide2', $.proxy(this._goBaroPromotion, this));      // baro 무료 체험 프로모션
      this.$container.on('click', '#fe-rm-info-slide3', $.proxy(this._goGuamSaipan, this));      // T괌사이판 국내처럼
      this.$container.on('click', '#fe-rm-info-slide4', $.proxy(this._goLteGuide, this));           // 자동로밍
      this.$container.on('click', '#fe-rm-info-slide5', $.proxy(this._goDataRoaming, this));        // SMS 문자, 데이터 로밍
      this.$container.on('click', '#fe-rm-faq', $.proxy(this._goLoadFaq, this));                    // 자주하는 질문
      // this.$container.on('click', '.fe-roaming-button', $.proxy(this._goLoadRoamingGuide, this));
      this.$container.on('click', '#fe-rm-smart-guide', $.proxy(this._goDownLoadGuide, this, 'smart')); // 로밍안내서 다운받기 스마트폰
      this.$container.on('click', '#fe-rm-smart-partner-guide', $.proxy(this._goDownLoadGuide, this, 'smart-partner')); // 로밍안내서 다운받기 스마트폰 제휴 사업자
      this.$container.on('click', '#fe-rm-phone-guide', $.proxy(this._goDownLoadGuide, this, 'phone')); // 로밍안내서 다운받기 일반폰
      this.$container.on('click', '#fe-rm-rental-guide', $.proxy(this._goDownLoadGuide, this, 'rental')); // 로밍안내서 다운받기 임대로밍
  },
  /**
   * @function
   * @desc 로밍 가이드 다운로드
   * @param type
   * @private
   */
  _goDownLoadGuide: function (type) {
    if(type === 'smart') {  // 스마트폰 로밍 요금제 가이드
      Tw.CommonHelper.openUrlExternal(Tw.ROAMING_DOWNLOAD_URL.SMART_GUIDE,'');
    } else if(type === 'smart-partner'){    // 스마트폰 제휴 사업자 가이드
      Tw.CommonHelper.openUrlExternal(Tw.ROAMING_DOWNLOAD_URL.SMART_PARTNER_GUIDE,'');
    } else if(type === 'phone'){    // 일반폰 자동로밍 가이드
      Tw.CommonHelper.openUrlExternal(Tw.ROAMING_DOWNLOAD_URL.PHONE_GUIDE,'');
    } else {    // 임대로밍 자동로밍 가이드
      Tw.CommonHelper.openUrlExternal(Tw.ROAMING_DOWNLOAD_URL.RENTAL_GUIDE,'');
    }
  },
  _goLteGuide : function() {
    this._history.goLoad('/product/roaming/info/lte');
  },
  //_goSecureTroaming : function () {
  //  this._history.goLoad('/product/roaming/info/secure-troaming');
  //},
  _goBaroCall : function () {
    this._history.goLoad('/product/roaming/info/barocall');
  },
  _goBaroPromotion : function () {
    this._history.goLoad('/product/roaming/info/baropromotion');
  },
  _goGuamSaipan : function () {
    this._history.goLoad('/product/roaming/info/guamsaipan');
  },
  _goDataRoaming : function () {
    this._history.goLoad('/product/roaming/info/data-roaming');
  },
  _goLoadFaq : function () {
    this._history.goLoad('/customer/faq/category?id=1400000&title=%EB%A1%9C%EB%B0%8D');
  }
  // _goLoadRoamingGuide: function () {
  //     window.location.href = 'http://www.wiseuser.go.kr/jsp/commList.do?bcode=520&hcode=500&vcode=2019';
  // }

};
