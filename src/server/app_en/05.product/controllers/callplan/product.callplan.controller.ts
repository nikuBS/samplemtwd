import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import {
  DATA_UNIT,
  PRODUCT_CALLPLAN_FEEPLAN, PRODUCT_REQUIRE_DOCUMENT, PRODUCT_REQUIRE_DOCUMENT_CALLPLAN_RESULT,
  PRODUCT_SIMILAR_PRODUCT,
  PRODUCT_TYPE_NM
} from '../../../../types/string.type';
import { BENEFIT_SUBMAIN_CATEGORY, PRODUCT_CALLPLAN,
  PRODUCT_CALLPLAN_BENEFIT_REDIRECT, PRODUCT_TYP_CD_LIST, LIVE_CHAT_CHECK_PROD_ID} from '../../../../types/bff.type';
import { REDIS_KEY } from '../../../../types/redis.type';
import FormatHelper from '../../../../utils/format.helper';
import ProductHelper from '../../../../utils/product.helper';
import EnvHelper from '../../../../utils/env.helper';
import BrowserHelper from '../../../../utils/browser.helper';

export default class CallPlan2 extends TwViewController {
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
      const prod = req.query.prod_id;
      
      Observable.combineLatest([
        this.redisService.getData('GlobalProductLedger:' + prod),
        this.redisService.getData('GlobalProductLedgerContents:' + prod)
    ]).subscribe(([result, contentsResult]) => {
        const jsonResult = JSON.parse(JSON.stringify(result));
        const jsonContentsResult = JSON.parse(JSON.stringify(contentsResult));
        const prodData = jsonResult['result']['summary'];
        const contentsData = jsonContentsResult['result']['contents'];
      const changed = /{{cdn}}/gi;
      const changing = 'https://cdnm-stg.tworld.co.kr';
        const prodNm = prodData.prodEngNm;
        if ( jsonResult.code === API_CODE.CODE_00 ) {
          console.log('^^^^^^^^^^^^^');
          console.log(jsonContentsResult['result']['contents']);
          console.log('^^^^^^^^^^^^^');
      } else {
        if (FormatHelper.isEmpty(result.result)) {
          return result.result;
        }
        else if (FormatHelper.isEmpty(contentsResult.result)) {
          return contentsResult.result;
        }
      }
          
            if (prodData.smryHtmlEngCtt === '<p>&nbsp;</p>') {
              prodData.smryHtmlEngCtt = '';
            }
          
        if ( contentsData!=null ) {
          for(let i = 0; i < contentsData.length; i++) {
            contentsData[i].popupDtlCtt = contentsData[i].popupDtlCtt.replace(changed, changing);
            contentsData[i].dtlCtt = contentsData[i].dtlCtt.replace(changed, changing);
            if (contentsData[i].dtlCtt === '<p>&nbsp;</p>') {
              contentsData[i].dtlCtt = '';
            }
          }
        }
        prodData.basFeeInfo = ProductHelper.convProductBasfeeInfo(prodData.basFeeEngInfo);
   
          res.render('callplan/en.product.callplan.html', {svcInfo, pageInfo, prodData, contentsData});
        
    });
     }
}