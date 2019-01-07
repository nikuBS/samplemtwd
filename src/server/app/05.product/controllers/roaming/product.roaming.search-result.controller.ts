/**
 * FileName: product.roaming.search-result.controller.ts
 * Author: Eunjung Jung
 * Date: 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';

class ProductRoamingSearchResult extends TwViewController {

    constructor() {
        super();
    }

    private COUNTRY_CDDE = '';

    render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

      this.COUNTRY_CDDE = req.query.code;
      const searchInfo = {
          countryCd: this.COUNTRY_CDDE,
          countryNm: decodeURIComponent(req.query.nm),
          eqpMdlNm: decodeURIComponent(req.query.eqpNm),
          eqpMdlCd: decodeURIComponent(req.query.eqpCd)
      };
      const params = {
          countryCode: searchInfo.countryCd,
          command: '',
          eqpMdlCd: searchInfo.eqpMdlCd
      };
      if ( svcInfo ) {
          if ( !svcInfo.eqpMdlNm ) {
              params.command = 'onlyCountry';
          } else {
              params.command = 'withCountry';
          }
      } else {
          if ( !searchInfo.eqpMdlNm ) {
              params.command = 'onlyCountry';
          } else {
              params.command = 'withCountry';
          }
      }

      Observable.combineLatest(
          this.getManageTypeSrch(params)
          // this.getRoamingPlanData(params)
      ).subscribe(([roamingTypeData]) => {
          res.render('roaming/product.roaming.search-result.html',
              {svcInfo, pageInfo, searchInfo, roamingTypeData, isLogin: this.isLogin(svcInfo)});
      });
    }
    private isLogin(svcInfo: any): boolean {
        if (FormatHelper.isEmpty(svcInfo)) {
            return false;
        }
        return true;
    }
    private getManageTypeSrch (param: any): Observable<any> {
        let roamingTypeData = null;
        return this.apiService.request(API_CMD.BFF_10_0061, param).map((resp) => {
            if ( resp.code === API_CODE.CODE_00 ) {
                roamingTypeData = resp.result;
            }
            return roamingTypeData;
        });
    }
}

export default ProductRoamingSearchResult;

