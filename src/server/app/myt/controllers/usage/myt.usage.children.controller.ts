import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MyTUsageChildren extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const response = {
      'code': '00',
      'msg': '',
      'result': {
        'child': [
          {
            'svcNum': '010-12**-34**',
            'svcMgmtNum': '123456789',
            'mdlName': '아이폰6S(블랙)'
          },
          {
            'svcNum': '010-12**-34**',
            'svcMgmtNum': '123456789',
            'mdlName': '갤럭시S7'
          },
          {
            'svcNum': '010-12**-34**',
            'svcMgmtNum': '123456789',
            'mdlName': '아이폰7'
          }
        ]
      }
    };

    res.render('usage/myt.usage.children.html', { result: response.result, svcInfo: svcInfo });
  }
}

export default MyTUsageChildren;
