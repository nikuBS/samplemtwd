import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {DATA_UNIT, PRODUCT_MOBILEPLAN_COMPARE_PLANS} from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';
import {RedistProductComparison} from '../../../../mock/server/product.mobileplan.compare-plans.mock';
import {REDIS_PRODUCT_COMPARISON, REDIS_PRODUCT_INFO} from '../../../../types/redis.type';

/**
 * FileName: product.mobileplan.compare-plans.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.11.23
 * 요금제 > 요금제 비교하기
 */

export default class ProductMobileplanComparePlans extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prodId;
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0091, {}), // 최근 사용량 조회
      this.redisService.getData(REDIS_PRODUCT_INFO + prodId), // Redis 상품원장 조회
      this.redisProductComparison(svcInfo, prodId), // Redis 컨텐츠 조회
      this.apiService.request(API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, prodId)  // 상품원장 - 상품기본정보
    ).subscribe(([recentUsage, prodRedisInfo, contents, basicInfo]) => {
      const errorRs = this.error.apiError([prodRedisInfo, contents, basicInfo]);
      // BIL0070 : 최근 사용량 데이터 없음
      if (FormatHelper.isEmpty(errorRs) && [API_CODE.CODE_00, 'BIL0070'].indexOf(recentUsage.code) !== -1) {
        res.render('mobileplan/product.mobileplan.compare-plans.html', this.getData(recentUsage, prodRedisInfo, contents, basicInfo, pageInfo));
      } else {
        this.fail(res, errorRs, svcInfo);
      }
    });
  }

  private getData(recentUsage: any, prodRedisInfo: any, contents: any, basicInfo: any, pageInfo: any): any {
    const msgs = PRODUCT_MOBILEPLAN_COMPARE_PLANS;
    prodRedisInfo = this.parseProduct(prodRedisInfo.result);

    const _data = {
      data: {
        prodNames: [msgs.MY_DATA_TXT, prodRedisInfo.prodNm],
        recentAvgTxt: msgs.RECENT_AVG_TXT.replace('{0}', msgs.USAGE_TXT),
        recentMaxTxt: msgs.RECENT_MAX_TXT.replace('{0}', msgs.USAGE_TXT),
        avg: 0,
        max: 0,
        targetSupply: prodRedisInfo.basOfrGbDataQtyCtt
      },
      contents: contents.result.guidMsgCtt,
      joinUrl: this.getJoinUrl(basicInfo).linkUrl,
      pageInfo
    };
    if (!recentUsage.result || !recentUsage.result.data || recentUsage.result.data.length < 1) {
      return _data;
    }

    let sum = 0, max = 0;
    recentUsage.result.data.forEach((o) => {
      const totalUsage = o.totalUsage;
      sum += parseFloat(totalUsage);
      if (totalUsage > max) {
        max = totalUsage;
      }
    });

    const dataSize = recentUsage.result.data.length;
    const monthText = msgs.MONTH_TXT.replace('{0}', dataSize);

    Object.assign(_data.data, {
      recentAvgTxt: msgs.RECENT_AVG_TXT.replace('{0}', monthText),
      recentMaxTxt: msgs.RECENT_MAX_TXT.replace('{0}', monthText),
      avg: FormatHelper.customDataFormat(sum / dataSize, DATA_UNIT.KB, DATA_UNIT.GB).data,
      max: FormatHelper.customDataFormat(max, DATA_UNIT.KB, DATA_UNIT.GB).data
    });

    return _data;
  }

  // 가입 페이지 URL
  private getJoinUrl(basicInfo: any): any {
    const res = {
      linkNm: '',
      linkUrl: ''
    };
    if (!basicInfo.result.linkBtnList || basicInfo.result.linkBtnList.length < 1) {
      return res;
    }
    const joinUrlArr = basicInfo.result.linkBtnList.filter((item) => {
      return item.linkTypCd === 'SC';
    });

    return joinUrlArr[0] || res;
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
  // private redisProductComparison(prd1: any, prd2: string): Observable<any> {
  private redisProductComparison(svcInfo: any, prodId: string): Observable<any> {
    const mock = () => {
      return Observable.create((observer) => {
        observer.next(RedistProductComparison);
        observer.complete();
      });
    };

    const real = (prodId1, prodId2) => {
      return this.redisService.getData(`${REDIS_PRODUCT_COMPARISON}${prodId1}/${prodId2}`);
    };
    // return mock();
    // return real('NA00005957', 'NA00005958');
    return real(svcInfo.prodId, prodId);
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
