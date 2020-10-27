/**
 * @file myt-fare.info.miri.controller.ts
 * @author 양정규
 * @since 2020.10.16
 * @desc depth MyT > 나의요금 > 요금안내서 > 미리납부하신 금액(MIRI)
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common_en/controllers/tw.view.controller';
import {MytFareInfoMiriService} from '../../services/info/myt-fare.info.miri.service';
import { Observable } from 'rxjs/Observable';
import {SVC_ATTR_NAME} from '../../../../types_en/bff.type';
import StringHelper from '../../../../utils_en/string.helper';
import DateHelper from '../../../../utils_en/date.helper';
import CommonHelper from '../../../../utils_en/common.helper';
import FormatHelper from '../../../../utils_en/format.helper';
import {API_CMD, API_CODE, API_VERSION} from '../../../../types_en/api-command.type';
import {MYT_FARE_BILL_GUIDE, MYT_INFO_MIRI, MYT_JOIN_WIRE_SVCATTRCD} from '../../../../types_en/string.type';

class MyTFareInfoMiri extends TwViewController {
  private _miriService!: MytFareInfoMiriService;
  private _info: any;

  constructor() {
    super();
  }

  /**
   * @function
   * @desc render
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    CommonHelper.addCurLineInfo(svcInfo);
    const {line = '', date = ''} = req.query;
    this._info = {
      svcInfo,
      line,
      date,
      childInfo
    };

    const defaultData = {
      svcMgmtNum: svcInfo.svcMgmtNum,
      svcAttrCd: svcInfo.svcAttrCd,
      allSvc: allSvc,
      errorMsg: ''
    };


    //무선회선이 없는경우
    if(svcInfo.caseType === '02') {
      defaultData.errorMsg = 'LINE_NOT_EXIST';
      res.render('bill/en.myt-fare.bill.hotbill.not.line.html' ,{ data:defaultData,svcInfo : svcInfo, pageInfo : pageInfo });
      return;
    }

    //무선 회선은 있지만 등록된 회선이 없는경우
    if(svcInfo.caseType === '03' || svcInfo.nonSvcCnt === 0 ) {
      defaultData.errorMsg = 'LINE_NOT_REGIST';
      res.render('bill/en.myt-fare.bill.hotbill.not.line.html' ,{ data:defaultData,svcInfo : svcInfo, pageInfo : pageInfo });
      return;
    }

    //영문화 유선회선인경우 회선변경 안내페이지로 이동
    if(['M1'].indexOf(svcInfo.svcAttrCd) === -1  ) {
      res.render('bill/en.myt-fare.bill.hotbill.not.phone.html' ,{ data:defaultData,svcInfo : svcInfo, pageInfo : pageInfo });
      return;
    }
    
    this._miriService = new MytFareInfoMiriService(req, res, svcInfo, req.query.line);
    this.getMiriData().subscribe((resp) => {
      if (!resp.code) {
        res.render('info/en.myt-fare.info.miri.html', {
          svcInfo,
          pageInfo,
          data: this.parseData(resp)
        });
      } else {
        this.error.render(res, {
          code: resp.code, msg: resp.msg, pageInfo, svcInfo
        });
      }
    });
  }

  /**
   * @desc 미리납부 금액 조회
   * @private
   */
  private getMiriData(): Observable<any> {
    const {svcInfo, date, line} = this._info;
    // 청구요금 조회. 대표청구 여부(svcInfo.actRepYn) Y인 경우 조회하여 MiRI 납부내역의 회선관리 번호와 매칭된 회선정보 추출한다.
    if ( svcInfo.actRepYn === 'Y' ) {
      return Observable.combineLatest(
        this.apiService.request(API_CMD.BFF_05_0036, {
          invDt: date,
          selSvcMgmtNum : line
        }, null, [], API_VERSION.V2),
        this._miriService.getMiriData()
      ).map( resp => {
        this._info.billsResp = resp[0];
        return resp[1];
      });
    }
    return this._miriService.getMiriData();
  }

  /**
   * 회선정보 리턴
   * @param svcMgmtNum 조회대상 서비스 관리번호
   * @return 회선정보
   */
  private getLineType(svcMgmtNum: string) {
    const returnData = {
      svcName: MYT_INFO_MIRI.NOT_FOUND_LINE,
      svcNumOrAddr: ''
    };

    const {billsResp} = this._info;
    let _svcInfo = this.getChildLineInfo(svcMgmtNum);
    // 자녀회선인 경우
    if (_svcInfo) {
      return _svcInfo;
    }

    _svcInfo = this.getDependencylLineInfo(svcMgmtNum);
    // 종속회선인 경우
    if (_svcInfo) {
      return _svcInfo;
    }

    const {code, result} = billsResp;
    if (!billsResp || code !== API_CODE.CODE_00 || !result || FormatHelper.isEmptyArray(result.invSvcList) ||
      FormatHelper.isEmptyArray(result.invSvcList[0].svcList)) {
      return returnData;
    }
    
    const svc = result.invSvcList[0].svcList.find( item => item.svcMgmtNum === svcMgmtNum);
    if (!svc) {
      return returnData;
    }
    
    const {name} = svc;
    //returnData.svcName = SVC_ATTR_NAME[svc.svcAttrCd];
    returnData.svcName = this.getSvcType(name);
    returnData.svcNumOrAddr = name.substring(name.indexOf('(') + 1, name.indexOf(')'));

    const {M1, M2, M3, M4, S3} = MYT_JOIN_WIRE_SVCATTRCD;
    const svcName = [M1, M2, M3, M4, S3].find( attrNames => returnData.svcName === attrNames);
    if (svcName) {
      returnData.svcNumOrAddr = this.phoneStrToDash(returnData.svcNumOrAddr);
    }

    return returnData;
  }

  /**
   * @desc 자녀회선 정보 조회
   * @param childInfo
   * @param svcMgmtNum
   * @private
   */
  private getChildLineInfo(childSvcMgmtNum: string) {
    const {childInfo, line} = this._info;
    if (!line || !childInfo || childInfo.length < 1 || FormatHelper.isEmpty(childSvcMgmtNum)) {
      return null;
    }

    const childAttr = childInfo.find( item => item.svcMgmtNum === childSvcMgmtNum);
    return childAttr ? {
      svcName: SVC_ATTR_NAME.M1,
      svcNumOrAddr: StringHelper.phoneStringToDash(childAttr.svcNum)
    } : null;
  }

  /**
   * @desc 종속회선 정보
   * @param svcMgmtNum
   * @private
   */
  private getDependencylLineInfo(svcMgmtNum: string): any {
    const {svcInfo} = this._info;
    const {svcAttrCd, addr, svcNum} = svcInfo;

    // 대표청구(actRepYn:Y) 아닌, 종속회선인 경우 현재 회선정보를 리턴.
    return svcInfo.actRepYn !== 'Y' ? {
      svcName: SVC_ATTR_NAME[svcAttrCd],
      // 주소 or 연락처. 인터넷, IPTV = 주소, 그 외엔 연락처
      svcNumOrAddr: ['S1', 'S2'].indexOf(svcAttrCd) > -1 ? addr : StringHelper.phoneStringToDash(svcNum)
    } : null;
  }

  /**
   * 이름으로 svcType을 리턴
   * svcType = 휴대폰, 선불폰, T pocket Fi, T Login, T Wibro, 인터넷, IPTV, 집전화, 포인트캠
   * @param nm
   */
  private getSvcType(nm: string) {
    const replace = (val => {
      return val.replace(/ /g, '').toLowerCase();
    });

    nm = replace(nm);
    const {M1, M2, M3, M4, M5, S1, S2, S3, O1} = MYT_JOIN_WIRE_SVCATTRCD;
    const {PHONE_TYPE_0, TEL_TYPE_1} = MYT_FARE_BILL_GUIDE;
    // svcType
    if ( nm.indexOf(M1) + nm.indexOf(PHONE_TYPE_0) > -2) { // 이동전화
      return SVC_ATTR_NAME.M1;   // 휴대폰
    } else if ( nm.indexOf(M2) !== -1) {
      return SVC_ATTR_NAME.M2;      // 선불폰

    } else if ( nm.indexOf(replace(M3)) !== -1) {
      return SVC_ATTR_NAME.M3;      // T pocket Fi

    } else if ( nm.indexOf(replace(M3)) !== -1) {
      return SVC_ATTR_NAME.M4;      // T Login

    } else if ( nm.indexOf(replace(M5)) !== -1) {
      return SVC_ATTR_NAME.M5;      // T Wibro

    } else if ( nm.indexOf(S1) !== -1) {
      return SVC_ATTR_NAME.S1;      // 인터넷

    } else if ( nm.indexOf(S2.toLowerCase()) !== -1) {
      return SVC_ATTR_NAME.S2;      // TV

    } else if ( nm.indexOf(S3) + nm.indexOf(TEL_TYPE_1) > -2 ) {
      return SVC_ATTR_NAME.S3;      // 집전화

    } else if ( nm.indexOf(O1) !== -1) {
      return SVC_ATTR_NAME.O1;      // 포인트캠
    }
    return '';
  }

  // 별표가 있는 휴대폰 번호 대시 적용
  private phoneStrToDash(strCellphoneNum: string): string {
    if ( !strCellphoneNum ) {
      return '';
    }
    // return strCellphoneNum.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9\*]+)([[0-9\*]{4})/, '$1-$2-$3');
    return StringHelper.phoneStringToDash(strCellphoneNum.replace(/-/g, ''));
  }

  private parseData(resp: any): any {
    const data = resp.map( item => {
      return {
        ...item,
        lineType: this.getLineType(item.svcMgmtNum), // 회선정보
        opDt: DateHelper.getShortDateWithFormat(item.opDt, 'YY.M.D'), // 처리일자
        billMonth: DateHelper.getCurrentMonthName(item.opDt), // 청구월
        ppayAmt: FormatHelper.addComma(item.ppayAmt), // 처리금액
        invAmt: FormatHelper.addComma(item.invAmt), // 청구금액
        payAmt: FormatHelper.addComma(item.payAmt), // 미납금액
        ppayBamt: FormatHelper.addComma(item.ppayBamt), // MIRI 잔액
      };
    });
    
    const datas = new Map<string, any>();
    // Map에 처리일자별 배열로 넣어준다.
    data.forEach( val => {
      if (!datas.has(val.opDt)) {
        datas.set(val.opDt, []);
      }
      datas.get(val.opDt).push(val);
    });
    return {
      totalCnt: data.length,
      miriList: Array.from(datas.values()) // Map 의 값들을 Array 로 변환해서 리턴한다.
    };
  }

}

export default MyTFareInfoMiri;
