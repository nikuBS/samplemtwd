/**
 * @file 상품 > 공통 > Define용 
 * @author kwon.junho (yamanin1@partner.sk.com)
 * @since 2019-07-19
 */

Tw.PRODUDT = Tw.PRODUDT || {};
Tw.PRODUDT.PROMOTIONS = {
  POOQ: {
    USED: 'Y',
    PRODS: {
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
    FIRST_PROD: ['NA00006405', 'NA00006539'], // 최상위 요금제
    SECOND_PROD: ['NA00006404', 'NA00006538'], //차상위 요금제
    BEFORE: [
      function (data, def) { // 부가서비스 가입정보를 조회함.
        var promotion = Tw.PRODUDT.PROMOTIONS.POOQ;
        //var prodIds = promotion.PRODS[data.prodId].SUB_PROD.concat(data.prodId);
        var prodIds = Tw.PRODUDT.PROMOTIONS.POOQ.FLO.concat([data.prodId], promotion.PRODS[data.prodId].SUB_PROD);

        Tw.Api.request(Tw.API_CMD.BFF_10_0183, {}, {}, [prodIds.join('~')])
          .done(function (resp) {
            Tw.Logger.info('[POOQ]', resp.result);

            if (resp.code === Tw.API_CODE.CODE_00) {

              // FLO 가입여부 체크
              var flo = false; // FLO 가입여부
              for (var i = 0; i < Tw.PRODUDT.PROMOTIONS.POOQ.FLO.length; i++) {
                if (resp.result[Tw.PRODUDT.PROMOTIONS.POOQ.FLO[i]] !== 'N') {
                  flo = true;
                  break;
                }
              }
              var floContentsDate = resp.result['NA00006600']; // FLO 앤 데이터 플러스 가입여부
              var idx = Tw.PRODUDT.PROMOTIONS.POOQ.FLO.length;

              var joinDate = resp.result[prodIds[idx++]]; // 부가서비스 가입일
              var joinDate1 = resp.result[prodIds[idx++]]; //100원프로모션 가입일
              var joinDate2 = resp.result[prodIds[idx++]]; //무료요금제 가입일
              var coinDate = resp.result[prodIds[idx++]]; //코인 적립일
              var certDate = resp.result[prodIds[idx++]]; // 부가서비스 인증일
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
      function (data, def) { // 상품 최초가입일 조회함.
        var promotion = Tw.PRODUDT.PROMOTIONS.POOQ;
        var prodIds = Tw.PRODUDT.PROMOTIONS.POOQ.FLO.concat([data.prodId], promotion.PRODS[data.prodId].SUB_PROD);

        Tw.Api.request(Tw.API_CMD.BFF_10_0191, {}, {}, [prodIds[6]])
          .done(function (resp) {

            if (resp.code === Tw.API_CODE.CODE_00) {

              var fstScrbDt = resp.result.fstScrbDt; // 상품 최초가입일 조회

              def.resolve({
                fstScrbDt: fstScrbDt
              });
            } else {
              def.fail();
            }
          });
      },
      function(data, def){ //가입한 요금제 조회함
        Tw.Api.request(Tw.API_CMD.BFF_05_0136, {}).done(function(resp){
          if ( resp.code === Tw.API_CODE.CODE_00 ) {
            def.resolve({
              scrbDt: resp.result.feePlanProd.scrbDt || 'N'  //가입한 요금제 가입일
            });
          }else{
            def.fail();
          }            
        });

      }
    ],
    WHEN: [function (data) { 
      var isFree = data.isFree;
      var pooqData = ['NA00006577', 'NA00006584']; //wavve 앤 데이터, wavve 앤 데이터 플러스
      var month = Tw.DateHelper.getShortDateWithFormat(new Date(), 'YYYYMM01');
      var successNum = pooqData.indexOf(data.prodId) > -1 ? '1' : '2';
      var standardWord = Tw.PRODUDT.PROMOTIONS.getStandardByDate(data.fstScrbDt, data.scrbDt);

      console.log("KKKK : ~ file: product.common.type.js ~ line 109 ~ standardWord", standardWord)      

      if (data.certDate === 'N') { //인증상품가입 여부      
        return null;
      }
      if (standardWord === 'after') { //21년4월30일 이후

        if (successNum === '1') { //Wavve 콘탠츠팩 || Wavve 콘탠츠팩 플러스 가입여부(N)
          if (Tw.PRODUDT.PROMOTIONS.POOQ.FIRST_PROD.indexOf(data.svcProdId) > -1) { //최상위요금제
            return 'CASE01B_CASE03A_1'; // 무료요금제 이용시 안내 메시지(Case_01B -> Case03A)          
          }

          if (Tw.PRODUDT.PROMOTIONS.POOQ.SECOND_PROD.indexOf(data.svcProdId) > -1) { //차상위요금제
            if (data.joinDate1 !== 'N') { //프로모션대상 할인1코드 (Y)
              if (1 <= moment(month).diff(data.fstScrbDt.substr(0, 6) + '01', 'month')) { //M+1 이상
                return 'CASE06_CASE03A_1'; // 상품변경옵션 (CASE06_CASE03A)
              } else {
                return 'CASE02_CASE03A_1';
              }
            } else {
              return 'CASE06_CASE03A_1';
            }
          }
          return Tw.PRODUDT.PROMOTIONS.getPromotion1CodeFlow(data, successNum);

        } else { //Wavve 콘탠츠팩 플러스 가입여부(Y)
          return Tw.PRODUDT.PROMOTIONS.getPromotion1CodeFlow(data, successNum);
        }
      }

      if (standardWord === 'before') { //20년~21년 4월30일

        if (successNum === '1') { //Wavve 콘탠츠팩 || Wavve 콘탠츠팩 플러스 가입여부(N)
          if (Tw.PRODUDT.PROMOTIONS.POOQ.FIRST_PROD.indexOf(data.svcProdId) > -1) { //최상위요금제
            return 'CASE01B_CASE03A_1';
          }

          if (Tw.PRODUDT.PROMOTIONS.POOQ.SECOND_PROD.indexOf(data.svcProdId) > -1) { //차상위요금제
            return 'CASE01C_CASE03A_1';
          }
          return Tw.PRODUDT.PROMOTIONS.getPromotion1CodeFlow(data, successNum);

        } else { //Wavve 콘탠츠팩 플러스 가입여부(Y)
          return Tw.PRODUDT.PROMOTIONS.getPromotion1CodeFlow(data, successNum);
        }

      }

      if (standardWord === 'beforeThat') {

        if (Tw.PRODUDT.PROMOTIONS.POOQ.FIRST_PROD.indexOf(data.svcProdId) > -1) { //최상위요금제
          return 'CASE01_CASE03A' + '_' + successNum;
        }

        if (Tw.PRODUDT.PROMOTIONS.POOQ.SECOND_PROD.indexOf(data.svcProdId) > -1) { //차상위요금제          
          if (!data.flo && data.certDate !== 'N') { //wavve 단독가입
            return 'CASE01A_CASE03A' + '_' + successNum;
          } else if (data.prodId === 'NA00006516' && data.joinDate !== 'N' && data.floContentsDate !== 'N') { // Wavve 콘텐츠팩 + FLO앤 데이터플러스 (NA6517 + NA6600) 
            return Tw.PRODUDT.PROMOTIONS.getCoinFlow(data);
          } else {
            return 'CASE01A_CASE03A' + '_' + successNum;
          }
        }

        return Tw.PRODUDT.PROMOTIONS.getCoinFlow(data);
      }

    }],
    EXTEND: [function (data) {
      var xtEids = {
        NA00006516: ['wavve_ret_001', 'wavve_ret_005', 'wavve_ret_009', 'wavve_ret_013', 'wavve_ret_017',''              , 'wavve_ret_023', 'wavve_ret_027',''              ],
        NA00006522: ['wavve_ret_002', 'wavve_ret_006', 'wavve_ret_010', 'wavve_ret_014', 'wavve_ret_018',''              , 'wavve_ret_024', 'wavve_ret_028',''              ],
        NA00006577: ['wavve_ret_003', 'wavve_ret_007', 'wavve_ret_011', 'wavve_ret_015', 'wavve_ret_019', 'wavve_ret_021', 'wavve_ret_025', 'wavve_ret_029', 'wavve_ret_031', 'wavve_ret_033'],
        NA00006584: ['wavve_ret_004', 'wavve_ret_008', 'wavve_ret_012', 'wavve_ret_016', 'wavve_ret_020', 'wavve_ret_022', 'wavve_ret_026', 'wavve_ret_030', 'wavve_ret_032', 'wavve_ret_034']
      };

      var TYPE = Tw.PRODUDT.PROMOTIONS.POOQ.WHEN[0](data);
      switch (TYPE) {
        case 'CASE01A_CASE03A_1':
          return {
            xt: {
              eid: xtEids[data.prodId][6],
              eid1: xtEids[data.prodId][7],
              changeCsid: '_HSCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }
          };
        case 'CASE01A_CASE03A_2':
          return {
            xt: {
              eid: xtEids[data.prodId][6],
              eid1: xtEids[data.prodId][7],
              changeCsid: '_HSCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }
          };
        case 'CASE01B_CASE03A_1':
          return {
            xt: {
              eid: xtEids[data.prodId][8],
              eid1: xtEids[data.prodId][7],
              changeCsid: '_JSCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }
          };
        case 'CASE01C_CASE03A_1':
          return {
            xt: {
              eid: xtEids[data.prodId][9],
              eid1: xtEids[data.prodId][7],
              changeCsid: '_JSCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }
          };
        case 'CASE06_CASE03A_1':
          return {
            xt: {
              eid: xtEids[data.prodId][5],
              eid1: xtEids[data.prodId][7],
              changeCsid: '_ISCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }
          };
        case 'CASE01_CASE03A_1':
          return {
            xt: {
              eid: xtEids[data.prodId][0],
              eid1: xtEids[data.prodId][7],
              changeCsid: '_ISCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }
          };
        case 'CASE01_CASE03A_2':
          return {
            xt: {
              eid1: xtEids[data.prodId][0],
              eid2: xtEids[data.prodId][7],
              changeCsid: '_ISCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }
          };
        case 'CASE02_CASE03A_1':
          return {
            xt: {
              eid1: xtEids[data.prodId][1],
              eid2: xtEids[data.prodId][7],
              changeCsid: '_ISCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }
          };
        case 'CASE02_CASE03A_2':
          return {
            xt: {
              eid1: xtEids[data.prodId][1],
              eid2: xtEids[data.prodId][7],
              changeCsid: '_ISCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }
          };
        case 'CASE03_CASE04':
        return {
          xt: {
            eid1: xtEids[data.prodId][4],
            eid2: xtEids[data.prodId][3],
            changeCsid: '_CSCTM',
            closeCsid: '_ASC',
            topCloseCsId: '_CLS'
          }
        };
        case 'CASE03_CASE06':
        return {
          xt: {
            eid1: xtEids[data.prodId][4],
            eid2: xtEids[data.prodId][5],
            changeCsid: '_GSCTM',
            closeCsid: '_ASC',
            topCloseCsId: '_CLS'
          }
        };
        case 'CASE03':
        return {
          xt: {
            eid1: xtEids[data.prodId][4],
            changeCsid: '_FSCTM',
            closeCsid: '_ASC',
            topCloseCsId: '_CLS'
          }
        };
        case 'CASE03A':
        return {
          xt: {
            eid1: xtEids[data.prodId][4],
            changeCsid: '_FSCTM',
            closeCsid: '_ASC',
            topCloseCsId: '_CLS'
          }
        };

      }
      return {
        xt: {
          eid: xtEids[data.prodId][0],
          eid1: xtEids[data.prodId][3],
          changeCsid: '_ASCTM',
          closeCsid: '_ASC',
          topCloseCsId: '_CLS'
        }
      };
    }],
    THEN: {
      'CASE01A_CASE03A_1': {
        action: 'POPUP2',
        hbs1: 'RO_4.3',
        hbs2: 'RO_3.1.1',
        hbs3: 'RO_4.5',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'CASE01A_CASE03A_2': {
        action: 'POPUP2',
        hbs1: 'RO_4.3',
        hbs2: 'RO_3.1.2',
        hbs3: 'RO_4.5',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'CASE01B_CASE03A_1': {
        action: 'POPUP2',
        hbs1: 'RO_5.0.1',
        hbs2: 'RO_3.1.1',
        hbs3: 'RO_4.5',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'CASE01C_CASE03A_1': {
        action: 'POPUP2',
        hbs1: 'RO_5.0.2',
        hbs2: 'RO_3.1.1',
        hbs3: 'RO_4.5',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },      
      'CASE06_CASE03A_1': {
        action: 'POPUP2',
        hbs1: 'RO_4.7',
        hbs2: 'RO_3.1.1',
        hbs3: 'RO_4.5',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'CASE06_CASE03A_2': {
        action: 'POPUP2',
        hbs1: 'RO_4.7',
        hbs2: 'RO_3.1.2',
        hbs3: 'RO_4.5',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'CASE01_CASE03A_1': {
        action: 'POPUP2',
        hbs1: 'RO_3.1',
        hbs2: 'RO_3.1.1',
        hbs3: 'RO_4.5',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'CASE01_CASE03A_2': {
        action: 'POPUP2',
        hbs1: 'RO_3.1',
        hbs2: 'RO_3.1.2',
        hbs3: 'RO_4.5',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'CASE02_CASE03A_1': { 
        action: 'POPUP2',
        hbs1: 'RO_3.2',
        hbs2: 'RO_3.1.1',
        hbs3: 'RO_4.5',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'CASE02_CASE03A_2': { 
        action: 'POPUP2',
        hbs1: 'RO_3.2',
        hbs2: 'RO_3.1.2',
        hbs3: 'RO_4.5',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'CASE03_CASE04': { //NONE_FREE_2_1
        action: 'POPUP2',
        hbs1: 'RO_4.9.2',
        hbs2: 'RO_3.3',
        titleNm1: '상품안내',
        titleNm2: '혜택안내'
      },
      'CASE03_CASE06': { //NONE_FREE_2_3
        action: 'POPUP2',
        hbs1: 'RO_4.9.2',
        hbs2: 'RO_4.2',
        titleNm1: '상품안내',
        titleNm2: '혜택안내'
      },
      'CASE03': { //NONE_FREE_2_2
        action: 'POPUP',
        hbs: 'RO_4.9.1',
        titleNm: '상품안내'
      },
      'CASE03A': { 
        action: 'POPUP',
        hbs: 'RO_4.5',
        titleNm: '상품안내'
      },      
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
  FLO: {
    USED: 'Y',
    PRODS: {
      'NA00006520': { // FLO 앤 데이터
        //    인증코드       적립        할인(100원)    요금제 혜택  FLO_유지_적립완료  적용 할인3코드(T플랜 에센스 혜택)
        SUB_PROD: ['NA00006521', 'NA00006655', 'NA00006541', 'NA00006542', 'NA00007013', 'NA00006576']
      },
      'NA00006599': { // FLO 앤 데이터 플러스
        //    인증코드       적립        할인(100원)    요금제 혜택   FLO_유지_적립완료
        SUB_PROD: ['NA00006600', 'NA00006655', 'NA00006601', 'NA00006602', 'NA00007013']
      }
    },
    POOQ: ['NA00006517', 'NA00006523', 'NA00006578', 'NA00006585'], //POOQ 관련 서비스
    FIRST_PROD: ['NA00006405', 'NA00006539'], // 최상위 요금제
    SECOND_PROD: ['NA00006404', 'NA00006538'], //차상위 요금제
    BEFORE: [
      function (data, def) { // 부가서비스 가입정보를 조회함.
        var promotion = Tw.PRODUDT.PROMOTIONS.FLO;
        var prodIds = Tw.PRODUDT.PROMOTIONS.FLO.POOQ.concat([data.prodId], promotion.PRODS[data.prodId].SUB_PROD);

        Tw.Api.request(Tw.API_CMD.BFF_10_0183, {}, {}, [prodIds.join('~')])
          .done(function (resp) {
            Tw.Logger.info('[FLO]', resp.result);

            if (resp.code === Tw.API_CODE.CODE_00 && !Tw.FormatHelper.isEmpty(resp.result)) {

              // POOQ 가입여부 체크
              var pooq = false; // pooq 가입여부
              for (var i = 0; i < Tw.PRODUDT.PROMOTIONS.FLO.POOQ.length; i++) {
                if (resp.result[Tw.PRODUDT.PROMOTIONS.FLO.POOQ[i]] !== 'N') {
                  pooq = true;
                  break;
                }
              }
              var pooqContentsDate = resp.result['NA00006517']; // pooq 컨텐츠팩 가입여부
              var pooqContentsPlusDate = resp.result['NA00006523']; // Pooq 콘텐츠 팩 플러스 가입여부
              var idx = Tw.PRODUDT.PROMOTIONS.FLO.POOQ.length;

              var joinDate = resp.result[prodIds[idx++]]; // 부가서비스 가입일
              var certDate = resp.result[prodIds[idx++]]; // 부가서비스 인증일
              var coinDate = resp.result[prodIds[idx++]]; // 코인 적립일
              var joinDate1 = resp.result[prodIds[idx++]]; // 100원프로모션 가입일
              var joinDate2 = resp.result[prodIds[idx++]]; // 무료요금제 가입일
              var floUseDate = resp.result[prodIds[idx++]]; // FLO_유지_적립완료일
              var joinDate3 = prodIds.length > idx ? resp.result[prodIds[idx]] : null; //적용 할인3코드(T플랜 에센스 혜택)

              def.resolve({
                pooq: pooq,
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

      function (data, def) { // 상품 최초가입일 조회함.
        var promotion = Tw.PRODUDT.PROMOTIONS.FLO;
        var prodIds = Tw.PRODUDT.PROMOTIONS.FLO.POOQ.concat([data.prodId], promotion.PRODS[data.prodId].SUB_PROD);

        Tw.Api.request(Tw.API_CMD.BFF_10_0191, {}, {}, [prodIds[5]])
          .done(function (resp) {

            if (resp.code === Tw.API_CODE.CODE_00) {

              var fstScrbDt = resp.result.fstScrbDt; // 상품 최초가입일 조회

              def.resolve({
                fstScrbDt: fstScrbDt
              });
            } else {
              def.fail();
            }
          });

      },
      function(data, def){ //가입한 요금제 조회함
        Tw.Api.request(Tw.API_CMD.BFF_05_0136, {}).done(function(resp){
          if ( resp.code === Tw.API_CODE.CODE_00 ) {
            def.resolve({
              scrbDt: resp.result.feePlanProd.scrbDt || 'N'  //가입한 요금제 가입일
            });
          }else{
            def.fail();
          }            
        });

      }
    ],
    WHEN: [function (data) {

      var standardWord = Tw.PRODUDT.PROMOTIONS.getStandardByDate(data.fstScrbDt, data.scrbDt);
      var month = Tw.DateHelper.getShortDateWithFormat(new Date(), 'YYYYMM01');

      if (data.certDate === 'N') { //인증상품가입 여부      
        return null;
      }

      if (standardWord === 'after') { //21년4월30일 이후

        if (Tw.PRODUDT.PROMOTIONS.POOQ.FIRST_PROD.indexOf(data.svcProdId) > -1) { //최상위요금제
          return 'CASE01_CASE04'
        }

        if (Tw.PRODUDT.PROMOTIONS.POOQ.SECOND_PROD.indexOf(data.svcProdId) > -1) { //차상위요금제
          if (data.joinDate1 !== 'N') { //할인1코드 가입여부 'Y'
            if (1 <= moment(month).diff(data.fstScrbDt.substr(0, 6) + '01', 'month')) {
              return 'CASE07_CASE04'
            }else{
              return 'CASE02_CASE04'
            }
          }else{ //할인1코드 가입여부 'N'
            return 'CASE07_CASE04'
          }          
        }
        
        return Tw.PRODUDT.PROMOTIONS.getFloPromotion1CodeFlow(data)
      }

      if (standardWord === 'before') { //20년~21년 4월30일

        if (Tw.PRODUDT.PROMOTIONS.POOQ.FIRST_PROD.indexOf(data.svcProdId) > -1) { //최상위요금제
          return 'CASE01_CASE04'
        }

        if (Tw.PRODUDT.PROMOTIONS.POOQ.SECOND_PROD.indexOf(data.svcProdId) > -1) { //차상위요금제
          if (!data.pooq) { //FLO 단독가입 Y
            return 'CASE01A_CASE04'
          }else{ //FLO 단독가입 N
            if(data.pooqContentsDate !== 'N' || data.pooqContentsPlusDate !== 'N'){ 
              return 'CASE01A_CASE04'
            }else{
              return Tw.PRODUDT.PROMOTIONS.getFloPromotion1CodeFlow(data)
            }
          }
        }
        return Tw.PRODUDT.PROMOTIONS.getFloPromotion1CodeFlow(data)
        
      }

      if (standardWord === 'beforeThat') {

        if (Tw.PRODUDT.PROMOTIONS.POOQ.FIRST_PROD.indexOf(data.svcProdId) > -1) { //최상위요금제
          return 'CASE01_CASE04'
        }

        if (data.joinDate3 && data.joinDate3 !== 'N') { // FLO 할인 3코드
          return 'CASE03_CASE04'
        }

        if (Tw.PRODUDT.PROMOTIONS.POOQ.SECOND_PROD.indexOf(data.svcProdId) > -1) { //차상위요금제
          if (!data.pooq) { //FLO 단독가입 Y
            return 'CASE01A_CASE04'
          }else{
            if (data.prodId === 'NA00006599' && data.pooqContentsDate !== 'N'){
              return 'CASE01A_CASE04'
            }else{
              return Tw.PRODUDT.PROMOTIONS.getOcbFlow(data);
            }
          }
        }
        return Tw.PRODUDT.PROMOTIONS.getOcbFlow(data);
      }
      return null;
    }],
    EXTEND: [function (data) {
      var xtEids = {
        NA00006520: ['flo_ret_001', 'flo_ret_003', 'flo_ret_005', 'flo_ret_007', 'flo_ret_009', 'flo_ret_011', 'flo_ret_013', 'flo_ret_015'],
        NA00006599: ['flo_ret_002', 'flo_ret_004', 'flo_ret_006', 'flo_ret_008', 'flo_ret_010', 'flo_ret_012', 'flo_ret_014', 'flo_ret_016']
      };

      var TYPE = Tw.PRODUDT.PROMOTIONS.FLO.WHEN[0](data);
      switch (TYPE) {
        case 'CASE01_CASE04':
          return {
            xt: {
              eid: xtEids[data.prodId][0],
              eid1: xtEids[data.prodId][4],
              changeCsid: '_ASCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }
          };
          case 'CASE01A_CASE04':
          return {
            xt: {
              eid: xtEids[data.prodId][7],
              eid1: xtEids[data.prodId][4],
              changeCsid: '_ASCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }
          }; 
          case 'CASE03_CASE04':
          return {
            xt: {
              eid: xtEids[data.prodId][3],
              eid1: xtEids[data.prodId][4],
              changeCsid: '_ASCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }
          };
          case 'CASE07_CASE04':
          return {
            xt: {
              eid: xtEids[data.prodId][6],
              eid1: xtEids[data.prodId][4],
              changeCsid: '_ASCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }
          };
          case 'CASE04':
          return {
            xt: {
              eid1: xtEids[data.prodId][4],
              changeCsid: '_FSCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }
          };
        case 'CASE04_CASE05':
          return {
            xt: {
              eid: xtEids[data.prodId][4],
              eid1: xtEids[data.prodId][2],
              changeCsid: '_ASCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }
          };
        case 'CASE04_CASE06':
          return {
            xt: {
              eid: xtEids[data.prodId][4],
              eid1: xtEids[data.prodId][5],
              changeCsid: '_CSCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }
          };
        case 'CASE02_CASE04':
          return {
            xt: {
              eid: xtEids[data.prodId][1],
              eid1: xtEids[data.prodId][4],
              changeCsid: '_BSCTM',
              closeCsid: '_ASC',
              topCloseCsId: '_CLS'
            }
          };        
      }

      return {
        xt: {
          eid1: xtEids[data.prodId][4],
          eid2: xtEids[data.prodId][5],
          changeCsid: '_ESCTM',
          closeCsid: '_ASC',
          topCloseCsId: '_CLS'
        }
      };
    }],
    THEN: {
      'CASE01_CASE04': {
        action: 'POPUP2',
        hbs1: 'RO_3.9',
        hbs2: 'RO_3.1.3',
        hbs3: 'RO_4.4.1',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'CASE01A_CASE04':{
        action: 'POPUP2',
        hbs1: 'RO_4.0',
        hbs2: 'RO_3.1.3',
        hbs3: 'RO_4.4.1',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'CASE03_CASE04':{
        hbs1: 'RO_3.8',
        hbs2: 'RO_3.1.3',
        hbs3: 'RO_4.4.1',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'CASE07_CASE04': {
        action: 'POPUP2',
        hbs1: 'RO_4.1',
        hbs2: 'RO_3.1.3',
        hbs3: 'RO_4.4.1',
        titleNm1: '혜택안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },
      'CASE04': { 
        action: 'POPUP',
        hbs: 'RO_4.4.1',
        titleNm: '상품안내'
      },
      'CASE04_CASE05': { 
        action: 'POPUP2',
        hbs1: 'RO_4.4.2',
        hbs2: 'RO_3.5',
        titleNm1: '상품안내',
        titleNm2: '혜택안내'
      },
      'CASE04_CASE06': { 
        action: 'POPUP2',
        hbs1: 'RO_4.4.2',
        hbs2: 'RO_4.6',
        titleNm1: '상품안내',
        titleNm2: '혜택안내'
      },      
      'CASE02_CASE04': { 
        action: 'POPUP2',
        hbs1: 'RO_3.4',
        hbs2: 'RO_3.1.3',
        hbs3: 'RO_4.4.1',
        titleNm1: '상품안내',
        titleNm2: '혜택안내',
        titleNm3: '상품안내'
      },      
    }
  },
  getStandardByDate: function(fstScrbDt, scrbDt) {
    if ((fstScrbDt >= '20210501') || (scrbDt >= '20210501')) {
      return 'after'
    } else if (('20200101' <= fstScrbDt && fstScrbDt <= '20210430') || ('20200101' <= scrbDt && scrbDt <= '20210430')) {
      return 'before'
    } else {
      return 'beforeThat'
    }
  },
  getPromotion1CodeFlow: function(data , successNum) {
    var month = Tw.DateHelper.getShortDateWithFormat(new Date(), 'YYYYMM01');
    if (data.joinDate1 !== 'N') { //프로모션대상 할인1코드
    console.log("KKKK : ~ 플로모션대상할인코드입니다.", data.joinDate1)
    console.log("KKKK : ~ 플로모션대상할인코드입니다.", data.joinDate1)
    console.log("KKKK : ~ 플로모션대상할인코드입니다.", data.joinDate1)

      if (1 <= moment(month).diff(data.fstScrbDt.substr(0, 6) + '01', 'month')) { //M+1 이상
        return Tw.PRODUDT.PROMOTIONS.getCoinFlow(data);
      }else{
        return 'CASE02_CASE03' + '_' + successNum; //100원 프로모션(Case_02) 상품변경옵션 기존 해지 프로세스  
      }
    } else {
      return Tw.PRODUDT.PROMOTIONS.getCoinFlow(data);
    }
  },
  getCoinFlow: function(data)  {
    var month = Tw.DateHelper.getShortDateWithFormat(new Date(), 'YYYYMM01');
    if (data.coinDate !== 'N') { //코인지급내역
      if (month === data.coinDate.substr(0, 6) + '01') { //NA00006657 가입 기간 M월
        return 'CASE03_CASE06'; ////코인 미지급 팝업
      } else {
        return 'CASE03'; // 기존해지 프로세스
      }
    } else {
      return 'CASE03_CASE04'; // 코인지급
    }
  },
  getOcbFlow: function(data)  {
    var month = Tw.DateHelper.getShortDateWithFormat(new Date(), 'YYYYMM01');
    if (data.coinDate !== 'N' || data.floUseDate !== 'N') { // OCB지급 Y or FLO_유지_적립완료
      if(1 <= moment(month).diff(data.coinDate.substr(0, 6) + '01', 'month')){ // OCB지급 M+1
        return 'CASE04'
      }else{
        return 'CASE04_CASE06'
      }
    }else{
      return 'CASE04_CASE05'
    }
  },
  getFloPromotion1CodeFlow: function(data) {
    var month = Tw.DateHelper.getShortDateWithFormat(new Date(), 'YYYYMM01');
    if (data.joinDate1 !== 'N') { //할인1코드 가입여부 'Y'

        console.log("KKKK : ~ 프로모션대상할인코드입니다.", data.joinDate1)
        console.log("KKKK : ~ 프로모션대상할인코드입니다.", data.joinDate1)
        console.log("KKKK : ~ 프로모션대상할인코드입니다.", data.joinDate1)

      if (1 <= moment(month).diff(data.fstScrbDt.substr(0, 6) + '01', 'month')) {
        return Tw.PRODUDT.PROMOTIONS.getOcbFlow(data);                  
      }else{
        return 'CASE02_CASE04'
      }
    }else{ //할인1코드 가입여부 'N'
      return Tw.PRODUDT.PROMOTIONS.getOcbFlow(data);
    }
  },

  

  

}