/**
 * MenuName: 나의 가입정보 > 서브메인 > 인터넷/집전화/IPTV B끼리 무료 통화 대상자 조회(MS_04_02)
 * @file myt-join.freeCallCheck.controller.ts
 * @author Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * @since 2018.10.15
 * Summary: B끼리 무료 통화 대상자 조회화면 controller
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import StringHelper from '../../../../utils/string.helper';
import moment = require('moment');
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_FARE_BILL_GUIDE, MYT_JOIN_WIRE } from '../../../../types/string.type';
import { MYT_JOIN_CONTRACT_TERMINAL } from '../../../../types/string.type';

class MyTJoinWireFreeCallCheck extends TwViewController {
  constructor() {
    super();
  }
  public reqQuery: any;
  private _svcInfo: any;
  public pageInfo: any;

  private _urlTplInfo: any = {
    pageRenderView: 'wire/myt-join.wire.freeCallCheck.html'
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // if ( svcInfo.svcAttrCd.indexOf('S') === -1 ) {
    //   return this.error.render(res, {
    //     title: MYT_JOIN_WIRE.FREECALL_CHECK.TITLE,
    //     svcInfo: svcInfo
    //   });
    // }
    this._svcInfo = svcInfo;
    const thisMain = this;
    this.reqQuery = req.query;
    this.pageInfo = pageInfo;
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
      pageInfo: thisMain.pageInfo
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
        // console.log(`[ ${ msg } _getPromiseApiMock ] : ` + mockData);

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

export default MyTJoinWireFreeCallCheck;
