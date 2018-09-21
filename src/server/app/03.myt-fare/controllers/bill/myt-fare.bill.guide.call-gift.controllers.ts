/**
 * FileName: myt-fare.bill.guide.call-gift.controllers.ts
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.21
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

class MyTFareBillGuideCallGift extends TwViewController {
  constructor() {
    super();
  }

  public reqQuery: any;  // 쿼리스트링
  private _billpayInfo: any = {}; // 청구요금조회 | BFF_05_0036

  // 공통데이터
  private _commDataInfo: any = {

  };

  // 노출조건
  private _showConditionInfo: any = {

  };

  private _urlTplInfo: any = {
    default: 'bill/myt-fare.bill.guide.integrated-rep.html',
  };

  private _typeChk: any = null; // 화면구분

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    const thisMain = this;
    this.reqQuery = req.query;
    this.logger.info(this, '[ svcInfo ] : ', svcInfo);
    this.logger.info(this, '[ reqQuery ] : ', req.query);

    thisMain.renderView(res, thisMain._urlTplInfo.default, {
      reqQuery: thisMain.reqQuery,
      svcInfo: svcInfo,
    });

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

export default MyTFareBillGuideCallGift;
