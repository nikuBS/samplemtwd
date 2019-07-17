/**
 * @class
 * @desc 페이지 내에서 input 입력 후 키보드의 이동 버튼 클릭 시 다음 input으로 이동
 * @param  {$object} $container 페이지 container jquery 객체
 * @param  {$object} $confirm 확인 버튼 jquery 객체
 */
Tw.InputFocusService = function ($container, $confirm) {
  this.$container = $container;
  this.$confirm = $confirm;

  this._init();
};

Tw.InputFocusService.prototype = {
  /**
   * @desc 키보드 key code
   */
  KEY_CODE: {
    ENTER: 13
  },

  /**
   * @desc 페이지 내 input 리스트 설정
   * @private
   */
  _init: function () {
    this.$inputList = this.$container.find('input, textarea');
    this.$inputList = _.filter(this.$inputList, $.proxy(function (input) {
      var curInput = $(input);
      return (curInput.attr('readonly') === undefined || curInput.attr('readonly') === false) &&
        (curInput.attr('disabled') === undefined || curInput.attr('disabled') === false) &&
        curInput.attr('type') !== 'radio' &&  curInput.attr('type') !== 'checkbox' && curInput.attr('type') !== 'date';
    }, this));

    _.map(this.$inputList, $.proxy(function (input) {
      if($(input).hasClass('fe-not_new_line')){
        return;
      }

      $(input).off('keyup', $.proxy(this._onKeyupInput, this)).on('keyup', $.proxy(this._onKeyupInput, this));
    }, this));
  },

  /**
   * @desc 이동 버튼 클릭 시 다음 input으로 이동, 다음 input 없을 경우 확인 버튼 으로 이동 
   * @private
   */
  _onKeyupInput: function ($event) {
    if ( $event.keyCode === this.KEY_CODE.ENTER ) {
      var index = _.findIndex(this.$inputList, $.proxy(function (input) {
        return input === $event.currentTarget;
      }, this));
      if ( index >= 0 ) {
        var $next = this.$inputList[index + 1];
        if ( !Tw.FormatHelper.isEmpty($next) ) {
          $next.focus();
        } else {
          this.$confirm.focus();
        }
      }
    }
  }
};
