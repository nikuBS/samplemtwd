/**
 * @file [고객센터-메인]
 * @author Lee Kirim
 * @since 2018-07-23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { combineLatest } from 'rxjs/observable/combineLatest';
import BrowserHelper from '../../../../utils/browser.helper';
import { REDIS_KEY } from '../../../../types/redis.type';
import { Observable } from 'rxjs/observable';

/**
 * @interface
 * @desc 공지사항 리스트 조회 응답값 resp.result의 형태
 */
interface Notice {
  content: {
    [key: string]: string
  }[];
}

/**
 * @interface
 * @desc 배너 array 의 구조
 */
interface Banners {
  expsSeq: number;
  titleNm: string;
  imgUrl: string;
  imgAltCtt: string;
  dtlBtnUseYn: 'Y' | 'N';
  contsList?: {
    contsSeq: number;
    contsId: string;
    contsNm: string;
  }[];
}
class CustomerMain extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any): void {
    combineLatest(
      this.getBanners(), // 배너정보
      this.getNotice(req), // 공지사항
      this.getResearch() // 설문조사
      , this.getTest()
    ).subscribe(([banners, notice, researchList, test]) => {
      const noticeList = notice ? this.parseNoticeList(BrowserHelper.isApp(req), notice) : [];
      res.render('main/customer.main.html', {
        svcInfo: svcInfo,
        banners: this.exceptNullObject(banners),
        pageInfo: pageInfo,
        noticeList: noticeList,
        isApp: BrowserHelper.isApp(req),
        researchList: researchList
      });
    });
  }

  /**
   * @function
   * @desc 조회된 notice list 에서 앱이면 3개, 기본 6개 목록을 반환
   * @param {boolean} isApp
   * @param {Notice} notice
   * @returns {array} notice.content
   */
  private parseNoticeList = (isApp: boolean, notice: Notice): any[] => isApp ? notice.content.splice(0, 3) : notice.content.splice(0, 6);

  /**
   * @function
   * @desc 배너조회 응답값 배열중 null 값은 제외해 반환
   * @param {Banners[]} banners
   * @returns {Banners[]}
   */
  private exceptNullObject = (banners: Banners[]): Banners[] => {
    const resultData: Banners[] = [];
    if (banners && banners.length) {
      banners.map(banner => {
        if (banner !== null) {
          resultData.push(banner);        
        }
      }) ;
    }
    return resultData;
  }

  /**
   * @function
   * @desc 배너 조회 API 호출
   * @returns {Observable}
   */
  private getBanners = (): Observable<any> => this.redisService.getData(REDIS_KEY.BANNER_ADMIN + 'M000673')
    .map((resp) => {
      return (resp && resp.result) ? resp.result.banners : [];
    })

    /**
   * @function
   * @desc 설문조사 API 호출
   * @returns {Observable}
   */
  private getResearch = (): Observable<any> => this.apiService.request(API_CMD.BFF_08_0025, {})
    .map((res) => {
      if ( res.code === API_CODE.CODE_00 ) {
        return res.result;
      } else {
        return null;
      }
    })

  /**
   * @function
   * @desc 공지사항 API 호출
   * @returns {Observable}
   */
  private getNotice = (req: Request): Observable<any> => {
    const expsChnlCd = this._getTworldChannel(req);

    return this.apiService.request(API_CMD.BFF_08_0029, {
      expsChnlCd: expsChnlCd, // 채널코드 
      ntcAreaClCd: 'M' // 공지사항 노출영역 코드 (M - 공지)
    }).map((res) => {
      if ( res.code === API_CODE.CODE_00 ) {
        return res.result;
      } else {
        return null;
      }
    });
  }

  /**
   * @function
   * @desc 브라우저 종류 API 사용할 파라미터 형식 string 으로 반환
   * @param {Request} req 
   * @returns {string} enum {A, I, M}
   */
  private _getTworldChannel(req: Request): string {
    if ( BrowserHelper.isAndroid(req) ) {
      return 'A';
    }

    if ( BrowserHelper.isIos(req) ) {
      return 'I';
    }

    return 'M';
  }

  /**
   * @function
   * @desc For Test
   * @returns {Observable}
   */
  private getTest = (): Observable<any> => this.apiService.request(API_CMD.BFF_01_0068, {})
    .map((res) => {
      if ( res.code === API_CODE.CODE_00 ) {
        return res.result;
      } else {
        return null;
      }
    })
}

export default CustomerMain;
