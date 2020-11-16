import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

import FormatHelper from '../../../../utils/format.helper';
import ProductHelper from '../../../../utils/product.helper';

export default class CallPlan extends TwViewController {
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
      const changing = this.getProductCode();
        const prodNm = prodData.prodEngNm;
        if ( jsonResult.code === API_CODE.CODE_00 ) {
          // console.log('^^^^^^^^^^^^^');
          // console.log(jsonResult['result']['summary']);
          // console.log('^^^^^^^^^^^^^');
      } else {
        if (FormatHelper.isEmpty(result.result)) {
          return result.result;
        } else if (FormatHelper.isEmpty(contentsResult.result)) {
          return contentsResult.result;
        }
      }
            if (prodData.smryHtmlEngCtt === '<p>&nbsp;</p>') {
              prodData.smryHtmlEngCtt = '';
            }
            
        for ( const t in contentsData ){
          console.log("@@@@@@@@@@@" + t , contentsData[t]);
        }
          
        if ( contentsData != null ) {
          for (let i = 0; i < contentsData.length; i++) {
            contentsData[i].popupDtlCtt = contentsData[i].popupDtlCtt.replace(changed, changing.changingCDN);
            contentsData[i].dtlCtt = contentsData[i].dtlCtt.replace(changed, changing.changingCDN);
            if (contentsData[i].dtlCtt === '<p>&nbsp;</p>') {
              contentsData[i].dtlCtt = '';
            }
          }
        }
        prodData.basFeeInfo = ProductHelper.convProductBasfeeInfo(prodData.basFeeEngInfo);

        res.render('callplan/en.product.callplan.html', {svcInfo, pageInfo, prodData, contentsData, changing});
        
    });
     }

    private getProductCode() {
      const env = String(process.env.NODE_ENV);
      if ( env === 'prd' ) { // 운영
        return {'changingCDN' : 'https://cdnm.tworld.co.kr'};
      } else if ( env === 'stg' ) { // 스테이징
        return {'changingCDN' : 'https://cdnm-stg.tworld.co.kr'};
      } else { // local, dev
        return {'changingCDN' : 'https://cdnm-dev.tworld.co.kr'}; // 원래는 cdnm-dev지만 테스트 위해 변경
      }
    }
}
