/**
 * My Bills > REAL-TIME MONTHLY FEES
 * @file myt-fare.bill.hotbill.controller.ts
 * @author (skt.P165332@partner.sk.com)
 * @since 2020.09
 */
import TwViewController from '../../../../common_en/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types_en/api-command.type';
import { LINE_NAME } from '../../../../types_en/bff.type';
import StringHelper from '../../../../utils_en/string.helper';
import { MYT_FARE_HOTBILL_TITLE } from '../../../../types_en/title.type';
import { Observable } from 'rxjs/Observable';
import { delay, mergeMap } from 'rxjs/operators';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import FormatHelper from '../../../../utils_en/format.helper';
import CommonHelper from '../../../../utils_en/common.helper';
import BrowserHelper from '../../../../utils/browser.helper';

class MyTFareBillHotbill extends TwViewController {
  _svcInfo: any;
  _isPrev: boolean = false;
  _blockOnFirstDay = false; // 매월 1일 조회 불가 여부

  constructor() {
    super();
  }
  public reqQuery: any;  // 쿼리스트링
  public pageInfo: any;

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any) {
    const thisMain = this;

    this.reqQuery = req.query;
    this.pageInfo = pageInfo;
    this.reqQuery.line = (this.reqQuery.line) ? this.reqQuery.line : '';

    this.reqQuery.date = (this.reqQuery.date) ? this.reqQuery.date : '';

    const defaultData = {
      reqQuery: thisMain.reqQuery,
      svcMgmtNum: svcInfo.svcMgmtNum,
      svcAttrCd: svcInfo.svcAttrCd,
      allSvc: allSvc,
      errorMsg: ''
    };
    BrowserHelper.isApp(req)?thisMain.getAppXtEid(defaultData):thisMain.getMWebXtEid(defaultData);

    /*
    isWireLine : (SVC_CDGROUP.WIRE.indexOf(svcInfo.svcAttrCd) > -1) ? true : false, // 유선회선타입 체크
    isPPSLine : svcInfo.svcAttrCd === SVC_ATTR_E.PPS ? true : false, // PPS 타입 체크
    isLineNotExist : (svcInfo.caseType === '02') ? true : false, //라인이 있는지 체크
    isLineCountIsZero: (svcInfo.nonSvcCnt === 0) ? true : false, // 라인이 0개 인지 체크
    isCompanyLine: (svcInfo.svcGr === 'R' || svcInfo.svcGr === 'D' || svcInfo.svcGr === 'E') ? true : false, // 법인회선 체크
    */

    // OP002-8156: [개선][FE](W-2002-034-01) 회선선택 영역 확대 2차
    CommonHelper.addCurLineInfo(svcInfo);

    this._svcInfo = svcInfo;
    this._isPrev  = req.url.endsWith('/prev');
    let test      = this.reqQuery.test;
    
    if( test === '500' ){
      return res.status(500).render('en.error.page-not-found.html', { svcInfo: null, code: 500 });
    }
    
    //영문화 유선회선인경우 회선변경 안내페이지로 이동
    if(['M1'].indexOf(svcInfo.svcAttrCd) === -1 || test === 'notphone'  ) {
      res.render('bill/en.myt-fare.bill.hotbill.not.phone.html' ,{ data:defaultData,svcInfo : svcInfo, pageInfo : thisMain.pageInfo });
      return;
    }  
    //무선회선이 없는경우
    if(svcInfo.caseType === '02' || test === 'notLine' ) {
      defaultData.errorMsg = 'LINE_NOT_EXIST';
      res.render('bill/en.myt-fare.bill.hotbill.not.line.html' ,{ data:defaultData,svcInfo : svcInfo, pageInfo : thisMain.pageInfo });
      return;
    }

    //무선 회선은 있지만 등록된 회선이 없는경우
    if(svcInfo.caseType === '03' || svcInfo.nonSvcCnt === 0 || test === 'notRegi') {
      defaultData.errorMsg = 'LINE_NOT_REGIST';
      res.render('bill/en.myt-fare.bill.hotbill.not.line.html' ,{ data:defaultData,svcInfo : svcInfo, pageInfo : thisMain.pageInfo });
      return;
    }
    
    // 당월 요금은 2일부터 조회 가능(매월 1일은 안내 매세지 출력) -> [DV001-19501]가능하게 수정
    // if ( this._blockOnFirstDay && new Date().getDate() === 1 && !this._isPrev || test == '1day') {
    //   let data = {
    //     svcInfo,
    //     pageInfo,
    //     lines: [],
    //     billAvailable: false,
    //     isPrev:  this._isPrev,
    //     xtEid: {}
    //   };
    //   // 다른 페이지를 찾고 계신가요 통계코드 추가
    //   BrowserHelper.isApp(req)?thisMain.getAppXtEid(data):thisMain.getMWebXtEid(data);

    //   res.render('bill/en.myt-fare.bill.hotbill.html', );
    // } else {
      // 자녀 or 본인 전월 실시간 요금
    const svcs = this._getServiceInfo(svcInfo, childInfo, allSvc);
    let data = {
      svcInfo,
      pageInfo,
      lines: svcs,
      billAvailable: true,
      isPrev:  this._isPrev,
      xtEid: {}
    };
    // 다른 페이지를 찾고 계신가요 통계코드 추가
    BrowserHelper.isApp(req)?thisMain.getAppXtEid(data):thisMain.getMWebXtEid(data);
    res.render('bill/en.myt-fare.bill.hotbill.html', data);
//  }
  }

  /**
   * 본의의 선택회선 외 회선과 자녀회선의 실시간 요금은 노드에서 요청한다.
   * @param svcInfo
   * @param childInfo
   * @param allSvc
   * @private
   */
  private _getServiceInfo(svcInfo, childInfo, allSvc): any[] {
    let svcs = childInfo || [];
    svcs.map(svc => {
      svc.child = true;
      return svc;
    });

    const otherSvc = allSvc || [];
    if ( otherSvc && otherSvc[LINE_NAME.MOBILE] ) {
      svcs = svcs.concat(otherSvc[LINE_NAME.MOBILE]
        .filter(svc => (['M1', 'M3'].indexOf(svc.svcAttrCd) > -1) &&  // 지원 회선 필터링
          ( svc.svcMgmtNum !== svcInfo['svcMgmtNum'])));
    }
    return svcs.map(svc => {
      svc.clsNm =  [ 'M3', 'M4'].indexOf(svc.svcAttrCd) > -1 ? 'tablet' : 'cellphone';
      svc.svcDashedNum = FormatHelper.conTelFormatWithDash(svc.svcNum);
      return JSON.parse(JSON.stringify(svc));
    });
  }

   /**
   * 다른 페이지를 찾고 계신가요 통계코드 생성
   * @param data
   */
  private getAppXtEid(data: any): any {
    const eid = {
      line        : 'CMMA_A10_B81_C1201_D4351-2', // 회선번호
      notPhone    : 'CMMA_A10_B81_C1201_D4351-7',   // notPhone
      gotoKor     : 'CMMA_A10_B81_C1201_D4351-8',     // goKor
      notLine     : 'CMMA_A10_B81_C1201_D4351-10'
    };
    data.xtEid = eid;
  }
  
  private getMWebXtEid(data: any): any {
    const eid = {
      line        : 'MWMA_A10_B81_C1201_D4351-1',    // 회선번호
      notPhone    : 'MWMA_A10_B81_C1201_D4351-4',   // notPhone
      gotoKor     : 'MWMA_A10_B81_C1201_D4351-5',     // goKor
      notLine     : 'MWMA_A10_B81_C1201_D4351-9'
    };
    data.xtEid = eid;
  }

}

export default MyTFareBillHotbill;
