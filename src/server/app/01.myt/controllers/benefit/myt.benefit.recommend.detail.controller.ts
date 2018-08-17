/**
 * FileName: myt.joinService.contractTerminalInfo.controller
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.08.16
 * info :
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MytBenefitRecommendDetailController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
  }
}

export default MytBenefitRecommendDetailController;
