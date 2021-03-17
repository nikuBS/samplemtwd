/**
 * @file myt-fare.submain.common.js
 * @author 양정규
 * @since 2021.02.23
 * @desc 나의요금 서브메인 공통 스크립트
 */
Tw.MyTFareSubMainCommon = function (params) {
  this.$container = params.$element;
  this.data = params.data;
  this.isPrd = $('[data-is-prd]').data('is-prd'); // 상용 여부
};

Tw.MyTFareSubMainCommon.prototype = {
  /**
   * @function
   * @desc 통계코드 data attr 생성
   * @private
   */
  makeEid: function () {
    var self = this,
      eid = {},
      svcAttrCd = this.data.svcInfo.svcAttrCd;
    var isWire = svcAttrCd.indexOf('S') > -1; // 유선회선 여부

    /**
     * 회선에 따른 오퍼통계 넘버 리턴
     * @param{string} v1 무선회선일때 오퍼통계 넘버
     * @param{string} v2 유선회선일때 오퍼통계 넘버
     * @param{string} v3 PPS 회선일때 오퍼통계 넘버
     * @return{string} 해당 회선에 맞는 오퍼통계 넘버
     */
    var getEidOfLineType = function (v1, v2,v3) {
      return isWire ? v2 : (v3 && svcAttrCd === 'M2') ? v3 : v1;
    };

    var setEid = function (key, stgEId, prdEid) {
      var preCode = 'CMMA_A3_B12-';
      eid[key] = preCode + (self.isPrd ? prdEid : stgEId);
      return this;
    };

    var build = function () {
      $.each(self.$container.find('[data-make-eid]'), function (idx, item){
        var $item = $(item);
        var eidCd = eid[$item.data('make-eid')];
        if (eidCd) {
          $item.attr('data-xt_eid', eidCd)
            .attr('data-xt_csid', 'NO')
            .attr('data-xt_action', 'BC');
          $item.removeAttr('data-make-eid');
        }
      });
    };

    return {
      setEid: setEid,
      getEidOfLineType: getEidOfLineType,
      build: build
    };

  }

};
