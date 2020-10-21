/**
 * @file myt-fare.info.miri.controller.ts
 * @author 양정규
 * @since 2020.10.16
 * @desc depth MyT > 나의요금 > 요금안내서 > 미리납부하신 금액(MIRI)
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {MytFareInfoMiriService} from '../../services/info/myt-fare.info.miri.service';
import { Observable } from 'rxjs/Observable';
import {SVC_ATTR_NAME} from '../../../../types/bff.type';
import StringHelper from '../../../../utils/string.helper';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import {API_CODE} from '../../../../types/api-command.type';

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
    this._info = {
      childSvcMgmtNum: req.query.line,
      childInfo
    };
    this._miriService = new MytFareInfoMiriService(this._info.childSvcMgmtNum || svcInfo.svcMgmtNum, req, res);
    this.getMiriData().subscribe((resp) => {
      if (!resp.code) {
        res.render('info/myt-fare.info.miri.html', {
          svcInfo,
          pageInfo,
          data: this.parseData(allSvc, resp)
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
    return this._miriService.getMiriData();
  }

  private parseData(allSvc: any, resp: any): any {
    const data = resp.map( item => {
      return {
        ...item,
        lineType: this.getSvcAttrName(allSvc, item.svcMgmtNum), // 회선정보
        opDt: DateHelper.getShortDateWithFormat(item.opDt, 'YY.M.D'), // 처리일자
        month: DateHelper.getCurrentMonth(item.opDt), // 청구월
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

  /**
   * @desc 회선정보
   * @param allSvc
   * @param svcMgmtNum
   * @private
   */
  private getSvcAttrName(allSvc: any, svcMgmtNum: string): any {
    const {childInfo, childSvcMgmtNum} = this._info;
    // 자녀회선정보 조회라면
    if (childSvcMgmtNum) {
      return this.getChildSvcAttrName(childInfo, childSvcMgmtNum);
    }
    const {m, s} = allSvc;
    const svcAttr = (m || []).find( item => item.svcMgmtNum === svcMgmtNum) || (s || []).find( item => item.svcMgmtNum === svcMgmtNum);
    if (!svcAttr) {
      return {
        svcName: '',
        svcNumOrAddr: ''
      };
    }
    return {
      svcName: SVC_ATTR_NAME[svcAttr.svcAttrCd],
      // 인터넷, IPTV 인지 여부. (유선이지만 집전화는 제외!)
      svcNumOrAddr: ['S1', 'S2'].indexOf(svcAttr.svcAttrCd) > -1 ? svcAttr.addr : StringHelper.phoneStringToDash(svcAttr.svcNum)
    };
  }

  /**
   * @desc 자녀회선 정보 조회
   * @param childInfo
   * @param svcMgmtNum
   * @private
   */
  private getChildSvcAttrName(childInfo: Array<any>, childSvcMgmtNum: string) {
    if (!childInfo || childInfo.length < 1 || FormatHelper.isEmpty(childSvcMgmtNum)) {
      return {};
    }

    const childAttr = childInfo.find( item => item.svcMgmtNum === childSvcMgmtNum);
    return childAttr ? {
      svcName: SVC_ATTR_NAME.M1,
      svcNumOrAddr: StringHelper.phoneStringToDash(childAttr.svcNum)
    } : {};
  }

}

export default MyTFareInfoMiri;
