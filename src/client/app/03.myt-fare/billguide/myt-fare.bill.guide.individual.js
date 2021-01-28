/**
 * MenuName: 나의 요금 > 요금안내서 > 다른회선요금조회(자녀)(MF_09_01)
 * @file myt-fare.bill.guide.individual.js
 * @author Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * @since 2018.09.12
 * Summay: 요금안내서 자녀 이용요금 조회화면 처리, 자녀 미납요금 버튼처리
 */
Tw.MyTFareBillGuideIndividual = function () {
  // ES5 Inheritance
  Tw.MyTFareBillGuideCommon.apply(this, arguments);
  // this._init();
};

// ES5 Inheritance
Tw.MyTFareBillGuideIndividual.prototype = Object.create(Tw.MyTFareBillGuideCommon.prototype);
Tw.MyTFareBillGuideIndividual.prototype.constructor = Tw.MyTFareBillGuideIndividual;

Tw.MyTFareBillGuideIndividual.prototype = $.extend(Tw.MyTFareBillGuideIndividual.prototype, {
  _init: function () {
    Tw.MyTFareBillGuideCommon.prototype._init.call(this);
    this._cachedElement();
    this._bindEvent();
    this._hbRegisterHelper();

    if ( this.resData.childLineInfo && this.resData.childLineInfo.length > 0 ) {
      this._getChildBillInfo();
    } else {
      $('#divChildListHaeder').hide().attr('aria-hidden', true);
    }

    if(this.resData.billpayInfo && this.resData.billpayInfo.paidAmtDetailList){
      this._getUseBillsInfoInit({code:Tw.API_CODE.CODE_00, result:this.resData.billpayInfo});
    }
  },
  /**
   * 청구요금 조회 결과 화면 처리
   * (node에서 조회해온 data로 처리)
   * @param res
   * @private
   */
  _getUseBillsInfoInit: function (res) {
    var thisMain = this;
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var useAmtDetailInfo = $.extend(true, {}, res.result.paidAmtDetailList);

      useAmtDetailInfo = _.map(useAmtDetailInfo, function (item) {
        item.invAmt = Tw.FormatHelper.addComma(item.invAmt);
        return item;
      });
      var resData = useAmtDetailInfo;
      var groupKeyArr = ['billItmLclNm', 'billItmSclNm'];
      var priceKey = 'invAmt';
      var rootNodes = {};
      rootNodes.useSvcType = this._useSvcTypeFun();
      rootNodes.useBill = thisMain._comTraverse(resData, groupKeyArr[0], priceKey);

      _.map(rootNodes.useBill, function (val) {
        val.children = thisMain._comTraverse(val.children, groupKeyArr[1], priceKey);
      });

      this._svcHbDetailList(rootNodes, this.$hbDetailListArea, this.$entryTplUseBill);

      //위젯 아코디언 초기화
      skt_landing.widgets.widget_accordion($('.widget'));
      this._insertAsteMark();
    }
  }
});
