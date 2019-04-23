/**
 * @file [이메일상담하기]
 * @author Lee Kirim
 * @since 2018-10-24
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import FormatHelper from '../../../../utils/format.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import { Observable } from 'rxjs/Observable';

/**
 * @interface
 * @desc userAgent 형태 (디바이스 정보)
 */
interface UserAgent {
  source: string;
}
/**
 * @interface
 * @desc 기본적인 req 의 형태는 Request 이지만 userAgent를 프론트에서 잘 가져오지 못하는 문제가 있어 서버에서 분류되는 useragent 정보를 따로 추가하여 렌더링 함
 */
interface AddUserAgent extends Request {
  useragent: UserAgent;
}

/**
 * @interface
 * @desc 서비스목록조회 API 응답값 .result
 * @prop {string} ofrCtgSeq 코드 5000117
 * @prop {string} ctgNm 이름 T월드 연계 상품/서비스
 */
interface CategoryCases {
  [key: string]: {
    ofrCtgSeq: string;
    ctgNm: string;
  }[];
}

class CustomerEmail extends TwViewController {
  constructor() {
    super();
  }

  render(req: AddUserAgent, res: Response, _next: NextFunction, svcInfo: any, allSvc: any, _childInfo: any, pageInfo: any): void {
    const page = req.params.page; // 페이지

    /**
     * @desc 전달할 데이터 정의
     */
    const responseData = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      isApp: BrowserHelper.isApp(req),
      svcNum: FormatHelper.conTelFormatWithDash(svcInfo.svcNum),
      allSvc: allSvc,
      convertTelFormat: this.convertTelFormat,
      userAgent: req.useragent.source || ''
    };

    /**
     * @desc customer/emailconsult/:page
     */
    switch ( page ) {
      // 이메일 등록 완료 케이스
      case 'complete':
        res.render('email/customer.email.complete.html', Object.assign(
          responseData,
          { email: req.query.email }
        ));
        break;
      // 서비스문의 재문의 케이스
      case 'service-retry':
        Observable.combineLatest(
          this.getServiceCategory(), // 서비스 카테고리 목록 
          this.getEmailHistoryDetail(req.query.inqid, req.query.inqclcd) // 해당 문의 상세조회
        ).subscribe(([serviceCategory, historyDetail]) => {
          res.render('email/customer.email.service.retry.html',
            Object.assign({}, responseData, {
              serviceCategory: serviceCategory.result,
              inquiryInfo: historyDetail.result,
              convertDate: this.convertDate
            })
          );
        });
        break;
      // 품질 재문의 케이스
      case 'quality-retry':
        this.getEmailHistoryDetail(req.query.inqid, req.query.inqclcd) // 해당 문의 상세조회
          .subscribe((response) => {
            res.render('email/customer.email.quality.retry.html',
              Object.assign({}, responseData, {
                inquiryInfo: response.result,
                convertDate: this.convertDate
              })
            );
          });
        break;
      // 상담내역 케이스
      case 'history':
        this.getEmailHistory() // 상담내역 조회
          .subscribe((response) => {
            res.render('email/customer.email.history.html',
              Object.assign({}, responseData, {
                inquiryList: response.result,
                convertDate: this.convertDate
              })
            );
          });
        break;
      // 상담내역 상세조회
      case 'history-detail':
        this.getEmailHistoryDetail(req.query.inqid, req.query.inqclcd) // 해당 문의 상세조회
          .subscribe((response) => {
            res.render('email/customer.email.history.detail.html',
              Object.assign({}, responseData, {
                inquiryInfo: response.result,
                convertDate: this.convertDate,
                hideEmail: this.hideEmail
              })
            );
          });
        break;
      // 상담하기 케이스
      default:
        this.getAllSvcInfo() // 회선정보 조회
          .subscribe(response => {
            if (response.code === API_CODE.CODE_00) {
              allSvc = response.result || allSvc;
            }
            res.render('email/customer.email.html', Object.assign({}, responseData, Object.assign(allSvc, {userId: svcInfo.userId})));
          });
    }
  }

  /**
   * @function
   * @desc 상담내역 조회 
   * @returns {Observable}
   */
  private getEmailHistory(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0060, {
      svcDvcClCd: 'M' // 문의 타입 모바일
    });
  }

  /**
   * @function
   * @description 상담내역 상세조회
   * @param {string} inqId 상담내역 ID
   * @param {string} inqClCd 문의유형
   * @returns {Observable}
   */
  private getEmailHistoryDetail(inqId: string, inqClCd: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0061, {
      inqId: inqId,
      inqClCd: inqClCd,
      svcDvcClCd: 'M'
    });
  }

  /**
   * @function
   * @desc 회선정보 조회 
   * @returns {Observable}
   */
  private getAllSvcInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_03_0030, {});
  }

  /**
   * @function
   * @desc 질문유형 목록조회
   * @returns {Observable} CategoryCases
   */
  private getServiceCategory(): Observable<{result: CategoryCases}> {
    return this.apiService.request(API_CMD.BFF_08_0010, {});
  }

  /**
   * @function
   * @desc YYYYMMDDhhmmss -> YYYY.M.D. 로 변경하는 함수를 전달 (템플릿에서 바로 사용)
   */
  public convertDate = (sDate) => DateHelper.getShortDate(sDate);

  /**
   * @function
   * @desc 전화번호 형식으로 -(대쉬) 붙여 반환해주는 함수를 전달 (템플릿에서 바로 사용)
   */
  public convertTelFormat = (sPhoneNumber) => FormatHelper.conTelFormatWithDash(sPhoneNumber);

  /**
   * @function
   * @desc 마스킹 처리 업무를 FE에서 잠깐 해달라고 요청한 적이 있었던 history 로 잠시 사용했다가 현재는 사용하지 않고 있음 (템플릿에서 바로 사용)
   */
  public hideEmail = (sEmail) => {
    const prefixEMail = sEmail.slice(0, 2);
    const suffixEmail = sEmail.slice(2).replace(/[^@]/g, '*');
    return prefixEMail + suffixEmail;
  }
}

export default CustomerEmail;
