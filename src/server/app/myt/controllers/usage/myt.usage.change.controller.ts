import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MyTUsageChange extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const response = {
      code: '결과코드',
      msg: '결과메세지',
      result: {
        M: [ // 모바일
          {
            svcCd: 'C',
            svcNum: '010-12**-56**',
            svcMgmtNum: '7100000001',
            svcNickName: '제임스폰',
            repSvcYn: 'N',
          },
          {
            svcMgmtNum: '7274875661',
            svcNum: '010-40**-08**',
            svcNickName: '회사폰',
            svcCd: 'C',
            repSvcYn: 'Y'
          },
          {
            svcMgmtNum: '7274875661',
            svcNum: '010-40**-08**',
            svcNickName: '회사폰',
            svcCd: 'C',
            repSvcYn: 'Y'
          },
          {
            svcMgmtNum: '7274875661',
            svcNum: '010-40**-08**',
            svcNickName: '회사폰',
            svcCd: 'C',
            repSvcYn: 'Y'
          }
        ],
        W: [ // 인터넷/집전화/IPTV
          {
            svcCd: 'I',
            svcNum: '010-12**-56**',
            svcMgmtNum: '7100000001',
            svcNickName: '제임스인터넷',
            repSvcYn: 'Y',
          }
        ],
        S: [ // 보안솔루션
          {
            svcCd: 'O',
            svcNum: '010-12**-56**',
            svcMgmtNum: '7100000001',
            svcNickName: '제임스보안솔루션',
            repSvcYn: 'Y',
          }
        ]
      }
    };

    res.render('usage/myt.usage.change.html', { result: response.result, svcInfo: svcInfo });
  }
}

export default MyTUsageChange;
