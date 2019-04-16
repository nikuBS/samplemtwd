/**
 * @file 나의 부가서비스 < 나의 가입 정보 < MyT
 * @author Jiyoung Jo
 * @since 2018.10.11
 */

Tw.MyTJoinMyPlanAdd = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._bpcpService = Tw.Bpcp;
  this._bpcpService.setData(this.$container, '/myt-join/additions');

  this.cachedElement();
  this.bindEvent();
  this.init();
};

Tw.MyTJoinMyPlanAdd.prototype = {
  init: function() {  
    this._totalCount = Number(this.$container.find('span.counts > em').text()); // 가입 부가서비스 총 갯수 저장
    this._getSvcInfo();
  },

  bindEvent: function() {
    this.$all.on('click', $.proxy(this._handleShowAllAdditions, this));  // 전체 보기 버튼 클릭 시
    this.$pay.on('click', $.proxy(this._handleShowPayAdditions, this));  // 유료만 보기 버튼 클릭 시
    this.$container.on('click', '.fe-btn-link',  $.proxy(this._handleClickLink, this));  // 부가서비스 버튼 클릭시
  },

  cachedElement: function() { // jquery 객체 저장
    this.$list = this.$container.find('ul.list-comp-lineinfo');
    this.$empty = this.$container.find('.contents-empty');
    this.$all = this.$container.find('#fe-all-btn');
    this.$pay = this.$container.find('#fe-pay-btn');
  },

  _getSvcInfo: function() {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(this._successGetSvcInfo, this));
  },

  _successGetSvcInfo: function(resp) {
    if (resp.code === Tw.API_CODE.CODE_00) {
      this._svcInfo = resp.result;
    }
  },

  _handleShowAllAdditions: function(e) {  // 전체 보기 버튼 클릭 시
    if (this._totalCount === 0 || this.$all.hasClass('on')) { // 가입 부가서비스의 총 갯수가 0 이거나, 이미 전체 보기 상태인 경우 return
      return;
    }

    this.$all.attr('aria-selected', true);
    this.$pay.attr('aria-selected', false);

    if (this._totalCount > 0) { // 가입 부가서비스 갯수가 0보다 클 경우, empty element 히든 처리
      this.$container.find('.fe-empty').addClass('none').attr('aria-hidden', true);
    }

    this.$all.siblings().removeClass('on'); // 유료만 보기 버튼 off 상태로 변경
    this.$all.addClass('on'); // 전체 보기 버튼 on 상태로 변경
    this.$list.find('[data-isFree="true"]').removeClass('none').attr('aria-hidden', false);  // 무료 부가서비스 보이기
    this.$container.find('span.counts > em').text(this._totalCount);  // 가입 부가 서비스 카운트 변경
  },

  _handleShowPayAdditions: function(e) {  // 유료만 보기 버튼 클릭 시
    if (this._totalCount === 0 || this.$pay.hasClass('on')) { // 가입 부가서비스의 총 갯수가 0 이거나, 이미 전체 보기 상태인 경우 return
      return;
    }

    this.$all.attr('aria-selected', false);
    this.$pay.attr('aria-selected', true);

    this.$pay.siblings().removeClass('on'); // 전체 보기 버튼 off 상태로 변경
    this.$pay.addClass('on'); // 유료만 보기 버튼 on 상태로 변경

    var additions = this.$list.find('[data-isFree="true"]');  // 무료 부가서비스 select
    additions.addClass('none').attr('aria-hidden', true); // 무료 부가서비스 히든 처리

    if (this._totalCount === additions.length) {  // 총 갯수와 무료 부가서비스의 갯수가 같을 경우(유료 부가서비스 미가입 상태)
      this.$empty.removeClass('none').attr('aria-hidden', false);  // empty element 보이기
    }

    this.$container.find('span.counts > em').text(this._totalCount - additions.length); // 가입된 유료 부가서비스 갯수 표시
  },

  _handleClickLink: function(e) {
    var link = e.currentTarget.getAttribute('data-url'), 
      prodId = e.currentTarget.getAttribute('data-prod-id');

    if (this._bpcpService.isBpcp(link)) {
      return this._bpcpService.open(link, this._svcInfo ? this._svcInfo.svcMgmtNum : null, null);
    } else if (link.indexOf('http')) {
      Tw.CommonHelper.openUrlExternal(link);
    } else {
      window.location.href = link + prodId ? '?prod_id=' + prodId : '';
    }
  }
};
