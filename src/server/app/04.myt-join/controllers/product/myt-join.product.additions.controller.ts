/**
 * FileName: myt-join.product.additions.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.19
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';

class MyTJoinProductAdditions extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    //
  }
}

export default MyTJoinProductAdditions;
