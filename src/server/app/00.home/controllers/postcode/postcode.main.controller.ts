/**
 * FileName: postcode.main.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.30
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

class PostcodeMain extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('postcode/postcode.main.html', {});
  }
}

export default PostcodeMain;
