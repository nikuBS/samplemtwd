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
    this._getSvcInfo();
    // OP002-8156: [개선][FE](W-2002-034-01) 회선선택 영역 확대 2차
    /* this._lineComponent = */
    new Tw.LineComponent(this.$container, '.fe-bt-line', true, null);
    // 부가상품 처음 진입 시 유료, 무료, 옵션 영역 특정하여 선택하여 진입이 필요한 경우
    var hash = location.hash;
    if (!hash) {
      hash = '#tod-all'
    }
    this.$todSel.find('a[href="' + hash + '"]').trigger('click');
    // 위치조정을 위한 처리
    setTimeout($.proxy(function() {
      $(window).scrollTop(0);
    }, this), 0);
  },

  /**
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function() {
    this.$container.on('click', '.fe-btn-link',  $.proxy(this._handleClickLink, this));  // 부가서비스 버튼 클릭시
    // 카테고리 이벤트
    this.$todSelAnchors.on('click', $.proxy(this._onClickCategory, this));
  },

  /**
   * 카테고리 영역 선택 시 이벤트 처리
   * @param event
   * @private
   */
  _onClickCategory: function (event) {
    var $target = $(event.currentTarget);
    $target.addClass('on')
      .attr('title', '선택')
      .siblings().removeClass('on')
      .attr('title', '');
    if ( $target.attr('href') === '#tod-all' ) {
      this.$todSelContents.show();
    }
    else {
      this.$todSelContents.hide();
      $($target.attr('href')).show();
    }
    $(window).scrollTop(0);
    event.preventDefault();
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
