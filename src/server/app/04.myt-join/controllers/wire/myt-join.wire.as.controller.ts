/**
 * MenuName: 나의 가입정보 > 서브메인 > 인터넷/집전화/IPTV 신청내역 > 장애/AS 신청현황(MS_04_01_03)
 * @file myt-join.wire.as.controller.ts
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.08
 * Summary: 인터넷/집전화/IPTV 장애/AS 신청내역 목록 조회
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { MYT_JOIN_WIRE, MYT_JOIN_WIRE_GUIDE_CHANGE_OWNERSHIP } from '../../../../types/string.type';


class MyTJoinWireAS extends TwViewController {


  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // if ( svcInfo.svcAttrCd.indexOf('S') === -1 ) {
    //   return this.error.render(res, {
    //     title: MYT_JOIN_WIRE.AS.TITLE,
    //     svcInfo: svcInfo
    //   });
    // }

    this.apiService.request(API_CMD.BFF_05_0156, { page: '1', size: '20' })
      .subscribe((resp) => {

    /*const resp = {
      'code': '00',
      'msg': 'success',
      'result': {
        'totalCnt': '0',
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
          const option = { svcInfo: svcInfo, pageInfo: pageInfo, data: result};
          res.render('wire/myt-join.wire.as.html', option);
        } else {
          return this.error.render(res, {
            title: MYT_JOIN_WIRE.AS.TITLE,
            code: resp.code,
            msg: resp.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
      }, (resp) => {
        return this.error.render(res, {
          title: MYT_JOIN_WIRE.AS.TITLE,
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      });
  }
}

export default MyTJoinWireAS;

