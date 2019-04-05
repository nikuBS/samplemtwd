import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';

/**
 * @file myt-join.info.contract.controller.ts
 * MS_02_01
 * 설명 : 나의가입정보(인터넷/집전화/IPTV) > 이용계약정보
 * @author 양정규 (skt.P130715@partner.sk.com)
 * @since 2018.10.15
 */

class MyTJoinInfoContract extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.reqContract()
    ).subscribe(([resp]) => {
      if ( resp.code === API_CODE.CODE_00) {
        const data = this.getData(resp.result, svcInfo, pageInfo);
        res.render( 'info/myt-join.info.contract.html', data );
      } else {
        this.fail(res, resp, svcInfo, pageInfo);
      }
    });
  }

  /**
   * 화면에 넘길 데이터 생성
   * @param data
   * @param svcInfo
   * @param pageInfo
   */
  private getData(data: any, svcInfo: any, pageInfo: any): any {
    this.parseData(data);

    return {
      svcInfo,
      pageInfo,
      data
    };
  }

  /**
   * 데이터 파싱
   * @param data
   */
  private parseData(data: any): void {
    data.svsetPrefrDtm = DateHelper.getShortDate(data.svsetPrefrDtm);
    // 가입유형은 "신규가입/번호이동가입" 으로 2개의 값을 주기 때문에 슬러시 뒤에 값으로 보여주도록 한다.
    if ( data.svcChgNm.indexOf('/') > 0 ) {
      data.svcChgNm = data.svcChgNm.split('/')[1];
    }
  }

  /**
   * 이용계약 정보 API 호출
   */
  protected reqContract(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0139, {});
  }

  /**
   * API Response fail
   * @param res
   * @param data
   * @param svcInfo
   * @param pageInfo
   */
  private fail(res: Response, data: any, svcInfo: any, pageInfo: any): void {
    this.error.render(res, {
      code: data.code,
      msg: data.msg,
      pageInfo: pageInfo,
      svcInfo: svcInfo
    });
  }
}

export default MyTJoinInfoContract;
