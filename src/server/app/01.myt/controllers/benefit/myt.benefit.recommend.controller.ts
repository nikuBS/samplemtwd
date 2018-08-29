/**
 * FileName: myt.benefit.recommend.controller
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.08.16
 * info :
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE, API_MYT_ERROR } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import recommend_BFF_05_0096 from '../../../../mock/server/recommend.BFF_05_0096.mock';
import recommend_BFF_06_0015 from '../../../../mock/server/recommend.BFF_06_0015.mock';
import recommend_BFF_05_0120 from '../../../../mock/server/recommend.BFF_05_0120.mock';
import recommend_BFF_06_0001 from '../../../../mock/server/recommend.BFF_06_0001.mock';
import { MYT_BENEFIT_RECOMMEND } from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';


class MyTBenefitRecommend extends TwViewController {
  constructor() {
    super();
  }

  public reqQuery: any; // 쿼리스트링
  private _svcInfo: any;

  // 공통데이터
  private _commDataInfo: any = {};

  // 노출조건
  private _showConditionInfo: any = {};

  private _apiDataObj: any = {
    p1: null,
    p2: null,
    p3: null,
    p4: null
  };

  private _recommendKind: any = {
    original: ['TPAY', 'REFILL', 'GIFT', 'POINT', 'PLAN', 'OKSP', 'OKASP', 'TSIGN'],
    typeListA: null,
    typeListB: null
  };
  /*
  * 1. TPAY	T 페이
  * 2. REFILL	데이터/음성 리필하기
  * 3. GIFT	T끼리 데이터 선물하기
  * 4. POINT	T나는 쇼핑 포인트
  * 5. PLAN	지켜줘서 고마워_현역플랜
  * 6. OKSP	oksusu 안심팩
  * 7. OKASP	oksusu & 안심팩
  * 8. TSIGN	T 시그니처
   */
  private _recommendInfo: any = {
    TPAY: {
      id: 'TPAY',
      state: false,
      title: MYT_BENEFIT_RECOMMEND.TPAY.title,
      typeTextA: MYT_BENEFIT_RECOMMEND.TPAY.typeTextA,
      typeTextB: MYT_BENEFIT_RECOMMEND.TPAY.typeTextB
    },
    REFILL: {
      id: 'REFILL',
      state: false,
      title: MYT_BENEFIT_RECOMMEND.REFILL.title,
      typeTextA: MYT_BENEFIT_RECOMMEND.REFILL.typeTextA,
      typeTextB: MYT_BENEFIT_RECOMMEND.REFILL.typeTextB
    },
    GIFT: {
      id: 'GIFT',
      state: false,
      title: MYT_BENEFIT_RECOMMEND.GIFT.title,
      typeTextA: MYT_BENEFIT_RECOMMEND.GIFT.typeTextA,
      typeTextB: MYT_BENEFIT_RECOMMEND.GIFT.typeTextB
    },
    POINT: {
      id: 'POINT',
      state: false,
      title: MYT_BENEFIT_RECOMMEND.POINT.title,
      typeTextA: MYT_BENEFIT_RECOMMEND.POINT.typeTextA,
      typeTextB: MYT_BENEFIT_RECOMMEND.POINT.typeTextB
    },
    PLAN: {
      id: 'PLAN',
      state: false,
      title: MYT_BENEFIT_RECOMMEND.PLAN.title,
      typeTextA: MYT_BENEFIT_RECOMMEND.PLAN.typeTextA,
      typeTextB: MYT_BENEFIT_RECOMMEND.PLAN.typeTextB
    },
    OKSP: {
      id: 'OKSP',
      state: false,
      title: MYT_BENEFIT_RECOMMEND.OKSP.title,
      typeTextA: MYT_BENEFIT_RECOMMEND.OKSP.typeTextA,
      typeTextB: MYT_BENEFIT_RECOMMEND.OKSP.typeTextB
    },
    OKASP: {
      id: 'OKASP',
      state: false,
      title: MYT_BENEFIT_RECOMMEND.OKASP.title,
      typeTextA: MYT_BENEFIT_RECOMMEND.OKASP.typeTextA,
      typeTextB: MYT_BENEFIT_RECOMMEND.OKASP.typeTextB
    },
    TSIGN: {
      id: 'TSIGN',
      state: false,
      title: MYT_BENEFIT_RECOMMEND.TSIGN.title,
      typeTextA: MYT_BENEFIT_RECOMMEND.TSIGN.typeTextA,
      typeTextB: MYT_BENEFIT_RECOMMEND.TSIGN.typeTextB
    }

  };

  // api 에러
  private _apiErrInfo: any = [];

  private _urlTplInfo: any = {
    pageRenderView: 'benefit/myt.benefit.recommend.html'
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this._svcInfo = svcInfo;
    this.logger.info(this, '[ svcInfo ] : ', svcInfo);
    this.reqQuery = req.query;
    const thisMain = this;

    const p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0096, {}), 'p1');
    const p2 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_06_0001, {}), 'p2');
    const p3 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_06_0015, {}), 'p3');
    const p4 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0120, {}), 'p4');

    // const p1_mock = this._getPromiseApiMock(recommend_BFF_05_0096, 'p1');
    // const p2_mock = this._getPromiseApiMock(recommend_BFF_06_0001, 'p2');
    // const p3_mock = this._getPromiseApiMock(recommend_BFF_06_0015, 'p3');
    // const p4_mock = this._getPromiseApiMock(recommend_BFF_05_0120, 'p4');


    Promise.all([p1, p2, p3, p4]).then(
      function (resArr) {
        console.dir(resArr);
        thisMain.logger.info(thisMain, `[ Promise.all ] : `, resArr);

        thisMain._apiDataObj.p1 = resArr[0].result;
        thisMain._apiDataObj.p2 = resArr[1].result;

        if ( !FormatHelper.isEmpty( resArr[2].result ) ) {
          thisMain._apiDataObj.p3 = resArr[2];
        } else {
          thisMain._apiDataObj.p3 = resArr[2]; // 에러 발생시
        }

        if ( !FormatHelper.isEmpty( resArr[3].result ) ) {
          thisMain._apiDataObj.p4 = resArr[3];
        } else {
          thisMain._apiDataObj.p4 = resArr[3]; // 에러 발생시
        }

        thisMain._beforeInit();

        thisMain._tpayInit();
        thisMain._refillInit();
        thisMain._giftInit();
        thisMain._pointInit();
        thisMain._planInit();
        thisMain._okspInit();
        thisMain._okaspInit();
        thisMain._tsignInit();

        /*
        * 실 데이터 사용시
         */
        thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
          reqQuery: thisMain.reqQuery,
          svcInfo: thisMain._svcInfo,
          resDataInfo: thisMain._apiDataObj,
          recommendKind: thisMain._recommendKind,
          recommendInfo: thisMain._recommendInfo,
          svcFun: thisMain.getClassBgColor
        });

        /*
        * Mock 데이터 사용시
         */
        // thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
        //   reqQuery: thisMain.reqQuery,
        //   svcInfo: thisMain._svcInfo,
        //   resDataInfo: thisMain._apiDataObj,
        //   recommendKind: thisMain._recommendKind,
        //   recommendInfo: thisMain._recommendInfo,
        //   svcFun: thisMain.getClassBgColor
        // });

      }, function (err) {
        console.log('[ 에러 ]');
        console.dir(err);

        return thisMain.error.render(res, {
          title: 'title',
          code: err.code,
          msg: err.msg,
          svcInfo: svcInfo
        });

      }); // Promise.all END

  } // render end

  private _beforeInit() {
    this._recommendKind.typeListA = [];
    this._recommendKind.typeListB = [];
  }
  // -------------------------------------------------------------[1. TPAY : BFF_05_0096]
  private _tpayInit() {
    const typeNm = 'TPAY';
    const tempState = this._apiDataObj.p1.tPay;
    this.logger.info(this, `[ _tpayInit ] : `);
    // console.log( tempState );

    if ( tempState === 'Y') {
      this._recommendInfo[typeNm].state = true;
      this._recommendKind.typeListA.push( typeNm );
    } else {
      this._recommendInfo[typeNm].state = false;
      this._recommendKind.typeListB.push( typeNm );
    }
  }
  // -------------------------------------------------------------[2. REFILL : BFF_06_0001]
  private _refillInit() {
    const typeNm = 'REFILL';
    const tempState = this._apiDataObj.p2;
    this.logger.info(this, `[ _refillInit ] : `);
    // console.log( tempState );

    if ( tempState.length > 0) {
      this._recommendInfo[typeNm].state = true;
      this._recommendKind.typeListA.push( typeNm );
    } else {
      this._recommendInfo[typeNm].state = false;
      this._recommendKind.typeListB.push( typeNm );
    }
  }
  // -------------------------------------------------------------[3. GIFT : BFF_06_0015]
  private _giftInit() {
    const typeNm = 'GIFT';
    const tempState = this._apiDataObj.p3;
    this.logger.info(this, `[ _giftInit ] : `);
    // console.log( tempState );

    if ( tempState.code === API_CODE.CODE_00 ) {
      if ( tempState.result.dataGiftCnt > 0 || tempState.result.familyDataGiftCnt > 0 ) {
        this._recommendInfo[typeNm].state = true;
        this._recommendKind.typeListA.push( typeNm );
      }
    } else {
        this._recommendInfo[typeNm].state = false;
        this._recommendKind.typeListB.push( typeNm );
    }

  }
  // -------------------------------------------------------------[4. POINT : BFF_05_0096]
  private _pointInit() {
    const typeNm = 'POINT';
    const tempState = this._apiDataObj.p1.tShopping;
    this.logger.info(this, `[ _pointInit ] : `);
    // console.log( tempState );

    if ( tempState === 'Y') {
      this._recommendInfo[typeNm].state = true;
      this._recommendKind.typeListA.push( typeNm );
    } else {
      this._recommendInfo[typeNm].state = false;
      this._recommendKind.typeListB.push( typeNm );
    }
  }
  // -------------------------------------------------------------[5. PLAN : BFF_05_0120]
  private _planInit() {
    const typeNm = 'PLAN';
    const tempState = this._apiDataObj.p4;
    this.logger.info(this, `[ _planInit ] : `);
    // console.log( tempState );


    if ( tempState.code === API_CODE.CODE_00 ) {
      this._recommendInfo[typeNm].state = true;
      this._recommendKind.typeListA.push( typeNm );
    } else {
      this._recommendInfo[typeNm].state = false;
      this._recommendKind.typeListB.push( typeNm );
    }

  }
  // -------------------------------------------------------------[6. OKSP : BFF_05_0096]
  private _okspInit() {
    const typeNm = 'OKSP';
    const tempState = this._apiDataObj.p1.oksusuSafePack;
    this.logger.info(this, `[ _okspInit ] : `);
    // console.log( tempState );

    if ( tempState === 'Y') {
      this._recommendInfo[typeNm].state = true;
      this._recommendKind.typeListA.push( typeNm );
    } else {
      this._recommendInfo[typeNm].state = false;
      this._recommendKind.typeListB.push( typeNm );
    }
  }
  // -------------------------------------------------------------[7. OKASP : BFF_05_0096]
  private _okaspInit() {
    const typeNm = 'OKASP';
    const tempState = this._apiDataObj.p1.oksusuAndSafePack;
    this.logger.info(this, `[ _okaspInit ] : `);
    // console.log( tempState );

    if ( tempState === 'Y') {
      this._recommendInfo[typeNm].state = true;
      this._recommendKind.typeListA.push( typeNm );
    } else {
      this._recommendInfo[typeNm].state = false;
      this._recommendKind.typeListB.push( typeNm );
    }
  }
  // -------------------------------------------------------------[8. TSIGN : BFF_05_0096]
  private _tsignInit() {
    const typeNm = 'TSIGN';
    const tempState = this._apiDataObj.p1.tSignature;
    this.logger.info(this, `[ _tsignInit ] : `);
    // console.log( tempState );

    if ( tempState === 'Y') {
      this._recommendInfo[typeNm].state = true;
      this._recommendKind.typeListA.push( typeNm );
    } else {
      this._recommendInfo[typeNm].state = false;
      this._recommendKind.typeListB.push( typeNm );
    }
  }
  // -------------------------------------------------------------[service]
  public getClassBgColor(num: number): string {
    const tempNum = (num % 7) + 1; // 1, 2, 3, 4, 5, 6, 7
    const returnClass = 'bgc' + String( tempNum );
    return returnClass;
  }

  // -------------------------------------------------------------[에러 정보 처리]
  private _errInfoInit(err: any) {
    const thisMain = this;
    const len = err.length;
    thisMain._apiErrInfo = [];
    thisMain.logger.info(thisMain, `[ Promise.all > err 1 ] : `, err);
    console.dir(err);
    const tempErrObj = {
      code: err.code,
      msg: err.msg
    };
    thisMain._apiErrInfo.push(tempErrObj);
    thisMain.logger.info(thisMain, `[ _apiErrInfo ] : `, thisMain._apiErrInfo);
  }

  // -------------------------------------------------------------[프로미스 생성]
  public _getPromiseApi(reqObj, msg): any {
    const thisMain = this;
    const reqObjObservableApi: Observable<any> = reqObj;

    return new Promise((resolve, reject) => {
      Observable.combineLatest(
        reqObjObservableApi
      ).subscribe((resp) => {
        thisMain.logger.info(thisMain, `[ ${ msg } next ] : `, resp);

        if ( msg === 'p3') {

          switch ( resp[0].code ) {
            case 'RCG0001':
            case 'RCG0002':
            case 'RCG0003':
            case 'RCG0004':
            case 'RCG0005':
            case 'RCG0013':
            case API_CODE.CODE_00:
              console.log('p3 : 성공');
              resolve(resp[0]);
              break;
            default:
              console.log('p3 : 실패');
              reject(resp[0]);
          }
        } else if ( msg === 'p4') {

          switch ( resp[0].code ) {
            case 'BIL0071':
            case API_CODE.CODE_00:
              console.log('p4 : 성공');
              resolve(resp[0]);
              break;
            default:
              console.log('p4 : 실패');
              reject(resp[0]);
          }

        } else {

          if ( resp[0].code === API_CODE.CODE_00 ) {
            resolve(resp[0]);
          } else {
            reject(resp[0]);
          }

        }

      });
    });

  }

// -------------------------------------------------------------[프로미스 생성 - Mock]
  public _getPromiseApiMock(mockData, msg): any {
    return new Promise((resolve, reject) => {
      const ms: number = Math.floor(Math.random() * 1000) + 1;
      setTimeout(function () {
        console.log(`[ ${ msg } _getPromiseApiMock ] : ` + mockData);

        if ( msg === 'p3') {

          switch ( mockData.code ) {
            case 'RCG0001':
            case 'RCG0002':
            case 'RCG0003':
            case 'RCG0004':
            case 'RCG0005':
            case 'RCG0013':
            case API_CODE.CODE_00:
              console.log('p3 : 성공');
              resolve(mockData);
              break;
            default:
              console.log('p3 : 실패');
              reject(mockData);
          }

        } else {

          if ( mockData.code === API_CODE.CODE_00 ) {
            resolve(mockData);
          } else {
            reject(mockData);
          }

        }


      }, ms);
    });
  }

  // -------------------------------------------------------------[클리이어튼로 전송]
  public renderView(res: Response, view: string, data: any): any {
    this.logger.info(this, '[ HTML ] : ', view);
    res.render(view, data);
  }
}

export default MyTBenefitRecommend;
