/**
 * FileName: auth.login.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.02
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../types/api-command.type';

class AuthTidLogin extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.GUIDE, { client_id: 'c58d51a8-1184-4d95-9837-a03a883efe7b', Service_type: '16' })
      .subscribe((resp) => {
        // res.send(resp);
      });

    res.redirect('https://auth-stg.skt-id.co.kr/auth/type/view/guide.do');
  }
}

export default AuthTidLogin;
