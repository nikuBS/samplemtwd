/**
 * FileName: benefit.index.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.10.26
 */
Tw.BenefitIndex = function (rootEl, isLogin) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._moreViewSvc = new Tw.MoreViewComponent();
  this._isLogin = isLogin;
  this._init();
};

Tw.BenefitIndex.prototype = {
  _init: function () {
    this._initVariables();
    this._bindEvent();
    this._reqMyBenefitDiscountInfo();
    // this._reqProductList();
  },
  _initVariables: function () {
    this.$benefitArea = this.$container.find('#fe-my-benefit-area');
    this.$membership = this.$container.find('#fe-membership');
    this.$point = this.$container.find('#fe-point');
    this.$benefit = this.$container.find('#fe-benefit');
    this.$list = this.$container.find('#fe-list');
  },
  _bindEvent: function () {
    this.$container.on('click', '#fe-category input:radio', $.proxy(this._onClickCategory, this));
  },

  _registerHelper : function() {
    Handlebars.registerHelper('numComma', Tw.FormatHelper.addComma);
  },

  // 상단 > 나의 혜택.할인 정보 API들 호출 (9개 호출해서 계산)
  _reqMyBenefitDiscountInfo: function () {
    if (!this._isLogin) {
      return;
    }
    this._apiService.requestArray([
      {command: Tw.API_CMD.BFF_11_0001},
      {command: Tw.API_CMD.BFF_07_0041},
      {command: Tw.API_CMD.BFF_05_0132},
      {command: Tw.API_CMD.BFF_05_0175},
      {command: Tw.API_CMD.BFF_05_0120},
      {command: Tw.API_CMD.BFF_05_0115},
      {command: Tw.API_CMD.BFF_05_0106},
      {command: Tw.API_CMD.BFF_05_0094},
      {command: Tw.API_CMD.BFF_06_0001}
    ]).done($.proxy(this._successMyBenefitDiscountInfo, this))
      .fail($.proxy(this._onFail, this));
  },

  _successMyBenefitDiscountInfo: function () {
    var data = {
      membership: '',
      point: 0,
      benefitDiscount: 0
    };

    var countPoint = function (resp1, targets) {
      if (resp1.code === Tw.API_CODE.CODE_00) {
        targets.forEach(function (o) {
          data.point += Number(resp1.result[o]);
        });
      }
    };

    var resp = {};
    // 멤버십 등급
    if ((resp = arguments[0]).code === Tw.API_CODE.CODE_00) {
      data.membership = Tw.MEMBERSHIP_GRADE[resp.result.mbrGrCd];
    }

    // 포인트 합산 시작
    countPoint(arguments[1],['availPt','availTPt']); // OK 캐쉬백 & T 포인트
    countPoint(arguments[2],['usblPoint']); // 레인보우포인트
    countPoint(arguments[3],['muPoint']); // 무약정 플랜
    countPoint(arguments[4],['usblPoint']); // 현역플랜 포인트
    countPoint(arguments[5],['usblPoint']); // 쿠키즈팅 포인트
    // 포인트 합산 시작 끝

    // 혜택.할인 건수 시작
    if ((resp = arguments[6]).code === Tw.API_CODE.CODE_00) {
      data.benefitDiscount += resp.result.priceAgrmt.length;
    }
    // 결합할인
    if ((resp = arguments[7]).code === Tw.API_CODE.CODE_00) {
      var resp1 = resp.result;
      if (resp1.prodNm.trim() !== '') {
        data.benefitDiscount += Number(resp1.etcCnt) + 1;
      }
    }
    // 장기가입 혜택 건수
    if ((resp = arguments[8]).code === Tw.API_CODE.CODE_00) {
      var list = _.filter(resp.result, function (o) {
        return o.copnOperStCd === 'A10';  // 장기가입 혜택 만 가져온다.
      });

      data.benefitDiscount += list.length;
    }
    // 혜택.할인 건수 끝

    this.$membership.text(data.membership);
    this.$point.prepend(Tw.FormatHelper.addComma(data.point.toString()));
    this.$benefit.prepend(data.benefitDiscount);
    this.$benefitArea.removeClass('none');
  },

  // 카테고리 클릭 이벤트
  _onClickCategory : function (e) {
    var $this = $(e.currentTarget);
    this._reqProductList($this.val());
  },

  // 상품 리스트 조회요청
  _reqProductList : function(category){
    // var $this = this;
    var mockup = function (category) {
      $.ajax('/mock/benefit.index.products.json')
        .done($.proxy(this._successProductList, this, category))
        .fail($.proxy(this._onFail, this));
    };

    var real = function (category) {
      this._apiService
        .request(Tw.API_CMD.BFF_10_0054, {
          idxCtgCd : 'F01400',
          benefitCtgCd : 'F01421',
          searchListCount : 10
        })
        .done($.proxy(this._successProductList, this, category))
        .fail($.proxy(this._onFail, this));
    };
    mockup.call(this,category);
  },

  _renderList : function (res) {
    var source = $('#productList').html();

    var template = Handlebars.compile(source);
    var output = template({ list: res.list });
    this.$list.append(output);
  },

  _successProductList : function (category, resp) {
    if ( resp.code !== Tw.API_CODE.CODE_00 ) {
      this._onFail(resp);
      return;
    }

    this.$list.empty();
    var cnt = category === '' ? 10 : 50;
    // 더보기 설정
    this._moreViewSvc.init({
      list : resp.result.list,
      cnt : cnt,
      callBack : $.proxy(this._renderList,this),
      isOnMoreView : true
    });
  },

  // API Fail
  _onFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};
