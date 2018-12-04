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

    render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {

      this.COUNTRY_CDDE = req.query.code;
      const searchInfo = {
          countryCd: this.COUNTRY_CDDE,
          countryNm: decodeURIComponent(req.query.nm)
      };
      const params = {
          countryCode: searchInfo.countryCd,
          command: '',
          eqpMdlCd: ''
      };
      if ( svcInfo ) {
          if ( !svcInfo.eqpMdlNm ) {
              params.command = 'onlyCountry';
          } else {
              params.command = 'withCountry';
          }
      } else {
          params.command = 'onlyCountry';
      }

      Observable.combineLatest(
          this.getManageTypeSrch(params)
          // this.getRoamingPlanData(params)
      ).subscribe(([roamingTypeData, roamingRateData]) => {

          res.render('roaming/product.roaming.search-result.html',
              { svcInfo, searchInfo, roamingTypeData, roamingRateData, isLogin: this.isLogin(svcInfo), pageInfo });
          this.logger.info(this, 'roamingTypeData : ', roamingTypeData);
          this.logger.info(this, 'roamingRateData : ', roamingRateData);
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
                const rateParams = {
                    countryCode: this.COUNTRY_CDDE,
                    manageType: '',
                    showDailyPrice: 'N'
                };
                if ( resp.result.lte > 0 ) {
                   rateParams.manageType = 'L';
                } else if ( resp.result.wcdma > 0 ) {
                   rateParams.manageType = 'W';
                } else if ( resp.result.gsm > 0 ) {
                   rateParams.manageType = 'G';
                } else if ( resp.result.cdma > 0 ) {
                   rateParams.manageType = 'C';
                } else if ( resp.result.rent > 0) {
                   rateParams.manageType = '';
                   rateParams.showDailyPrice = 'Y';
                } else {
                   rateParams.manageType = '';
                   rateParams.showDailyPrice = 'N';
                }

                this.logger.info(this, 'rateParams : ', rateParams);
                this.getCountryRate(rateParams);
            }
            return roamingTypeData;
        });
    }
    private getCountryRate (params) {
        this.logger.info(this, 'getCountryRate params :', params);

        let roamingRateData = null;
        return this.apiService.request(API_CMD.BFF_10_0058, params).map((resp) => {
            if ( resp.code === API_CODE.CODE_00 ) {
                roamingRateData = resp.result;
                this.logger.info(this, 'roamingRateData ==== ', roamingRateData);
            }
            return roamingRateData;
        });
    }
}

export default ProductRoamingSearchResult;

