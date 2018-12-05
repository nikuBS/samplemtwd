/**
 * FileName: product.roaming.lookup.controller.ts
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';

class ProductRoamingLookup extends TwViewController {
  render(req: Request, res: Response, svcInfo: any) {
    res.render( 'roaming/product.roaming.lookup.html', {
      svcInfo : svcInfo,
      prodBffInfo :
          {
              "svcStartDt" : "20181110"
              ,"svcEndDt" : "20181125"
              ,"svcStartTm" : "12"
              ,"svcEndTm" : "12"
              ,"startEndTerm" : "15"
              ,"prodNm" : "T로밍 요금제"
              ,"prodFee" : "5000"
              ,"romSetClCd" : "DTDN"
              ,"isAdult" : "true"
              ,"chkCurProdStat" : "false"
              ,"settingYn" : true
          }
    });
  }
}

export default ProductRoamingLookup;

