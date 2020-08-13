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
    FLO: ['NA00006521', 'NA00006600'], //FLO 관련 서비스
    FIRST_PROD : ['NA00006405', 'NA00006539'], // 최상위 요금제
    SECOND_PROD : ['NA00006404', 'NA00006538'], //차상위 요금제
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
        //var prodIds = promotion.PRODS[data.prodId].SUB_PROD.concat(data.prodId);
        var prodIds = Tw.PRODUDT.PROMOTIONS.POOQ.FLO.concat([data.prodId], promotion.PRODS[data.prodId].SUB_PROD);

        Tw.Api.request(Tw.API_CMD.BFF_10_0183, {}, {}, [prodIds.join('~')] )
        .done(function(resp){
        Tw.Logger.info('[POOQ]', resp.result);

          if ( resp.code === Tw.API_CODE.CODE_00 ) {

            // FLO 가입여부 체크
            var flo = false; // FLO 가입여부
            for( var i = 0 ; i < Tw.PRODUDT.PROMOTIONS.POOQ.FLO.length; i++ ){
              if( resp.result[Tw.PRODUDT.PROMOTIONS.POOQ.FLO[i]] !== 'N'){
                flo = true;
                break;
              }
            }
            var floContentsDate = resp.result['NA00006600'];  // FLO 컨텐츠팩 가입여부
            var idx =  Tw.PRODUDT.PROMOTIONS.POOQ.FLO.length;

            var joinDate = resp.result[prodIds[idx++]];   // 부가서비스 가입일
            var joinDate1 = resp.result[prodIds[idx++]];  //100원프로모션 가입일
            var joinDate2 = resp.result[prodIds[idx++]];  //무료요금제 가입일
            var coinDate = resp.result[prodIds[idx++]];  //코인 적립일
            var certDate = resp.result[prodIds[idx++]];  // 부가서비스 인증일
            def.resolve({
              flo: flo,
              floContentsDate: floContentsDate,
              joinDate: joinDate,
              joinDate1: joinDate1,
              joinDate2: joinDate2, 
              coinDate: coinDate,
              certDate: certDate
            });
          } else {
            def.fail();
          }
        });

      },
      function(data, def){  // 상품 최초가입일 조회함.
        var promotion = Tw.PRODUDT.PROMOTIONS.POOQ;
        var prodIds = Tw.PRODUDT.PROMOTIONS.POOQ.FLO.concat([data.prodId], promotion.PRODS[data.prodId].SUB_PROD);

        Tw.Api.request(Tw.API_CMD.BFF_10_0191, {}, {}, [prodIds[6]] )
        .done(function(resp){

          if ( resp.code === Tw.API_CODE.CODE_00 ) {

            var fstScrbDt = resp.result.fstScrbDt;  // 상품 최초가입일 조회
 
            def.resolve({
              fstScrbDt: fstScrbDt
            });
          } else {
            def.fail();
          }
        });

      }
    ],
    WHEN: [function(data){
      var isFree = data.isFree;
      var pooqData = ['NA00006577', 'NA00006584'];
      var month = Tw.DateHelper.getShortDateWithFormat(new Date(), 'YYYYMM01');
      var successNum = pooqData.indexOf(data.prodId) > -1? '1': '2';

      if ( data.certDate === 'N' ) {
        return null;
      }

      if  (data.fstScrbDt.substr(0, 4) === '2019') {
        if (Tw.PRODUDT.PROMOTIONS.POOQ.FIRST_PROD.indexOf(data.svcProdId) > -1 && data.joinDate2 !== 'N') { //POOQ 할인 2코드 & NA6405, NA6539
          return 'FREE_1' + '_' + successNum;  // 무료요금제 이용시 안내 메시지(Case_01)
        } else if (Tw.PRODUDT.PROMOTIONS.POOQ.SECOND_PROD.indexOf(data.svcProdId) > -1 && data.joinDate2 !== 'N') { //POOQ 할인 2코드 & NA6404, NA6538
          if ( !data.flo && data.certDate !== 'N'){ //FLO 부가서비스 가입 없이 Only NA00006517 or NA00006523 or NA00006578 or NA00006585
            return 'FREE_1' + '_' + successNum;  // 무료요금제 이용시 안내 메시지(Case_01)
          } else if (data.prodId === 'NA00006516' && data.joinDate !== 'N' && data.floContentsDate !== 'N') { //Only NA00006517 + NA00006600
            if (data.coinDate !== 'N') { //코인지급내역
              if (month === data.coinDate.substr(0, 6) + '01' ) { //NA00006657 가입 기간 M월
                return 'NONE_FREE_2_3'; ////코인 미지급 팝업
              }else{
                return 'NONE_FREE_2_2';
              }
            } else {
              return 'NONE_FREE_2_1'; ////10000코인 지급 팝업
            }
          }else{
            return 'FREE_1' + '_' + successNum;  // 무료요금제 이용시 안내 메시지(Case_01)
          }

        } else {
          if (data.coinDate !== 'N') { //코인지급내역
            if (month === data.coinDate.substr(0, 6) + '01' ) { //NA00006657 가입 기간 M월
              return 'NONE_FREE_2_3'; ////코인 미지급 팝업
            }else{
              return 'NONE_FREE_2_2';
            }
          } else {
            return 'NONE_FREE_2_1'; ////10000코인 지급 팝업
          }
        }

      } else {
        if ( (Tw.PRODUDT.PROMOTIONS.POOQ.FIRST_PROD.indexOf(data.svcProdId) > -1 || Tw.PRODUDT.PROMOTIONS.POOQ.SECOND_PROD.indexOf(data.svcProdId) > -1) && data.joinDate2 !== 'N') { //POOQ 할인 2코드 & NA6405, NA6539, NA6404, NA6538
          return 'FREE_1' + '_' + successNum;  // 무료요금제 이용시 안내 메시지(Case_01)
        } else if (data.joinDate1 !== 'N') {
          if (1 <= moment(month).diff(data.fstScrbDt.substr(0, 6) + '01', 'month') ) {
            if (data.coinDate !== 'N') { //코인지급내역
              if (month === data.coinDate.substr(0, 6) + '01' ) { //NA00006657 가입 기간 M월
                return 'NONE_FREE_2_3'; ////코인 미지급 팝업
              }else{
                return 'NONE_FREE_2_2';
              }
            } else {
              return 'NONE_FREE_2_1'; ////10000코인 지급 팝업
            }
          } else {
              return 'NONE_FREE_1' + '_' + successNum; //100원 프로모션(Case_02) 상품변경옵션 기존 해지 프로세스
          }
        } else {
          if (data.coinDate !== 'N') { //코인지급내역
            if (month === data.coinDate.substr(0, 6) + '01' ) { //NA00006657 가입 기간 M월
              return 'NONE_FREE_2_3'; ////코인 미지급 팝업
            }else{
              return 'NONE_FREE_2_2';
            }
          } else {
            return 'NONE_FREE_2_1'; ////10000코인 지급 팝업
          }
        }
        
      }
    }],
    EXTEND: [function(data){
      var xtEids = {
        NA00006516: ['pooq_ret_001', 'pooq_ret_005', 'pooq_ret_009', 'pooq_ret_013', 'pooq_ret_017'],
        NA00006522: ['pooq_ret_002', 'pooq_ret_006', 'pooq_ret_010', 'pooq_ret_014', 'pooq_ret_018'],
        NA00006577: ['pooq_ret_003', 'pooq_ret_007', 'pooq_ret_011', 'pooq_ret_015', 'pooq_ret_019'],
        NA00006584: ['pooq_ret_004', 'pooq_ret_008', 'pooq_ret_012', 'pooq_ret_016', 'pooq_ret_020']
      };
      
      var TYPE = Tw.PRODUDT.PROMOTIONS.POOQ.WHEN[0](data);
      switch(TYPE){
        case 'FREE_1_1':
           return {xt: {
              eid: xtEids[data.prodId][0],
              eid1: xtEids[data.prodId][3],
                changeCsid: '_ASCTM',
                closeCsid: '_ASC',
                topCloseCsId: '_CLS'
            }};
        case 'FREE_1_2':
          return {xt: {
              eid: xtEids[data.prodId][0],
              eid1: xtEids[data.prodId][3],
                changeCsid: '_ASCTM',
                closeCsid: '_ASC',
                topCloseCsId: '_CLS'
            }};
        case 'NONE_FREE_1_1':
          return {xt: {
              eid: xtEids[data.prodId][1],
              eid1: xtEids[data.prodId][3],
              changeCsid: '_BSCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }};
        case 'NONE_FREE_1_2':
          return {xt: {
              eid: xtEids[data.prodId][1],
              eid1: xtEids[data.prodId][3],
              changeCsid: '_BSCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }};
        case 'NONE_FREE_2_1':
          return {xt: {
            eid1: xtEids[data.prodId][3],
            eid2: xtEids[data.prodId][2],
            changeCsid: '_CSCTM',
            closeCsid: '_ASC',
            topCloseCsId: '_CLS'
          }};
        case 'NONE_FREE_2_2':
          return {xt: {
            eid1: xtEids[data.prodId][3],
            changeCsid: '_FSCTM',
            closeCsid: '_ASC',
            topCloseCsId: '_CLS'
          }};
        case 'NONE_FREE_2_3':
          return {xt: {
            eid1: xtEids[data.prodId][3],
            eid2: xtEids[data.prodId][4],
            changeCsid: '_DSCTM',
            closeCsid: '_ASC',
            topCloseCsId: '_CLS'
          }};
      }
      return null;
    }],
    THEN:{
      'FREE_1_1':{
        action: 'POPUP2',
        hbs1: 'RO_3.1',
        hbs2: 'RO_3.1.1',
        hbs3: 'RO_4.9.1',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'FREE_1_2':{
        action: 'POPUP2',
        hbs1: 'RO_3.1',
        hbs2: 'RO_3.1.2',
        hbs3: 'RO_4.9.1',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'NONE_FREE_1_1':{
        action: 'POPUP2',
        hbs1: 'RO_3.2',
        hbs2: 'RO_3.1.1',
        hbs3: 'RO_4.9.1',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'NONE_FREE_1_2':{
        action: 'POPUP2',
        hbs1: 'RO_3.2',
        hbs2: 'RO_3.1.2',
        hbs3: 'RO_4.9.1',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'NONE_FREE_2_1':{
        action: 'POPUP2',
        hbs1: 'RO_4.9.2',
        hbs2: 'RO_3.3',
        titleNm1: '상품안내',
        titleNm2: '혜택안내'
      },
      'NONE_FREE_2_2':{
        action: 'POPUP',
        hbs: 'RO_4.9.1',
        titleNm: '상품안내'
      },
      'NONE_FREE_2_3':{
        action: 'POPUP2',
        hbs1: 'RO_4.9.2',
        hbs2: 'RO_4.2',
        titleNm1: '상품안내',
        titleNm2: '혜택안내'
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
                  //    인증코드       적립        할인(100원)    요금제 혜택  FLO_유지_적립완료  적용 할인3코드(T플랜 에센스 혜택)
        SUB_PROD: [ 'NA00006521', 'NA00006655', 'NA00006541', 'NA00006542', 'NA00007013', 'NA00006576']
      },
      'NA00006599': { // FLO 앤 데이터 플러스
                 //    인증코드       적립        할인(100원)    요금제 혜택   FLO_유지_적립완료
        SUB_PROD: [ 'NA00006600', 'NA00006655', 'NA00006601', 'NA00006602', 'NA00007013']
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
              var pooqContentsPlusDate = resp.result['NA00006523'];  // Pooq 콘텐츠 팩 플러스 가입여부
              var idx =  Tw.PRODUDT.PROMOTIONS.FLO.POOQ.length;

              var joinDate = resp.result[prodIds[idx++]];   // 부가서비스 가입일
              var certDate = resp.result[prodIds[idx++]];  // 부가서비스 인증일
              var coinDate = resp.result[prodIds[idx++]];  // 코인 적립일
              var joinDate1 = resp.result[prodIds[idx++]];  // 100원프로모션 가입일
              var joinDate2 = resp.result[prodIds[idx++]];  // 무료요금제 가입일
              var floUseDate = resp.result[prodIds[idx++]];  // FLO_유지_적립완료일
              var joinDate3 = prodIds.length > idx ? resp.result[prodIds[idx]] : null; //적용 할인3코드(T플랜 에센스 혜택)

              def.resolve({
                pooq : pooq,
                pooqContentsDate: pooqContentsDate,
                pooqContentsPlusDate: pooqContentsPlusDate,
                joinDate: joinDate,
                certDate: certDate,
                coinDate: coinDate,
                joinDate1: joinDate1,
                joinDate2: joinDate2,
                floUseDate: floUseDate,
                joinDate3: joinDate3
              });
            } else {
              def.fail();
            }
          });
      },

      function(data, def){  // 상품 최초가입일 조회함.
        var promotion = Tw.PRODUDT.PROMOTIONS.FLO;
        var prodIds = Tw.PRODUDT.PROMOTIONS.FLO.POOQ.concat([data.prodId], promotion.PRODS[data.prodId].SUB_PROD);

        Tw.Api.request(Tw.API_CMD.BFF_10_0191, {}, {}, [prodIds[5]] )
        .done(function(resp){

          if ( resp.code === Tw.API_CODE.CODE_00 ) {

            var fstScrbDt = resp.result.fstScrbDt;  // 상품 최초가입일 조회
 
            def.resolve({
              fstScrbDt: fstScrbDt
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

      if  (data.fstScrbDt.substr(0, 4) === '2019') {
        if  ( Tw.PRODUDT.PROMOTIONS.FLO.FIRST_PROD.indexOf(data.svcProdId) > -1 && data.joinDate2 !== 'N') { //FLO 할인 2코드 & NA6405, NA6539
          return 'FREE_1'; // 무료요금제 이용시 안내 메시지(Case_01)
        } else if ( data.joinDate3 && data.joinDate3 !== 'N' ) { // FLO 할인 3코드
          return 'NONE_FREE_1'; // 50% 할인혜택 이용시 안내 (Case_03)
        } else if ( Tw.PRODUDT.PROMOTIONS.FLO.SECOND_PROD.indexOf(data.svcProdId) > -1 && data.joinDate2 !== 'N') { // FLO 할인 2코드 & NA6404, NA6538

          if ( !data.pooq &&  data.certDate !== 'N' ){ // POOQ 부가서비스 가입 없이 Only NA00006521 or NA00006600
            return 'FREE_1'; // 무료요금제 이용시 안내 메시지(Case_01)
          } else if ( data.prodId === 'NA00006599' && data.joinDate !== 'N' && data.pooqContentsDate !== 'N' ) { // Only NA00006517 + NA00006600
            return 'FREE_1'; // 무료요금제 이용시 안내 메시지(Case_01)
          } else if ( data.coinDate !== 'N' || data.floUseDate !== 'N') { // OCB지급 Y or FLO_유지_적립완료
            if( data.coinDate === 'N' || 2 <= moment(month).diff(data.coinDate.substr(0,6) + '01', 'month') ){
              return 'NONE_FREE_3_2'; // OCB지급 Y , 가입월 M+2 이상
            }else{
              return 'NONE_FREE_3_3'; // OCB지급 Y , 가입월 M+1 이하
            }
          } else {
            return 'NONE_FREE_3_1'; // OCB지급 N
          }
        } else if ( data.coinDate !== 'N' || data.floUseDate !== 'N') { // OCB지급 Y or FLO_유지_적립완료
          if( data.coinDate === 'N' || 2 <= moment(month).diff(data.coinDate.substr(0,6) + '01', 'month') ){
            return 'NONE_FREE_3_2'; // OCB지급 Y , 가입월 M+2 이상
          }else{
            return 'NONE_FREE_3_3'; // OCB지급 Y , 가입월 M+1 이하
          }
        } else {
          return 'NONE_FREE_3_1'; // OCB지급 N
        }

      } else  {
        if  ( Tw.PRODUDT.PROMOTIONS.FLO.FIRST_PROD.indexOf(data.svcProdId) > -1 && data.joinDate2 !== 'N') { //FLO 할인 2코드 & NA6405, NA6539
          return 'FREE_1'; // 무료요금제 이용시 안내 메시지(Case_01)
        } else if ( Tw.PRODUDT.PROMOTIONS.FLO.SECOND_PROD.indexOf(data.svcProdId) > -1 && data.joinDate2 !== 'N') { // FLO 할인 2코드 & NA6404, NA6538
          if ( !data.pooq &&  data.certDate !== 'N' ) { // POOQ 부가서비스 가입 없이 Only NA00006521 or NA00006600
            return 'FREE_1'; // 무료요금제 이용시 안내 메시지(Case_01)
          } else if ( data.joinDate != 'N' && (data.pooqContentsDate !== 'N' || data.pooqContentsPlusDate !== 'N') ) { // Only NA00006517 or NA00006523
            return 'FREE_1'; // 무료요금제 이용시 안내 메시지(Case_01)
          } else if (data.joinDate1 !== 'N') {
            if ( 1 <= moment(month).diff(data.fstScrbDt.substr(0, 6) + '01', 'month') ) {
              if ( data.coinDate !== 'N' || data.floUseDate !== 'N') { // OCB지급 Y or FLO_유지_적립완료
                if( data.coinDate === 'N' || 2 <= moment(month).diff(data.coinDate.substr(0,6) + '01', 'month') ){
                  return 'NONE_FREE_3_2'; // OCB지급 Y , 가입월 M+2 이상
                }else{
                  return 'NONE_FREE_3_3'; // OCB지급 Y , 가입월 M+1 이하
                }
              } else {
                return 'NONE_FREE_3_1'; // OCB지급 N
              }
            } else {
              return 'NONE_FREE_2'; //case02, case04, 해지
            }
          } else {
            if ( data.coinDate !== 'N' || data.floUseDate !== 'N') { // OCB지급 Y or FLO_유지_적립완료
              if( data.coinDate === 'N' || 2 <= moment(month).diff(data.coinDate.substr(0,6) + '01', 'month') ){
                return 'NONE_FREE_3_2'; // OCB지급 Y , 가입월 M+2 이상
              }else{
                return 'NONE_FREE_3_3'; // OCB지급 Y , 가입월 M+1 이하
              }
            } else {
              return 'NONE_FREE_3_1'; // OCB지급 N
            }
          }
        } else if ( data.joinDate1 !== 'N') {
          if  ( 1 <= moment(month).diff(data.fstScrbDt.substr(0,6) + '01', 'month') ) {
            if ( data.coinDate !== 'N' || data.floUseDate !== 'N') { // OCB지급 Y or FLO_유지_적립완료
              if( data.coinDate === 'N' || 2 <= moment(month).diff(data.coinDate.substr(0,6) + '01', 'month') ){
                return 'NONE_FREE_3_2'; // OCB지급 Y , 가입월 M+2 이상
              }else{
                return 'NONE_FREE_3_3'; // OCB지급 Y , 가입월 M+1 이하
              }
            } else {
              return 'NONE_FREE_3_1'; // OCB지급 N
            }
          } else {
            return 'NONE_FREE_2'; //case02, case04, 해지
          }
        } else {
          if ( data.coinDate !== 'N' || data.floUseDate !== 'N') { // OCB지급 Y or FLO_유지_적립완료
            if( data.coinDate === 'N' || 2 <= moment(month).diff(data.coinDate.substr(0,6) + '01', 'month') ){
              return 'NONE_FREE_3_2'; // OCB지급 Y , 가입월 M+2 이상
            }else{
              return 'NONE_FREE_3_3'; // OCB지급 Y , 가입월 M+1 이하
            }
          } else {
            return 'NONE_FREE_3_1'; // OCB지급 N
          }
        }
      }
      return null;
    }],
    EXTEND: [function(data){
      var xtEids = {
        NA00006520: ['flo_ret_001', 'flo_ret_003', 'flo_ret_005', 'flo_ret_007', 'flo_ret_009', 'flo_ret_011'],
        NA00006599: ['flo_ret_002', 'flo_ret_004', 'flo_ret_006', 'flo_ret_008', 'flo_ret_010', 'flo_ret_012']
      };

      var TYPE = Tw.PRODUDT.PROMOTIONS.FLO.WHEN[0](data);
      switch(TYPE){
        case 'FREE_1':
           return {xt: {
              eid: xtEids[data.prodId][0],
              eid1: xtEids[data.prodId][4],
                changeCsid: '_ASCTM',
                closeCsid: '_ASC',
                topCloseCsId: '_CLS'
            }};
        case 'NONE_FREE_1':
          return {xt: {
              eid: xtEids[data.prodId][3],
              eid1: xtEids[data.prodId][4],
              changeCsid: '_CSCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }};
        case 'NONE_FREE_2':
          return {xt: {
            eid: xtEids[data.prodId][1],
            eid1: xtEids[data.prodId][4],
            changeCsid: '_BSCTM',
            closeCsid: '_ASC',
            topCloseCsId: '_CLS'
          }};
        case 'NONE_FREE_3_1':
          return {xt: {
            eid1: xtEids[data.prodId][4],
            eid2: xtEids[data.prodId][2],
            changeCsid: '_DSCTM',
            closeCsid: '_ASC',
            topCloseCsId: '_CLS'
          }};
        case 'NONE_FREE_3_2':
          return {xt: {
            eid1: xtEids[data.prodId][4],
            changeCsid: '_FSCTM',
            closeCsid: '_ASC',
            topCloseCsId: '_CLS'
          }};
        case 'NONE_FREE_3_3':
          return {xt: {
            eid1: xtEids[data.prodId][4],
            eid2: xtEids[data.prodId][5],
            changeCsid: '_ESCTM',
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
        hbs2: 'RO_3.1.3',
        hbs3: 'RO_4.4.1',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'NONE_FREE_1':{  // 50% 할인혜택 이용시 안내 (Case_03)
        action: 'POPUP2',
        hbs1: 'RO_3.8',
        hbs2: 'RO_3.1.3',
        hbs3: 'RO_4.4.1',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'NONE_FREE_2':{ // 100원 프로모션(Case_02), OCB지급 N
        action: 'POPUP2',
        hbs1: 'RO_3.4',
        hbs2: 'RO_3.1.3',
        hbs3: 'RO_4.4.1',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'NONE_FREE_3_1':{ // OCB지급 N
        action: 'POPUP2',
        hbs1: 'RO_4.4.2',
        hbs2: 'RO_3.5',
        titleNm1: '상품안내',
        titleNm2: '혜택안내'
      },
      'NONE_FREE_3_2':{ // OCB지급 Y , 가입월 M+2 이상
        action: 'POPUP',
        hbs: 'RO_4.4.1',
        titleNm: '상품안내'
      },
      'NONE_FREE_3_3':{ // OCB지급 Y , 가입월 M+1 이하
        action: 'POPUP2',
        hbs1: 'RO_4.4.2',
        hbs2: 'RO_4.6',
        titleNm1: '상품안내',
        titleNm2: '혜택안내'
      }
    }
  }
}