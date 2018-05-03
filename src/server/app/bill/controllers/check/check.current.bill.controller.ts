import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CheckCurrentBillController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction) {

  }
}

export default CheckCurrentBillController;