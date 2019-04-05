/**
 * @file 이용안내 > 이용자피해예방센터 > 최신 이용자 피해예방 주의보
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-07-26
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 */
Tw.CustomerDamageInfoWarning = function(rootEl) {
  // 컨테이너 레이어 설정
  this.$container = rootEl;

  // 공통 모듈 설정
  this._apiService = Tw.Api;

  // 공통 변수 설정
  this._template = Handlebars.compile($('#tpl_warning_list_item').html());
  this._page = 1;

  // Element 캐싱 및 이벤트 바인딩
  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerDamageInfoWarning.prototype = {

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$list = this.$container.find('.fe-list');  // 목록
    this.$btnMoreList = this.$container.find('.fe-btn_more_list');  // 목록 더보기 버튼
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$btnMoreList.on('click', $.proxy(this._loadMoreList, this)); // 더보기 버튼 클릭시
  },

  /**
   * @function
   * @desc 더보기 버튼 클릭시; 일반 목록만 추가로 가져온다.
   */
  _loadMoreList: function() {
    this._apiService.request(Tw.API_CMD.BFF_08_0063, {
      repCtgCd: 'A00002',
      page: this._page, size: 20
    }).done($.proxy(this._appendMoreList, this));
  },

  /**
   * @function
   * @desc 더보기 개수 계산
   * @param param - 페이징 정보 값
   * @returns {number}
   */
  _getRemainCount: function(param) {
    var count = param.total - ((++param.page) * param.size);
    return count < 0 ? 0 : count;
  },

  /**
   * @function
   * @desc 더보기 응답 목록 append
   * @param res - 더보기 추가요청한 목록 API 응답 값
   * @returns {*}
   */
  _appendMoreList: function(res) {
    // 오류 응답시 오류 팝업 처리
    if (res.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(res.code, res.msg).pop();
    }

    // hbs를 사용한 HTML append
    this.$list.append(this._template({
      list: _.map(res.result.content, function(item) {
        item.date = Tw.DateHelper.getShortDateWithFormat(item.rgstDtm, 'YYYY.M.D.');
        return item;
      })
    }));

    // 목록이 마지막일 경우 더보기 버튼 삭제
    if (res.result.last) this.$btnMoreList.remove();
    else {  // 또는, 더보기 버튼 내 잔여 개수 업데이트
      this.$btnMoreList.find('span').text('(' + this._getRemainCount({
        total: res.result.totalElements,
        page: res.result.pageable.pageNumber,
        size: res.result.pageable.pageSize
      }) + ')');
      this._page++;
    }
  }

};