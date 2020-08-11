/**
 * @file main.store.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2019.03.12
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import BrowserHelper from '../../../utils/browser.helper';
import { CHANNEL_CODE, REDIS_KEY } from '../../../types/redis.type';
import { Observable } from 'rxjs/Observable';
import { API_CODE, API_CMD } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';
import DateHelper from '../../../utils/date.helper';

class MainStore extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const noticeCode = !BrowserHelper.isApp(req) ? CHANNEL_CODE.MWEB :
      BrowserHelper.isIos(req) ? CHANNEL_CODE.IOS : CHANNEL_CODE.ANDROID;

    let prodEventCtl = false;
    
    this.getRedisData(noticeCode)
      .subscribe((resp) => {
        if (svcInfo) {
          svcInfo.personSmsDisableTimeCheck = resp['personSmsDisableTimeCheck'];
        }
        res.render(`main.store.html`, { svcInfo, redisData: resp, pageInfo, formatHelper: FormatHelper, prodEventCtl: prodEventCtl });
      });
  }

  private getRedisData(noticeCode): Observable<any> {
    return Observable.combineLatest(
      this.getHomeNotice(noticeCode),
      this.getStoreProduct(),
      this.getStoreAddProduct(),
      this.getStoreTappsProduct(),
      this.getHomeHelp(),
      this.getPersonSmsDisableTimeCheck()
    ).map(([notice, product, productAdd, productTapps, help, personSmsDisableTimeCheck]) => {
      let mainNotice = null;
      if ( !FormatHelper.isEmpty(notice) ) {
        mainNotice = notice.mainNotice;
      }
      let mainProduct = null;
      if ( !FormatHelper.isEmpty(product) ) {
        mainProduct = product.storeProduct;
      }
      let addProduct = null;
      if ( !FormatHelper.isEmpty(productAdd) ) {
        addProduct = productAdd.storeProduct;
      }
      let tappsProduct = null;
      if ( !FormatHelper.isEmpty(productTapps) ) {
        tappsProduct = productTapps.storeProduct;
      }
      return { mainNotice, mainProduct, addProduct, tappsProduct, help, personSmsDisableTimeCheck };
    });
  }

  /**
   * redis에서 개인화 문자 진입 아이콘 노출 여부 체크
   * @return {Observable}
   */
  private getPersonSmsDisableTimeCheck(): Observable<any> {
    const DEFAULT_PARAM = {
      property: REDIS_KEY.PERSON_SMS_DISABLE_TIME
    };
    return this.apiService.request(API_CMD.BFF_01_0069, DEFAULT_PARAM).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        const today = new Date().getTime();
        const resTime = resp.result.split('~');
        const startTime = DateHelper.convDateFormat(resTime[0]).getTime();
        const endTime = DateHelper.convDateFormat(resTime[1]).getTime();
        this.logger.info(this, '[Person sms startTime // endTime]', startTime, endTime);
        /**
         * 버튼 비노출 시점에 포함되지 않으면 버튼 노출
         * true: 노출, false: 비노출
         */
        return !(today >= startTime && today <= endTime);
      } else {
        return null;
      }
    });
  }

  private getHomeNotice(noticeCode): Observable<any> {
    return this.redisService.getData(REDIS_KEY.HOME_NOTICE + noticeCode)
      .map((resp) => {
        // if ( resp.code === API_CODE.REDIS_SUCCESS ) {
        //   return resp.result;
        // }
        return resp.result;
      });
  }

  /**
   * STORE 상품관리 리스트 데이터 요청(요금제)
   * @return {Observable}
   */
  private getStoreProduct(): Observable<any> {
    return this.redisService.getData(REDIS_KEY.STORE_PRODUCT + 'F01100')
      .map((resp) => {
        return resp.result;
      });
  }

  /**
   * STORE 상품관리 리스트 데이터 요청(부가서비스)
   * @return {Observable}
   */
  private getStoreAddProduct(): Observable<any> {
    return this.redisService.getData(REDIS_KEY.STORE_PRODUCT + 'F01200')
      .map((resp) => {
        return resp.result;
      });
  }

  /**
   * STORE 상품관리 리스트 데이터 요청(T앱)
   * @return {Observable}
   */
  private getStoreTappsProduct(): Observable<any> {
    return this.redisService.getData(REDIS_KEY.STORE_PRODUCT + 'F01700')
      .map((resp) => {
        return resp.result;
      });
  }

  private getHomeHelp(): Observable<any> {
    let result = null;
    return this.redisService.getData(REDIS_KEY.HOME_HELP)
      .map((resp) => {
        if ( resp.code === API_CODE.REDIS_SUCCESS ) {
          result = this.parseHelpData(resp.result.cicntsList);
        }
        return result;
      });
  }

  private parseHelpData(cicntsList): any {
    const resultArr = <any>[];
    const scrnTypCd = cicntsList[0].scrnTypCd || 'F';
    cicntsList.sort((prev, next) => {
      if (scrnTypCd === 'R') {
        return Math.floor(Math.random() * 3) - 1;
      } else {
        return prev.mainExpsSeq - next.mainExpsSeq;
      }
    });
    cicntsList[0].rollYn = cicntsList[0].rollYn || 'Y';
    for ( let i = 0; i < cicntsList.length; i += 3 ) {
      resultArr.push(cicntsList.slice(i, i + 3));
    }
    return resultArr;
  }

}

export default MainStore;
