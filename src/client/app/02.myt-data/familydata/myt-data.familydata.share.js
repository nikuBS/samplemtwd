/**
 * @file myt-data.familydata.share.js
 * @author Jiyoung Jo
 * @since 2018.11.29
 */

Tw.MyTDataFamilyShare = function(rootEl, $submit) {
  this.$container = rootEl;
  this.$submitBtn = $submit;

  this._cachedElement();
  this._bindEvent();
};

Tw.MyTDataFamilyShare.prototype = {
  /**
   * @description jquery 객체 캐싱
   */
  _cachedElement: function() {
    this.$amountInput = this.$container.find('.fe-amount');
    this.$error = this.$container.find('.input-txt-type02');
    this.$pRemained = this.$container.find('p.pt4');
    this.$sRemained = this.$pRemained.find('.txt-c2');
    this.$cancel = this.$container.find('.cancel');
  },

  /**
   * @description 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$container.on('click', '.btn-type01', $.proxy(this._addShareData, this));
    this.$container.on('click', '.cancel', $.proxy(this._validateShareAmount, this));
    this.$amountInput.on('focusout', $.proxy(this._validateShareAmount, this));
    this.$amountInput.on('keyup', $.proxy(this._validateShareAmount, this));
  },

  /**
   * 데이터 플러스 버튼 클릭 시 
   * @param {Event} e 클릭 이벤트 객체
   */
  _addShareData: function(e) {
    var value = e.currentTarget.getAttribute('data-value'),
      $target = $(e.currentTarget);

    if (value === 'all') {  // 전체 클릭 시 인풋, +1, +5 버튼 비활성화
      if (this._all) {
        this.$amountInput.val('');
        this.$amountInput.removeAttr('disabled');
        $target.siblings('.btn-type01').removeAttr('disabled');
        $target.removeClass('btn-on');
        this._all = false;
      } else {
        this.$amountInput.val(this.$amountInput.data('share-amount'));
        this.$amountInput.attr('disabled', true);
        $target.siblings('.btn-type01').attr('disabled', true);
        $target.addClass('btn-on');
        this.$cancel.css('display', 'none').attr('aria-hidden', true);
        this._all = true;
      }
    } else {
      this.$amountInput.val(Number(this.$amountInput.val()) + Number(value));
      this.$cancel.css('display', 'inline-block').attr('aria-hidden', false);
    }

    this._validateShareAmount();
  },

  /**
   * @description 사용자 입력 값 validation
   */
  _validateShareAmount: function() {
    var sValue = this.$amountInput
      .val()
      .replace(/^0*/, '')
      .replace(/[^0-9]/g, '');

    this.$amountInput.val(sValue);

    var value = Number(sValue),
      limit = Number(this.$amountInput.data('share-amount'));

    if (!value) {
      this.$error.text(Tw.VALIDATE_MSG_MYT_DATA.V17);
      this.$error.removeClass('none').attr('aria-hidden', false);
      this.$sRemained.text(limit + Tw.DATA_UNIT.GB);
      this.$pRemained.removeClass('none').attr('aria-hidden', false);
      this._setDisableSubmit(true);
    } else if (value > limit) {
      this.$error
        .text(Tw.VALIDATE_MSG_MYT_DATA.V16)
        .removeClass('none')
        .attr('aria-hidden', false);
      this.$pRemained.addClass('none').attr('aria-hidden', true);
      this._setDisableSubmit(true);
    } else {
      if (!this.$error.hasClass('none')) {
        this.$error.addClass('none').attr('aria-hidden', true);
      }
      this.$sRemained.text(Number(limit - value) + Tw.DATA_UNIT.GB);
      this.$pRemained.removeClass('none').attr('aria-hidden', false);
      this._setDisableSubmit(false);
    }
  },

  /**
   * @description 변경하기 버튼 상태 변경
   * @param {boolean} disable
   */
  _setDisableSubmit: function(disable) {
    disable !== !!this.$submitBtn.attr('disabled') && this.$submitBtn.attr('disabled', disable);
  }
};
