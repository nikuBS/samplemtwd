/**
 * @file 나의 부가서비스 < 나의 가입 정보 < MyT
 * @author Jiyoung Jo
 * @since 2018.10.11
 */

 /**
  * @class
  * @desc 나의 부가서비스
  * @param {Object} params
  * @param {jQuery} params.$element
  */
Tw.MyTJoinMyPlanAdd = function(params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._bpcpService = Tw.Bpcp;
  this._historyService = new Tw.HistoryService(this.$container);
  this._hashService = Tw.Hash;
  this._bpcpService.setData(this.$container, '/myt-join/additions');
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTJoinMyPlanAdd.prototype = {
  /**
   * @desc jquery element 저장
   * @private
   */
  _cachedElement: function() { // jquery 객체 저장
    this.$list = this.$container.find('ul.list-comp-lineinfo');
    this.$empty = this.$container.find('.contents-empty');
    this.$todSel = this.$container.find('.tod-sel-top-wrap').children('.link-cont');
    this.$todSelAnchors = this.$todSel.children('a');
    this.$todSelContents = this.$container.find('.tod-js-list-ctrl');
  },

  /**
   * @desc 초기화
   * @private
   */
  _init: function() {
    this._applyHash(location.hash);

    // this._hashService.initHashNav($.proxy(this._onHashChange, this));

    this._getSvcInfo();

    // OP002-8156: [개선][FE](W-2002-034-01) 회선선택 영역 확대 2차
    /* this._lineComponent = */ new Tw.LineComponent(this.$container, '.fe-bt-line', true, null);
  },

  _onHashChange: function(hash) {
    // Tw.Logger.log('[Tw.MyTJoinMyPlanAdd] Hash Change', hash, location.hash);
    this._applyHash(hash.base);
  },

  /**
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function() {
    // this.$todSel.on('click', 'a', $.proxy(this._handleTodSelClick, this));  // 전체 보기 버튼 클릭 시
    this.$container.on('click', '.fe-btn-link',  $.proxy(this._handleClickLink, this));  // 부가서비스 버튼 클릭시
  },

  /**
   * @desc node로 부터 service info 가져옴
   * @private
   */
  _getSvcInfo: function() {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
        .done($.proxy(this._successGetSvcInfo, this));
  },

  /**
   * @desc service info 저장
   * @param {object} resp
   * @private
   */
  _successGetSvcInfo: function(resp) {
    if (resp.code === Tw.API_CODE.CODE_00) {
      this._svcInfo = resp.result;
    }
  },

  /**
   * @desc 전체/옵션할인/유료/무료 버튼 클릭 시
   * @param {Event} event 클릭 이벤트 객체
   * @private
   */
  _handleTodSelClick: function(event) {
    // NOTE: hash를 변경하되, history를 쌓지 않도록 하여, 되돌아가기를 한번에 하도록 한다.
    // this._historyService.replacePathName(event.currentTarget.href);
    window.location.replace(event.currentTarget.href);
    // this._applyHash(event.currentTarget.href);
    event.preventDefault();
  },

  _applyHash: function (hash) {
    // 초기화 (외부에서 hash를 달고 오는 경우에 대한 처리)
    var $selectedAnchor;

    if (hash && hash !== '#tod-all') {
      $selectedAnchor = this.$todSelAnchors.filter(function (i, elem) {
        return elem.href.includes(hash);
      });
      this.$todSelContents.hide();
      $($selectedAnchor.attr('href')).show();
    } else {
      // NOTE: hash가 없으면, 첫번째("전체")를 자동으로 선택
      $selectedAnchor = this.$todSelAnchors.eq(0);
      this.$todSelContents.show();
    }
    $selectedAnchor.addClass('on').attr('title', '선택');
    // $(window).scrollTop(0);
    /*
    var selectedButton;
    this.$todSelAnchors.removeClass('on');
    if (hash) {
      selectedButton = this.$todSelAnchors.filter(function (i, elem) {
        return elem.href.includes(hash);
      });
    } else {
      // NOTE: hash가 없으면, 첫번째("전체")를 자동으로 선택
      selectedButton = this.$todSelAnchors.eq(0);
    }
    selectedButton.addClass('on').attr('title', '선택');
    */
  },

  /**
   * @desc 링크 클릭시
   * @param {Event} e 클릭 이벤트 객체
   * @private
   */
  _handleClickLink: function(e) {
    var $target = $(e.currentTarget);
    var link = $target.data('url');
    var prodId = $target.data('prod-id');

    if (this._bpcpService.isBpcp(link)) {
      var vColoringParam = (prodId === 'NA00007017' || prodId === 'NA00007246') && link.indexOf('0000135003') !== -1 ?
          'productid=' + prodId : null
      if (vColoringParam) {
        // 과금팝업 노출
        return Tw.CommonHelper.showDataCharge($.proxy(function() {
            this._bpcpService.open(link, this._svcInfo ? this._svcInfo.svcMgmtNum : null, vColoringParam);
        }, this))
      }
      return this._bpcpService.open(link, this._svcInfo ? this._svcInfo.svcMgmtNum : null, vColoringParam);
    }
    if (link.indexOf('http') !== -1) {
      Tw.CommonHelper.openUrlExternal(link);
    } else {
      window.location.href = link + (prodId ? '?prod_id=' + prodId : '');
    }
  }
};
