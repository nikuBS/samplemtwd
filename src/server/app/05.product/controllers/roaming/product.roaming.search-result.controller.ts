/**
 * MenuName: T로밍 > 국가별 로밍 요금조회 검색 결과 화면 (RM_04)
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
          countryCode: searchInfo.countryCd,    // 국가코드
          command: '',                          // 검색구분
          eqpMdlCd: searchInfo.eqpMdlCd         // 단말 코드
      };
      // 휴대폰 정보의 여부에 따라 검색구분 변경.
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
          const error = {
              code: roamingTypeData.code,
              msg: roamingTypeData.msg
          };

          if ( error.code ) {
              return this.error.render(res, { ...error, svcInfo, pageInfo });
          }

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
    // 이용가능한 로밍 서비스 조회.
    private getManageTypeSrch (param: any): Observable<any> {
        let roamingTypeData = null;
        return this.apiService.request(API_CMD.BFF_10_0061, param).map((resp) => {
            if ( resp.code === API_CODE.CODE_00 ) {
                roamingTypeData = resp.result;
                return roamingTypeData;
            } else {
                return {
                    code: resp.code,
                    msg: resp.msg
                };
            }
        });
    }
}

export default ProductRoamingSearchResult;

