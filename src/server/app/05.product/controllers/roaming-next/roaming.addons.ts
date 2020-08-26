import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import ProductHelper from '../../../../utils/product.helper';

export default class RoamingAddonsController extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const params = {
      idxCtgCd: 'F01600',
      ...(req.query.filters ? {searchFltIds: req.query.filters} : {}),
      ...(req.query.order ? {searchOrder: req.query.order} : {}),
      ...(req.query.tag ? {searchTagId: req.query.tag} : {})
    };

    // 로그인한 사용자인 경우 로밍 부가서비스 이용현황 데이터 요청.
    if (this.isLogin(svcInfo)) {
      Observable.combineLatest(
        this.getRoamingPlanAddCntData(),
        this.getRoamingPlanAddData(params),
        this.testNewApis(svcInfo),
    ).subscribe(([addonCntData, addonData]) => {
        this.logger.info(this, 'roamingAddon: ', addonData);

        const error = {
          code: addonData.code || addonCntData.code,
          msg: addonData.msg || addonCntData.msg
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

        res.render('roaming-next/roaming.addons.html', {svcInfo, params, isLogin: this.isLogin(svcInfo), pageInfo,
          addonCntData,
          addonData, filters,
        });

      });
    } else {
      Observable.combineLatest(
        this.getRoamingPlanAddData(params),
        this.testNewApis(svcInfo),
      ).subscribe(([addonData]) => {
        this.logger.info(this, 'roamingAddon: ', addonData);

        const error = {
          code: addonData.code,
          msg: addonData.msg
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

        res.render('roaming-next/roaming.addons.html', {svcInfo, params, isLogin: this.isLogin(svcInfo), pageInfo,
          addonData, filters,
        });
      });
    }
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

  // 로밍 부가서비스 이용현황 데이터 요청.
  private getRoamingPlanAddCntData(): Observable<any> {
    let roamingPlanAddCntData = null;
    return this.apiService.request(API_CMD.BFF_10_0121, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        roamingPlanAddCntData = resp.result;
        this.logger.info(this, 'roamingPlanAddCntData', roamingPlanAddCntData);
        return roamingPlanAddCntData;
      } else {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

    });
  }

  // 로밍 부가서비스 리스트 요청.
  private getRoamingPlanAddData(params) {
    return this.apiService.request(API_CMD.BFF_10_0031, params).map((resp) => {
      this.logger.info(this, 'result ', resp.result);
      if (resp.code === API_CODE.CODE_00) {
        return {
          ...resp.result,
          productCount: resp.result.productCount,
          products: resp.result.products.map(roamingPlanAdd => {
            return {
              ...roamingPlanAdd,
              basFeeAmt: ProductHelper.convProductBasfeeInfo(roamingPlanAdd.basFeeAmt)
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

  private testNewApis(svcInfo) {
    return this.apiService.request(API_CMD.BFF_10_0200, {
      // prodId: 'NA00006489',
      // svcMgmtNum: svcInfo.svcMgmtNum,
      // countryCode: 'JPN',
      // svcStartDt: '2020-08-29',
      // svcEndDt: '2020-09-09',
      // usgStartDate: '2020-08-01',
      // usgEndDate: '2020-08-15',
      // svcNum: svcInfo.svcNum,
      mcc: '202',
    }).map((resp) => {
      this.logger.warn(this, JSON.stringify(resp));
      return {hello: 'world'};
    });
  }
}
