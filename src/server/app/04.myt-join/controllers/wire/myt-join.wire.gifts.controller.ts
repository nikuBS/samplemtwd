/**
 * FileName: myt-join.wire.gifts.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { SVC_ATTR } from '../../../../types/bff.old.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';


class MyTJoinWireGifts extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    console.log('============ call BFF_05_0159 ==============');
    // requestPage
    this.apiService.request(API_CMD.BFF_05_0159, { requestPage: '1' })
      .subscribe((resp) => {
        // giftOpStCd 처리 상태코드
        // 처리상태 (01 배송 접수, 02 배송 요청, 03 배송완료, 04 반품 접수, 05 반품 요청, 06 반품 완료 07 재배송 접수, 08 재배송완료, 10 배송접수취소, 11 반품접수취소, 12 재배송접수취소, 30 사은품 거절)
        const resp1 = {
            'code': '00',
            'msg': 'success',
            'result': {
              'hasSKTWire': 'Y',    // SK브로드밴드 가입여부(N:미가입)
              'resultValue': 'Y',   // 사은품여부(N:미존재)
              'nextPage': '2',
              'totalCnt': '1',
              'giftProvideList': [
                {
                  'giftNm': 'SK상품권 13만원',
                  'giftOpStCd': '03',
                  'giftOpStNm': '배송완료',
                  'dlvCompDt': '20130404',
                  'dlvUrl': 'http://www.zenexpress.co.kr/delivery/kpsen.zen?fm=931130401305380',
                  'pdlvBasAddr': '인천 동***********'
                }
              ]
            }
          };

        if ( resp1.code === API_CODE.CODE_00 ) {
          console.log('============ result ==============');
          const option = { svcInfo: svcInfo, data: resp1.result};

          res.render('wire/myt-join.wire.gifts.html', option);
        }
      });
  }
}

export default MyTJoinWireGifts;

