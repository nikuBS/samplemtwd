/**
 * MenuName: 나의 가입정보 > 서브메인 > 전화번호 번호변경
 * @file myt-join.submain.wire.numchange.js
 * @author Hyeryoun Lee (skt.P130712@partner.sk.com)
 * @since 2019. 7. 11.
 * Summary: 전화번호 번호변경
 */
Tw.MyTJoinPhoneNumWireChange = function ($rootEl, data) {
  this.$container = $rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._listItemTmpl = Handlebars.compile($('#list-cont-item-tmplt').html());
  this._data = JSON.parse(data);
  this._onProcess = this._data['wireSvcOperStCd'] && this._data['wireSvcOperStCd'] !== '3'; // 이전 요청 진행중
  this._onSuspend = this._data['wireSvcStCd'] && this._data['wireSvcStCd'] !== 'AC'; // 정지중
  this._bindEvent();
};

Tw.MyTJoinPhoneNumWireChange.prototype = {
  /**
   * @function
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    this.$container.on('change', 'input[type=number]', $.proxy(this._oninputNumber, this));
    this.$container.on('click', '#fe-bt-search', $.proxy(this._onclickSchNums, this));
    this.$container.on('click', '#fe-bt-next', $.proxy(this._onClickNext, this));
    this.$container.on('click', '#fe-bt-more', $.proxy(this._showMorePhoneNum, this));
    this.$container.on('change', '#fe-list .radiobox input', $.proxy(this._setBtNextEnable, this));
    new Tw.InputFocusService(this.$container, $('#fe-bt-search'));
  },
  /**
   * @function
   * @desc 번호검색 입력시 애러 메세지 리셋
   * @param event
   * @private
   */
  _oninputNumber: function (event) {
    var input = event.currentTarget;
    Tw.InputHelper.inputNumberOnly(input);
    var maxLenght = 4;
    if ( input.value.length > maxLenght ) {
      input.value = input.value.slice(0, maxLenght);
    }

    // clear error messages
    this.$container.find('.error-txt').hide();
  },
  /**
   * @function
   * @desc 변경가능 번호 검색 요청
   * @private
   */
  _onclickSchNums: function (e) {

    var param = {
      staLineNum: $('#input-from').val(),
      endLineNum: $('#input-to').val()
    };

    if ( Tw.FormatHelper.isEmpty(param.staLineNum) || param.staLineNum.length !== 4
      || Tw.FormatHelper.isEmpty(param.endLineNum) || param.endLineNum.length !== 4 ) {
      this.$container.find('#err-no-input').show();
      return;
    }
    if ( parseInt(param.staLineNum, 10) > parseInt(param.endLineNum, 10) ) {
      // 2-V13 번호 뒷자리가 앞자리보다 높습니다.
      this.$container.find('#err-larger-from').show();
      return;
    }
    if ( parseInt(param.endLineNum, 10) - parseInt(param.staLineNum, 10) > 100 ) {
      // 2-V13 번호 조회범위는 100을 넘을 수 없습니다.
      this.$container.find('#err-over-100').show();
      return;
    }

    if ( this._onSuspend ) {
      this._popupService.openAlert(Tw.WIRE_NUMBER_CHANGE.NOT_ON_SERVICE);
      return;
    }

    if ( this._onProcess ) {
      this._popupService.openAlert(Tw.WIRE_NUMBER_CHANGE.HAS_PREV_REQUEST);
      return;
    }

    // 변경할 번호 search
    this._apiService.request(Tw.API_CMD.BFF_05_0210, param, {})
      .done($.proxy(this._onSuccessSearchNumber, this))
      .fail(function (err) {
        Tw.Error(err.status, err.statusText).pop();
        Tw.CommonHelper.endLoading('.container');
      });
  },
  /**
   * @function
   * @desc 변경가능 검색 success callback
   * @private
   */
  _onSuccessSearchNumber: function (resp) {
    Tw.CommonHelper.endLoading('.container');
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.result.record.length < 1 ) {
        this._popupService.openAlert(Tw.WIRE_NUMBER_CHANGE.NOT_AVAILABLE_NUMBER);
      } else {
        $('#fe-list').html('');
        this._lastSeq = 0;
        this._list = resp.result.record;
        if ( this._list && this._list.length > 0 ) {
          $('#fe-num-list-wrapper').show().attr('aria-hidden', false);
        }

        this._showMorePhoneNum();
        this._setBtNextEnable();
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  /**
   * @function
   * @desc '다음'버튼 활성화 설정
   * @private
   */
  _setBtNextEnable: function () {
    var btnDisabled = ($('#fe-list .radiobox.checked').length === 0);
    $('#fe-bt-next').attr('disabled', btnDisabled);
  },
  /**
   * @function
   * @desc 더보기 버튼 보이김/숨기기
   * @private
   */
  _showOrHideMoreBtn: function () {
    if ( !this._list || this._list.length === 0 || !this._lastSeq || this._lastSeq >= this._list.length ) {
      $('#fe-bt-more').hide().attr('aria-hidden', true);
    } else {
      $('#fe-bt-more').show().attr('aria-hidden', false);
    }
  },
  /**
   * @function
   * @desc 목록 더 보기
   * @private
   */
  _showMorePhoneNum: function () {

    this._lastSeq = this._lastSeq || 0;
    var listLimit = 20;
    var sttNo = this._lastSeq;
    var endNo = this._lastSeq + listLimit;
    if ( endNo > this._list.length ) {
      endNo = this._list.length;
    }
    var html = '';
    for ( var i = sttNo; i < endNo; i++ ) {
      html = this._listItemTmpl(this._list[i]);
      $('#fe-list').append(html);
    }
    skt_landing.widgets.widget_radio('#fe-list');

    this._lastSeq = endNo;
    this._showOrHideMoreBtn();
  },
  /**
   * @function
   * @desc 번경하기 버튼 클릭시 -> 확인 화면으로 이동
   * @private
   */
  _onClickNext: function () {
    this._options = {
      from: this._data.svcNum,
      to: $('#fe-list .radiobox.checked input').attr('title'),
      afterSvcNum: $('#fe-list .radiobox.checked input').val()
    };

    this._popupService.open(
      {
        hbs: 'MS_04_01_01',
        layer: true,
        data: this._options
      },
      $.proxy(function ($root) {
        $root.on('click', '.prev-step, #fe-bt-back', this._popupService.close);
        $root.on('click', '#fe-bt-confirm', $.proxy(this._requestChangeNumber, this));
      }, this),
      null,
      'confirm'
    );
  },
  /**
   * @function
   * @desc 전화번호 변경 요청
   * @param
   * @private
   */
  _requestChangeNumber: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0211,
      { afterSvcNum: this._options.afterSvcNum }, {})
      .done($.proxy(this._onSuccessChangeNumber, this))
      .fail(function (err) {
        Tw.Error(err.status, err.statusText).pop();
        Tw.CommonHelper.endLoading('.container');
      });
  },
  /**
   * @function
   * @desc 전화번호 변경 요청 성공 콜백
   * @param resp
   * @private
   */
  _onSuccessChangeNumber: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._goCompletePage();
    } else {
      Tw.Error(resp.code, resp.msg).pop();
      Tw.CommonHelper.endLoading('.container');
    }
  },
  /**
   * @function
   * @desc 완료페이지로 가기
   * @param
   * @private
   */
  _goCompletePage: function () {
    var param = '?' +
      'confirmMovPage=' + '/myt-join/submain' + '&' +
      'mainTxt=' + Tw.WIRE_NUMBER_CHANGE.COMPLETE.CONTENTS + '&' +
      'subTxt=' + Tw.WIRE_NUMBER_CHANGE.COMPLETE.DESC.replace('{{NUMBER}}', this._options.to) + '&' +
      'linkTxt=' + Tw.WIRE_NUMBER_CHANGE.COMPLETE.LINK + '&' +
      'linkPage=' + '/main/home';
    this._historyService.replaceURL('/myt-join/submain/wire/numchange/complete' + param);
  }

};
