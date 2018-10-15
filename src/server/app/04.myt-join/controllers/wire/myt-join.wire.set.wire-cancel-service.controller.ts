/**
 * FileName: myt-join.wire.set.wire-cancel-service.controller.ts
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.10.15
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import StringHelper from '../../../../utils/string.helper';
import moment = require('moment');
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_FARE_BILL_GUIDE } from '../../../../types/string.type';
import { MYT_JOIN_CONTRACT_TERMINAL } from '../../../../types/string.type';

class MyTJoinWireSetWireCancelService extends TwViewController {
  constructor() {
    super();
  }
  public reqQuery: any;
  private _svcInfo: any;

  // 데이터
  private _resDataInfo: any = {};

  // 공통데이터
  private _commDataInfo: any = {
  };

  private _urlTplInfo: any = {
    pageRenderView: 'wire/myt-join.wire.set.wire-cancel-service.html',
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    this._svcInfo = svcInfo;
    const thisMain = this;
    this.reqQuery = req.query;
    this.logger.info(this, '[ svcInfo ] : ', svcInfo);
    this.logger.info(this, '[ reqQuery ] : ', req.query);

    // this._typeInit();

    // const p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0063, {}), 'p1');
    // const p1 = this._getPromiseApiMock( contractTerminal_BFF_05_0063, 'p1' );

    // Promise.all([p1]).then(function(resArr) {
    //
    //   thisMain._resDataInfo = resArr[0].result;
    //
    //   thisMain._dataInit();
    //
    //   thisMain.logger.info(thisMain, '[_urlTplInfo.pageRenderView] : ', thisMain._urlTplInfo.pageRenderView);
    //
    //   thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
    //     reqQuery: thisMain.reqQuery,
    //     svcInfo: svcInfo,
    //     commDataInfo: thisMain._commDataInfo,
    //     resDataInfo: thisMain._resDataInfo
    //   });
    // }, function(err) {
    //   thisMain.logger.info(thisMain, `[ Promise.all > error ] : `, err);
    //   return thisMain.error.render(res, {
    //     title: 'title',
    //     code: err.code,
    //     msg: err.msg,
    //     svcInfo: svcInfo
    //   });
    // });

    thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
      reqQuery: thisMain.reqQuery,
      svcInfo: svcInfo,
    });
  }


  private _dataInit() {

  }

  // -------------------------------------------------------------[SVC]


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

export default MyTJoinWireSetWireCancelService;
