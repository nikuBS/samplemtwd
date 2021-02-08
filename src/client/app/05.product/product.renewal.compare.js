/**
 * @file 상품 비교하기
 * @author 이윤수
 * @since 2021. 01. 28
 */
Tw.ProductCompare = function(rootEl, svcInfo, networkInfo) {
    if( !svcInfo ) {
        return;
    }

    this.$container = rootEl;
    this._svcInfo = svcInfo;
    this._networkInfo = this._parseNetworkInfo(networkInfo);
  
    this._apiService = Tw.Api;
    this._popupService = Tw.Popup;
    this._historyService = new Tw.HistoryService();
  
    this._init();
    this._bindEvent();
  };

Tw.ProductCompare.prototype = {
    _init: function() {
        this.curProdId = this._svcInfo.prodId;
        this.compareData = { 
            curPlan : '', 
            comparePlan : '' 
        };
    },
    
    _bindEvent: function() {
      this.$container.on('click','.btn-compare',$.proxy(this._comparePlan, this));
    },

   /**
   * @desc 통신망 정보 parsing
   * @return {string}
   */
    _parseNetworkInfo: function(networkInfo) {
      switch(networkInfo) {
        case 'F01713' :
          return '5G';
        case 'F01121' :
          return 'LTE';
        case 'F01122' :
          return '3G';
        case 'F01124' :
          return '2nd';
        case 'F01125' :
          return 'PPS';
        default :
          return networkInfo;
      }
    },
   
    /**
   * @desc 버튼 클릭시 팝업 호출 준비
   * @return {void} 
   */
    _comparePlan: function(e) {
        var $target = $(e.currentTarget);

        this.compareProdId = $target.data('prod-id');
        // this.compareData.curPlan = this._dataSetPlan(this.curProdId);
        // this.compareData.comparePlan = this._dataSetPlan(this.compareProdId);
        this.compareData.curPlan = {
          prodId: 'NA00006404',
          prodNm: '5GX 프라임',
          basFeeAmt: '75,000원',
          chartData: this._transChartData('9'),
          basOfrDataQtyCtt: {
            value: '9',
            unit: 'GB'
          },
          speedControll: '5Mbps 속도로 계속 사용',
          dataAddtionOption: {
            dataOption: '9GB',
            sharingDataLimit: '9GB',
            tetheringOption: '9GB',
            dataRefill: '9GB'
          },
          basOfrVcallTmsCtt: {
            value: '집전화&middot;이동전화 무제한',
            detail: '+영상 &middot; 부가통화 300분'
          },
          basOfrCharCntCtt: '기본제공'
        };
        this.compareData.comparePlan = {
          prodId: 'NA00006405',
          prodNm: '5GX 플레티넘',
          basFeeAmt: '125,000원',
          chartData: this._transChartData('무제한'),
          basOfrDataQtyCtt: {
            value: '무제한'
          },
          speedControll: '속도 제한없음',
          dataAddtionOption: {
            dataOption: '30GB',
            sharingDataLimit: '30GB',
            tetheringOption: '30GB',
            dataRefill: '데이터 무제한으로 리필하기<br>미제공'
          },
          basOfrVcallTmsCtt: {
            value: '집전화&middot;이동전화 무제한',
            detail: '+영상 &middot; 부가통화 300분'
          },
          basOfrCharCntCtt: '기본제공'
        };
        this.compareData.compareData = this._makeCompareData(this.compareData);
        this.compareData.dataAddtionOption = {
          dataOption: false,
          sharingDataLimit: true,
          tetheringOption: true,
          dataRefill: true
        };
        this.compareData.discountBenefits = [{
          benefitName: '선택 약정 제도',
          curPlan: {
            prePrice: '월 45,000원',
            curPrice: '월 33,725원'
          },
          comparePlan: {
            prePrice: '월 45,000원',
            curPrice: '월 33,725원'
          }
        }];
        this.compareData.additionBenefits = [{
          benefitKind:[{
            benefitClass:'vip',
            benefitName: 'T멤버십'
          }],
          curPlan:[{
            text: '등급유지'
          }],
          comparePlan:[{
            text: 'VIP 제공'
          }]
        },
        {
          benefitKind:[{
            benefitClass:'cover',
            benefitName: '휴대폰 보험'
          }],
          curPlan:[{
            text: '-'
          }],
          comparePlan:[{
            text: '분실파손80보험<br>50%할인',
            prePrice: '7,900원',
            curPrice: '0원'
          }]
        },
        {
          benefitKind:[{
            benefitClass:'together',
            benefitName: '함께쓰기'
          }],
          curPlan:[{
            text: '-'
          }],
          comparePlan:[{
            text: '1회선 무료',
            prePrice: '7,900원',
            curPrice: '0원'
          }]
        },
        {
          benefitKind:[{
            benefitClass:'wavve',
            benefitName: '동영상'
          },
          {
            benefitClass:'flo',
            benefitName: '음악'
          }],
          curPlan:[{
            text: '-'
          }],
          comparePlan:[{
            text: 'wavve 앤 데이터<br>또는 FLO 앤 데이터',
            option: '1개 무료 제공'
          }]
        }];
        this.compareData.graphData = this._setGraphData();
        
        this._openComparePopup(this.compareData, $target);
    },

    /**
   * @desc 각 요금제 API 통해 비교 값 세팅
   * @return {string} (임시) 
   */
    _dataSetPlan: function(prodId) {
      return prodId;
    },

      /**
   * @desc 데이터 비교 문구 생성
   * @return {string}
   */

    _makeCompareData: function(compareData) {
      var curPlanData = compareData.curPlan.basOfrDataQtyCtt.value ? (compareData.curPlan.basOfrDataQtyCtt.value ? 
        compareData.curPlan.basOfrDataQtyCtt.value : compareData.curPlan.basOfrMbDataQtyCtt.value/1000 ) : 'unknown';
      var comparePlanData = compareData.comparePlan.basOfrDataQtyCtt.value ? (compareData.comparePlan.basOfrDataQtyCtt.value ? 
        compareData.comparePlan.basOfrDataQtyCtt.value : compareData.comparePlan.basOfrMbDataQtyCtt.value / 1000 ) : 'unknown';
      var curPlanName = compareData.curPlan.prodNm;
      var comparePlanName = compareData.comparePlan.prodNm;

      var curPlanCheck = Number(curPlanData);
      var comparePlanCheck = Number(comparePlanData);
      if(isNaN(curPlanCheck) || isNaN(comparePlanCheck)) {
        if(curPlanData === 'unknown') {
          return '<em>' + comparePlanName + '</em> 요금제가<br>' + comparePlanData + ' 데이터를 제공해요.';
        } else if(curPlanData === comparePlanData) {
          return '두 요금제 모두<br>' + comparePlanData + ' 데이터를 제공해요.';
        } else if(curPlanData === '무제한') {
          return '<em>' + curPlanName + '</em> 요금제가<br>' + curPlanData + '으로 높은 데이터를 제공해요.';
        } else if(comparePlanData === '무제한') {
          return '<em>' + comparePlanName + '</em> 요금제가<br>' + comparePlanData + '으로 높은 데이터를 제공해요.';
        }
      } 
      
      if(curPlanCheck > comparePlanCheck) {
        return '<em>' + curPlanName + '</em> 요금제가<br>' + curPlanData + '으로 높은 데이터를 제공해요.';
      } else if(curPlanCheck < comparePlanCheck) {
        return '<em>' + comparePlanName + '</em> 요금제가<br>' + comparePlanData + '으로 높은 데이터를 제공해요.';
      } else if(curPlanCheck === comparePlanCheck) {
        return '두 요금제 모두<br>' + comparePlanData + ' 데이터를 제공해요.';
      } else {
        return '';
      }
    },
    
    /**
   * @desc 액션시트 출력 시 이용불가 혜택 목록
   * @return {object}
   */

    _checkConfirmActionSheet: function(compareData) {
      var cur = compareData.curPlan;
      var com = compareData.comparePlan;
      if(cur.basFeeAmt >= com.basFeeAmt) {
        return {};
      }
      

      return {};
    },

   /**
   * @desc 프로그래스 바에 넣을 데이터 생성
   * @return {Number}
   */

    _transChartData: function(data) {
      data = Number(data);
      if(isNaN(data)) {
        return 100;
      }
      if(this._networkInfo === '5G') {
        if(data <= 10) {
          return ((data / 10) / 4) * 100;
        } else if(data <= 100) {
          return (((data - 10) / 30) / 8 + 1 / 4) * 100;
        } else if(data <= 200) {
          return (((data - 100) / 100) / 4 + 5 / 8) * 100;
        } else {
          return 0;
        }
      } else {
        if(data <= 1) {
          return ((data / 0.25) * 4 / 13) * 100;
        } else if(data <= 10) {
          return (((data - 1)/3)/13 + 4/13) * 100;
        } else if(data <= 100) {
          return (((data - 10) / 30) / 13 + 7 / 13) * 100;
        } else if(data <= 200) {
          return (((data - 100) / 50) / 13 + 10 / 13) * 100;
        } else {
          return 0;
        }
      }
    },

   /**
   * @desc graph 관련 데이터 생성
   * @return {object} 
   */

    _setGraphData: function() {
      if(this._networkInfo === '5G') {
        return { is5GX : true, graphClass : 'grap2' };
      } else {
        return { is5GX : false, graphClass : 'grap3' };
      }

    },
    
    /**
   * @desc 비교하기 팝업 호출
   * @return {void} 
   */
    _openComparePopup: function(compareData, $target) {
        this._popupService.open({
            hbs: 'renewal.mobileplan.compare',
            layer: true,
            data: compareData
        },
        $.proxy(this._handleOpenComparePopup, this, compareData),
        $.proxy(this._handleCloseComparePopup, this),
        'compare',
        $target);
    },

    /**
   * @desc 비교하기 open callback 함수
   * @return {void} 
   */
    _handleOpenComparePopup: function(compareData) {
        $('.prev-step').click(_.debounce($.proxy(this._popupService.close, this), 300));
        if(1){
          $('.changePlan').click($.proxy(this._openConfirmChangePlan, this, compareData));
        } else {
          $('.changePlan').click(function() {
            this._historyService.replaceURL('/product/callplan?prod_id=' + this.compareData.comparePlan.prodId);
          });
        }
    },

    /**
   * @desc 비교하기 close callback 함수
   * @return {void} 
   */
    _handleCloseComparePopup: function() {

    },

    /**
   * @desc 요금제 변경 시 확인 ActionSheet 출력
   * @return {void} 
   */
    _openConfirmChangePlan: function(compareData, e) {
        this._popupService.open({
            hbs: 'actionsheet_compare',
            layer: true,
            data: this._getLostBenefits()
        }, 
        $.proxy(this._handleOpenConfirmPopup, this),
        $.proxy(this._handleCloseConfirmPopup, this), 
        'confirmPopup', 
        $(e.currentTarget));
    },

     /**
   * @desc 요금제 변경 확인 ActionSheet open callback 함수
   * @return {void} 
   */
    _handleOpenConfirmPopup: function(layer) {
        Tw.CommonHelper.focusOnActionSheet(layer);
        this._slidePopupClose(); // 슬라이딩 팝업 닫을 때

        $('#btn-confirm').click($.proxy(this._confirmActionSheet, this));
        $('#btn-cancel').click($.proxy(this._cancelActionSheet, this));
    },

    _handleCloseConfirmPopup: function() {
  },

     /**
   * @desc 요금제 변경 확인 ActionSheet 확인 버튼 선택 시
   * @return {void} 
   */
    _confirmActionSheet: function() {
        this._historyService.replaceURL('/product/callplan?prod_id=' + this.compareData.comparePlan.prodId);
    },

     /**
   * @desc 요금제 변경 확인 ActionSheet 취소 버튼 선택 시
   * @return {void} 
   */
    _cancelActionSheet: function() {
        setTimeout(this._popupService.close(), 300);
    },

    /**
   * 팝업 중 slide 로 팝업창을 닫을 때
   */
    _slidePopupClose: function() {
    var page = document.querySelector('.compare-actionsheet');
    var button = document.querySelector('.rn-prev-step');

    var startP = 0;
    var moveD = 0;
    var goalY = 0;

    button.addEventListener('touchstart', $.proxy(function(e) {
      startP = e.touches[0].clientY;
    }, this));

    button.addEventListener('touchmove', $.proxy(function(e) {
      moveD = startP - e.touches[0].clientY;
      if (moveD < 0) {
        page.style.transform = 'translateY(' + -1 * moveD + 'px)';
        page.style.transition = 'unset';
      }
    }, this));

    button.addEventListener('touchend', $.proxy(function() {
      goalY = (Math.abs(moveD) > page.clientHeight/5 && moveD < 0) ? page.clientHeight : 0; // 조건 추가

      page.style.transform = 'translateY(' + goalY +'px)';
      page.style.boxShadow = 'none';
      page.style.transition = 'transform 0.2s';
      startP = 0;
      moveD = 0;
    }, this));

    button.addEventListener('click', $.proxy(function() {
      goalY = page.clientHeight;

      page.style.transform = 'translateY(' + goalY + 'px)';
      page.style.boxShadow = 'none';
      page.style.transition = 'transform 0.2s';
      startP = 0;
      moveD = 0;
    }, this));

    page.addEventListener('transitionend', $.proxy(function() {
      if (goalY > 0) {
        this._popupService.close();
      }
    }, this));
  },

  /**
   * @desc 손실 혜택
   * @return {object} (임시) 
   */

  _getLostBenefits: function() {
    return {
      prodNm: this.compareData.comparePlan.prodNm,
      lostBenefits: [
        {benefit: 'T 멤버십 VIP 기본제공'},
        {benefit: '분실파손80 보험 100% 할인'},
        {benefit: '5G 스마트워치 TAB할인 2회선 무료'},
        {benefit: 'wavve 앤 데이터 플러스'}
      ]
    };
  }

};