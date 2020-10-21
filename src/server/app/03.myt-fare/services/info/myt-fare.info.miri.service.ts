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

  constructor(selSvcMgmtNum: string, req: Request, res: Response) {
    this._selSvcMgmtNum = selSvcMgmtNum;
    this.apiService = new ApiService();
    this.apiService.setCurrentReq(req, res);
  }

  /**
   * @desc 미리납부금액 BFF 요청
   * @private
   */
  public getMiriData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0109, {
      selSvcMgmtNum: this._selSvcMgmtNum
      }).map( resp => {
      if (resp.code !== API_CODE.CODE_00/* || !resp.result.miriInfoList || resp.result.miriInfoList.length < 1*/) {
        return resp;
      }
      if (!resp.result.miriInfoList || resp.result.miriInfoList.length < 1) {
        return [];
      }
      // 최근내역이 위로 오도록 정렬
      return FormatHelper.sortObjArrDesc(resp.result.miriInfoList, 'opDt');
    });
  }

  /**
   * @desc 선택월에 해당하는 미리납부하신 금액
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
      targetMonth = DateHelper.getAddDays(targetMonth, 1, 'YYYYMMDD');
      const totalSum = resp.reduce( (acc, cur) => {
        const {opDt, ppayAmt, payClCd} = cur;
        // const _opDt = (opDt || '').substring(0, 6) + '02';
        // 청구일자가 타켓일자와 같거나 클때
        if (opDt >= targetMonth && payClCd === '4') {
          acc += parseInt(ppayAmt || 0, 10);
        }
        return acc;
      }, 0);

      return totalSum > 0 ? FormatHelper.addComma(totalSum.toString()) : null;
    });
  }

  private getMiriDataMock(): Observable<any> {
    /*
      선납대체 처리일자
      미납대체: 2일
      무선대체: 5일
      유선대체: 6일
     */
    const resp = {
      code: '00',
      msg: 'sucess',
      result: {
        miriInfoList: [
          /*{
            'svcMgmtNum' : '서비스관리번호',
            'acntNum' : '계정번호',
            'opDt' : '처리일자',
            'payOpTm' : '처리시각',
            'payClCd' : '수납구분코드 (1: MIRI 충전, 4: MIRI 선납 차감, 5: MIRI 선납 환불)',
            'payClCdNm' : '수납구분코드명 (1: MIRI 충전, 4: MIRI 선납 차감, 5: MIRI 선납 환불)',
            'ppayAmt' : '처리금액',
            'ppayBamt' : '선납금액 (충전/차감 후 잔여금액)',
            'svcNum' : '서비스번호',
            'invDt' : '청구일자',
            'invAmt' : '청구금액 (차감 된 청구일자의 총 청구금액)',
            'payAmt' : '대체금액 (차감 된 청구일자로 대체된 금액)'
          },*/
          {
            'svcMgmtNum' : '7016134141',
            'acntNum' : '1000000000',
            'opDt' : '20201005',
            'payOpTm' : '16431111',
            'payClCd' : '4',
            'payClCdNm' : 'MIRI 선납 차감',
            'ppayAmt' : '20000',
            'ppayBamt' : '140000',
            'svcNum' : '01000**0***',
            'invDt' : '20200902',
            'invAmt' : '40000',
            'payAmt' : '40000'
          },
          {
            'svcMgmtNum' : '7229514533',
            'acntNum' : '1000000000',
            'opDt' : '20201002',
            'payOpTm' : '16431111',
            'payClCd' : '4',
            'payClCdNm' : 'MIRI 선납 차감',
            'ppayAmt' : '20000',
            'ppayBamt' : '140000',
            'svcNum' : '01000**0***',
            'invDt' : '20200905',
            'invAmt' : '40000',
            'payAmt' : '40000'
          },
          {
            'svcMgmtNum' : '1234567890',
            'acntNum' : '1000000000',
            'opDt' : '20200905',
            'payOpTm' : '16431111',
            'payClCd' : '5',
            'payClCdNm' : 'MIRI 선납 환불',
            'ppayAmt' : '20000',
            'ppayBamt' : '140000',
            'svcNum' : '01000**0***',
            'invDt' : '20200805',
            'invAmt' : '40000',
            'payAmt' : '40000'
          },
          {
            'svcMgmtNum' : '1234567890',
            'acntNum' : '1000000000',
            'opDt' : '20201005',
            'payOpTm' : '16431111',
            'payClCd' : '4',
            'payClCdNm' : 'MIRI 선납 차감',
            'ppayAmt' : '20000',
            'ppayBamt' : '140000',
            'svcNum' : '01000**0***',
            'invDt' : '20201002',
            'invAmt' : '40000',
            'payAmt' : '40000'
          },
          {
            'svcMgmtNum' : '1234567890',
            'acntNum' : '1000000000',
            'opDt' : '20201005',
            'payOpTm' : '16431111',
            'payClCd' : '1',
            'payClCdNm' : 'MIRI 충전',
            'ppayAmt' : '10000',
            'ppayBamt' : '140000',
            'svcNum' : '01000**0***',
            'invDt' : '20201002',
            'invAmt' : '40000',
            'payAmt' : '40000'
          },
        ]
      }
    };

    /*for (let i = 0; i < 3; i++) {
      resp.result.miriList = resp.result.miriList.concat(resp.result.miriList);
    }*/

    /*resp.result.miriList = resp.result.miriList.concat([{
      'svcMgmtNum' : '1234567890',
      'acntNum' : '1000000000',
      'opDt' : '20200502',
      'payOpTm' : '16431111',
      'payClCd' : '1',
      'payClCdNm' : 'MIRI 충전',
      'ppayAmt' : '10000',
      'ppayBamt' : '140000',
      'svcNum' : '01000**0***',
      'invDt' : '20201002',
      'invAmt' : '40000',
      'payAmt' : '40000'
    }]);*/

    return Observable.of(resp);
  }
}
