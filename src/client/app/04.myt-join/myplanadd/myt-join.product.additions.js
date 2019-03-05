/**
 * FileName: myt-join.product.additions.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.11
 */

Tw.MyTJoinMyPlanAdd = function(rootEl) {
  this.$container = rootEl;

  this.cachedElement();
  this.bindEvent();
  this.init();
};

Tw.MyTJoinMyPlanAdd.prototype = {
  init: function() {  
    this._totalCount = Number(this.$container.find('span.counts > em').text()); // 가입 부가서비스 총 갯수 저장
  },

  bindEvent: function() {
    this.$container.on('click', '.fe-all-btn', $.proxy(this._handleShowAllAdditions, this));  // 전체 보기 버튼 클릭 시
    this.$container.on('click', '.fe-pay-btn', $.proxy(this._handleShowPayAdditions, this));  // 유료만 보기 버튼 클릭 시
  },

  cachedElement: function() { // jquery 객체 저장
    this.$list = this.$container.find('ul.list-comp-lineinfo');
    this.$empty = this.$container.find('.contents-empty');
  },

  _handleShowAllAdditions: function(e) {  // 전체 보기 버튼 클릭 시
    var $target = $(e.target);
    if (this._totalCount === 0 || $target.hasClass('on')) { // 가입 부가서비스의 총 갯수가 0 이거나, 이미 전체 보기 상태인 경우 return
      return;
    }

    if (this._totalCount > 0) { // 가입 부가서비스 갯수가 0보다 클 경우, empty element 히든 처리
      this.$container.find('.fe-empty').addClass('none');
    }

    $target.siblings().removeClass('on'); // 유료만 보기 버튼 off 상태로 변경
    $target.addClass('on'); // 전체 보기 버튼 on 상태로 변경
    this.$list.find('[data-isFree="true"]').removeClass('none');  // 무료 부가서비스 보이기
    this.$container.find('span.counts > em').text(this._totalCount);  // 가입 부가 서비스 카운트 변경
  },

  _handleShowPayAdditions: function(e) {  // 유료만 보기 버튼 클릭 시
    var $target = $(e.target);
    if (this._totalCount === 0 || $target.hasClass('on')) { // 가입 부가서비스의 총 갯수가 0 이거나, 이미 전체 보기 상태인 경우 return
      return;
    }

    $target.siblings().removeClass('on'); // 전체 보기 버튼 off 상태로 변경
    $target.addClass('on'); // 유료만 보기 버튼 on 상태로 변경

    var additions = this.$list.find('[data-isFree="true"]');  // 무료 부가서비스 select
    additions.addClass('none'); // 무료 부가서비스 히든 처리

    if (this._totalCount === additions.length) {  // 총 갯수와 무료 부가서비스의 갯수가 같을 경우(유료 부가서비스 미가입 상태)
      this.$empty.removeClass('none');  // empty element 보이기
    }

    this.$container.find('span.counts > em').text(this._totalCount - additions.length); // 가입된 유료 부가서비스 갯수 표시
  }
};
