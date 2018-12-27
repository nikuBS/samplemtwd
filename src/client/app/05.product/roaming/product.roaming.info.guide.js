/**
 * FileName: product.roaming.info.guide.js
 * Author: Eunjung Jung ()
 * Date: 2018.11.12
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
    _roamingGuideAnchor: function () {
        this.$container.find('.fe-lost-guide').addClass('on');
        this.$container.find('.fe-rm-lost').attr('aria-pressed', 'true');
        var _top = $('.widget-box.accordion').eq(1).offset().top;
        $('html, body').stop().animate({
            scrollTop:_top - 70},
            1, function(){});
    },

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
      this.$container.on('click', '#fe-rm-info-slide1', $.proxy(this._goLteGuide, this));
      this.$container.on('click', '#fe-rm-info-slide2', $.proxy(this._goSecureTroaming, this));
      this.$container.on('click', '#fe-rm-info-slide3', $.proxy(this._goDataRoaming, this));
      this.$container.on('click', '#fe-rm-faq', $.proxy(this._goLoadFaq, this));
      this.$container.on('click', '.fe-roaming-button', $.proxy(this._goLoadRoamingGuide, this));
      this.$container.on('click', '#fe-rm-smart-guide', $.proxy(this._goDownLoadGuide, this, 'smart'));
      this.$container.on('click', '#fe-rm-phone-guide', $.proxy(this._goDownLoadGuide, this, 'phone'));
      this.$container.on('click', '#fe-rm-rental-guide', $.proxy(this._goDownLoadGuide, this, 'rental'));
  },
  _goDownLoadGuide: function (type) {
    if(type === 'smart') {
      Tw.CommonHelper.openUrlExternal(Tw.ROAMING_DOWNLOAD_URL.SMART_GUIDE,'');
    } else if(type === 'phone'){
      Tw.CommonHelper.openUrlExternal(Tw.ROAMING_DOWNLOAD_URL.PHONE_GUIDE,'');
    } else {
      Tw.CommonHelper.openUrlExternal(Tw.ROAMING_DOWNLOAD_URL.RENTAL_GUIDE,'');
    }


  },
  _goLteGuide : function() {
    this._history.goLoad('/product/roaming/info/lte');
  },
  _goSecureTroaming : function () {
    this._history.goLoad('/product/roaming/info/secure-troaming');
  },
  _goDataRoaming : function () {
    this._history.goLoad('/product/roaming/info/data-roaming');
  },
  _goLoadFaq : function () {
    this._history.goLoad('/customer/faq/category?id=1400000&title=%EB%A1%9C%EB%B0%8D');
  },
  _goLoadRoamingGuide: function () {
      window.location.href = 'http://www.wiseuser.go.kr/jsp/commList.do?bcode=520&hcode=500&vcode=2019';
  }

};
