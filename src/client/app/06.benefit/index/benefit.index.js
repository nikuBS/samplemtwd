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
    this._registerHelper();
    this._reqMyBenefitDiscountInfo();
    this._reqProductList();
  },
  _initVariables: function () {
    this.$benefitArea = this.$container.find('#fe-my-benefit-area');
    this.$membership = this.$container.find('#fe-membership');
    this.$point = this.$container.find('#fe-point');
    this.$benefit = this.$container.find('#fe-benefit');
    this.$list = this.$container.find('#fe-list');
    this.$anotherProduct = this.$container.find('#fe-another-product');
    this.$showDiscountBtn = this.$container.find('#fe-show-discount');
    // 결합할인금액 미리보기 > (인터넷, 이동전화, TV) 설정
    this.$internetType = this.$container.find('[data-name="inetTypCd"]'); // 인터넷
    this.$mblPhonLineCnt = this.$container.find('[data-name="mblPhonLineCnt"]'); // 이동전화
    this.$btvUseYn = this.$container.find('[data-name="btvUseYn"]'); // TV
    this.$discountResult = this.$container.find('#fe-discount-result');
    this.$discountAmt = this.$container.find('#fe-discount-amt');
    this.$withTax = this.$container.find('#fe-with-tax');
    this.$combinationPreview = this.$container.find('#fe-combination-preview');

  },
  _bindEvent: function () {
    this.$container.on('click', '#fe-category input:radio', $.proxy(this._onClickCategory, this));
    this.$container.on('click', '[data-url]', $.proxy(this._goUrl, this));
    this.$container.on('change', '[data-check-disabled]', $.proxy(this._onCheckDisabled, this));
    this.$container.on('click', '.del, .add', $.proxy(this._onVariations, this));
    this.$internetType.on('click', $.proxy(this._checkStateLine, this));
    this.$showDiscountBtn.on('click', $.proxy(this._onViewDiscountAmt, this));
  },

  // 할인금액 보기 클릭 이벤트
  _onViewDiscountAmt : function () {
    this._reqDiscountAmt();
  },

  // 이동전화 회선수 체크
  _checkStateLine : function (e) {
    var $this = $(e.currentTarget);
    var $lineCnt = this.$mblPhonLineCnt;
    var _cnt = $lineCnt.text();
    var $addBtn = this.$container.find('.add');

    var fnAddBtnDisabled = function (bool) {
      $addBtn.prop('disabled',bool);
      if ( bool ) {
        $addBtn.addClass('active');
      } else {
        $addBtn.removeClass('active');
      }
    };

    // Giga 선택시
    if ( $this.val() === 'G0' ) {
      if ( _cnt < 5 ) {
        fnAddBtnDisabled(false);
      } else {
        fnAddBtnDisabled(true);
      }
    } else {
      if ( _cnt >= 4 ) {
        $lineCnt.text(4);
        fnAddBtnDisabled(true);
      } else {
        fnAddBtnDisabled(false);
      }
    }

  },

  // 이동전화 회선 증/감
  _onVariations : function (e) {
    var $this = $(e.currentTarget);
    var $lineCnt = this.$mblPhonLineCnt;
    var _cnt = $lineCnt.text();
    $this.siblings('button').prop('disabled',false).removeClass('active');

    // 감소 클릭
    if ( $this.hasClass('del') ) {
      var _minCnt = 1;
      $lineCnt.text(_cnt-- < _minCnt ? _minCnt:_cnt);
      if (_cnt <= _minCnt) {
        $this.prop('disabled',true).addClass('active');
      }
    }
    // 증가 클릭
    else {
      // 광랜 4회선, Giga : 5회선
      var _maxCnt = this.$internetType.filter(':checked').val() === 'G0' ? 5:4;
      $lineCnt.text(_cnt++ > _maxCnt ? _maxCnt:_cnt);
      if (_cnt >= _maxCnt) {
        $this.prop('disabled',true).addClass('active');
      }
    }
  },

  // '할인금액 보기' 버튼 disabled 체크 (인터넷 & TV 가 체크 되어야 활성화)
  _onCheckDisabled : function (){
    var isDisabled = false;
    this.$container.find('[data-check-disabled]').each(function () {
      if ( $(this).find('input:radio:checked').val() === undefined ) {
        isDisabled = true;
        return false;
      }
    });

    this.$showDiscountBtn.prop('disabled',isDisabled);
  },

  _goUrl : function (e) {
    window.location.href = $(e.currentTarget).data('url');
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

    var resp;
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

    this.$anotherProduct.addClass('none');
    this.$combinationPreview.addClass('none');
    // 카테고리가 '전체' 가 아니라면 '다른 상품 더보기 & 페이지 바로가기' 보이기
    if ( $this.val() !== '' ) {
      this.$anotherProduct.removeClass('none');
      // 결합할인 클릭 이라면 '결합할인금액 미리보기' 노출
      if ( $this.val() === 'F01422' ) {
        this.$combinationPreview.removeClass('none');
      }
    }
  },

  // 상품 리스트 조회요청
  _reqProductList : function(category){
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

  _renderList : function (category,res) {
    var source = $('#productList').html();

    var template = Handlebars.compile(source);
    var output = template({
      list: res.list,
      category : category
    });
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
      callBack : $.proxy(this._renderList,this,category),
      isOnMoreView : true
    });
  },

  // 할인금액 보기 조회 요청
  _reqDiscountAmt : function(){
    var mockup = function () {
      $.ajax('/mock/BFF_10_0039.json')
        .done($.proxy(this._successDiscountAmt, this))
        .fail($.proxy(this._onFail, this));
    };

    var real = function () {
      this._apiService
        .request(Tw.API_CMD.BFF_10_0039, {
          inetTypCd : this.$internetType.filter(':checked').val(),
          mblPhonLineCnt : this.$mblPhonLineCnt.text(),
          btvUseYn : this.$btvUseYn.find('checked').val()
        })
        .done($.proxy(this._successDiscountAmt, this))
        .fail($.proxy(this._onFail, this));
    };
    mockup.call(this);
  },

  _successDiscountAmt : function (resp) {
    if ( resp.code !== Tw.API_CODE.CODE_00 ) {
      this._onFail(resp);
      return;
    }
    var _data = resp.result;
    // 데이터가 없을때
    if ( Tw.FormatHelper.isEmpty(_data) ) {
      return;
    }

    this.$discountAmt.text(_data.dcPhrsCtt);
    this.$withTax.text(_data.dcPhrsAddDesc);
    this.$discountResult.removeClass('none');
    // TODO : 이용조건은 API 완료될 때 확인하고 작업하기
  },

  // API Fail
  _onFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};
