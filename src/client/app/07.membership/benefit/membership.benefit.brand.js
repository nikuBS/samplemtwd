/**
 * @file membership.benefit.brand.js
 * @author 이정민 (skt.p130713@partner.sk.com)
 * @since 2018-12-21
 */

/**
 * @class
 * @desc T멤버십 > 제휴브랜드
 * @param {Object} rootEl
 * @param {JSON} options
 */
Tw.MembershipBenefitBrand = function (rootEl, options) {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this.$container = rootEl;
  this._options = options;
  this._cacheElements();
  this._bindEvnets();
  this._init();
};

Tw.MembershipBenefitBrand.prototype = {
  _ICO_GRD_CHK_CD: {
    V: 'vip',
    G: 'gold',
    S: 'silver',
    A: 'all'
  },
  /**
   * @member {Object}
   * @readonly
   * @prop {String} ALL 
   */
  _CATE_CD: {
    ALL: '00'         
  },
  /**
   * @member {Object}
   * @readonly
   * @prop {String} LIKE    좋아요
   * @prop {String} LATEST  최신순
   */
  _ORD_COL_CD: {
    LIKE: 'L',
    LATEST: 'R'
  },
  /**
   * @member {Object}
   * @readonly
   * @prop {String} A  전체 등급
   * @prop {String} V  VIP 혜택 등급
   * @prop {String} M  내 등급
   */
  _SUB_TAB_CD: {
    A: 'A',
    V: 'V',
    M: 'M'
  },
  _ACTION_SHEET_HBS: 'actionsheet_select_a_type',
  _reqOptions: {
    pageSize: 20,
    pageNo: 1,
    cateCd: '',
    ordCol: '',
    coPtnrNm: ''
  },
  _gradeCd: [
    {
      list: [
        { value: Tw.MEMBERSHIP.BENEFIT.BRAND.GRADE.A, attr: 'class="focus-elem" sub-tab-cd="A"', subTabCd: 'A', option: 'checked' },
        { value: Tw.MEMBERSHIP.BENEFIT.BRAND.GRADE.V, attr: 'sub-tab-cd="V"', subTabCd: 'V' }
      ]
    }
  ],

  _cacheElements: function () {
    this.$btnShowCategories = this.$container.find('.fe-btn-show-categories');
    this.$btnCloseCategories = this.$container.find('.fe-btn-close-categories');
    this.$contLayer = this.$container.find('.fe-cont-layer');
    this.$grade = this.$container.find('.fe-grade');
    this.$categoryList = this.$container.find('.fe-category-list');
    this.$categoryListInLayer = this.$container.find('.fe-category-list-in-layer');
    this.$brandList = this.$container.find('.fe-brand-list');
    this.$brandItemTmpl = this.$container.find('#fe-brand-item-tmpl');
    this.$btnMore = this.$container.find('.fe-btn-more');
    this.$inputCoPtnrNm = this.$container.find('.fe-input-co-ptnr-nm');
    this.$contentsEmpty = this.$container.find('.fe-contents-empty');
    // this.$orders = this.$container.find('.fe-orders');
  },

  _bindEvnets: function () {
    this.$btnShowCategories.on('click', $.proxy(this._toggleCategoryLayer, this, true));
    this.$btnCloseCategories.on('click', $.proxy(this._toggleCategoryLayer, this, false));
    this.$contLayer.on('click', '.fe-category-list-in-layer button', $.proxy(this._onClickBtnCategoryInLayer, this));
    this.$container.on('click', '.fe-btn-category', $.proxy(this._onClickBtnCategory, this));
    this.$container.on('click', '.fe-btn-more', $.proxy(this._onClickBtnMore, this));
    this.$container.on('click', '.fe-grade', $.proxy(this._onClickBtnSelectGrade, this));
    this.$container.on('click', '.fe-btn-search', $.proxy(this._onClickBtnSearch, this));
    this.$container.on('keyup', '.fe-input-co-ptnr-nm', $.proxy(this._onKeyupInputCoPtnrNm, this));
    this.$container.on('keypress', '.fe-input-co-ptnr-nm', $.proxy(this._onKeypressInputCoPtnrNm, this));
    // this.$container.on('click', '.fe-orders button', $.proxy(this._onClickBtnOrder, this));
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this._onInitComplete, this));
    // 사파리 브라우저에서 뒤로가기시 새로고침
    $(window).bind('pageshow', function(event) {
      if (event.originalEvent.persisted) {
        window.location.reload();
      }
    });
  },

  _init: function () {
    this._reqOptions.cateCd = this._options.cateCd || this._CATE_CD.ALL;
    this._reqOptions.ordCol = this._options.ordCol || this._ORD_COL_CD.LIKE;
    this._reqOptions.subTabCd = this._options.subTabCd || this._SUB_TAB_CD.A;
    this._isLogin = JSON.parse(this._options.isLogin);
    this._noMembership = JSON.parse(this._options.noMembership);

    // 로그인 && 멤버십있는 경우 "내 등급" 추가
    if ( this._isLogin && !this._noMembership) {
      this._gradeCd[0].list.push({
        value: Tw.MEMBERSHIP.BENEFIT.BRAND.GRADE.M, attr: 'sub-tab-cd="M"', subTabCd: 'M'
      });
    }
    this._gradeList = this._gradeCd[0].list;

    this._setGrade();
  },

  _onInitComplete: function() {
    this._setScrollLeft(this._reqOptions.cateCd);
  },

  /**
   * @function
   * @desc 전체 카테고리 레이어 토글시 특정 엘리먼트 aria-hidden처리 - 접근성 대응
   * @param {String} type
   */
  _setAreaHiddenAttr: function(type) {
    var attr = {
      hidden: {
        'aria-hidden':true,
        'tabindex':-1
      },
      visible: {
        'aria-hidden':false,
        'tabindex':''
      }
    };
    $('.skip_navi, .content-wrap, .header-wrap:last, .gnb-wrap').attr(attr[type]);
  },

  /**
   * @function
   * @desc 전체 카테고리 레이어 토글
   * @param {boolean} open
   */
  _toggleCategoryLayer: function (open) {
    if ( open ) {
      this.$contLayer.show();
      this.$btnShowCategories.attr('aria-pressed', 'true');
      this.$btnCloseCategories.attr('aria-pressed', 'false');
      this._setAreaHiddenAttr('hidden');
      window.setTimeout($.proxy(function() {
        this.$contLayer.find('.fe-btn-close-categories').focus();
      }, this), 300);
    } else {
      this.$contLayer.attr('tabindex', '');
      this.$contLayer.hide();
      this._setAreaHiddenAttr('visible');
      window.setTimeout($.proxy(function() {
        this.$btnShowCategories.attr('aria-pressed', 'false');
        this.$btnShowCategories.focus();
        this.$btnCloseCategories.attr('aria-pressed', 'true');
      }, this), 300);
    }
  },

  /**
   * @function
   * @desc 등급 세팅
   */
  _setGrade: function () {
    var self = this;
    if ( this._reqOptions.cateCd === this._CATE_CD.ALL ) {
      _.each(this._gradeList, function (item) {
        item.option = item.subTabCd === self._reqOptions.subTabCd ? 'checked' : '';
      });
      var selectedSubTab = _.find(this._gradeList, {
        subTabCd: self._reqOptions.subTabCd
      });
      var subTabValue = selectedSubTab ? selectedSubTab.value : this._gradeList[0].value;
      this.$grade.find('button').text(subTabValue);
      if ( this.$inputCoPtnrNm.val() ) {
        this.$grade.hide();
      } else {
        this.$grade.show();
      }
    } else {
      this.$grade.hide();
    }
  },

  /**
   * @function
   * @desc 카테고리 선택시 호출
   * @param {String} cateCd
   */
  _selectCategory: function (cateCd) {
    var option = {
      pageNo: 1,
      ordCol: this._ORD_COL_CD.LIKE,
      cateCd: cateCd
    };
    if ( cateCd === this._CATE_CD.ALL ) {
      option.subTabCd = this._SUB_TAB_CD.A;
    } else {
      delete this._reqOptions.subTabCd;
    }
    this._reqBrandList(option);
  },

  /**
   * @function
   * @desc 제휴브랜드 목록 조회
   * @param {JSON} options
   */
  _reqBrandList: function (options) {
    if ( Tw.FormatHelper.isEmpty(options.coPtnrNm) ) {
      delete this._reqOptions.coPtnrNm;
    }
    this._apiService.request(Tw.API_CMD.BFF_11_0017, $.extend({}, this._reqOptions, options))
      .done($.proxy(this._onDoneReqBrandList, this, options))
      .fail($.proxy(this._onFailReq, this));
  },

  /**
   * @function
   * @desc 제휴브랜드 목록 조회 성공
   * @param {JSON} options
   * @param {JSON} resp
   */
  _onDoneReqBrandList: function (options, resp) {
    if ( resp.code !== Tw.API_CODE.CODE_00 ) {
      this._popupService.openAlert(resp.msg, resp.code);
      return;
    }
    $.extend(this._reqOptions, options);
    var totalCnt = resp.result.totalCnt;
    var list = this._getBrandList(resp);
    this._setCategory();
    this._setCategoryInLayer();
    this._setKeywords();
    this._setGrade();
    if (list.length <= 0) {
      this._showEmptyResult();
    } else {
      this._setBrandList(list);
    }
    this._setBtnMore(totalCnt);
    // this._setOrder();
  },

  /**
   * @function
   * @desc 제휴브랜드 목록 조회 실패
   * @param {JSON} err
   */
  _onFailReq: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  },

  /**
   * @function
   * @desc 더보기 버튼 세팅
   * @param {Object} totalCnt
   */
  _setBtnMore: function (totalCnt) {
    if ( parseInt(totalCnt, 10) > this._reqOptions.pageSize * this._reqOptions.pageNo ) {
      this.$btnMore.show();
    } else {
      this.$btnMore.hide();
    }
  },

  /**
   * @function
   * @desc 카테고리 세팅
   */
  _setCategory: function () {
    var $buttons = this.$categoryList.find('button');
    $buttons.removeClass('on');
    $buttons.attr('aria-selected', 'false');
    $buttons.filter('[cate-cd="' + this._reqOptions.cateCd + '"]').addClass('on');
    $buttons.filter('[cate-cd="' + this._reqOptions.cateCd + '"]').attr('aria-selected', 'true');
  },

  /**
   * @function
   * @desc 젠체 카테고리 레이어 세팅
   */
  _setCategoryInLayer: function () {
    var $btns = this.$categoryListInLayer.find('button');
    $btns.removeClass('checked');
    $btns.attr('aria-selected', false);
    $btns.css({color: '#3c3c3c', fontWeight: 'normal'});
    var $selectedBtn = $btns.filter('[cate-cd="' + this._reqOptions.cateCd + '"]');
    $selectedBtn.addClass('checked');
    $selectedBtn.attr('aria-selected', true);
    $selectedBtn.css({color: '#178BCE', fontWeight: '700'});
  },

  /**
   * @function
   * @desc 검색 키워드 세팅
   */
  _setKeywords: function () {
    if ( Tw.FormatHelper.isEmpty(this._reqOptions.coPtnrNm) ) {
      this.$inputCoPtnrNm.val('');
    }
  },

  /**
   * @function
   * @desc 제휴브랜드 목록 세팅
   * @param {ArrayList} list
   */
  _setBrandList: function (list) {
    var source = this.$brandItemTmpl.html();
    var template = Handlebars.compile(source);
    if ( this._reqOptions.pageNo === 1 ) {
      this.$brandList.empty();
    }
    _.each(list, $.proxy(function (item) {
      var $item = template(item);
      this.$brandList.append($item);
    }, this));
    this.$brandList.show();
    this.$contentsEmpty.hide();
  },

  /**
   * @function
   * @desc API result 리턴
   * @param {JSON} resp
   * @returns {JSON}
   */
  _getResult: function (resp) {
    return resp.result;
  },

  /**
   * @function
   * @desc 제휴브랜드 목록 반환
   * @param {JSON} resp
   * @returns {ArrayList}
   */
  _getBrandList: function (resp) {
    var self = this;
    var result = this._getResult(resp);
    var list = result.list;
    var strToArr = function (characters) {
      return _.map(characters.split(''), function (character) {
        return self._ICO_GRD_CHK_CD[character];
      });
    };
    return _.map(list, function (item) {
      item.showIcoGrdChk1 = strToArr(item.icoGrdChk1);
      item.showIcoGrdChk2 = strToArr(item.icoGrdChk2);
      item.showIcoGrdChk3 = strToArr(item.icoGrdChk3);
      item.showIcoGrdChk4 = strToArr(item.icoGrdChk4);
      item.showTotLikeCount = Tw.FormatHelper.addComma(item.totLikeCount);
      return item;
    });
  },

  /**
   * @function
   * @desc cateCd에 따른 스크롤 세팅
   * @param {String} cateCd
   */
  _setScrollLeft: function (cateCd) {
    var $buttons = this.$categoryList.find('button');
    var $target = $buttons.filter('[cate-cd="' + cateCd + '"]').parent();
    if ( $target && $target.length > 0) {
      var x = parseInt($target.position().left, 10);
      this.$categoryList.scrollLeft(x);
    }
  },

  /**
   * @function
   * @desc 키워드 검색
   */
  _searchWithKeyword: function () {
    var inputVal = this.$inputCoPtnrNm.val();
    var regExp = /^[가-힣a-zA-Z1-9\s]+$/; //한글완성형, 영문, 공백
    this.$inputCoPtnrNm.blur();
    if (!Tw.FormatHelper.isEmpty(inputVal) && !regExp.test(inputVal)) {
      this._showEmptyResult();
      return;
    }
    this.$contentsEmpty.hide();
    this.$brandList.show();
    var options = {
      pageNo: 1
    };
    if ( !Tw.FormatHelper.isEmpty(inputVal) ) {
      options.coPtnrNm = encodeURIComponent(this.$inputCoPtnrNm.val());
    }
    this._reqBrandList(options);
  },

  /**
   * @function
   * @desc 검색결과 없는 경우 노출
   */
  _showEmptyResult: function() {
    var inputVal = this.$inputCoPtnrNm.val();
    this.$brandList.empty();
    this.$contentsEmpty.find('.t-point').text(inputVal);
    this.$contentsEmpty.show();
    this.$brandList.hide();
    this.$btnMore.hide();
    this.$grade.hide();
  },

  /**
   * @function
   * @desc 등급선택 액션시트 오픈
   * @param {Object} $container
   */
  _onOpenGradeActionSheet: function ($container) {
    $container.find('li button').click($.proxy(function (event) {
      var subTabCd = $(event.currentTarget).attr('sub-tab-cd');
      var options = {
        pageNo: 1,
        subTabCd: subTabCd
      };
      if ( !Tw.FormatHelper.isEmpty(this.$inputCoPtnrNm.val()) ) {
        options.coPtnrNm = encodeURIComponent(this.$inputCoPtnrNm.val());
      }
      this._reqBrandList(options);
      this._popupService.close();
    }, this));
  },

  /**
   * @function
   * @desc 카테고리 클릭 시 호출
   * @param {Obejct} event
   */
  _onClickBtnCategory: function (event) {
    var dataCd = $(event.currentTarget).attr('cate-cd');
    this._selectCategory(dataCd);
    this._setScrollLeft(dataCd);
  },

  /**
   * @function
   * @desc 더보기 버튼 클릭 시 호출
   */
  _onClickBtnMore: function () {
    this._reqBrandList({
      pageNo: ++this._reqOptions.pageNo
    });
  },

  /**
   * @function
   * @desc 전체 카테고리 레이어의 카테고리 클릭 시 호출
   * @param {Object} event
   */
  _onClickBtnCategoryInLayer: function (event) {
    var cateCd = $(event.currentTarget).attr('cate-cd');
    this._selectCategory(cateCd);
    this._toggleCategoryLayer(false);
    this._setScrollLeft(cateCd);
  },

  /**
   * @function
   * @desc 등급버튼 클릭 시 호출
   */
  _onClickBtnSelectGrade: function () {
    this._popupService.open({
      hbs: this._ACTION_SHEET_HBS,
      layer: true,
      data: this._gradeCd
    }, $.proxy(this._onOpenGradeActionSheet, this), null, 'select-grade', this.$grade.find('button'));
  },

  /**
   * @function
   * @desc 검색 버튼 클릭 시 호출
   */
  _onClickBtnSearch: function () {
    this._searchWithKeyword();
  },

  /**
   * @function
   * @desc 검색 인풋 keyup이벤트 발생시 호출
   * @param {Object} event
   */
  _onKeyupInputCoPtnrNm: function (event) {
    var isEnter = 13;
    if ( event.keyCode === isEnter ) {
      this._searchWithKeyword();
    }
  },

  /**
   * @function
   * @desc 검색 인풋 keypress이벤트 발생시 호출
   * @param {Object} e
   */
  _onKeypressInputCoPtnrNm: function (e) {
    // [DV001-19148] 한글입력시 ios에서 마지막 글자 갱신되는 문제 수정
    var $input = $(e.currentTarget);
    var nLength = Number($input.attr('maxlength'));
    if ($input && $input.val().length >= nLength) {
      e.preventDefault();
    }
  }

  // _onClickBtnOrder: function (event) {
  //   var $currentTarget = $(event.currentTarget);
  //   var options = {
  //     pageNo: 1,
  //     ordCol: $currentTarget.attr('ord-col')
  //   };
  //   if ( !Tw.FormatHelper.isEmpty(this.$inputCoPtnrNm.val()) ) {
  //     options.coPtnrNm = encodeURIComponent(this.$inputCoPtnrNm.val());
  //   }
  //   this._reqBrandList(options);
  // },

  // _setOrder: function () {
  //   var $buttons = this.$orders.find('button');
  //   $buttons.removeClass('on');
  //   $buttons.filter('[ord-col="' + this._reqOptions.ordCol + '"]').addClass('on');
  // }
};
