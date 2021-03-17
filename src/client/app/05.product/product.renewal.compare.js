/**
 * @file 상품 비교하기
 * @since 2021. 01. 28
 */
Tw.ProductCompare = function(rootEl, svcInfo, networkInfo, myPLMData, cdn) {
    if( !svcInfo ) {
        return;
    }

    this.$container = rootEl;
    this._svcInfo = svcInfo;
    this._networkInfo = this._parseNetworkInfo(networkInfo);
    this._myPLMData = myPLMData;
    this._cdn = cdn;
  
    this._apiService = Tw.Api;
    this._popupService = Tw.Popup;
    this._historyService = new Tw.HistoryService();
    this._init();

     // 비교 대상에 대한 redis 정보를 얻음
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
    _parseNetworkInfo: function(networkInfo) { //네트워크 정보 데이터 파싱
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
        this._sendTracking(this._svcInfo.prodId, $target.data('prod-id'), 'CPR'); // 비교하기 버튼 눌렸을 때 통계코드 전송
        this._getRedisData(this._svcInfo.prodId, this.compareProdId, $target);
    },

    /**
     * @desc 비교대상에 대한 Redis 정보를 얻음
     */

    _getRedisData: function(curProdId, compareProdId, $target) {
      if ( !curProdId || !compareProdId ) {
        return null;
      }
      this._apiService.requestArray([
        { command: Tw.NODE_CMD.GET_BENF_PROD_INFO, params: { prodId : curProdId }},
        { command: Tw.NODE_CMD.GET_BENF_PROD_INFO, params: { prodId : compareProdId }}
      ]).done($.proxy(this._successRedis, this, $target));
    },

    /**
     * Redis 데이터 받고 데이터 파싱
     * @param $target - 비교하기 버튼
     * @param curRes - 현재 요금제 레디스 데이터
     * @param compareRes - 비교할 요금제 레디스 데이터
     */

    _successRedis: function($target,curRes,compareRes) {
      var curParse = {};
      var compareParse = {};
      if(curRes.code === Tw.API_CODE.CODE_00) {
        curParse = this._parseBenfProdInfo(curRes.result);
      } else { // 레디스 호출 실패 시 모든 혜택 빈값으로 세팅
        curParse = {
          prodBenfCd_01 : [], // 통화 혜택 데이터 셋
          prodBenfCd_02 : [], // 데이터 속도제어 데이터 셋
          prodBenfCd_03 : [], // 데이터 추가 혜택 데이터 셋
          prodBenfCd_04 : [], // 추가 혜텍 데이터 셋
          prodBenfCd_05 : [], // 안내문구 데이터 셋
        }
      }
      if(compareRes.code === Tw.API_CODE.CODE_00) {
        compareParse = this._parseBenfProdInfo(compareRes.result);
      } else {
        compareParse = { // 레디스 호출 실패 시 모든 혜택 빈값으로 세팅
          prodBenfCd_01 : [], // 통화 혜택 데이터 셋
          prodBenfCd_02 : [], // 데이터 속도제어 데이터 셋
          prodBenfCd_03 : [], // 데이터 추가 혜택 데이터 셋
          prodBenfCd_04 : [], // 추가 혜텍 데이터 셋
          prodBenfCd_05 : [], // 안내문구 데이터 셋
        }
      }

        this.curRedisData = JSON.parse(JSON.stringify(curParse)); // this.curRedisData 와 curParse 주소값 공유(얕은 복사) 끊음 
        this.compareRedisData = JSON.parse(JSON.stringify(compareParse)); // this.compareRedisData 와 compareParse 주소값 공유(얕은 복사) 끊음
        //console.log('curRedisData:',this.curRedisData);
        //console.log('compareRedisData:',this.compareRedisData);
        this._setCompareDataCur(this._myPLMData, this.curRedisData);
        this._setCompareDataCompare($target, this.compareRedisData);
        this.compareData.graphData = this._setGraphData();
        this.compareData.compareData = this._makeCompareData(this.compareData);
        this.compareData.dataBenf = this._getDataAddtionOption(this.curRedisData, this.compareRedisData);
        //console.log("데이터 추가혜택",this.compareData.dataBenf);
        var addtionalBenf = this._getAdditionalBenf(curParse, compareParse);
        this.compareData.addtionalBenf = this._parseAdditionBenf(addtionalBenf);

        //console.log("추가혜택",this.compareData.addtionalBenf);
        //console.log("최종데이터",this.compareData);
        this._openComparePopup(this.compareData, $target);
      
    },
   /**
   * @desc PLM 데이터와 redis데이터를 이용하여 데이터, 음성, 문자 기본 값 세팅
   * @return 
   */
    _setCompareDataCur: function(myPLMData, redisData) { //현재 요금제 데이터 셋 생성
      this.compareData.curPlan = {
        prodId: myPLMData.linkProdId,
        prodNm: myPLMData.prodNm,
        basFeeAmt: '',
        chartData: '', //차트 안에 들어갈 변환된 data 값
        basOfrDataQtyCtt: {
          value: '',
          unit: '',
          exist: true //그래프의 말주머니 표시 여부
        },
        speedControl: '',
        basOfrVcallTmsCtt: {
          value: Tw.FormatHelper.appendVoiceUnit(myPLMData.basOfrVcallTmsTxt),
          detail: ''
        },
        basOfrCharCntCtt: Tw.FormatHelper.appendSMSUnit(myPLMData.basOfrLtrAmtTxt)
      };

      if (myPLMData.basFeeTxt && /^[0-9]+$/.test(myPLMData.basFeeTxt)) {
        this.compareData.curPlan.basFeeAmt  = Tw.FormatHelper.addComma(myPLMData.basFeeTxt)+'원';
      } else {
        this.compareData.curPlan.basFeeAmt = myPLMData.basFeeTxt;
      }

      var data = '';
      if (!this._isEmptyAmount(myPLMData.basDataGbTxt)) {
        this.compareData.curPlan.chartData = this._transChartData(myPLMData.basDataGbTxt,'GB');
        data = Number(myPLMData.basDataGbTxt);
        if (isNaN(data)) {
          this.compareData.curPlan.basOfrDataQtyCtt.value = myPLMData.basDataGbTxt;
        } else {
          this.compareData.curPlan.basOfrDataQtyCtt.value = myPLMData.basDataGbTxt;
          this.compareData.curPlan.basOfrDataQtyCtt.unit = Tw.DATA_UNIT.GB;
        }
      } else if (!this._isEmptyAmount(myPLMData.basDataMbTxt)) {
        data = Number(myPLMData.basDataMbTxt);
        if (isNaN(data)) {
          this.compareData.curPlan.chartData = this._transChartData(myPLMData.basDataMbTxt,'MB');
          this.compareData.curPlan.basOfrDataQtyCtt.value = myPLMData.basDataMbTxt;
        } else {
          this.compareData.curPlan.chartData = this._transChartData(data,'MB');
          this.compareData.curPlan.basOfrDataQtyCtt.value = myPLMData.basDataMbTxt;
          this.compareData.curPlan.basOfrDataQtyCtt.unit = Tw.DATA_UNIT.MB;
        }
      }
      if(this.compareData.curPlan.basOfrDataQtyCtt.value == '0' || this.compareData.curPlan.basOfrDataQtyCtt.value == '') {
        this.compareData.curPlan.basOfrDataQtyCtt.exist = false;
      }

      if(redisData.prodBenfCd_02.length > 0) {
        this.compareData.curPlan.speedControl = redisData.prodBenfCd_02[0].expsBenfNm;
      }

      if(redisData.prodBenfCd_01.length > 0) {
        this.compareData.curPlan.basOfrVcallTmsCtt.detail = redisData.prodBenfCd_01[0].expsBenfNm;
      }
    },

   /**
   * @desc 비교하기 버튼의 데이터와 redis데이터를 이용하여 데이터, 음성, 문자 기본 값 세팅
   * @return 
   */

    _setCompareDataCompare: function($target, redisData) { // 비교할 요금제 데이터 셋
      this.compareData.comparePlan = {
        prodId: $target.data('prod-id'),
        prodNm: $target.data('prod-nm'),
        basFeeAmt: $target.data('prod-fee'),
        chartData: '', //차트 안에 들어갈 변환된 data 값
        basOfrDataQtyCtt: {
          value: '',
          unit: '',
          exist: true // 말 주머니 표시여부
        },
        speedControl: '',
        basOfrVcallTmsCtt: {
          value: $target.data('prod-call'),
          detail: ''
        },
        basOfrCharCntCtt: $target.data('prod-text')
      };
      if(this.compareData.comparePlan.basOfrCharCntCtt.trim().length == 0) {
        this.compareData.comparePlan.basOfrCharCntCtt = null;
      }
      if(this.compareData.comparePlan.basOfrVcallTmsCtt.value.trim().length == 0) {
        this.compareData.comparePlan.basOfrVcallTmsCtt.value = null;
      }
      var data = '';
      var chartData = '';
      data = $target.data('prod-data').trim();
      if(data == '') {
        this.compareData.comparePlan.basOfrDataQtyCtt.value = 0;
        this.compareData.comparePlan.basOfrDataQtyCtt.unit = 'GB';
        chartData = 0;
      }
      else if(data.length != data.replace(/GB/g, '').length) {
        this.compareData.comparePlan.basOfrDataQtyCtt.value = $target.data('prod-data').replace(/GB/g, '');
        this.compareData.comparePlan.basOfrDataQtyCtt.unit = 'GB';
        chartData = data.replace(/GB/g, '');
      } else if(data.length != data.replace(/MB/g, '').length) {
        this.compareData.comparePlan.basOfrDataQtyCtt.value = $target.data('prod-data').replace(/MB/g, '');
        this.compareData.comparePlan.basOfrDataQtyCtt.unit = 'MB';
        chartData = data.replace(/MB/g, '');
      } else {
        this.compareData.comparePlan.basOfrDataQtyCtt.value = data;
        chartData = data;
      }
      this.compareData.comparePlan.chartData = this._transChartData(chartData,this.compareData.comparePlan.basOfrDataQtyCtt.unit);

      if(this.compareData.comparePlan.basOfrDataQtyCtt.value == '0' || this.compareData.comparePlan.basOfrDataQtyCtt.value == '') {
        this.compareData.comparePlan.basOfrDataQtyCtt.exist = false;
      }

      if(redisData.prodBenfCd_02.length > 0) {
        this.compareData.comparePlan.speedControl = redisData.prodBenfCd_02[0].expsBenfNm;
      }

      if(redisData.prodBenfCd_01.length > 0) {
        this.compareData.comparePlan.basOfrVcallTmsCtt.detail = redisData.prodBenfCd_01[0].expsBenfNm;
      }

    },

   /**
   * @desc 레디스 데이터로 데이터 추가 옵션 리스트 생성
   * @return {list}
   */

    _getDataAddtionOption: function(curRedisData,compareRedisData) { // 데이터 추가 옵션 리스트 생성
      var _this = this;
      if(!curRedisData.prodBenfCd_03 && !compareRedisData.prodBenfCd_03) {
        return null;
      }
      
      var dataArr = [];
      for(var i in curRedisData.prodBenfCd_03) { // 1. 내 요금제 혜택 코드를 배열에 넣음
        dataArr.push(curRedisData.prodBenfCd_03[i].prodBenfTitCd);
      }
      var optionListArr = dataArr;
      for(var i in compareRedisData.prodBenfCd_03) {// 2. 비교하는 요금제의 혜택 코드를 배열에 넣음
        if(dataArr == []) {
          optionListArr.push(compareRedisData.prodBenfCd_03[i].prodBenfTitCd);
        } else {
          var dataCheck = '';
          for(var j = 0; (j<dataArr.length) && (dataCheck == ''); j++ ) {
            if(compareRedisData.prodBenfCd_03[i].prodBenfTitCd == dataArr[j]) {
              dataCheck = 'N';
            }
            if((dataCheck == '') && (j == dataArr.length - 1)) {
              optionListArr.push(compareRedisData.prodBenfCd_03[i].prodBenfTitCd);
            }
          }
        }
      }
      var set = new Set(optionListArr); // 3. 중복 제거
      optionListArr = Array.from(set);

      var dataOption = [];
      for(var i in optionListArr) { // 4. list : 혜택 목록 정보   curData : 내 혜택 정보  compareData : 비교할 요금제 정보  삽입
        dataOption.push({list:'', curData:[{}], compareData:[{}]}); // dataOption[i].curData[0], dataOption[i].compareData[0] 은 {} (push 함수 사용 위해서) 
        
        dataOption[i].list = this._getTitleText(optionListArr[i]);
       
        var checkSave = '';
        for(var j=0; j < curRedisData.prodBenfCd_03.length; j++) {
          if(optionListArr[i] == curRedisData.prodBenfCd_03[j].prodBenfTitCd) {
            dataOption[i].curData.push(curRedisData.prodBenfCd_03[j]);
          } 
        }
        checkSave = '';
        for(var j=0; j< compareRedisData.prodBenfCd_03.length; j++) {
          if(optionListArr[i] == compareRedisData.prodBenfCd_03[j].prodBenfTitCd) {
            dataOption[i].compareData.push(compareRedisData.prodBenfCd_03[j]);
          }
        }
        dataOption[i].curData.shift(); // 5. curData[0], compareData[0] 배열 첫 항 제거
        dataOption[i].compareData.shift();
      }
      if(dataOption) {
        dataOption.sort(function(preDataOption,postDataOption) { // 6. 정렬
          var preDataOptionList = preDataOption.list;
          var postDataOptionList = postDataOption.list;
          if(_this._dataAdditonOptionSort(preDataOptionList) > _this._dataAdditonOptionSort(postDataOptionList)) {
            return 1;
          }
          if(_this._dataAdditonOptionSort(preDataOptionList) == _this._dataAdditonOptionSort(postDataOptionList)) {
            return 0;
          }
          if(_this._dataAdditonOptionSort(preDataOptionList) < _this._dataAdditonOptionSort(postDataOptionList)) {
            return -1;
          }
          return 0;
        });
      }
      return dataOption;
    },

   /**
   * @desc 정렬을 위한 정렬 함수 리턴
   * @return {int}
   */

    _dataAdditonOptionSort: function(text) { // 정렬 함수, 기획파트에서 하드코딩 요청
      switch(text) {
        case '데이터 옵션':
          return 0;
        case '데이터 공유 한도':
          return 1;
        case '테더링 한도':
          return 2;
        case '데이터 리필하기':
          return 3;
        default :
          return 4;
      }
      return 4;
    },

   /**
   * @desc 추가혜택  노출 리스트 생성
   * @return {int}
   */

    _getAdditionalBenf: function(curRedisData, compareRedisData) { // 추가혜택 리스트 생성 (개별 , 택 1 리스트 각각 구분)
      if(!curRedisData.prodBenfCd_04 && !compareRedisData.prodBenfCd_04) {
        return null;
      }
      var choDataArr = []; // 택1 목록 배열
      var sepDataArr = []; // 개별 목록 배열
      for(var i in curRedisData.prodBenfCd_04) { // 1. 현재 요금제 데이터에서 개별, 택1 리스트 각각 생성
        if(curRedisData.prodBenfCd_04[i].prodBenfTypCd == '02') {
          choDataArr.push(curRedisData.prodBenfCd_04[i].prodBenfTitCd);
        } else if(curRedisData.prodBenfCd_04[i].prodBenfTypCd == '01') {
          sepDataArr.push(curRedisData.prodBenfCd_04[i].prodBenfTitCd);
        }
      }

      var choOptionListArr = JSON.parse(JSON.stringify(choDataArr)); // 얕은 복사된 배열 주소값 끊음
      var sepOptionListArr = JSON.parse(JSON.stringify(sepDataArr));
      for(var i in compareRedisData.prodBenfCd_04) { // 2. 비교할 요금제 데이터를 목록에 추가 (개별, 택1 리스트 각각)
        if(choDataArr.length == 0) {
          if(compareRedisData.prodBenfCd_04[i].prodBenfTypCd == '02') {
            choOptionListArr.push(compareRedisData.prodBenfCd_04[i].prodBenfTitCd);
          } 
        } else {
          var dataCheck = '';
          if(compareRedisData.prodBenfCd_04[i].prodBenfTypCd == '02') {
            for(var j = 0; (j<choDataArr.length) && (dataCheck == ''); j++ ) {
              if(compareRedisData.prodBenfCd_04[i].prodBenfTitCd == choDataArr[j]) {
                dataCheck = 'N';
              }
              if((dataCheck == '') && (j == choDataArr - 1)) {
                choOptionListArr.push(compareRedisData.prodBenfCd_04[i].prodBenfTitCd);
              }
            }
          }
        }
        if(sepDataArr.length == 0) {
          if (compareRedisData.prodBenfCd_04[i].prodBenfTypCd == '01') {
            sepOptionListArr.push(compareRedisData.prodBenfCd_04[i].prodBenfTitCd);
          }
        } else {
          var dataCheck = '';
          if(compareRedisData.prodBenfCd_04[i].prodBenfTypCd == '01'){
            for(var j = 0; (j<sepDataArr.length) && (dataCheck == ''); j++ ) {
              if(compareRedisData.prodBenfCd_04[i].prodBenfTitCd == sepDataArr[j]) {
                dataCheck = 'N';
              }
              if((dataCheck == '') && (j == sepDataArr.length - 1)) {
                sepOptionListArr.push(compareRedisData.prodBenfCd_04[i].prodBenfTitCd);
              }
            }
          }
        }
      }

      var finishRoof = '';
      var overlab;
      do { // 3. 택 1 혜택 리스트와 개별 혜택 리스트를 비교하여 중복되는 리스트가 있으면 개별 혜택 리스트에서 제거
        overlab = 'N'; // 중복 됬는지 여부 플래그
        if(choOptionListArr.length == 0 || sepOptionListArr.length == 0) { // 둘 중 하나가 비어있으면 바로 탈출
          finishRoof = 'Y';
        }
        for(var i = 0; (i < choOptionListArr.length) && (overlab == 'N'); i++) {
          for(var j = 0; (j < sepOptionListArr.length) && (overlab == 'N'); j++) {
            if(choOptionListArr[i] == sepOptionListArr[j]){
              overlab = j;
            }
            if((i == choOptionListArr.length - 1) && (j == sepOptionListArr.length -1) && (overlab == 'N')) {
              finishRoof = 'Y';
            }
            if(overlab != 'N') {
              overlab = Number(overlab);
              sepOptionListArr.splice(overlab, 1);
            }
          }
        }
      } while(finishRoof == '');

      var benfData = {sepList :[],chooseList:[]}; // 4. 개별 혜택 리스트 list : 개별 혜택 목록 정보   curData : 내 개별 혜택 정보  compareData : 비교할 요금제 개별 혜택 정보  삽입
      for(var i in sepOptionListArr) {
        for(var j in curRedisData.prodBenfCd_04) {
          if(sepOptionListArr[i] == curRedisData.prodBenfCd_04[j].prodBenfTitCd) {
            if(curRedisData.prodBenfCd_04[j].prodBenfTypCd == '01') {
              benfData.sepList.push({ benfList:{}, curData:{}, compareData:{} });
              benfData.sepList[i].benfList = curRedisData.prodBenfCd_04[j];
              benfData.sepList[i].curData = curRedisData.prodBenfCd_04[j];
            }
          }
        }
        for(var j in compareRedisData.prodBenfCd_04) {
          if(sepOptionListArr[i] == compareRedisData.prodBenfCd_04[j].prodBenfTitCd) {
            if(compareRedisData.prodBenfCd_04[j].prodBenfTypCd == '01') {
              if(!benfData.sepList[i]) {
                benfData.sepList.push({ benfList:{}, curData:{}, compareData:{} });
                benfData.sepList[i].benfList = compareRedisData.prodBenfCd_04[j];
              }
              benfData.sepList[i].compareData = compareRedisData.prodBenfCd_04[j];
            }
          } 
        }
      }
      for(var i in choOptionListArr) { // 5. list : 혜택 목록 정보   curData : 내 요금제 택1 혜택 정보  compareData : 비교할 요금제 택1 혜택 정보  
        for(var j in curRedisData.prodBenfCd_04) { // curSepData : 내 개별 혜택 정보 (비교할 요금제 동일한 종류의 혜택이 택 1이라 chooseList에 묶인 혜택) compareSepData : 비교할 요금제 개별 혜택 정보 (내 요금제의 동일한 종류의 혜택이 택 1이라 chooseList에 묶인 혜택) 삽입
          if(choOptionListArr[i] == curRedisData.prodBenfCd_04[j].prodBenfTitCd) {
            benfData.chooseList.push({ benfList:{}, curData:{}, compareData:{}, curSepData:{}, compareSepData:{} });
            //
            benfData.chooseList[i].benfList = curRedisData.prodBenfCd_04[j];
            if(curRedisData.prodBenfCd_04[j].prodBenfTypCd == '02') {
              benfData.chooseList[i].curData = curRedisData.prodBenfCd_04[j];
            } else {
              benfData.chooseList[i].curSepData = curRedisData.prodBenfCd_04[j];
            }
          }
        }
        for(var j in compareRedisData.prodBenfCd_04) {
          if(choOptionListArr[i] == compareRedisData.prodBenfCd_04[j].prodBenfTitCd) {
            if(!benfData.chooseList[i]) {
              benfData.chooseList.push({ benfList:{}, curData:{}, compareData:{}, curSepData:{}, compareSepData:{} });
              benfData.chooseList[i].benfList = compareRedisData.prodBenfCd_04[j];
            }
            if(compareRedisData.prodBenfCd_04[j].prodBenfTypCd == '02') {
              benfData.chooseList[i].compareData = compareRedisData.prodBenfCd_04[j];
            } else {
              benfData.chooseList[i].compareSepData = compareRedisData.prodBenfCd_04[j];
            }
          } 
        }
      }

      if(benfData.chooseList){ //noCurChooseList = true 면 나의 혜택 택 1 영역 - 로 표시됨  /  noCompareChooseList = true 면 비교할 요금제 택 1 영역 - 로 표시됨
        var curHaveList = ''; // noCurSelectList = false 면 나의 혜택 택 1 영역에 '1개 무료 제공' text 삽입  /  noCompareSelectList = false 면 비교할 요금제 혜택 택 1 영역에 '1개 무료 제공' text 삽입
        for(var i = 0; (i < benfData.chooseList.length) && (curHaveList == ''); i++) { // curData에 값이 있는지 확인
          if(benfData.chooseList[i].curData.prodId) {
            curHaveList = 'Y';
          }
          if(curHaveList == '' && i == benfData.chooseList.length - 1) {
            benfData.noCurSelectList = true;
          }
        }
        curHaveList = '';
        for(var i = 0; (i < benfData.chooseList.length) && (curHaveList == ''); i++) {// curSepData에 값이 있는지 확인
          if(benfData.chooseList[i].curSepData.prodId) {
            curHaveList = 'Y';
          }
          if(curHaveList == '' && i == benfData.chooseList.length - 1 && benfData.noCurSelectList) {
            benfData.noCurChooseList = true;
          }
        }
        var compareHaveList = '';
        for(var i = 0; (i < benfData.chooseList.length) && (compareHaveList == ''); i++) { // compareData에 값이 있는지 확인
          if(benfData.chooseList[i].compareData.prodId) {
            compareHaveList = 'Y';
          }
          if(compareHaveList == '' && i == benfData.chooseList.length - 1) {
            benfData.noCompareSelectList = true;
          }
        }
        compareHaveList = '';
        for(var i = 0; (i < benfData.chooseList.length) && (compareHaveList == ''); i++) { //compareSepData에 값이 있는지 확인
          if(benfData.chooseList[i].compareSepData.prodId) {
            compareHaveList = 'Y';
          }
          if(compareHaveList == '' && i == benfData.chooseList.length - 1 && benfData.noCompareSelectList) {
            benfData.noCompareChooseList = true;
          }
        }
        for(var i in benfData.chooseList) { // 함께 쓰기, 멤버쉽은 benfDtlCtt 예외 처리 (기획 요청 사항)
          if(benfData.chooseList[i].curSepData.prodBenfTitCd) {
            if(benfData.chooseList[i].curSepData.prodBenfTitCd == '06' || benfData.chooseList[i].curSepData.prodBenfTitCd == '08') {
              benfData.curSepDataFW = true;
              benfData.chooseList[i].curSepData.benfDtlCtt = null;
            }

          }
          if(benfData.chooseList[i].compareSepData.prodBenfTitCd) { // 함께 쓰기, 멤버쉽은 benfDtlCtt 예외 처리 (기획 요청 사항)
            if(benfData.chooseList[i].compareSepData.prodBenfTitCd == '06' || benfData.chooseList[i].compareSepData.prodBenfTitCd == '08') {
              benfData.compareSepDataFW = true;
              benfData.chooseList[i].compareSepData.benfDtlCtt = null;
            }
          }
        }
      }
      if(benfData.chooseList) { // 순서 정렬
        benfData.chooseList.sort(function(preBenfData,postBenfData) {
          var preBenfDataSeq = Number(preBenfData.benfList.expsSeq);
          var postBenfDataSeq = Number(postBenfData.benfList.expsSeq);
          if(preBenfDataSeq > postBenfDataSeq) {
            return 1;
          }
          if(preBenfDataSeq == postBenfDataSeq) {
            return 0;
          }
          if(preBenfDataSeq < postBenfDataSeq) {
            return -1;
          }
          return 0;
        });
      }
      if(benfData.sepList) { // 순서 정렬
        benfData.sepList.sort(function(preBenfData,postBenfData){
          var preBenfDataSeq = Number(preBenfData.benfList.expsSeq);
          var postBenfDataSeq = Number(postBenfData.benfList.expsSeq);
          if(preBenfDataSeq > postBenfDataSeq) {
            return 1;
          }
          if(preBenfDataSeq == postBenfDataSeq) {
            return 0;
          }
          if(preBenfDataSeq < postBenfDataSeq) {
            return -1;
          }
          return 0;
        });
      }
      return benfData;
    },

  /**
   * @desc 데이터 비교 문구 생성
   * @return {string}
   */

    _makeCompareData: function(compareData) {
      var curPlanData = compareData.curPlan.basOfrDataQtyCtt.value;
      var comparePlanData = compareData.comparePlan.basOfrDataQtyCtt.value;
      var curPlanUnit = compareData.curPlan.basOfrDataQtyCtt.unit;
      var comparePlanUnit = compareData.comparePlan.basOfrDataQtyCtt.unit;
      var curPlanName = compareData.curPlan.prodNm;
      var comparePlanName = compareData.comparePlan.prodNm;

      var curPlanCheck = Number(curPlanData);
      var comparePlanCheck = Number(comparePlanData);
      if(isNaN(curPlanCheck)) {
        if(curPlanData === '무제한') {
          if(comparePlanData === '무제한') {
            return '두 요금제 모두<br>' + '<em>' + curPlanData + '</em>' + ' 데이터를 제공해요.';
          } else if(!isNaN(comparePlanCheck)) {
            return '<em>' + curPlanName + '</em> 요금제가<br>' + '<em>' + curPlanData + curPlanUnit + '</em>' + '으로 더 많은 데이터를 제공해요.';
          } 
        } else {
          return '<em>' + comparePlanName + '</em> 요금제가<br>' + '<em>' + comparePlanData + comparePlanUnit + '</em>' + ' 데이터를 제공해요.';
        }
      } else {
        if(comparePlanData === '무제한') {
          return '<em>' + comparePlanName + '</em> 요금제가<br>' + '<em>' + comparePlanData + comparePlanUnit + '</em>' + '으로 더 많은 데이터를 제공해요.';
        } else {
          if(curPlanUnit == 'MB') {
            curPlanCheck = curPlanCheck/1024;
          }
          if(comparePlanUnit == 'MB') {
            comparePlanCheck = comparePlanCheck/1024;
          }
          if(curPlanCheck > comparePlanCheck) {
            return '<em>' + curPlanName + '</em> 요금제가<br>' + '<em>' + curPlanData + curPlanUnit + '</em>' + '으로 더 많은 데이터를 제공해요.';
          } else if(curPlanCheck < comparePlanCheck) {
            return '<em>' + comparePlanName + '</em> 요금제가<br>' + '<em>' + comparePlanData + comparePlanUnit + '</em>' + '으로 더 많은 데이터를 제공해요.';
          } else if(curPlanCheck === comparePlanCheck) {
            return '두 요금제 모두<br>' + '<em>' + comparePlanData + comparePlanUnit + '</em>' + ' 데이터를 제공해요.';
          } else {
            return '';
          }
        }
      }
    },

   /**
   * @desc 프로그래스 바에 넣을 데이터 생성
   * @return {Number}
   */

    _transChartData: function(chartData,unit) {
      data = Number(chartData);
      if(isNaN(data)) {
        if(chartData == '무제한') {
          return 100;
        } else {
          return 0;
        }
      }
      if(unit == 'MB') {
        data = data/1000;
      }
      if(this._networkInfo == '5G') {
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
          return ((data) * 4 / 13) * 100;
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
   * @desc graph 관련 데이터 생성 (5G 인지 LTE인지 판별하여 그래프 종류를 선택)
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
      compareData.cdn = this._cdn;
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
        var _this = this;
        $('.curAddtion').eq(-1).remove(); // '또는' 을 curData 개수 만큼 생성한뒤 가장 뒤에 '또는' 을 삭제
        $('.compareAddtion').eq(-1).remove(); // '또는' 을 compareData 개수 만큼 생성한뒤 가장 뒤에 '또는' 을 삭제
        $('.prev-step').click(_.debounce($.proxy(this._popupService.close, this), 300));
        var curFee = compareData.curPlan.basFeeAmt.trim().replace(/,/g,'').replace(/원/g,'');
        var compareFee = compareData.comparePlan.basFeeAmt.trim().replace(/,/g,'').replace(/원/g,'');
        var actSheetBenfData = this._getCurPlanBenefits();
        if((Number(curFee) > Number(compareFee)) && actSheetBenfData.lostBenefits) { // DG 방어 액션 시트 출력 여부
          $('.changePlan').click($.proxy(this._openConfirmChangePlan, this, actSheetBenfData));
        } else {
          $('.changePlan').click(function() {
            _this._sendTracking(_this._svcInfo.prodId, _this.compareProdId, 'CAGC'); // 통계 코드
            _this._historyService.replaceURL('/product/callplan?prod_id=' + _this.compareData.comparePlan.prodId);
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
            data: compareData
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
        this._sendTracking(this._svcInfo.prodId, this.compareProdId, 'CAG'); // 트래킹 코드
        this._historyService.replaceURL('/product/callplan?prod_id=' + this.compareData.comparePlan.prodId);
    },

     /**
   * @desc 요금제 변경 확인 ActionSheet 취소 버튼 선택 시
   * @return {void} 
   */
    _cancelActionSheet: function() {
        this._sendTracking(this._svcInfo.prodId, this.compareProdId, 'CPGC');
        setTimeout(this._popupService.close(), 300);
    },

    /**
   * 팝업 중 slide 로 팝업창을 닫을 때 (퍼블리싱 에서 제공한 script)
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
   * @desc 내 요금제 혜택 목록 가져오기 (actionSheet 표시 용)
   * @return {object} 
   */

  _getCurPlanBenefits: function() {
    var lostSepBenefits = [{}];
    var lostChooseBenefits = [{}];
    var lostBenefits;
    var n = 1;
    var m = 1;
    if(this.curRedisData.prodBenfCd_04.length > 0) {
      for(var i in this.curRedisData.prodBenfCd_04) {
        if(this.curRedisData.prodBenfCd_04[i].prodBenfTypCd=='01'){
          lostSepBenefits.push({benefit: this.curRedisData.prodBenfCd_04[i].expsBenfNm,
                                benfDtlCtt: this.curRedisData.prodBenfCd_04[i].benfDtlCtt,
                                benfAmt : false,
                                useAmt : false
            });
          if(this.curRedisData.prodBenfCd_04[i].benfAmt) {
            lostSepBenefits[n].benfAmt = Tw.FormatHelper.addComma(this.curRedisData.prodBenfCd_04[i].benfAmt.replace(/원/g,'').replace(/,/g,''));

          }
          if(this.curRedisData.prodBenfCd_04[i].useAmt) {
            lostSepBenefits[n].useAmt = Tw.FormatHelper.addComma(this.curRedisData.prodBenfCd_04[i].useAmt.replace(/원/g,'').replace(/,/g,''));
          }
          n++;       
        }
        if(this.curRedisData.prodBenfCd_04[i].prodBenfTypCd=='02'){
          lostChooseBenefits.push({benefit: this.curRedisData.prodBenfCd_04[i].expsBenfNm,
                                benfDtlCtt: this.curRedisData.prodBenfCd_04[i].benfDtlCtt,
                                benfAmt : false,
                                useAmt : false
          });
          if(this.curRedisData.prodBenfCd_04[i].benfAmt) {
            lostChooseBenefits[m].benfAmt = Tw.FormatHelper.addComma(this.curRedisData.prodBenfCd_04[i].benfAmt.replace(/원/g,'').replace(/,/g,''));
          }
          if(this.curRedisData.prodBenfCd_04[i].useAmt) {
            lostChooseBenefits[m].useAmt = Tw.FormatHelper.addComma(this.curRedisData.prodBenfCd_04[i].useAmt.replace(/원/g,'').replace(/,/g,''));
          }
          m++;
        }
      }
      lostSepBenefits.shift();
      lostChooseBenefits.shift();
      if(lostSepBenefits.length == 0) {
        lostSepBenefits = null;
      }
      if(lostChooseBenefits.length == 0) {
        lostChooseBenefits = null;
      }
      lostBenefits = true;
    } else {
      lostBenefits = false;
    }
    
    return {
      prodNm: this.compareData.curPlan.prodNm,
      lostBenefits : lostBenefits, // 표시할 혜택이 있는지 여부 (false 면 액션시트 노출 안함)
      lostSepBenefits: lostSepBenefits,
      lostChooseBenefits: lostChooseBenefits
    };
  },

  /**
   * @desc 혜택 목록 파싱 
   * @return {object} 
   */

  _parseAdditionBenf: function(addtionalBenf) {
    addtionalBenf.sepList = _.map(addtionalBenf.sepList, $.proxy(this._parseSepList, this));

    addtionalBenf.chooseList = _.map(addtionalBenf.chooseList, $.proxy(this._parseChooseList, this));

    if((addtionalBenf.sepList.length == 0) && (addtionalBenf.chooseList.length == 0)) {
      return null;
    }

    return addtionalBenf;
  },

   /**
   * @desc 추가 혜택 중 개별 혜택 데이터 파싱
   * @return {object} 
   */

  _parseSepList: function(sepList) { //추가 혜택 중 개별 혜택 데이터 파싱
    if (sepList.length > 0) {
      return null;
    }
    if(sepList.benfList) {
      sepList.benfList.titleText = this._getTitleText(sepList.benfList.prodBenfTitCd);
    }
    if(sepList.curData) {
      if(sepList.curData.benfAmt) {
        sepList.curData.benfAmt = Tw.FormatHelper.addComma(sepList.curData.benfAmt) + '원';
        if(!sepList.curData.useAmt) {
          sepList.curData.useAmt = '0원';
        } else {
          sepList.curData.useAmt = Tw.FormatHelper.addComma(sepList.curData.useAmt) + '원';
        }
      }
    }
    if(sepList.compareData) {
      if(sepList.compareData.benfAmt) {
        sepList.compareData.benfAmt = Tw.FormatHelper.addComma(sepList.compareData.benfAmt) + '원';
        if(!sepList.compareData.useAmt) {
          sepList.compareData.useAmt = '0원'
        } else {
          sepList.compareData.useAmt = Tw.FormatHelper.addComma(sepList.compareData.useAmt) + '원';
        }
      }
    }
    if(sepList.benfList.prodBenfTitCd == '05' || sepList.benfList.prodBenfTitCd == '10') { // T 멤버쉽 , 함께 쓰기는 detail 만 화면에 노출 (기획 요구사항)
      sepList.curData.expsBenfNm = null;
      sepList.compareData.expsBenfNm = null;
    }
    if(sepList.benfList.prodBenfTitCd == '05') { // T 멤버쉽이 노출될 때 해당 혜택이 없는 영역에 - 대신 '기존 등급 유지' 노출 (기획 요구사항)
      if(!sepList.curData.prodId) {
        sepList.curData.prodId = 'Y';
        sepList.curData.benfDtlCtt = '기존 등급 유지';
      }
      if(!sepList.compareData.prodId) {
        sepList.compareData.prodId = 'Y';
        sepList.compareData.benfDtlCtt = '기존 등급 유지';
      }
    }
    return sepList;
  },

  /**
   * @desc 추가 혜택 중 택 1 혜택 데이터 파싱
   * @return {object} 
   */

  _parseChooseList: function(chooseList) { //추가 혜택 중 택 1 혜택 데이터 파싱
    if (chooseList.length > 0) {
      return null;
    }
    if(chooseList.benfList) { // list 하드코딩
      chooseList.benfList.titleText = this._getTitleText(chooseList.benfList.prodBenfTitCd);
    }
    if(chooseList.benfList.prodBenfTitCd == '05') {
      if(!chooseList.curData.prodId && !chooseList.curSepData.prodId && (chooseList.compareData.prodId || chooseList.compareSepData.prodId)) { // // T 멤버쉽이 노출될 때 해당 혜택이 없는 영역에 - 대신 '기존 등급 유지' 노출 (기획 요구사항)
        chooseList.curSepData.prodId = 'Y';
        chooseList.curSepData.expsBenfNm = 'T 멤버쉽';
        chooseList.curSepData.benfDtlCtt = '기존 등급 유지';
      }
      if(!chooseList.compareData.prodId && !chooseList.compareSepData.prodId && (chooseList.curData.prodId || chooseList.curSepData.prodId)) {
        chooseList.compareSepData.prodId = 'Y';
        chooseList.compareSepData.expsBenfNm = 'T 멤버쉽';
        chooseList.compareSepData.benfDtlCtt = '기존 등급 유지';
      }
    }
    if(chooseList.benfList.prodBenfTitCd == '06' || chooseList.benfList.prodBenfTitCd == '08') { // 음악 / 영상 하드코딩 detail에 '무료' 제거
      if(chooseList.curData.prodId) {
        chooseList.curData.benfDtlCtt = null;
      }
      if(chooseList.compareData.prodId) {
        chooseList.compareData.benfDtlCtt = null;
      }
    }

    return chooseList;
  },

    /**
   * @desc 레디스 데이터에서 코드를 해당 타이틀로 치환 (하드코딩 기획에서 요청)
   * @return {string}  
   */

  _getTitleText: function(prodBenfTitCd) { //
    var titleText = '';
    switch(prodBenfTitCd) {
      case '01':
        titleText = '데이터 옵션';
        break;
      case '02':
        titleText = '데이터 공유 한도';
        break;
      case '03':
        titleText = '테더링 한도';
        break;
      case '04':
        titleText = '데이터 리필하기';
        break;
      case '05':
        titleText = 'T 멤버십';
        break;
      case '06':
        titleText = '영상';
        break;
      case '07':
        titleText = '영상/음악';
        break;
      case '08':
        titleText = '음악';
        break;
      case '09':
        titleText = '휴대폰 분실파손보험';
        break;
      case '10':
        titleText = '데이터 함께쓰기';
        break;
      default:
        titleText = '';
        break;
    }
    return titleText;
  },
  /**
   * 혜택 상품에 대한 데이터를 parsing.
   * 
   * http://devops.sktelecom.com/myshare/pages/viewpage.action?pageId=129101297
   * 
   * @param {*} redisData 
   */
  _parseBenfProdInfo: function(redisData) {
    var PACKAGES = { // prodBenfCd, prodBenfTitCd, prodBenfTypCd의 코드값을 용이하게 관리하기 위해서..
      '01': { // 통화
        prodBenfTitCds : [''],
      },
      '02': { // 데이터 속도제어
        prodBenfTitCds : [''],
      },
      '03': { // 데이터 추가 혜택
        prodBenfTitCds : ['01', '02', '03', '04'], // 데이터 옵션(01), 공유 가능 데이터 한도(02), 테더링 한도(03), 데이터 리필하기(04)
      },
      '04': { // 추가 혜택
        prodBenfTitCds : ['05', '06', '07', '08', '09', '10'], // 멤버십(05), 영상(06), 영상/음악(07), 음악(08), 보험(09), 함께쓰기(10)
      },
      '05': { // 안내문구
        prodBenfTitCds : ['']
      },
    }

    return _.reduce(redisData.benfProdInfo, function(arr, item) {
      var prodBenfCd = item.prodBenfCd; // 1 depth 항목
      var prodBenfTitCd = item.prodBenfTitCd; // 2 depth 항목

      var prodBenfCdArr = PACKAGES[prodBenfCd];
      var prodBenfTitCdArr = prodBenfCdArr.prodBenfTitCds;

      // prodBenfTitCds 범위에 속하거나, prodBenfTitCd 값이 없을 때 (prodBenfTitCd값이 없다면 기본적으로 각 데이터셋에 넣어준다.)
      // 하지만 prodBenfTitCds 범위에 속하지않으면 그 데이터는 건너뛴다.
      if ( prodBenfTitCdArr.indexOf(prodBenfTitCd) > -1 || !prodBenfTitCd ) {
        switch ( prodBenfCd ) {
          case '01': arr.prodBenfCd_01.push(item); break;
          case '02': arr.prodBenfCd_02.push(item); break;
          case '03': arr.prodBenfCd_03.push(item); break;
          case '04': arr.prodBenfCd_04.push(item); break;
          case '05': arr.prodBenfCd_05.push(item); break;
        }
      }

      return arr;
    }, {
      prodBenfCd_01 : [], // 통화 혜택 데이터 셋
      prodBenfCd_02 : [], // 데이터 속도제어 데이터 셋
      prodBenfCd_03 : [], // 데이터 추가 혜택 데이터 셋
      prodBenfCd_04 : [], // 추가 혜텍 데이터 셋
      prodBenfCd_05 : [], // 안내문구 데이터 셋
    })
  },


  /**
   * 비교하기 / 요금제 변경 트래킹 코드 전달 함수
   * 
   * @param {*} basicPid 현재 요금제
   * @param {*} comparePid 비교대상 요금제
   * @param {*} type CPR: 요금제 비교, CAG: 요금제 변경, 요금제 변경 (원장으로 바로 이동 시) : CAGC, 요금제 변경 취소 : CPGC
   */
  _sendTracking: function(basicPid, comparePid, type) {
    window.XtractorScript.xtrProdCompare(basicPid, comparePid, type);
  },

  _isEmptyAmount: function(value) {
    return !value || value === '' || value === '-';
  },

};