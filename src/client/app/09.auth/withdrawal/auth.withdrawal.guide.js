/**
 * FileName: auth.withdrawal.guide.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.03
 */

 Tw.AuthWithdrawalGuide = function (rootEl) {
   this.$container = rootEl;

   this._bindEvent();
 };

 Tw.AuthWithdrawalGuide.prototype = {
   _bindEvent: function () {
     this.$container.on('click', '.btn-next', function() {
       // TODO: check foreign or not, and show pop-up for verification
     });
   },
   _complete: function() {
     // TODO: check and move to survey
   }
 };
