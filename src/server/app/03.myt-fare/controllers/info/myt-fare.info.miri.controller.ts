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
import {API_CMD, API_CODE, API_VERSION} from '../../../../types/api-command.type';
import {MYT_FARE_BILL_GUIDE, MYT_INFO_MIRI, MYT_JOIN_WIRE_SVCATTRCD} from '../../../../types/string.type';

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
    const {line = '', date = ''} = req.query;
    this._info = {
      svcInfo,
      allSvc,
      line,
      date,
      childInfo
    };
    this._miriService = new MytFareInfoMiriService(req, res, svcInfo, req.query.line);
    this.getMiriData().subscribe((resp) => {
      if (!resp.code) {
        res.render('info/myt-fare.info.miri.html', {
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

    const {billsResp, allSvc} = this._info;
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
    returnData.svcName = this.getSvcType(name);
    returnData.svcNumOrAddr = name.substring(name.indexOf('(') + 1, name.indexOf(')'));

    const {M1, M2, M3, M4, S3} = MYT_JOIN_WIRE_SVCATTRCD;
    const svcName = [M1, M2, M3, M4, S3].find( attrNames => returnData.svcName === attrNames);
    if (svcName) {
      const svcItem = this.getAllSvcItem(allSvc, svcMgmtNum);
      returnData.svcNumOrAddr = this.phoneStrToDash(svcItem ? svcItem.svcNum : returnData.svcNumOrAddr);
    }

    return returnData;
  }

  /**
   * @desc 전체 회선정보에서 파라미터의 서비스 관리번호와 일치하는 회선정보 리턴
   * @param allSvc
   * @param svcMgmtNum
   * @private
   */
  private getAllSvcItem(allSvc: any, svcMgmtNum: string) {
    if ( !allSvc ) {
      this.logger.error(this, 'allSvc is ' + allSvc);
      return null;
    }
    const {m, s, o} = allSvc;
    let services: any = [];
    services = services.concat(m).concat(s).concat(o);
    return services.find( item => (item || {}).svcMgmtNum === svcMgmtNum);
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
      return M1;   // 휴대폰
    } else if ( nm.indexOf(M2) !== -1) {
      return M2;      // 선불폰

    } else if ( nm.indexOf(replace(M3)) !== -1) {
      return M3;      // T pocket Fi

    } else if ( nm.indexOf(replace(M3)) !== -1) {
      return M4;      // T Login

    } else if ( nm.indexOf(replace(M5)) !== -1) {
      return M5;      // T Wibro

    } else if ( nm.indexOf(S1) !== -1) {
      return S1;      // 인터넷

    } else if ( nm.indexOf(S2.toLowerCase()) !== -1) {
      return S2;      // TV

    } else if ( nm.indexOf(S3) + nm.indexOf(TEL_TYPE_1) > -2 ) {
      return S3;      // 집전화

    } else if ( nm.indexOf(O1) !== -1) {
      return O1;      // 포인트캠
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

  /**
   * @desc 청구/미납금액 가져오기
   * payAmt: 대체금액 필드. 청구금액에서 MIRI 납부된 금액
   * @param originItem
   * @param item
   * @private
   */
  private getPaymentAmount(originItem: any, item: any) {
    // 4: MIRI 선납 차감 일때만
    if (item.payClCd !== '4') {
      return item;
    }
    originItem = originItem || item;
    // 청구금액 계산
    originItem.billMonth = originItem.billMonth || '';
    originItem.payAmtText = originItem.payAmtText || '0';
    originItem.unPaidAmtText = originItem.unPaidAmtText || '0';

    if ( (item.payAmt || 0) > 0 && (item.invDt || '').length === 8) {
      const opDtM = DateHelper.getShortDateWithFormat(item.opDt, 'M'); // 처리 월
      const invDtM = DateHelper.getAddDays(item.invDt, 1, 'M'); // 청구 월
      // 처리 '월' 과 청구 '월' 이 같은경우만 청구금액, 다른 경우는 미납금액 sum
      if (opDtM === invDtM) {
        originItem.billMonth = invDtM;
        originItem.payAmtText = FormatHelper.addComma(item.payAmt);
      } else { // 미납금액 처리로직
        originItem.unPaidAmtText = originItem.unPaidAmtText.replace(/[^0-9]/g, '');
        const unpaid = parseInt(originItem.unPaidAmtText, 10);
        originItem.unPaidAmtText = unpaid + parseInt(item.payAmt, 10);
        originItem.unPaidAmtText = FormatHelper.addComma(originItem.unPaidAmtText.toString());
      }
    }
    return originItem;
  }

  private parseData(resp: any): any {
    const datas = new Map<string, any>(); // 월 별로 그룹핑 할 Map
    resp.map( item => {
      const parseData = {
        ...item,
        lineType: this.getLineType(item.svcMgmtNum), // 회선정보
        opDtFmt: DateHelper.getShortDateWithFormat(item.opDt, 'YY.M.D'), // 처리일자
        ppayAmt: FormatHelper.addComma(item.ppayAmt), // 처리금액
        ppayBamt: FormatHelper.addComma(item.ppayBamt) // MIRI 잔액
      };

      if (!datas.has(parseData.opDt)) {
        datas.set(parseData.opDt, []);
      }
      // 월별로 Map에 넣어준다.
      datas.get(parseData.opDt).push(parseData);
    });

    let totalCnt = 0;
    // 월별로 넣은 데이터를 다시 같은 달의 미납금액들을 merge 하여 sum 해준다.
    const miriList = Array.from(datas.values()).map( item => {
      const sumData = item.reduce( (acc, cur, idx) => {
        // '키' 를 서비스 관리번호 와 수납구분코드 로 묶어서 처리한다. 같은달에 다른 회선 및 다른 항목(예: 충전, 환불) 은 노출될 수 있다.
        let _key = cur.svcMgmtNum + cur.payClCd;
        _key += cur.payClCd !== '4' ? idx : '';
        const _item = acc[_key];
        // 누적 변수에 '키' 가 없으면 현재 데이터를 넣는다.
        if (!_item) {
          acc[_key] = cur;
        }
        acc[_key] = this.getPaymentAmount(_item, cur);
        return acc;
      }, {});

      const convertSumData = Object.keys(sumData).map( key => sumData[key]);
      totalCnt += convertSumData.length;
      return convertSumData;
    });

    return {
      totalCnt,
      miriList
    };
  }

}

export default MyTFareInfoMiri;
