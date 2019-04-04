/**
 * @file input-focus.service.js
 * @author Ara Jo
 * @since 2018.05
 */

Tw.InputFocusService = function ($container, $confirm) {
  this.$container = $container;
  this.$confirm = $confirm;

  this._init();
};
Tw.InputFocusService.prototype = {
  KEY_CODE: {
    ENTER: 13
  },
  _init: function () {
    this.$inputList = this.$container.find('input, textarea');
    this.$inputList = _.filter(this.$inputList, $.proxy(function (input) {
      var curInput = $(input);
      return (curInput.attr('readonly') === undefined || curInput.attr('readonly') === false) &&
        (curInput.attr('disabled') === undefined || curInput.attr('disabled') === false) &&
        curInput.attr('type') !== 'radio' &&  curInput.attr('type') !== 'checkbox' && curInput.attr('type') !== 'date';
    }, this));

    _.map(this.$inputList, $.proxy(function (input) {
      $(input).off('keyup', $.proxy(this._onKeyupInput, this)).on('keyup', $.proxy(this._onKeyupInput, this));
    }, this));
  },
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