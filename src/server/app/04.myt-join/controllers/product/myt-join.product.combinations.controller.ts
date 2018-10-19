/**
 * FileName: myt-join.product.combinations.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.09.19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class MyTJoinProductCombinations extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    res.render('product/myt-join.product.combinations.html', { svcInfo });
  }
}

export default MyTJoinProductCombinations;
