/**
 * @desc 로밍 이용안내/센터 공통 컨트롤러
 *
 * 요금제 그룹 전체를 활용하는 일부 페이지에서 BFF_10_0198을 사용한다.
 *
 * @author 황장호
 * @since 2020-09-25
 */
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import {RoamingController} from './roaming.abstract';
import {API_CMD} from '../../../../types/api-command.type';
import RoamingHelper from './roaming.helper';

abstract class RoamingGuideController extends RoamingController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.setDeadline(res, 1500);
    this.renderDeadline(res, this.templatePath, {
      pageInfo,
      svcInfo,
    });
  }
  abstract get template(): string;
  get templatePath(): string {
    return `roaming-next/roaming.${this.template}.html`;
  }
}

/**
 * 이용안내 (M000529)
 */
class RoamingGuideIndex extends RoamingGuideController {
  get template(): string {
    return 'guide';
  }
}

/**
 * 이용안내 > baro 통화 (M001879)
 */
class RoamingGuideBaro extends RoamingGuideController {
  get template(): string {
    return 'guide.baro';
  }
}

/**
 * 이용안내 > 자동안심 T 로밍이란? (M000535)
 */
class RoamingGuideSecureT extends RoamingGuideController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.setDeadline(res, 1500);

    // BFF_10_0198: 요금제 전체 목록 조회
    this.apiService.request(API_CMD.BFF_10_0198, {}).map(resp => {
      let items = resp.result.grpProdList;
      if (!items) {
        items = [];
      }
      return items;
    }).subscribe(groups => {
      const tariffs: any = [];
      // 로밍 요금제 목록 중 그룹명이 `baro`로 시작하는 그룹 내의 모든 요금제를 리턴.
      for (const g of groups) {
        if (g.prodGrpNm.startsWith('baro')) {
          g.prodList.forEach(item => tariffs.push(RoamingHelper.formatTariff(item)));
        }
      }
      this.renderDeadline(res, this.templatePath, {
        pageInfo,
        svcInfo,
        tariffs,
      });
    });
  }
  get template(): string {
    return 'guide.secure-t';
  }
}

/**
 * 이용안내 > 괌/사이판 (M001880)
 */
class RoamingGuideGuamSaipan extends RoamingGuideController {
  get template(): string {
    return 'guide.guam';
  }
}

/**
 * 이용안내 > 로밍 상품 이용안내 (M001881)
 */
class RoamingGuideProduct extends RoamingGuideController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.setDeadline(res, 1500);

    // BFF_10_0198: 요금제 전체 목록 조회
    this.apiService.request(API_CMD.BFF_10_0198, {}).map(resp => {
      let items = resp.result.grpProdList;
      if (!items) {
        items = [];
      }
      return items;
    }).subscribe(groups => {
      const group1: any = []; // 3GB
      const group2: any = []; // 4GB, 7GB
      const group3: any = []; // OnePass 300, 500 기본형
      const group4: any = []; // OnePass VIP 기본형

      for (const g of groups) {
        // if (g.prodGrpNm.startsWith('baro')) {
          g.prodList.forEach(item => {
            RoamingHelper.formatTariff(item);
            // '로밍 상품 이용안내'의 '내게 주는 선물, 일주일의 여행이라면?' 섹션 상품들
            if (['NA00006489'].indexOf(item.prodId) >= 0) {
              group1.push(item);
            }
            // '로밍 상품 이용안내'의 '누구나 꿈꾸는 한 달 동안의 여행이라면?' 섹션 상품들
            if (['NA00006493', 'NA00006497'].indexOf(item.prodId) >= 0) {
              group2.push(item);
            }
            // '로밍 상품 이용안내'의 '짧은 여행을 계획하셨나요?' 섹션 상품들
            if (['NA00003196', 'NA00005049'].indexOf(item.prodId) >= 0) {
              group3.push(item);
            }
            // '로밍 상품 이용안내'의 '무제한 데이터를 원하시나요?' 섹션 상품들
            if (['NA00006486', 'NA00006744'].indexOf(item.prodId) >= 0) {
              group4.push(item);
            }
          });
        // }
      }
      this.renderDeadline(res, this.templatePath, {
        pageInfo,
        svcInfo,
        group1,
        group2,
        group3,
        group4,
      });
    });
  }
  get template(): string {
    return 'guide.product';
  }
}

/**
 * 이용안내 > 자동로밍 (M000532)
 */
class RoamingGuideAuto extends RoamingGuideController {
  get template(): string {
    return 'guide.auto';
  }
}

/**
 * 이용안내 > SMS/데이터 로밍 (M000536)
 */
class RoamingGuideDataSms extends RoamingGuideController {
  get template(): string {
    return 'guide.data-sms';
  }
}

/**
 * T로밍센터 (M000510)
 */
class RoamingGuideCenterLocation extends RoamingGuideController {
  get template(): string {
    return 'guide.center';
  }
}

export {
  RoamingGuideIndex,
  RoamingGuideBaro,
  RoamingGuideSecureT,
  RoamingGuideGuamSaipan,
  RoamingGuideProduct,
  RoamingGuideAuto,
  RoamingGuideDataSms,
  RoamingGuideCenterLocation,
};
