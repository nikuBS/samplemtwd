/**
 * @file 상품 > 공통 > Define용 
 * @author kwon.junho (yamanin1@partner.sk.com)
 * @since 2019-07-19
 */

Tw.PRODUDT = Tw.PRODUDT||{};
Tw.PRODUDT.PROMOTIONS = {
  POOQ:{
    USED: 'Y',
    PRODS:{
      'NA00006516': { //Pooq 콘텐츠 팩
        SUB_PROD: ['NA00006545', 'NA00006546', 'NA00006657', 'NA00006517']
      },
      'NA00006522': { //Pooq 콘텐츠 팩 플러스
        SUB_PROD: ['NA00006543', 'NA00006544', 'NA00006657', 'NA00006523']
      },
      'NA00006577': { //Pooq 앤 데이터
        SUB_PROD: ['NA00006579', 'NA00006580', 'NA00006657', 'NA00006578']
      },
      'NA00006584': { //Pooq 앤 데이터 플러스
        SUB_PROD: ['NA00006586', 'NA00006587', 'NA00006657', 'NA00006585']
      }
    },
    BEFORE:[
      function(data, def){  //현재 사용자가 부가서비스 POOQ무료이용 사용자인지 확인함
        var svcProdId = data.svcProdId;
        if(svcProdId === 'NA00006538'){ //사용자의 요금제가 T플랜스페셜인 경우 옵션이 POOQ무료인지 확인함
          Tw.Api.request(Tw.API_CMD.BFF_05_0136, {} )
          .done(function(resp){
            var disProdList = resp.result.disProdList;
            disProdList.filter(function(e){
              return e.prodId === data.prodId;
            })
            def.resolve({isFree : disProdList.length > 0});
          });

        }else{
          def.resolve({isFree : Tw.PRODUDT.PROMOTIONS.POOQ.FREE_PRODS.indexOf(data.svcProdId) > -1});
        }       
      },
      function(data, def){  // 부가서비스 가입정보를 조회함.
        var promotion = Tw.PRODUDT.PROMOTIONS.POOQ;
        var prodIds = promotion.PRODS[data.prodId].SUB_PROD.concat(data.prodId);

        Tw.Api.request(Tw.API_CMD.BFF_10_0183, {}, {}, [prodIds.join('~')] )
        .done(function(resp){
          var joinDate1 = resp.result[prodIds[0]];  //100원프로모션 가입일
          var joinDate2 = resp.result[prodIds[1]];  //무료요금제 가입일
          var coinDate = resp.result[prodIds[2]];  //코인 적립일
          var certDate = resp.result[prodIds[3]];  // 부가서비스 인증일
          var joinDate = resp.result[prodIds[4]];   // 부가서비스 가입일
          def.resolve({joinDate: joinDate, certDate: certDate, coinDate: coinDate, joinDate1 : joinDate1, joinDate2 : joinDate2});
        });
      }
    ],
    WHEN: [function(data){
      var isFree = data.isFree;
      var pooqData = ['NA00006577', 'NA00006584'];
      var month = Tw.DateHelper.getShortDateWithFormat(new Date(), 'YYYYMM01');
      var successNum = pooqData.indexOf(data.prodId) > -1? '1': '2';
      if(/*isFree*/ data.joinDate2 !== 'N'){
        return 'FREE_1' + '_' + successNum;  // 무료요금제 이용시 안내 메시지
      }else if(data.coinDate !== 'N'){
        return null;
      }  
      
      if(data.certDate === 'N'){ //data.joinDate1 === 'N'){
        return null; 
      }else if(data.joinDate1 !== 'N' && 2 > moment(month).diff(data.joinDate1.substr(0, 6) + '01', 'month')){
        return 'NONE_FREE_1' + '_' + successNum; //100원 프로모션 이벤트 가입일 M+2
      }else{
        return 'NONE_FREE_2'; ////5000코인 지급 팝업
      }
      
      //else if(2 <= moment(month).diff(data.joinDate1.substr(0, 6) + '01', 'month')){
      //  return 'NONE_FREE_2'; ////100원 프로모션 이벤트 가입일 M+2 이상이고 코인을 지급 받지 않았을 경우
      //}
      return null;
    }],
    EXTEND: [function(data){
      var isFree = data.isFree;
      var month = Tw.DateHelper.getShortDateWithFormat(new Date(), 'YYYYMM01');
      var xtEids = {
        NA00006516: ['pooq_ret_001', 'pooq_ret_005', 'pooq_ret_009'],
        NA00006522: ['pooq_ret_002', 'pooq_ret_006', 'pooq_ret_010'],
        NA00006577: ['pooq_ret_003', 'pooq_ret_007', 'pooq_ret_011'],
        NA00006584: ['pooq_ret_004', 'pooq_ret_008', 'pooq_ret_012']
      };
      if(/*isFree*/ data.joinDate2 !== 'N'){
        return {xt: {
          eid: xtEids[data.prodId][0],
          changeCsid: '_ASCTM',
          closeCsid: '_ASC',
          topCloseCsId: '_CLS'
        }};  // 무료요금제 이용시 안내 메시지
      }else if(data.coinDate != 'N'){
        return null;
      }
      
      if(data.joinDate1 === 'N'){
        return null; 
      }else if(2 > moment(month).diff(data.joinDate1.substr(0, 6) + '01', 'month')){
        return {xt: {
          eid: xtEids[data.prodId][1],
          changeCsid: '_BSCTM',
          closeCsid: '_ASC',
          topCloseCsId: '_CLS'
        }};  // 무료요금제 이용시 안내 메시지
      }else if(2 <= moment(month).diff(data.joinDate1.substr(0, 6) + '01', 'month')){
        return {xt: {
          eid: xtEids[data.prodId][2],
          changeCsid: '_CSCTM',
          closeCsid: '_ASC',
          topCloseCsId: '_CLS'
        }};  // 무료요금제 이용시 안내 메시지
      }
      return null;
    }],
    THEN:{
      'FREE_1_1':{
        action: 'POPUP2',
        hbs1: 'RO_3.1',
        hbs2: 'RO_3.1.1'
      },
      'FREE_1_2':{
        action: 'POPUP2',
        hbs1: 'RO_3.1',
        hbs2: 'RO_3.1.2'
      },
      'NONE_FREE_1_1':{
        action: 'POPUP2',
        hbs1: 'RO_3.2',
        hbs2: 'RO_3.1.1'
      },
      'NONE_FREE_1_2':{
        action: 'POPUP2',
        hbs1: 'RO_3.2',
        hbs2: 'RO_3.1.2'
      },
      'NONE_FREE_2':{
        action: 'POPUP',
        hbs: 'RO_3.3'
      }
    },
    /**
     * T플랜 맥스: NA00006539
     * T플랜 스페셜(고객이 선택한 나머지 1가지[QOOP/FLO 중]): NA00006538
     * 5GX 플래티넘: NA00006405
     * 5GX 프라임: NA00006404
     * 5GX 스탠다드: NA00006403
     */
    FREE_PRODS: ['NA00006539', 'NA00006538', 'NA00006405', 'NA00006404', 'NA00006403']
  },
  FLO:{
    USED: 'Y',
    PRODS:{
      'NA00006520': { // FLO 앤 데이터
                  //    인증코드       적립        할인(100원)    요금제 혜택...
        SUB_PROD: [ 'NA00006521', 'NA00006655', 'NA00006541', 'NA00006542', 'NA00006576']
      },
      'NA00006599': { // FLO 앤 데이터 플러스
                 //    인증코드       적립        할인(100원)    요금제 혜택...
        SUB_PROD: [ 'NA00006600', 'NA00006655', 'NA00006601', 'NA00006602']
      }
    },
    POOQ: [ 'NA00006517', 'NA00006523', 'NA00006578', 'NA00006585'], //POOQ 관련 서비스
    FIRST_PROD : ['NA00006405', 'NA00006539'], // 최상위 요금제
    SECOND_PROD : ['NA00006404', 'NA00006538'], //차상위 요금제
    BEFORE:[
      function(data, def){  // 부가서비스 가입정보를 조회함.
        var promotion = Tw.PRODUDT.PROMOTIONS.FLO;
        var prodIds = Tw.PRODUDT.PROMOTIONS.FLO.POOQ.concat([data.prodId], promotion.PRODS[data.prodId].SUB_PROD);

        Tw.Api.request(Tw.API_CMD.BFF_10_0183, {}, {}, [prodIds.join('~')] )
          .done(function(resp){
           Tw.Logger.info('[FLO]', resp.result);

            if ( resp.code === Tw.API_CODE.CODE_00 ) {
              // POOQ 가입여부 체크
              var pooq = false; // pooq 가입여부
              for( var i = 0 ; i < Tw.PRODUDT.PROMOTIONS.FLO.POOQ.length; i++ ){
                if( resp.result[Tw.PRODUDT.PROMOTIONS.FLO.POOQ[i]] !== 'N'){
                  pooq = true;
                  break;
                }
              }
              var pooqContentsDate = resp.result['NA00006517'];  // pooq 컨텐츠팩 가입여부
              var idx =  Tw.PRODUDT.PROMOTIONS.FLO.POOQ.length;

              var joinDate = resp.result[prodIds[idx++]];   // 부가서비스 가입일
              var certDate = resp.result[prodIds[idx++]];  // 부가서비스 인증일
              var coinDate = resp.result[prodIds[idx++]];  // 코인 적립일
              var joinDate1 = resp.result[prodIds[idx++]];  // 100원프로모션 가입일
              var joinDate2 = resp.result[prodIds[idx++]];  // 무료요금제 가입일
              var joinDate3 = prodIds.length > idx ? resp.result[prodIds[idx]] : null;

              def.resolve({
                poop : pooq,
                pooqContentsDate: pooqContentsDate,
                joinDate: joinDate,
                certDate: certDate,
                coinDate: coinDate,
                joinDate1: joinDate1,
                joinDate2: joinDate2,
                joinDate3: joinDate3
              });
            } else {
              def.fail();
            }
          });
      }
    ],
    WHEN: [function(data){
      if ( data.certDate === 'N' ) {
        return null;
      }

      var month = Tw.DateHelper.getShortDateWithFormat(new Date(), 'YYYYMM01');

      if( Tw.PRODUDT.PROMOTIONS.FLO.FIRST_PROD.indexOf(data.svcProdId) > -1 && data.joinDate2 !== 'N') { //FLO 할인 2코드 & NA6405, NA6539
        return 'FREE_1'; // 무료요금제 이용시 안내 메시지(Case_01)
      } else if( data.joinDate3 && data.joinDate3 !== 'N' ) { // FLO 할인 3코드
        return 'FREE_1'; // 무료요금제 이용시 안내 메시지(Case_01)
      } else if ( Tw.PRODUDT.PROMOTIONS.FLO.SECOND_PROD.indexOf(data.svcProdId) > -1 && data.joinDate2 !== 'N') { // FLO 할인 2코드 & NA6404, NA6538

        if ( !data.poop &&  data.certDate !== 'N' ){ // POOQ 부가서비스 가입 없이 Only NA00006521 or NA00006600
          return 'FREE_1'; // 무료요금제 이용시 안내 메시지(Case_01)
        } else if ( data.prodId === 'NA00006599' && data.joinDate != 'N' && data.pooqContentsDate !== 'N' ) { // Only NA00006517 + NA00006600
          return 'FREE_1'; // 무료요금제 이용시 안내 메시지(Case_01)
        } else if ( data.coinDate !== 'N' ) { // OCB 가입
          return null;
        } else if (data.joinDate1 !== 'N') {
          if ( 2 < moment(month).diff(data.joinDate1.substr(0, 6) + '01', 'month') ){
            return 'NONE_FREE_1'; // OCB 지급 안내 (Case_03)
          } else {
            return 'NONE_FREE_2'; // 100원 프로모션 이벤트 가입일 M+2 or X (Case_02)
          }
        } else{
          return 'NONE_FREE_1'; // OCB 지급 안내 (Case_03)
        }
      } else if ( data.coinDate !== 'N') { // OCB 가입 NA6655
        return null;
      } else if( data.joinDate1 !== 'N') {
        if( 2 < moment(month).diff(data.joinDate1.substr(0,6) + '01', 'month')){
          return 'NONE_FREE_1'; // OCB 지급 안내 (Case_03)
        } else {
          return 'NONE_FREE_2';
        }
      } else {
        return 'NONE_FREE_1'; // OCB 지급 안내 (Case_03)
      }

      return null;
    }],
    EXTEND: [function(data){
      var xtEids = {
        NA00006520: ['flo_ret_001', 'flo_ret_003', 'flo_ret_005'],
        NA00006599: ['flo_ret_002', 'flo_ret_004', 'flo_ret_006']
      };

      var TYPE = Tw.PRODUDT.PROMOTIONS.FLO.WHEN[0](data);
      switch(TYPE){
        case 'FREE_1':
           return {xt: {
              eid: xtEids[data.prodId][0],
                changeCsid: '_ASCTM',
                closeCsid: '_ASC',
                topCloseCsId: '_CLS'
            }};
        case 'NONE_FREE_1':
          return {xt: {
              eid: xtEids[data.prodId][2],
              changeCsid: '_DSCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }};
        case 'NONE_FREE_2':
          return {xt: {
            eid: xtEids[data.prodId][1],
            changeCsid: '_BSCTM',
            closeCsid: '_ASC',
            topCloseCsId: '_CLS'
          }};
      }

      return null;
    }],
    THEN:{
      'FREE_1':{
        action: 'POPUP2',
        hbs1: 'RO_3.9',
        hbs2: 'RO_3.1.3'
      },
      'NONE_FREE_1':{  // OCB 지급 안내 (Case_03)
        action: 'POPUP',
        hbs: 'RO_3.5'
      },
      'NONE_FREE_2':{// 100원 프로모션 이벤트 가입일 M+2 or X (Case_02)
        action: 'POPUP2',
        hbs1: 'RO_3.4',
        hbs2: 'RO_3.1.3'
      }
    }
  }
}