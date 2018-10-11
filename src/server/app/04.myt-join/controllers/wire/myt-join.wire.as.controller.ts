/**
 * FileName: myt-join.wire.as.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';


class MyTJoinWireAS extends TwViewController {


  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    console.log('============ call BFF_05_0156 ==============');
    this.apiService.request(API_CMD.BFF_05_0156, { page: '1', size: '20' })
      .subscribe((resp) => {

        // TODO 삭제
        const resp1 = {
          'code': '00',
          'msg': 'success',
          'result': {
            'totalCnt': '8',
            'history': [
              {
                'troubleDt': '20181201',
                'troubleNum': '20181201',
                'svcNm': '인터넷(스마트광랜Test) 1',
                'troubleDetail': '스마트 광랜 접속 오류1'
              },
              {
                'troubleDt': '20181101',
                'troubleNum': '20181101',
                'svcNm': '인터넷(스마트광랜Test) 2',
                'troubleDetail': '스마트 광랜 접속 오류2'
              },
              {
                'troubleDt': '20181001',
                'troubleNum': '20181001',
                'svcNm': '인터넷(스마트광랜Test) 3',
                'troubleDetail': '스마트 광랜 접속 오류3'
              },
              {
                'troubleDt': '20180901',
                'troubleNum': '20180901',
                'svcNm': '인터넷(스마트광랜Test) 4',
                'troubleDetail': '스마트 광랜 접속 오류4'
              },
              {
                'troubleDt': '20180801',
                'troubleNum': '20180801',
                'svcNm': '인터넷(스마트광랜Test) 5',
                'troubleDetail': '스마트 광랜 접속 오류5'
              }


            ]
          }
        };
        const result = resp1.result;

        if ( resp1.code === API_CODE.CODE_00 ) {
          console.log('============ result ==============');
          const option = { svcInfo: svcInfo, data: result};

          res.render('wire/myt-join.wire.as.html', option);
        }
      });
  }
}

export default MyTJoinWireAS;

