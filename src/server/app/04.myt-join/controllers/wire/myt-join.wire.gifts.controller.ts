/**
 * MenuName: 나의 가입정보 > 서브메인 > 인터넷/집전화/IPTV 사은품 조회(MS_04_01_04)
 * FileName: myt-join.wire.gifts.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 * Summary: 사은품 조회
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { MYT_JOIN_WIRE } from '../../../../types/string.type';


class MyTJoinWireGifts extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // if ( svcInfo.svcAttrCd.indexOf('S') === -1 ) {
    //   return this.error.render(res, {
    //     title: MYT_JOIN_WIRE.GIFTS.TITLE,
    //     svcInfo: svcInfo
    //   });
    // }

    this.apiService.request(API_CMD.BFF_05_0159, { requestPage: '1' })
      .subscribe((resp) => {
        // giftOpStCd 처리 상태코드
        // 처리상태 (01 배송 접수, 02 배송 요청, 03 배송완료, 04 반품 접수, 05 반품 요청, 06 반품 완료 07 재배송 접수, 08 재배송완료, 10 배송접수취소, 11 반품접수취소, 12 재배송접수취소, 30 사은품 거절)
        /*resp = {
            'code': '00',
            'msg': 'success',
            'result': {
              'hasSKTWire': 'Y',    // SK브로드밴드 가입여부(N:미가입)
              'resultValue': 'Y',   // 사은품여부(N:미존재)
              'totalCnt': '0',      // 총건수
              'restCnt': '0',       // 남은건수
              'deliveryCnt': '1',   // 배송건수
              'returnCnt': '0',     // 반송건수
              'redeliveryCnt': '0', // 재배송건수
              'giftProvideList': [
                {
                  'giftNm': 'SK상품권 1만원',
                  'giftOpStCd': '01',
                  'giftOpStNm': '배송 접수',
                  'dlvCompDt': '20130404',
                  'dlvUrl': 'http://www.zenexpress.co.kr/delivery/kpsen.zen?fm=931130401305380',
                  'pdlvBasAddr': '인천 동***********'
                },
                {
                  'giftNm': 'SK상품권 2만원',
                  'giftOpStCd': '02',
                  'giftOpStNm': '배송 요청',
                  'dlvCompDt': '20130404',
                  'dlvUrl': 'http://www.zenexpress.co.kr/delivery/kpsen.zen?fm=931130401305380',
                  'pdlvBasAddr': '인천 동***********'
                },
                {
                  'giftNm': 'SK상품권 3만원',
                  'giftOpStCd': '03',
                  'giftOpStNm': '배송완료',
                  'dlvCompDt': '20130404',
                  'dlvUrl': 'http://www.zenexpress.co.kr/delivery/kpsen.zen?fm=931130401305380',
                  'pdlvBasAddr': '인천 동***********'
                },
                {
                  'giftNm': 'SK상품권 4만원',
                  'giftOpStCd': '04',
                  'giftOpStNm': '반품 접수',
                  'dlvCompDt': '20130404',
                  'dlvUrl': 'http://www.zenexpress.co.kr/delivery/kpsen.zen?fm=931130401305380',
                  'pdlvBasAddr': '인천 동***********'
                },
                {
                  'giftNm': 'SK상품권 5만원',
                  'giftOpStCd': '05',
                  'giftOpStNm': '반품 요청',
                  'dlvCompDt': '20130404',
                  'dlvUrl': 'http://www.zenexpress.co.kr/delivery/kpsen.zen?fm=931130401305380',
                  'pdlvBasAddr': '인천 동***********'
                },
                {
                  'giftNm': 'SK상품권 6만원',
                  'giftOpStCd': '06',
                  'giftOpStNm': '반품 완료',
                  'dlvCompDt': '20130404',
                  'dlvUrl': 'http://www.zenexpress.co.kr/delivery/kpsen.zen?fm=931130401305380',
                  'pdlvBasAddr': '인천 동***********'
                },
                {
                  'giftNm': 'SK상품권 7만원',
                  'giftOpStCd': '07',
                  'giftOpStNm': '재배송 접수',
                  'dlvCompDt': '20130404',
                  'dlvUrl': 'http://www.zenexpress.co.kr/delivery/kpsen.zen?fm=931130401305380',
                  'pdlvBasAddr': '인천 동***********'
                }
              ]
            }
          };*/

        if ( resp.code === API_CODE.CODE_00 ) {
          const option = { svcInfo: svcInfo, pageInfo: pageInfo, data: resp.result};
          res.render('wire/myt-join.wire.gifts.html', option);
        } else {
          return this.error.render(res, {
            title: MYT_JOIN_WIRE.GIFTS.TITLE,
            code: resp.code,
            msg: resp.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
      }, (resp) => {
        return this.error.render(res, {
          title: MYT_JOIN_WIRE.GIFTS.TITLE,
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      });
  }
}

export default MyTJoinWireGifts;

