/**
 * MenuName: 나의 가입정보 > 서브메인(인터넷/집전화/IPTV 회선) > 서비스해지 신청(MS_04_08)
 * @file myt-join.wire.set.wire-cancel-service.controller.ts
 * @author Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * @since 2018.10.15
 * Summary: 서비스 해지 신청이 있다면 신청현황화면으로 없다면 정보 조회 후 신청화면으로 이동
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
    // if ( svcInfo.svcAttrCd.indexOf('S') === -1 ) {
    //   return this.error.render(res, {
    //     title: MYT_JOIN_WIRE.SET_WIRE_CANCEL.TITLE,
    //     svcInfo: svcInfo
    //   });
    // }

    if ( this._ifCompletePageMove(req, res, 'submain/myt-join.submain.complete.html') ) {
      return ;
    }

    this._svcInfo = svcInfo;
    const thisMain = this;
    this.reqQuery = req.query;
    this.pageInfo = pageInfo;
    this.logger.info(this, '[ svcInfo ] : ', svcInfo);
    this.logger.info(this, '[ allSvc ] : ', allSvc);
    this.logger.info(this, '[ reqQuery ] : ', req.query);

    // 서비스 해지 신청 현황을 조회 후 신청건이 있다면 신청정보 화면으로 이동
    this.apiService.request(API_CMD.BFF_05_0198, {})
      .subscribe(function(resp) {
        if ( resp.code === API_CODE.CODE_00 && !FormatHelper.isEmpty(resp.result) ) {

          const data = resp.result;
          // const data = {
          //   'svcName': '인터넷',
          //   'svcTechMthdNm': '광랜FTTH',
          //   'visitCntcNum': '01011112222',
          //   'termPrefrDtmFront': '20180104112233',
          //   'rcvOperStNm': '일반해지 접수'
          // };


          data['visitCntcNum'] = StringHelper.phoneStringToDash(data['visitCntcNum']);  // 연락처
          data['termPrefrDtmFront'] = DateHelper.getShortDate(data['termPrefrDtmFront']);      // 해지 신청일
          // data['termPrefrDy'] = DateHelper.getShortDateNoDot(data[i]['termPrefrDy']);      // 해지 요청일?

          return res.render(
            'wire/myt-join.wire.set.wire-cancel-service.info.html',
            {
              svcInfo: svcInfo,
              pageInfo: thisMain.pageInfo,
              data: data
            }
          );
        } else {
          thisMain._goSvcCancelView(res, svcInfo, allSvc, pageInfo);
        }
      });

    // thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
    //   reqQuery: thisMain.reqQuery,
    //   svcInfo: svcInfo,
    // });
  }

  private _goSvcCancelView(res: Response, svcInfo: any, allSvc: any, pageInfo: any) {

    // this._typeInit();
    const thisMain = this;

    // 해지 신청 대상 조회
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

      // thisMain._dataInit();

      // 세트 상품으로 묶어야 하기 때문에 'GRP_ID' 로 그룹바이 해준다.
      const _groupList = thisMain._resDataInfo.wireList.reduce( (acc, cur) => {
        acc[cur.GRP_ID] = [...acc[cur.GRP_ID] || [], cur];
        return acc;
      }, {});

      // 상품 종류 로 내림차순 정렬 'T' 상품이 위로 B 상품이 아래로 정렬되도록 한다.
      let _sortData = [];
      Object.keys(_groupList).map((key) => {
        _sortData = _sortData.concat(thisMain._sortDesc(_groupList[key], 'CO_CL_CD'));
      });

      thisMain._resDataInfo.wireList = _sortData;  // 세트별(상품별 정렬)로 정렬한걸 다시 넣어준다.

      // sk브로드밴드 여부 : 브로드밴드 회선인 경우 화면에서 서브메인으로 리턴시킴
      let skbdYn = 'N';
      for ( let i = 0; i < thisMain._resDataInfo.wireList.length ; i++ ) {
        if ( thisMain._resDataInfo.wireList[i].SVC_MGMT_NUM === svcInfo.svcMgmtNum ) {
          if ( thisMain._resDataInfo.wireList[i].CO_CL_CD === 'B' ) {
            skbdYn = 'Y';
            break;
          }
        }
      }
      thisMain._resDataInfo.skbdYn = skbdYn;

      // 2019-08-20 OP002-3325: SKB 상품도 노출하도록 변경
      /*for ( let i = thisMain._resDataInfo.wireList.length - 1; i >= 0; i-- ) {
        // skb 상품 제외
        if ( thisMain._resDataInfo.wireList[i].CO_CL_CD === 'B' ) {
          thisMain._resDataInfo.wireList.splice(i, 1);
        }
      }*/


      thisMain.logger.info(thisMain, '[_urlTplInfo.pageRenderView] : ', thisMain._urlTplInfo.pageRenderView);

      thisMain.renderView(res, thisMain._urlTplInfo.pageRenderView, {
        reqQuery: thisMain.reqQuery,
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        allSvc: thisMain.getAllSvcClone(allSvc),
        commDataInfo: thisMain._commDataInfo,
        resDataInfo: thisMain._resDataInfo
      });
    }, function(err) {
      thisMain.logger.info(thisMain, `[ Promise.all > error ] : `, err);
      return thisMain.error.render(res, {
        title: MYT_JOIN_WIRE.SET_WIRE_CANCEL.TITLE,
        code: err.code,
        msg: err.msg,
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });
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

  /**
   * 완료 화면 이동 (url의 끝이 /complete인 경우)
   * @param req
   * @param res
   * @param compView - 완료html
   * @private
   */
  private _ifCompletePageMove(req: Request, res: Response, compView: string) {
    const compUrl = '/complete';
    const url = req.url.substr(0, req.url.indexOf('?'));
    const q = req.query || {};
    if ( url.lastIndexOf(compUrl) === url.length - compUrl.length) {
      res.render(compView, {
        confirmMovPage : q.confirmMovPage || '',
        mainTxt : q.mainTxt || '',
        subTxt : q.subTxt || '',
        linkTxt : q.linkTxt || '',
        linkPage : q.linkPage || ''
      });
      return true;
    }
    return false;
  }


  /**
   * allSvc에서 필요한 정보만 복사
   * @param allSvc
   */
  private getAllSvcClone(allSvc: any) {
    if ( !allSvc ) {
      return null;
    }
    return {
      'm': this.copyArr(allSvc.m),
      's': this.copyArr(allSvc.s),
      'o': this.copyArr(allSvc.o)
    };
  }
  private copyArr(arr: Array<any>) {
    if ( !arr ) {
      return arr;
    }
    const tmpArr: Array<any> = [];
    for ( let i = 0 ; i < arr.length; i++ ) {
      tmpArr.push(this.copyObj(arr[i], ['svcNum', 'svcGr', 'actRepYn']));
    }
    return tmpArr;
  }
  private copyObj(obj: any, keys: Array<any>) {
    if ( !obj ) {
      return obj;
    }
    const tmp = {};
    for ( let i = 0; i < keys.length; i++) {
      if ( obj.hasOwnProperty(keys[i]) ) {
        tmp[keys[i]] = obj[keys[i]];
      }
    }
    return tmp;
  }

  /**
   * array 내림차순 정렬
   * @param arr
   * @param key
   */
  private _sortDesc(arr: any[], key: string): any {
    return arr.sort((a, b) => {
      return a[key] > b[key] ? -1 : a[key] < b[key] ? 1 : 0;
    });
  }

}

export default MyTJoinWireSetWireCancelService;
