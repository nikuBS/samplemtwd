/**
 * FileName: myt.joinService.contractTerminalInfo.controller
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


class MytBenefitRecommendController extends TwViewController {
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

    // const p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0058, {}), 'BFF_05_0058');
    // const p2 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0041, {}), 'BFF_05_0041');

    const p1_mock = this._getPromiseApiMock(recommend_BFF_05_0096, 'p1 Mock 데이터');
    const p2_mock = this._getPromiseApiMock(recommend_BFF_06_0001, 'p2 Mock 데이터');
    const p3_mock = this._getPromiseApiMock(recommend_BFF_06_0015, 'p3 Mock 데이터');
    const p4_mock = this._getPromiseApiMock(recommend_BFF_05_0120, 'p4 Mock 데이터');


    Promise.all([p1_mock, p2_mock, p3_mock, p4_mock]).then(
      function (resArr) {
        console.dir(resArr);
        thisMain.logger.info(thisMain, `[ Promise.all ] : `, resArr);

        thisMain._apiDataObj.p1 = resArr[0].result;
        thisMain._apiDataObj.p2 = resArr[1].result;
        thisMain._apiDataObj.p3 = resArr[2].result;
        thisMain._apiDataObj.p4 = resArr[3].result;


        



        /*
        * 실 데이터 사용시
         */
        // thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
        //   reqQuery: thisMain.reqQuery,
        //   svcInfo: thisMain._svcInfo,
        //   resDataInfo: resArr[0].result,
        //   errBol: false,
        //   errObj: null
        // });

        /*
        * Mock 데이터 사용시
         */
        thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
          reqQuery: thisMain.reqQuery,
          svcInfo: thisMain._svcInfo,
          resDataInfo: thisMain._apiDataObj,
          errBol: false,
          errObj: null
        });

      }, function (err) {

        // if ( err.code === API_MYT_ERROR.BIL0011 ) {
        //   thisMain._urlTplInfo.pageRenderView = '';
        // }

        thisMain._errInfoInit(err);
        thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
          reqQuery: thisMain.reqQuery,
          svcInfo: thisMain._svcInfo,
          resDataInfo: null,
          baseFeePlans: null,
          errBol: true,
          errObj: thisMain._apiErrInfo
        });

      }); // Promise.all END

  } // render end

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
        if ( resp[0].code === API_CODE.CODE_00 ) {
          resolve(resp[0]);
        } else {
          reject(resp[0]);
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

        if ( mockData.code === API_CODE.CODE_00 ) {
          resolve(mockData);
        } else {
          reject(mockData);
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

export default MytBenefitRecommendController;
