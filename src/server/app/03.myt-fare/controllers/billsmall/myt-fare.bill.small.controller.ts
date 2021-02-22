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
import { MYT_FARE_INFO_HISTORY } from '../../../../types/string.type';
import CommonHelper from '../../../../utils/common.helper';

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
    const lineType = CommonHelper.getLineType(svcInfo);
    // console.log(">>>>>>>>> lineType: ", lineType, svcInfo.svcGr);
    // 법인회선인 경우  
    if ( lineType.isCompanyLine ) {
      // 법인회선 E
      if (svcInfo.svcGr === 'E') {
        this.defaultRender(res, svcInfo, pageInfo);
      } 
      else {
        this.errorRender(req, res, pageInfo, svcInfo);
      }
    } else { // 법인회선이 아닌 경우 
      Observable.from(this.isAdult(API_CMD.BFF_05_0080)).subscribe(isAdult => {
        if (isAdult) { // 미성년자 법대 동의 
          req.query.isAdult = true;
          this.errorRender(req, res, pageInfo, svcInfo);
        } else { // 미성년자 법대 미동의 
          if (svcInfo.svcGr === 'Y' || svcInfo.svcGr === 'A') { // 일반회선 인증A, 인증B
            this.defaultRender(res, svcInfo, pageInfo);
          } else {
            this.errorRender(req, res, pageInfo, svcInfo);
          }  
        }
      });
    }
  }

  private defaultRender(res: Response, svcInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getHistory(),
      this.getPasswordStatus(),
      this.getUnusualStatus(),
      this.getAutoCardInfo(),
      this.getFaqList()
    ).subscribe(([microHistory, passwordStatus, unusualStatus, autoCardInfo, faqList]) => {
      const param = {
        usedYn: this.getHistoryInfo(microHistory),
        passwordInfo: this.getPasswordInfo(passwordStatus),
        unusualYn: unusualStatus, // 특이고객 여부
        autoCardInfo,
        faqList,
        svcInfo, // 회선 정보 (필수)
        pageInfo // 페이지 정보 (필수)
      };
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
    return Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0079, {}), // 소액결제 이용내역 조회
      this.apiService.request(API_CMD.BFF_08_0080, {})  // 만 나이 조회
    ).map( ([history, age]) => {
      history.age = (age.result || {}).age;
      return history;
    });
  }

  /**
   * @function
   * @desc parsing getHistory result
   * @param historyInfo
   * @returns {any}
   */
  private getHistoryInfo(historyInfo: any): any {
    // const usedValueList = ['0', '2', '6']; // 소액결제 제한 없음/사용 코드값
    /*const usedYn = {
      code: historyInfo.code,
      isAdult: historyInfo.age > 19,
      isUsed: false,
      isPassword: false,
      rtnUseYn: null
    };*/
    const {rtnUseYn = {}, cpmsYn = {}} = historyInfo.result || {};
    return {
      code: historyInfo.code,
      isAdult: historyInfo.age > 19,
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
      // const error = this.error.apiError([small, contents]);
      /*if (!FormatHelper.isEmpty(error) && error.code !== API_ADD_SVC_ERROR.BIL0030) {
        return error;
      }*/
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
    faqIds.push(['' , '1606010545']);
    faqIds.push(['' , '1606010546']);
    faqIds.push(['' , '1606010547']);
    faqIds.push(['' , '1606010548']);
    faqIds.push(['' , '1606010549']);
    faqIds.push(['' , '1606010550']);
    faqIds.push(['' , '1606010551']);
    faqIds.push(['' , '1606010552']);

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
     */
    return Observable.combineLatest(
      /*reqFaq(['' , '1606010545']),
      reqFaq(['' , '1606010546']),
      reqFaq(['' , '1606010547']),
      reqFaq(['' , '1606010548']),
      reqFaq(['' , '1606010549']),
      reqFaq(['' , '1606010550']),
      reqFaq(['' , '1606010551']),
      reqFaq(['' , '1606010552'])*/
      requests
    ).map( responses => {
      this.logger.info(this, '### ', responses);
      return responses.reduce((acc, cur, idx) => {
        if (!FormatHelper.isEmpty(cur.result)) {
          acc.push({
            ...cur.result,
            faqId: getFaqId(faqIds[idx])
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

    let error = {
      title: '',
      contents: ''
    };
    if (res.query.isAdult) { // 미성년자 메세지 
        error.title = MYT_FARE_INFO_HISTORY.ERROR.NO_ADULT_LINE.title;
        error.contents = '';
    } else { // 법인회선 메세지
      error.title = MYT_FARE_INFO_HISTORY.ERROR.COMPANY_LINE.title;
      error.contents = MYT_FARE_INFO_HISTORY.ERROR.COMPANY_LINE.contents
    }
    const code = res.query.code || '',
          msg = error.title,
          subMsg = error.contents,
          isPopupCheck = false;
    this.error.render(res, {
      code: code,
      msg: msg,
      subMsg: subMsg,
      pageInfo: pageInfo,
      svcInfo: svcInfo,
      isPopupCheck: isPopupCheck
    });

    // this.error.render(res, {
    //   code: resp.code,
    //   msg: resp.msg,
    //   pageInfo: pageInfo,
    //   svcInfo: svcInfo
    // });
  }
  /**
   * @return {Observable}
   * @desc 소액결제, 콘텐츠결제 미성년자여부 체크 
   */
  private isAdult = (apiName): Observable<any | null> => {
    // BFF_05_0080: 소액결제, BFF_05_0066: 콘텐츠 결제 
    return this.apiService.request(apiName, {}).map((resp: { code: string; result: any }) => {
      // console.log(">>>>>>>>>>>> isAdult Code: ", resp.code);
      if (resp.code === 'BIL0031') {
        resp.result = true;
      } else {
        resp.result = false;
      }
      return resp.result;
    });
  }

}

export default MyTFareBillSmall;
