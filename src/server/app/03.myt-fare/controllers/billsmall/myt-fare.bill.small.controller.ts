/**
 * @file myt-fare.bill.small.controller.ts
 * @author 양정규
 * @since 2021.01.06
 * @desc 휴대폰 결제/콘텐츠 이용료 메인화면 (구 소액결제)
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import {Observable} from 'rxjs/Observable';
import {MYT_FARE_MICRO_NAME} from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';

/**
 * @class
 * @desc 휴대폰 결제/콘텐츠 이용료 메인
 */
class MyTFareBillSmall extends TwViewController {
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
    this.apiService.setTimeout(3000); // 타임아웃 설정
    const isBubin = ['R', 'D'].indexOf(svcInfo.svcGr) > -1; // 법인 C, D (회선등급 C의 경우 정책서 상에는 svcGr 값이 C이고 시스템 상에는 svcGr 값이 R)
    const reqList = new Array();
    if (!isBubin) {
      reqList.push(this.getHistory());
      reqList.push(this.getPasswordStatus());
      reqList.push(this.getUnusualStatus());
      reqList.push(this.getAutoCardInfo());
    }
    reqList.push(this.getFaqList());

    Observable.combineLatest(
      reqList
    ).subscribe((responses) => {
      const param = {
        usedInfo: {},
        passwordInfo: {},
        unusualYn: {}, // 특이고객 여부
        autoCardInfo : {},
        isBubin,
        svcInfo, // 회선 정보 (필수)
        pageInfo // 페이지 정보 (필수)
      };
      if (!isBubin) {
        const [microHistory, passwordStatus, unusualStatus, autoCardInfo] = responses.splice(0, 4);
        Object.assign(param, {
          usedInfo: this.getHistoryInfo(microHistory, svcInfo),
          passwordInfo: this.getPasswordInfo(passwordStatus),
          unusualYn: unusualStatus, // 특이고객 여부
          autoCardInfo
        });
      }
      Object.assign(param, {
        faqList: responses.pop()
      });

      res.render('billsmall/myt-fare.bill.small.html', this.parseData(param));
    }, (error) => {
      this.errorRender(res, error, svcInfo, pageInfo);
    });

  }

  private parseData(param): any {
    const cDate = new Date(),
      result = {
        ...param,
        currentMonth: DateHelper.getCurrentMonth(), // 현재월 조회
        firstDate: DateHelper.getShortFirstDate(cDate), // 이달의 첫 날짜
        toDate: DateHelper.getShortDate(cDate) // 현재 일자
      };

    return result;
  }

  /**
   * @function
   * @desc 소액결제 사용여부 및 비밀번호 서비스 사용여부 조회
   * @returns {Observable<any>}
   */
  private getHistory(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0079, {}); // 소액결제 이용내역 조회;
  }

  /**
   * @function
   * @desc parsing getHistory result
   * @param historyInfo
   * @returns {any}
   */
  private getHistoryInfo(historyInfo: any, svcInfo: any): any {
    const {rtnUseYn = '', cpmsYn = 'N'} = historyInfo.result || {};
    return {
      code: historyInfo.code,
      isAdult: svcInfo.age > 18, // 만 19세 부터 성인
      isUsed: ['0', '2', '6'].indexOf(rtnUseYn) > -1, // 소액결제 사용여부. 0,2,6이면 사용으로 표시
      rtnUseYn,
      isPassword: cpmsYn === 'Y' // 비밀번호 서비스 사용여부
    };
  }

  /**
   * @function
   * @desc 비밀번호 상태 조회
   * @returns {Observable<any>}
   */
  private getPasswordStatus(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0085, {});
  }

  /**
   * @desc 특이고객 유/무
   * @returns Observable<any>
   */
  private getUnusualStatus(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0103, {}).map( resp => {
      return (resp.code === API_CODE.CODE_00 && resp.result.spcl_sp_yn === 'Y') ? 'Y' : 'N';
    });
  }

  /**
   * @function
   * @desc parsing getPasswordStatus result
   * @param passwordStatus
   * @returns {any}
   */
  private getPasswordInfo(passwordStatus: any): any {
    if (passwordStatus.code === API_CODE.CODE_00) {
      const passwordResult = passwordStatus.result;
      passwordStatus.text = MYT_FARE_MICRO_NAME[passwordResult.cpinStCd]; // 코드값에 따라 신청, 변경, 잠김, 초기화 문구 셋팅
      passwordStatus.cpmsYn = passwordResult.cpmsYn;
    }
    return passwordStatus;
  }

  /**
   * @function
   * @desc 자동선결제 정보 조회
   * @returns {Observable<any>}
   */
  private getAutoCardInfo(): Observable<any> {
    return Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_07_0072, {}),
      this.apiService.request(API_CMD.BFF_07_0080, {})
    ).map(([small, contents]) => {
      return {
        small: this.parseCardInfo(small.result),
        contents: this.parseCardInfo(contents.result)
      };
    });
  }

  /**
   * @function
   * @desc parsing card info
   * @param result
   * @returns {any}
   */
  private parseCardInfo(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      result.autoChargeAmount = FormatHelper.addComma(result.autoChrgAmt); // 선결제 신청금액에 콤마(,) 추가
      result.autoChargeStandardAmount = FormatHelper.addComma(result.autoChrgStrdAmt); // 기준금액에 콤마(,) 추가
    }
    return result;
  }


  private getFaqList(): Observable<any> {

    const isPrd = String(process.env.NODE_ENV) === 'prd', // 상용 여부
      faqIds: any = [];
    faqIds.push(['1606010621' , '1606010545', '24']);
    faqIds.push(['1606010622' , '1606010546', '25']);
    faqIds.push(['1606010623' , '1606010547', '26']);
    faqIds.push(['1606010624' , '1606010548', '27']);
    faqIds.push(['1606010625' , '1606010549', '28']);
    faqIds.push(['1606010626' , '1606010550', '29']);
    faqIds.push(['1606010627' , '1606010551', '30']);
    faqIds.push(['1606010628' , '1606010552', '31']);

    const getFaqId = (ifaqIds: Array<string>) => {
      return ifaqIds[isPrd ? 0 : 1];
    };

    const reqFaq = (ifaqIds: Array<string>) => {
      return this.apiService.request(API_CMD.BFF_08_0073, {ifaqId: getFaqId(ifaqIds)});
    };
    const requests: Array<Observable<any>> = faqIds.reduce( (acc, cur) => {
      acc.push(reqFaq(cur));
      return acc;
    }, []);

    /*
        아래 faq id만 조회하여 노출한다.
        [0] : 상용 faq id
        [1] : 스테이징 faq id
        [2] : 오퍼통계 코드
     */
    return Observable.combineLatest(
      requests
    ).map( responses => {
      return responses.reduce((acc, cur, idx) => {
        if (!FormatHelper.isEmpty(cur.result)) {
          acc.push({
            ...cur.result,
            faqId: getFaqId(faqIds[idx]),
            eid: faqIds[idx][2] // 오퍼통계 코드
          });
        }
        return acc;
      }, []);

    });

  }

  /**
   * @function
   * @desc error render
   * @param res
   * @param resp
   * @param svcInfo
   * @param pageInfo
   * @returns {any}
   */
  private errorRender(res, resp, svcInfo, pageInfo): any {
    this.error.render(res, {
      code: resp.code,
      msg: resp.msg,
      pageInfo: pageInfo,
      svcInfo: svcInfo
    });
  }
}

export default MyTFareBillSmall;
