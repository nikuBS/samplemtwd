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
import { MYT_FARE_BILL_GUIDE, MYT_JOIN_WIRE } from '../../../../types/string.type';
import { MYT_JOIN_CONTRACT_TERMINAL } from '../../../../types/string.type';

class MyTJoinWireSetWireCancelService extends TwViewController {
  constructor() {
    super();
  }
  public reqQuery: any;
  private _svcInfo: any;
  public pageInfo: any;

  // 데이터
  private _resDataInfo: any = {};

  // 공통데이터
  private _commDataInfo: any = {
  };

  private _urlTplInfo: any = {
    pageRenderView: 'wire/myt-join.wire.set.wire-cancel-service.html',
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if ( svcInfo.svcAttrCd.indexOf('S') === -1 ) {
      return this.error.render(res, {
        title: MYT_JOIN_WIRE.SET_WIRE_CANCEL.TITLE,
        svcInfo: svcInfo
      });
    }

    this._svcInfo = svcInfo;
    const thisMain = this;
    this.reqQuery = req.query;
    this.pageInfo = pageInfo;
    this.logger.info(this, '[ svcInfo ] : ', svcInfo);
    this.logger.info(this, '[ allSvc ] : ', allSvc);
    this.logger.info(this, '[ reqQuery ] : ', req.query);

    // this._typeInit();

    const p1 = this._getPromiseApi(this.apiService.request(API_CMD.BFF_05_0172, {}), 'p1');

    Promise.all([p1]).then(function(resArr) {

      thisMain._resDataInfo = resArr[0].result;
      /* thisMain._resDataInfo = {
        'wireList': [
          {
            'SVC_CHG_CD': '',
            'FEE_PROD_ID': 'NT00000327',
            'ADDR_ID': '100000011217791',
            'SVC_DTL_CL_NM': 'BTV',
            'CO_CL_CD': 'B',
            'REP_SVC_MGMT_NUM': '7271600813',
            'RCV_OPER_ST_NM': '',
            'SVC_MGMT_NUM': '7286359873',
            'SVC_SCRB_DT': '20180127',
            'ACNT_NUM': '6139473412',
            'SVC_TECH_MTHD_NM': 'Btv(IPTV_UHD_STB)',
            'SVC_NM': '',
            'FEE_PROD_NM': '(N)스마트',
            'BAS_ADDR': '서울 양천구 중앙로39길 29-10,',
            'SVC_NUM': '7286359873',
            'SVC_DTL_CL_CD': 'T1',
            'SVC_ST_CD': 'AC',
            'CUST_NM': '박태영',
            'DTL_ADDR': '(신정동) 2층',
            'SVC_ST_NM': '사용중',
            'CUST_NUM': '9720313200',
            'RCV_DTM': '',
            'RCV_SEQ': '',
            'RCV_OPER_ST_CD': '',
            'SVC_TECH_MTHD_CD': 'T0011',
            'SVC_CD': 'T',

            'GRP_ID': '1234'
          },
          {
            'SVC_CHG_CD': '',
            'FEE_PROD_ID': 'NT00000299',
            'ADDR_ID': '100000011217791',
            'SVC_DTL_CL_NM': 'BTV',
            'CO_CL_CD': 'B',
            'REP_SVC_MGMT_NUM': '7271600813',
            'RCV_OPER_ST_NM': '',
            'SVC_MGMT_NUM': '7286359872',
            'SVC_SCRB_DT': '20180127',
            'ACNT_NUM': '6139473412',
            'SVC_TECH_MTHD_NM': 'Btv(IPTV)',
            'SVC_NM': '',
            'FEE_PROD_NM': '베이직',
            'BAS_ADDR': '서울 양천구 중앙로39길 29-10,',
            'SVC_NUM': '7286359872',
            'SVC_DTL_CL_CD': 'T1',
            'SVC_ST_CD': 'AC',
            'CUST_NM': '박태영',
            'DTL_ADDR': '(신정동) 2층',
            'SVC_ST_NM': '사용중',
            'CUST_NUM': '9720313200',
            'RCV_DTM': '',
            'RCV_SEQ': '',
            'RCV_OPER_ST_CD': '',
            'SVC_TECH_MTHD_CD': 'T0004',
            'SVC_CD': 'T',

            'GRP_ID': '5678'

          },
          {
            'SVC_CHG_CD': '',
            'FEE_PROD_ID': 'NI00000282',
            'ADDR_ID': '100000011217791',
            'SVC_DTL_CL_NM': '인터넷',
            'CO_CL_CD': 'T',
            'REP_SVC_MGMT_NUM': '7271600813',
            'RCV_OPER_ST_NM': '',
            'SVC_MGMT_NUM': '7271600813',
            'SVC_SCRB_DT': '20161028',
            'ACNT_NUM': '6139473412',
            'SVC_TECH_MTHD_NM': '광랜FTTH',
            'SVC_NM': '',
            'FEE_PROD_NM': 'T_스마트광랜(다이렉트)',
            'BAS_ADDR': '서울 양천구 중앙로39길 29-10,',
            'SVC_NUM': '7271600813',
            'SVC_DTL_CL_CD': 'I1',
            'SVC_ST_CD': 'AC',
            'CUST_NM': '박태영',
            'DTL_ADDR': '(신정동) 2층',
            'SVC_ST_NM': '사용중',
            'CUST_NUM': '9720313200',
            'RCV_DTM': '',
            'RCV_SEQ': '',
            'RCV_OPER_ST_CD': '',
            'SVC_TECH_MTHD_CD': 'B0032',
            'SVC_CD': 'I',

            'GRP_ID': '9292'
          }
        ]
      };*/

      thisMain._dataInit();

      thisMain.logger.info(thisMain, '[_urlTplInfo.pageRenderView] : ', thisMain._urlTplInfo.pageRenderView);

      thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
        reqQuery: thisMain.reqQuery,
        svcInfo: svcInfo,
        pageInfo: thisMain.pageInfo,
        allSvc: allSvc,
        commDataInfo: thisMain._commDataInfo,
        resDataInfo: thisMain._resDataInfo
      });
    }, function(err) {
      thisMain.logger.info(thisMain, `[ Promise.all > error ] : `, err);
      return thisMain.error.render(res, {
        title: MYT_JOIN_WIRE.SET_WIRE_CANCEL.TITLE,
        code: err.code,
        msg: err.msg,
        svcInfo: svcInfo
      });
    });


    // thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
    //   reqQuery: thisMain.reqQuery,
    //   svcInfo: svcInfo,
    // });
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

export default MyTJoinWireSetWireCancelService;
