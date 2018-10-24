/**
 * FileName: myt-join.wire.as.controller.ts
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

    this.apiService.request(API_CMD.BFF_05_0156, { page: '1', size: '20' })
      .subscribe((resp) => {
/*
        resp = {
          'code': '00',
          'msg': 'success',
          'result': {
            'totalCnt': '8',
            'history': [
              {
                'troubleDt': '20181201',
                'troubleNum': '20181201',
                'stNm': '신청중',
                'svcNm': '인터넷(스마트광랜Test) 1',
                'troubleDetail': '스마트 광랜 접속 오류1'
              },
              {
                'troubleDt': '20181101',
                'troubleNum': '20181101',
                'stNm': '장애접수',
                'svcNm': '인터넷(스마트광랜Test) 2',
                'troubleDetail': '스마트 광랜 접속 오류2'
              },
              {
                'troubleDt': '20181001',
                'troubleNum': '20181001',
                'stNm': '장애복구완료',
                'svcNm': '인터넷(스마트광랜Test) 3',
                'troubleDetail': '스마트 광랜 접속 오류3'
              },
              {
                'troubleDt': '20180901',
                'troubleNum': '20180901',
                'stNm': '장애복구완료',
                'svcNm': '인터넷(스마트광랜Test) 4',
                'troubleDetail': '스마트 광랜 접속 오류4'
              },
              {
                'troubleDt': '20180801',
                'troubleNum': '20180801',
                'stNm': '장애복구완료',
                'svcNm': '인터넷(스마트광랜Test) 5',
                'troubleDetail': '스마트 광랜 접속 오류5'
              }


            ]
          }
        };*/
        const result = resp.result;

        if ( resp.code === API_CODE.CODE_00 ) {

          const option = { svcInfo: svcInfo, data: result};

          res.render('wire/myt-join.wire.as.html', option);
        }
      });
  }
}

export default MyTJoinWireAS;

