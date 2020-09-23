import { NextFunction, Request, Response } from 'express';
import {API_CMD} from '../../../../types/api-command.type';
import RoamingHelper from './roaming.helper';
import {Observable} from 'rxjs/Observable';
import {RoamingController} from './roaming.abstract';

export default class RoamingTariffsController extends RoamingController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.setDeadline(res);

    Observable.combineLatest(
      this.getTariffsByGroup(),
      RoamingHelper.nationsByContinents(this.redisService),
    ).subscribe(([items, nations]) => {
      for (const item of items) {
        item.prodGrpBnnrImgUrl = RoamingHelper.penetrateUri(item.prodGrpBnnrImgUrl); // 로밍메인 노출 카드
        item.prodGrpFlagImgUrl = RoamingHelper.penetrateUri(item.prodGrpFlagImgUrl); // 추천
        item.prodGrpIconImgUrl = RoamingHelper.penetrateUri(item.prodGrpIconImgUrl); // 추천

        item.items = item.prodList.map(p => {
          return RoamingHelper.formatTariff(p);
        });
      }

      this.renderDeadline(res, 'roaming-next/roaming.tariffs.html', {
        svcInfo,
        pageInfo,
        groups: items,
        nations,
      });
    });
  }

  private getTariffsByGroup() {
    return this.apiService.request(API_CMD.BFF_10_0198, {}).map(resp => {
      let items = resp.result.grpProdList;
      if (!items) {
        items = [];
      }
      return items;
    });
  }
}
