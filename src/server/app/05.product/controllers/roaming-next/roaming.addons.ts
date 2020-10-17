/**
 * @desc 로밍 부가서비스 컨트롤러.
 *
 * 전체 서비스는 BFF_10_0031 idxCtgCd:F01600 사용.
 * 이용중인 서비스는 BFF_10_0057 사용.
 *
 * 석연실님 요청으로 로밍오토다이얼(TW61000005), 데이터로밍무조건허용(NA00003157) 은 숨김.
 *
 * @author 황장호
 * @since 2020-09-01
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import ProductHelper from '../../../../utils/product.helper';
import {RoamingController} from './roaming.abstract';
import RoamingHelper from './roaming.helper';

export default class RoamingAddonsController extends RoamingController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.setDeadline(res);

    Observable.combineLatest(
      this.getAddonsUsing(svcInfo),
      this.getAddonsAll(),
    ).subscribe(([addonUsing, addonData]) => {
      if (RoamingHelper.renderErrorIfAny(this.error, res, svcInfo, pageInfo, [addonUsing, addonData])) {
        this.releaseDeadline(res);
        return;
      }

      const filters = {}; // {'FLT0001': '인기', 'FLT0002': '로밍최초'}
      addonData.products.map(item => {
        for (const filter of item.filters) {
          filters[filter.prodFltId] = filter.prodFltNm;
        }
      });

      // 이용중인 아이템이 상단에 노출되도록 정렬
      for (let i = addonUsing.length - 1; i >= 0; i--) {
        const using = addonUsing[i];
        let i0 = -1;
        for (let j = 0; j < addonData.products.length; j++) {
          if (addonData.products[j].prodId === using) {
            i0 = j;
            break;
          }
        }
        if (i0 >= 0) {
          const toMove = addonData.products[i0];
          addonData.products.splice(i0, 1); // remove
          addonData.products.splice(0, 0, toMove); // insert
        }
      }

      this.renderDeadline(res, 'roaming-next/roaming.addons.html', {
        svcInfo, pageInfo,
        addonUsing,
        addonData,
        filters,
      });
    });
  }

  /**
   * 로그인 여부 확인
   *
   * @param svcInfo
   * @private
   */
  private isLogin(svcInfo: any): boolean {
    if (FormatHelper.isEmpty(svcInfo)) {
      return false;
    }
    return true;
  }

  /**
   * 이 사용자가 이용 중인 부가서비스의 prodId 목록을 리턴한다.
   *
   * @param svcInfo
   * @private
   */
  private getAddonsUsing(svcInfo): Observable<any> {
    if (!this.isLogin(svcInfo)) {
      // 만약 비로그인 상태인 경우 빈 목록을 리턴한다.
      return Observable.of([]);
    }
    return this.apiService.request(API_CMD.BFF_10_0057, {}).map((resp) => {
      const error = RoamingHelper.checkBffError(resp);
      if (error) { return error; }

      // 부가서비스 내용은 getAddonsAll 을 참조하고, 이용중인 목록은 prodId 만 사용한다.
      return resp.result.roamingProdList.map(item => item.prodId);
    });
  }

  /**
   * 표시할 모든 부가서비스 목록을 리턴한다.
   * BFF_10_0031 호출시 idxCtgCd=F01600 파라미터를 사용하는데, 이 코드는 로밍개선 이전부터 사용한 코드라 그대로 옮겨왔다.
   *
   * @private
   */
  private getAddonsAll(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0031, {idxCtgCd: 'F01600'}).map((resp) => {
      const error = RoamingHelper.checkBffError(resp);
      if (error) { return error; }

      const filtered: any = [];
      for (const p of resp.result.products) {
        // 로밍오토다이얼, 데이터로밍무조건허용 숨김. 석연실 매니저님 요청.
        if (['TW61000005', 'NA00003157'].indexOf(p.prodId) === -1) {
          filtered.push(p);
        }
      }

      return {
        ...resp.result,
        products: filtered.map(product => {
          return {
            ...product,
            // 아래 ProductHelper 코드는 로밍개선 이전에 있던 코드를 그대로 옮겨왔다.
            basFeeAmt: ProductHelper.convProductBasfeeInfo(product.basFeeAmt)
          };
        })
      };
    });
  }
}
