import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {DATA_UNIT, PRODUCT_MOBILEPLAN_COMPARE_PLANS} from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';
import {RedistProductComparison} from '../../../../mock/server/product.mobileplan.compare-plans.mock';
import {REDIS_PRODUCT_COMPARISON, REDIS_PRODUCT_INFO} from '../../../../types/common.type';

/**
 * FileName: product.mobileplan.compare-plans.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.11.23
 */

export default class ProductMobileplanComparePlans extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.reqRecentUsage(),
      this.redisProductLedger(req.params.prodId),
      this.redisProductComparison(svcInfo, req.params.prodId)
    ).subscribe(([data, prodRedisInfo, contents]) => {
      // BIL0070 : 최근 사용량 데이터 없음
      if (data.code === API_CODE.CODE_00 || data.code === 'BIL0070') {
        res.render('mobileplan/product.mobileplan.compare-plans.html', this.getData(data, prodRedisInfo, contents));
      } else {
        this.fail(res, data, svcInfo);
      }
    });
  }

  private getData(data: any, prodRedisInfo: any, contents: any): any {
    const msgs = PRODUCT_MOBILEPLAN_COMPARE_PLANS;
    const _data = {
      data : {
        prodNames: [msgs.MY_DATA_TXT, prodRedisInfo.prodNm],
        recentAvgTxt: msgs.RECENT_AVG_TXT.replace('{0}', msgs.USAGE_TXT),
        recentMaxTxt: msgs.RECENT_MAX_TXT.replace('{0}', msgs.USAGE_TXT),
        avg: 0,
        max: 0,
        targetSupply: prodRedisInfo.basOfrGbDataQtyCtt
      },
      contents: contents.guidMsgCtt
    };
    if (!data.result || !data.result.data || data.result.data.length < 1) {
      return _data;
    }

    let sum = 0, max = 0;
    data.result.data.forEach((o) => {
      const totalUsage = o.totalUsage;
      sum += parseFloat(totalUsage);
      if (totalUsage > max) {
        max = totalUsage;
      }
    });

    const dataSize = data.result.data.length;
    const monthText = msgs.MONTH_TXT.replace('{0}', dataSize);

    Object.assign(_data.data, {
      recentAvgTxt: msgs.RECENT_AVG_TXT.replace('{0}', monthText),
      recentMaxTxt: msgs.RECENT_MAX_TXT.replace('{0}', monthText),
      avg: FormatHelper.customDataFormat(sum / dataSize, DATA_UNIT.KB, DATA_UNIT.GB).data,
      max: FormatHelper.customDataFormat(max, DATA_UNIT.KB, DATA_UNIT.GB).data
    });

    return _data;
  }

  // 최근 3개월 데이터 사용량 조회
  private reqRecentUsage(): Observable<any> {
    /*return Observable.create((observer) => {
      observer.next({code: API_CODE.CODE_00});
      observer.complete();
    });*/
    return this.apiService.request(API_CMD.BFF_05_0091, {}).map((response) => {
      return response;
    });
  }

  // 현재 요금제, 비교 요금제 Redis 조회
  private redisAllProductLedger(svcInfo: any, prodId: string): Observable<any> {
    return Observable.combineLatest(
      this.redisProductLedger(svcInfo.prodId),
      this.redisProductLedger(prodId),
      (me, target) => {
        return {
          me,
          target
        };
      });
  }

  // 요금제 Redis 조회
  private redisProductLedger(prodId: string): Observable<any> {
    return this.redisService.getData(REDIS_PRODUCT_INFO + prodId)
      .map((productInfo) => {
        return this.parseProduct(productInfo);
      });
  }

  // 요금제 데이타 파싱
  private parseProduct(productInfo: any): any {
    if (FormatHelper.isEmpty(productInfo) || FormatHelper.isEmpty(productInfo.summary)) {
      return {
        prodNm: '',
        basOfrGbDataQtyCtt: 0,
        basOfrVcallTmsCtt: 0,
        basOfrCharCntCtt: 0
      };
    }
    const isValid = value => {
      return !(FormatHelper.isEmpty(value) || ['0', '-'].indexOf(value) !== -1);
    };

    const product = productInfo.summary;
    // 어드민에서 "데이터 제공량" 등록 시 basOfrGbDataQtyCtt(GB),basOfrMbDataQtyCtt(MB) 둘 중, 하나에 등록한다고 함..
    if (!isValid(product.basOfrGbDataQtyCtt)) {
      if (isValid(product.basOfrMbDataQtyCtt)) {
        product.basOfrGbDataQtyCtt = FormatHelper.customDataFormat(product.basOfrMbDataQtyCtt, DATA_UNIT.MB, DATA_UNIT.GB).data;
      } else {
        product.basOfrGbDataQtyCtt = 0;
      }
    }
    return product;
  }

  // 컨텐츠 조회 ( Redis 에서 마크업을 받는다 )
  private redisProductComparison(svcInfo: any, prodId: string): Observable<any> {
    const mock = () => {
      return Observable.create((observer) => {
        observer.next(RedistProductComparison);
        observer.complete();
      });
    };

    const real = (prodId1, prodId2) => {
      return this.redisService.getData(`${REDIS_PRODUCT_COMPARISON}${prodId1}/${prodId2}`)
        .map((resp) => {
          return resp;
        });
    };

    return mock();
    // return real(svcInfo.prodId, prodId);
  }

  // API Response fail
  protected fail(res: Response, data: any, svcInfo: any): void {
    this.error.render(res, {
      code: data.code,
      msg: data.msg,
      svcInfo: svcInfo
    });
  }
}
