import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import ProductHelper from '../../../../utils/product.helper';

export default class RoamingAddonsController extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getAddonsUsing(svcInfo),
      this.getAddonsAll(),
    ).subscribe(([addonUsing, addonData]) => {
      const error = {
        code: addonData.code || addonUsing.code,
        msg: addonData.msg || addonUsing.msg
      };

      if (error.code) {
        return this.error.render(res, {...error, svcInfo, pageInfo});
      }

      const filters = {};
      addonData.products.map(item => {
        for (const filter of item.filters) {
          filters[filter.prodFltId] = filter.prodFltNm;
        }
      });

      // addonData sort
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

      res.render('roaming-next/roaming.addons.html', {
        svcInfo, pageInfo,
        addonUsing,
        addonData,
        filters,
      });
    });
  }

  protected get noUrlMeta(): boolean {
    return true;
  }

  private isLogin(svcInfo: any): boolean {
    if (FormatHelper.isEmpty(svcInfo)) {
      return false;
    }
    return true;
  }

  private getAddonsUsing(svcInfo): Observable<any> {
    if (!this.isLogin(svcInfo)) {
      return Observable.of([]);
    }
    return this.apiService.request(API_CMD.BFF_10_0057, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result.roamingProdList.map(item => item.prodId);
      } else {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }
    });
  }

  private getAddonsAll(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0031, {idxCtgCd: 'F01600'}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        const filtered: any = [];
        for (const p of resp.result.products) {
          // 로밍오토다이얼, 데이터로밍무조건허용 숨김
          if (['TW61000005', 'NA00003157'].indexOf(p.prodId) === -1) {
            filtered.push(p);
          }
        }

        return {
          ...resp.result,
          products: filtered.map(product => {
            return {
              ...product,
              basFeeAmt: ProductHelper.convProductBasfeeInfo(product.basFeeAmt)
            };
          })
        };
      } else {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }
    });
  }
}
