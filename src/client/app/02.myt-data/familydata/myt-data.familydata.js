/**
 * @file myt-data.familydata.js
 * @author Jiyoung Jo
 * @since 2018.10.01
 */

Tw.MyTDataFamily = function(rootEl, dataInfo) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._dataInfo = dataInfo;
  this._bindEvent();
};

Tw.MyTDataFamily.prototype = {
  MAX_LIMITATION: 200,

  /**
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$container.on('click', '.fe-setting-limit', $.proxy(this._openChangeLimit, this));
  },

  /**
   * @desc 한도 변경 성공 시
   * @param {object} resp 서버 응답
   */
  _successChangeLimitation: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
    } else {  // T가족모아 메인 페이지 그래프 및 데이터 양 재계산
      this._popupService.toast(Tw.MYT_DATA_FAMILY_TOAST.SUCCESS_CHANGE);  // 성공 토스트
      if (this.$limitBtn) {
        var $graph = this.$container.find('#fe-data-graph'),
          $remained = this.$container.find('#fe-remained-data');
        if (this.$limitBtn.data('is-mine')) {
          $graph.removeClass(function(_index, className) {  // 기존 데이터 그래프 지움
            return (className.match(/p[0-9]+$/) || []).join(' ');
          });

          var ratio = 0,
            nRemained = 0,
            remained = {},
            total = 0;
          if (this._limitation === false) { // 자유 사용 시
            total = this._dataInfo.total; // 자유 사용이면, 가족의 총 공유 양이 total
            nRemained = total - this._dataInfo.totalUsed;
            ratio = Math.floor((nRemained / total) * 100);
            remained = nRemained === 0 ? { data: 0, unit: 'KB' } : Tw.FormatHelper.convDataFormat(nRemained, Tw.DATA_UNIT.MB);
            $remained.text(remained.data + remained.unit);
          } else {
            total = Math.min(Number(this._limitation) * 1024, this._dataInfo.total);  // 한도가 있으면, 가족 총 공유 양과 한도 값 중에 최소 값이 total
            nRemained = Math.min(total - this._dataInfo.used, this._dataInfo.totalRemained);
            ratio = Math.floor((nRemained / total) * 100);
            remained =
              nRemained === 0 ? 
                { data: 0, unit: 'KB' } : 
                Tw.FormatHelper.convDataFormat(Math.min(total - this._dataInfo.used, this._dataInfo.totalRemained), Tw.DATA_UNIT.MB);
            $remained.text(remained.data + remained.unit);
          }

          $graph.addClass('p' + ratio);
        }

        this.$limitBtn.data('limitation', this._limitation);
        if (this._limitation === false) {
          this.$limitBtn
            .parent()
            .find('span')
            .text(Tw.T_FAMILY_MOA_NO_LIMITATION);
        } else {
          this.$limitBtn
            .parent()
            .find('span')
            .text(this._limitation + Tw.DATA_UNIT.GB);
        }
      }
    }
  },

  /**
   * @desc 한도 설정 버튼 클릭 시
   * @param {Event} e 클릭 이벤트
   */
  _openChangeLimit: function(e) {
    var $target = $(e.currentTarget),
      $li = $target.parents('li'),
      member = $li.data('member'),
      limitation = $target.data('limitation'),
      hasNotLimit = typeof limitation === 'boolean';

    limitation = hasNotLimit ? limitation : Number(limitation); // 기존 한도 설정 값 세팅

    this.$limitBtn = $target;
    this._popupService.open(  // 한도 변경 팝업 오픈
      {
        hbs: 'DC_02_03',
        member: member,
        hasLimit: !hasNotLimit,
        limitation: limitation,
        data: $li.find('.r-txt').html()
      },
      $.proxy(this._handleOpenChangeLimitation, this, member.mgmtNum, limitation),
      undefined,
      'limit',
      $target // 웹접근성 포커스 처리를 위한 jquery 객체
    );
  },

  /**
   * @desc 한도 설정 팝업 오픈 시
   * @param {string} mgmtNum 변경할 사용자 관리 번호
   * @param {boolean or number} limitation 현재 한도
   * @param {$object} $layer 팝업 jquery 객체
   */
  _handleOpenChangeLimitation: function(mgmtNum, limitation, $layer) {
    $layer.on('click', '#fe-change-limit', $.proxy(this._handleSubmitLimitation, this, mgmtNum, limitation));
    $layer.on('change', 'input[type="radio"]', $.proxy(this._handleChangeLimitType, this, $layer));
    $layer.on('keyup', 'span.input input', $.proxy(this._handleChangeLimitation, this, $layer));
  },

  /**
   * @desc 이용한도 변경하기 버튼 클릭 시
   * @param {string} mgmtNum 변경할 사용자 관리 번호
   * @param {boolean or number} originLimit 현재 한도
   * @param {Event} e 클릭 이벤트 객체
   */
  _handleSubmitLimitation: function(mgmtNum, originLimit, e) {
    e.currentTarget.setAttribute('disabled', 'disabled');
    var limitation = typeof this._limitation === 'boolean' ? this._limitation : Number(this._limitation), $target = $(e.currentTarget);

    // this._successChangeLimitation({ code: '00' });

    if (originLimit === limitation) { // 기존 변경 내용과 같으면
      this._popupService.openAlert(
        Tw.ALERT_MSG_MYT_DATA.A5, 
        undefined, 
        undefined, 
        undefined, 
        undefined, 
        $target // 웹접근성 포커스 처리를 위한 jquery 객체
      );
    } else if (limitation === false) {  // 자유 한도로 설정 시
      this._popupService.close();
      this._apiService.request(Tw.API_CMD.BFF_06_0051, {}, {}, [mgmtNum]).done($.proxy(this._successChangeLimitation, this));
    } else if (this.MAX_LIMITATION < Number(limitation)) {  // 최대 이용 한도(200GB)보다 크면(최대 한도는 기획 요청 값)
      this._popupService.openAlert(
        Tw.ALERT_MSG_MYT_DATA.A6.MSG, 
        Tw.ALERT_MSG_MYT_DATA.A6.TITLE, 
        undefined, 
        undefined, 
        undefined, 
        $target // 웹접근성 포커스 처리를 위한 jquery 객체
      );
    } else {  // 한도 설정
      this._popupService.close();
      this._apiService
        .request(Tw.API_CMD.BFF_06_0050, {
          mbrSvcMgmtNum: mgmtNum,
          dataQty: limitation
        })
        .done($.proxy(this._successChangeLimitation, this));
    }
  },

  /**
   * @desc 자유한도 or 한도설정 변경 시
   * @param {$object} $layer 팝업 jquery 객체
   * @param {Event} e 라디오 체인지 이벤트 객체
   */
  _handleChangeLimitType: function($layer, e) {
    var inputId = e.currentTarget.id;
    var $btn = $layer.find('.bt-red1 > button'),
      $input = $layer.find('span.input input'),
      value = $input.val();

    if (inputId === 'sradio2') {  // 변경하기 버튼 및 인풋 활성화 여부 설정
      $btn.attr('disabled', value.length === 0);
      $input.removeAttr('disabled');
      this._limitation = value;
    } else {
      $btn.attr('disabled', false);
      $input.attr('disabled', true);
      this._limitation = false;
    }
  },

  /**
   * @desc 한도 설정 인풋에 키보드 입력시
   * @param {$object} $layer 팝업 jquery 객체
   * @param {Event} e 인풋 체인지 이벤트 객체
   */
  _handleChangeLimitation: function($layer, e) {
    var value = e.currentTarget.value.replace(/[^0-9]/g, ''); // 숫자 외의 값 입력 시 지움

    e.currentTarget.value = value;

    $layer.find('.bt-red1 > button').attr('disabled', value.length === 0);
    this._limitation = value;
  }
};
