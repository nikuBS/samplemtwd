/**
 * @file 이번 달 공유내역 < T가족모아 데이터 < 나의 데이터/통화 < MyT
 * @author Jiyoung Jo
 * @since 2019.01.21
 */

Tw.MyTDataFamilyHistory = function(rootEl, histories) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._histories = histories;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataFamilyHistory.prototype = {
  _init: function() {
    this._historyChange = new Tw.MyTDataFamilyHistoryChange();
    this._ingTmpl = Handlebars.compile($('#fe-tmpl-ing').html());
    this._afterTmpl = Handlebars.compile($('#fe-tmpl-after').html());
    this._noneTmpl = Handlebars.compile($('#fe-tmpl-after-none').html());
    this._itemsTmpl = Handlebars.compile($('#fe-tmpl-items').html());
    this._leftCount = this._histories.length - Tw.DEFAULT_LIST_COUNT;
  },

  /**
   * @desc 이벤트 바인딩
   * @returns {void}
  */
  _bindEvent: function() {
    this.$container.on('click', '.fe-before', $.proxy(this._handleRetrieveData, this));
    this.$container.on('click', '.fe-edit', $.proxy(this._handleClickEditData, this));
    this.$container.on('click', '.btn-more', $.proxy(this._handleLoadMore, this));
  },

  /**
   * @desc jquery element 캐싱
   * @returns {void}
  */
  _cachedElement: function() {
    this.$list = this.$container.find('ul.type1');
  },
  
  /**
   * @desc 조회하기 버튼 클릭 시 UI 변경
   * @param {Event} 클릭 이벤트
   * @returns {void}
   */
  _handleRetrieveData: function(e) {
    var $target = $(e.currentTarget),
      $parent = $target.parent('li');

    $target.addClass('none').attr('aria-hidden', true);
    $parent.append(this._ingTmpl());  // 조회중 입니다. 노출
    this._requestRetrieve('0', $target, $parent);
  },
  
  /**
   * @desc T가족모아 변경 가능 데이터 조회
   * @param {string} requestCount  서버 input param
   * @param {$jquery} $before  조회하기 버튼 jquery 객체
   * @param {$jquery} $parent  조회하기 버튼의 parent
   */
  _requestRetrieve: function(requestCount, $before, $parent) {
    var serial = $parent.data('serial-number');
    // this._handleDoneRetrieve($before, $parent, { code: '00', result: { remGbGty: '1', remMbGty: '11' } });
    this._apiService
      .request(Tw.API_CMD.BFF_06_0072, { reqCnt: requestCount, shrpotSerNo: serial })
      .done($.proxy(this._handleDoneRetrieve, this, $before, $parent));
  },

  /**
   * @desc 변경 가능 데이터 조회 응답 시
   * @param {$jquery} $before 조회하기 버튼
   * @param {$jquery} $parent 조회하기 버튼의 부모 객체
   * @param {object} resp 서버 응답 결과
   */
  _handleDoneRetrieve: function($before, $parent, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || !resp.result) {
      this._setRetrieveStatus($before, resp); // 조회하기 버튼 노출
      return;
    }

    if (resp.result.nextReqYn === 'Y') {  // 서버에 재요청이 필요한 경우(BFF 요청사항)
      setTimeout($.proxy(this._requestRetrieve, this, resp.result.reqCnt, $before, $parent), 3000); // BFF요청 사항 - 응답 이후 3초 딜레이
    } else if (!resp.result.remGbGty && !resp.result.remMbGty) {  // 데이터가 안내려온 경우
      this._setRetrieveStatus($before);
    } else {  
      this._handleSuccessRetrieve(resp.result, $before, $parent);
    }
  },

  /**
   * @desc 조회하기 버튼 상태 변경
   * @param {$object} $before 조회하기 버튼 jquery 객체
   * @param {object} resp 서버 응답 결과
   */
  _setRetrieveStatus: function($before, resp) {
    $before.removeClass('none').attr('aria-hidden', false);
    $before
      .siblings('.fe-ing')
      .addClass('none')
      .attr('aria-hidden', true);
    if (resp && resp.code) {
      Tw.Error(resp.code, resp.msg).pop();
    } else {
      this._popupService.openAlert(
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A218, 
        Tw.POPUP_TITLE.NOTIFY, 
        undefined, 
        undefined, 
        undefined, 
        $before // 웹접근성 포커스 처리를 위한 jquery 객체
      );  
    }
  },

  /**
   * @desc 변경 가능 데이터 양 표시
   * @param {object} share 변경 가능한 공유 데이터 양
   * @param {$object} $before 조회하기 버튼 jquery 객체
   * @param {$object} $parent 조회하기 버튼의 부모
   */
  _handleSuccessRetrieve: function(share, $before, $parent) {
    var serial = $parent.data('serial-number');
    $before.siblings('.fe-ing').remove();

    var nData = Number((Number(share.remGbGty) + Number(share.remMbGty) / 1024 || 0).toFixed(2));
    if (nData > 0) {
      if (nData < 1) {
        $parent.append(this._afterTmpl({ data: share.remMbGty + Tw.DATA_UNIT.MB, serial: serial, gb: share.remGbGty, mb: share.remMbGty }));
      } else {
        $parent.append(this._afterTmpl({ data: nData + Tw.DATA_UNIT.GB, serial: serial, gb: share.remGbGty, mb: share.remMbGty }));
      }
    } else {
      $parent.append(this._noneTmpl({}));
    }
  },

  /**
   * @desc 공유한 데이터 변경하기 버튼 클릭 시
   * @param {Event} e 클릭 이벤트 객체
   */
  _handleClickEditData: function(e) {
    var $target = $(e.currentTarget),
      $parent = $target.closest('li'),
      idx = $parent.data('idx') || 0,
      serial = $parent.data('serial-number'),
      changable = { // 전체 버튼 클릭시 BFF 서버에서 내려준 데이터 그대로 전달해야 해서 필요
        gb: $target.data('gb'),
        mb: $target.data('mb')
      };

    changable.data = Number((Number(changable.gb) + Number(changable.mb) / 1024 || 0).toFixed(2));  // 변경 가능 데이터 GB 로 표시

    if (serial) { // 변경 공유 내역 가져오기
      this._apiService
        .request(Tw.API_CMD.BFF_06_0073, { shrpotSerNo: serial })
        .done($.proxy(this._handleDoneGetHistories, this, $parent, idx, changable));
    }
  },

  /**
   * @desc 공유 변경 내역 가져오기 서버 응답 시
   * @param {$object} $parent 변경하기 버튼의 부모
   * @param {number} idx 내역의 인덱스
   * @param {object} changable 변경 가능 데이터
   * @param {object} resp 서버 응답 값
   */
  _handleDoneGetHistories: function($parent, idx, changable, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var detail = this._histories[idx];
    var histories = _.map(resp.result.sharePotCancel || [], function(history) {
      history.cancelAplyDt = Tw.DateHelper.getShortDate(history.cancelAplyDt);
      return history;
    });

    var $target = $parent.find('.fe-edit');

    this._popupService.open(
      {
        hbs: 'DC_02_04_01',
        layer: true,
        detail: detail,
        data: changable.data,
        histories: histories,
        lessThanOne: changable.data < 1
      },
      $.proxy(this._handleOpenChangePopup, this, $parent, changable),
      $.proxy(this._handleCloseChangePopup, this, $target),
      'change',
      $target // 웹접근성 포커스 처리를 위한 jquery 객체
    );
  },

  /**
   * @desc 변경하기 팝업 오픈 시
   * @param {$jquery} $parent 
   * @param {object} changable 변경 가능 데이터
   * @param {$jquery} $layer 
   */
  _handleOpenChangePopup: function($parent, changable, $layer) {
    this._historyChange.init($layer, $parent, changable);
    if (changable.data < 1) {
      $layer.find('.fe-all').trigger('click');
    }
    $layer.on('click', '.prev-step', this._popupService.close);
  },

  /**
   * @desc 변경하기 팝업 close 시
   * @param {$object} $target 변경하기 버튼
   */
  _handleCloseChangePopup: function($target) {
    if (this._historyChange.isSuccess) {  // 변경하기 성공후 완료 페이지 띄우기 위함
      this._historyChange.isSuccess = false;
      this._popupService.open(
        {
          hbs: 'complete',
          text: Tw.MYT_DATA_FAMILY_SUCCESS_CHANGE_DATA,
          layer: true
        },
        $.proxy(this._handleOpenComplete, this),
        undefined,
        undefined,
        $target // 웹접근성 포커스 처리를 위한 jquery 객체
      );
    }
  },

  /**
   * 완료 팝업 이벤트 바인딩
   * @param {$object} $layer 팝업 레이어 jquery 객체
   */
  _handleOpenComplete: function($layer) {
    $layer.on('click', '.fe-submain', this._popupService.close);  // fe-submain 완료 팝업 닫기 버튼 클래스
  },

  /**
   * @desc 더보기 버튼 클릭 시
   * @param {Event} e 클릭 이벤트 객체
   */
  _handleLoadMore: function(e) {
    var display = this._histories.length - this._leftCount,
      items = _.map(this._histories.slice(display, display + Tw.DEFAULT_LIST_COUNT), function(item, idx) {
        item.idx = display + idx;
        return item;
      });

    this.$list.append(this._itemsTmpl({ items: items }));
    this._leftCount = this._leftCount - Tw.DEFAULT_LIST_COUNT;
    if (this._leftCount <= 0) {
      $(e.currentTarget).remove();
    }
  }
};
