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
import moment = require('moment');

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

    // this.logger.info (this, '[customer.email.controller] #########################################################################', '');
    // this.logger.info (this, '[customer.email.controller] req.params : ', req.params);
    // this.logger.info (this, '[customer.email.controller] req.params.page : ', req.params.page);
    // this.logger.info (this, '[customer.email.controller] #########################################################################', '');

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
          this.getEmailHistoryDetail(req.query.inqid, req.query.inqclcd, true) // 해당 문의 상세조회, 재문의 구분값 true
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
        this.getEmailHistoryDetail(req.query.inqid, req.query.inqclcd, true) // 해당 문의 상세조회, 재문의 구분값 true
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
            const resultList: any = [];

            // this.logger.info (this, '[customer.email.controller] +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++', '');
            // this.logger.info (this, '[customer.email.controller] response.result 전체 건수 : ', response.result.length);
            // this.logger.info (this, '[customer.email.controller] 지금으로부터 6개월 이전 : ', DateHelper.convDateCustomFormat(DateHelper.getPast6MonthsShortDate(), 'YYYYMMDD'));

            // console.log('===== historyList =====', response);

            for (let idx = 0; idx < response.result.length; idx++) {
              // this.logger.info (this, '[customer.email.controller] rgstDt : ', DateHelper.convDateCustomFormat(response.result[idx].rgstDt, 'YYYYMMDD'));

              // 등록일 (rgstDt) 이 현재 일자를 기준으로 6개월 이전인 경우 노출하지 않음 (OP002-6350)
              if (DateHelper.convDateCustomFormat(response.result[idx].rgstDt, 'YYYYMMDD') >= DateHelper.convDateCustomFormat(DateHelper.getPast6MonthsShortDate(), 'YYYYMMDD')) {
                // this.logger.info (this, '[customer.email.controller] 쏘옥 ', idx + 1 );
                resultList.push(response.result[idx]);
              }
            }
            // this.logger.info (this, '[customer.email.controller] +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++', '');

            // console.log('===== after history =====', resultList);

            res.render('email/customer.email.history.html',
              Object.assign({}, responseData, {
                inquiryList: resultList,
                convertDate: this.convertDate
              })
            );
          });
        break;
      // 상담내역 상세조회
      case 'history-detail':
        this.getEmailHistoryDetail(req.query.inqid, req.query.inqclcd, false) // 해당 문의 상세조회
          .subscribe((response) => {

            // console.log('===== history-detail =====', response);

            res.render('email/customer.email.history.detail.html',
              Object.assign({}, responseData, {
                inquiryInfo: response.result,
                convertDate: this.convertDate,
                isDateOver: this.isDateOver,
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
  private getEmailHistoryDetail(inqId: string, inqClCd: string, reTry: boolean): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0061, {
      inqId: inqId,
      inqClCd: inqClCd,
      svcDvcClCd: 'M'
    }).map((resp) => {
      // 재문의 일때는 모두 등록
      // 재문의일때 Y, 재문의 이면서 상위 있을때 Y, 재문의 아닐때 N,


      if(reTry) {  // 재문의 인 경우 (서비스 재문의 및 품질 재문의 그러나 멤버십 구서버 인 경우는 ejs에서 재문의 못하게 처리 및 api에서도 값 없음, )
        // resp.result.ofrCtgSeq = '5000280';
        resp.result.inq1DepthName = this.get1DepthName(resp.result.ofrCtgSeq);
        if (!FormatHelper.isEmpty(resp.result.supInqId)) { // 상위 상담 id가 있는경우
          return this.mapRetryResult(resp);
        }
        return resp;  // 재문의 이지만 상위 상담 id가 없는경우
      }

      // 재문의가 아닌경우
      return resp;

        // if(reTry && !FormatHelper.isEmpty(resp.result.supInqId)) {  // 상위 상담 id가 있는경우
        //   resp.result.ofrCtgSeq = '5000352';
        //   resp.result.inq1DepthName = this.get1DepthName(resp.result.ofrCtgSeq);
        //   return this.mapRetryResult(resp);
        // } else if(reTry) {
        //   resp.result.ofrCtgSeq = '5000352';
        //   resp.result.inq1DepthName = this.get1DepthName(resp.result.ofrCtgSeq);
        //   return resp;
        // } else {  // 재문의가 아닐때
        //   return resp;
        // }

    });  // end of map
  }


    /**
   * @function
   * @description BFF_08_0061의 카테고리 코드로 1depth 이름 리턴 // BFF_08_0010 카테고리 값으로만 맞출지 나중에 고민, js에 타입으로 정의되어 있는 카테고리 코드는 안쓰는듯, 품질쪽은 1depth 적용 안하지만 그냥 놔둠(145, 060)
   * @param {string} ctgCode 상담내역 상세조회 결과값
   * @returns {Observable}
   */
  private get1DepthName(ctgCode: string): string {
    switch (ctgCode) {
      case '5000273': case '5000274': case '5000270': case '5000271': case '5000275':
      case '5000269': case '5000280': case '5000117':
        return '휴대폰';
      case '5000141': case '5000143': case '5000147': case '5000149': case '5000151': case '5000152': case '5000153':
        return '인터넷/전화/IPTV';
      // case '07': case '10': case '12': case '08': case '09': case '13': case '14':
      //   return 'T다이렉트샵';
      case '5000351': case '5000352': case '5000353': case '5000354':
        return 'T멤버십 구매상품';
      case '5000145':
        return '휴대폰 통화품질 상담';
      case '5000060':
        return '인터넷/전화/IPTV 통화품질 상담';
    }
    return '이메일 상담';
  }

  /**
   * @function
   * @description 최초 문의 글이 있는 재문의 글인경우 문의글을 최초 문의글로 대체
   * @param {any} resp 상담내역 상세조회 결과값
   * @returns {Observable}
   */
  private mapRetryResult(resp :any): Observable<any> {

    resp.result.relDetail.map((inquiryList) => {
      if(inquiryList.orgYn === 'Y') {  // relDetail의 리스트에서 원글인 리스트를 찾아서 해당 내용으로 대체, orgYn 최초 문의글 여부
        // return {
          resp.result.inqId = inquiryList.inqId;
          resp.result.rgstDt = inquiryList.rgstDt;
          resp.result.title = inquiryList.qTitle;
          resp.result.contents = inquiryList.qContents;
          resp.result.answYn = inquiryList.answYn;
          resp.result.answEmailAddr = inquiryList.email;
        // } // end of return
      } // end of if
    });  // end of map

    // console.log('============= resp ==============', resp);
    return resp;

  } // end of mapRetryResult


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
   * @desc 최초 등록일이 오늘 날짜부터 30일 이전인지 확인하는 함수를 전달 (템플릿에서 바로 사용), true이면 30일이 넘은 상태
   */
  public isDateOver = (firstDate) => (moment().subtract(30, 'days') > moment(firstDate,'YYYYMMDD')) ? true : false;


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
