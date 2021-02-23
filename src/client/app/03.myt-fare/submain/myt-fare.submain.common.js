/**
 * @file myt-fare.submain.common.js
 * @author 양정규
 * @since 2021.02.23
 * @desc 나의요금 서브메인 공통 스크립트
 */
Tw.MyTFareSubMainCommon = function (params) {
  this.$container = params.$element;
};

Tw.MyTFareSubMainCommon.prototype = {
  /**
   * @function
   * @desc 통계코드 data attr 생성
   * @private
   */
  _makeEid: function () {

    var eid = {};
    var setEid = function (key, stgEId, prdEid) {
      var preCode = 'CMMA_A3_B12-';
      eid[key] = preCode + (Tw.Environment.environment === 'prd' ? prdEid : stgEId);
    };

    setEid('recentBill0', '68', ''); // 최근청구요금내역1
    setEid('recentBill1', '69', ''); // 최근청구요금내역2
    setEid('recentBill2', '70', ''); // 최근청구요금내역3

    $.each(this.$container.find('[data-make-eid]'), function (idx, item){
      var $item = $(item);
      var eidCd = eid[$item.data('make-eid')];
      if (eidCd) {
        $item.attr('data-xt_eid', eidCd)
          .attr('data-xt_csid', 'NO')
          .attr('data-xt_action', 'BC');
        $item.removeAttr('data-make-eid');
      }
    });
  }

};
