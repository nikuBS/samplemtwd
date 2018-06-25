import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';

class MyTUsageChildren extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const sample_data = {
      'code': '00',
      'msg': '',
      'result': [
        {
          'svcNum': '010-12**-34**',
          'svcMgmtNum': '123456789',
          'mdlName': '아이폰6S(블랙)'
        },
        {
          'svcNum': '010-23**-45**',
          'svcMgmtNum': '23456789',
          'mdlName': '갤럭시S7'
        },
        {
          'svcNum': '010-71**-42**',
          'svcMgmtNum': '71203842',
          'mdlName': '아이폰7'
        }
      ]
    };

    this.apiService.request(API_CMD.BFF_05_0010, {})
      .subscribe((response) => {
        res.render('usage/myt.usage.children.html', { result: sample_data.result, svcInfo: svcInfo });
      });
  }
}

export default MyTUsageChildren;
