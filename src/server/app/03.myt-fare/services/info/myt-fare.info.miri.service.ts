import ApiService from '../../../../services/api.service';
import {Observable} from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import {Request, Response} from 'express';

interface Miri {
  svcMgmtNum: string; // 서비스 관리번호
  acntNum: string;    // 계정번호
  opDt: string;       // 처리일자
  payOpTm: string;    // 처리시각
  payClCd: string;    // "수납구분코드 (1: MIRI 충전, 4: MIRI 선납 차감, 5: MIRI 선납 환불)"
  payClCdNm: string;  // "수납구분코드명 (1: MIRI 충전, 4: MIRI 선납 차감, 5: MIRI 선납 환불)",
  ppayAmt: string;    // 처리금액
  ppayBamt: string;   // "선납금액 (충전/차감 후 잔여금액)",
  svcNum: string;     // 서비스번호
  invDt: string;      // 청구일자
  invAmt: string;     // "청구금액 (차감 된 청구일자의 총 청구금액)",
  payAmt: string;     // "대체금액 (차감 된 청구일자로 대체된 금액)"
}

export class MytFareInfoMiriService {
  private readonly apiService: ApiService;
  private _selSvcMgmtNum: string;
  private _isRepresent = true; // 대표회선 여부
  private _svcInfo: any = {};

  /**
   * @desc MIRI 서비스 생성자
   * @param req
   * @param res
   * @param svcInfo
   * @param line 현재 접속 회선이 아닌 선택회선의 서비스 관리번호(ex: 종송회선, 자녀회선)
   */
  constructor(req: Request, res: Response, svcInfo: any, line?: string) {
    this._isRepresent = !line;
    this._svcInfo = svcInfo || {};
    this._selSvcMgmtNum = line || svcInfo.svcMgmtNum;
    this.apiService = new ApiService();
    this.apiService.setCurrentReq(req, res);
    this.apiService.setTimeout(3000);
  }

  /**
   * @desc 미리납부금액 BFF 요청
   * @private
   */
  public getMiriData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0109, {
      selSvcMgmtNum: this._selSvcMgmtNum
      }).map( resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }
      let miriList = resp.result.miriInfoList;
      if (!miriList || miriList.length < 1) {
        return [];
      }
      // 파라미터 line 이 대표 회선이라도, 파라미터로 받는경우 해당 회선의 데이터만 보여준다.
      if (!this._isRepresent && this._selSvcMgmtNum === this._svcInfo.svcMgmtNum) {
        miriList = miriList.filter( item => item.svcMgmtNum === this._selSvcMgmtNum);
      }

      // 최근내역이 위로 오도록 정렬
      return this.sortObjArrDesc(miriList, 'opDt', 'payOpTm');
    });
  }

  /**
   * @desc 정렬
   * @param array
   * @param key
   * @param secKey
   * @private
   */
  private sortObjArrDesc(array: any[], key: string, secKey: string): any {
    return array.sort((a, b) => {
      if (a[key] === b[key]) {
        return parseInt(b[secKey], 10) - parseInt(a[secKey], 10);
      }
      return parseInt(b[key], 10) - parseInt(a[key], 10);
    });
  }

  /**
   * @desc 선택회선의 선택월에 해당하는 미리납부하신 금액
   * 선납대체 처리일 : 2,5,6일 (2일에 선납대체된 금액은 전달로 포함한다.)
   * @param targetMonth 선택 월
   */
  public getMiriPayment(targetMonth: string): Observable<any> {
    if (!targetMonth) {
      return Observable.of(null);
    }
    return this.getMiriData().map(resp => {
      if (resp.code) {
        return null;
      }
      const startDt = DateHelper.getAddDays(targetMonth, 1, 'YYYYMM05');
      const endDt = DateHelper.getShortDateWithFormatAddByUnit(startDt, 1, 'month', 'YYYYMM02');
      const totalSum = resp.reduce( (acc, cur) => {
        const {opDt, payAmt, payClCd, svcMgmtNum} = cur;
        let condition = payClCd === '4' && DateHelper.isBetween(opDt, startDt, endDt);
        // 대표 회선이 아니면 서비스 관리번호가 같은 것만
        condition = this._isRepresent ? condition : condition && this._selSvcMgmtNum === svcMgmtNum;
        // 선택회선의 처리일자가 타켓일자와 같거나 클때.
        if (condition) {
          acc += parseInt(payAmt || 0, 10);
        }
        return acc;
      }, 0);

      return totalSum > 0 ? FormatHelper.addComma(totalSum.toString()) : null;
    });
  }

  /**
   * @desc 현재 선택회선의 MIRI 납부 잔액
   * @param targetMonth
   */
  public getMiriBalance(): Observable<any> {
    return this.getMiriData().map(resp => {
      if (resp.code) {
        return null;
      }

      const balance = resp.find( item => item.svcMgmtNum === this._selSvcMgmtNum);

      return balance && balance.ppayBamt > 0 ? FormatHelper.addComma(balance.ppayBamt.toString()) : null;
    });
  }
}
