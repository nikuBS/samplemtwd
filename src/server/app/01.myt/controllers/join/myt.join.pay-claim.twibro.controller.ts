/**
 * FileName: myt.joinService.payClaimInfo.twibro.controller
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.24
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import StringHelper from '../../../../utils/string.helper';
import moment = require('moment');
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import payClaimInfo_BFF_05_0058 from '../../../../mock/server/payClaimInfo.BFF_05_0058.mock';


class MytJoinPayClaimTwibro extends TwViewController {
  constructor() {
    super();
  }

  public reqQuery: any; // 쿼리스트링
  private _svcInfo: any;

  // 공통데이터
  private _commDataInfo: any = {};

  // 노출조건
  private _showConditionInfo: any = {};

  // api 에러
  private _apiErrInfo: any = [];

  private _urlTplInfo: any = {
    pageRenderView: 'join/myt.join.pay-claim.twibro.html'
  };

  private _redirectUrlInfo: any = {
    payClaim: '/myt/join/pay-claim'
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    if ( svcInfo.svcAttrCd !== 'M5' ) {
      this.logger.info(this, '[ svcInfo ] : ', svcInfo);
      res.redirect(this._redirectUrlInfo.payClaim);
      return;
    }

    this._svcInfo = svcInfo;
    this.logger.info(this, '[ svcInfo ] : ', svcInfo);
    this.reqQuery = req.query;
    const thisMain = this;

    const p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0058, {}), '테스트 api');
    // const p1_mock = this._getPromiseApiMock(payClaimInfo_BFF_05_0058, 'p1 Mock 데이터');


    Promise.all([p1]).then(
      function (resArr) {
        console.dir(resArr);
        thisMain.logger.info(thisMain, `[ Promise.all ] : `, resArr);

        /*
        * 실 데이터 사용시
         */
        thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
          reqQuery: thisMain.reqQuery,
          svcInfo: thisMain._svcInfo,
          resDataInfo: resArr[0].result,
          errBol: false,
          errObj: null
        });

        /*
        * Mock 데이터 사용시
         */
        // thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
        //   reqQuery: thisMain.reqQuery,
        //   svcInfo: thisMain._svcInfo,
        //   resDataInfo: resArr[0].result
        // });

      }, function (err) {
        thisMain._errInfoInit(err);
        thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
          reqQuery: thisMain.reqQuery,
          svcInfo: thisMain._svcInfo,
          resDataInfo: null,
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

export default MytJoinPayClaimTwibro;

