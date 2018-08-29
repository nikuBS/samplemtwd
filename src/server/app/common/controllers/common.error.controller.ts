import TwViewController from '../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';

class CommonError extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const code = req.query.code || '',
      msg = req.query.msg || '';

    this.error.render(res, {
      code: code,
      msg: msg,
      svcInfo: svcInfo
    });
  }
}

export default CommonError;
