/**
 * MenuName: 나의 요금 > 요금안내서 통합(일반)청구회선(MF_02_02)
 * @file myt-fare.bill.guide.integrated-normal.js
 * @author Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * @since 2018.09.12
 * Summay: 요금안내서 통합(일반)청구회선 조회화면 처리, 자녀 이용요금 조회
 */
Tw.MyTFareBillGuideIntegratedNormal = function () {
  // ES5 Inheritance
  Tw.MyTFareBillGuideCommon.apply(this, arguments);
};

// ES5 Inheritance
Tw.MyTFareBillGuideIntegratedNormal.prototype = Object.create(Tw.MyTFareBillGuideCommon.prototype);
Tw.MyTFareBillGuideIntegratedNormal.prototype.constructor = Tw.MyTFareBillGuideIntegratedNormal;

Tw.MyTFareBillGuideIntegratedNormal.prototype = $.extend(Tw.MyTFareBillGuideIntegratedNormal.prototype, {
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

    if(this.resData.billpayInfo && this.resData.billpayInfo.usedAmountDetailList){
      this._getUseBillsInfoInit({code:Tw.API_CODE.CODE_00, result:this.resData.billpayInfo});
    }
  },
  //--------------------------------------------------------------------------[API]
  /**
   * 사용요금 조회 결과 화면 처리
   * (node에서 조회해온 data로 처리)
   * @param res
   * @private
   */
  _getUseBillsInfoInit: function (res) {
    var thisMain = this;
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var useAmtDetailInfo = $.extend(true, {}, res.result.usedAmountDetailList);

      useAmtDetailInfo = _.map(useAmtDetailInfo, function (item) {
        item.invAmt = Tw.FormatHelper.addComma(item.billInvAmt);
        return item;
      });
      var resData = useAmtDetailInfo;
      var groupKeyArr = ['billItmLclNm', 'billItmMclNm'];
      var priceKey = 'billInvAmt';
      var rootNodes = {};
      // rootNodes.useSvcType = this._useSvcTypeFun();
      rootNodes.useSvcType = this.resData.commDataInfo;
      rootNodes.useBill = thisMain._comTraverse(resData, groupKeyArr[0], priceKey);

      _.map(rootNodes.useBill, function (val) {
        val.children = thisMain._comTraverse(val.children, groupKeyArr[1], priceKey);

        // 상세요금 아코디언 열림 여부
        if(res.result.isOpenAccordion) {
          val.isOpenAccordion = res.result.isOpenAccordion;
        }
      });

      this._svcHbDetailList(rootNodes, this.$hbDetailListArea, this.$entryTplUseBill);

      //위젯 아코디언 초기화
      skt_landing.widgets.widget_accordion($('.widget'));
      this._insertAsteMark();
    }
  }
});
