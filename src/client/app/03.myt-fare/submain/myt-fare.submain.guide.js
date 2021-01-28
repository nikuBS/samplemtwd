/**
 * MenuName: 나의 요금 서브메인
 * @file myt-fare.submain.guide.js
 * @author 양정규
 * @since 2020.09.16
 * Summay: [OP002-10286] 나의 요금 서브메인 고도화. 요금 안내서 영역
 */
Tw.MyTFareSubMainGuide = function (params) {
  this.$container = params.$element;
  this.data = params.data; // data=svcInfo, guide
  this.guide = this.data.guide;
  this.resData = this.guide ? this.guide.data : undefined;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);

  this._init();
};

Tw.MyTFareSubMainGuide.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();
    this.detailCharge();
  },

  /**
   * element cache
   * @private
   */
  _cachedElement: function () {
    this._charge = Handlebars.compile($('#fe-charge').html()); // 요금 내역 템플릿
    this._months = this.$container.find('.fe-months'); // 청구월 선택 버튼
  },

  /**
   * even bind
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-payment', $.proxy(this._onPayment, this));
    this._months.on('click', $.proxy(this._onOpenClaimMonths, this));
  },

  /**
   * 요금납부 액션시트
   * @param event
   * @private
   */
  _onPayment: function (event) {
    event.preventDefault();
    new Tw.MyTFareBill(this.$container, this.data.svcInfo.svcAttrCd, $(event.currentTarget));
  },

  /**
   * @function
   * @desc 월 선택 액션시트
   * @param event
   * @private
   */
  _onOpenClaimMonths: function (event) {
    var $target = $(event.currentTarget),
      months = $target.data('months').split(','),
      self = this;

    var listData = _.map(months, function (item, idx) {
      var idAttr = Tw.StringHelper.stringf('id="mo_{0}"', idx),
        radioAttr = idAttr + ' name="r1"';
      if( item === $target.data('value').toString()){
        radioAttr += ' checked';
      }
      var date = moment(Tw.DateHelper.convDateFormat(item)).add(1, 'days');
      date = Tw.DateHelper.getShortDateWithFormat(date, Tw.MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE);
      return {
        'label-attr': idAttr + ' data-value="' + item + '"',
        'radio-attr': radioAttr,
        'txt':  date
      };
    });

    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: [{ list: listData }],
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, function ($layer) { // open callback
      Tw.CommonHelper.focusOnActionSheet($layer);
      $layer.one('click', 'li.type1', function (e){
        var $target = $(e.currentTarget);
        self._historyService.goLoad('/myt-fare/submain?date=' + $target.find('[data-value]').data('value'));
      });
    }, null, null, $target);
  },

  /**
   * 요금상세 내역
   */
  detailCharge: function () {
    if(!this.resData || !this.resData.billpayInfo) {
      return;
    }
    /* typeChk
     * A4 : 개별청구회선
     * A5 : 통합청구(대표)회선
     * A6 : 통합청구(일반)회선
     */
    var billpayInfo = this.resData.billpayInfo;
    var detailList = this.guide.typeChk === 'A6' ? billpayInfo.usedAmountDetailList : billpayInfo.paidAmtDetailList;
    if (Tw.FormatHelper.isEmptyArray(detailList)) {
      Tw.Logger.warn('[detailCharge] list is empty');
      return;
    }
    switch (this.guide.typeChk) {
      // 개별 청구
      case 'A4': this._individual(detailList); break;
      // 통합청구(대표)
      case 'A5': this._intergrated(detailList); break;
      // 통합청구(일반)
      case 'A6': this._getUseBillsInfo(detailList); break;
    }
  },

  // 상세 요금내역 렌더링
  _renderCharge: function (list) {
    // 리스트는 최대 4개까지만
    $('.fe-charge-list').prepend(this._charge({
      list: list.slice(0, 4)
    }));
  },

  // 개별 청구
  _individual: function (paidAmtDetailList) {
    // 개별 청구
    var detailList = $.extend(true, {}, paidAmtDetailList);
    detailList = this._comTraverse(detailList, 'billItmLclNm', 'invAmt');
    detailList = _.map(detailList, function (item){
      return {
        title: item.id,
        value: item.totPrice
      };
    });

    console.info('### [개별 청구]', detailList);
    this._renderCharge(detailList);
  },

  // 통합청구(대표)
  _intergrated: function (paidAmtDetailList) {
    var paidAmtDetailInfo = $.extend(true, {}, paidAmtDetailList);
    var resData = _.map(paidAmtDetailInfo, function (item) {
      // item.invAmt = Tw.FormatHelper.addComma(item.invAmt);
      item.svcNm = item.svcNm === Tw.MYT_FARE_BILL_GUIDE.PHONE_TYPE_0 ? Tw.MYT_FARE_BILL_GUIDE.PHONE_TYPE_1 : item.svcNm;
      return item;
    });
    var rootNodes = this._comTraverse(resData, 'svcMgmtNum', 'invAmt');

    var lineList = (this.resData.commDataInfo || {}).intBillLineList;
    rootNodes = _.map(rootNodes, function (rootItem) {
      _.map(lineList, function (lineItem) {
        if(rootItem.id === lineItem.svcMgmtNum){
          rootItem.label = lineItem.svcType;
          rootItem.svcInfoNm = lineItem.label;
        }
      });
      return {
        title: rootItem.label,
        hasDetail: true,
        detail: rootItem.svcInfoNm,
        value: rootItem.totPrice
      };
    });
    console.info('### [통합청구(대표)]', rootNodes);
    this._renderCharge(rootNodes);
  },

  /**
   * 통합청구(일반)
   * (node에서 조회해온 data로 처리)
   * @param res
   * @private
   */
  _getUseBillsInfo: function (usedAmountDetailList) {
    var self = this;
    var detailList = $.extend(true, {}, usedAmountDetailList);

    detailList = self._comTraverse(detailList, 'billItmLclNm', 'billInvAmt');

    detailList = _.map(detailList, function (item) {
      return {
        title: item.id,
        value: item.totPrice
      };
    });
    console.info('### [사용요금 조회]', detailList);
    this._renderCharge(detailList);
  },

  /**
   * 요금 데이터를 그룹핑하고 합계를 구함
   * @param $data - 그룹핑할 데이터
   * @param $groupKey - 그룹핑할 object key
   * @param $priceKey - 합계 key
   * @returns {*}
   * @private
   */
  _comTraverse: function ($data, $groupKey, $priceKey) {
    var self = this;
    var tempData = _.groupBy($data, $groupKey);
    var tempKey = _.keys(tempData);
    var tempCom = _.map(tempKey, function (val) {

      var childItemArr = tempData[val];

      var tempSum = 0;
      //토탈 계산
      for ( var i = 0; i < childItemArr.length; i++ ) {
        tempSum += Number(self._comUnComma(childItemArr[i][$priceKey]));
      }
      tempSum = self._comComma(tempSum);

      return {
        id: val,
        label: tempData[val][0].svcNm,
        svcInfoNm: tempData[val][0].svcInfoNm,
        // children: tempData[val], // 양정규: 필요 없는거 같음
        totPrice: tempSum
      };
    });

    return tempCom;
  },

  // 요금에 콤마 삭제
  _comUnComma: function (str) {
    str = String(str);
    return str.replace(/,/g, '');
  },

  // 요금에 콤마 추가
  _comComma: function (str) {
    str = String(str);
    return Tw.FormatHelper.addComma(str);
  }
};
