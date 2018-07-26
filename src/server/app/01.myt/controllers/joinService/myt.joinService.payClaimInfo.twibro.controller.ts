/**
 * FileName: myt.joinService.payClaimInfo.twibro.controller
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.24
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD } from '../../../../types/api-command.type';
import StringHelper from '../../../../utils/string.helper';
import moment = require('moment');
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import payClaimInfo_BFF_05_0058 from '../../../../mock/server/payClaimInfo.BFF_05_0058';


class MytJoinServicePayClaimInfoTwibro extends TwViewController {
  constructor() {
    super();
  }

  public reqQuery: any;//쿼리스트링
  private _svcInfo: any;

  //공통데이터
  private _commDataInfo: any = {};

  //노출조건
  private _showConditionInfo: any = {};

  private _urlTplInfo:any = {
    pageRenderView:  'joinService/myt.joinService.payClaimInfo.twibro.html'
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this._svcInfo = svcInfo;
    this.logger.info(this, '[ svcInfo ] 사용자 정보 : ', svcInfo);
    this.reqQuery = req.query;
    var thisMain = this;

    const p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0041, {}), '테스트 api');
    const p1_mock = this._getPromiseApiMock(payClaimInfo_BFF_05_0058, 'p1 Mock 데이터');

    Promise.all([p1_mock]).then(function (resArr) {
      console.dir(resArr);
      thisMain.logger.info(thisMain, `[ Promise.all ] : `, resArr);

      /*
      * 실 데이터 사용시
       */
      // resArr[0].subscribe({
      //   next( dataObj ) {
      //     thisMain.logger.info(thisMain, '[ next ] : ', dataObj);
      //   },
      //   error(error) {
      //     thisMain.logger.info(thisMain, '[ error ] : ', error.stack || error);
      //   },
      //   complete() {
      //     thisMain.logger.info(thisMain, '[ complete ] : ');
      //
      //     thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
      //       reqQuery: thisMain.reqQuery,
      //       svcInfo: thisMain._svcInfo
      //     } );
      //
      //   }
      // });

      /*
      * Mock 데이터 사용시
       */
      thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
        reqQuery: thisMain.reqQuery,
        svcInfo: thisMain._svcInfo,
        resDataInfo: resArr[0].result
      });


    });//Promise.all END

  }//render end


  //-------------------------------------------------------------[프로미스 생성]
  public _getPromiseApi(reqObj, msg): any {
    let thisMain = this;
    let tempData: any;
    let reqObjObservable: Observable<any> = reqObj;

    return new Promise((resolve, reject) => {
      Observable.combineLatest(
        reqObjObservable
      ).subscribe({
        next(reqObjObservable) {
          thisMain.logger.info(thisMain, `[ ${ msg } next ] : `, reqObjObservable);
        },
        error(error) {
          thisMain.logger.info(thisMain, `[ ${ msg } error ] : `, error.stack || error);
        },
        complete() {
          thisMain.logger.info(thisMain, `[ ${ msg } complete ] : `, reqObjObservable);
          resolve(reqObjObservable);
        }
      });

    });
  }

//-------------------------------------------------------------[프로미스 생성 - Mock]
  public _getPromiseApiMock(mockData, msg): any {
    return new Promise((resolve, reject) => {
      let ms: number = Math.floor(Math.random() * 1000) + 1;
      setTimeout(function () {
        console.log(`[ ${ msg } _getPromiseApiMock ] : ` + mockData);
        resolve(mockData);
        //reject('실패');
      }, ms);
    });
  }

  //-------------------------------------------------------------[클리이어튼로 전송]
  public renderView(res: Response, view: string, data: any): any {
    this.logger.info(this, '[ HTML ] : ', view);
    res.render(view, data);
  }


}

export default MytJoinServicePayClaimInfoTwibro;

