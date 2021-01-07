/**
 * @file 요금제 < 상품
 * @author Jiyoung Jo
 * @since 2018.09.06
 */

import TwViewController from '../../../../common_en/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CODE, API_CMD } from '../../../../types_en/api-command.type';
import FormatHelper from '../../../../utils_en/format.helper';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import ProductHelper from '../../../../utils_en/product.helper';
import { PRODUCT_CODE } from '../../../../types_en/bff.type';

/**
 * @class
 * @desc 상품 > 모바일 요금제 
 */
export default class MobilePlan extends TwViewController {
  constructor() {
    super();
  }
  
  /**
   * @desc 화면 랜더링
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} _next
   * @param  {any} svcInfo
   * @param  {any} _allSvc
   * @param  {any} _childInfo
   * @param  {any} pageInfo
   */
    render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this._getProductGroups(),
    ).subscribe(([productData]) => {    
      const error = {
        code: productData.code,
        msg: productData.msg 
      };
 
      if (error.code) {
        return this.error.render(res, { ...error, pageInfo, svcInfo });
      }

      res.render('mobileplan/en.product.mobileplan.html', { svcInfo, pageInfo, productData, 'isSubscribed': svcInfo || false});
    });
  }

  /**
   * @desc 많이 찾는 요금제 요청
   * @private
   */
  private _getProductGroups = () => {
    return this.apiService.request(
      {path: '/core-product/v1/submain/global-grpprods', method: 'GET', server: 'BFF_SERVER', bypass: false},
      { idxCtgCd: PRODUCT_CODE.MOBILE_PLAN }).map(resp => {

      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      if (FormatHelper.isEmpty(resp.result)) {
        return resp.result;
      }

      return {
        ...resp.result,
        grpProdList: resp.result.grpProdList.map(group => {
          return {
            ...group,
            prodGrpFlagImgUrl: group.prodGrpFlagImgUrl && ProductHelper.getImageUrlWithCdn(group.prodGrpFlagImgUrl),
            prodGrpIconImgUrl: group.prodGrpIconImgUrl && ProductHelper.getImageUrlWithCdn(group.prodGrpIconImgUrl),
            eidvalue: this._setEidCode(group.prodGrpId),
            prodList: group.prodList.map(plan => {
              return {
                ...plan,
                basFeeInfo: ProductHelper.convProductBasfeeInfo(plan.basFeeEngInfo),
                eidvalue: this._setEidCode(plan.prodId)
              };
            })
          };
        })
      };
    });
  }

  _setEidCode ( id ) {
    switch (id) {
      case 'NA00006405':
        return 'MWMA_A10_B82_C1202-3';
      case 'NA00006404':
        return 'MWMA_A10_B82_C1202-4';
      case 'NA00006403':
        return 'MWMA_A10_B82_C1202-5';
      case 'NA00006402':
        return 'MWMA_A10_B82_C1202-6';
      case 'NA00006817':
        return 'MWMA_A10_B82_C1202-8';
      case 'NA00006539':
        return 'MWMA_A10_B82_C1202-10';
      case 'NA00006538':
        return 'MWMA_A10_B82_C1202-11';
      case 'NA00006537':
        return 'MWMA_A10_B82_C1202-12';
      case 'NA00006536':
        return 'MWMA_A10_B82_C1202-13';
      case 'NA00006535':
        return 'MWMA_A10_B82_C1202-14';
      case 'NA00006534':
        return 'MWMA_A10_B82_C1202-15';
      case 'NA00006157':
        return 'MWMA_A10_B82_C1202-17';
      case 'NA00006156':
        return 'MWMA_A10_B82_C1202-18';
      case 'NA00006155':
        return 'MWMA_A10_B82_C1202-19';
      case 'NA00005629':
        return 'MWMA_A10_B82_C1202-21';
      case 'NA00005628':
        return 'MWMA_A10_B82_C1202-22';
      case 'NA00005627':
        return 'MWMA_A10_B82_C1202-23';
      case 'NA00006797':
        return 'MWMA_A10_B82_C1202-25';
      case 'NA00006796':
        return 'MWMA_A10_B82_C1202-26';
      case 'NA00006795':
        return 'MWMA_A10_B82_C1202-27';
      case 'NA00006794':
        return 'MWMA_A10_B82_C1202-28';
      case 'NA00006793':
        return 'MWMA_A10_B82_C1202-29';
      case 'NA00006864':
        return 'MWMA_A10_B82_C1202-31';
      case 'NA00006862':
        return 'MWMA_A10_B82_C1202-32';
      case 'T000000077':
        return 'MWMA_A10_B82_C1202-2';
      case 'T000000086':
        return 'MWMA_A10_B82_C1202-7';
      case 'T000000075':
        return 'MWMA_A10_B82_C1202-9';
      case 'T000000029':
        return 'MWMA_A10_B82_C1202-16';
      case 'T000000059':
        return 'MWMA_A10_B82_C1202-20';
      case 'T000000080':
        return 'MWMA_A10_B82_C1202-24';
      case 'T000000087':
        return 'MWMA_A10_B82_C1202-30';
      default:
        return '';     
      }
  }
}
