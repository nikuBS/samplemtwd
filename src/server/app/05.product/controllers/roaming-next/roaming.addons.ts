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
      this.logger.info(this, 'roamingAddon: ', addonData);

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
      this.logger.info(this, 'result ', resp.result);
      if (resp.code === API_CODE.CODE_00) {
        return {
          ...resp.result,
          productCount: resp.result.productCount,
          products: resp.result.products.map(product => {
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
