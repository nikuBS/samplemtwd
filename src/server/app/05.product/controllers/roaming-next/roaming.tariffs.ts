/**
 * @desc 로밍 요금제 목록. (M000473)
 *
 * BFF_10_0198: 요금제 그룹별 전체 목록
 *
 * @author 황장호
 * @since 2020-09-01
 */
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
        // 그룹별 요금제 목록
        groups: items,
        // 대륙별 모든 로밍 국가 목록
        nations,
      });
    });
  }

  /**
   * 요금제 그룹별로 정리된 모든 요금제 목록 조회. (BFF_10_0198)
   *
   * @private
   */
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
