/**
 * 로밍 이용안내/센터 공통 컨트롤러
 *
 * 요금제 그룹 전체를 활용하는 일부 페이지에서 BFF_10_0198을 사용한다.
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

class RoamingGuideIndex extends RoamingGuideController {
  get template(): string {
    return 'guide';
  }
}

class RoamingGuideBaro extends RoamingGuideController {
  get template(): string {
    return 'guide.baro';
  }
}

class RoamingGuideSecureT extends RoamingGuideController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.setDeadline(res, 1500);

    this.apiService.request(API_CMD.BFF_10_0198, {}).map(resp => {
      let items = resp.result.grpProdList;
      if (!items) {
        items = [];
      }
      return items;
    }).subscribe(groups => {
      const tariffs: any = [];
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

class RoamingGuideGuamSaipan extends RoamingGuideController {
  get template(): string {
    return 'guide.guam';
  }
}

class RoamingGuideProduct extends RoamingGuideController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.setDeadline(res, 1500);

    this.apiService.request(API_CMD.BFF_10_0198, {}).map(resp => {
      let items = resp.result.grpProdList;
      if (!items) {
        items = [];
      }
      return items;
    }).subscribe(groups => {
      const tariffs: any = [];
      const group1: any = []; // 3GB
      const group2: any = []; // 4GB, 7GB
      const group3: any = []; // OnePass 300, 500 기본형
      const group4: any = []; // OnePass VIP 기본형

      for (const g of groups) {
        if (g.prodGrpNm.startsWith('baro')) {
          g.prodList.forEach(item => {
            RoamingHelper.formatTariff(item);
            if (['NA00006489'].indexOf(item.prodId) >= 0) {
              group1.push(item);
            }
            if (['NA00006493', 'NA00006497'].indexOf(item.prodId) >= 0) {
              group2.push(item);
            }
            if (['NA00003196', 'NA00005049'].indexOf(item.prodId) >= 0) {
              group3.push(item);
            }
            if (['NA00006486', 'NA00006744'].indexOf(item.prodId) >= 0) {
              group4.push(item);
            }
          });
        }
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

class RoamingGuideAuto extends RoamingGuideController {
  get template(): string {
    return 'guide.auto';
  }
}

class RoamingGuideDataSms extends RoamingGuideController {
  get template(): string {
    return 'guide.data-sms';
  }
}

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
